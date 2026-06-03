-- Register t900_table_fields for t200_docs and t100_units
-- to drive the generic CatalogAdminComponent (grid columns + form fields)

-- t200_docs names
UPDATE common.t000_app_tables
SET nombre_singular = 'Tipo de Documento',
    nombre_plural   = 'Tipos de Documento'
WHERE table_name = 't200_docs';

-- t100_units names
UPDATE common.t000_app_tables
SET nombre_singular = 'Unidad',
    nombre_plural   = 'Unidades'
WHERE table_name = 't100_units';

-- ── t900_table_fields for t200_docs ─────────────────────────────────────────

DELETE FROM common.t900_table_fields
WHERE t000_app_tables_id = (
    SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't200_docs'
);

INSERT INTO common.t900_table_fields
    (t900_table_fields_id, t000_app_tables_id, field_name, display_name, field_type,
     required, visible_in_grid, visible_in_form, orden)
SELECT
    gen_random_uuid(),
    t.t000_app_tables_id,
    f.field_name, f.display_name, f.field_type,
    f.req::boolean, f.vis_grid::boolean, f.vis_form::boolean, f.ord::smallint
FROM common.t000_app_tables t
CROSS JOIN (VALUES
    ('description', 'Descripción', 'text',    'true',  'true', 'true', '1'),
    ('active',      'Activo',      'boolean', 'false', 'true', 'true', '2')
) AS f(field_name, display_name, field_type, req, vis_grid, vis_form, ord)
WHERE t.table_name = 't200_docs';

-- ── t900_table_fields for t100_units ────────────────────────────────────────

DELETE FROM common.t900_table_fields
WHERE t000_app_tables_id = (
    SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_units'
);

INSERT INTO common.t900_table_fields
    (t900_table_fields_id, t000_app_tables_id, field_name, display_name, field_type,
     required, visible_in_grid, visible_in_form, orden)
SELECT
    gen_random_uuid(),
    t.t000_app_tables_id,
    f.field_name, f.display_name, f.field_type,
    f.req::boolean, f.vis_grid::boolean, f.vis_form::boolean, f.ord::smallint
FROM common.t000_app_tables t
CROSS JOIN (VALUES
    ('code',         'Código',      'text',    'true',  'true',  'true', '1'),
    ('name',         'Nombre',      'text',    'true',  'true',  'true', '2'),
    ('description',  'Descripción', 'text',    'false', 'false', 'true', '3'),
    ('active',       'Activo',      'boolean', 'false', 'true',  'true', '4'),
    ('forInventory', 'Inventario',  'boolean', 'false', 'true',  'true', '5'),
    ('forData4n6',   'data4n6',     'boolean', 'false', 'true',  'true', '6')
) AS f(field_name, display_name, field_type, req, vis_grid, vis_form, ord)
WHERE t.table_name = 't100_units';
