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
  "app",
  "dist",
  "src",
  "node_modules",
  "@vite",
  "@fs",
]);

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
 * Validates whether the given string is a valid HTTP or HTTPS URL.
 * Automatically normalizes domains like "google.com" to "https://google.com".
 */
export function isValidUrl(urlString?: string | null): { valid: boolean; error?: string; normalizedUrl?: string } {
  if (!urlString || typeof urlString !== "string") {
    return { valid: false, error: "Please enter a URL." };
  }

  const rawTrimmed = urlString.trim();
  if (rawTrimmed.length === 0) {
    return { valid: false, error: "URL cannot be empty." };
  }

  if (rawTrimmed.length > 2048) {
    return { valid: false, error: "URL is too long (maximum 2048 characters)." };
  }

  const normalized = normalizeUrl(rawTrimmed);

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Only http:// and https:// URLs are supported." };
    }

    if (!parsed.hostname || parsed.hostname.length < 2) {
      return { valid: false, error: "Please enter a valid URL with a valid domain name." };
    }

    // Require hostname to contain at least one dot or be localhost / valid IP
    const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (!isLocalhost && !parsed.hostname.includes(".")) {
      return { valid: false, error: "Please enter a valid URL with a domain (e.g., example.com)." };
    }

    return { valid: true, normalizedUrl: normalized };
  } catch {
    return { valid: false, error: "Please enter a valid URL (e.g., https://example.com)." };
  }
}

/**
 * Validates a custom alias according to rules:
 * - 3–20 characters long
 * - Allowed chars: a-z, A-Z, 0-9, hyphen (-), underscore (_)
 * - Not in reserved words list
 */
export function validateCustomAlias(alias?: string | null): { valid: boolean; error?: string; formattedAlias?: string } {
  if (!alias || typeof alias !== "string") {
    return { valid: true, formattedAlias: undefined };
  }

  const trimmed = alias.trim();
  if (trimmed.length === 0) {
    return { valid: true, formattedAlias: undefined };
  }

  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, error: "Custom alias must be between 3 and 20 characters." };
  }

  const aliasRegex = /^[a-zA-Z0-9_-]+$/;
  if (!aliasRegex.test(trimmed)) {
    return {
      valid: false,
      error: "Custom alias can only contain letters, numbers, hyphens (-), and underscores (_).",
    };
  }

  if (RESERVED_ALIASES.has(trimmed.toLowerCase())) {
    return {
      valid: false,
      error: `The alias "${trimmed}" is a reserved system keyword. Please choose another.`,
    };
  }

  return { valid: true, formattedAlias: trimmed };
}
