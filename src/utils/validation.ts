export const RESERVED_ALIASES = new Set([
  "api",
  "admin",
  "login",
  "logout",
  "health",
  "about",
  "faq",
  "features",
  "home",
  "static",
  "assets",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "404",
  "index",
  "dashboard",
]);

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
}

/**
 * Normalizes input URL strings, automatically adding https:// when protocol is omitted.
 */
export function normalizeUrl(url: string): string {
  if (!url) return "";
  let trimmed = url.trim();

  // If user pasted with protocol-relative "//"
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // If missing http:// or https://, prepend https://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Validates a web URL format on client side with automatic protocol handling
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || !url.trim()) {
    return { valid: false, error: "Please enter a destination URL." };
  }

  const rawTrimmed = url.trim();
  if (rawTrimmed.length > 2048) {
    return { valid: false, error: "URL is too long (maximum 2048 characters)." };
  }

  const normalized = normalizeUrl(rawTrimmed);

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        valid: false,
        error: "URL must use http:// or https:// (e.g. https://example.com)",
      };
    }

    if (!parsed.hostname || parsed.hostname.length < 2) {
      return { valid: false, error: "Please enter a valid domain name." };
    }

    const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (!isLocalhost && !parsed.hostname.includes(".")) {
      return { valid: false, error: "Please enter a valid domain (e.g. example.com or github.com)" };
    }

    return { valid: true, normalizedUrl: normalized };
  } catch {
    return { valid: false, error: "Please enter a valid URL (e.g. https://example.com)" };
  }
}

/**
 * Validates a custom alias format
 */
export function validateCustomAliasClient(alias?: string): ValidationResult {
  if (!alias || !alias.trim()) {
    return { valid: true }; // Custom alias is optional
  }

  const trimmed = alias.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: "Custom alias must be at least 3 characters." };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: "Custom alias cannot exceed 20 characters." };
  }

  const aliasRegex = /^[a-zA-Z0-9_-]+$/;
  if (!aliasRegex.test(trimmed)) {
    return {
      valid: false,
      error: "Alias can only contain letters, numbers, hyphens (-), and underscores (_).",
    };
  }

  if (RESERVED_ALIASES.has(trimmed.toLowerCase())) {
    return {
      valid: false,
      error: `"${trimmed}" is a reserved system keyword. Please pick another alias.`,
    };
  }

  return { valid: true };
}
