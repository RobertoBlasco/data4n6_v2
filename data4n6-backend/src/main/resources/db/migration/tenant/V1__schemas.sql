-- Create shared catalog schema (common to all tenants)
CREATE SCHEMA IF NOT EXISTS common;

-- Create default development tenant schema
CREATE SCHEMA IF NOT EXISTS tenant_default;

-- ============================================================
-- t000_app_tables — registro de tablas de la aplicación
-- Base para relaciones polimórficas (fotos, documentos, personas...)
-- ============================================================
CREATE TABLE t000_app_tables (
    t000_app_tables_id  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name          VARCHAR(100) NOT NULL,
    display_name        VARCHAR(100) NOT NULL,
    description         TEXT,
    CONSTRAINT t000_app_tables_name_unique UNIQUE (table_name)
);

INSERT INTO t000_app_tables (table_name, display_name, description) VALUES
    ('t100_cases',    'Casos',       'Expedientes de investigación'),
    ('t100_events',   'Eventos',     'Actuaciones e inspecciones'),
    ('t100_exhibits', 'Efectos',     'Efectos intervenidos'),
    ('t100_evidence', 'Evidencias',  'Evidencias digitales'),
    ('t100_persons',  'Personas',    'Personas involucradas'),
    ('t100_units',    'Unidades',    'Unidades de la organización');
