import { ShortenUrlRequest, ShortenUrlResponse, UrlDetailsResponse } from "../types.js";

/**
 * Creates a short URL by calling POST /api/urls
 */
export async function shortenUrlApi(payload: ShortenUrlRequest): Promise<ShortenUrlResponse> {
  const response = await fetch("/api/urls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: "Failed to parse server response.",
  }));

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(data.error || "Too many requests. Please try again later.");
    }
    throw new Error(data.error || `Server responded with error (${response.status})`);
  }

  return data as ShortenUrlResponse;
}

/**
 * Fetches details and click metrics for a given short code
 */
export async function getUrlDetailsApi(shortCode: string): Promise<UrlDetailsResponse> {
  const response = await fetch(`/api/urls/${encodeURIComponent(shortCode)}`, {
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: "Failed to parse server response.",
  }));

  if (!response.ok) {
    throw new Error(data.error || "Short URL not found.");
  }

  return data as UrlDetailsResponse;
}

/**
 * Checks backend API health
 */
export async function getHealthApi(): Promise<{ status: string }> {
  const response = await fetch("/api/health");
  return response.json();
}
