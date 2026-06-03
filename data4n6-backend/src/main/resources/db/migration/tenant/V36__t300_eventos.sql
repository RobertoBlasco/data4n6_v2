-- t300_eventos: immutable inventory event log
-- One row per event per article. Never updated or soft-deleted.
-- Records the full delta: from-state, to-state, from-warehouse, to-warehouse, from/to owner.
-- t200_eventos_id identifies the type of event (from the catalog defined in t200_eventos).

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t300_eventos', 'Historial de eventos', 'Registro inmutable de eventos de inventario por artículo')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t300_eventos (
    t300_eventos_id          UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What type of event occurred
    t200_eventos_id          UUID         NOT NULL REFERENCES inventario.t200_eventos(t200_eventos_id),

    -- Which article was affected
    t100_articulos_id        UUID         NOT NULL REFERENCES inventario.t100_articulos(t100_articulos_id),

    -- Source documents (at most one is normally set)
    t400_propuestas_id       UUID         REFERENCES inventario.t400_propuestas(t400_propuestas_id),
    t600_ordenes_id          UUID         REFERENCES inventario.t600_ordenes(t600_ordenes_id),

    -- Warehouse transition
    t100_almacenes_origen_id  UUID        REFERENCES inventario.t100_almacenes(t100_almacenes_id),
    t100_almacenes_destino_id UUID        REFERENCES inventario.t100_almacenes(t100_almacenes_id),

    -- State transition
    t200_estados_anterior_id  UUID        REFERENCES inventario.t200_estados(t200_estados_id),
    t200_estados_nuevo_id     UUID        REFERENCES inventario.t200_estados(t200_estados_id),

    -- Ownership transition (polymorphic)
    adjudicatario_anterior_id     UUID,
    adjudicatario_anterior_tabla  VARCHAR(100),
    adjudicatario_nuevo_id        UUID,
    adjudicatario_nuevo_tabla     VARCHAR(100),

    -- Audit
    realizado_por   VARCHAR(100),
    fecha           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    notas           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_t300_eventos_articulo   ON inventario.t300_eventos(t100_articulos_id);
CREATE INDEX idx_t300_eventos_tipo       ON inventario.t300_eventos(t200_eventos_id);
CREATE INDEX idx_t300_eventos_propuesta  ON inventario.t300_eventos(t400_propuestas_id);
CREATE INDEX idx_t300_eventos_orden      ON inventario.t300_eventos(t600_ordenes_id);
CREATE INDEX idx_t300_eventos_fecha      ON inventario.t300_eventos(fecha);
