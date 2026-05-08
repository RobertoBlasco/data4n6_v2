# data4n6 — Forensic Evidence Management System

International forensic evidence management platform.

**Stack:** Spring Boot 3.5 · Angular (frontend) · PostgreSQL 17 · JasperReports Server Community · n8n · MinIO  
**Language:** English (codebase, UI, field names)  
**Primary key:** UUID on all tables  
**Build:** Maven · Java 21

---

## Development Environment

### Prerequisites

- Java 21 (via SDKMAN: `sdk install java 21.0.7-tem`)
- Maven (via SDKMAN: `sdk install maven`)
- Docker + Docker Compose

### Project structure

```
data4n6/
├── README.md
├── TODO.md
└── data4n6-backend/          ← Spring Boot backend
    ├── pom.xml
    ├── docker-compose.yml
    └── src/
        ├── main/
        │   ├── java/com/data4n6/
        │   │   ├── config/           — Spring configuration (JPA, Web, multi-tenancy)
        │   │   ├── common/
        │   │   │   ├── entity/       — BaseEntity (UUID PK, audit fields, soft delete)
        │   │   │   └── exception/    — GlobalExceptionHandler, ResourceNotFoundException
        │   │   ├── tenant/           — Multi-tenancy (TenantContext, Interceptor, Resolver)
        │   │   ├── cases/            — Case entity, repository, service, controller, DTOs
        │   │   ├── events/
        │   │   ├── exhibits/
        │   │   ├── evidence/
        │   │   ├── acquisitions/
        │   │   ├── analyses/
        │   │   ├── catalog/
        │   │   ├── documents/
        │   │   └── persons/
        │   └── resources/
        │       ├── application.properties
        │       └── db/migration/
        │           ├── common/       — migrations for shared catalog schema
        │           └── tenant/       — migrations for tenant schemas
        └── test/
```

### Start the development environment

```bash
# 1. Start Docker services (PostgreSQL, MinIO, n8n)
cd data4n6-backend
docker compose up -d

# 2. Start Spring Boot (from data4n6-backend folder)
source "$HOME/.sdkman/bin/sdkman-init.sh"
mvn spring-boot:run
```

### Local services

| Service | URL | Credentials |
|---|---|---|
| Spring Boot API | `http://localhost:8080` | — |
| Swagger UI | `http://localhost:8080/swagger-ui.html` | — |
| PostgreSQL | `localhost:5432` db: `data4n6` | data4n6 / data4n6 |
| MinIO S3 API | `http://localhost:9000` | data4n6 / data4n6secret |
| MinIO Console | `http://localhost:9001` | data4n6 / data4n6secret |
| n8n | `http://localhost:5678` | admin / admin |

---

## Backend Architecture

### Multi-tenancy (schema-per-tenant)

Each tenant has its own PostgreSQL schema. The tenant is identified via the `X-Tenant-ID` HTTP header on every request.

```
PostgreSQL (database: data4n6)
├── common          — shared catalogs (Tool, EvidenceType, ComplianceFramework...)
├── tenant_default  — default development tenant
└── tenant_xxx      — one schema per production tenant
```

`search_path` per connection: `tenant_xxx, common` — `public` schema is never used.

**Key classes:**

| Class | Role |
|---|---|
| `TenantContext` | ThreadLocal storing the current tenant per request |
| `TenantInterceptor` | Reads `X-Tenant-ID` header and sets TenantContext |
| `TenantIdentifierResolver` | Provides tenant identifier to Hibernate |
| `SchemaMultiTenantConnectionProvider` | Switches PostgreSQL schema on each connection |

### Base entity

All entities extend `BaseEntity`:

```java
// Fields inherited by all entities
UUID        id          // PK — mapped to {table}_id in DB via @AttributeOverride
Instant     createdAt
Instant     updatedAt
String      createdBy
String      updatedBy
Instant     deletedAt   // null = active, non-null = soft deleted
```

### Database migrations (Flyway)

Migrations run automatically on startup. Two locations:
- `db/migration/tenant/` — applied to the tenant schema (per-tenant tables)
- `db/migration/common/` — applied to the shared `common` schema

| Version | Description |
|---|---|
| V1 | Create schemas (`common`, `tenant_default`) |
| V2 | Create `cases` and `classification_level` (initial naming — superseded) |
| V3 | Recreate tables with correct naming convention |

---

## Database Naming Conventions

All names in **snake_case**, **English**, no mixed languages.

### Table prefixes

| Prefix | Type | Examples |
|---|---|---|
| `t100_` | Main entities | `t100_cases`, `t100_events`, `t100_exhibits` |
| `t200_` | Catalogs | `t200_tools`, `t200_evidence_types`, `t200_classification_level` |
| `t300_` | Relational / polymorphic | `t300_chain_of_custody`, `t300_documents`, `t300_notes` |
| `t900_` | Administration | `t900_api_keys`, `t900_webhooks` |

Tables not fitting these groups → ask before creating.

### Tables and columns

- **Tables:** plural (`t100_cases`, `t200_tools`)
- **Columns:** singular, no table name redundancy (`title` not `case_title`)

### Primary keys

`{table_name}_id` — e.g., `t100_cases` → PK: `t100_cases_id`

In Java: field named `id` in `BaseEntity` + `@AttributeOverride` per entity:
```java
@AttributeOverride(name = "id", column = @Column(name = "t100_cases_id"))
```

### Foreign keys

| Case | Format | Example |
|---|---|---|
| Single FK to a table | same as referenced PK | `t200_classification_level_id` |
| Multiple FKs to same table | `{ref_table}_{suffix}_id` | `t100_users_initiated_id` |
| Self-referential FK | `{table}_{suffix}_id` | `t100_expert_reports_parent_id` |

### Data types

| Type | Convention | Example |
|---|---|---|
| Boolean | `is_`, `has_`, `can_` prefix in DB · field without prefix in Java | DB: `is_active` · Java: `boolean active` (Lombok → `isActive()`) |
| Date only | `_date` suffix | `closed_date`, `birth_date` |
| Timestamp | `_at` suffix | `created_at`, `deleted_at` |

### Constraints and indexes

```sql
-- Primary key
{table}_pkey  (auto-generated)

-- Unique constraints
{table}_{column}_unique      e.g. t100_cases_code_unique

-- Check constraints
{table}_{column}_check       e.g. t100_cases_status_check

-- Indexes
idx_{table}_{column}         e.g. idx_t100_cases_status
```

---

## Data Model

### Main hierarchy

```
Case → Event → Exhibit → Evidence → Acquisition → Analysis
                  └── ChainOfCustody
```

### Entity descriptions

| Entity | Description |
|---|---|
| **Case** | Overall investigation/expedition. Numbered as `YYCCC` (2-digit year + 3-digit sequence, 001–999/year). Optional `classification_level_id` (FK → ClassificationLevel, nullable — access control enforced in the roles phase) |
| **Event** | Forensic action within a case (search warrant, cloud download, lab submission, judicial cloning...) |
| **Exhibit** | Physical seized object (laptop, phone...). Has chain of custody. |
| **Evidence** | Directly analyzable unit (HDD image, USB, SIM, cloud backup, RAM dump...). May or may not have a parent Exhibit. |
| **Acquisition** | Forensic copy made from an Evidence (0..N per Evidence) |
| **Analysis** | Information extraction performed on an Acquisition (0..N per Acquisition) |

---

## Evidence Reference Number

Format: `YYCCCOOEEEVV` (10 characters, no separators)

| Segment | Length | Description |
|---|---|---|
| `YY` | 2 | Year |
| `CCC` | 3 | Case number (001–999) |
| `OO` | 2 | Event number (01–99) |
| `EE` | 2 | Exhibit number (01–99) · `00` = no physical exhibit |
| `VV` | 2 | Evidence number (01–99) |

Examples:
- `2400101 0203` → year 24, case 001, event 01, exhibit 02, evidence 03
- `2400101 0001` → evidence with no physical exhibit (cloud backup, RAM dump...)

---

## QR Codes

Each Evidence and Acquisition gets a QR code:
- **Evidence (original):** `YYCCCOOEEEVV-O`
- **Acquisition (copy):** `YYCCCOOEEEVV-A01`, `YYCCCOOEEEVV-A02`...

QR format is configurable per department via Settings.

---

## Catalog entities

| Entity | Description |
|---|---|
| **Court** | Judicial bodies (courts, prosecutors...) |
| **Unit** | Requesting units/agencies |
| **Person** | People involved (agents, detained, witnesses...) with identity documents |
| **Tool** | Forensic tools catalog (type: ACQUISITION · ANALYSIS · BOTH) |
| **ExternalLab** | External laboratories (name, country, specialization, accreditation) |
| **StorageLocation** | Physical storage locations (building, room, shelf, position) |
| **EvidenceType** | Configurable evidence types — drives the dynamic metadata system |

---

## Event relationships

Each Event links to:
- **0..N Courts** — judicial authorities for that specific action (`EventCourt`)
- **0..N Units** — requesting units for that action (`EventUnit`)
- **0..N Persons** — people involved, with role in junction table (`EventPerson`)
- **location** — field (address, city, coordinates)

Case-level courts and units are aggregated from its Events (no direct Case↔Court or Case↔Unit tables).

Each Case links to:
- **0..N Persons** as contacts, with role in junction table (`CaseContact`)

---

## Exhibit & Evidence — key design decisions

- **Exhibit and Evidence are always separate entities**
- A pendrive → Exhibit (chain of custody of physical object) + Evidence (forensic image)
- A phone → Exhibit + multiple Evidence (internal storage, SIM, SD card)
- SIM/SD inside a phone → Evidence of the phone Exhibit, no own Exhibit
- SIM/SD seized alone → its own Exhibit + Evidence
- Evidence `exhibit_id` is nullable — cloud backups, RAM dumps have no physical Exhibit
- The 1:1 (pendrive) vs 1:N (laptop) distinction is natural, not a special case

---

## Dynamic metadata (Evidence · Acquisition · Analysis)

EvidenceType is the central axis. Admin configures types and fields:

```
EvidenceType
 ├── EvidenceFieldDefinition    → EvidenceFieldValue    (per Evidence)
 ├── AcquisitionType
 │     └── AcquisitionFieldDefinition → AcquisitionFieldValue (per Acquisition)
 └── AnalysisType
       └── AnalysisFieldDefinition    → AnalysisFieldValue    (per Analysis)
```

- AcquisitionType and AnalysisType depend on EvidenceType
- `field_definition_id` is nullable in FieldValue tables to support uncatalogued cases:
  - `field_definition_id` != null → catalogued field
  - `field_definition_id` == null → ad-hoc free field (uses `field_name` directly)
  - Never both at once

---

## Polymorphic tables

These tables follow the `table_name + record_uuid` pattern and can attach to any entity:

| Table | Purpose |
|---|---|
| **Document** | File attachments (warrants, seizure forms, reports, certificates...) |
| **Photo** | Photographs with metadata (taken_at, taken_by, is_relevant, source: MOBILE_UPLOAD · DIRECT_UPLOAD · IMPORTED, file_path, thumbnail_path, is_primary) |
| **Note** | Free-text notes |
| **StatusHistory** | Immutable log of status changes (old_status, new_status, changed_at, changed_by, notes) |
| **Relation** | Relationships between entities at any level (Case↔Case, Evidence↔Evidence, Case↔Evidence...) with relation_type |
| **Deadline** | Deadlines linked to any entity (type, due_date, status: PENDING · FULFILLED · OVERDUE · WAIVED, behaviour: INFO · WARNING · CONFIRM) |
| **EntityTag** | Tags and categories (type: PREDEFINED · FREE, color) — linkable to any entity via table_name + record_uuid |
| **PendingIssue** | Persistent warnings/issues linked to any entity. Lifecycle: OPEN → IN_PROGRESS → RESOLVED. Visible to all analysts, assignable, resolvable with notes. Auto-generated from failed validations. |

---

## Entity statuses

| Entity | Statuses |
|---|---|
| **Case** | `OPEN → PAUSED → FINISHED → CLOSED` |
| **Event** | `PLANNED → IN_PROGRESS → COMPLETED` |
| **Exhibit** | `SEIZED → STORED → RETRIEVED → RETURNED / DESTROYED` |
| **Evidence** | `SEIZED → ACQUIRED → PRELIMINARY_ANALYSIS → FINAL_ANALYSIS` |
| **Acquisition** | `PENDING → IN_PROGRESS → COMPLETED → VERIFIED / FAILED` |
| **Analysis** | `PENDING → IN_PROGRESS → COMPLETED → REPORTED` |

Status transitions are logged in **StatusHistory**.

---

## Chain of Custody

Belongs to **Exhibit**. Implements hash chaining for legal integrity guarantees.

**Actions:** `SEIZED · TRANSFERRED · STORED · RETRIEVED · RETURNED · DESTROYED · VERIFIED`

**Each entry records:**
- Action, who performed it, timestamp
- Origin location → destination location
- Digital signature of transferor and receiver
- `previous_hash` and `record_hash` (hash chaining)
- `source`: `DIGITAL` (created in system) or `PHYSICAL_SCAN` (scanned paper document attached)

**Outputs:**
- Exportable official PDF with digital signatures
- QR code on printed document for digital verification
- Certified timestamp per entry

---

## Integrity & Audit

- **Audit trail:** every entity records created_by, updated_by, created_at, updated_at
- **Soft delete:** nothing is physically deleted — marked with deleted_at
- **Hash chaining (pseudo-blockchain):** applied to both Audit Trail and Chain of Custody
  - Each record has `previous_hash` (hash of previous record) and `record_hash` (hash of data + previous_hash)
  - Any tampering breaks the chain and is detectable
  - System can verify chain integrity at any time

---

## External laboratories

- **ExternalLab:** catalog (name, address, country, contact, specialization, accreditation)
- **LabSubmission:** full-detail record of a submission (occurs at unit, not in field)
  - Links to ExternalLab + Exhibit OR Evidence
  - `type`: `ORIGINAL | COPY`
  - If ORIGINAL → automatically generates `TRANSFERRED` entry in Chain of Custody
  - If COPY → no Chain of Custody impact
  - Sent by, received by, dates (sent, expected return, actual receipt, return)
  - Purpose → FK to purpose catalog (no free text)
  - `status`: `PENDING · IN_TRANSIT · RECEIVED · ANALYSIS_IN_PROGRESS · COMPLETED · RETURNED`

---

## Exhibit physical location

Dual approach (field speed vs office detail):

| Context | Mechanism |
|---|---|
| **Field** (during search, under pressure) | Free text `field_location` ("top drawer of main desk") |
| **Unit** (back at lab, calm) | FK to `StorageLocation` catalog (building, room, shelf, position) |

---

## Evidence & Exhibit Condition

Separate from `status` (workflow position). Tracks physical/logical state:

| Condition | Description |
|---|---|
| `INTACT` | Normal state |
| `DAMAGED` | Damaged — may trigger SpecialTransfer (REPAIR) |
| `UNDER_REPAIR` | Currently being repaired |
| `REPAIRED` | Repaired — returns to normal workflow |
| `IRREPARABLE` | Repair failed — workflow frozen, documented |
| `NOT_APPLICABLE` | Cannot be analyzed (adapter, cable...) |
| `REGISTERED_IN_ERROR` | Incorrectly registered item |

When `NOT_APPLICABLE` or `REGISTERED_IN_ERROR`:
- Excluded from analysis workflow
- Mandatory reason (FK to reason catalog — no free text)
- Record remains in DB (forensic integrity — never deleted)
- Automatic PendingIssue INFO for traceability

When `IRREPARABLE`:
- Status frozen at current value
- SpecialTransfer (REPAIR) documents the repair attempt
- ChainOfCustody entry generated

---

## Knowledge Base

Internal laboratory knowledge base with two components:

### KnowledgeArticle
General procedures, guides and lessons learned:
- title, content (Markdown)
- category: PROCEDURE · GUIDE · LESSON_LEARNED · WORKAROUND · OTHER
- tool_id (FK → Tool, nullable), evidence_type_id (FK → EvidenceType, nullable)
- Tags via EntityTag

### DeviceCompatibility
Tool/device compatibility matrix — critical for mobile forensics where results vary by make, model, OS version and chipset:

- device_make, device_model, os_version, chipset (nullable)
- tool_id (FK → Tool), tool_version
- acquisition_type_id (FK → AcquisitionType)
- result: WORKS · PARTIAL · FAILS · UNKNOWN
- notes (what works, what fails, workarounds)
- verified_at, verified_by

Analysts consult before starting an acquisition. On completing a new acquisition, system suggests contributing the result to the compatibility matrix.

---

## Judicial Authorization

Tracks judicial authorizations per case with full transfer history between courts.

### JudicialAuthorization
- court_id (FK → Court), case_id (FK → Case)
- authorization_number, judge_name
- authorized_at, expires_at (nullable)
- scope_id (FK → AuthorizationScope catalog: FULL_ANALYSIS · COMMUNICATIONS_ONLY · FILES_ONLY · CLOUD_DATA · DELETED_DATA · SPECIFIC_TIMEFRAME · OTHER)
- parent_authorization_id (FK → JudicialAuthorization, nullable — null = original)
- transfer_reason (nullable — JURISDICTION_CHANGE · COURT_TRANSFER · MERGED_CASE · APPEAL · OTHER)

One authorization can cover multiple Events. Referenced from EventCourt:
```
EventCourt
 ├── event_id, court_id
 └── judicial_authorization_id (FK → JudicialAuthorization, nullable)
```

Transfer chain example:
```
Auto 45/2024 · Juzgado Instrucción nº3 Madrid  (parent=null)
  └── Auto 12/2024 · Juzgado Central nº1  (parent=Auto 45/2024, JURISDICTION_CHANGE)
```

---

## Analysis Versioning (Hybrid approach)

Each re-analysis creates a new independent `Analysis` entity with explicit version lineage:

```
Analysis
 ├── parent_analysis_id  (FK → Analysis, nullable — null = original)
 ├── version_number      (INTEGER — 1, 2, 3...)
 └── reanalysis_reason   (nullable — COURT_REQUEST · BUG_FIX · NEW_TECHNIQUE ·
                          ERROR_CORRECTION · TOOL_VERSION_CHANGE ·
                          PROCEDURE_CHANGE · EQUIPMENT_CHANGE · OTHER)
```

Each version is fully independent with its own tool, tool_version, equipment, dynamic fields (procedure details) and results. Differences between versions are traceable via these fields.

Multiple analyses of the same Evidence with the same tool but different acquisition types (UFED logical, physical, cloud) are separate Acquisitions — not re-analyses.

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

## Forensic Equipment

Hardware inventory separate from the `Tool` catalog (software). Tracks physical forensic hardware with maintenance and calibration history.

### ForensicEquipment
- name, type (WRITE_BLOCKER · ACQUISITION_DEVICE · ADAPTER · WORKSTATION · FARADAY_BAG · OTHER)
- make, model, serial_number
- acquired_at, last_calibration, next_calibration
- status: AVAILABLE · IN_USE · MAINTENANCE · DECOMMISSIONED
- storage_location (FK → StorageLocation)

### EquipmentLog
Unified history of maintenance, calibrations and version updates:
- log_type: CALIBRATION · REPAIR · INSPECTION · FIRMWARE_UPDATE · HARDWARE_UPDATE · OTHER
- performed_at, performed_by, result: PASSED · FAILED · PENDING
- new_version (nullable — only for FIRMWARE/HARDWARE_UPDATE)
- next_due_at (nullable — next calibration/inspection due date)

ForensicEquipment.last_calibration and next_calibration updated automatically on each CALIBRATION log entry.

### Linked to Acquisition
```
Acquisition
 ├── tool_id           (FK → Tool — software)
 ├── write_blocker_id  (FK → ForensicEquipment, nullable)
 └── equipment_id      (FK → ForensicEquipment, nullable)
```

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

---

## Core design principles

### Field / Office
The application works in two contexts:
- **Field mode:** minimal required fields, fast entry, tablet/mobile optimized
- **Office mode:** complete detail, full UI

The system indicates which records are pending completion. Many fields are optional at creation and can be enriched later.

### Never block
**No action in the system is ever hard-blocked.** Forensic operations involve unpredictable situations that cannot all be anticipated.

Validation and deadline behaviours use three non-blocking levels:

| Level | Behaviour |
|---|---|
| `INFO` | Subtle notification — something pending, no urgency |
| `WARNING` | Clear alert — requires attention but user proceeds freely |
| `CONFIRM` | Explicit user acknowledgement required — "I understand this is incomplete, proceed anyway" |

This applies globally: Event validations, Deadlines, status transitions — nothing ever prevents the user from continuing.

---

## Settings (configurable per tenant/department)

Configurable preferences stored per tenant. Includes (non-exhaustive):

| Setting | Description |
|---|---|
| `qr_format` | QR code format pattern |
| `evidence_numbering` | Evidence reference number format |
| `deadline_behaviour_default` | Default deadline behaviour (INFORMATIVE · RESTRICTIVE) |
| `thumbnail_width` | Thumbnail width in pixels |
| `thumbnail_height` | Thumbnail height in pixels |
| `hash_lookup_enabled` | Enable/disable external hash database lookup module |
| `sop_compliance_enabled` | Enable/disable SOP compliance tracking module |
| `two_person_integrity_enabled` | Enable/disable two-person integrity requirement module |
| `osint_enabled` | Enable/disable OSINT integration module |
| `police_db_query_enabled` | Enable/disable police database query log module |

Regulatory compliance framework activation is managed via `TenantComplianceFramework` — not via Settings. Activating a framework automatically enables its associated validations and required fields.

---

## Multi-tenancy

**Strategy:** schema-per-tenant in PostgreSQL.

```
PostgreSQL
 ├── common (shared schema)
 │     ├── Tool            (forensic tools catalog)
 │     ├── EvidenceType    (evidence type definitions)
 │     └── LogParserConfig (tool log parsers)
 │
 ├── tenant_lab_a (isolated schema)
 │     └── case, event, exhibit, evidence, acquisition, analysis...
 │
 └── tenant_lab_b (isolated schema)
       └── case, event, exhibit, evidence, acquisition, analysis...
```

- Complete data isolation — tenant data cannot leak between schemas
- Single tenant deployment works identically (just one schema)
- Spring Boot + Hibernate native schema-per-tenant support
- Shared catalogs in `common` schema avoid duplication
- Tenant management is a SYSTEM_ADMIN responsibility
- External Unit access to specific cases is handled via roles/permissions within the tenant schema

---

## Internationalization

- i18n is a **frontend responsibility** (Angular) — JSON translation files per language for static UI texts
- Database data is NOT translated — entered in whatever language the user types
- No translation tables in the database
- Regional formatting (dates, numbers) → application configuration

---

## Evidence Packaging & Seals

Physical packaging of seized Exhibits. All optional — field conditions may prevent completion.

### EvidenceBag (0..1 per Exhibit)
- bag_number, bag_type (PLASTIC · PAPER · ANTISTATIC · FARADAY · BOX · OTHER)
- bagged_at, bagged_by

### Seal (polymorphic — on Exhibit or EvidenceBag)
- seal_number, applied_at, applied_by
- verified_at, verified_by (nullable — filled on lab reception)
- condition: INTACT · BROKEN · DAMAGED

If condition != INTACT on reception → automatic PendingIssue WARNING

---

## Special Transfer

Transfer of an Exhibit or Evidence to another department for repair or special treatment. Separate from `LabSubmission` (forensic analysis) — covers non-forensic interventions.

**`Department`** catalog — internal units or external specialists:
- name, type (INTERNAL · EXTERNAL), specialization, contact

**`SpecialTransfer`**:
- Polymorphic: FK → Exhibit or Evidence
- reason_type: REPAIR · DATA_RECOVERY · SPECIAL_TREATMENT · DECRYPTION · OTHER
- destination: FK → Department
- sent_at, expected_return, returned_at
- sent_by, received_by
- status: PENDING · IN_TRANSIT · IN_TREATMENT · RETURNED
- If original → automatic ChainOfCustody entry (TRANSFERRED)

---

## Lab Reception

Formal handover from field team to laboratory. Triggers Chain of Custody entries automatically.

### LabReception
- event_id (FK → Event), received_by, handed_over_by
- received_at, status: IN_PROGRESS · COMPLETED · WITH_INCIDENTS

### LabReceptionItem (per Exhibit)
- seal_condition: INTACT · BROKEN · DAMAGED · NOT_PRESENT
- exhibit_condition: GOOD · DAMAGED · UNKNOWN
- matches_inventory (BOOLEAN — matches field seizure record)
- storage_location_id (nullable)

**Auto-triggered on each item:**
- ChainOfCustody entry: TRANSFERRED (field → lab)
- Exhibit status: SEIZED → STORED
- PendingIssue WARNING if seal compromised, inventory mismatch or exhibit damaged

Exhibits can arrive without formal LabReception if circumstances prevent it — PendingIssue generated, never blocked.

---

## Work Assignment & Coordinator Panel

System for assigning evidence analysis tasks to analysts and tracking progress in real time. Designed for high-priority situations where multiple analysts work in parallel.

### WorkAssignment (polymorphic)

Assigns any work unit to an analyst:
- table_name + record_uuid (evidence · acquisition · analysis)
- assigned_to, assigned_by (FK → User)
- priority: URGENT · HIGH · MEDIUM · LOW
- due_at (optional), status: PENDING · IN_PROGRESS · COMPLETED

### Coordinator control panel

Dedicated view showing for a Case/Event:
- All Evidence with assignment status and analyst
- Progress per analyst (assigned · completed · in progress)
- Unassigned items highlighted
- Priority indicators
- Open PendingIssues per Evidence

The coordinator role will be defined in the Roles & Profiles phase.

---

## Event Pre-close Validation

Configurable validation rules that must pass before an Event can be marked as `COMPLETED`.

### EventValidationRule

Four-dimensional rule configuration (all nullable — null = applies to all values):

| Dimension | Description |
|---|---|
| `event_type` | Type of event (SEARCH_WARRANT · CLOUD_DOWNLOAD...) |
| `acquisition_type_id` | FK → AcquisitionType |
| `tool_id` | FK → Tool |
| `acquisition_format` | E01 · DD · UFDR · ZIP · XRY... |

**Available rules:**
- `ALL_EVIDENCE_SEIZED` — all Evidence has at least SEIZED status
- `LOG_VERIFIED` — Acquisition has a completed LogImport
- `HASH_VERIFIED` — Acquisition hash has been verified
- `ALL_EVIDENCE_HAVE_PHOTOS` — all Evidence has at least one photo
- `CHAIN_OF_CUSTODY_COMPLETE` — all Exhibits have chain of custody initiated
- `BAG_NUMBERED` — Evidence stored in bag has bag number recorded
- `ACQUISITIONS_VERIFIED` — all Acquisitions in VERIFIED status
- `DOWNLOAD_CONFIRMED` — cloud download confirmed

**Behaviour:** `INFORMATIVE` (warning, allows closing) · `RESTRICTIVE` (blocks closing)

### EventValidationResult

Result of running validations on an Event:
- event_id, rule, passed (BOOLEAN), details (which evidence/exhibits fail), checked_at

Validations can be run at any time during the Event — not only at closing — so the agent knows in real time what is missing.

### Example

```
Acquisition: FTK Imager + DISK_IMAGE + E01
  Rule: tool=FTK · acquisition_type=DISK_IMAGE · format=E01 · rule=LOG_VERIFIED · behaviour=INFORMATIVE
  
  On Event close attempt:
    LogImport status = COMPLETED? 
      YES → ✓ passes
      NO  → ⚠ WARNING "FTK log not verified for Evidence 2400101 0201"
```

---

## Log Import Module

The application does NOT process evidence — external forensic tools do (FTK, UFED, XRY, Autopsy, EnCase, Magnet AXIOM...). The app records and organises their results.

### Architecture

```
FTK log      ──→ ┐
UFED report  ──→ │  LogParserConfig  →  Spring Boot  →  PostgreSQL
XRY export   ──→ │  (per tool/version)
Autopsy XML  ──→ ┘
```

Manual entry always available as fallback for unsupported tools.

### LogParserConfig
Admin-configurable parser per tool version — no code changes when a tool updates its log format.
- tool_id (FK → Tool), tool_version, file_format (TXT · CSV · XML · JSON)
- encoding, delimiter (for CSV), active flag

### LogFieldMapping
Maps each log field to the corresponding database field:
- source_field: column name (CSV), XPath expression (XML), regex (TXT)
- target_entity: ACQUISITION · ANALYSIS · EVIDENCE_FIELD_VALUE...
- target_field: destination field in the database
- transformation (JSONB): date format conversion, value mapping...
- is_required (BOOLEAN)

### LogImport
Tracks each import execution:
- tool_id, file_path, status (PENDING · PROCESSING · COMPLETED · FAILED · PARTIAL)
- target (polymorphic → Acquisition or Analysis)
- records_imported, import_log (JSONB — errors, warnings, unmapped fields)
- Preview before confirmation — user validates before writing to DB

### Import flow
```
1. Upload log file → system detects tool and selects active LogParserConfig
2. Apply LogFieldMapping field by field
3. Preview results to user
4. Confirm → write to database
5. LogImport records result
```

When a tool releases a new version with different log format:
→ Admin creates new LogParserConfig for the new version
→ Adjusts LogFieldMapping as needed
→ Activates new config — no code changes required

---

## Reporting

**Platform:** JasperReports Server Community (separate BI server, AGPL license)

**Architecture:**
```
Angular → Spring Boot → PostgreSQL
    │            │
    └────────────┴──→ JasperReports Server Community
                           └── PostgreSQL (datasource)
```

**Integration:**
- JasperReports Server REST API consumed by Spring Boot for on-demand report generation
- Angular can redirect users directly to JasperReports portal for ad-hoc reports
- Scheduled reports (periodic email delivery)
- Report caching for heavy reports
- Docker image available for community deployment
- `.jrxml` report templates stored in the repository

**Report types:**
- Expert Report (pericial) — multi-section with Evidence sub-reports
- Chain of Custody PDF — official format with digital signatures
- Evidence listing per case
- Integrity verification report (hash chain validation)
- Progress report — auto-generated case status summary (see Progress Reports)
- Statistics and charts
- Custom reports via JasperReports ad-hoc designer

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

## Person

```
Person
 ├── name, surnames
 ├── person_type  (AGENT · CIVILIAN · JUDICIAL_OFFICER · LAWYER · FORENSIC_TECHNICIAN...)
 └── PersonDocument (1..N)
       ├── document_type  (DNI · PASSPORT · NIE · DRIVING_LICENSE...)
       └── document_number
```

Contextual roles in junction tables:
- `EventPerson.role`: DETAINED · INTERVENING_AGENT · WITNESS · JUDICIAL_SECRETARY...
- `CaseContact.role`: CASE_OFFICER · PROSECUTOR · LEAD_INVESTIGATOR...

---

## Case Relations (merge / split / related)

Tracks formal relationships between cases. No data is moved or duplicated — Events, Exhibits, Evidence and all entities remain in their original case. Only the relationship is recorded.

```
CaseRelation:
  id              (UUID, PK)
  case_id_a       (UUID FK → Case)
  case_id_b       (UUID FK → Case)
  relation_type   (ENUM: MERGED_INTO · SPLIT_FROM · RELATED)
  reason          (TEXT)
  created_at      (TIMESTAMP)
  created_by      (UUID FK → User)
  -- audit fields
```

- `MERGED_INTO` — case_id_a is merged into case_id_b. case_id_a transitions to MERGED status (read-only, visible in history, not active)
- `SPLIT_FROM` — case_id_b originates from case_id_a (new independent case derived from an existing one)
- `RELATED` — generic link between thematically connected cases, no formal operation

A merged case retains all its data and history — it remains fully queryable but generates no new activity.

---

## Evidence Correlation

Links Evidence records to each other — within the same case or across different cases. Complements hash duplicate detection (which is automatic) with analyst-established semantic relationships.

```
EvidenceRelation:
  id              (UUID, PK)
  evidence_id_a   (UUID FK → Evidence)
  evidence_id_b   (UUID FK → Evidence)
  relation_type   (ENUM: HASH_MATCH · SHARED_ARTIFACT · COMMON_USER ·
                         COMMON_ACCOUNT · CLONED_FROM · RELATED · OTHER)
  source          (ENUM: AUTOMATIC · MANUAL)
  notes           (TEXT, nullable)
  created_at      (TIMESTAMP)
  created_by      (UUID FK → User)
  -- audit fields
```

- `AUTOMATIC` — system-generated (e.g. hash duplicate detection)
- `MANUAL` — analyst-established semantic relationship
- Evidence from different cases can be correlated — cross-case correlation is fully traceable
- Visualised in the link analysis graph (Cytoscape.js)

---

## Communication Log

Formal record of communications with other units, courts, prosecutors, external labs, or any other party during an investigation. Provides traceability and evidentiary value.

```
CommunicationLog:
  id                  (UUID, PK)
  -- polymorphic: which entity this communication refers to
  table_name          (VARCHAR — "case" · "exhibit" · "evidence" · "lab_submission"...)
  record_uuid         (UUID)
  direction           (ENUM: OUTGOING · INCOMING)
  channel             (ENUM: EMAIL · PHONE · WRITTEN_NOTICE · MEETING · FAX · OTHER)
  subject             (VARCHAR)
  body                (TEXT, nullable)
  communicated_at     (TIMESTAMP)
  communicated_by     (UUID FK → User)
  contact_person_id   (UUID FK → Person, nullable)
  unit_id             (UUID FK → Unit, nullable)
  -- audit fields
```

Attachments (emails, written notices...) are linked via the existing polymorphic `Document` model — no duplication needed.

---

## Progress Reports

Automatically generated case status reports. Content is defined by a JasperReports template — evidence processed, pending, acquisition and analysis status, open deadlines, pending issues. No additional content fields in the model.

### ProgressReportSchedule

```
ProgressReportSchedule:
  id                  (UUID, PK)
  case_id             (UUID FK → Case, nullable — null = all active cases)
  frequency           (ENUM: DAILY · WEEKLY · MONTHLY · ON_DEMAND)
  next_run_at         (TIMESTAMP)
  last_run_at         (TIMESTAMP, nullable)
  recipient_unit_id   (UUID FK → Unit, nullable)
  recipient_user_ids  (JSONB — list of recipient user UUIDs)
  active              (BOOLEAN)
  -- audit fields
```

### ProgressReportExecution

```
ProgressReportExecution:
  id                  (UUID, PK)
  schedule_id         (UUID FK → ProgressReportSchedule)
  case_id             (UUID FK → Case, nullable)
  generated_at        (TIMESTAMP)
  status              (ENUM: PENDING · GENERATED · DELIVERED · FAILED)
  document_id         (UUID FK → Document — generated PDF)
  error_detail        (TEXT, nullable)
  -- audit fields
```

---

## Trial Preparation

Covers the full judicial appearance process — from scheduling to incident documentation. A Case may have one TrialProceeding with multiple individual sessions.

### TrialProceeding

```
TrialProceeding:
  id              (UUID, PK)
  case_id         (UUID FK → Case)
  court_id        (UUID FK → Unit — competent court)
  reference       (VARCHAR — judicial procedure number)
  status          (ENUM: SCHEDULED · IN_PROGRESS · COMPLETED · CANCELLED)
  notes           (TEXT, nullable)
  -- audit fields
```

### CourtHearing (0..N per TrialProceeding)

```
CourtHearing:
  id                    (UUID, PK)
  trial_proceeding_id   (UUID FK → TrialProceeding)
  scheduled_at          (TIMESTAMP)
  held_at               (TIMESTAMP, nullable)
  location              (VARCHAR, nullable)
  status                (ENUM: SCHEDULED · COMPLETED · POSTPONED · CANCELLED)
  -- audit fields
```

### CourtHearingExpert (N:M — experts appearing per session)

```
  hearing_id  (UUID FK → CourtHearing)
  user_id     (UUID FK → User)
```

### CourtHearingMaterial (material to present — polymorphic)

```
  hearing_id    (UUID FK → CourtHearing)
  table_name    (VARCHAR — "expert_report" · "forensic_artifact" · "evidence"...)
  record_uuid   (UUID)
```

### PreparationNote (individual or shared preparation notes)

```
PreparationNote:
  id          (UUID, PK)
  hearing_id  (UUID FK → CourtHearing)
  author_id   (UUID FK → User)
  visibility  (ENUM: PRIVATE · SHARED)
  content     (TEXT)
  created_at, updated_at
  -- audit fields
```

### CourtIncident (optional — incidents during hearing)

```
CourtIncident:
  id              (UUID, PK)
  hearing_id      (UUID FK → CourtHearing)
  incident_type   (ENUM: EVIDENCE_CHALLENGED · ADDITIONAL_REQUEST ·
                         EXPERT_RECUSED · PROCEDURAL · OTHER)
  description     (TEXT)
  recorded_by     (UUID FK → User)
  recorded_at     (TIMESTAMP)
  -- audit fields
```

Documents attached to a hearing (resolutions, minutes...) are linked via the polymorphic `Document` model.

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

## Case Classification

Admin-configurable sensitivity levels for cases. Nullable on Case — no assigned level means no special restriction. Access control based on classification is enforced in the roles/permissions phase.

### ClassificationLevel (catalog)

```
ClassificationLevel:
  id           (UUID, PK)
  name         (VARCHAR — e.g. Public · Internal · Confidential · Secret)
  level        (INTEGER — numeric order for comparison, 1 = lowest sensitivity)
  description  (TEXT, nullable)
  color        (VARCHAR, nullable — hex color for UI display)
  active       (BOOLEAN)
  -- audit fields
```

`Case.classification_level_id` (UUID FK → ClassificationLevel, nullable)

Each tenant defines their own classification scheme. The `level` integer allows ordered comparison (e.g. "user must have clearance ≥ case level").

---

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

## Evidence Inadmissibility

Records the judicial declaration that an Evidence is inadmissible — obtained irregularly, compromised chain of custody, outside the scope of judicial authorization, etc. The Evidence is never deleted — it remains in history with INADMISSIBLE status.

`Evidence.status` includes `INADMISSIBLE` in its enum.

```
EvidenceInadmissibility:
  id                  (UUID, PK)
  evidence_id         (UUID FK → Evidence)
  declared_by         (VARCHAR — court or authority making the declaration)
  judicial_reference  (VARCHAR — resolution reference number)
  reason              (TEXT)
  declared_at         (DATE)
  document_id         (UUID FK → Document — attached resolution, nullable)
  -- audit fields
```

All Analysis records and reports linked to an inadmissible Evidence receive an automatic `PendingIssue WARNING` indicating their evidentiary basis has been declared inadmissible.

---

## Case Outcome

Formal closure of a case with its final judicial or administrative result. All fields nullable — a case may be operationally closed before a firm judicial resolution exists.

Additional fields on `Case`:

```
Case:
  outcome              (ENUM: CONVICTED · ACQUITTED · DISMISSED · ARCHIVED ·
                               REFERRED · NO_CHARGES · OTHER, nullable)
  closed_at            (DATE, nullable)
  outcome_notes        (TEXT, nullable)
  outcome_document_id  (UUID FK → Document, nullable — final resolution)
```

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

## Forensic Artifacts

Individual files and artifacts found during an Analysis. Represent the actual findings at file level — distinct from Evidence (the analyzable unit) and Acquisition (the forensic copy).

### ForensicArtifact

```
ForensicArtifact:
  id              (UUID, PK)
  analysis_id     (UUID FK → Analysis)
  filename        (VARCHAR)
  file_path       (TEXT — path within the forensic image)
  size_bytes      (BIGINT, nullable)
  hash_md5        (VARCHAR, nullable)
  hash_sha256     (VARCHAR, nullable)
  artifact_type   (ENUM: FILE · REGISTRY_KEY · EMAIL · DATABASE ·
                         BROWSER_HISTORY · LOG · CHAT · PHOTO · VIDEO ·
                         DOCUMENT · CREDENTIAL · OTHER)
  notes           (TEXT, nullable)
  is_key_finding  (BOOLEAN — marks artifact as a relevant finding for reports)
  -- audit fields
```

Two input modes:
- **Automatic** via LogImport — forensic tool exports its artifact list, imported via LogParserConfig
- **Manual** — analyst adds artifacts individually

Reports (preliminary or final) include a selected subset of artifacts — not necessarily all of them. The analyst chooses which artifacts to include per report.

`is_key_finding` flag also serves the key findings use case — highlighted artifacts are surfaced in dashboards and reports automatically.

---

## Encryption Management

Tracks encrypted evidence and the full decryption lifecycle. Applicable to Evidence or Acquisition (polymorphic).

### EncryptionRecord

```
EncryptionRecord:
  id              (UUID, PK)
  table_name      (VARCHAR — "evidence" · "acquisition")
  record_uuid     (UUID)
  encryption_type (ENUM: BITLOCKER · VERACRYPT · FILEVAULT · APFS ·
                         ANDROID · IOS · ZIP · PGP · OTHER)
  status          (ENUM: DETECTED · DECRYPTION_PENDING · IN_PROGRESS ·
                         DECRYPTED · FAILED · PARTIAL)
  detected_at     (TIMESTAMP)
  detected_by     (UUID FK → User)
  notes           (TEXT, nullable)
  -- audit fields
```

### DecryptionAttempt (0..N per EncryptionRecord)

```
DecryptionAttempt:
  id                    (UUID, PK)
  encryption_record_id  (UUID FK → EncryptionRecord)
  tool_id               (UUID FK → Tool, nullable)
  method                (ENUM: BRUTE_FORCE · DICTIONARY · KEY_ESCROW ·
                               COURT_ORDER · OWNER_PROVIDED · OTHER)
  started_at            (TIMESTAMP)
  completed_at          (TIMESTAMP, nullable)
  result                (ENUM: SUCCESS · FAILED · PARTIAL)
  notes                 (TEXT, nullable)
  -- audit fields
```

### ObtainedKey (0..1 per EncryptionRecord)

Created only when decryption succeeds (status = DECRYPTED or PARTIAL). Never stored in plain text.

```
ObtainedKey:
  id                    (UUID, PK)
  encryption_record_id  (UUID FK → EncryptionRecord)
  key_value_encrypted   (TEXT — AES-256 encrypted at application level,
                               master key managed outside DB via env/secrets manager)
  obtained_via          (UUID FK → DecryptionAttempt)
  obtained_at           (TIMESTAMP)
  obtained_by           (UUID FK → User)
  -- audit fields
```

- Viewing the decrypted key value always generates an AuditTrail entry (who, when)
- All failed attempts remain documented in DecryptionAttempt regardless of outcome
- Application-level encryption ensures keys are protected even if the database is compromised

---

## External Hash Databases

Optional module — activated per tenant via `Settings.hash_lookup_enabled`. When disabled, the feature is hidden entirely from the UI.

Allows comparing evidence hashes against known hash databases to identify files as known-good (legitimate software) or known-bad (malware), or to match against department-internal interest lists.

### HashDatabase (catalog)

```
HashDatabase:
  id              (UUID, PK)
  name            (NSRL · VirusTotal · MalwareBazaar · Internal...)
  type            (ENUM: KNOWN_GOOD · KNOWN_BAD · CUSTOM)
  query_mode      (ENUM: LOCAL_IMPORT · API_LIVE)
  endpoint        (URL, nullable — for API_LIVE mode)
  api_key_encrypted (nullable — for authenticated APIs)
  enabled         (BOOLEAN — disable a source without removing it)
```

- **LOCAL_IMPORT**: full database imported locally (e.g. NSRL ~100M hashes). Fast lookups, no external dependencies.
- **API_LIVE**: real-time query via external API (e.g. VirusTotal). Requires connectivity and API key.

Multiple sources can be active simultaneously. Each can be individually enabled/disabled.

### HashLookup (lookup result)

```
HashLookup:
  id                  (UUID, PK)
  hash_value          (VARCHAR)
  hash_type           (ENUM: MD5 · SHA1 · SHA256)
  hash_database_id    (UUID FK → HashDatabase)
  result              (ENUM: FOUND · NOT_FOUND · ERROR)
  detail              (JSONB — metadata returned by the external source)
  queried_at          (TIMESTAMP)
  queried_by          (UUID FK → User)
  -- polymorphic target (Evidence · Acquisition)
  table_name          (VARCHAR)
  record_uuid         (UUID)
```

Results are stored and not re-queried unless explicitly requested — avoids redundant API calls and maintains audit trail.

---

## Peer Review

Formal review process where a second analyst validates work before it becomes official. Critical for lab accreditation (ISO 17025, ENFSI) and especially for expert report delivery.

Two distinct review contexts:

### AnalysisReview

Technical review of a forensic Analysis before results are considered validated.

```
AnalysisReview:
  id              (UUID, PK)
  analysis_id     (UUID FK → Analysis)
  reviewer_id     (UUID FK → User)
  reviewed_at     (TIMESTAMP)
  status          (ENUM: APPROVED · REJECTED · NEEDS_CORRECTION)
  notes           (TEXT, nullable)
  -- audit fields
```

- Multiple review rounds supported (REJECTED → corrected → re-reviewed → APPROVED)
- Full traceability: who reviewed, when, outcome, and notes

### ExpertReportReview

Formal review of an ExpertReport before official delivery. Technical + legal + formal validation.

```
ExpertReportReview:
  id               (UUID, PK)
  expert_report_id (UUID FK → ExpertReport)
  reviewer_id      (UUID FK → User)
  reviewed_at      (TIMESTAMP)
  status           (ENUM: APPROVED · REJECTED · NEEDS_CORRECTION)
  notes            (TEXT, nullable)
  -- audit fields
```

- Must be completed before ExpertReport transitions to SIGNED or DELIVERED
- **Never blocking** — proceeding without approval generates a CONFIRM prompt, never a hard block
- Multiple rounds supported: REJECTED → revised → re-reviewed → APPROVED

---

## Expert Report

Single model covering all report types. Generated from Analysis results and selected ForensicArtifacts.

### ExpertReport

```
ExpertReport:
  id                (UUID, PK)
  case_id           (UUID FK → Case)
  type              (ENUM: PRELIMINARY · FINAL · SUPPLEMENTARY)
  status            (ENUM: DRAFT · UNDER_REVIEW · APPROVED · SIGNED · DELIVERED · RATIFIED)
  title             (VARCHAR)
  authored_by       (UUID FK → User)
  authored_at       (TIMESTAMP)
  signed_at         (TIMESTAMP, nullable)
  delivered_at      (TIMESTAMP, nullable)
  recipient_unit_id (UUID FK → Unit, nullable)
  parent_report_id  (UUID FK → ExpertReport, nullable — SUPPLEMENTARY only)
  notes             (TEXT, nullable)
  -- audit fields
```

### ExpertReportAnalysis (N:M)

Links a report to the Analysis records it covers:
```
  report_id   (UUID FK → ExpertReport)
  analysis_id (UUID FK → Analysis)
```

### ExpertReportArtifact

Artifacts selected for inclusion in the report (subset of ForensicArtifact):
```
  report_id      (UUID FK → ExpertReport)
  artifact_id    (UUID FK → ForensicArtifact)
  include_hash   (BOOLEAN — whether to print the hash in the report)
```

### Workflow by type

| Status | PRELIMINARY | FINAL | SUPPLEMENTARY |
|---|---|---|---|
| Formal review (ExpertReportReview) | Optional | Required | Required |
| Signature | Optional | Required | Required |
| Skipping review | — | CONFIRM prompt | CONFIRM prompt |

- SUPPLEMENTARY corrects or extends an already-delivered FINAL report — linked via `parent_report_id`
- Report rendered via JasperReports Server — includes artifact list with hashes when selected
