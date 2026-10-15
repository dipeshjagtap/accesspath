# AccessPath AI

**From unmet need to delivered support**

AccessPath AI helps people navigate from an assistive-technology need to
verified next steps, while helping partner organizations coordinate
referrals and outcomes.

This repository implements the MVP defined in [`AccessPath_AI_PRD.md`](./AccessPath_AI_PRD.md).

> AccessPath does **not** diagnose medical conditions, prescribe devices,
> or determine final eligibility for assistance programs.

## Current status: Phase 2–3 (AI + referral UI)

| Area | Status |
| --- | --- |
| Landing, intake, summary review, plan, checklist | Done |
| Verified resources / programs UI | Done |
| Gemini via Vertex AI (`@google/genai`) + ADC | Done (falls back if project/ADC missing) |
| Usage / latency / cost logging | Done |
| Referral consent UI + case creation | Done |
| Partner dashboard + status updates + audit | Done |
| Cloud Run deploy to competition project | Docs ready; needs your GCP project |

## Project structure

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)
- Optional: Google Cloud SDK (ADC for Vertex AI in Phase 2+)

## Quick start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# Edit GOOGLE_CLOUD_PROJECT when you have the competition project id

# 3. Start Postgres (host port 5433 → container 5432)
docker compose up -d

# 4. Migrate + seed fictional demo data
npm run db:migrate
npm run db:seed

# 5. Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
Health: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL URL (local default uses host port **5433**) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL |
| `APP_ENV` | No | `local` \| `staging` \| `production` |
| `GOOGLE_CLOUD_PROJECT` | Phase 2+ | Competition GCP project |
| `GOOGLE_CLOUD_LOCATION` | No | Vertex region (default `us-central1`) |
| `VERTEX_AI_MODEL` | No | Gemini model id on Vertex AI |
| `USE_FICTIONAL_DEMO_DATA` | Yes (demo) | Must be `true` for hackathon demos |
| `DEMO_PARTNER_ACCESS_TOKEN` | Phase 3 | Optional demo partner gate |

**Secrets:** never put service-account JSON keys in the repo or client
bundles. Local Vertex AI auth uses ADC; Cloud Run uses a dedicated
service account — see [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` / `npm start` | Production build & serve |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Reset & load fictional demo data |
| `npm run db:studio` | Drizzle Studio |

## Deployment

Cloud Run instructions: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## Demo path

1. `/` → Start mobility-support journey  
2. Choose **Pune, Maharashtra (demo)** → review summary → get plan  
3. Open a resource / program → update checklist  
4. **Request referral** → consent → partner case  
5. `/partner` → update case status  

```bash
npm run smoke:phase1
npm run test:ai-safety
npx tsx --env-file=.env.local scripts/smoke-phase3.ts
```

For live Gemini: set `GOOGLE_CLOUD_PROJECT` to the competition project and run
`gcloud auth application-default login`. Without that, plans still work via
deterministic grounded fallback.

## Next implementation phase

**Phase 4 — Polish & submit:** accessibility pass, demo reset, deploy URL,
pitch/architecture diagram, backup demo video.
