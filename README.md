# Shortly

> **Short links. Simple sharing.**
> 
> A modern, high-performance, full-stack URL shortening web application engineered with React 19, TypeScript, Express.js, and Prisma ORM.

---

## 🌟 Overview

**Shortly** is a production-grade URL shortening web service designed to transform long, cumbersome URLs into clean, memorable links in milliseconds. Built from the ground up without relying on third-party URL-shortening APIs, Shortly provides both automatic cryptographic short-code generation and custom branded aliases, paired with instant HTTP 302 redirects and atomic click tracking.

---

## ✨ Features

- **Blazing-Fast Redirections**: Sub-50ms HTTP 302 redirects via indexed database queries.
- **Custom Branded Aliases**: Choose personalized aliases (e.g. `/linkedin-tejas`, `/portfolio-2026`) for resumes, bios, and marketing.
- **Automatic Code Generation**: 6-character random alphanumeric codes with built-in collision prevention.
- **Atomic Click Tracking**: Automatic real-time logging of link hits on every redirect.
- **Zero-Friction Access**: No signup or authentication barrier; immediate shortening with browser-local history.
- **Dark & Light Mode**: Seamless theme toggling with preference persistence.
- **Defensive Security & Rate Limiting**: Server-side sliding-window rate limiting, input sanitization, and reserved word protection.
- **RESTful API**: Standardized JSON responses with comprehensive HTTP status codes (200, 201, 400, 404, 409, 429, 500).
- **Responsive Modern UI**: Minimalist, high-contrast design inspired by modern developer tooling (Vercel, Linear, Raycast).

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite 6** (Fast build tool & bundling)
- **Tailwind CSS v4** (Utility-first styling with dark mode)
- **Lucide React** (Consistent icon library)
- **HTML5 Clipboard & Web Share API**

### Backend
- **Node.js** + **Express.js**
- **TypeScript** (Strict type safety across the entire stack)
- **Prisma ORM** (Type-safe database access layer)
- **SQLite** (Zero-configuration local storage, ready for PostgreSQL migration)
- **Express Rate Limiting** & Centralized Error Middleware

### Testing & Tooling
- **Vitest** (Unit & Integration test runner)
- **Supertest** (HTTP API assertion library)
- **esbuild** (Server bundling for production)

---

## 📐 Architecture & System Flow

```text
┌────────────────┐        POST /api/urls        ┌─────────────────────┐
│  Client (SPA)  │ ───────────────────────────> │  Express Backend    │
│  React 19 + TS │                              │  Controller/Service │
└────────────────┘                              └──────────┬──────────┘
                                                           │
                                                           ▼
                                                ┌─────────────────────┐
                                                │  Prisma ORM         │
                                                │  (SQLite / Postgres)│
                                                └──────────┬──────────┘
                                                           │
┌────────────────┐        GET /:shortCode                  │
│  Web Visitor   │ ───────────────────────────> ┌──────────▼──────────┐
│  (Browser)     │ <─────────────────────────── │  HTTP 302 Redirect  │
└────────────────┘    Redirect to Original URL  └─────────────────────┘
```

### Core Execution Flow
1. **Submit**: The user submits a long destination URL (e.g. `https://www.linkedin.com/in/profile`) and an optional custom alias (e.g. `linkedin-tejas`).
2. **Validation**: Both client and server validate URL structure (HTTP/HTTPS) and alias constraints (length 3-20, allowed characters, reserved keyword blacklist).
3. **Persist**: If alias is omitted, a unique 6-character random code is generated. The record is persisted to the database.
4. **Share**: The user copies or opens the generated link (`https://yourdomain.com/linkedin-tejas`).
5. **Redirect & Count**: When visited, `GET /:shortCode` atomically increments `clickCount` and responds with an instant `HTTP 302 Found` directing the browser to the original destination.

---

## 🏷️ Custom Alias System

Shortly supports two creation modes:

| Mode | Input | Generated URL | Behavior |
| :--- | :--- | :--- | :--- |
| **Automatic** | `https://example.com/long/path` | `https://domain.com/aB72xK` | Cryptographic random code generated & checked for uniqueness |
| **Custom Alias** | `https://linkedin.com/in/tejas` | `https://domain.com/linkedin-tejas` | Validated against regex `^[a-zA-Z0-9_-]{3,20}$` and reserved keywords |

### Reserved Keywords
System routes and critical assets are protected: `api`, `admin`, `login`, `logout`, `health`, `about`, `faq`, `features`, `home`, `static`, `assets`, `404`, `favicon.ico`, `robots.txt`, `sitemap.xml`.

---

## 📡 API Documentation

### 1. Create Short URL
- **Endpoint**: `POST /api/urls`
- **Rate Limit**: Default 30 requests/minute per IP
- **Request Body**:
```json
{
  "originalUrl": "https://www.linkedin.com/in/example",
  "customAlias": "linkedin-tejas"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "shortCode": "linkedin-tejas",
  "shortUrl": "https://yourdomain.com/linkedin-tejas",
  "originalUrl": "https://www.linkedin.com/in/example",
  "createdAt": "2026-08-23T15:00:00.000Z",
  "clickCount": 0,
  "customAlias": true
}
```

### 2. Fetch URL Details & Metrics
- **Endpoint**: `GET /api/urls/:shortCode`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shortCode": "linkedin-tejas",
    "shortUrl": "https://yourdomain.com/linkedin-tejas",
    "originalUrl": "https://www.linkedin.com/in/example",
    "createdAt": "2026-08-23T15:00:00.000Z",
    "clickCount": 18,
    "customAlias": true
  }
}
```

### 3. Redirection Endpoint
- **Endpoint**: `GET /:shortCode`
- **Status**: `302 Found`
- **Header**: `Location: <originalUrl>`
- **Action**: Increments `clickCount` and redirects the client.

### 4. Health Check
- **Endpoint**: `GET /api/health`
- **Response (200 OK)**:
```json
{
  "status": "ok"
}
```

---

## 🗄️ Database Schema

Defined in `prisma/schema.prisma`:

```prisma
model Url {
  id          Int      @id @default(autoincrement())
  shortCode   String   @unique
  originalUrl String
  createdAt   DateTime @default(now())
  clickCount  Int      @default(0)
  customAlias Boolean  @default(false)

  @@index([shortCode])
}
```

---

## 🔒 Security Measures

1. **Defensive Validation**: Strict URL scheme checks (only `http://` and `https://`), preventing `javascript:` or `data:` XSS injections.
2. **No Destination Crawling**: Backend does not fetch or execute destination pages, neutralizing SSRF risks.
3. **Sliding-Window Rate Limiting**: Protects shortening endpoints from automated spam and resource exhaustion.
4. **Body Size Limits**: Request payloads capped at `10kb` to prevent payload inflation attacks.
5. **No Stack Trace Leaks**: Production error handling returns standardized error JSON without sensitive internal stack traces.

---

## 🧪 Testing

The codebase includes an automated test suite verifying all core API flows:

```bash
# Run test suite
npm test
```

### Verified Test Cases
- Health check verification
- Automatic 6-char short code generation
- Malformed & empty URL rejection (400)
- Custom alias creation & formatting
- Duplicate alias collision rejection (409 Conflict)
- Reserved alias blacklist enforcement
- URL details & metadata retrieval
- HTTP 302 redirection & click counter incrementation
- 404 handler for nonexistent links

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-username/shortly.git
cd shortly
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Initialize Database
```bash
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📦 Production Build

```bash
# Build frontend and compile backend server
npm run build

# Start production server
npm start
```

---

## 🚢 Deployment Architecture

Shortly can be deployed flexibly:
- **Monolithic Container (Cloud Run / Render / Railway / Fly.io)**: Run `npm run build` followed by `npm start`.
- **Decoupled Architecture**: Deploy client SPA to Vercel/Netlify and Express backend to Render/Fly.io with a PostgreSQL instance (simply change datasource provider in `prisma/schema.prisma`).

---

## 🔭 Future Improvements

- [ ] Optional link expiration (TTL timestamps)
- [ ] QR code generation and download
- [ ] Password-protected short links
- [ ] Custom domain mapping support
- [ ] Advanced geographic & referer analytics

---

## 💡 What I Learned

- Designing full-stack TypeScript applications with shared contract types across client and server.
- Implementing robust HTTP 302 redirection pipelines with low latency.
- Managing database schema lifecycles and indexing strategies using Prisma ORM.
- Building resilient client state and caching with `localStorage` fallback patterns.

---

## 📄 License

MIT License. Free for open-source and personal use.
