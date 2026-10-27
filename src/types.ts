export interface ShortenedUrl {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
  customAlias: boolean;
}

export interface ShortenUrlRequest {
  originalUrl: string;
  customAlias?: string;
}

export interface ShortenUrlResponse {
  success: boolean;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
  customAlias: boolean;
  error?: string;
}

export interface UrlDetailsResponse {
  success: boolean;
  data?: ShortenedUrl;
  error?: string;
}

export interface RecentLinkItem {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
  customAlias: boolean;
}

export type Theme = "light" | "dark";
