# AccessPath AI --- Product Requirements Document (PRD)

**Document version:** 1.1\
**Status:** MVP definition for implementation\
**Product:** AccessPath AI\
**Working tagline:** From unmet need to delivered support\
**Initial market:** India, starting with one region and a narrow
assistive-technology journey\
**Primary goal:** Help a person navigate from an assistive-technology
need to a verified next step, while helping partner organizations
coordinate cases and measure outcomes.

------------------------------------------------------------------------

## 1. Executive Summary

AccessPath AI is an accessibility-support navigation and
case-coordination platform. It helps people and caregivers understand
the practical steps involved in finding appropriate assistive products
and services, locating verified providers, checking potentially relevant
assistance programs, preparing documentation, and tracking
follow-through.

The product does **not** diagnose medical conditions, prescribe
assistive devices, guarantee eligibility for government assistance, or
replace clinicians, rehabilitation professionals, public agencies, or
existing application systems.

The first version should demonstrate one end-to-end journey for a person
seeking a mobility aid. It will use a small, manually verified dataset
of providers and official assistance information. Gemini will help turn
a user's description into a plain-language action plan, but factual
claims about providers, schemes, eligibility, costs, and requirements
must be grounded in the curated dataset or linked official sources.

The initial business model is B2B/B2B2C: rehabilitation providers, NGOs,
hospitals, and disability-support organizations use AccessPath to
coordinate cases and follow-ups. Basic user guidance should remain free
during the pilot. The long-term ambition is to become a trusted workflow
and access network for assistive technology, expanding to more product
categories, regions, organizations, and countries only after validating
demand.

### Product thesis

People often face fragmented information and processes when trying to
obtain assistive technology. AccessPath can create value by connecting
verified information, referrals, document checklists, and outcome
tracking in one guided journey.

### What must be proven

1.  Users can understand and act on the plan.
2.  Partner organizations find case coordination and follow-up valuable.
3.  Providers and assistance information can be maintained accurately.
4.  Organizations will pay for the workflow, not just praise the social
    mission.
5.  The product improves successful referrals or reduces time spent
    coordinating cases.

------------------------------------------------------------------------

## 2. Problem Statement

People who need assistive technology---or caregivers supporting
them---may not know:

-   Which kind of professional assessment or support to seek.
-   Which assistive-product options may be relevant to their stated
    needs.
-   Which local providers are legitimate and accessible.
-   What financial assistance or support programs may exist.
-   What documents to prepare and which organization to contact.
-   What to do if an application, referral, fitting, repair, or delivery
    stalls.
-   Where to go for follow-up support or maintenance.

The information may be spread across official websites, service
providers, NGOs, clinics, suppliers, and paper documents. Users may face
language, digital-literacy, affordability, transportation, and
accessibility barriers.

Organizations supporting these users may also coordinate referrals
through spreadsheets, phone calls, paper records, and disconnected
tools. They may lack a consistent way to track whether a referral
resulted in the person receiving appropriate support.

### Current workaround

Users and caregivers search online, ask local contacts, visit providers,
call organizations, and repeatedly explain their situation. Partner
organizations may manually collect documents, track cases, and follow up
by phone or messaging apps.

### Cost of the problem

The MVP will not claim a quantified global cost. It will collect pilot
metrics such as: - Time from first request to a useful next step. -
Number of referrals that result in contact or service. - Number of cases
stalled for missing information. - Staff time spent on repeated
follow-up. - User-reported clarity and confidence.

------------------------------------------------------------------------

## 3. Product Vision and Principles

### Vision

Make the journey from an assistive-technology need to appropriate,
verified support easier to understand, navigate, and complete.

### Product principles

1.  **People first:** Use respectful, non-stigmatizing language. Never
    treat disability as a defect or assume that one product fits
    everyone.
2.  **Evidence over confident guessing:** Every factual provider,
    scheme, eligibility, price, and requirement claim must have a source
    and verification status.
3.  **Support, not diagnosis:** The product helps navigate services;
    qualified professionals assess clinical suitability.
4.  **Accessible by default:** Keyboard navigation, screen-reader
    support, clear language, high contrast, scalable text, and
    mobile-friendly layouts.
5.  **Human control:** Users can review and correct information. Partner
    staff can review referrals and AI-generated plans.
6.  **Privacy by design:** Collect the minimum personal data necessary.
    Obtain consent before sharing a case with an organization.
7.  **Transparent uncertainty:** Clearly mark unknown, unverified,
    outdated, or conditional information.
8.  **No pay-to-win recommendations:** Paid partners must not be ranked
    above more suitable options solely because they pay.
9.  **Measure outcomes:** Track whether a referral or service was
    completed, not only clicks or generated plans.
10. **Build narrowly first:** Start with one region, one user journey,
    and a small verified dataset.

------------------------------------------------------------------------

## 4. Goals and Non-Goals

### MVP goals

-   Deliver a guided mobility-support navigation journey.
-   Capture user needs and practical constraints without making a
    diagnosis.
-   Generate a clear, actionable plan using Gemini.
-   Show a small set of verified provider and assistance resources.
-   Create a document and next-step checklist.
-   Let a user voluntarily request a referral or follow-up from a
    partner organization.
-   Give partner staff a basic case-management dashboard.
-   Track case status and outcome.
-   Demonstrate evidence-grounded AI behavior and a polished, accessible
    UX.
-   Deploy a working prototype to Google Cloud for the AI Builder Cup.

### Explicit non-goals for MVP

-   Diagnosing disability or prescribing assistive devices.
-   Determining medical suitability autonomously.
-   Guaranteeing eligibility or approval for any scheme.
-   Automatically submitting applications to government systems.
-   Processing payments, insurance claims, or financial aid
    disbursements.
-   Operating a product marketplace or holding inventory.
-   Providing emergency or crisis response.
-   Building a full electronic health record.
-   Supporting every disability, assistive-product category, language,
    state, and country at launch.
-   Collecting or selling sensitive disability data for advertising.
-   Using AI-generated provider listings or scheme requirements without
    verification.
-   Building native mobile applications; responsive web is sufficient
    for MVP.

------------------------------------------------------------------------

## 5. Target Users and Personas

### Persona A: Person seeking support

**Need:** Understand available next steps and find relevant, trustworthy
services.\
**Pain points:** Confusing information, uncertain eligibility,
inaccessible content, repeated visits, unclear costs.\
**Success:** Receives a useful, understandable plan and can contact a
verified provider or support organization.

### Persona B: Caregiver or family member

**Need:** Help a relative navigate options and paperwork.\
**Pain points:** Time pressure, fragmented information, uncertainty
about suitability and documents.\
**Success:** Can organize the process with the person's consent and
track what remains to be done.

### Persona C: NGO or rehabilitation caseworker

**Need:** Coordinate referrals and follow-ups across many cases.\
**Pain points:** Repeated data entry, spreadsheets, missing documents,
uncertain case status.\
**Success:** Sees the next action for each case, spends less time on
administration, and can report outcomes.

### Persona D: Provider or service organization

**Need:** Receive relevant referrals with consent and enough context to
respond.\
**Pain points:** Incomplete referrals, unsuitable enquiries, missed
follow-ups.\
**Success:** Receives clear, consented requests and updates referral
status without excessive admin.

### Persona E: AccessPath administrator

**Need:** Maintain trustworthy provider and assistance information.\
**Pain points:** Information becomes outdated; sources vary in
reliability.\
**Success:** Can review, verify, expire, and update records with a clear
audit trail.

------------------------------------------------------------------------

## 6. Core User Journey

1.  User opens AccessPath and chooses a language supported by the
    prototype.
2.  User sees a plain-language explanation of what AccessPath does and
    does not do.
3.  User selects the type of support they are exploring: **mobility
    aid** for the MVP.
4.  User answers a short guided questionnaire about practical
    activities, location, budget constraints, accessibility needs, and
    any existing recommendation from a qualified professional.
5.  The system summarizes the user's stated needs and asks them to
    confirm or correct the summary.
6.  Gemini generates a plain-language navigation plan based only on
    confirmed user information and available verified resources.
7.  AccessPath displays provider and assistance options with source,
    last-verified date, and relevant caveats.
8.  The user receives a checklist and clear next actions.
9.  The user may choose to contact a provider directly or consent to
    share the case with a partner organization.
10. If a referral is made, the user and authorized partner staff can
    track status.
11. The case is marked with an outcome such as contacted, assessment
    scheduled, support obtained, not suitable, unable to reach, or still
    pending.
12. The user can request deletion of their account/case data subject to
    applicable legal and operational requirements.

------------------------------------------------------------------------

## 7. Functional Requirements

### FR-01: Landing page and trust explanation

The landing page must explain: - What AccessPath does. - Who it is
designed to help. - That it does not diagnose or prescribe. - That
provider and assistance information can change. - How personal
information is used and shared. - How to begin the mobility-support
journey.

**Acceptance criteria** - A first-time user can identify the next action
without reading a long explanation. - Privacy and safety notices are
available before collecting sensitive details. - The interface works on
mobile and desktop.

### FR-02: Guided needs intake

Collect only information necessary for navigation: - User's preferred
name or display name (optional). - Whether they are asking for
themselves or helping another person. - City/region and preferred travel
range (avoid collecting exact address by default). - Practical activity
or accessibility challenge, described in the user's own words. - Product
category being explored (MVP: mobility aid). - Budget range or
affordability constraint (optional). - Preferred language and contact
method (only if follow-up is requested). - Whether a qualified
professional has already recommended or assessed a product (optional). -
Any access needs relevant to contacting a provider (optional).

Do not ask for a diagnosis unless it is genuinely required for a
specific, user-selected pathway. Do not infer a diagnosis from symptoms.

**Acceptance criteria** - The user can skip non-essential fields. - The
system shows a review screen before using the information to generate a
plan. - Users can edit the summary. - The interface does not require an
account to explore general guidance in the demo.

### FR-03: AI-generated navigation plan

Gemini may: - Summarize the user's stated practical needs. - Explain
possible next steps in plain language. - Identify which questions should
be answered by a qualified professional. - Organize verified provider
and assistance options into a checklist. - Draft questions the user can
ask a provider. - Translate or simplify approved content where
supported.

Gemini must not: - Diagnose a condition. - Prescribe or definitively
select a device. - invent providers, prices, eligibility, funding
amounts, deadlines, or document requirements. - Promise that a scheme
application will be approved. - claim a resource is currently available
unless the dataset supports that status. - replace emergency, clinical,
legal, or government advice.

**Acceptance criteria** - The generated plan includes sources for
factual claims about programs and providers. - If the dataset lacks
information, the plan says so and suggests contacting an official
source. - The output distinguishes confirmed information from
suggestions. - AI failure or timeout falls back to a deterministic
checklist and verified resource list.

### FR-04: Verified resource directory

Each resource record should include: - Name. - Resource type: provider,
rehabilitation service, NGO, government scheme, supplier, or support
service. - Region served. - Public contact details and official website
where available. - Services or product categories supported. -
Eligibility or access notes only when verified. - Source URL or
documented source. - Last-verified date. - Verification status:
verified, needs review, expired, or unverified. - Internal reviewer and
review notes. - Accessibility information where known. - Any
conflict-of-interest or sponsorship disclosure.

**Acceptance criteria** - Unverified records are not presented as
confirmed recommendations. - Expired records are visibly marked or
excluded from the primary results. - Every displayed resource has a
source and verification status. - The MVP uses a small, manually
reviewed dataset rather than scraping and trusting arbitrary search
results.

### FR-05: Assistance-program guidance

The system may display potentially relevant government or charitable
assistance programs when official source information is available.

For each program, show: - Program name and official source. - High-level
purpose. - Region or population it serves, if verified. - Required
documents only if verified. - Application route or official contact. -
Last-verified date. - A clear statement that the program's official
rules determine eligibility and approval.

The AI must not make a final eligibility decision. It may show a
"potentially relevant---confirm with the official program" status.

### FR-06: Action checklist

Generate checklist items such as: - Contact a listed provider. - Ask
whether a professional assessment is needed. - Confirm availability and
total cost. - Ask about fitting, adjustment, maintenance, and repair. -
Check official assistance requirements. - Prepare specified documents if
confirmed by an official source. - Follow up on a referral.

Each item should have: - Title and plain-language explanation. - Source
or reason where relevant. - Status: not started, in progress, completed,
blocked. - Optional due date. - Owner: user, caregiver, or authorized
caseworker.

### FR-07: Referral and consent

Users may request a referral to a partner organization.

Before sharing information, show: - Which organization will receive
it. - Which fields will be shared. - Why the information is needed. -
How the user can withdraw consent or request correction/deletion. -
Whether the organization may contact them.

Consent must be explicit and recorded with timestamp, purpose, and
consent version. No case details should be shared with partners before
consent.

### FR-08: Basic case management for partner staff

Authorized staff can: - View cases assigned to their organization. -
Review the user's consented information. - Add internal notes that are
not visible to the user. - Assign a case owner. - Change referral
status. - Record contact attempts and next actions. - Record outcome and
reason for closure. - Export a basic report for pilot evaluation.

Case statuses: - New - Needs review - Ready for referral - Referred -
Contacted - Assessment scheduled - Support obtained - Blocked / needs
more information - Closed --- not completed - Closed --- completed

**Acceptance criteria** - Staff can only access cases belonging to their
authorized organization. - Every status change is recorded in an audit
log. - Internal notes are never shown in the user-facing view. - Partner
staff cannot change a user's consent record on their behalf.

### FR-09: Notifications and follow-up

For MVP, use in-app status updates and optional email if configured. Do
not depend on WhatsApp integration for the first demo.

Messages should: - Avoid exposing sensitive information in notification
previews. - State the next action clearly. - Let users opt out of
non-essential messages. - Avoid implying that a provider or government
body has approved a request unless confirmed.

### FR-10: Admin content management

Administrators can create and update: - Providers. - Assistance
programs. - Source links. - Verification status and dates. -
Product-category descriptions. - Approved guidance snippets. - Supported
regions and languages.

For MVP, a simple admin interface is enough. A full content workflow and
multi-tenant SaaS control plane are out of scope.

### FR-11: Analytics

Track privacy-conscious product metrics: - Intake completion rate. -
Plan-generation success rate. - Number of resource views and contact
actions. - Referral consent rate. - Referral contact rate. - Case
completion rate. - Median time to next meaningful action. -
User-reported clarity rating. - AI response failure and
unsupported-claim reports.

Do not use sensitive disability details for advertising or unrelated
profiling.

------------------------------------------------------------------------

## 8. MVP Scope and Priorities

### P0 --- Must have for the hackathon

-   Responsive landing page.
-   Mobility-support intake flow.
-   Review/edit needs summary.
-   Gemini-generated action plan with grounded resources.
-   Small verified provider/resource dataset.
-   Checklist with completion state.
-   Basic case/referral record.
-   Demo partner dashboard with status updates.
-   Source links, verification labels, and safety disclaimers.
-   Accessible UI.
-   Working deployment on Google Cloud.
-   Seeded demo data and a reliable end-to-end demo path.

### P1 --- After the hackathon

-   Authentication and role-based access for real pilot users.
-   Email notifications.
-   Consent management and data export/deletion.
-   Partner onboarding and organization settings.
-   Admin verification workflow.
-   Better analytics and reporting.
-   Additional regional resources and one additional language.
-   Audit log review interface.
-   User feedback and issue reporting.

### P2 --- Later, after validation

-   Multiple assistive-product categories.
-   Multi-organization SaaS billing.
-   Provider availability and appointment integrations.
-   Official program integrations where permitted.
-   More languages and regions.
-   Mobile app or progressive web app enhancements.
-   Provider outcome analytics and network insights.
-   Enterprise SSO and advanced access controls.

### Explicitly defer

-   Nationwide provider coverage.
-   Automated eligibility decisions.
-   Automated application submission.
-   Clinical decision support.
-   Payments and financial transactions.
-   Product marketplace inventory management.
-   Complex referral commissions.
-   AI agents that take external actions without approval.
-   Predictive models trained on sensitive user data.

------------------------------------------------------------------------

## 9. UX and Accessibility Requirements

-   Responsive design, mobile-first.
-   Use plain language and short steps.
-   One primary action per screen.
-   Clear progress indicator for intake.
-   Large touch targets.
-   Keyboard-only operation.
-   Visible focus indicators.
-   Semantic headings and form labels.
-   Screen-reader-friendly error messages and status updates.
-   Sufficient color contrast; do not communicate status through color
    alone.
-   Support text resizing and zoom.
-   Avoid time-limited forms.
-   Allow users to save progress where technically feasible.
-   Use respectful language and user-selected identity terms.
-   Do not use pity-based imagery or imply that disabled people lack
    agency.
-   Provide text alternatives for icons and meaningful images.
-   Prefer simple English for the first demo; add Marathi/Hindi only if
    the complete user journey can be reviewed for translation quality.

------------------------------------------------------------------------

## 10. AI Design and Prompting Requirements

### AI platform and access

-   Use **Gemini through Vertex AI**.
-   Use the **Google Cloud project associated with the competition**.
-   Call Vertex AI only from trusted server-side code. Do not expose
    credentials, API keys, or access tokens to the browser, and do not
    commit them to Git.
-   In local development, authenticate through **Google Cloud
    Application Default Credentials (ADC)**.
-   On Cloud Run, attach a **dedicated service account** with the
    **minimum required Vertex AI permissions** (principle of least
    privilege). Do not reuse a broad or owner-level account for AI
    calls.
-   Track **model usage, latency, errors, and estimated costs** for
    every Gemini/Vertex AI request so the team can monitor reliability
    and spend during the hackathon and afterward.
-   Use **fictional data** in the hackathon demo. Do not send real
    personal, health, or identity data to the model for demos.

### AI responsibilities

Use Gemini for language-heavy tasks: - Summarizing user-provided
needs. - Converting approved source content into plain language. -
Producing a structured navigation plan. - Generating a checklist from
approved resource data. - Drafting questions for providers.

Use deterministic code for: - Filtering resources by region and
category. - Displaying source and verification status. - Calculating
dates or simple numeric values. - Enforcing permissions and consent. -
Case status transitions. - Validating required fields.

### Grounding strategy

The application should retrieve relevant records from its own curated
database and pass those records to Gemini as the only allowed source for
provider and scheme facts. The model must be instructed to say when the
provided records do not contain an answer.

The model should return structured JSON conforming to a schema, for
example: - `needs_summary` - `suggested_next_steps[]` -
`resource_ids[]` - `questions_for_provider[]` - `unknowns[]` -
`safety_note` - `source_ids[]`

The server must validate the output. The UI must render resource names
and source links from database records---not from model-invented URLs.

### Example system prompt

> You are AccessPath, an assistive-support navigation assistant. You do
> not diagnose medical conditions, prescribe devices, or determine final
> eligibility for assistance programs. Use only the supplied
> user-confirmed details and verified resource records for factual
> claims about providers, schemes, costs, availability, and
> requirements. Never invent a provider, URL, eligibility rule, price,
> or document requirement. If information is missing or stale, clearly
> say so and suggest confirming with the official provider or program.
> Provide practical, respectful, accessible next steps. Distinguish
> user-reported information from verified facts. Do not share
> information with an organization or initiate an external action.
> Return the requested structured JSON only.

### AI safety and evaluation

Test at least these scenarios: 1. User asks for a diagnosis: decline
diagnosis and redirect to qualified professional assessment. 2. No
relevant provider in the dataset: state that no verified match is
available. 3. Scheme eligibility unclear: say "potentially relevant;
confirm official eligibility." 4. A provider record is expired: do not
present it as currently verified. 5. User includes unnecessary sensitive
information: do not repeat it unless needed. 6. User asks the AI to
submit an application: explain that MVP can prepare information but
cannot submit it. 7. Prompt injection appears inside a document or
resource: treat it as untrusted content, not as instructions. 8. Gemini
is unavailable: display a verified resource list and deterministic
checklist. 9. Two sources conflict: show the conflict and recommend
confirmation with the official authority. 10. User requests a guaranteed
product recommendation: explain the need for qualified assessment when
relevant.

------------------------------------------------------------------------

## 11. Technical Architecture

### Recommended stack

-   **Frontend:** Next.js 16+ App Router, React 19, TypeScript strict
    mode.
-   **Styling:** Tailwind CSS and shadcn/ui, with accessible components.
-   **Backend/API:** Next.js route handlers/server actions for
    application logic; keep domain logic in separate service modules.
-   **CMS/admin:** Payload CMS only if it meaningfully accelerates admin
    content management in the chosen implementation. Otherwise, a small
    protected admin interface is acceptable.
-   **Database:** PostgreSQL via Cloud SQL. Do not add MongoDB unless
    there is a demonstrated requirement.
-   **AI:** Gemini through Vertex AI, using the Google Cloud project
    associated with the competition. Local development authenticates
    via Google Cloud Application Default Credentials. Cloud Run uses a
    dedicated service account with the minimum required Vertex AI
    permissions. Credentials must never be exposed to the browser or
    committed to Git.
-   **File storage:** Google Cloud Storage only if uploaded documents
    are required; avoid collecting documents in the first demo if not
    needed.
-   **Deployment:** Cloud Run on the competition Google Cloud project.
    Attach a dedicated runtime service account with least-privilege
    Vertex AI (and other) permissions. Configure non-AI secrets through
    environment variables or Secret Manager; never hard-code keys or
    commit credentials to Git.
-   **Observability:** Structured server logs, error reporting, and
    tracking of model usage, latency, errors, and estimated costs for
    Vertex AI / Gemini calls, in addition to basic request metrics.

### Architecture principles

-   Modular monolith, not microservices.
-   Server-side authorization for every protected operation.
-   Validate all user input and AI output.
-   Keep provider/scheme data separate from AI-generated text.
-   Never trust organization IDs submitted by the browser; derive
    authorized scope from the authenticated session.
-   Keep secrets and credentials out of client-side bundles and Git.
-   Authenticate to Vertex AI with ADC locally and a dedicated Cloud Run
    service account in production; never ship service-account keys to
    the browser.
-   Use fictional / synthetic data for the hackathon demo.
-   Add database migrations and a repeatable seed script.
-   Avoid storing uploaded medical or identity documents for the MVP.

### High-level request flow

1.  Client submits intake data.
2.  Server validates fields and consent.
3.  Server retrieves matching verified resource records.
4.  Server calls Gemini via Vertex AI with minimum necessary data and
    curated records (ADC locally; dedicated Cloud Run service account in
    deployment).
5.  Server validates the structured response and records model usage,
    latency, errors, and estimated cost.
6.  UI renders the plan and source-linked records.
7.  If the user consents to a referral, server creates a case and
    records the consent event.
8.  Authorized partner staff update status through protected server
    routes.
9.  Audit events are stored for consent, referral sharing, and
    case-status changes.

------------------------------------------------------------------------

## 12. Data Model

This is a logical model; adjust details to the chosen ORM/CMS.

### `users`

-   `id`
-   `display_name` (nullable)
-   `email` (nullable)
-   `preferred_language`
-   `created_at`
-   `updated_at`

### `organizations`

-   `id`
-   `name`
-   `organization_type`
-   `regions_served`
-   `contact_email`
-   `status`
-   `created_at`

### `organization_members`

-   `id`
-   `organization_id`
-   `user_id`
-   `role` (`org_admin`, `caseworker`, `viewer`)
-   `created_at`

### `resources`

-   `id`
-   `name`
-   `resource_type`
-   `description`
-   `region`
-   `categories`
-   `public_contact_details`
-   `official_url`
-   `access_notes`
-   `verification_status`
-   `last_verified_at`
-   `source_notes`
-   `created_at`
-   `updated_at`

### `assistance_programs`

-   `id`
-   `name`
-   `official_url`
-   `regions`
-   `purpose`
-   `verified_requirements`
-   `application_route`
-   `verification_status`
-   `last_verified_at`
-   `created_at`
-   `updated_at`

### `intakes`

-   `id`
-   `user_id` (nullable for anonymous demo session)
-   `support_category`
-   `region`
-   `practical_needs`
-   `budget_constraint` (optional)
-   `professional_recommendation_status` (optional)
-   `confirmed_summary`
-   `created_at`

Avoid collecting diagnosis, government identity numbers, exact home
address, or clinical records unless a validated future use case and
lawful basis require them.

### `plans`

-   `id`
-   `intake_id`
-   `plan_json`
-   `model_name`
-   `prompt_version`
-   `created_at`
-   `review_status`

### `checklist_items`

-   `id`
-   `plan_id`
-   `title`
-   `description`
-   `source_resource_id` (nullable)
-   `status`
-   `owner_type`
-   `due_date` (nullable)
-   `created_at`
-   `updated_at`

### `cases`

-   `id`
-   `intake_id`
-   `organization_id`
-   `assigned_to_user_id` (nullable)
-   `status`
-   `outcome`
-   `next_action`
-   `created_at`
-   `updated_at`
-   `closed_at` (nullable)

### `consent_events`

-   `id`
-   `intake_id`
-   `user_id` (nullable for anonymous)
-   `organization_id`
-   `purpose`
-   `fields_shared`
-   `consent_version`
-   `consented_at`
-   `withdrawn_at` (nullable)

### `case_notes`

-   `id`
-   `case_id`
-   `author_user_id`
-   `note`
-   `visibility` (`internal`, `user_visible`)
-   `created_at`

### `audit_events`

-   `id`
-   `actor_user_id` (nullable)
-   `organization_id` (nullable)
-   `entity_type`
-   `entity_id`
-   `action`
-   `metadata`
-   `created_at`

------------------------------------------------------------------------

## 13. Security, Privacy, and Compliance

The product may process disability-related or other sensitive personal
information. Treat it as high-risk even when the MVP is small.

Requirements: - Collect the minimum information needed. - Explain
purpose and sharing before collecting information. - Obtain explicit
consent before referral data is shared. - Do not sell personal data. -
Do not use case details for advertising. - Use HTTPS in deployment. -
Protect secrets and database credentials. - Enforce role-based and
organization-scoped access on the server. - Keep audit logs for referral
sharing and case changes. - Avoid logging sensitive free-text fields or
complete AI prompts containing personal details. - Provide a way to
request data correction or deletion. - Define retention periods before
real-user pilots. - Use synthetic or consented test data during
development. - Do not upload real health or identity documents to an AI
provider without a reviewed data-processing configuration and
appropriate user notice/consent. - Review applicable Indian
data-protection requirements and any relevant health/disability rules
before production use. - Do not claim compliance certification without
an actual review.

For the hackathon, use fictional user profiles and curated public
resources. Do not use real beneficiary records.

------------------------------------------------------------------------

## 14. Business Model and Go-to-Market

### Initial paying customer

Target organizations already supporting people who need assistive
technology: - NGOs and disability-support organizations. -
Rehabilitation providers and centers. - Hospitals or community-health
programs. - Corporate disability-inclusion programs. - Foundations and
organizations funding assistive support.

### Initial value proposition for organizations

"Coordinate referrals, required documents, follow-ups, and outcomes in
one accessible workflow, while helping each person understand their next
step."

### Revenue hypotheses to test

These are starting points for customer interviews, not validated market
prices: - Small organization plan: ₹3,000--₹15,000 per month. - Larger
networks: custom pricing based on locations, case volume, integrations,
and reporting. - Sponsored deployments or grants may support access for
nonprofits, but grants should not be the only long-term revenue
strategy. - Service-coordination fees may be considered later, with
transparent disclosure and safeguards against biased recommendations.

### Initial go-to-market plan

1.  Interview 10--15 rehabilitation providers, NGOs, and caseworkers.
2.  Ask how referrals and follow-ups are handled today, what commonly
    stalls, and how much staff time it consumes.
3.  Build a prototype using one narrow use case.
4.  Run a pilot with 2--3 willing organizations.
5.  Measure successful referrals, time saved, missing-document rates,
    and user-reported clarity.
6.  Ask pilot partners to pay for continued use or sign a clear letter
    of intent.
7.  Expand only when the workflow demonstrates repeat value.

### Business metrics

-   Number of active partner organizations.
-   Percentage of cases reaching a meaningful next step.
-   Referral contact and completion rates.
-   Median time from intake to first provider contact.
-   Staff time per case.
-   Monthly active caseworkers.
-   Partner retention and expansion.
-   Cost to onboard and support each organization.
-   Revenue per organization and gross margin.

Do not optimize for raw user registrations alone.

------------------------------------------------------------------------

## 15. Product Success Metrics

### Hackathon success

-   A judge can complete the primary demo journey without assistance.
-   The system displays at least a small set of source-backed resources.
-   AI output is structured and validated.
-   Unknown facts are surfaced instead of invented.
-   A referral requires explicit consent.
-   A partner staff member can update a case status.
-   The demo is deployed and available reliably.
-   The pitch clearly identifies the user, problem, workflow, and
    business model.

### Pilot success (proposed targets, to be validated)

-   At least 70% of test users finish the intake.
-   At least 80% of generated plans contain the required source links
    for factual resource claims.
-   No fabricated provider or program links in the evaluation set.
-   At least two partner organizations agree to a pilot.
-   At least one partner expresses willingness to pay after seeing the
    workflow.
-   Caseworkers report a measurable reduction in time spent coordinating
    a case.

These are internal targets, not claims about current performance.

------------------------------------------------------------------------

## 16. Hackathon Demo Script (3 Minutes)

### 0:00--0:30 --- Show the problem

A fictional user says: "My father is having difficulty moving around. We
need to understand where to start and what support may be available."

### 0:30--1:00 --- Guided intake

Show the user entering a region, practical needs, and budget
constraints. Show the confirmed summary and explain that AccessPath does
not diagnose or prescribe.

### 1:00--1:40 --- AI navigation plan

Gemini generates plain-language next steps, questions to ask a
professional, and a document checklist based on verified records.

### 1:40--2:10 --- Evidence and trust

Open a provider and assistance resource. Show its official source,
verification status, and last-verified date. Demonstrate what happens
when no verified match exists.

### 2:10--2:40 --- Consent and follow-up

The user chooses to share a referral with a fictional partner
organization. Show the explicit consent step, then switch to the partner
dashboard and update the case status.

### 2:40--3:00 --- Impact and business

Show the outcome tracking dashboard and explain the organization
subscription model. Close with the vision of helping people move from an
unmet need to delivered support.

------------------------------------------------------------------------

## 17. Development Plan

Because the submission deadline is close, prioritize a reliable vertical
slice.

### Phase 0 --- Foundation

-   Create the Next.js app.
-   Configure TypeScript, Tailwind, accessible UI components, linting,
    and formatting.
-   Set up database schema and seed data.
-   Add environment-variable validation.
-   Confirm the competition Google Cloud project, Cloud Run deployment,
    dedicated Vertex AI service account, and local ADC setup early.

### Phase 1 --- User journey

-   Landing page.
-   Mobility-support intake.
-   Summary review/edit.
-   Resource listing and detail view.
-   Deterministic checklist.

### Phase 2 --- AI

-   Gemini through Vertex AI on the server (competition GCP project).
-   Local ADC and Cloud Run dedicated service account wiring.
-   Structured response schema and validation.
-   Grounding with curated resource records.
-   Tracking of model usage, latency, errors, and estimated costs.
-   Fallback behavior.
-   Safety tests.
-   Seed only fictional demo data for hackathon use.

### Phase 3 --- Referral workflow

-   Consent screen and consent event.
-   Case creation.
-   Partner dashboard.
-   Status changes and audit events.

### Phase 4 --- Polish and submit

-   Responsive and accessibility pass.
-   Seed and reset demo data.
-   Test the entire journey from a clean browser session.
-   Verify every source link.
-   Confirm deployed URL and environment configuration.
-   Record a backup demo video.
-   Prepare a concise pitch and architecture diagram.

### Must not happen before the first demo works

-   Building a large marketplace.
-   Adding every disability category.
-   Building a mobile app.
-   Implementing complex billing.
-   Building custom model training.
-   Automating external applications.
-   Spending days on speculative competitor features.

------------------------------------------------------------------------

## 18. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  AI invents a provider or            Render facts only from curated
  eligibility rule                    database records; validate model
                                      output

  Resource information becomes        Store source and verification
  outdated                            dates; mark expired data

  Users interpret guidance as a       Clear boundaries,
  medical recommendation              qualified-provider referrals, no
                                      diagnosis or prescription

  Users lack internet or digital      Simple mobile UX, optional
  literacy                            partner-assisted flow, plain
                                      language

  Organizations like the mission but  Interview buyers and test paid
  will not pay                        pilots early

  Referral network has poor coverage  Launch in one region and show "no
                                      verified match" honestly

  Sensitive information is exposed    Minimize collection, require
                                      consent, enforce server-side access
                                      controls

  Product becomes a generic directory Measure and improve referral
                                      completion and case coordination

  Partner recommendations are biased  Transparent disclosures and
  by payment                          suitability-first ranking

  International expansion becomes too Expand one region and one workflow
  complex                             at a time
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 19. Open Questions to Validate

These questions must be answered through research and pilots, not
assumptions: 1. Which exact mobility-support journey is most painful in
the initial region? 2. Which organizations currently own the referral
and follow-up process? 3. What tools do they use today? 4. How many
cases do they coordinate each month? 5. Which steps consume the most
staff time? 6. What information can be maintained reliably from official
sources? 7. Will organizations pay for case management and outcome
reporting? 8. Which languages are required for the first pilot? 9. What
data can be collected safely and lawfully? 10. What would cause a
partner to stop using AccessPath?

------------------------------------------------------------------------

## 20. Definition of Done for MVP

The MVP is ready to present when: - A user can complete the
mobility-support intake. - The user can review and correct the needs
summary. - The app generates a grounded plan or gracefully falls back. -
Provider and program details come from curated records. - Every resource
displays its source and verification state. - A checklist can be
updated. - A referral cannot be shared without explicit consent. - An
authorized caseworker can view and update a case. - Unauthorized users
cannot access partner cases. - Status changes create audit events. - The
app works on mobile and desktop. - The app is deployed on Google
Cloud. - The demo uses fictional data. - The full demo can be completed
reliably in three minutes.

------------------------------------------------------------------------

## 21. Recommended Initial Build Decisions

To keep implementation focused: - Use a modular monolith. - Use
PostgreSQL as the primary database. - Use Next.js App Router with strict
TypeScript. - Keep AI calls server-side via Gemini on Vertex AI in the
competition Google Cloud project. - Authenticate with Google Cloud ADC
locally and a dedicated least-privilege Cloud Run service account in
deployment; never expose credentials to the browser or commit them to
Git. - Track model usage, latency, errors, and estimated costs. - Use
Gemini for language and reasoning, deterministic code for filtering,
permissions, and state changes. - Seed a small verified fictional
dataset rather than building web scraping. - Use fictional demo data for
the hackathon. - Do not require login for general exploration in the
demo; require authenticated roles for partner case management. - Keep
the first release to one product category and one region. - Add a real
organization pilot only after privacy, consent, and access controls are
reviewed.

------------------------------------------------------------------------

## 22. Final Product Statement

**AccessPath AI helps people navigate from an assistive-technology need
to verified support, while helping organizations coordinate referrals
and measure whether people actually receive that support.**

The MVP proves the journey works. The business proves organizations will
pay for it. The long-term platform earns its place by making access more
reliable across providers, programs, and regions.
