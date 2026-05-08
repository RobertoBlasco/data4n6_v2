-- ============================================================
-- t200_case_domains (catalog)
-- ============================================================
CREATE TABLE t200_case_domains (
    t200_case_domains_id    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id               UUID            REFERENCES t200_case_domains(t200_case_domains_id),
    name                    VARCHAR(100)    NOT NULL,
    description             TEXT,
    display_order           INTEGER         NOT NULL DEFAULT 0,
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by              VARCHAR(255),
    updated_by              VARCHAR(255),
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX idx_t200_case_domains_parent ON t200_case_domains(parent_id);

-- Raíz
INSERT INTO t200_case_domains (t200_case_domains_id, name, description, display_order, created_by, updated_by) VALUES
    ('00000000-0001-0000-0000-000000000000', 'Terrorismo',            'Delitos de naturaleza terrorista',                            1,  'system', 'system'),
    ('00000000-0002-0000-0000-000000000000', 'Tráfico de Armas',      'Tráfico y tenencia ilícita de armas y explosivos',            2,  'system', 'system'),
    ('00000000-0003-0000-0000-000000000000', 'Contrainteligencia',    'Actividades de espionaje y amenazas a la seguridad nacional', 3,  'system', 'system'),
    ('00000000-0004-0000-0000-000000000000', 'Crimen Organizado',     'Organizaciones criminales y delincuencia organizada',         4,  'system', 'system'),
    ('00000000-0005-0000-0000-000000000000', 'Ciberdelincuencia',     'Delitos informáticos y ciberataques',                         5,  'system', 'system'),
    ('00000000-0006-0000-0000-000000000000', 'Tráfico de Drogas',     'Narcotráfico y delitos relacionados con estupefacientes',     6,  'system', 'system'),
    ('00000000-0007-0000-0000-000000000000', 'Blanqueo de Capitales', 'Delitos económicos y blanqueo de dinero',                     7,  'system', 'system'),
    ('00000000-0099-0000-0000-000000000000', 'Otros',                 'Otros ámbitos de actuación',                                  99, 'system', 'system');

-- Subdominios de Terrorismo
INSERT INTO t200_case_domains (parent_id, name, display_order, created_by, updated_by) VALUES
    ('00000000-0001-0000-0000-000000000000', 'Terrorismo Yihadista',       1, 'system', 'system'),
    ('00000000-0001-0000-0000-000000000000', 'Terrorismo Separatista',     2, 'system', 'system'),
    ('00000000-0001-0000-0000-000000000000', 'Terrorismo Extrema Derecha', 3, 'system', 'system'),
    ('00000000-0001-0000-0000-000000000000', 'Terrorismo Extrema Izquierda', 4, 'system', 'system'),
    ('00000000-0001-0000-0000-000000000000', 'Terrorismo Anarquista',      5, 'system', 'system');

-- Subdominios de Crimen Organizado
INSERT INTO t200_case_domains (parent_id, name, display_order, created_by, updated_by) VALUES
    ('00000000-0004-0000-0000-000000000000', 'Trata de Personas',    1, 'system', 'system'),
    ('00000000-0004-0000-0000-000000000000', 'Extorsión',            2, 'system', 'system'),
    ('00000000-0004-0000-0000-000000000000', 'Fraude Organizado',    3, 'system', 'system');

-- ============================================================
-- t200_classification_level (catalog)
-- ============================================================
CREATE TABLE t200_cases_level (
    t200_cases_level_id             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name                            VARCHAR(100)    NOT NULL,
    level                           INTEGER         NOT NULL,
    description                     TEXT,
    color                           VARCHAR(7),
    is_active                       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at                      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by                      VARCHAR(255),
    updated_by                      VARCHAR(255),
    deleted_at                      TIMESTAMPTZ,
    CONSTRAINT t200_cases_level_name_unique    UNIQUE (name),
    CONSTRAINT t200_cases_level_level_positive CHECK (level > 0)
);

-- ============================================================
-- t100_cases (main entity)
-- ============================================================
CREATE TABLE t100_cases (
    t100_cases_id                   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    code                            VARCHAR(5)      NOT NULL,
    title                           VARCHAR(255)    NOT NULL,
    description                     TEXT,
    status                          VARCHAR(20)     NOT NULL DEFAULT 'OPEN',
    t200_cases_level_id             UUID            REFERENCES t200_cases_level(t200_cases_level_id),
    outcome                         VARCHAR(20),
    closed_date                     DATE,
    outcome_notes                   TEXT,
    outcome_document_id             UUID,           -- FK to document (added when document module is implemented)
    retention_review_date           DATE,
    retention_category              VARCHAR(20),
    created_at                      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by                      VARCHAR(255),
    updated_by                      VARCHAR(255),
    deleted_at                      TIMESTAMPTZ,
    CONSTRAINT t100_cases_code_unique               UNIQUE (code),
    CONSTRAINT t100_cases_status_check              CHECK (status IN (
        'OPEN', 'CLOSED', 'ARCHIVED', 'MERGED'
    )),
    CONSTRAINT t100_cases_outcome_check             CHECK (outcome IN (
        'CONVICTED', 'ACQUITTED', 'DISMISSED', 'ARCHIVED',
        'REFERRED', 'NO_CHARGES', 'OTHER'
    )),
    CONSTRAINT t100_cases_retention_category_check  CHECK (retention_category IN (
        'STANDARD', 'EXTENDED', 'PERMANENT'
    ))
);

CREATE INDEX idx_t100_cases_code        ON t100_cases(code);
CREATE INDEX idx_t100_cases_status      ON t100_cases(status);
CREATE INDEX idx_t100_cases_deleted_at  ON t100_cases(deleted_at);

-- ============================================================
-- t200_case_statuses (catalog)
-- ============================================================
CREATE TABLE t200_case_statuses (
    t200_case_statuses_id   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(100)    NOT NULL,
    color                   VARCHAR(7),
    display_order           INTEGER         NOT NULL DEFAULT 0,
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by              VARCHAR(255),
    updated_by              VARCHAR(255),
    deleted_at              TIMESTAMPTZ,
    CONSTRAINT t200_case_statuses_name_unique UNIQUE (name)
);

CREATE INDEX idx_t200_case_statuses_is_active ON t200_case_statuses(is_active);

-- ============================================================
-- t200_case_outcomes (catalog)
-- ============================================================
CREATE TABLE t200_case_outcomes (
    t200_case_outcomes_id   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(100)    NOT NULL,
    description             TEXT,
    display_order           INTEGER         NOT NULL DEFAULT 0,
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by              VARCHAR(255),
    updated_by              VARCHAR(255),
    deleted_at              TIMESTAMPTZ,
    CONSTRAINT t200_case_outcomes_name_unique UNIQUE (name)
);

CREATE INDEX idx_t200_case_outcomes_is_active ON t200_case_outcomes(is_active);

-- ============================================================
-- t300_case_status_actions (relational)
-- ============================================================
CREATE TABLE t300_case_status_actions (
    t300_case_status_actions_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_case_statuses_id       UUID        NOT NULL REFERENCES t200_case_statuses(t200_case_statuses_id),
    action                      VARCHAR(50) NOT NULL,
    behaviour                   VARCHAR(10) NOT NULL DEFAULT 'INFO',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                  VARCHAR(255),
    updated_by                  VARCHAR(255),
    deleted_at                  TIMESTAMPTZ,
    CONSTRAINT t300_case_status_actions_status_action_unique UNIQUE (t200_case_statuses_id, action),
    CONSTRAINT t300_case_status_actions_behaviour_check      CHECK (behaviour IN ('INFO', 'WARNING', 'CONFIRM'))
);

CREATE INDEX idx_t300_case_status_actions_status ON t300_case_status_actions(t200_case_statuses_id);

-- ============================================================
-- Seed: statuses + actions in one CTE
-- ============================================================
WITH inserted_statuses AS (
    INSERT INTO t200_case_statuses (name, color, display_order, created_by, updated_by) VALUES
        ('Open',     '#22c55e', 1, 'system', 'system'),
        ('Paused',   '#f59e0b', 2, 'system', 'system'),
        ('Finished', '#3b82f6', 3, 'system', 'system'),
        ('Closed',   '#6b7280', 4, 'system', 'system')
    RETURNING t200_case_statuses_id, name
)
INSERT INTO t300_case_status_actions (t200_case_statuses_id, action, behaviour, created_by, updated_by)
SELECT s.t200_case_statuses_id, a.action, a.behaviour, 'system', 'system'
FROM inserted_statuses s
JOIN (VALUES
    -- Open
    ('Open',     'EDIT_CASE',          'INFO'),
    ('Open',     'SET_OUTCOME',        'INFO'),
    ('Open',     'SET_CLASSIFICATION', 'INFO'),
    ('Open',     'ADD_EVENT',          'INFO'),
    ('Open',     'ADD_PERSON',         'INFO'),
    ('Open',     'ADD_DOCUMENT',       'INFO'),
    ('Open',     'ADD_DEADLINE',       'INFO'),
    ('Open',     'PAUSE',              'INFO'),
    ('Open',     'FINISH',             'INFO'),
    ('Open',     'CLOSE',              'WARNING'),
    ('Open',     'MERGE',              'INFO'),
    ('Open',     'GENERATE_REPORT',    'INFO'),
    -- Paused
    ('Paused',   'EDIT_CASE',          'INFO'),
    ('Paused',   'SET_OUTCOME',        'INFO'),
    ('Paused',   'SET_CLASSIFICATION', 'INFO'),
    ('Paused',   'ADD_EVENT',          'WARNING'),
    ('Paused',   'ADD_PERSON',         'INFO'),
    ('Paused',   'ADD_DOCUMENT',       'INFO'),
    ('Paused',   'ADD_DEADLINE',       'INFO'),
    ('Paused',   'RESUME',             'INFO'),
    ('Paused',   'FINISH',             'INFO'),
    ('Paused',   'CLOSE',              'WARNING'),
    ('Paused',   'MERGE',              'WARNING'),
    ('Paused',   'GENERATE_REPORT',    'INFO'),
    -- Finished
    ('Finished', 'EDIT_CASE',          'WARNING'),
    ('Finished', 'SET_OUTCOME',        'INFO'),
    ('Finished', 'SET_CLASSIFICATION', 'INFO'),
    ('Finished', 'ADD_EVENT',          'CONFIRM'),
    ('Finished', 'ADD_PERSON',         'INFO'),
    ('Finished', 'ADD_DOCUMENT',       'INFO'),
    ('Finished', 'ADD_DEADLINE',       'WARNING'),
    ('Finished', 'REOPEN',             'INFO'),
    ('Finished', 'CLOSE',              'INFO'),
    ('Finished', 'MERGE',              'CONFIRM'),
    ('Finished', 'GENERATE_REPORT',    'INFO'),
    -- Closed
    ('Closed',   'EDIT_CASE',          'CONFIRM'),
    ('Closed',   'SET_OUTCOME',        'INFO'),
    ('Closed',   'SET_CLASSIFICATION', 'INFO'),
    ('Closed',   'ADD_EVENT',          'CONFIRM'),
    ('Closed',   'ADD_PERSON',         'WARNING'),
    ('Closed',   'ADD_DOCUMENT',       'INFO'),
    ('Closed',   'ADD_DEADLINE',       'CONFIRM'),
    ('Closed',   'REOPEN',             'CONFIRM'),
    ('Closed',   'MERGE',              'CONFIRM'),
    ('Closed',   'GENERATE_REPORT',    'INFO')
) AS a(status_name, action, behaviour) ON s.name = a.status_name;

-- ============================================================
-- Seed: outcomes
-- ============================================================
INSERT INTO t200_case_outcomes (name, display_order, created_by, updated_by) VALUES
    ('Convicted',   1, 'system', 'system'),
    ('Acquitted',   2, 'system', 'system'),
    ('Dismissed',   3, 'system', 'system'),
    ('Archived',    4, 'system', 'system'),
    ('Referred',    5, 'system', 'system'),
    ('No Charges',  6, 'system', 'system'),
    ('Other',       7, 'system', 'system');

-- ============================================================
-- Alter t100_cases: replace VARCHAR status/outcome with FK references
-- ============================================================
DROP INDEX IF EXISTS idx_t100_cases_status;

ALTER TABLE t100_cases
    ADD COLUMN t200_case_statuses_id UUID REFERENCES t200_case_statuses(t200_case_statuses_id);

UPDATE t100_cases
    SET t200_case_statuses_id = (SELECT t200_case_statuses_id FROM t200_case_statuses WHERE name = 'Open')
    WHERE t200_case_statuses_id IS NULL;

ALTER TABLE t100_cases ALTER COLUMN t200_case_statuses_id SET NOT NULL;

ALTER TABLE t100_cases
    ADD COLUMN t200_case_outcomes_id UUID REFERENCES t200_case_outcomes(t200_case_outcomes_id);

ALTER TABLE t100_cases DROP COLUMN status;
ALTER TABLE t100_cases DROP COLUMN outcome;

CREATE INDEX idx_t100_cases_status ON t100_cases(t200_case_statuses_id);

ALTER TABLE t100_cases
    ADD COLUMN t200_case_domains_id UUID REFERENCES t200_case_domains(t200_case_domains_id);