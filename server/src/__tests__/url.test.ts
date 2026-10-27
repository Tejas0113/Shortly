import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import prisma from "../db/client.js";
import { resetRateLimits } from "../middleware/rateLimiter.js";

const app = createApp();

describe("Shortly URL Shortener Backend API Tests", () => {
  beforeEach(async () => {
    // Clear test database and reset rate limits before tests
    await prisma.url.deleteMany();
    resetRateLimits();
  });

  it("1. Health check endpoint returns status: ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("2. Automatic short code creation works with valid URL", async () => {
    const res = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "https://example.com/long/path/to/article" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.shortCode).toBeDefined();
    expect(res.body.shortCode.length).toBeGreaterThanOrEqual(4);
    expect(res.body.originalUrl).toBe("https://example.com/long/path/to/article");
    expect(res.body.customAlias).toBe(false);
    expect(res.body.clickCount).toBe(0);
    expect(res.body.shortUrl).toContain(res.body.shortCode);
  });

  it("3. Reject invalid or malformed URLs with 400", async () => {
    const res = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "not-a-valid-url" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/valid url/i);

    const emptyRes = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "" });

    expect(emptyRes.status).toBe(400);
    expect(emptyRes.body.success).toBe(false);
  });

  it("4. Custom alias creation works as expected", async () => {
    const res = await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://www.linkedin.com/in/my-portfolio-profile",
        customAlias: "linkedin-tejas",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.shortCode).toBe("linkedin-tejas");
    expect(res.body.customAlias).toBe(true);
    expect(res.body.shortUrl).toContain("/linkedin-tejas");
  });

  it("5. Duplicate custom alias detection returns 409 Conflict", async () => {
    // First creation
    await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://linkedin.com/in/first-user",
        customAlias: "unique-link",
      });

    // Attempt second creation with same alias
    const duplicateRes = await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://different-site.com/second",
        customAlias: "unique-link",
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.error).toBe("This custom alias is already taken.");
  });

  it("6. Rejects reserved aliases and invalid character custom aliases", async () => {
    const reservedRes = await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://example.com",
        customAlias: "api",
      });
    expect(reservedRes.status).toBe(400);
    expect(reservedRes.body.error).toMatch(/reserved/i);

    const invalidCharRes = await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://example.com",
        customAlias: "bad alias!",
      });
    expect(invalidCharRes.status).toBe(400);
    expect(invalidCharRes.body.error).toMatch(/only contain letters/i);

    const tooShortRes = await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://example.com",
        customAlias: "ab",
      });
    expect(tooShortRes.status).toBe(400);
    expect(tooShortRes.body.error).toMatch(/between 3 and 20/i);
  });

  it("7. URL details lookup GET /api/urls/:shortCode works", async () => {
    const createRes = await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://github.com/my-awesome-project",
        customAlias: "my-github",
      });

    const getRes = await request(app).get("/api/urls/my-github");
    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.shortCode).toBe("my-github");
    expect(getRes.body.data.originalUrl).toBe("https://github.com/my-awesome-project");
    expect(getRes.body.data.clickCount).toBe(0);

    const notFoundRes = await request(app).get("/api/urls/non-existent-code");
    expect(notFoundRes.status).toBe(404);
    expect(notFoundRes.body.success).toBe(false);
  });

  it("8. Short link redirect GET /:shortCode performs HTTP 302 and increments clickCount", async () => {
    await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://news.ycombinator.com",
        customAlias: "hackernews",
      });

    // 1st redirect
    const redirectRes1 = await request(app).get("/hackernews");
    expect(redirectRes1.status).toBe(302);
    expect(redirectRes1.header.location).toBe("https://news.ycombinator.com");

    // 2nd redirect
    const redirectRes2 = await request(app).get("/hackernews");
    expect(redirectRes2.status).toBe(302);

    // Verify clickCount incremented to 2
    const checkRes = await request(app).get("/api/urls/hackernews");
    expect(checkRes.body.data.clickCount).toBe(2);
  });

  it("9. Non-existent short link redirect returns 404 for JSON client", async () => {
    const res = await request(app)
      .get("/unknown-404-link")
      .set("Accept", "application/json");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Short link not found");
  });

  it("10. Auto-normalizes URLs without protocol (e.g. google.com or www.google.com)", async () => {
    const res = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "google.com" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.originalUrl).toBe("https://google.com");
    expect(res.body.shortCode).toBeDefined();

    const wwwRes = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "www.github.com/torvalds/linux" });

    expect(wwwRes.status).toBe(201);
    expect(wwwRes.body.success).toBe(true);
    expect(wwwRes.body.originalUrl).toBe("https://www.github.com/torvalds/linux");
  });

  it("11. Idempotently returns existing short link when same custom alias is submitted for same URL", async () => {
    const first = await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://my-docs.com/guide",
        customAlias: "my-docs",
      });
    expect(first.status).toBe(201);
    expect(first.body.shortCode).toBe("my-docs");

    // Repeat with same alias and same URL (e.g. user retrying or clicking sample)
    const second = await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://my-docs.com/guide",
        customAlias: "my-docs",
      });
    expect(second.status).toBe(201);
    expect(second.body.success).toBe(true);
    expect(second.body.shortCode).toBe("my-docs");
    expect(second.body.originalUrl).toBe("https://my-docs.com/guide");
  });

  it("12. Resolves and redirects even if user visits duplicated or nested path (e.g. /coke/coke)", async () => {
    await request(app)
      .post("/api/urls")
      .send({
        originalUrl: "https://coca-cola-scroll-website.vercel.app",
        customAlias: "coke",
      });

    // Test normal redirect /coke
    const normalRes = await request(app).get("/coke");
    expect(normalRes.status).toBe(302);
    expect(normalRes.header.location).toBe("https://coca-cola-scroll-website.vercel.app");

    // Test duplicated redirect /coke/coke
    const dupRes = await request(app).get("/coke/coke");
    expect(dupRes.status).toBe(302);
    expect(dupRes.header.location).toBe("https://coca-cola-scroll-website.vercel.app");
  });
});


