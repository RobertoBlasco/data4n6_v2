-- t400_propuestas: proposal documents
-- A proposal is a request for an inventory operation, subject to approval.
-- References are generated as PREFIX-YYYY-NNNNN (e.g. ENT-2026-00001).
-- t400_propuestas_contador provides per-type-per-year sequences locked with SELECT FOR UPDATE.

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t400_propuestas', 'Propuestas', 'Propuestas de operación de inventario pendientes de aprobación')
ON CONFLICT (table_name) DO NOTHING;

-- Sequence counter — one row per (proposal_type × year), updated under pessimistic lock
CREATE TABLE inventario.t400_propuestas_contador (
    t200_propuestas_id  UUID     NOT NULL REFERENCES inventario.t200_propuestas(t200_propuestas_id),
    anio                SMALLINT NOT NULL,
    ultimo_numero       INT      NOT NULL DEFAULT 0,
    PRIMARY KEY (t200_propuestas_id, anio)
);

-- Proposal documents
CREATE TABLE inventario.t400_propuestas (
    t400_propuestas_id  UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_propuestas_id  UUID         NOT NULL REFERENCES inventario.t200_propuestas(t200_propuestas_id),
    numero_referencia   VARCHAR(30)  NOT NULL,
    estado              VARCHAR(20)  NOT NULL DEFAULT 'borrador',
    t100_casos_id       UUID         REFERENCES data4n6.t100_cases(t100_cases_id),
    realizado_por       VARCHAR(100),
    notas               TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT t400_propuestas_referencia_uq UNIQUE (numero_referencia),
    CONSTRAINT t400_propuestas_estado_chk CHECK (
        estado IN ('borrador', 'enviada', 'aprobada', 'rechazada', 'cancelada')
    )
);

CREATE INDEX idx_t400_propuestas_tipo   ON inventario.t400_propuestas(t200_propuestas_id);
CREATE INDEX idx_t400_propuestas_estado ON inventario.t400_propuestas(estado);
CREATE INDEX idx_t400_propuestas_caso   ON inventario.t400_propuestas(t100_casos_id);
