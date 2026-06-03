-- t100_materiales: physical material catalogue (type + brand + model)
-- Serial number is NOT here — it belongs to t100_inventory_items

-- 1. Register in app tables catalog
INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t100_materiales', 'Materiales', 'Catálogo de materiales con marca y modelo')
ON CONFLICT (table_name) DO NOTHING;

-- 2. Create table
CREATE TABLE inventario.t100_materiales (
    t100_materiales_id  UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_materiales_id  UUID         NOT NULL REFERENCES inventario.t200_materiales(t200_materiales_id),
    t200_marcas_id      UUID                  REFERENCES inventario.t200_marcas(t200_marcas_id),
    modelo              VARCHAR(200),
    deleted_at          TIMESTAMPTZ
);

-- 3. Indexes for FK lookups
CREATE INDEX idx_t100_materiales_tipo  ON inventario.t100_materiales(t200_materiales_id);
CREATE INDEX idx_t100_materiales_marca ON inventario.t100_materiales(t200_marcas_id);
