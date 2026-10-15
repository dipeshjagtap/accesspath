# Cursor Implementation Prompt — AccessPath AI (PRD v2.0)

You are the senior full-stack engineer implementing **AccessPath AI**, an AI-powered, multi-category support discovery and case-coordination platform for India. Read the full `AccessPath_AI_PRD v2.md` before making changes. The PRD is the source of truth. Do not build a generic chatbot or only an NGO directory.

## Product outcome

Build a working, secure demo where:
1. A user can register/login, describe a support need, browse relevant published programmes, submit a request with explicit consent, and track the request through an outcome.
2. An NGO/service provider can register/login, manage its organisation profile, publish multiple support programmes, and manage requests in its own dashboard.
3. An AccessPath admin can review provider identity evidence, approve/reject/suspend organisations, and manage categories/listings.
4. The matching flow only uses programmes stored in the database. AI explains matches and next steps; it must never invent NGOs, programmes, registration statuses, eligibility rules, or service availability.
5. If a request is declined or stalls, the system can suggest another suitable published programme. It must not share user data with another organisation unless the user explicitly consents to that new referral.
6. The UI distinguishes a referral being sent from a provider accepting it and from assistance actually being delivered.

## First: inspect before coding

- Inspect the existing repository, framework, package manager, routes, database/ORM, authentication, styles and current implementation.
- Preserve working code and project conventions. Do not replace the project or rewrite unrelated components.
- Compare the repository with the PRD and report a short implementation plan and any blockers, then proceed with the highest-priority work rather than stopping at a plan.
- If the repository already implements part of a requirement, reuse and improve it instead of duplicating it.
- Do not claim a feature is complete unless it works end to end.

## Preferred stack and deployment

Follow the PRD and existing repository. Preferred stack: Next.js App Router, React, strict TypeScript, Tailwind/shadcn, PostgreSQL, and Google Cloud Run. Use Vertex AI Gemini for server-side AI if credentials/project configuration are available.

For Vertex AI:
- Use the currently supported Google Gen AI SDK/API and documented configuration for Vertex AI.
- Use Application Default Credentials locally and a dedicated least-privilege service account on Cloud Run.
- Never expose credentials in client components, `NEXT_PUBLIC_*` variables, source control, logs, or committed JSON key files.
- Add clear `.env.example` placeholders for project ID, region and any genuinely required non-secret configuration. Do not put real credentials in files.
- If Vertex AI credentials are unavailable, implement a typed AI service interface and a deterministic mock/demo provider so the product still runs. Clearly mark the mock mode; do not silently claim a real model call happened.
- Validate and constrain AI output with schemas. Keep matching/filtering deterministic and database-driven.

## Required roles and permissions

Implement server-enforced roles, not just hidden UI elements:
- `user`: manage own profile, own intakes and own requests; can view only cases they are authorised to see.
- `org_admin`: manage its own organisation and programmes, and manage cases submitted to that organisation.
- `caseworker`: manage assigned/authorised cases for their organisation according to the PRD.
- `admin`: verify providers, manage categories/listings and review audit events.

Every protected server action/API route must check the authenticated actor and resource ownership. Never trust `organization_id`, role, user ID or case ownership supplied by the browser. Add tests for cross-user and cross-organisation access denial.

## Core data model

Implement or adapt database migrations for:
- Users and role/membership relationships.
- Organisations with an internal UUID separate from any official registration number.
- Provider verification records/status and source/evidence notes.
- Configurable support categories.
- Programmes owned by organisations, each with category, description, regions served, structured eligibility information, required documents, availability state, source/evidence URL, verification state, last-verified and next-review dates.
- User intakes/plans/checklists as appropriate.
- Requests/cases linked to a specific programme and organisation, including assigned caseworker, status, next action, follow-up due date and outcome.
- Consent events capturing purpose, fields shared, consent version, timestamp and withdrawal where supported.
- Case notes with explicit internal vs user-visible visibility.
- Audit events for verification decisions, consent/data sharing and case-status changes.

Use migrations and seed scripts. Keep sensitive information minimal; do not collect government ID numbers, medical records or exact home addresses just to demonstrate the product.

## Provider verification workflow

Build a protected admin workflow with statuses:
`pending`, `in_review`, `verified`, `rejected`, `suspended`, `recheck_required`.

Collect the registration type/number when applicable, legal name, official source URL, contact details, reviewer notes and timestamps. Include provider types such as NGO, hospital/clinic, public agency and service provider; verification checks vary by type.

Important trust rules:
- An official ID is evidence, not a guarantee of trustworthiness, current operation, service quality or programme availability.
- Never show a government endorsement badge or imply government approval without authorisation.
- Only `verified` organisations and appropriately reviewed programmes may receive live requests in the demo; follow the PRD for any nuanced restrictions.
- If no authorised official API is available, support manual admin review with source URLs. Do not assume NGO-DARPAN has a public API, scrape restricted systems, or bypass access controls.
- Show the verification state and last-checked date in plain language, plus a short explanation of what was and was not checked.

## User experience and pages

Build a polished, responsive, accessible experience with clear navigation and empty/loading/error states. Avoid placeholder-only buttons.

At minimum:
- Public landing page explaining what AccessPath does and does not do.
- Register/login and role-aware routing.
- User dashboard: intake, discover programmes, requests list, case details/timeline, consent and profile settings.
- Need intake: category, region at a suitable granularity, description and optional practical constraints; review/edit before matching.
- Results page: matched programmes from database only, why each is relevant, regions, eligibility caveats, required documents, availability, source and verification labels.
- Consent confirmation before submitting a request; explain exactly which data will be shared and with which organisation.
- Organisation dashboard: profile, programme CRUD, incoming requests, filters, case details, assignment, status changes, user-visible updates and outcome recording.
- Admin dashboard: organisation review queue, verification evidence, decision history, programme moderation and audit trail.
- Helpful no-results state that explains that no verified match was found; never fabricate results.

## Case workflow

Use explicit states based on the PRD, including at least:
`submitted`, `under_review`, `information_requested`, `accepted`, `declined`, `in_progress`, `referred_elsewhere`, `assistance_delivered`, `partially_delivered`, `not_delivered`, `unresolved`, `closed`.

Enforce valid transitions in server-side domain logic. Record who changed the status, when, and a reason where appropriate. A request submitted is not accepted; accepted is not delivered. Record outcome confirmation source if available.

If a case is declined, the programme is unavailable, or the case is overdue:
- Show the issue and next action to the user.
- Find alternative published programmes using deterministic matching.
- Let the user review the alternative and give fresh consent before any data is sent.
- Do not claim emails/SMS/WhatsApp were sent unless a provider is configured and the send operation succeeds. For the MVP, in-app notifications or visible follow-up flags are acceptable.

## AI behaviour

AI may:
- Convert a user's free-text need into a plain-language summary for the user to confirm.
- Explain why a database-returned programme may be relevant.
- Generate next-step and document checklists grounded in available source records.
- Explain uncertainty and suggest asking the organisation for confirmation.

AI must not:
- Invent provider/programme listings or availability.
- Make final legal/medical/government eligibility decisions.
- Diagnose or prescribe treatment/devices.
- Submit or redirect a request without explicit user action/consent.
- Claim a case is resolved without a recorded outcome.

Validate model output. Use minimal necessary personal data in model prompts. Provide safe fallback behaviour if Vertex AI is unavailable.

## Categories and demo data

Make categories configurable, not hard-coded to mobility only. Seed clearly fictional demo organisations/programmes across at least three categories, such as:
- Education support
- Essential needs (food/basic supplies)
- Disability/health support (navigation only; no diagnosis)

Every demo record must be clearly labelled as fictional/demo and must not be presented as a real verified NGO or real available benefit. Create one end-to-end demo scenario that includes a declined or stalled request and a user-approved alternative referral.

## Security, privacy and accessibility

- Validate all inputs on the server and use parameterised ORM/database queries.
- Apply secure password/session handling using the project's established, maintained auth approach.
- Protect against IDOR, CSRF where applicable, XSS and unsafe file uploads.
- Enforce least privilege and organisation tenancy boundaries.
- Keep secrets server-side and redact personal data from logs.
- Record consent before data sharing and support consent withdrawal where feasible.
- Use accessible labels, keyboard navigation, focus states, semantic headings and responsive layouts.
- Do not collect/store uploaded identity or medical documents in the MVP unless the PRD and implementation make a clear, reviewed case for it.

## Tests and acceptance criteria

Add appropriate unit/integration tests for:
- Role permissions and organisation isolation.
- Provider verification transitions and gating of requests.
- Programme matching only returning published eligible records from the database.
- Consent required before referral creation and before any alternative referral.
- Case status transitions, audit events and outcome distinctions.
- AI schema validation and graceful fallback when the model is unavailable.

Run lint, type-check, tests and build. Fix issues caused by your changes. Report any pre-existing failures separately.

The implementation is not done until a developer can run it from documented setup steps, seed the demo, and complete this journey:
1. User logs in and describes a need.
2. App returns database-backed programme matches and an AI explanation.
3. User reviews what data will be shared and consents.
4. Request is submitted to a verified demo organisation.
5. Organisation staff log in, review it and decline or mark a delay with a reason.
6. User sees the update and an alternative programme.
7. User explicitly consents to the alternative referral.
8. Organisation updates the request to a meaningful outcome.
9. Admin can show provider verification evidence and the audit trail.

## How to work

Implement in small, coherent steps. After each major step, run checks and summarise changed files, migrations, environment variables and manual setup required. Do not invent external API integrations. Do not add unnecessary services or microservices. Prefer a complete, reliable end-to-end demo over many incomplete features.
