INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t650_ordenes', 'Líneas de orden', 'Artículos concretos incluidos en cada orden de inventario')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t650_ordenes (
    t650_ordenes_id          UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    t600_ordenes_id          UUID        NOT NULL REFERENCES inventario.t600_ordenes(t600_ordenes_id),
    t100_articulos_id        UUID        NOT NULL REFERENCES inventario.t100_articulos(t100_articulos_id),
    t400_lineas_propuesta_id UUID        REFERENCES inventario.t400_lineas_propuesta(t400_lineas_propuesta_id),
    posicion                 SMALLINT    NOT NULL DEFAULT 1,
    deleted_at               TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_t650_ordenes_orden    ON inventario.t650_ordenes(t600_ordenes_id);
CREATE INDEX idx_t650_ordenes_articulo ON inventario.t650_ordenes(t100_articulos_id);
