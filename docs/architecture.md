# Backend Architecture

## Multi-tenancy (schema-per-tenant)

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

## Base entity

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

## Database migrations (Flyway)

Migrations run automatically on startup. Two locations:
- `db/migration/tenant/` — applied to the tenant schema (per-tenant tables)
- `db/migration/common/` — applied to the shared `common` schema

| Version | Description |
|---|---|
| V1 | Create schemas (`common`, `tenant_default`) |
| V2 | Create `cases` and `classification_level` (initial naming — superseded) |
| V3 | Recreate tables with correct naming convention |

---

## Multi-tenancy (deployment overview)

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

## Internationalization

- i18n is a **frontend responsibility** (Angular) — JSON translation files per language for static UI texts
- Database data is NOT translated — entered in whatever language the user types
- No translation tables in the database
- Regional formatting (dates, numbers) → application configuration

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
