# IPAMS State asset masters and workflow catalogue

## 1. Status and scope

This is the proposed inception baseline for a Panchayat asset-management implementation beginning in North Bastar Kanker and designed to expand across Chhattisgarh. It defines master-data governance, a broad State/Panchayat asset taxonomy, supporting masters, workflow templates, and measurable outcomes.

It is not yet an official State master. The Department must reconcile it with LGD, eGramSwaraj Asset Directory, Gram Manchitra, finance/ERP records, scheme and works registers, stock/property registers, authorized GIS layers, and physical survey results. Official websites were unreachable from this environment, so this document does not invent current LGD codes/counts, API routes, accounting heads, delegation thresholds, retention periods, or SLA targets.

## 2. Master governance

Every entry requires a stable string `code`, approved English and Hindi names, definition and exclusions, optional parent, `DRAFT`/`ACTIVE`/`RETIRED` status, effective dates, source system/code, immutable published version, display order, sensitivity, and complete creator/reviewer/approver audit metadata. Used entries are retired, never deleted. Publishing requires validation, an active-version diff, impact counts, named approval, and an effective date.

| Master                                | Proposed authority                 | IPAMS responsibility                                               |
| ------------------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| Administrative/local-government units | LGD or approved Government master  | Import, validate, version, map, and retain changes.                |
| Offices and departments               | Department/district administration | Maintain effective hierarchy and jurisdiction linkage.             |
| Scheme/funding/accounting codes       | Finance, scheme, and ERP owners    | Store approved references; never infer accounting treatment.       |
| Asset classes and attributes          | Department asset/data owner        | Version catalogue, rules, mappings, and evidence requirements.     |
| Boundaries and layers                 | Authorized GIS custodian           | Retain source, CRS, accuracy, version, validity, and restrictions. |
| Identity and users                    | Approved IdP and Department owner  | Map identities to effective role/jurisdiction assignments.         |
| Workflows and delegation              | Department policy owner            | Execute only approved, effective, versioned rules.                 |
| Records and retention                 | Records/security/legal owner       | Enforce approved document access and retention policy.             |

## 3. Organisation and jurisdiction masters

Jurisdiction types are configurable because State structures differ: `COUNTRY`, `STATE`, `DISTRICT`, `ZILLA_PARISHAD`, `SUBDISTRICT`, `BLOCK`, `PANCHAYAT_SAMITI`/Janpad Panchayat, `GRAM_PANCHAYAT`, `VILLAGE`, optional `WARD`, and optional `HABITATION`. Block and subdistrict must not be assumed equivalent. Each unit retains official source/code, parent, type, names, validity, status, version, and predecessor/successor relationships.

Organization types include State department/directorate, district administration, Zilla Parishad, block/Janpad office, Gram Panchayat office, line-department office, engineering division/subdivision/section, store/warehouse, maintenance unit, project unit, and an approved committee/body. An organization is the tenant/security boundary; a jurisdiction is an official administrative unit; a location is a physical placement. These remain separate and are linked explicitly.

## 4. State and Panchayat asset-class master

### 4.1 Classification rules

- Classify by primary service purpose and physical nature, not only by funding scheme.
- Keep scheme, work, accounting class, owner, custodian, jurisdiction, and physical location as separate dimensions.
- Represent a compound facility as a parent asset with maintainable components.
- Support movable (`M`), immovable (`I`), network/linear (`N`), quantity stock (`Q`), digital/intangible, and composite assets.
- Treat land information as an operational reference, not an authoritative cadastral/title determination.
- Keep works in progress outside official commissioned-asset totals.
- Beneficiary-owned property must never be presented as Panchayat-owned.

### 4.2 Proposed classes and subclasses

| Code | Class                                                 | Proposed subclasses                                                                                                                                                                                                            |
| ---- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A01  | Land, sites, and rights (`I`)                         | Owned site/parcel; leased/licensed site; right-of-way/easement reference; common/open land; market/fair ground; cremation/burial ground; playground; plantation/community-forest site reference.                               |
| A02  | Administrative and civic buildings (`I`)              | Gram Panchayat Bhawan; block/Janpad office; Zilla Parishad office; community hall; citizen-service facility; records/store building; inspection/rest facility; staff quarter; multipurpose shelter; other civic building.      |
| A03  | Education and child development (`I/M`)               | School building; classroom; school WASH; cooking shed; hostel; Anganwadi; library; laboratory/workshop; furniture/equipment set; digital classroom equipment.                                                                  |
| A04  | Health, nutrition, and welfare (`I/M`)                | Sub-health/health facility; dispensary; nutrition store; public-health equipment; cold-chain equipment; accessibility asset; welfare/day-care/shelter; first-response equipment.                                               |
| A05  | Drinking-water source and treatment (`I/M`)           | Borewell/tubewell; dug well; spring/intake; surface intake; infiltration structure; hand pump; pump house; treatment plant; chlorination unit; quality-test equipment.                                                         |
| A06  | Water storage and distribution (`I/N/M`)              | Overhead reservoir; ground reservoir/sump; storage tank; rising main; distribution pipeline; standpost/tap; valve/chamber; meter; tanker; rainwater harvesting.                                                                |
| A07  | Sanitation and waste (`I/N/M`)                        | Community/public toilet; institutional toilet; faecal-sludge facility; sewer/drain; soak/leach pit; treatment facility; segregation/MRF shed; compost unit; collection vehicle/cart; bin; plastic-waste unit; greywater asset. |
| A08  | Roads, bridges, and transport (`N/I/M`)               | Internal road; approach road; footpath; culvert/causeway; bridge/footbridge; retaining wall; bus shelter; parking/stand; road signage/furniture; maintenance equipment.                                                        |
| A09  | Drainage, flood, and conservation (`N/I`)             | Storm/open drain; closed drain; check/stop dam; percolation tank; pond/water body; contour trench/bund; gully/gabion work; watershed work; embankment; recharge structure.                                                     |
| A10  | Irrigation and agriculture support (`I/N/M`)          | Canal/channel; lift irrigation; irrigation pump; field channel/outlet; community machinery; input store; processing floor; nursery; conservation equipment; custom-hiring centre.                                              |
| A11  | Electricity, renewable energy, and lighting (`I/N/M`) | Streetlight; high mast; solar streetlight; solar system; inverter/battery; generator; scoped distribution equipment; electrical installation; charging point; energy meter/control panel.                                      |
| A12  | Markets, livelihoods, and production (`I/M`)          | Rural haat/market; stall/kiosk; warehouse/godown; cold room; processing/packaging unit; SHG centre; common facility centre; weighing/grading equipment; vending zone; tourism/craft facility.                                  |
| A13  | Digital, communication, and office equipment (`M`)    | Desktop; laptop/tablet/field device; server/storage; printer/scanner/copier; router/switch/Wi-Fi; approved attendance device; projector/display; CCTV; UPS; telephone/radio; approved software entitlement.                    |
| A14  | Furniture, fixtures, and office assets (`M/Q`)        | Desk/table; chair/bench; cabinet/rack; meeting furniture; fan/cooler/AC; appliance; kitchen equipment; fire equipment; signage; tools/minor equipment.                                                                         |
| A15  | Vehicles and mobile equipment (`M`)                   | Car/jeep; utility vehicle; tractor; trailer; motorcycle; bicycle/e-cycle; emergency vehicle; waste vehicle; tanker; construction equipment; boat/special vehicle.                                                              |
| A16  | Parks, sports, culture, and amenities (`I/M`)         | Park/garden; sports facility; gym equipment; stage/cultural facility; memorial; seating/shelter; public display; drinking-water amenity; ghat; fencing/gate.                                                                   |
| A17  | Natural-resource/environmental assets (`I/M`)         | Plantation/green belt; nursery; pasture development; soil-conservation structure; conservation-site reference; environmental monitoring equipment; remediation facility; watch/fire structure.                                 |
| A18  | Public safety and disaster management (`I/M/Q`)       | Emergency shelter; rescue boat/equipment; emergency communications; first-aid stock; fire-fighting equipment; temporary shelter stock; warning/PA system; relief warehouse; protective stock.                                  |
| A19  | Housing and community infrastructure (`I`)            | Panchayat-owned quarter/housing; authorized beneficiary-record reference; group/common infrastructure; housing-site infrastructure; community shelter.                                                                         |
| A20  | Livestock, fisheries, and veterinary (`I/M`)          | Veterinary facility; livestock shelter; fodder bank; livestock equipment; fish pond; hatchery/fisheries infrastructure; applicable market/slaughter facility.                                                                  |
| A21  | Stores, spares, and consumables (`Q`)                 | Maintenance spare; water/sanitation consumable; office consumable; fuel/lubricant; PPE/safety stock; electrical/plumbing material; relief material.                                                                            |
| A22  | Proposed and works in progress (`I/N`)                | Approved-not-started; in progress; substantially complete; completed pending registration; suspended/abandoned. On handover, link the resulting commissioned asset rather than duplicate it.                                   |

### 4.3 Required per-subclass configuration

Each subclass configures asset nature, permitted point/line/polygon geometry, identifier type, approved finance mapping, mandatory/conditional attributes, lifecycle evidence, duplicate keys, condition/utilization checklist version, maintenance applicability, verification frequency/risk, sensitive-location policy, permitted transfer/disposal paths, and approved service-life reference where applicable.

## 5. Supporting master catalogue

### 5.1 Independent status dimensions

| Dimension     | Proposed values                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registration  | `DRAFT`, `SUBMITTED`, `RETURNED`, `APPROVED`, `PUBLISHED`, `CORRECTION_PENDING`, `REJECTED`                                                                                                                   |
| Lifecycle     | `PLANNED`, `UNDER_CONSTRUCTION`, `COMMISSIONED`, `IN_SERVICE`, `OUT_OF_SERVICE`, `UNDER_MAINTENANCE`, `TRANSFER_IN_PROGRESS`, `CONDEMNATION_PROPOSED`, `DISPOSAL_IN_PROGRESS`, `RETIRED`, `LOST`, `DESTROYED` |
| Condition     | `NEW`, `GOOD`, `FAIR`, `POOR`, `UNSERVICEABLE`, `NOT_ASSESSED`                                                                                                                                                |
| Functionality | `FULLY_FUNCTIONAL`, `PARTIALLY_FUNCTIONAL`, `NON_FUNCTIONAL`, `NOT_APPLICABLE`, `NOT_ASSESSED`                                                                                                                |
| Utilization   | `FULL`, `PARTIAL`, `IDLE`, `OVER_CAPACITY`, `NOT_APPLICABLE`, `NOT_ASSESSED`                                                                                                                                  |
| Verification  | `NOT_DUE`, `DUE`, `ASSIGNED`, `VISIT_DRAFT`, `SUBMITTED`, `VERIFIED`, `MISMATCH`, `NOT_FOUND`, `INACCESSIBLE`, `EXCLUDED`, `RECONCILED`                                                                       |

### 5.2 Ownership, custody, and location

- Ownership: Panchayat, State department, Central Government, joint, leased/licensed, community body, donor/other approved owner.
- Custodian: organization, office, employee/team member, committee, vendor, or temporary recipient.
- Possession basis: owned, leased, licensed, entrusted, transfer pending acceptance, or approved other.
- Location: campus, building, floor, room, store, outdoor site, road segment, network, mobile/in transit, remote installation.
- Movement: permanent transfer, temporary loan, repair, inspection, event/use, emergency deployment, or return.
- Evidence: handover memo, receipt, authorization, photo, checklist, and policy-approved document.

### 5.3 Acquisition, funding, works, and finance

- Acquisition/creation: purchase, civil work, scheme-created, transfer-in, grant/donation, self-constructed, legacy opening balance, lease/licence, approved other.
- Funding: Central, State, Finance Commission, district, Panchayat own source, convergence, CSR/donation, loan, approved other.
- Versioned scheme/programme master with official code, department, shares, validity, and source.
- Work master with sanctioned ID, estimate, sanctions, agency/vendor, milestones, completion, and handover.
- Finance-owned accounting class, cost centre, capitalization/ledger reference, financial year, and depreciation/book-value mapping.

Scheme names must not be hardcoded as asset classes.

### 5.4 Documents and evidence

Document classes include title/lease, administrative and technical sanctions, estimates/drawings/specifications, purchase order/contract/invoice, measurement reference, completion/commissioning/handover/utilization certificate, warranty/AMC/CMC, inspection/test/calibration, approved geo-media, transfer/receipt, valuation/finance, maintenance/parts, committee/condemnation/auction/e-waste/destruction, incident/loss/insurance/legal, and approved correspondence.

Each class defines MIME allowlist, maximum size/count, malware scan, access classification, retention-policy reference, lifecycle-state requirement, and supersession rule.

### 5.5 GIS

Geometry type, CRS, source, capture method/device, horizontal accuracy, confidence, verification status, layer/version/custodian/licence, validity, containment result, exception reason, and sensitive-location generalization.

### 5.6 Maintenance

Type (preventive, corrective, condition-based, inspection, calibration, statutory, emergency, warranty, AMC/CMC), priority, work state, service/checklist, recurrence and tolerance, skill/team/vendor/contract, labour/parts/other cost, failure/cause/remedy, downtime, repeat-failure window, condition-after, next due, and evidence rules.

### 5.7 Verification and findings

Campaign type, visit result, discrepancy (identity/category/ownership/custody/location/geometry/condition/functionality/utilization/quantity/value/document/duplicate/missing/unexpected), risk, evidence checklist, finding decision, exclusion, escalation, and closure reason.

### 5.8 Disposal

Trigger, technical recommendation, method (auction, sale, transfer, trade-in, recycling/e-waste, destruction, write-off, return, approved other), authority/committee, assessed/reserve value basis, proceeds, recipient, posting reference, mandatory evidence, and closure/retirement reason.

### 5.9 Other controlled masters

Role/capability; notification template/channel/language; task priority/escalation/SLA calendar; vendor/service provider; import template/schema/version; report definition and sensitive fields; API/integration mapping and system of record; incident severity; and reason codes for return, rejection, cancellation, correction, override, reopening, and exclusion.

## 6. Workflow catalogue

### 6.1 Engine rules

Published definitions are immutable and include entity, version/effective dates, states, transitions, authorized capability and jurisdiction level, required fields/evidence/reason, separation of duties, timers, notification keys, and allowlisted side effects. Running cases retain their version. The server rejects invalid-state, out-of-scope, stale-version, unauthorized/self-approval, incomplete, expired-delegation, and duplicate commands. Metadata never executes arbitrary code, SQL, or unrestricted expressions.

| ID   | Workflow                        | Main path and essential controls                                                                                                                                                                |
| ---- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WF01 | Asset registration              | `DRAFT -> SUBMITTED -> REVIEW -> APPROVED -> PUBLISHED`; return/reject/withdraw; duplicate checks; subclass evidence; maker-checker; only published assets enter official totals.               |
| WF02 | Master-data change              | `DRAFT_CHANGE -> VALIDATED -> IMPACT_REVIEW -> APPROVED -> SCHEDULED -> ACTIVE -> RETIRED`; diff, usage impact, successor, effective date, rollback.                                            |
| WF03 | LGD/jurisdiction import         | `UPLOADED -> PARSED -> VALIDATED -> DIFF_READY -> REVIEWED -> APPROVED -> ACTIVE`; checksum, dry-run, cycles/orphans, ambiguous change reconciliation, no automatic activation.                 |
| WF04 | Legacy asset import             | `UPLOADED -> PROFILED -> MAPPED -> VALIDATED -> DRY_RUN -> RECONCILIATION -> APPROVED -> IMPORTED -> VERIFIED -> CLOSED`; row lineage, totals, duplicates, idempotency, rollback.               |
| WF05 | Document intake                 | `UPLOADED -> SCAN_PENDING -> SCANNING -> AVAILABLE`; quarantine/reject/supersede/retention hold; no access before scan and authorization.                                                       |
| WF06 | Custody assignment              | `REQUESTED -> APPROVED -> ACCEPTED -> ACTIVE -> RELEASED`; preserve prior assignment and effective dates.                                                                                       |
| WF07 | Permanent/inter-office transfer | `DRAFT -> REQUESTED -> SOURCE_REVIEW -> DESTINATION_REVIEW -> APPROVED -> RELEASED -> RECEIVED -> COMPLETED`; no concurrent active transfer; custody changes atomically; ownership is separate. |
| WF08 | Temporary movement              | `REQUESTED -> APPROVED -> CHECKED_OUT -> DUE -> RETURNED -> INSPECTED -> CLOSED`; due/overdue, condition-out/in, damage/loss finding.                                                           |
| WF09 | Condition assessment            | `DRAFT -> SUBMITTED -> REVIEWED -> ACCEPTED`; exceptions may open maintenance/finding/disposal; accepted assessment is append-only.                                                             |
| WF10 | Maintenance request/work order  | `REQUESTED -> TRIAGED -> APPROVED -> ASSIGNED -> ACCEPTED -> IN_PROGRESS -> COMPLETED -> REVIEW -> CLOSED`; warranty/AMC, thresholds, parts/cost, downtime, evidence, next due, reopen.         |
| WF11 | Preventive plan                 | `DRAFT -> REVIEWED -> APPROVED -> ACTIVE -> PAUSED -> RETIRED`; recurrence versions do not rewrite generated work.                                                                              |
| WF12 | Verification campaign           | `DRAFT -> SCOPE_REVIEW -> APPROVED -> PUBLISHED -> IN_PROGRESS -> RECONCILIATION -> CLOSURE_REVIEW -> CLOSED`; frozen population, exclusions, assignments, closure blockers.                    |
| WF13 | Field visit/sync                | `ASSIGNED -> VISIT_DRAFT -> QUEUED -> SUBMITTED -> VALIDATED -> ACCEPTED`; offline state is explicit; device/server times, accuracy, schema version, idempotency, duplicate/conflict handling.  |
| WF14 | Finding/reconciliation          | `OPEN -> TRIAGED -> ASSIGNED -> REVIEW -> DECIDED -> CORRECTION_PENDING -> RESOLVED -> CLOSED`; corrections use the normal master/asset workflow, never direct overwrite.                       |
| WF15 | Valuation/revaluation           | `DRAFT -> SUBMITTED -> FINANCE_REVIEW -> APPROVED -> RECORDED`; decimal amount, basis/date/source/evidence; append-only history.                                                                |
| WF16 | Ownership change                | `REQUESTED -> DOCUMENT_REVIEW -> LEGAL/FINANCE_REVIEW -> APPROVED -> EFFECTIVE`; separate from custody and highly audited.                                                                      |
| WF17 | Disposal/condemnation           | `DRAFT_CASE -> TECHNICAL_ASSESSMENT -> RECOMMENDED -> COMMITTEE_REVIEW -> APPROVED -> DISPOSITION -> EVIDENCE_REVIEW -> CLOSED`; retirement only on successful closure.                         |
| WF18 | Loss/theft/damage/disaster      | `REPORTED -> VALIDATED -> INVESTIGATION -> ACTION_APPROVED -> RECOVERY_OR_WRITE_OFF -> CLOSED`; incident, custody, legal/insurance references, recovery and financial linkage.                  |
| WF19 | Access/role assignment          | `REQUESTED -> OWNER_REVIEW -> SECURITY_REVIEW -> APPROVED -> ACTIVE -> EXPIRED/REVOKED`; least privilege, jurisdiction, effective dates, recertification.                                       |
| WF20 | Export/sensitive report         | `REQUESTED -> POLICY_CHECK -> APPROVAL -> QUEUED -> GENERATED -> AVAILABLE -> EXPIRED`; scope, field allowlist, redaction, purpose, row limit, checksum, access log.                            |
| WF21 | Integration/reconciliation      | `READY -> SENT/RECEIVED -> ACKNOWLEDGED -> APPLIED -> RECONCILED`; bounded retry, mapping queue, duplicate/dead-letter, safe errors, idempotent replay.                                         |
| WF22 | Service incident                | `OPEN -> ACKNOWLEDGED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CONFIRMED -> CLOSED`; severity, clocks, pause/exclusion, escalation, reopen, cause and monthly SLA evidence.                    |

## 7. Roles and approvals

Provisional capability bundles are data-entry operator, Panchayat asset officer, Panchayat approver/Secretary, block/Janpad supervisor, district/Zilla Parishad officer, engineering/technical officer, finance officer, field verifier, GIS/data steward, master-data administrator, identity administrator, auditor, integration operator, and system operator.

Routing can depend on jurisdiction level, asset class/risk, value band, funding source, action, and effective delegation. Thresholds require a policy reference and must not be invented in code. System operators do not automatically receive business-approval rights.

## 8. Outcome measures for inception approval

Every measure needs an owner, numerator, denominator, population, exclusions, unknown treatment, source fields, as-of time, baseline date, target, reporting level, and signatory. Blank is never zero.

| Outcome             | Proposed measure                                                                      | Definition required                                                           |
| ------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Coverage            | In-scope assets loaded with unique Asset ID, by class and jurisdiction.               | Source population, WIP/retired treatment, duplicates, denominator owner.      |
| Coverage            | Assets with jurisdiction, owner, custodian, and applicable location.                  | Not-applicable and unassigned treatment.                                      |
| Data quality        | Mandatory-field completeness by subclass and workflow state.                          | Versioned rules; unknown separate from not applicable.                        |
| Data quality        | Code/date/geometry/identifier/value/reference validity.                               | Each validation and warning/blocking severity.                                |
| Data quality        | Duplicate candidates, confirmed duplicates, resolved links/merges, unresolved ageing. | Matching rules and merge authority.                                           |
| Migration           | Loaded, rejected, unmatched, transformed, reconciled rows and control totals.         | Source checksum, totals, sign-off, and rejection closure.                     |
| Verification        | Accepted verifications divided by due in-scope population.                            | Cycle, evidence, exclusions, and cut-off.                                     |
| Verification        | Found, mismatch, not found, inaccessible, unexpected, pending, excluded, reconciled.  | Reconcile frozen population plus unexpected records.                          |
| Evidence            | Visits meeting geo/photo/checklist quality.                                           | Category/risk rules and GPS threshold.                                        |
| Governance          | Pending, returned, rejected, escalated, overdue tasks by age/jurisdiction.            | Business clock, pause rules, owner.                                           |
| Governance          | Material changes with complete actor/time/reason/approval/version/audit.              | Material actions and completeness test.                                       |
| Maintenance         | Preventive work due, on-time, late, missed; valid next due.                           | Tolerance window and plan population.                                         |
| Maintenance         | Corrective open/closed, response age, repair time, downtime, repeat failure, cost.    | State clock, cost source, repeat window.                                      |
| Condition           | Condition/functionality distribution and unresolved poor/unserviceable backlog.       | Accepted latest-assessment rule.                                              |
| Utilization         | Idle, partial, full, and over-capacity where applicable.                              | Subclass measure and period.                                                  |
| Finance             | Approved, unknown, stale values and ERP reconciliation difference.                    | Basis, effective date, materiality, authority.                                |
| Transfer            | Request-to-receipt time, overdue receipt, disputes, custody exceptions.               | Completion point and business clock.                                          |
| Disposal            | Open/aged cases, approved-not-disposed, proceeds reconciliation, evidence.            | Authority, legal evidence, retirement point.                                  |
| GIS                 | Required/valid/outside/low-accuracy/stale/sensitive geometries.                       | Boundary source, tolerance, CRS, sensitivity.                                 |
| Adoption            | Role-relevant completed work, abandoned drafts, support demand.                       | Avoid vanity logins and unapproved monitoring.                                |
| Service             | Availability by agreed component/window.                                              | Monitoring source, maintenance/exclusions, responsibility; no assumed target. |
| Service             | Incident acknowledgement/resolution, ageing, reopen, monthly SLA.                     | Contract severities, clocks, targets, credits.                                |
| Security/operations | Access review, vulnerability age, backup/restore, integration backlog.                | Cadence, evidence, owner, escalation.                                         |

Dashboards show filters, numerator/denominator, exclusions, unknowns, and as-of time. Official totals exclude drafts unless clearly labelled. No target is committed until the Department approves baseline, target, method, owner, and cadence.

## 9. Required reports

Inventory; registration ageing; mandatory-field/validity exceptions; duplicate and migration reconciliation; identifier history; document completeness/quarantine; condition/functionality/utilization; verification campaigns/findings; custody/transfers; maintenance/downtime/repeat repair/cost; valuation and ERP reconciliation; lifecycle; disposal/proceeds; GIS quality; tasks/escalations; master changes; audit completeness; import/export/integration health; service/incident/backup/security; and training/adoption/data freshness.

## 10. Inception approval sequence

1. Inventory source systems, authorities, overlap, APIs/files, and data rights.
2. Validate LGD hierarchy, office mappings, jurisdiction changes, and boundaries.
3. Review every asset class/subclass with line departments; add, merge, exclude, and assign ownership/accounting treatment.
4. Approve attributes, evidence, geometry, identifiers, duplicate rules, and sensitivity.
5. Approve workflow states, roles, separation of duties, thresholds, timers, reasons, delegation, and escalation.
6. Profile migration sources and approve mappings, reconciliation, exceptions, and signatories.
7. Define every outcome numerator, denominator, exclusion, baseline, target, owner, and cadence.
8. Validate field devices, QR, GPS, camera, offline storage/sync/conflicts, and support.
9. Approve hosting, security, retention, audit, integrations, monitoring, backup/DR, and SLA boundary.
10. Publish master version 1, workflow versions, traceability matrix, metric dictionary, and change control.

## 11. Master readiness gate

A master can be seeded only when its owner/source, codes, bilingual names, hierarchy, definitions/exclusions, duplicate/effective-date/retirement/successor rules, external mappings, form/workflow/report impacts, sensitivity, migration mapping, edge cases, acceptance tests, version, effective date, and approver are recorded. Until then these entries remain proposal data and must not be presented as official State masters.
