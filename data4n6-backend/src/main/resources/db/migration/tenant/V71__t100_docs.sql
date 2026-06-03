-- Rename t200_docs → t100_docs and description → descripcion
ALTER TABLE common.t200_docs RENAME TO t100_docs;
ALTER TABLE common.t100_docs RENAME COLUMN description TO descripcion;

-- Update catalog metadata
UPDATE common.t000_app_tables
SET table_name    = 't100_docs',
    display_name  = 'Documentos identificativos',
    nombre_singular = 'Documento',
    nombre_plural   = 'Documentos',
    icono           = 'lucideIdCard',
    endpoint_base   = '/api/v1/catalog/docs',
    seccion_menu    = 'common_catalog',
    orden_menu      = 10
WHERE table_name = 't200_docs';

-- Rebuild t900_table_fields for the renamed table
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
