# AccessPath AI

**From unmet need to delivered support**

AccessPath AI is a multi-category support discovery and case-coordination
platform for India. People describe a need, match **published programmes from
verified organisations**, consent before sharing, and track outcomes.
Organisations publish programmes and manage requests. Admins review provider
identity evidence.

This repository implements [`AccessPath_AI_PRD v2.md`](./AccessPath_AI_PRD%20v2.md)
and the Cursor implementation prompt.

> AccessPath does **not** diagnose medical conditions, prescribe treatment or
> devices, invent NGO listings, or determine final eligibility.

## Stack

Next.js App Router · React · TypeScript · Tailwind · PostgreSQL · Drizzle ·
Vertex AI Gemini (with deterministic fallback)

## Quick start

```bash
npm install
cp .env.example .env.local

# Database (pick one):
# A) Docker
docker compose up -d
# B) Local Postgres 14 when Docker is unavailable
npm run db:up
# set DATABASE_URL=postgresql://accesspath@127.0.0.1:5433/postgres in .env.local

# Fresh PRD v2 schema (required after enum/table changes):
# psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# psql "$DATABASE_URL" -f drizzle/0001_prd_v2.sql
# or: npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port Next prints).

### Demo accounts (fictional — from seed)

| Role | Email | Password |
| --- | --- | --- |
| User | `user.demo@accesspath.example` | `DemoUser123!` |
| Org admin | `orgadmin.demo@accesspath.example` | `DemoOrgAdmin123!` |
| Caseworker | `caseworker.demo@accesspath.example` | `DemoCaseworker123!` |
| Platform admin | `admin.demo@accesspath.example` | `DemoAdmin123!` |

## Acceptance demo path

1. Sign in as **user** → `/intake` → pick category + **Pune, Maharashtra (demo)**
2. Confirm summary → view plan (database programmes + AI explanation / fallback)
3. Consent to a verified programme → case `submitted`
4. Sign in as **org admin/caseworker** → `/org` → decline with reason
5. As user, open case → review **alternative** → fresh consent
6. Org updates alternative to a meaningful outcome (e.g. assistance delivered)
7. Sign in as **admin** → `/admin` → verification evidence + audit trail

## Scripts

```bash
npm run demo:reset    # migrate/push + seed (after DB is up)
npm run test          # Vitest unit tests
npm run typecheck
npm run lint
npm run verify:journey
npm run verify:all
```

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL (local host port **5433**) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL |
| `USE_FICTIONAL_DEMO_DATA` | Yes (demo) | Must stay `true` for hackathon |
| `GOOGLE_CLOUD_PROJECT` | For live Gemini | Competition GCP project |
| `GOOGLE_CLOUD_LOCATION` | No | Default `us-central1` |
| `VERTEX_AI_MODEL` | No | Default `gemini-2.5-flash-lite` |

Never commit credentials. Local Vertex AI uses ADC; Cloud Run uses a
dedicated least-privilege service account.

## Docs

- [`AccessPath_AI_PRD v2.md`](./AccessPath_AI_PRD%20v2.md) — product source of truth
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- [`docs/SUBMIT_CHECKLIST.md`](./docs/SUBMIT_CHECKLIST.md)
