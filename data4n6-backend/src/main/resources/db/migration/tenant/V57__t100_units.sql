-- Organizational units shared across modules.
-- t300_units join table: links a unit to specific apps.
-- No entries = unit is available to all modules.

CREATE TABLE IF NOT EXISTS common.t100_units (
    t100_units_id UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
    code          VARCHAR(20)                 NOT NULL UNIQUE,
    name          VARCHAR(100)                NOT NULL,
    description   TEXT,
    active        BOOLEAN                     NOT NULL DEFAULT true,
    deleted_at    TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS common.t300_units (
    t100_units_id UUID                        NOT NULL REFERENCES common.t100_units(t100_units_id),
    t900_apps_id  UUID                        NOT NULL REFERENCES common.t900_apps(t900_apps_id),
    deleted_at    TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (t100_units_id, t900_apps_id)
);

INSERT INTO common.t000_app_tables
    (t000_app_tables_id, table_name, display_name, nombre_singular, nombre_plural,
     icono, endpoint_base, seccion_menu, orden_menu, vistas, form_fields, db_schema)
VALUES
    (gen_random_uuid(), 't100_units', 'Unidades', 'Unidad', 'Unidades',
     'lucideBuilding2', '/api/v1/catalog/units', 'inventory_admin', 4, 'GRID',
     'code,name,description,active', 'common')
ON CONFLICT (table_name) DO NOTHING;
