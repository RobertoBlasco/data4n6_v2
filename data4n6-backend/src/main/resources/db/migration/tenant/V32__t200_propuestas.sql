-- t200_propuestas: proposal type catalog
-- Each entry defines a category of operation (Entrada, Traspaso, Adjudicación, Préstamo, etc.)
-- The descripcion_corta is used as prefix for reference codes (e.g. ENT → ENT-2026-00001)

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t200_propuestas', 'Tipos de propuesta', 'Catálogo de tipos de propuesta de inventario')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t200_propuestas (
    t200_propuestas_id  UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre              VARCHAR(200) NOT NULL,
    descripcion_corta   VARCHAR(10)  NOT NULL,
    descripcion         TEXT,
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT t200_propuestas_nombre_uq        UNIQUE (nombre),
    CONSTRAINT t200_propuestas_desc_corta_uq    UNIQUE (descripcion_corta)
);

CREATE INDEX t200_propuestas_nombre_like ON inventario.t200_propuestas USING btree (nombre varchar_pattern_ops);

INSERT INTO inventario.t200_propuestas (nombre, descripcion_corta, descripcion) VALUES
    ('Entrada de almacén',     'ENT', 'Alta de nuevos artículos en el inventario'),
    ('Traspaso de almacén',    'TRS', 'Traslado de artículos entre almacenes'),
    ('Orden de adjudicación',  'ADJ', 'Asignación permanente de artículos a un adjudicatario'),
    ('Orden de préstamo',      'PRS', 'Cesión temporal de artículos con fecha de devolución prevista');
