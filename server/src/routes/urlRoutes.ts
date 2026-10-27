import { Router } from "express";
import { UrlController } from "../controllers/urlController.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Health check endpoint
router.get("/health", UrlController.healthCheck);

// URL Shortening endpoint with configurable rate limiting
router.post("/urls", rateLimiter(), UrlController.createUrl);

// URL lookup endpoint
router.get("/urls/:shortCode", UrlController.getUrlDetails);

export default router;
