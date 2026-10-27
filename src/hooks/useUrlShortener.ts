import { useState, useEffect, useCallback } from "react";
import { ShortenedUrl, RecentLinkItem } from "../types.js";
import { shortenUrlApi, getUrlDetailsApi } from "../services/api.js";
import { validateUrl, validateCustomAliasClient } from "../utils/validation.js";
import {
  getRecentLinksFromStorage,
  saveRecentLinkToStorage,
  removeRecentLinkFromStorage,
  clearRecentLinksFromStorage,
} from "../utils/storage.js";

export function useUrlShortener() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortenedUrl | null>(null);
  const [recentLinks, setRecentLinks] = useState<RecentLinkItem[]>([]);

  // Load recent links from localStorage on mount
  useEffect(() => {
    const loaded = getRecentLinksFromStorage();
    setRecentLinks(loaded);
  }, []);

  // Action to shorten URL
  const handleShorten = useCallback(
    async (urlToShorten?: string, aliasToUse?: string) => {
      const targetUrl = (urlToShorten !== undefined ? urlToShorten : originalUrl).trim();
      const targetAlias = (aliasToUse !== undefined ? aliasToUse : customAlias).trim();

      setError(null);

      // Client-side validations
      const urlCheck = validateUrl(targetUrl);
      if (!urlCheck.valid || !urlCheck.normalizedUrl) {
        setError(urlCheck.error || "Please enter a valid URL.");
        return null;
      }

      const finalUrl = urlCheck.normalizedUrl;
      setOriginalUrl(finalUrl);

      if (targetAlias) {
        const aliasCheck = validateCustomAliasClient(targetAlias);
        if (!aliasCheck.valid) {
          setError(aliasCheck.error || "Invalid custom alias.");
          return null;
        }
      }

      setIsLoading(true);

      try {
        const response = await shortenUrlApi({
          originalUrl: finalUrl,
          customAlias: targetAlias || undefined,
        });

        const newShortened: ShortenedUrl = {
          id: Date.now(),
          shortCode: response.shortCode,
          shortUrl: response.shortUrl,
          originalUrl: response.originalUrl,
          createdAt: response.createdAt || new Date().toISOString(),
          clickCount: response.clickCount || 0,
          customAlias: response.customAlias,
        };

        setResult(newShortened);

        // Update local history in storage & state
        const updatedRecent = saveRecentLinkToStorage(newShortened);
        setRecentLinks(updatedRecent);

        return newShortened;
      } catch (err: any) {
        const msg = err.message || "Failed to shorten URL. Please try again.";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [originalUrl, customAlias]
  );

  // Clear current result/form
  const resetForm = useCallback(() => {
    setOriginalUrl("");
    setCustomAlias("");
    setError(null);
    setResult(null);
  }, []);

  // Remove a recent link
  const deleteRecentLink = useCallback((shortCode: string) => {
    const updated = removeRecentLinkFromStorage(shortCode);
    setRecentLinks(updated);
  }, []);

  // Clear all recent links
  const clearRecent = useCallback(() => {
    clearRecentLinksFromStorage();
    setRecentLinks([]);
  }, []);

  // Refresh recent link click metrics from backend
  const refreshStats = useCallback(async () => {
    if (recentLinks.length === 0) return;
    try {
      const updatedList = await Promise.all(
        recentLinks.map(async (item) => {
          try {
            const details = await getUrlDetailsApi(item.shortCode);
            if (details.data) {
              return {
                ...item,
                clickCount: details.data.clickCount,
              };
            }
          } catch {
            // retain existing item if fetch fails
          }
          return item;
        })
      );
      setRecentLinks(updatedList);
    } catch {
      // ignore background refresh error
    }
  }, [recentLinks]);

  return {
    originalUrl,
    setOriginalUrl,
    customAlias,
    setCustomAlias,
    isLoading,
    error,
    setError,
    result,
    setResult,
    recentLinks,
    handleShorten,
    resetForm,
    deleteRecentLink,
    clearRecent,
    refreshStats,
  };
}
