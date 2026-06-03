-- Field-level metadata for generic form/grid rendering.
-- Each row describes one field of a table registered in t000_app_tables.

CREATE TABLE IF NOT EXISTS common.t900_table_fields (
    t900_table_fields_id UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    t000_app_tables_id   UUID         NOT NULL REFERENCES common.t000_app_tables(t000_app_tables_id),
    field_name           VARCHAR(100) NOT NULL,
    display_name         VARCHAR(100),
    field_type           VARCHAR(50)  NOT NULL DEFAULT 'text',
    required             BOOLEAN      NOT NULL DEFAULT false,
    default_value        TEXT,
    placeholder          TEXT,
    endpoint             VARCHAR(200),
    visible_in_grid      BOOLEAN      NOT NULL DEFAULT true,
    visible_in_form      BOOLEAN      NOT NULL DEFAULT true,
    orden                SMALLINT,
    UNIQUE (t000_app_tables_id, field_name)
);

-- Register t900_apps and t900_table_fields in the UI metadata registry
INSERT INTO common.t000_app_tables
    (t000_app_tables_id, table_name, display_name, nombre_singular, nombre_plural,
     icono, endpoint_base, seccion_menu, orden_menu, vistas, form_fields, db_schema)
VALUES
    (gen_random_uuid(), 't900_apps', 'Aplicaciones', 'Aplicación', 'Aplicaciones',
     'lucideBoxes', '/api/v1/catalog/apps', 'inventory_admin', 2, 'GRID',
     'name,displayName,description,icono', 'common'),
    (gen_random_uuid(), 't900_table_fields', 'Campos de tabla', 'Campo', 'Campos de tabla',
     'lucideColumns', '/api/v1/catalog/table-fields', 'inventory_admin', 3, 'GRID',
     'fieldName,displayName,fieldType,required,defaultValue,placeholder,endpoint,visibleInGrid,visibleInForm,orden', 'common')
ON CONFLICT (table_name) DO NOTHING;
