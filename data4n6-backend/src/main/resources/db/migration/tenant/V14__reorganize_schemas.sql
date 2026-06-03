-- Reorganize tables into module schemas
-- tenant_default keeps only flyway_schema_history

SET search_path = tenant_default;

CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS data4n6;
CREATE SCHEMA IF NOT EXISTS common;

-- ── common ────────────────────────────────────────────────────────────────────
ALTER TABLE t000_app_tables                 SET SCHEMA common;

-- ── inventory ─────────────────────────────────────────────────────────────────
ALTER TABLE t200_brands                     SET SCHEMA inventory;
ALTER TABLE t200_materials                  SET SCHEMA inventory;
ALTER TABLE t200_item_categories            SET SCHEMA inventory;
ALTER TABLE t200_item_statuses              SET SCHEMA inventory;
ALTER TABLE t200_warehouse_entry_types      SET SCHEMA inventory;
ALTER TABLE t100_warehouses                 SET SCHEMA inventory;
ALTER TABLE t100_inventory_items            SET SCHEMA inventory;

-- ── data4n6 ───────────────────────────────────────────────────────────────────
ALTER TABLE t200_countries                  SET SCHEMA data4n6;
ALTER TABLE t200_admin_divisions            SET SCHEMA data4n6;
ALTER TABLE t200_units                      SET SCHEMA data4n6;
ALTER TABLE t200_person_roles               SET SCHEMA data4n6;
ALTER TABLE t100_persons                    SET SCHEMA data4n6;
ALTER TABLE t100_person_links               SET SCHEMA data4n6;
ALTER TABLE t200_cases_level                SET SCHEMA data4n6;
ALTER TABLE t200_case_domains               SET SCHEMA data4n6;
ALTER TABLE t200_case_outcomes              SET SCHEMA data4n6;
ALTER TABLE t200_case_statuses              SET SCHEMA data4n6;
ALTER TABLE t300_case_status_actions        SET SCHEMA data4n6;
ALTER TABLE t100_cases                      SET SCHEMA data4n6;
ALTER TABLE t100_cases_units                SET SCHEMA data4n6;
ALTER TABLE t200_event_statuses             SET SCHEMA data4n6;
ALTER TABLE t300_event_status_actions       SET SCHEMA data4n6;
ALTER TABLE t100_events                     SET SCHEMA data4n6;
ALTER TABLE t100_events_units               SET SCHEMA data4n6;
ALTER TABLE t200_exhibit_statuses           SET SCHEMA data4n6;
ALTER TABLE t300_exhibit_status_actions     SET SCHEMA data4n6;
ALTER TABLE t100_exhibits                   SET SCHEMA data4n6;
ALTER TABLE t200_evidence_statuses          SET SCHEMA data4n6;
ALTER TABLE t300_evidence_status_actions    SET SCHEMA data4n6;
ALTER TABLE t100_evidence                   SET SCHEMA data4n6;
ALTER TABLE t100_documents                  SET SCHEMA data4n6;
ALTER TABLE t100_photos                     SET SCHEMA data4n6;
