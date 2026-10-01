# IPAMS changes are complete vertical slices

Apply this rule to every IPAMS, jurisdiction, government master-data, workflow,
verification, transfer, maintenance, valuation, disposal, GIS, reporting, and
integration change.

1. Read `AGENTS.md`, `apps/docs/ipams-agentic-vibe-coding.md`, and the relevant
   repository guides before editing.
2. Extend Shelf's React Router, service, Prisma, permissions, error, event,
   testing, and UI patterns. Do not create a parallel application or duplicate
   shared primitives.
3. State the requirement ID, persona, jurisdiction boundary, source of truth,
   workflow transition, sensitive data, audit event, and acceptance evidence.
4. Treat organization tenancy and administrative jurisdiction as separate
   boundaries. Derive both from authenticated server context. Validate every
   user-supplied related ID inside both boundaries.
5. For persisted behavior, include the schema and migration, service/query,
   explicit command, server permission, route loader/action or API, UI states,
   audit/event behavior, and meaningful tests. If a layer is intentionally
   absent, document why and do not call the feature end to end.
6. Never implement state changes as arbitrary status updates. Use named
   commands, validate current state and record version, transact all effects,
   and make retryable commands idempotent.
7. Published masters, accepted assessments, valuations, lifecycle events, and
   audit records are append-only/versioned. Referenced master values are
   retired, not deleted.
8. Do not invent LGD codes, government policy, approval thresholds, SLA values,
   accounting rules, retention periods, or authoritative totals. Keep unknowns
   explicit and proposed data visibly marked.
9. Include loading, empty, no-results, validation, permission-denied, stale,
   conflict, offline/retry where applicable, and server-error behavior.
10. Update the implementation ledger and traceability tables in
    `apps/docs/ipams-agentic-vibe-coding.md` in the same commit.
11. Run focused tests while developing and `pnpm webapp:validate` before a
    substantive commit. Record unrelated/environment failures honestly.
12. Add screenshots for perceptible UI changes when the environment can render
    the authenticated application.
