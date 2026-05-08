-- ============================================================
-- t200_evidence_statuses (catalog)
-- ============================================================
CREATE TABLE t200_evidence_statuses (
    t200_evidence_statuses_id   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name                        VARCHAR(100)    NOT NULL,
    color                       VARCHAR(7),
    display_order               INTEGER         NOT NULL DEFAULT 0,
    is_active                   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by                  VARCHAR(255),
    updated_by                  VARCHAR(255),
    deleted_at                  TIMESTAMPTZ,
    CONSTRAINT t200_evidence_statuses_name_unique UNIQUE (name)
);

CREATE INDEX idx_t200_evidence_statuses_is_active ON t200_evidence_statuses(is_active);

-- ============================================================
-- t300_evidence_status_actions (workflow)
-- ============================================================
CREATE TABLE t300_evidence_status_actions (
    t300_evidence_status_actions_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_evidence_statuses_id       UUID        NOT NULL REFERENCES t200_evidence_statuses(t200_evidence_statuses_id),
    action                          VARCHAR(50) NOT NULL,
    behaviour                       VARCHAR(10) NOT NULL DEFAULT 'INFO',
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                      VARCHAR(255),
    updated_by                      VARCHAR(255),
    deleted_at                      TIMESTAMPTZ,
    CONSTRAINT t300_evidence_status_actions_status_action_unique UNIQUE (t200_evidence_statuses_id, action),
    CONSTRAINT t300_evidence_status_actions_behaviour_check CHECK (behaviour IN ('INFO', 'WARNING', 'CONFIRM'))
);

CREATE INDEX idx_t300_evidence_status_actions_status ON t300_evidence_status_actions(t200_evidence_statuses_id);

-- ============================================================
-- Seeds: statuses + actions
-- ============================================================
WITH inserted_statuses AS (
    INSERT INTO t200_evidence_statuses (name, color, display_order, created_by, updated_by) VALUES
        ('Seized',               '#f59e0b', 1, 'system', 'system'),
        ('Acquired',             '#3b82f6', 2, 'system', 'system'),
        ('Preliminary Analysis', '#a855f7', 3, 'system', 'system'),
        ('Final Analysis',       '#22c55e', 4, 'system', 'system'),
        ('Inadmissible',         '#ef4444', 5, 'system', 'system')
    RETURNING t200_evidence_statuses_id, name
)
INSERT INTO t300_evidence_status_actions (t200_evidence_statuses_id, action, behaviour, created_by, updated_by)
SELECT s.t200_evidence_statuses_id, a.action, a.behaviour, 'system', 'system'
FROM inserted_statuses s
JOIN (VALUES
    ('Seized',               'EDIT_EVIDENCE',      'INFO'),
    ('Seized',               'ADD_PHOTO',           'INFO'),
    ('Seized',               'ADD_DOCUMENT',        'INFO'),
    ('Seized',               'START_ACQUISITION',   'INFO'),
    ('Seized',               'GENERATE_REPORT',     'INFO'),
    ('Acquired',             'EDIT_EVIDENCE',       'INFO'),
    ('Acquired',             'ADD_PHOTO',           'INFO'),
    ('Acquired',             'ADD_DOCUMENT',        'INFO'),
    ('Acquired',             'START_ANALYSIS',      'INFO'),
    ('Acquired',             'VERIFY_HASH',         'INFO'),
    ('Acquired',             'GENERATE_REPORT',     'INFO'),
    ('Preliminary Analysis', 'EDIT_EVIDENCE',       'WARNING'),
    ('Preliminary Analysis', 'ADD_PHOTO',           'INFO'),
    ('Preliminary Analysis', 'ADD_DOCUMENT',        'INFO'),
    ('Preliminary Analysis', 'COMPLETE_ANALYSIS',   'INFO'),
    ('Preliminary Analysis', 'GENERATE_REPORT',     'INFO'),
    ('Final Analysis',       'EDIT_EVIDENCE',       'CONFIRM'),
    ('Final Analysis',       'ADD_DOCUMENT',        'INFO'),
    ('Final Analysis',       'REOPEN_ANALYSIS',     'CONFIRM'),
    ('Final Analysis',       'GENERATE_REPORT',     'INFO'),
    ('Inadmissible',         'ADD_DOCUMENT',        'INFO'),
    ('Inadmissible',         'GENERATE_REPORT',     'INFO')
) AS a(status_name, action, behaviour) ON s.name = a.status_name;

-- ============================================================
-- t100_evidence (main entity)
-- ============================================================
CREATE TABLE t100_evidence (
    t100_evidence_id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    t100_events_id              UUID            NOT NULL REFERENCES t100_events(t100_events_id),
    t100_exhibits_id            UUID            REFERENCES t100_exhibits(t100_exhibits_id),
    t200_evidence_statuses_id   UUID            NOT NULL REFERENCES t200_evidence_statuses(t200_evidence_statuses_id),
    sequence_number             INTEGER         NOT NULL,
    description                 TEXT            NOT NULL,
    condition                   VARCHAR(30)     NOT NULL DEFAULT 'INTACT',
    hash_md5                    VARCHAR(32),
    hash_sha256                 VARCHAR(64),
    size_bytes                  BIGINT,
    notes                       TEXT,
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by                  VARCHAR(255),
    updated_by                  VARCHAR(255),
    deleted_at                  TIMESTAMPTZ,
    CONSTRAINT t100_evidence_sequence_event_unique UNIQUE (t100_events_id, sequence_number),
    CONSTRAINT t100_evidence_condition_check CHECK (condition IN (
        'INTACT', 'DAMAGED', 'UNDER_REPAIR', 'REPAIRED',
        'IRREPARABLE', 'NOT_APPLICABLE', 'REGISTERED_IN_ERROR'
    ))
);

CREATE INDEX idx_t100_evidence_event      ON t100_evidence(t100_events_id);
CREATE INDEX idx_t100_evidence_exhibit    ON t100_evidence(t100_exhibits_id);
CREATE INDEX idx_t100_evidence_status     ON t100_evidence(t200_evidence_statuses_id);
CREATE INDEX idx_t100_evidence_hash_md5   ON t100_evidence(hash_md5);
CREATE INDEX idx_t100_evidence_hash_sha256 ON t100_evidence(hash_sha256);
CREATE INDEX idx_t100_evidence_deleted_at ON t100_evidence(deleted_at);
