-- Add schema and application columns to t000_app_tables.
-- db_schema: PostgreSQL schema where the table lives (common, inventario, tenant_xxx)
-- application: logical module owning the table (common, inventory, data4n6)

ALTER TABLE common.t000_app_tables
    ADD COLUMN IF NOT EXISTS db_schema    VARCHAR(50),
    ADD COLUMN IF NOT EXISTS application  VARCHAR(50);

-- ── Populate known values ────────────────────────────────────────────────────

UPDATE common.t000_app_tables SET db_schema = 'common',    application = 'common'
WHERE table_name = 't000_app_tables';

UPDATE common.t000_app_tables SET db_schema = 'inventario', application = 'inventory'
WHERE table_name IN (
    't200_almacenes', 't100_almacenes',
    't200_materiales', 't200_marcas', 't200_modelos',
    't200_articulos', 't100_articulos',
    't200_entradas_almacen', 't250_materiales_marcas', 't200_proveedores',
    't200_eventos', 't250_eventos',
    't400_propuestas', 't600_ordenes',
    't400_materiales_activos', 't300_eventos',
    't100_materiales', 't250_propuestas',
    't400_lineas_propuesta', 't400_materiales_reservados'
);

UPDATE common.t000_app_tables SET db_schema = 'tenant_default', application = 'data4n6'
WHERE table_name IN (
    't100_cases', 't100_events', 't100_exhibits', 't100_evidence',
    't100_persons', 't100_units'
);

-- Also add schema/application to form_fields for t000_app_tables itself
UPDATE common.t000_app_tables
SET form_fields = 'displayName,nombreSingular,nombrePlural,icono,endpointBase,seccionMenu,ordenMenu,vistas,formFields,dbSchema,application'
WHERE table_name = 't000_app_tables';
