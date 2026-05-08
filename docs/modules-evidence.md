# Evidence Modules

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
