# Analysis & Reporting Modules

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

## Knowledge Base

Internal laboratory knowledge base with two components.

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
