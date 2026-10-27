import express from "express";
import cors from "cors";
import urlRoutes from "./routes/urlRoutes.js";
import { UrlController } from "./controllers/urlController.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Security & parsing middlewares
  app.use(cors());
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // API Routes
  app.use("/api", urlRoutes);

  // Short URL Redirect Endpoint (GET /:shortCode and nested /:shortCode/:subCode?)
  app.get("/:shortCode/:subCode?", UrlController.handleRedirect);

  // Global Error Handler for API errors
  app.use(errorHandler);

  return app;
}

export default createApp;
