# Data Model

## Main hierarchy

```
Case → Event → Exhibit → Evidence → Acquisition → Analysis
                  └── ChainOfCustody
```

## Entity descriptions

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
