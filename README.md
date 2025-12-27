# Kairo

## Project Overview

Kairo is a full‑stack application combining a Next.js frontend and a Node.js/Express backend. It provides user authentication (including device‑flow support via the `better-auth` library), session management, and persistent chat/conversation storage using Prisma with a PostgreSQL datasource. The project also exposes a small CLI and several server CLI commands for chat/AI utilities.

Target audience: developers who want a starter for an authenticated chat/conversation app with device‑flow support and a Next.js UI.

## Features

- Next.js (App Router) frontend with authentication flows and profile UI.
- Authentication powered by `better-auth` (includes device flow endpoints).
- Session and account models persisted via Prisma to PostgreSQL.
- Conversation and Message models for storing chat history.
- REST endpoints including `/api/me`, `/api/auth/*` (Better Auth), `/device`, and `/health`.
- Server CLI (`kairo`) with chat/AI commands under `server/src/cli`.
- Prisma migrations included for authentication, device flow, and conversation models.
- Radix UI + Tailwind + accessible component primitives on the frontend.

## Tech Stack

- Frontend:
  - Next.js 16 (App Router)
  - React 19
  - TypeScript
  - Tailwind CSS
  - Radix UI components
  - Various UI libs (lucide-react, sonner, etc.)
- Backend:
  - Node.js (ES Modules)
  - Express 5
  - `better-auth` for auth flows
  - Prisma (with `@prisma/client`)
  - dotenv, cors
  - CLI tooling: `commander`, custom CLI under `server/src/cli`
- Database:
  - PostgreSQL (configured via Prisma datasource)
- Tooling:
  - ESLint, Tailwind tooling, nodemon (dev), Prisma migrations

## Project Structure

```bash
Kairo/
├── client/                          # Next.js frontend (App Router, UI, auth)
│   ├── app/                         # App Router pages & layouts
│   │   ├── page.tsx
│   │   └── (auth)/
│   │       └── sign-in/
│   ├── components/                 # Reusable UI components
│   │   ├── DeviceApprovalContent.tsx
│   │   └── LoginForm.tsx
│   ├── lib/                         # Frontend utilities
│   │   ├── auth-client.ts
│   │   └── utils.ts
│   ├── public/                      # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   └── tailwind.config.ts
│
├── server/                          # Backend + CLI
│   ├── src/
│   │   ├── index.js                 # Express server entry
│   │   │   └── routes: /api/me, /device, /api/auth/*
│   │   ├── lib/                     #| Core helpers
│   │   │   ├── auth.js
│   │   │   ├── db.js
│   │   │   └── token.js
│   │   ├── cli/                     # CLI implementation
│   │   │   ├── main.js
│   │   │   ├── commands/
│   │   │   ├── ai/
│   │   │   └── chat/
│   │   ├── config/                  # Config files
│   │   │   ├── agent.config.js
│   │   │   ├── google.config.js
│   │   │   └── tool.config.js
│   │   └── service/                 # Domain services
│   │       └── chat.service.js
│   │
│   ├── prisma/
│   │   ├── schema.prisma            # User, Session, Account, DeviceCode, etc.
│   │   └── migrations/
│   │       ├── auth/
│   │       ├── device_flow/
│   │       └── conversation/
│   │
│   └── package.json                 # Backend + CLI config (bin: kairo)
│
├── .github/
│   └── prompts/                     # Internal prompt definitions
│
├── kairo-intro.md                   # Project documentation
├── workflow.md                      # System & dev workflow
└── README.md
```

## Getting Started

Prerequisites

- Node.js (v18+ recommended)
- npm (or a compatible package manager)
- PostgreSQL (running, with a connection URL)

Installation (root → run separately in client and server)

- Frontend:

  ```bash
  cd client
  npm install
  npm run dev
  ```

  Frontend dev server runs on the Next.js dev port (default `3000`).

- Backend:

  ```bash
  cd server
  npm install
  npm run dev
  ```

  Backend dev server uses `nodemon` to run `src/index.js`. Ensure `.env` is present (see Configuration).

- Prisma:
  - Create your `.env` with a valid `DATABASE_URL` (PostgreSQL).
  - Apply migrations if needed:
  ```bash
  cd server
  npx prisma migrate deploy   # or npx prisma migrate dev for local development
  ```

## Usage

- Open the frontend in the browser (default http://localhost:3000).
- The app redirects unauthenticated users to the sign-in flow (`(auth)/sign-in`).
- Device flow: the server handles device code redirects to the frontend `/device` page.
- API endpoints:
  - `GET /api/me` — returns session/user info (uses `better-auth` session).
  - `GET /health` — basic health check.

CLI

- The server package declares a `kairo` bin (`server/package.json`). Locally you can run the CLI:
  ```bash
  node server/src/cli/main.js
  ```
  The CLI exposes chat/AI related commands under `server/src/cli/commands/*`.

## Configuration

Important files and environment variables:

- `server/prisma/schema.prisma` — Prisma models and datasource.
- `server/package.json` — backend scripts and dependencies.
- `client/package.json` — frontend scripts and dependencies.
- `.env` (not checked into source) — required environment variables:
  - `DATABASE_URL` — PostgreSQL connection string used by Prisma.
  - `PORT` — port for the Express server (used in `server/src/index.js`).
- Auth: The project uses `better-auth` with server-side auth configuration in `server/src/lib/auth.js` and additional config files in `server/src/config/`. The exact provider credentials (OAuth client IDs/secrets or other auth secrets) are referenced in config but are not present in the repository; add them to your `.env` as required by your auth provider setup.

Note: Additional environment variables required by specific auth providers or `google.config.js` are not enumerated here because secrets and provider credentials are not stored in the repo.

## Development & Contribution

- Follow the existing repo style (TypeScript on the frontend, ES Modules on server).
- Run linters and formatters via the frontend `lint` script and any configured tooling.
- Tests: there are no automated tests in the repository (no `test` scripts beyond the placeholder).
- Contributions:
  - Fork the repository, create a feature branch, and open a pull request.
  - Describe changes and include migration updates if you modify Prisma models.

## Support & Maintenance

For issues or feature requests, open an issue in the repository.

---
