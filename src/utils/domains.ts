export interface DomainPreset {
  id: string;
  name: string;
  domain: string;
  badge: string;
  isLive?: boolean;
}

export const DOMAIN_PRESETS: DomainPreset[] = [
  {
    id: "shortly-local",
    name: "shortly.localhost",
    domain: "shortly.localhost",
    badge: "Live 'Shortly' Domain (Resolves locally without DNS errors)",
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
    id: "live-app",
    name: "localhost:3000",
    domain: "auto",
    badge: "Direct Localhost",
    isLive: true,
  },
  {
    id: "micro-short",
    name: "sht.li",
    domain: "sht.li",
    badge: "Micro Mockup",
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
  domainSetting: string = "shortly.localhost",
  liveBaseUrl?: string
): string {
  const cleanCode = (shortCode || "").trim().replace(/^\/+/, "");

  if (domainSetting === "shortly.localhost") {
    let portPart = ":3000";
    if (typeof window !== "undefined") {
      portPart = window.location.port ? `:${window.location.port}` : "";
    }
    return `http://shortly.localhost${portPart}/${cleanCode}`;
  }

  if (domainSetting === "auto" || domainSetting === "live") {
    if (liveBaseUrl) {
      try {
        const parsed = new URL(liveBaseUrl);
        return `${parsed.origin}/${cleanCode}`;
      } catch {
        const host = liveBaseUrl.replace(/^https?:\/\//, "").split("/")[0];
        return `http://${host}/${cleanCode}`;
      }
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${cleanCode}`;
    }
    return `http://localhost:3000/${cleanCode}`;
  }

  const cleanDomain = domainSetting.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${cleanDomain}/${cleanCode}`;
}

export function getShortDomainLabel(domainSetting: string): string {
  if (domainSetting === "shortly.localhost") {
    let portPart = ":3000";
    if (typeof window !== "undefined") {
      portPart = window.location.port ? `:${window.location.port}` : "";
    }
    return `shortly.localhost${portPart}`;
  }
  if (domainSetting === "auto" || domainSetting === "live") {
    if (typeof window !== "undefined") {
      return window.location.host;
    }
    return "localhost:3000";
  }
  return domainSetting.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}
