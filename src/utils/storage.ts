import { RecentLinkItem, Theme } from "../types.js";

const RECENT_LINKS_KEY = "shortly_recent_links_v1";
const THEME_KEY = "shortly_theme_preference";
const MAX_RECENT_LINKS = 10;

export function getRecentLinksFromStorage(): RecentLinkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_LINKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to load recent links from localStorage:", err);
    return [];
  }
}

export function saveRecentLinkToStorage(item: RecentLinkItem): RecentLinkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getRecentLinksFromStorage();
    // Filter out duplicates with same shortCode
    const filtered = existing.filter((l) => l.shortCode !== item.shortCode);
    const updated = [item, ...filtered].slice(0, MAX_RECENT_LINKS);
    localStorage.setItem(RECENT_LINKS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Failed to save recent link to localStorage:", err);
    return [];
  }
}

export function removeRecentLinkFromStorage(shortCode: string): RecentLinkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getRecentLinksFromStorage();
    const updated = existing.filter((l) => l.shortCode !== shortCode);
    localStorage.setItem(RECENT_LINKS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Failed to remove recent link from localStorage:", err);
    return [];
  }
}

export function clearRecentLinksFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_LINKS_KEY);
  } catch (err) {
    console.warn("Failed to clear recent links from localStorage:", err);
  }
}

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    // Fallback to system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch {
    // ignore
  }
  return "dark";
}

export function saveThemePreference(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.warn("Failed to save theme to localStorage:", err);
  }
}
