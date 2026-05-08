# Database Naming Conventions

All names in **snake_case**, **English**, no mixed languages.

## Table prefixes

| Prefix | Type | Examples |
|---|---|---|
| `t100_` | Main entities | `t100_cases`, `t100_events`, `t100_exhibits` |
| `t200_` | Catalogs | `t200_tools`, `t200_evidence_types`, `t200_classification_level` |
| `t300_` | Relational / polymorphic | `t300_chain_of_custody`, `t300_documents`, `t300_notes` |
| `t900_` | Administration | `t900_api_keys`, `t900_webhooks` |

Tables not fitting these groups → ask before creating.

## Tables and columns

- **Tables:** plural (`t100_cases`, `t200_tools`)
- **Columns:** singular, no table name redundancy (`title` not `case_title`)

## Primary keys

`{table_name}_id` — e.g., `t100_cases` → PK: `t100_cases_id`

In Java: field named `id` in `BaseEntity` + `@AttributeOverride` per entity:
```java
@AttributeOverride(name = "id", column = @Column(name = "t100_cases_id"))
```

## Foreign keys

| Case | Format | Example |
|---|---|---|
| Single FK to a table | same as referenced PK | `t200_classification_level_id` |
| Multiple FKs to same table | `{ref_table}_{suffix}_id` | `t100_users_initiated_id` |
| Self-referential FK | `{table}_{suffix}_id` | `t100_expert_reports_parent_id` |

## Data types

| Type | Convention | Example |
|---|---|---|
| Boolean | `is_`, `has_`, `can_` prefix in DB · field without prefix in Java | DB: `is_active` · Java: `boolean active` (Lombok → `isActive()`) |
| Date only | `_date` suffix | `closed_date`, `birth_date` |
| Timestamp | `_at` suffix | `created_at`, `deleted_at` |

## Constraints and indexes

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
