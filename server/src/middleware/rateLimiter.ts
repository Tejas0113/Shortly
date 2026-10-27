import type { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipMap.entries()) {
    if (now > record.resetTime) {
      ipMap.delete(ip);
    }
  }
}, 60000);

export function rateLimiter(
  windowMs = Number(process.env.RATE_LIMIT_WINDOW) || 60000,
  maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // In test environment, allow disabling or bypassing rate limit if needed
    if (process.env.NODE_ENV === "test" && !process.env.TEST_RATE_LIMIT) {
      next();
      return;
    }

    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    const now = Date.now();
    const existing = ipMap.get(clientIp);

    if (!existing || now > existing.resetTime) {
      ipMap.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
      next();
      return;
    }

    if (existing.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((existing.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later.",
      });
      return;
    }

    existing.count += 1;
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - existing.count);
    next();
  };
}

export function resetRateLimits() {
  ipMap.clear();
}
