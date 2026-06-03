ALTER TABLE inventario.t100_articulos
    ADD COLUMN t200_materiales_id UUID
        REFERENCES inventario.t200_materiales(t200_materiales_id);

CREATE INDEX idx_t100_articulos_tipo_material ON inventario.t100_articulos (t200_materiales_id);
