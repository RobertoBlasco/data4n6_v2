-- t600_ordenes: order documents — the executed form of an approved proposal
-- Created automatically when a proposal transitions to 'aprobada'.
-- Immutable once created; status changes tracked in t300_eventos.

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t600_ordenes', 'Órdenes', 'Órdenes de inventario derivadas de propuestas aprobadas')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t600_ordenes (
    t600_ordenes_id    UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    t400_propuestas_id UUID         NOT NULL UNIQUE REFERENCES inventario.t400_propuestas(t400_propuestas_id),
    numero_referencia  VARCHAR(30)  NOT NULL UNIQUE,
    aprobado_por       VARCHAR(100),
    aprobado_en        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    notas              TEXT,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_t600_ordenes_propuesta ON inventario.t600_ordenes(t400_propuestas_id);
