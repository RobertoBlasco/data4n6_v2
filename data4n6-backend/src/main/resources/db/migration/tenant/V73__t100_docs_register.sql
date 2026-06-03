INSERT INTO common.t000_app_tables (
    t000_app_tables_id, table_name, display_name, nombre_singular, nombre_plural,
    icono, endpoint_base, seccion_menu, orden_menu, vistas, db_schema
)
VALUES (
    gen_random_uuid(), 't100_docs', 'Documentos identificativos', 'Documento', 'Documentos',
    'lucideIdCard', '/api/v1/catalog/docs', 'common_catalog', 10, 'GRID', 'common'
)
ON CONFLICT (table_name) DO UPDATE
    SET display_name    = 'Documentos identificativos',
        nombre_singular = 'Documento',
        nombre_plural   = 'Documentos',
        icono           = 'lucideIdCard',
        endpoint_base   = '/api/v1/catalog/docs',
        seccion_menu    = 'common_catalog',
        orden_menu      = 10,
        vistas          = 'GRID';

DELETE FROM common.t900_table_fields
WHERE t000_app_tables_id = (
    SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_docs'
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
    ('descripcion', 'Descripción', 'text',    'true',  NULL,  'true',  'true',  '1'),
    ('active',      'Activo',      'boolean', 'false', NULL,  'false', 'true',  '2')
) AS f(field_name, display_name, field_type, req, ep, vis_grid, vis_form, ord)
WHERE t.table_name = 't100_docs';
