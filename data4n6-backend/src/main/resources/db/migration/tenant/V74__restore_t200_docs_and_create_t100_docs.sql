-- Restore t200_docs (was wrongly renamed to t100_docs)
ALTER TABLE common.t100_docs RENAME TO t200_docs;
ALTER TABLE common.t200_docs RENAME COLUMN t100_docs_id TO t200_docs_id;
ALTER TABLE common.t200_docs RENAME COLUMN descripcion TO description;

-- Restore t000_app_tables entry for t200_docs
UPDATE common.t000_app_tables
SET table_name      = 't200_docs',
    display_name    = 'Tipos de Documento',
    nombre_singular = 'Tipo de Documento',
    nombre_plural   = 'Tipos de Documento',
    icono           = 'lucideFileText',
    endpoint_base   = '/api/v1/catalog/docs',
    seccion_menu    = 'common_catalog',
    orden_menu      = 15
WHERE table_name = 't100_docs';

-- Restore t900_table_fields field name for t200_docs
UPDATE common.t900_table_fields
SET field_name = 'description'
WHERE t000_app_tables_id = (
    SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't200_docs'
)
AND field_name = 'descripcion';

-- Create the actual new t100_docs (identification documents)
CREATE TABLE common.t100_docs (
    t100_docs_id UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_docs_id UUID                     REFERENCES common.t200_docs(t200_docs_id),
    descripcion  VARCHAR(200)             NOT NULL,
    active       BOOLEAN                  NOT NULL DEFAULT true,
    deleted_at   TIMESTAMP WITH TIME ZONE
);

-- Register t100_docs in t000_app_tables
INSERT INTO common.t000_app_tables (
    t000_app_tables_id, table_name, display_name, nombre_singular, nombre_plural,
    icono, endpoint_base, seccion_menu, orden_menu, vistas, db_schema
)
VALUES (
    gen_random_uuid(), 't100_docs', 'Documentos identificativos', 'Documento', 'Documentos',
    'lucideIdCard', '/api/v1/catalog/id-docs', 'common_catalog', 10, 'GRID', 'common'
)
ON CONFLICT (table_name) DO UPDATE
    SET display_name    = 'Documentos identificativos',
        nombre_singular = 'Documento',
        nombre_plural   = 'Documentos',
        icono           = 'lucideIdCard',
        endpoint_base   = '/api/v1/catalog/id-docs',
        seccion_menu    = 'common_catalog',
        orden_menu      = 10,
        vistas          = 'GRID';

-- Register t900_table_fields for t100_docs
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
    ('docTypeId',   'Tipo',        'select', 'true',  '/api/v1/catalog/docs', 'false', 'true',  '1'),
    ('docTypeName', 'Tipo',        'text',   'false', NULL,                   'true',  'false', '2'),
    ('descripcion', 'Descripción', 'text',   'true',  NULL,                   'true',  'true',  '3'),
    ('active',      'Activo',      'boolean','false', NULL,                   'false', 'true',  '4')
) AS f(field_name, display_name, field_type, req, ep, vis_grid, vis_form, ord)
WHERE t.table_name = 't100_docs';
