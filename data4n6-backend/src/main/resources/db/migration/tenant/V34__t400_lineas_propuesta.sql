-- t400_lineas_propuesta: lines within a proposal
-- Each line represents one article to be processed.
-- Nullable columns are type-specific:
--   Entrada (ENT): t200_modelos_id, t100_almacenes_id, t200_estados_id, numero_serie, precio
--   Traspaso (TRS): t100_articulos_id, t100_almacenes_id (destination)
--   Adjudicación (ADJ): t100_articulos_id, adjudicatario_id, adjudicatario_tabla
--   Préstamo (PRS): t100_articulos_id, adjudicatario_id, adjudicatario_tabla, fecha_devolucion

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t400_lineas_propuesta', 'Líneas de propuesta', 'Artículos incluidos en cada propuesta de inventario')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t400_lineas_propuesta (
    t400_lineas_propuesta_id  UUID          NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    t400_propuestas_id        UUID          NOT NULL REFERENCES inventario.t400_propuestas(t400_propuestas_id),

    -- Existing article (NULL for Entrada lines — article is created on approval)
    t100_articulos_id         UUID          REFERENCES inventario.t100_articulos(t100_articulos_id),

    -- Entrada-specific: category and model for the article to be created
    t200_articulos_id         UUID          REFERENCES inventario.t200_articulos(t200_articulos_id),
    t200_modelos_id           UUID          REFERENCES inventario.t200_modelos(t200_modelos_id),

    -- Warehouse (destination for Entrada/Traspaso; origin for Préstamo/Adjudicación is read from t400_materiales_activos)
    t100_almacenes_id         UUID          REFERENCES inventario.t100_almacenes(t100_almacenes_id),

    -- Entrada-specific: initial state assigned to the new article
    t200_estados_id           UUID          REFERENCES inventario.t200_estados(t200_estados_id),

    -- Entrada-specific fields
    numero_serie              VARCHAR(100),
    precio                    NUMERIC(12,2),

    -- Préstamo/Adjudicación: polymorphic reference to the beneficiary (person, unit, etc.)
    adjudicatario_id          UUID,
    adjudicatario_tabla       VARCHAR(100),

    -- Préstamo-specific: expected return date
    fecha_devolucion          DATE,

    notas                     TEXT,
    orden                     SMALLINT      NOT NULL DEFAULT 1
);

CREATE INDEX idx_t400_lineas_propuesta      ON inventario.t400_lineas_propuesta(t400_propuestas_id);
CREATE INDEX idx_t400_lineas_articulo       ON inventario.t400_lineas_propuesta(t100_articulos_id);
CREATE INDEX idx_t400_lineas_modelo         ON inventario.t400_lineas_propuesta(t200_modelos_id);
CREATE INDEX idx_t400_lineas_almacen        ON inventario.t400_lineas_propuesta(t100_almacenes_id);
CREATE INDEX idx_t400_lineas_adjudicatario  ON inventario.t400_lineas_propuesta(adjudicatario_id);
