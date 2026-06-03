-- Types catalogs for polymorphic attachments (t300_pictures, t300_documents)
-- Placed in common schema so all modules can share them

-- ── 1. Create tables ────────────────────────────────────────────────────────

CREATE TABLE common.t200_picture_types (
    t200_picture_types_id UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    name                  VARCHAR(100)             NOT NULL,
    description           TEXT,
    active                BOOLEAN                  NOT NULL DEFAULT true,
    deleted_at            TIMESTAMP WITH TIME ZONE
);

CREATE TABLE common.t200_document_types (
    t200_document_types_id UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    name                   VARCHAR(100)             NOT NULL,
    description            TEXT,
    active                 BOOLEAN                  NOT NULL DEFAULT true,
    deleted_at             TIMESTAMP WITH TIME ZONE
);

-- ── 2. Register in t000_app_tables ──────────────────────────────────────────

INSERT INTO common.t000_app_tables (
    t000_app_tables_id, table_name, display_name, nombre_singular, nombre_plural,
    icono, endpoint_base, seccion_menu, orden_menu, vistas, db_schema
) VALUES
(
    gen_random_uuid(), 't200_picture_types', 'Tipos de imagen', 'Tipo de imagen', 'Tipos de imagen',
    'lucideImage', '/api/v1/catalog/picture-types', 'common_catalog', 20, 'GRID', 'common'
),
(
    gen_random_uuid(), 't200_document_types', 'Tipos de documento adjunto', 'Tipo de documento', 'Tipos de documento',
    'lucideFileText', '/api/v1/catalog/document-types', 'common_catalog', 21, 'GRID', 'common'
)
ON CONFLICT (table_name) DO NOTHING;

-- ── 3. Register fields in t900_table_fields ──────────────────────────────────

INSERT INTO common.t900_table_fields
    (t900_table_fields_id, t000_app_tables_id, field_name, display_name, field_type,
     required, endpoint, visible_in_grid, visible_in_form, orden)
SELECT
    gen_random_uuid(), t.t000_app_tables_id,
    f.field_name, f.display_name, f.field_type,
    f.req::boolean, f.ep, f.vis_grid::boolean, f.vis_form::boolean, f.ord::smallint
FROM common.t000_app_tables t
CROSS JOIN (VALUES
    ('name',        'Nombre',      'text',    'true',  NULL, 'true',  'true',  '1'),
    ('description', 'Descripción', 'text',    'false', NULL, 'false', 'true',  '2'),
    ('active',      'Activo',      'boolean', 'false', NULL, 'true',  'true',  '3')
) AS f(field_name, display_name, field_type, req, ep, vis_grid, vis_form, ord)
WHERE t.table_name IN ('t200_picture_types', 't200_document_types');
