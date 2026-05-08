-- ============================================================
-- t200_exhibit_statuses (catalog)
-- ============================================================
CREATE TABLE t200_exhibit_statuses (
    t200_exhibit_statuses_id    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name                        VARCHAR(100)    NOT NULL,
    color                       VARCHAR(7),
    display_order               INTEGER         NOT NULL DEFAULT 0,
    is_active                   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by                  VARCHAR(255),
    updated_by                  VARCHAR(255),
    deleted_at                  TIMESTAMPTZ,
    CONSTRAINT t200_exhibit_statuses_name_unique UNIQUE (name)
);

CREATE INDEX idx_t200_exhibit_statuses_is_active ON t200_exhibit_statuses(is_active);

-- ============================================================
-- t300_exhibit_status_actions (workflow)
-- ============================================================
CREATE TABLE t300_exhibit_status_actions (
    t300_exhibit_status_actions_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_exhibit_statuses_id        UUID        NOT NULL REFERENCES t200_exhibit_statuses(t200_exhibit_statuses_id),
    action                          VARCHAR(50) NOT NULL,
    behaviour                       VARCHAR(10) NOT NULL DEFAULT 'INFO',
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                      VARCHAR(255),
    updated_by                      VARCHAR(255),
    deleted_at                      TIMESTAMPTZ,
    CONSTRAINT t300_exhibit_status_actions_status_action_unique UNIQUE (t200_exhibit_statuses_id, action),
    CONSTRAINT t300_exhibit_status_actions_behaviour_check CHECK (behaviour IN ('INFO', 'WARNING', 'CONFIRM'))
);

CREATE INDEX idx_t300_exhibit_status_actions_status ON t300_exhibit_status_actions(t200_exhibit_statuses_id);

-- ============================================================
-- Seeds: statuses + actions
-- ============================================================
WITH inserted_statuses AS (
    INSERT INTO t200_exhibit_statuses (name, color, display_order, created_by, updated_by) VALUES
        ('Seized',    '#f59e0b', 1, 'system', 'system'),
        ('Stored',    '#3b82f6', 2, 'system', 'system'),
        ('Retrieved', '#a855f7', 3, 'system', 'system'),
        ('Returned',  '#22c55e', 4, 'system', 'system'),
        ('Destroyed', '#6b7280', 5, 'system', 'system')
    RETURNING t200_exhibit_statuses_id, name
)
INSERT INTO t300_exhibit_status_actions (t200_exhibit_statuses_id, action, behaviour, created_by, updated_by)
SELECT s.t200_exhibit_statuses_id, a.action, a.behaviour, 'system', 'system'
FROM inserted_statuses s
JOIN (VALUES
    ('Seized',    'EDIT_EXHIBIT',      'INFO'),
    ('Seized',    'ADD_EVIDENCE',      'INFO'),
    ('Seized',    'ADD_PHOTO',         'INFO'),
    ('Seized',    'ADD_DOCUMENT',      'INFO'),
    ('Seized',    'STORE',             'INFO'),
    ('Seized',    'GENERATE_REPORT',   'INFO'),
    ('Stored',    'EDIT_EXHIBIT',      'INFO'),
    ('Stored',    'ADD_EVIDENCE',      'INFO'),
    ('Stored',    'ADD_PHOTO',         'INFO'),
    ('Stored',    'ADD_DOCUMENT',      'INFO'),
    ('Stored',    'RETRIEVE',          'INFO'),
    ('Stored',    'RETURN',            'WARNING'),
    ('Stored',    'DESTROY',           'CONFIRM'),
    ('Stored',    'GENERATE_REPORT',   'INFO'),
    ('Retrieved', 'EDIT_EXHIBIT',      'INFO'),
    ('Retrieved', 'ADD_EVIDENCE',      'WARNING'),
    ('Retrieved', 'ADD_PHOTO',         'INFO'),
    ('Retrieved', 'ADD_DOCUMENT',      'INFO'),
    ('Retrieved', 'STORE',             'INFO'),
    ('Retrieved', 'RETURN',            'INFO'),
    ('Retrieved', 'DESTROY',           'CONFIRM'),
    ('Retrieved', 'GENERATE_REPORT',   'INFO'),
    ('Returned',  'EDIT_EXHIBIT',      'CONFIRM'),
    ('Returned',  'ADD_DOCUMENT',      'INFO'),
    ('Returned',  'GENERATE_REPORT',   'INFO'),
    ('Destroyed', 'ADD_DOCUMENT',      'INFO'),
    ('Destroyed', 'GENERATE_REPORT',   'INFO')
) AS a(status_name, action, behaviour) ON s.name = a.status_name;

-- ============================================================
-- t100_exhibits (main entity)
-- ============================================================
CREATE TABLE t100_exhibits (
    t100_exhibits_id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    t100_events_id              UUID            NOT NULL REFERENCES t100_events(t100_events_id),
    t200_exhibit_statuses_id    UUID            NOT NULL REFERENCES t200_exhibit_statuses(t200_exhibit_statuses_id),
    sequence_number             INTEGER         NOT NULL,
    description                 TEXT            NOT NULL,
    make                        VARCHAR(100),
    model                       VARCHAR(100),
    serial_number               VARCHAR(100),
    condition                   VARCHAR(30)     NOT NULL DEFAULT 'INTACT',
    field_location              TEXT,
    notes                       TEXT,
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by                  VARCHAR(255),
    updated_by                  VARCHAR(255),
    deleted_at                  TIMESTAMPTZ,
    CONSTRAINT t100_exhibits_sequence_event_unique  UNIQUE (t100_events_id, sequence_number),
    CONSTRAINT t100_exhibits_condition_check CHECK (condition IN (
        'INTACT', 'DAMAGED', 'UNDER_REPAIR', 'REPAIRED',
        'IRREPARABLE', 'NOT_APPLICABLE', 'REGISTERED_IN_ERROR'
    ))
);

CREATE INDEX idx_t100_exhibits_event      ON t100_exhibits(t100_events_id);
CREATE INDEX idx_t100_exhibits_status     ON t100_exhibits(t200_exhibit_statuses_id);
CREATE INDEX idx_t100_exhibits_deleted_at ON t100_exhibits(deleted_at);
