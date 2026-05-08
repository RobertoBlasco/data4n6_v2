-- ============================================================
-- t200_units — unidades de la organización (catálogo jerárquico)
-- ============================================================
CREATE TABLE t200_units (
    t200_units_id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id       UUID         REFERENCES t200_units(t200_units_id),
    code            VARCHAR(20)  NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT t200_units_code_unique UNIQUE (code)
);

CREATE INDEX idx_t200_units_parent ON t200_units(parent_id);

-- ============================================================
-- t100_cases_units — casos ↔ unidades (N:M)
-- ============================================================
CREATE TABLE t100_cases_units (
    t100_cases_id   UUID NOT NULL REFERENCES t100_cases(t100_cases_id),
    t200_units_id   UUID NOT NULL REFERENCES t200_units(t200_units_id),
    PRIMARY KEY (t100_cases_id, t200_units_id)
);

-- ============================================================
-- t100_events_units — eventos ↔ unidades (N:M)
-- ============================================================
CREATE TABLE t100_events_units (
    t100_events_id  UUID NOT NULL REFERENCES t100_events(t100_events_id),
    t200_units_id   UUID NOT NULL REFERENCES t200_units(t200_units_id),
    PRIMARY KEY (t100_events_id, t200_units_id)
);

-- ============================================================
-- Seed: estructura de ejemplo
-- ============================================================
INSERT INTO t200_units (t200_units_id, code, name, description, created_by, updated_by) VALUES
    ('10000000-0000-0000-0000-000000000001', 'UCO',   'Unidad Central Operativa',       'Unidad central de investigación criminal', 'system', 'system'),
    ('10000000-0000-0000-0000-000000000002', 'UDEF',  'Unidad de Delitos Económicos',   'Delitos económicos y fiscales',            'system', 'system'),
    ('10000000-0000-0000-0000-000000000003', 'EDITE', 'Equipo de Delitos Telemáticos',  'Ciberdelincuencia e informática forense',  'system', 'system');

INSERT INTO t200_units (parent_id, code, name, created_by, updated_by) VALUES
    ('10000000-0000-0000-0000-000000000001', 'UCO-1', 'Sección de Análisis',    'system', 'system'),
    ('10000000-0000-0000-0000-000000000001', 'UCO-2', 'Sección de Operaciones', 'system', 'system'),
    ('10000000-0000-0000-0000-000000000003', 'EDITE-1', 'Grupo de Intrusiones', 'system', 'system'),
    ('10000000-0000-0000-0000-000000000003', 'EDITE-2', 'Grupo de Fraude Online', 'system', 'system');
