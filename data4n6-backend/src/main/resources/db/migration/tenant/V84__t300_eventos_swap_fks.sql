ALTER TABLE inventario.t300_eventos
    DROP CONSTRAINT t300_eventos_t600_ordenes_id_fkey,
    DROP CONSTRAINT t300_eventos_t400_propuestas_id_fkey,
    DROP COLUMN t600_ordenes_id,
    DROP COLUMN t400_propuestas_id,
    ADD COLUMN t650_ordenes_id UUID REFERENCES inventario.t650_ordenes(t650_ordenes_id);

DROP INDEX IF EXISTS inventario.idx_t300_eventos_orden;
DROP INDEX IF EXISTS inventario.idx_t300_eventos_propuesta;

CREATE INDEX idx_t300_eventos_linea_orden ON inventario.t300_eventos(t650_ordenes_id);
