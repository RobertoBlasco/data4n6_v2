-- t250_materiales_marcas: catalogue of valid brand × material-type combinations.
-- When creating a modelo (t200_modelos), the chosen (t200_materiales_id, t200_marcas_id)
-- pair must exist here, preventing arbitrary brand/material pairings.

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t250_materiales_marcas', 'Materiales × Marcas', 'Combinaciones válidas de tipo de material y marca')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t250_materiales_marcas (
    t250_materiales_marcas_id  UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_materiales_id         UUID        NOT NULL REFERENCES inventario.t200_materiales(t200_materiales_id),
    t200_marcas_id             UUID        NOT NULL REFERENCES inventario.t200_marcas(t200_marcas_id),
    deleted_at                 TIMESTAMPTZ
);

-- Partial unique index allows re-registering a combo after soft-deletion
CREATE UNIQUE INDEX uq_t250_materiales_marcas_active
    ON inventario.t250_materiales_marcas(t200_materiales_id, t200_marcas_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_t250_mat_marcas_material ON inventario.t250_materiales_marcas(t200_materiales_id);
CREATE INDEX idx_t250_mat_marcas_marca    ON inventario.t250_materiales_marcas(t200_marcas_id);
