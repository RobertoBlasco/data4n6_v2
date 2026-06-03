ALTER TABLE inventario.t600_ordenes_entrada
    DROP COLUMN IF EXISTS t100_almacenes_id;

ALTER TABLE inventario.t650_ordenes_entrada
    ADD COLUMN IF NOT EXISTS t100_almacenes_id UUID
        REFERENCES inventario.t100_almacenes(t100_almacenes_id);

CREATE INDEX IF NOT EXISTS idx_t650_entrada_almacen
    ON inventario.t650_ordenes_entrada(t100_almacenes_id);
