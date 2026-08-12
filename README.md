# Time Capsule

Seal messages (optional name, rich text + images) that stay **locked** until an admin imports encrypted JSON with an unlock date.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + HeroUI + Lucide
- Prisma + MongoDB Atlas
- TipTap editor (images as base64)
- AES-256-GCM encrypted JSON export/import

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — MongoDB Atlas URI (database `time-capsule`)
   - `VAULT_ADMIN_USERNAME` / `VAULT_ADMIN_PASSWORD` — Bunny Seer (view sealed + delete + import)
   - `EXPORT_ADMIN_USERNAME` / `EXPORT_ADMIN_PASSWORD` — Capsule Courier (export + delete)
   - `SESSION_SECRET` — at least 32 characters
   - `CAPSULE_EXPORT_KEY` — passphrase for encrypting export files

2. Install and push schema:

```bash
npm install
npx prisma db push
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Flow

1. Anyone creates a capsule on the home page (no login).
2. Capsules appear in the vault as **locked** (no body visible).
3. Admin logs in at `/admin`, exports selected capsules as encrypted `.json`.
4. Admin imports that JSON and picks an **unlock date**.
5. After that date, the capsule content (including images) becomes readable.

## Deploy (Vercel)

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add the same env vars as `.env`.
4. Deploy. Run `npx prisma generate` on build (included via `postinstall` if configured).

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npx prisma db push` — sync schema to MongoDB
