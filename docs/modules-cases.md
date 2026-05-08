# Case Management Modules

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
