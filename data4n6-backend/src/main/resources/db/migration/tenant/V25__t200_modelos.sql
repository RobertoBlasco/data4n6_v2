-- New catalog: t200_modelos (model catalog, dependent on brand + material type)
INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t200_modelos', 'Modelos', 'Catálogo de modelos por marca y tipo de material')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t200_modelos (
    t200_modelos_id     UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_materiales_id  UUID        NOT NULL REFERENCES inventario.t200_materiales(t200_materiales_id),
    t200_marcas_id      UUID        NOT NULL REFERENCES inventario.t200_marcas(t200_marcas_id),
    description         TEXT,
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_t200_modelos_tipo  ON inventario.t200_modelos(t200_materiales_id);
CREATE INDEX idx_t200_modelos_marca ON inventario.t200_modelos(t200_marcas_id);

-- Replace free-text model field in t100_articulos with FK
ALTER TABLE inventario.t100_articulos
    DROP COLUMN model,
    ADD COLUMN t200_modelos_id UUID REFERENCES inventario.t200_modelos(t200_modelos_id);

CREATE INDEX idx_t100_articulos_modelo ON inventario.t100_articulos(t200_modelos_id);

-- Replace free-text modelo field in t100_materiales with FK
ALTER TABLE inventario.t100_materiales
    DROP COLUMN modelo,
    ADD COLUMN t200_modelos_id UUID REFERENCES inventario.t200_modelos(t200_modelos_id);

CREATE INDEX idx_t100_materiales_modelo ON inventario.t100_materiales(t200_modelos_id);
