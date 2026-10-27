import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.status || err.statusCode || 500;
  const message =
    statusCode === 500
      ? "An unexpected internal server error occurred. Please try again."
      : err.message || "Something went wrong.";

  console.error(`[Error] ${statusCode} - ${err.message || err}`);
  if (err.stack && process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
