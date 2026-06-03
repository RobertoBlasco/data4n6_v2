-- Agents: personnel who can be assigned to cases, events and inventory operations

CREATE TABLE IF NOT EXISTS common.t100_agents (
    t100_agents_id UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    code           VARCHAR(20)              NOT NULL UNIQUE,
    call_sign      VARCHAR(50),
    first_name     VARCHAR(100)             NOT NULL,
    last_name      VARCHAR(100)             NOT NULL,
    t100_units_id  UUID                     REFERENCES common.t100_units(t100_units_id),
    active         BOOLEAN                  NOT NULL DEFAULT true,
    deleted_at     TIMESTAMP WITH TIME ZONE
);

-- Register in catalog
INSERT INTO common.t000_app_tables (
    t000_app_tables_id, table_name, display_name, nombre_singular, nombre_plural,
    icono, endpoint_base, seccion_menu, orden_menu, vistas, db_schema
)
VALUES (
    gen_random_uuid(), 't100_agents', 'Agentes', 'Agente', 'Agentes',
    'lucideUserCheck', '/api/v1/catalog/agents', 'common_catalog', 5, 'GRID', 'common'
)
ON CONFLICT (table_name) DO NOTHING;

-- Grid columns and form fields
DELETE FROM common.t900_table_fields
WHERE t000_app_tables_id = (
    SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_agents'
);

INSERT INTO common.t900_table_fields
    (t900_table_fields_id, t000_app_tables_id, field_name, display_name, field_type,
     required, endpoint, visible_in_grid, visible_in_form, orden)
SELECT
    gen_random_uuid(),
    t.t000_app_tables_id,
    f.field_name, f.display_name, f.field_type,
    f.req::boolean, f.ep, f.vis_grid::boolean, f.vis_form::boolean, f.ord::smallint
FROM common.t000_app_tables t
CROSS JOIN (VALUES
    ('code',      'Código',   'text',    'true',  NULL,                    'true',  'true',  '1'),
    ('callSign',  'Indicativo', 'text',  'false', NULL,                    'true',  'true',  '2'),
    ('firstName', 'Nombre',   'text',    'true',  NULL,                    'true',  'true',  '3'),
    ('lastName',  'Apellidos','text',    'true',  NULL,                    'true',  'true',  '4'),
    ('unitId',    'Unidad',   'select',  'false', '/api/v1/catalog/units', 'false', 'true',  '5'),
    ('unitName',  'Unidad',   'text',    'false', NULL,                    'true',  'false', '6'),
    ('active',    'Activo',   'boolean', 'false', NULL,                    'true',  'true',  '7')
) AS f(field_name, display_name, field_type, req, ep, vis_grid, vis_form, ord)
WHERE t.table_name = 't100_agents';
