ALTER TABLE inventario.t600_ordenes_entrada
    ADD COLUMN IF NOT EXISTS t100_almacenes_id UUID
        REFERENCES inventario.t100_almacenes(t100_almacenes_id);

CREATE INDEX IF NOT EXISTS idx_t600_entrada_almacen
    ON inventario.t600_ordenes_entrada(t100_almacenes_id);
