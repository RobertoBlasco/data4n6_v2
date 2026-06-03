-- t400_materiales_activos: current inventory state — one row per active article
-- Updated atomically each time an event is applied.
-- t300_eventos_id points to the last event that changed this row.

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t400_materiales_activos', 'Materiales activos', 'Estado actual de cada artículo de inventario')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t400_materiales_activos (
    t400_materiales_activos_id  UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),

    -- One row per article
    t100_articulos_id           UUID        NOT NULL UNIQUE REFERENCES inventario.t100_articulos(t100_articulos_id),

    -- Current location (NULL if adjudicated and not in any warehouse)
    t100_almacenes_id           UUID        REFERENCES inventario.t100_almacenes(t100_almacenes_id),

    -- Current status
    t200_estados_id             UUID        REFERENCES inventario.t200_estados(t200_estados_id),

    -- Last event that modified this record
    t300_eventos_id             UUID        REFERENCES inventario.t300_eventos(t300_eventos_id),

    -- Current owner, if adjudicated or on loan (polymorphic)
    adjudicatario_id            UUID,
    adjudicatario_tabla         VARCHAR(100),

    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_t400_mat_activos_almacen      ON inventario.t400_materiales_activos(t100_almacenes_id);
CREATE INDEX idx_t400_mat_activos_estado       ON inventario.t400_materiales_activos(t200_estados_id);
CREATE INDEX idx_t400_mat_activos_adjudicatario ON inventario.t400_materiales_activos(adjudicatario_id);
