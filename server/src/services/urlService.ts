import prisma from "../db/client.js";
import { generateRandomCode } from "../utils/generateShortCode.js";
import { isValidUrl, validateCustomAlias } from "../utils/validateUrl.js";

export interface CreateUrlInput {
  originalUrl: string;
  customAlias?: string;
  baseUrl: string;
}

export interface UrlResponse {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: Date;
  clickCount: number;
  customAlias: boolean;
}

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class UrlService {
  /**
   * Creates a new short URL (either automatic code or validated custom alias)
   */
  static async createShortUrl(input: CreateUrlInput): Promise<UrlResponse> {
    const { originalUrl, customAlias, baseUrl } = input;

    // 1. Validate original URL
    const urlValidation = isValidUrl(originalUrl);
    if (!urlValidation.valid || !urlValidation.normalizedUrl) {
      throw new AppError(urlValidation.error || "Please enter a valid URL.", 400);
    }
    const cleanOriginalUrl = urlValidation.normalizedUrl;

    let shortCodeToUse = "";
    let isCustom = false;

    // 2. Handle Custom Alias
    if (customAlias && customAlias.trim().length > 0) {
      const aliasValidation = validateCustomAlias(customAlias);
      if (!aliasValidation.valid || !aliasValidation.formattedAlias) {
        throw new AppError(
          aliasValidation.error || "Please enter a valid custom alias.",
          400
        );
      }

      const formatted = aliasValidation.formattedAlias;

      // Check if custom alias is already registered in DB
      const existing = await prisma.url.findUnique({
        where: { shortCode: formatted },
      });

      if (existing) {
        // If the existing alias already maps to this exact original URL, return it gracefully
        if (existing.originalUrl === cleanOriginalUrl) {
          const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
          return {
            id: existing.id,
            shortCode: existing.shortCode,
            shortUrl: `${cleanBaseUrl}/${existing.shortCode}`,
            originalUrl: existing.originalUrl,
            createdAt: existing.createdAt,
            clickCount: existing.clickCount,
            customAlias: existing.customAlias,
          };
        }
        throw new AppError("This custom alias is already taken.", 409);
      }

      shortCodeToUse = formatted;
      isCustom = true;
    } else {
      // 3. Automatic Short Code with Collision Handling
      let attempts = 0;
      let generatedCode = "";
      let codeExists = true;

      while (codeExists && attempts < 15) {
        attempts++;
        // Start with ultra-compact 4 chars, if after 5 attempts there are collisions, try 5 or 6 chars
        const codeLength = attempts > 8 ? 6 : attempts > 4 ? 5 : 4;
        generatedCode = generateRandomCode(codeLength);

        const check = await prisma.url.findUnique({
          where: { shortCode: generatedCode },
        });

        if (!check) {
          codeExists = false;
        }
      }

      if (codeExists) {
        throw new AppError(
          "Failed to generate a unique short code. Please try again.",
          500
        );
      }

      shortCodeToUse = generatedCode;
      isCustom = false;
    }

    // 4. Save to Database
    const saved = await prisma.url.create({
      data: {
        shortCode: shortCodeToUse,
        originalUrl: cleanOriginalUrl,
        customAlias: isCustom,
      },
    });

    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const shortUrl = `${cleanBaseUrl}/${saved.shortCode}`;

    return {
      id: saved.id,
      shortCode: saved.shortCode,
      shortUrl,
      originalUrl: saved.originalUrl,
      createdAt: saved.createdAt,
      clickCount: saved.clickCount,
      customAlias: saved.customAlias,
    };
  }

  /**
   * Look up a URL by short code
   */
  static async getUrlByShortCode(
    shortCode: string,
    baseUrl = ""
  ): Promise<UrlResponse | null> {
    if (!shortCode) return null;

    const record = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!record) return null;

    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const shortUrl = cleanBaseUrl ? `${cleanBaseUrl}/${record.shortCode}` : record.shortCode;

    return {
      id: record.id,
      shortCode: record.shortCode,
      shortUrl,
      originalUrl: record.originalUrl,
      createdAt: record.createdAt,
      clickCount: record.clickCount,
      customAlias: record.customAlias,
    };
  }

  /**
   * Increments clickCount and returns the original URL for redirection
   */
  static async recordClickAndGetOriginalUrl(
    shortCode: string
  ): Promise<string | null> {
    if (!shortCode) return null;

    const record = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!record) return null;

    // Asynchronously or synchronously increment click count
    await prisma.url.update({
      where: { id: record.id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });

    return record.originalUrl;
  }
}
