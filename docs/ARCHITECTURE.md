# AccessPath AI — modular monolith layout

```
src/
  app/                      # Next.js App Router (UI + thin route handlers)
    api/health/             # Deployment / readiness probe
  components/ui/            # Accessible shadcn-style primitives
  lib/
    db/                     # Drizzle schema, client, seed
    env.ts                  # Zod environment validation (server-only)
    utils.ts
  modules/                  # Domain logic (keep out of React components)
    resources/              # Verified provider / program directory
    intakes/                # Guided needs capture
    plans/                  # Structured navigation plans
    cases/                  # Partner case management
    consent/                # Explicit referral consent
    ai/                     # Vertex AI Gemini (stub in Phase 0)
```

## Rules

1. **Factual claims** about providers, schemes, costs, and requirements
   come only from curated `resources` / `assistance_programs` rows.
2. **Gemini** (Phase 2) runs server-side via Vertex AI; the UI never
   receives credentials.
3. **Deterministic code** filters resources, enforces consent, and
   manages case status transitions.
4. **Hackathon seed data** is fictional and labelled as such.
