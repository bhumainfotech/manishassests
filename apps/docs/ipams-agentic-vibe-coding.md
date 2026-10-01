# IPAMS agentic vibe-coding handbook and implementation ledger

## 1. Purpose

This is the operational source of truth for AI-assisted development of the
Integrated Panchayat Asset Management System (IPAMS) in this Shelf.nu
repository. It exists so each enhancement follows one architecture, reuses
existing code, remains secure across organization and jurisdiction boundaries,
and updates database, backend, frontend, tests, operations, and documentation
together.

This handbook does not replace `AGENTS.md` or domain-specific repository guides.
The order of authority is:

1. system, developer, and explicit user instructions;
2. the nearest applicable `AGENTS.md`;
3. repository rules under `.claude/rules`;
4. this handbook and linked IPAMS specifications;
5. existing code patterns and general conventions.

When instructions conflict, stop, record the conflict, and follow the higher
authority. Do not silently choose the most convenient interpretation.

## 2. Mandatory reading map

Before an IPAMS change, read:

- root `AGENTS.md` and `CLAUDE.md`;
- this handbook;
- `apps/docs/ipams-master-data-and-workflows.md`;
- `apps/docs/accessibility.md`;
- `apps/docs/handling-errors.md`;
- `apps/docs/select-all-pattern.md` for cross-page bulk work;
- `apps/docs/asset-import.md` for imports;
- `apps/docs/scanner-drawer-development.md` for scanning/field work;
- advanced-index guides for data-heavy registers;
- SSO, deployment, security, and database guides when relevant;
- applicable `.claude/rules/*.md` files;
- existing implementations in the same domain before introducing a pattern.

## 3. Product and technology decisions

### 3.1 Keep the current stack

IPAMS is part of this monorepo:

| Layer           | Required implementation                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Web application | `apps/webapp`, React 19, React Router 7, TypeScript                                             |
| Server requests | React Router loaders/actions and existing Hono server                                           |
| Business logic  | `apps/webapp/app/modules/<domain>` services and policies                                        |
| UI              | Existing shared Shelf components, Tailwind, Radix primitives                                    |
| State           | URL parameters for shareable route state; Jotai only for genuinely cross-component client state |
| Validation      | Zod at request/form/import boundaries                                                           |
| Persistence     | PostgreSQL and Prisma in `packages/database`                                                    |
| Authorization   | `packages/permissions` vocabulary/resolver plus server scope policies                           |
| Tests           | Vitest, route tests under `apps/webapp/test/routes-tests`, Playwright for critical journeys     |
| Package manager | pnpm and Turborepo                                                                              |

Do not introduce Angular, a second frontend, a separate ad-hoc API stack, a
parallel component library, or direct browser-to-database/integration access.

### 3.2 Preserve three different boundaries

Never conflate:

1. **Organization:** Shelf tenant and primary isolation boundary.
2. **Jurisdiction:** effective government administrative scope such as State,
   district, block, or Gram Panchayat.
3. **Operational location:** physical placement such as campus, building,
   room, road segment, water network, or mobile/in-transit location.

Every server read and mutation must first resolve organization from the
authenticated context. Jurisdiction is then intersected with effective user
assignments. User-submitted organization or jurisdiction IDs never grant scope.

## 4. Repository placement

```text
apps/webapp/app/
  components/<existing-domain>/       reusable/domain UI
  components/ipams/                   IPAMS compositions only
  modules/jurisdiction/               jurisdiction contracts and services
  modules/ipams/                      shared IPAMS types/configuration only
  modules/<business-domain>/          registration, verification, transfer, etc.
  routes/_layout+/ipams.*             authenticated route modules
apps/webapp/test/routes-tests/        IPAMS route tests mirroring route paths
apps/webapp/test/factories/           reusable IPAMS test data
apps/webapp/test/mocks/               external/boundary mocks with `// why:`
packages/database/prisma/             schema and additive migrations
packages/permissions/src/             canonical entity/action permissions
apps/docs/                             architecture, workflow, runbook, ledger
```

Rules:

- Route modules coordinate HTTP concerns; business rules belong in services or
  pure domain modules.
- Do not put tests under `app/routes`.
- Do not import `*.server` modules into client-rendered exports.
- Search existing shared components before creating new base components.
- Keep DTOs/contracts distinct from Prisma entities when public behavior may
  evolve independently.

## 5. Definition of an end-to-end slice

A persisted feature is end to end only when all applicable rows are complete:

| Layer          | Required evidence                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| Requirement    | Stable requirement ID, persona, outcome, acceptance examples, unknowns                                         |
| Data ownership | Authoritative source/system of record and field-level ownership                                                |
| Database       | Additive Prisma change, reviewed SQL migration, constraints, indexes, provenance, effective dates              |
| Domain         | Invariants, legal state transitions, version/concurrency behavior, idempotency                                 |
| Authorization  | Permission entity/actions, organization scope, jurisdiction scope, related-ID validation, negative tests       |
| Service        | Bounded queries, explicit commands, transaction, standardized errors, audit/outbox behavior                    |
| Route/API      | Validated input/output, loader/action or versioned API, stable error responses, no sensitive over-fetch        |
| Frontend       | Navigation, responsive page, accessible forms/tables, status/consequence text, all applicable non-happy states |
| Audit          | Actor, time, organization, jurisdiction, entity, action, reason, trace, safe before/after or event payload     |
| Testing        | Pure domain, service, permission, route, component, migration, and E2E coverage as applicable                  |
| Operations     | Migration/backfill, feature flag, monitoring, rollback, support/runbook, data reconciliation                   |
| Documentation  | Data dictionary, workflow, API, operator notes, traceability, ledger, screenshots                              |

If only a static array and page exist, call it a prototype catalogue. If a
table and CRUD screen exist without approval/version/audit policy, call it a
draft administration slice. Do not call either a complete production module.

## 6. Slice design protocol

Before coding, add or update a slice record using this template:

```markdown
### SLICE-<phase>-<number>: <name>

- Requirement IDs:
- User/persona:
- Organization and jurisdiction boundary:
- System of record:
- Starting and resulting states:
- Fields and sensitive data:
- Permission entity/actions:
- Related IDs requiring scope validation:
- Audit events:
- Idempotency/concurrency:
- Loading/empty/error/offline/conflict states:
- Migration/backfill/rollback:
- Tests and acceptance evidence:
- Unknowns requiring owner approval:
```

Then implement in this order:

1. Confirm existing patterns and decisions.
2. Write invariants and acceptance tests.
3. Add schema/migration and database constraints.
4. Add permission vocabulary and resolver rules.
5. Add validation and pure domain behavior.
6. Add scoped query and command services.
7. Add loader/action or API contracts.
8. Build UI from existing components.
9. Add audit/event/outbox behavior.
10. Add tests across changed boundaries.
11. Run migration and reconciliation checks.
12. Update this ledger, traceability, docs, and screenshots.

## 7. Database and migration rules

- `packages/database` owns every schema and migration.
- Prefer additive migrations: add nullable structure, backfill, verify, then
  tighten constraints in a later migration.
- Never rename or repurpose a production column without an explicit compatibility
  and rollback plan.
- Core reportable fields stay relational; JSON requires a schema version and is
  reserved for bounded metadata/snapshots.
- Use decimal types for authoritative money, not JavaScript/SQL floating point.
- Store external government codes as strings to preserve leading zeroes.
- Every tenant-owned table includes `organizationId` and query-supporting indexes.
- Jurisdiction-owned data includes explicit scope and effective dates.
- Enforce uniqueness and invariants in the database when PostgreSQL can express
  them; application preflight exists to return friendly errors, not replace a
  constraint.
- Referenced master entries are retired, not deleted.
- Published master/workflow versions and accepted historical transactions are
  immutable. Correction creates a linked superseding record.
- Every migration defines data impact, forward deployment, verification, and
  rollback/recovery behavior.
- Never run `db:reset` against shared or production data.

## 8. Server, workflow, and integration rules

### 8.1 Explicit commands

Use named commands such as `submitAssetRegistration`, `approveTransfer`, or
`closeVerificationCampaign`. Never accept an unrestricted status field update.

Each command must:

1. resolve authenticated organization and effective jurisdiction scope;
2. load the record inside that scope;
3. validate related IDs inside the same boundaries;
4. validate current state, permission, separation of duties, required evidence,
   record version, and idempotency key;
5. perform state, history, task, and outbox changes in one transaction;
6. emit a safe audit event with a trace ID;
7. return the authoritative resulting state/version.

### 8.2 Workflow metadata

Workflow configuration contains only allowlisted states, predicates, required
field keys, roles/capabilities, timers, notification keys, and side effects.
Never execute SQL, JavaScript, TypeScript, or unrestricted expressions stored in
workflow or form metadata. Running instances remain pinned to their published
workflow version.

### 8.3 External integrations

IPAMS remains the operational asset register unless the Department approves a
different field-level system of record. Each connector requires owner,
authorization, data mapping, direction, cadence, test environment, credential
handling, idempotency, retry classification, reconciliation, retention, audit,
monitoring, and exit plan. Use outbox/inbox patterns. Do not expose secrets or
raw sensitive payloads in the browser or operator errors.

## 9. Frontend rules

- The server schema and authorization remain authoritative.
- URL parameters own search, filters, sorting, pagination, tabs, and shareable
  map state.
- Use server-side pagination and bounded queries. Never load a district register
  into the browser only to filter it.
- Follow `ALL_SELECTED_KEY` for all-filtered bulk operations.
- Preserve filters and user-entered drafts across navigation and conflicts.
- Every consequential confirmation names the record, effect, required reason,
  and resulting workflow state.
- Status uses text and icons, never color alone.
- Clearly distinguish draft, queued-on-device, submitted, accepted, published,
  and official states.
- Every page implements loading, empty, no-results, validation,
  permission-denied, stale/conflict, and server-error states where applicable.
- Field workflows also implement connectivity, device-save, queued, retry,
  conflict, and server-receipt states.
- Meet the repository WCAG 2.1 AA baseline and support keyboard, focus,
  screen-reader announcements, reflow, reduced motion, and accessible map/chart
  alternatives.
- Use message keys for English/Hindi readiness and `Intl` with Indian locale and
  approved time zone/currency rules.

## 10. Testing rules

| Test level         | Minimum IPAMS coverage                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Pure/domain        | State transitions, hierarchy, effective dates, recurrence, money, metric math              |
| Validation         | Valid/invalid inputs, optional normalization, Unicode, bounds, malicious input             |
| Permission         | Each role/capability, organization escape, jurisdiction escape, expired delegation         |
| Service            | Related-ID scope, transactions, duplicate/concurrency/idempotency behavior, audit emission |
| Database/migration | Constraints, indexes, forward migration, backfill, verification, recovery                  |
| Route              | Loader/action auth, parsing, success, domain rejection, not found, conflict, safe response |
| Component          | Observable behavior, accessibility, responsive layout, non-happy states                    |
| End to end         | Critical journey across real route/service/database boundaries                             |
| Operations         | Import replay, job retry, backup restore, integration pause/reconcile, rollback            |

Use factories. Mock only external network calls, device/browser APIs, time,
feature flags, or genuinely heavy boundaries. Every mock requires a `// why:`
comment. Do not claim route coverage when only a Zod schema test exists.

Required commands:

```bash
pnpm webapp:test:changed
pnpm turbo typecheck
pnpm turbo lint
pnpm webapp:validate
```

Run focused tests while iterating. Do not run `webapp:validate:full` unless
asked. Record pre-existing failures separately from regressions introduced by
the slice.

## 11. Security and government-data guardrails

- Do not invent or silently default LGD codes, authoritative names, asset
  counts, approval thresholds, accounting treatment, depreciation, retention,
  evidence, GPS accuracy, SLA, or delegation policy.
- Do not store production data, credentials, Aadhaar data, or real evidence in
  fixtures/source control.
- Collect the minimum personal data and classify every new field.
- Keep files private; validate MIME/size/checksum, scan for malware, authorize
  each download, and avoid public object URLs.
- Treat GIS as decision support, not authoritative land/title evidence.
- Sensitive locations require field-level access and map generalization.
- Exports require scope, field allowlist, redaction, limits, expiry, and audit.
- Offline data requires an approved threat model, bounded encrypted storage,
  safe sign-out/device clear, idempotent sync, and conflict handling.
- Analytics/chat/map/notification vendors remain disabled until approved.

## 12. Phase and milestone plan

### Phase 0: inception and decisions

**Exit:** approved glossary, source register, asset taxonomy, jurisdiction model,
permission matrix, workflow diagrams, outcome definitions, hosting/security
decisions, and migration inventory.

### Phase 1: platform and jurisdiction foundation

**Slices:** feature isolation; jurisdiction persistence; hierarchy invariants;
organization-jurisdiction mapping; user assignments; import staging; audit
events; government shell.

**Exit:** scoped users can only read/write permitted jurisdiction data and every
change is versioned/audited.

### Phase 2: LGD and master-data management

**Slices:** file fingerprint; parser adapters; staging validation; hierarchy
diff; reconciliation; approval/activation; versioned asset/supporting masters;
Department sign-off export.

**Exit:** approved source totals reconcile and published masters are immutable.

### Phase 3: authoritative asset register

**Slices:** registration persistence; category attributes; documents;
identifiers; duplicate detection; submit/review/return/approve/publish;
corrections; legacy import; asset dossier and official register.

**Exit:** only published assets enter official totals and all transitions are
scoped, audited, and recoverable.

### Phase 4: physical verification and field operations

**Slices:** campaign population; assignments; mobile visit; QR/search; GPS/photo;
findings; reconciliation; closure; offline store/queue/sync/conflicts.

**Exit:** campaign totals reconcile and device-only drafts are never reported as
submitted.

### Phase 5: custody and transfer

**Slices:** baseline custody migration; assignment; permanent transfer;
temporary movement; release/receipt; disputes; atomic history.

### Phase 6: condition, maintenance, and valuation

**Slices:** append-only assessment; plans; work orders; parts/cost/downtime;
completion; next due; valuation history; finance reconciliation.

### Phase 7: lifecycle and disposal

**Slices:** unified lifecycle projection; incidents; technical assessment;
committee approval; disposition evidence; retirement.

### Phase 8: tasks, workflows, reports, GIS, and administration

**Slices:** consolidated inbox; workflow publishing; outcome metrics; reports;
exports; GIS; audit search; integration health; settings.

### Phase 9: migration and production readiness

**Slices:** migration rehearsals; reconciliation; performance; security/VAPT;
accessibility; backup/restore; DR; Hindi/content QA; training/UAT; runbooks.

### Phase 10: controlled rollout and support

**Slices:** Panchayat pilot; parallel comparison; block rollout; stabilization;
monthly service evidence; handover and 24-month support governance.

## 13. Requirement traceability

Status values: `NOT_STARTED`, `FOUNDATION`, `IN_PROGRESS`, `BLOCKED`, `DONE`.
`DONE` requires the end-to-end definition in section 5.

| ID  | Module                        | Status      | Current evidence                                             | Next required slice                                              |
| --- | ----------------------------- | ----------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| M1  | Organization and jurisdiction | IN_PROGRESS | Jurisdiction schema, draft create/list UI, permission entity | hierarchy invariants, mappings, assignments, LGD import/approval |
| M2  | Asset master and register     | FOUNDATION  | Existing Shelf assets plus proposed IPAMS catalogue          | registration aggregate and official publication                  |
| M3  | Classification                | FOUNDATION  | Static 22-class proposal                                     | versioned database masters and category attributes               |
| M4  | Identification and geotagging | FOUNDATION  | Existing QR/barcode/location capabilities                    | identifier history and governed geometry                         |
| M5  | Documents and records         | FOUNDATION  | Existing uploads/images                                      | private versioned document/evidence aggregate                    |
| M6  | Custody, ownership, transfer  | FOUNDATION  | Existing direct custody                                      | ownership history and approved transfer cases                    |
| M7  | Condition and utilization     | NOT_STARTED | Requirements only                                            | append-only assessments and checklists                           |
| M8  | Maintenance and service       | NOT_STARTED | Reminders are reusable                                       | maintenance plans and work orders                                |
| M9  | Physical verification         | FOUNDATION  | Existing audit/scanner capabilities                          | campaign bridge, visits, findings, reconciliation, offline       |
| M10 | Valuation and finance         | FOUNDATION  | Existing mutable asset value                                 | decimal append-only valuation and ERP mapping                    |
| M11 | Asset lifecycle               | FOUNDATION  | Existing activity events                                     | governed lifecycle projection                                    |
| M12 | Disposal and retirement       | NOT_STARTED | Requirements only                                            | disposal case and retirement transaction                         |
| M13 | GIS and mapping               | FOUNDATION  | Existing location map                                        | geometry model, layers, boundaries, quality                      |
| M14 | Workflow and tasks            | FOUNDATION  | Static workflow templates                                    | versioned engine, instances, task inbox                          |
| M15 | Audit and compliance          | FOUNDATION  | Existing activity framework                                  | protected material-change audit ledger/search                    |
| M16 | MIS and analytics             | FOUNDATION  | Existing report components                                   | IPAMS metric dictionary, queries, snapshots, exports             |
| M17 | Integration and APIs          | NOT_STARTED | Architecture requirements only                               | outbox/inbox and first approved connector                        |

## 14. Implementation ledger

Keep newest entry first. Update this table in the same commit as code.

| Date       | Commit/PR                  | Slice                | Completed                                                                                           | Known limitations / next work                                                            |
| ---------- | -------------------------- | -------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 2026-10-01 | current change             | M1 draft editing     | Scoped draft detail/edit page, optimistic update, hierarchy validation and field-level audit events | Jurisdiction-assignment policy and route integration tests remain                        |
| 2026-10-01 | maker-checker              | M1 maker-checker     | Submission/review attribution and application/database separation-of-duty controls                  | Edit command, jurisdiction-assignment policy, route/service integration tests remain     |
| 2026-10-01 | workflow commands          | M1 governed workflow | Paginated register; submit, return, activate and retire commands; optimistic versioning and audit   | Edit command, independent approver assignment, route/service integration tests remain    |
| 2026-10-01 | hierarchy hardening        | M1 hierarchy guard   | Application and database parent guards, effective-date checks, atomic creation audit, date capture  | State-transition commands, pagination, route/service integration tests remain            |
| 2026-10-01 | current handbook           | Governance           | Agent rules, architecture, E2E definition, phases, traceability, ledger                             | Begin hierarchy hardening slice                                                          |
| 2026-09-30 | jurisdiction master change | M1 foundation        | Prisma jurisdiction/import models, migration, permission entity, validation, scoped list/create UI  | No LGD parser, activation, mappings, assignments, audit, route/service integration tests |
| 2026-09-30 | master catalogue change    | M2/M3/M14 foundation | Proposed 22 classes, 22 workflow templates, searchable protected catalogue                          | Static proposal, not persistent/versioned/approved                                       |

## 15. Next approved slices

### SLICE-1-02: jurisdiction hierarchy hardening

- Requirement IDs: M1, M15
- Persona: master-data administrator and independent approver
- Boundary: authenticated organization plus effective jurisdiction root
- System of record: Department-approved jurisdiction master/LGD snapshot
- Work: same-organization parent constraint, self/cycle/type validation,
  effective-date rules, pagination, edit/submit/review/activate/retire commands,
  audit events, service and route tests
- Exit: invalid hierarchy cannot be stored through application or database paths
- Progress: hierarchy invariants, pagination, effective dates, optimistic
  versioning, draft editing, field-level audit, maker-checker, and lifecycle
  commands are implemented. Jurisdiction-assignment policy and route integration
  tests remain.

### SLICE-1-03: organization and user jurisdiction assignments

- Requirement IDs: M1, M14, M15
- Work: organization roots, user assignments, effective delegation, scope resolver,
  related-ID guard, negative tenant/jurisdiction tests, access review UI
- Exit: all IPAMS queries can consume one tested scope policy

### SLICE-2-01: LGD staged import

- Requirement IDs: M1, M17
- Work: upload, checksum, staging rows, adapter, validation, dry run, diff,
  downloadable errors, review, approval, activation, reconciliation, audit
- Exit: repeat import is idempotent and activated totals reconcile to approved
  source evidence

### SLICE-2-02: versioned asset masters

- Requirement IDs: M2, M3, M14, M15
- Work: definitions, immutable versions, entries, attributes/evidence rules,
  draft proposal migration, diff/impact, publish/retire, UI, tests
- Exit: application reads an approved active version while history remains stable

## 16. Change summary template

Every IPAMS PR description includes:

```markdown
## Requirement and slice

- IDs:
- User outcome:
- Explicit non-goals:

## Architecture

- Existing patterns reused:
- Schema/migration:
- Authorization and jurisdiction:
- Commands/state transitions:
- Audit/events/integrations:

## UX

- Routes/components:
- Loading/empty/error/conflict/offline states:
- Accessibility/localization:
- Screenshots:

## Data and rollout

- Source of truth:
- Migration/backfill/reconciliation:
- Feature flag/rollback:
- Monitoring/runbook:

## Testing

- Focused tests:
- Validation pipeline:
- Environment or pre-existing limitations:

## Ledger

- Traceability rows updated:
- Implementation ledger updated:
- Next slice:
```

## 17. Completion and knowledge rules

At the end of every change:

1. Update affected M1-M17 status only when evidence supports it.
2. Add a dated ledger entry with exact delivered behavior and limitations.
3. Record schema, route, permission, workflow, event, report, import, and runbook
   changes in their owning documentation.
4. Record decisions with owner, evidence, date, and impact. Never bury them only
   in chat or commit history.
5. Keep the next slice small enough to review and deploy independently.
6. Leave the repository clean, commit with Conventional Commits, and attach the
   PR summary and test evidence.

The ledger is a navigation aid, not a substitute for Git, tests, migrations,
source documentation, or Department approval evidence.
