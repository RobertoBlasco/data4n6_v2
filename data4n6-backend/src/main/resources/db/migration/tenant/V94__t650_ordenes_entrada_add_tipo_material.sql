ALTER TABLE inventario.t650_ordenes_entrada
    ADD COLUMN IF NOT EXISTS t200_materiales_id UUID
        REFERENCES inventario.t200_materiales(t200_materiales_id);

CREATE INDEX IF NOT EXISTS idx_t650_entrada_tipo_material
    ON inventario.t650_ordenes_entrada(t200_materiales_id);
