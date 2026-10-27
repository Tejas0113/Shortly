import type { Request, Response, NextFunction } from "express";
import { UrlService, AppError } from "../services/urlService.js";
import { RESERVED_ALIASES } from "../utils/validateUrl.js";

/**
 * Derives the public base URL of the application
 */
export function getBaseUrl(req: Request): string {
  if (process.env.APP_URL && process.env.APP_URL.startsWith("http")) {
    return process.env.APP_URL.replace(/\/+$/, "");
  }
  if (process.env.BASE_URL && process.env.BASE_URL.startsWith("http")) {
    return process.env.BASE_URL.replace(/\/+$/, "");
  }
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
  return `${protocol}://${host}`;
}

export class UrlController {
  /**
   * POST /api/urls
   * Creates a new short URL
   */
  static async createUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { originalUrl, customAlias } = req.body || {};
      const baseUrl = getBaseUrl(req);

      const result = await UrlService.createShortUrl({
        originalUrl,
        customAlias,
        baseUrl,
      });

      res.status(201).json({
        success: true,
        shortCode: result.shortCode,
        shortUrl: result.shortUrl,
        originalUrl: result.originalUrl,
        createdAt: result.createdAt,
        clickCount: result.clickCount,
        customAlias: result.customAlias,
      });
    } catch (err: any) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({
          success: false,
          error: err.message,
        });
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/urls/:shortCode
   * Gets details for a short URL
   */
  static async getUrlDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shortCode } = req.params;
      const baseUrl = getBaseUrl(req);

      const result = await UrlService.getUrlByShortCode(shortCode, baseUrl);

      if (!result) {
        res.status(404).json({
          success: false,
          error: "Short URL not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/health
   * Health check endpoint
   */
  static healthCheck(_req: Request, res: Response): void {
    res.status(200).json({ status: "ok" });
  }

  /**
   * GET /:shortCode
   * Redirects to the original URL
   */
  static async handleRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { shortCode, subCode } = req.params;

    // Skip reserved endpoints or internal vite/asset paths
    if (!shortCode || RESERVED_ALIASES.has(shortCode.toLowerCase()) || shortCode.includes(".")) {
      return next();
    }

    try {
      // 1. Try resolving primary shortCode
      let originalUrl = await UrlService.recordClickAndGetOriginalUrl(shortCode);

      // 2. If subCode is present (e.g. user pasted /coke/coke or trailing path), check subCode as well
      if (!originalUrl && subCode && !RESERVED_ALIASES.has(subCode.toLowerCase()) && !subCode.includes(".")) {
        originalUrl = await UrlService.recordClickAndGetOriginalUrl(subCode);
      }

      if (originalUrl) {
        // Real HTTP 302 redirect to original destination
        res.redirect(302, originalUrl);
        return;
      }

      // If short code doesn't exist in DB:
      // If the client requested JSON / API, return 404 JSON
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        res.status(404).json({
          success: false,
          error: "Short link not found",
        });
        return;
      }

      // For browser requests, pass to next() so Vite/SPA renders the user-friendly 404 page
      next();
    } catch (err) {
      next(err);
    }
  }
}
