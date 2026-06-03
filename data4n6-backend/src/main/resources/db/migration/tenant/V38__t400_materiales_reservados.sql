-- t400_materiales_reservados: temporary article locks during proposal editing
-- Prevents two proposals from including the same article simultaneously.
-- The application cleans up expired rows before checking for conflicts.

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t400_materiales_reservados', 'Materiales reservados', 'Bloqueos temporales de artículos durante la edición de propuestas')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t400_materiales_reservados (
    t400_materiales_reservados_id  UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    t100_articulos_id              UUID         NOT NULL REFERENCES inventario.t100_articulos(t100_articulos_id),
    t400_propuestas_id             UUID         NOT NULL REFERENCES inventario.t400_propuestas(t400_propuestas_id),
    reservado_por                  VARCHAR(100),
    reservado_en                   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expira_en                      TIMESTAMPTZ  NOT NULL,

    -- Only one active reservation per article (application must purge expired rows first)
    CONSTRAINT t400_mat_reservados_articulo_uq UNIQUE (t100_articulos_id)
);

CREATE INDEX idx_t400_mat_reservados_propuesta ON inventario.t400_materiales_reservados(t400_propuestas_id);
CREATE INDEX idx_t400_mat_reservados_expira    ON inventario.t400_materiales_reservados(expira_en);
