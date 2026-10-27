export interface DomainPreset {
  id: string;
  name: string;
  domain: string;
  badge: string;
  isLive?: boolean;
}

/**
 * Returns dynamic domain presets based on current environment (Vercel vs Local)
 */
export function getDomainPresets(): DomainPreset[] {
  const isBrowser = typeof window !== "undefined";
  const isLocal = isBrowser && window.location.hostname.includes("localhost");
  const currentHost = isBrowser ? window.location.host : "localhost:3000";

  // Production / Vercel Environment (e.g. shortly-xyz.vercel.app or custom domain)
  if (isBrowser && !isLocal) {
    return [
      {
        id: "live-host",
        name: currentHost,
        domain: "auto",
        badge: "Live Public Domain (Works worldwide on all devices)",
        isLive: true,
      },
      {
        id: "shortly-short",
        name: "short.ly",
        domain: "short.ly",
        badge: "Branded Mockup (Requires custom domain & DNS)",
        isLive: false,
      },
      {
        id: "shortly-link",
        name: "shortly.link",
        domain: "shortly.link",
        badge: "Branded Mockup",
        isLive: false,
      },
      {
        id: "micro-short",
        name: "sht.li",
        domain: "sht.li",
        badge: "Micro Mockup",
        isLive: false,
      },
    ];
  }

  // Local Development Environment (MacBook / PC)
  return [
    {
      id: "shortly-local",
      name: "shortly.localhost:3000",
      domain: "shortly.localhost",
      badge: "Live 'Shortly' Local Domain",
      isLive: true,
    },
    {
      id: "live-app",
      name: "localhost:3000",
      domain: "auto",
      badge: "Direct Localhost",
      isLive: true,
    },
    {
      id: "shortly-short",
      name: "short.ly",
      domain: "short.ly",
      badge: "Branded Mockup (Requires public domain & DNS)",
      isLive: false,
    },
    {
      id: "branded-link",
      name: "shortly.link",
      domain: "shortly.link",
      badge: "Branded Mockup",
      isLive: false,
    },
  ];
}

export const DOMAIN_PRESETS: DomainPreset[] = getDomainPresets();

/**
 * Determines default domain based on environment.
 * On Vercel / production -> "auto" (the real public domain).
 * On local dev -> "shortly.localhost".
 */
export function getDefaultDomain(): string {
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
    return "auto";
  }
  return "shortly.localhost";
}

/**
 * Checks if a domain is a live local/deployed host that resolves in this browser
 */
export function isLiveDomain(domainSetting: string): boolean {
  return (
    domainSetting === "auto" ||
    domainSetting === "live" ||
    domainSetting === "shortly.localhost"
  );
}

/**
 * Formats a clean short URL for display and copying.
 * Guaranteed to NEVER duplicate the shortCode (e.g. never produces /coke/coke).
 */
export function formatShortUrl(
  shortCode: string,
  domainSetting: string = "auto",
  liveBaseUrl?: string
): string {
  const cleanCode = (shortCode || "").trim().replace(/^\/+/, "");

  // 1. Live Public Host (Production / Vercel / Live Local)
  if (domainSetting === "auto" || domainSetting === "live") {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${cleanCode}`;
    }
    if (liveBaseUrl) {
      try {
        const parsed = new URL(liveBaseUrl);
        return `${parsed.origin}/${cleanCode}`;
      } catch {
        const host = liveBaseUrl.replace(/^https?:\/\//, "").split("/")[0];
        return `https://${host}/${cleanCode}`;
      }
    }
    return `http://localhost:3000/${cleanCode}`;
  }

  // 2. Shortly Localhost (Local dev only)
  if (domainSetting === "shortly.localhost") {
    const port = typeof window !== "undefined" && window.location.port ? window.location.port : "3000";
    return `http://shortly.localhost:${port}/${cleanCode}`;
  }

  // 3. Custom / Mock Domain
  const cleanDomain = domainSetting.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${cleanDomain}/${cleanCode}`;
}

export function getShortDomainLabel(domainSetting: string): string {
  if (domainSetting === "auto" || domainSetting === "live") {
    if (typeof window !== "undefined") {
      return window.location.host;
    }
    return "shortly.link";
  }
  if (domainSetting === "shortly.localhost") {
    const port = typeof window !== "undefined" && window.location.port ? window.location.port : "3000";
    return `shortly.localhost:${port}`;
  }
  return domainSetting.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}
