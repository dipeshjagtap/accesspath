# Phase 4 submit checklist

## Local readiness

- [ ] `docker compose up -d`
- [ ] `npm run demo:reset`
- [ ] `npm run verify:journey`
- [ ] `npm run verify:links`
- [ ] `npm run test:ai-safety`
- [ ] `npm run check:deploy-env`
- [ ] Walk the UI once on mobile width + keyboard only

## Accessibility smoke

- [ ] Skip link reaches main content
- [ ] Forms have visible labels
- [ ] Focus rings visible
- [ ] Status not conveyed by color alone (badges include text)
- [ ] Partner/referral flows readable on a phone-sized viewport

## Google Cloud (competition project)

- [ ] Set `GOOGLE_CLOUD_PROJECT` to the competition project
- [ ] `gcloud auth application-default login`
- [ ] Create dedicated Cloud Run SA with Vertex AI minimum roles
- [ ] Provision Cloud SQL + secret for `DATABASE_URL`
- [ ] `gcloud builds submit` + `gcloud run deploy` per DEPLOYMENT.md
- [ ] Confirm `https://YOUR_URL/api/health` returns `status: ok`
- [ ] Set `NEXT_PUBLIC_APP_URL` to the Cloud Run URL
- [ ] Re-seed fictional demo data in the cloud database

## Pitch assets

- [ ] Practice [PITCH.md](./PITCH.md) under 3 minutes
- [ ] Record backup video using [DEMO_VIDEO.md](./DEMO_VIDEO.md)
- [ ] Keep architecture diagram from [ARCHITECTURE.md](./ARCHITECTURE.md)

## Hard stops

- Do not commit credentials or service-account JSON
- Do not use real beneficiary data
- Do not present unverified/expired resources as confirmed
