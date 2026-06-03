ALTER TABLE inventario.t600_ordenes
    ADD COLUMN t200_eventos_id       UUID REFERENCES inventario.t200_eventos(t200_eventos_id),
    ADD COLUMN t200_estados_ordenes_id UUID REFERENCES inventario.t200_estados_ordenes(t200_estados_ordenes_id),
    ADD COLUMN deleted_at            TIMESTAMPTZ;

CREATE INDEX idx_t600_ordenes_evento  ON inventario.t600_ordenes(t200_eventos_id);
CREATE INDEX idx_t600_ordenes_estado  ON inventario.t600_ordenes(t200_estados_ordenes_id);
