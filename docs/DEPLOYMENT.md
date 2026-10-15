# AccessPath AI — Google Cloud Run deployment

Phase 0 prepares Cloud Run deployment. Use the **Google Cloud project
associated with the competition** (AI Builder Cup).

## Principles (from PRD)

- Gemini is called **server-side through Vertex AI only**.
- Local auth: **Application Default Credentials (ADC)**.
- Cloud Run: attach a **dedicated service account** with the **minimum
  required Vertex AI permissions** (least privilege).
- Never expose credentials to the browser or commit them to Git.
- Track model usage, latency, errors, and estimated costs (Phase 2).
- Hackathon demos use **fictional seed data only**.

## 1. Local ADC (development)

```bash
gcloud auth application-default login
gcloud config set project YOUR_COMPETITION_GCP_PROJECT_ID
```

Do **not** download JSON keys into the repo.

## 2. Dedicated Cloud Run service account

Create a least-privilege account (names are suggestions):

```bash
PROJECT_ID=YOUR_COMPETITION_GCP_PROJECT_ID
SA_NAME=accesspath-run
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts create "${SA_NAME}" \
  --display-name="AccessPath Cloud Run (Vertex AI)"

# Minimum Vertex AI invoke permission — tighten further if your org policy requires it
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/aiplatform.user"
```

Grant Cloud SQL client access only if using Cloud SQL Auth Proxy /
connector:

```bash
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudsql.client"
```

## 3. Database

Prefer **Cloud SQL for PostgreSQL** for the deployed MVP.

1. Create an instance and database named `accesspath`.
2. Store `DATABASE_URL` in Secret Manager.
3. Run migrations from CI or a one-off Cloud Run Job:

```bash
npm run db:migrate
npm run db:seed
```

## 4. Build and deploy to Cloud Run

```bash
PROJECT_ID=YOUR_COMPETITION_GCP_PROJECT_ID
REGION=us-central1
SERVICE=accesspath-ai
SA_EMAIL="accesspath-run@${PROJECT_ID}.iam.gserviceaccount.com"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/accesspath/${SERVICE}:latest"

gcloud artifacts repositories create accesspath \
  --repository-format=docker \
  --location="${REGION}" \
  || true

gcloud builds submit --tag "${IMAGE}"

gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --service-account "${SA_EMAIL}" \
  --set-env-vars "APP_ENV=production,USE_FICTIONAL_DEMO_DATA=true,GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GOOGLE_CLOUD_LOCATION=${REGION},VERTEX_AI_MODEL=gemini-2.0-flash-001,NEXT_PUBLIC_APP_URL=https://YOUR_CLOUD_RUN_URL" \
  --set-secrets "DATABASE_URL=accesspath-database-url:latest" \
  --port 8080
```

Replace `YOUR_CLOUD_RUN_URL` after the first deploy, then redeploy with the
correct `NEXT_PUBLIC_APP_URL` (or inject at runtime if you avoid baking it).

## 5. Verify

```bash
curl -s "https://YOUR_CLOUD_RUN_URL/api/health" | jq
```

Expect `status: ok` once `DATABASE_URL` is wired and migrations/seed ran.

## 6. What Phase 0 does / does not include

| Included | Deferred |
| --- | --- |
| Dockerfile (standalone Next.js) | Live Cloud Run deploy from this machine |
| Env var contract + Secret Manager guidance | Vertex AI Gemini client (Phase 2) |
| Service account instructions | Real auth / IAM for partners (Phase 3+) |
| Local Postgres via Docker Compose | Production Cloud SQL provisioning automation |
