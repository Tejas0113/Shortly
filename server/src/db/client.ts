import path from "path";
import { PrismaClient } from "@prisma/client";

// Ensure DATABASE_URL is always defined even if named STORAGE_URL or POSTGRES_URL in Vercel
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.STORAGE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "file:./dev.db";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

// Global singleton instance for Prisma Client in development to prevent too many connections
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Ensures the SQLite database schema and tables exist automatically on startup
 */
export async function initDatabase(): Promise<void> {
  // If running against PostgreSQL / cloud DB, schema is managed via prisma db push
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return;
  }
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Url" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "shortCode" TEXT NOT NULL,
        "originalUrl" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "clickCount" INTEGER NOT NULL DEFAULT 0,
        "customAlias" BOOLEAN NOT NULL DEFAULT 0
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Url_shortCode_key" ON "Url"("shortCode");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Url_shortCode_idx" ON "Url"("shortCode");
    `);
  } catch (err) {
    console.warn("[Database] Schema init check notice:", err);
  }
}

// Automatically trigger initialization check
initDatabase().catch((err) => {
  console.warn("[Database] Failed to auto-initialize SQLite schema:", err);
});

export default prisma;

