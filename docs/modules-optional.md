# Optional & Integration Modules

## Two-Person Integrity

Optional module — activated per tenant via `Settings.two_person_integrity_enabled`. When disabled, the feature is hidden entirely from the UI.

Ensures that critical operations cannot be performed by a single person. Both persons must actively participate for the operation to be considered valid. Distinct from peer review — both persons act together, not sequentially.

**Applicable operations:** evidence destruction, sealed envelope opening, access to high-classification evidence, sensitive custody transfers.

```
TwoPersonOperation:
  id              (UUID, PK)
  -- polymorphic: which entity this operation applies to
  table_name      (VARCHAR)
  record_uuid     (UUID)
  operation_type  (ENUM: ACCESS · DESTRUCTION · UNSEALING · TRANSFER · OTHER)
  initiated_by    (UUID FK → User — first person)
  confirmed_by    (UUID FK → User — second person, must differ from initiated_by)
  initiated_at    (TIMESTAMP)
  confirmed_at    (TIMESTAMP, nullable)
  status          (ENUM: PENDING_CONFIRMATION · COMPLETED · CANCELLED)
  notes           (TEXT, nullable)
  -- audit fields
```

- `initiated_by ≠ confirmed_by` enforced at application level
- No confirmation within expected timeframe → `PendingIssue WARNING`. Never blocking.

---

## OSINT Integration

Optional module — activated per tenant via `Settings.osint_enabled`. When disabled, the feature is hidden entirely from the UI.

Active integration with external OSINT APIs. Results are stored and not re-queried unless explicitly requested — avoids redundant API calls and maintains audit trail.

### OSINTSource (catalog)

```
OSINTSource:
  id                (UUID, PK)
  name              (VARCHAR — Shodan · VirusTotal · WHOIS · HaveIBeenPwned...)
  source_type       (ENUM: IP · DOMAIN · EMAIL · HASH · USERNAME · PHONE · OTHER)
  endpoint          (URL)
  api_key_encrypted (TEXT, nullable — AES-256 encrypted at application level)
  enabled           (BOOLEAN — disable a source without removing it)
  -- audit fields
```

### OSINTQuery (query result)

```
OSINTQuery:
  id               (UUID, PK)
  osint_source_id  (UUID FK → OSINTSource)
  query_value      (VARCHAR — queried value: IP, domain, email, hash...)
  query_type       (ENUM: IP · DOMAIN · EMAIL · HASH · USERNAME · PHONE · OTHER)
  result           (ENUM: FOUND · NOT_FOUND · ERROR)
  detail           (JSONB — raw API response)
  queried_at       (TIMESTAMP)
  queried_by       (UUID FK → User)
  -- polymorphic: linked entity
  table_name       (VARCHAR — "case" · "evidence" · "forensic_artifact"...)
  record_uuid      (UUID)
  -- audit fields
```

---

## Police Database Queries

Optional module — activated per tenant via `Settings.police_db_query_enabled`. When disabled, the feature is hidden entirely from the UI.

Records consultations made against official police databases (Interpol, Europol, national DNA/fingerprint/vehicle registries...). Technical integration with closed networks (I-24/7, SIENA) is out of scope — this module logs that the query was made and its outcome. Official response documents are attached via the `Document` model.

```
PoliceDatabaseQuery:
  id               (UUID, PK)
  database         (ENUM: INTERPOL · EUROPOL · DNA · FINGERPRINT ·
                          VEHICLE · NATIONAL_ID · OTHER)
  query_type       (VARCHAR — what was queried: person, vehicle, object...)
  query_reference  (VARCHAR — official query reference number)
  result_summary   (TEXT — summary of the result)
  queried_at       (TIMESTAMP)
  queried_by       (UUID FK → User)
  -- polymorphic: linked entity
  table_name       (VARCHAR)
  record_uuid      (UUID)
  -- audit fields
```

---

## External API & Webhooks

Public REST API for external system integration. Versioned from the start (`/api/v1/`). Documented automatically via Swagger/OpenAPI.

### ApiKey
- name, key_hash (never stored in plain text — shown once on creation)
- tenant_id, scopes (JSONB), rate_limit (requests/minute)
- expires_at (nullable), last_used_at, status (ACTIVE · REVOKED · EXPIRED)

**Available scopes:**
`cases:read` · `evidence:read` · `hashes:read` · `reports:read` · `findings:read`

### ApiRequestLog
Audit log of all external API usage:
- api_key_id, endpoint, method, status_code, requested_at, response_ms

### Webhook
Push notifications to external systems on specific events:
- api_key_id, url, events (JSONB — ["case.status_changed", "report.delivered", "evidence.acquired", "analysis.completed"...])
- secret (for payload authenticity verification)
- status: ACTIVE · PAUSED · FAILED

### WebhookDelivery
Delivery log with automatic retry strategy:
- event_type, payload (JSONB — minimal data, external system queries API for details)
- status: PENDING · DELIVERED · FAILED · RETRYING
- attempts, next_retry_at, response_code

**Retry strategy:** 1min → 5min → 30min → FAILED + PendingIssue WARNING

---

## SLA (Service Level Agreements)

Configurable response time agreements per case priority and/or requesting unit. Never blocking — violations generate PendingIssue warnings only.

### SLATemplate
- name, priority (URGENT · HIGH · MEDIUM · LOW · null=all)
- unit_id (FK → Unit, nullable — null=default for all units)
- hours_to_acquisition, hours_to_analysis, hours_to_report
- behaviour: INFO · WARNING · CONFIRM

On Case creation → system auto-selects applicable SLATemplate and generates Deadlines accordingly. Unit-specific template takes precedence over default.

Coordinator dashboard shows cases ordered by remaining SLA time — at-risk cases highlighted.

---

## Offline Mode & Synchronization

**Technology:** PWA (Progressive Web App) — same Angular app configured for offline use via Service Workers + IndexedDB local storage.

UUIDs as PKs on all tables ensure zero collision risk when records are created simultaneously on offline devices and at base.

### Three operation scenarios

**Offline:** Case exported to tablet before field operation. All changes queued locally. Synced when back at base.

**Online:** Works directly against server. Base sees field progress in real time.

**Hybrid:** Starts offline, auto-syncs when connectivity detected. Seamlessly switches back to offline if connection lost.

### DeviceSession
Tracks each field device session:
- device_id (UUID), device_name, case_id (exported case)
- exported_at, mode (OFFLINE · ONLINE · HYBRID)
- last_sync_at, status (ACTIVE · SYNCING · COMPLETED · CONFLICT)
- sync_policy_photos (ALL · THUMBNAILS_ONLY · DEFER — overrides Settings default)
- sync_policy_documents (ALL · DEFER)
- sync_queue (pending records count)

### SyncQueue
Local queue of pending changes per device:
- table_name, record_uuid, operation (CREATE · UPDATE)
- payload (JSONB), created_at, size_bytes
- is_heavy (BOOLEAN — full photo, large document)
- deferred (BOOLEAN — awaiting full sync)
- status (PENDING · SYNCED · CONFLICT)

### Bandwidth-aware sync policy (Settings)
- `sync_policy_photos`: ALL · THUMBNAILS_ONLY · DEFER
- `sync_policy_documents`: ALL · DEFER
- `sync_policy_threshold`: minimum bandwidth (Kbps) for full sync

Heavy items (full photos, documents) deferred in low-bandwidth mode. Thumbnails always synced immediately. Deferred items auto-sync at base or via manual trigger from maintenance panel.

### Maintenance module
- Active DeviceSession monitoring (online/offline/pending)
- Sync history per device
- Manual sync trigger
- Conflict resolution panel (show both versions for manual resolution)
- Deferred items management
- System health (DB, JasperReports Server, disk space)
- Tenant management
- Settings configuration per tenant

---

## SOP Compliance

Optional module — activated per tenant via `Settings.sop_compliance_enabled` or automatically when the `ISO_17025` compliance framework is active. When disabled, the feature is hidden entirely from the UI.

Tracks adherence to Standard Operating Procedures (SOPs) per Analysis. Required for laboratory accreditation (ISO 17025, ENFSI, ASCLD...).

### SOP (catalog)

```
SOP:
  id                (UUID, PK)
  code              (VARCHAR — internal SOP reference code)
  title             (VARCHAR)
  version           (VARCHAR)
  evidence_type_id  (UUID FK → EvidenceType, nullable — applicable evidence type)
  analysis_type_id  (UUID FK → AnalysisType, nullable — applicable analysis type)
  document_id       (UUID FK → Document — PDF of the procedure)
  effective_from    (DATE)
  effective_until   (DATE, nullable)
  active            (BOOLEAN)
  -- audit fields
```

### SOPCompliance (per Analysis)

```
SOPCompliance:
  id                  (UUID, PK)
  analysis_id         (UUID FK → Analysis)
  sop_id              (UUID FK → SOP)
  status              (ENUM: FOLLOWED · DEVIATED · NOT_APPLICABLE)
  deviation_reason    (TEXT, nullable — required when status = DEVIATED)
  verified_by         (UUID FK → User)
  verified_at         (TIMESTAMP)
  -- audit fields
```

When an Analysis has an applicable SOP and no SOPCompliance is recorded → `PendingIssue WARNING`. Never blocking.

---

## Regulatory Compliance Frameworks

Configurable compliance profiles per tenant. Activating a framework enables specific validations, mandatory fields, and workflows required by that regulation. All frameworks are optional — only those applicable to the tenant's jurisdiction and accreditations are activated.

### ComplianceFramework (catalog)

```
ComplianceFramework:
  id           (UUID, PK)
  code         (ENUM: ISO_27037 · ISO_27041 · ISO_27042 · ISO_27043 ·
                       ISO_17025 · ACPO · SWGDE · EU_GDPR · EU_2016_680 · OTHER)
  name         (VARCHAR)
  description  (TEXT)
```

### TenantComplianceFramework (active frameworks per tenant)

```
TenantComplianceFramework:
  tenant_id     (tenant identifier)
  framework_id  (UUID FK → ComplianceFramework)
  active_since  (DATE)
  notes         (TEXT, nullable)
```

### Framework-specific model additions

The following fields are nullable by default and become required (enforced as `PendingIssue WARNING`) when the corresponding framework is active:

**ISO_27037 — Digital evidence collection and preservation**

Additional fields on `Acquisition`:
```
  write_blocker_used   (BOOLEAN, nullable → WARNING if null when ISO_27037 active)
  write_blocker_model  (VARCHAR, nullable)
```

Additional `EventValidationRule`: `HASH_VERIFIED_BEFORE_ANALYSIS` — activated automatically when ISO_27037 is in the tenant compliance profile.

**ACPO — ACPO Principles (widely referenced internationally)**

When active, accessing original evidence without a documented write blocker generates a `PendingIssue WARNING`. Analyst competence on original evidence access is surfaced as a WARNING (never blocking).

**EU_2016_680 — EU Law Enforcement Directive (distinct from GDPR)**

Additional fields on `Case`:
```
  retention_review_date  (DATE, nullable → auto-generated if EU_2016_680 active)
  retention_category     (ENUM: STANDARD · EXTENDED · PERMANENT, nullable)
```

Additional field on `Person`:
```
  data_verified  (BOOLEAN, nullable → WARNING if null when EU_2016_680 active)
```
Distinguishes verified facts about a person from unverified hypotheses, as required by the Directive.

**ISO_17025 — Laboratory competence**

Activates the SOP Compliance module automatically (see SOP Compliance section).

### Compliance summary

| Framework | Scope |
|---|---|
| **ISO/IEC 27037** | Digital evidence identification, collection, acquisition, preservation |
| **ISO/IEC 27041** | Adequacy of incident investigative methods |
| **ISO/IEC 27042** | Analysis and interpretation of digital evidence |
| **ISO/IEC 27043** | Incident investigation principles and processes |
| **ISO/IEC 17025** | Laboratory testing competence — activates SOP module |
| **ACPO** | 4 principles for digital evidence (UK, widely adopted internationally) |
| **SWGDE** | Scientific Working Group for Digital Evidence guidelines (US) |
| **EU GDPR** | Personal data protection (EU 2016/679) |
| **EU 2016/680** | Personal data processing by law enforcement authorities |

---

## Search

Three search modes:

**Global search**
Single field searching across multiple entities simultaneously — case number, evidence code, serial number, hash, person name... Implemented via PostgreSQL full-text search (`tsvector` + GIN index).

**Entity search**
Advanced combinable filters per entity (date ranges, status, type, tool, unit...). Standard indexed queries, no additional model structure required.

**Hash search**
- Exact match lookup via indexed hash fields on Evidence and Acquisition
- **Automatic duplicate detection:** when a new Evidence is created, the system automatically checks if that hash already exists in any other case
- If found → alert to the user + option to automatically create a `Relation` between the two Evidence records
- Applies to both MD5 and SHA256

```
New Evidence SHA256: a3f9...
  → System searches hash across all cases
  → Found in Case 23-047, Evidence 2304701010 1
  → Alert: "This hash already exists in another case"
  → Option: auto-create Relation between both Evidence records
```

---

## Statistics & Dashboard

**Dashboard:** global view (per-user dashboards in a future phase).

**Statistic categories:**

| Category | Examples |
|---|---|
| **Volume** | Cases per month/year, evidence by type, acquisitions by tool |
| **Time** | Avg time seized→acquired, acquired→analyzed, open→closed |
| **Status** | Current status distribution, trends over time |
| **Workload** | Pending evidence, ongoing analyses, active external lab submissions |
| **Compliance** | Deadlines met vs overdue, non-compliance rate |

Statistics are computed via real-time PostgreSQL queries. Materialized views added where performance requires it.

**Custom statistics (`CustomStatistic`):**
- Entity type, filters (JSONB), aggregation (COUNT · AVG · SUM · MIN · MAX)
- Group by field, chart type (BAR · PIE · LINE · TABLE · NUMBER)
- Visibility: PRIVATE · SHARED
- Created by (FK → User)

---

## Link Analysis Graph

Visual interactive graph showing connections between persons, cases, exhibits and evidence. No additional model required — built from existing relations (Relation, EventPerson, CaseContact, hash duplicates).

**Library:** Cytoscape.js (Angular integration) — designed for network/forensic analysis.

**Node types:** Case · Person · Exhibit · Evidence · Unit · Court

**Edge sources:**
- `Relation` table — explicit relationships
- `EventPerson` — person linked to event
- Hash duplicates — automatically detected cross-case evidence matches
- `CaseContact` — case contact persons

---

## Timeline View

Visual chronological view of all activity on a Case. No additional model required — built from existing timestamps across Events, Exhibits, Evidence, Acquisitions, Analysis, ChainOfCustody, LabReception, SpecialTransfer and ExpertReport.

Useful for understanding case progression at a glance and for court presentations.
