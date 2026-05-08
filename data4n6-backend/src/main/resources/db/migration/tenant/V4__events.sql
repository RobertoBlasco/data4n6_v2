-- ============================================================
-- t200_event_statuses (catalog)
-- ============================================================
CREATE TABLE t200_event_statuses (
    t200_event_statuses_id  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(100)    NOT NULL,
    color                   VARCHAR(7),
    display_order           INTEGER         NOT NULL DEFAULT 0,
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by              VARCHAR(255),
    updated_by              VARCHAR(255),
    deleted_at              TIMESTAMPTZ,
    CONSTRAINT t200_event_statuses_name_unique UNIQUE (name)
);

CREATE INDEX idx_t200_event_statuses_is_active ON t200_event_statuses(is_active);

-- ============================================================
-- t300_event_status_actions (relational)
-- ============================================================
CREATE TABLE t300_event_status_actions (
    t300_event_status_actions_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_event_statuses_id       UUID        NOT NULL REFERENCES t200_event_statuses(t200_event_statuses_id),
    action                       VARCHAR(50) NOT NULL,
    behaviour                    VARCHAR(10) NOT NULL DEFAULT 'INFO',
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                   VARCHAR(255),
    updated_by                   VARCHAR(255),
    deleted_at                   TIMESTAMPTZ,
    CONSTRAINT t300_event_status_actions_status_action_unique UNIQUE (t200_event_statuses_id, action),
    CONSTRAINT t300_event_status_actions_behaviour_check      CHECK (behaviour IN ('INFO', 'WARNING', 'CONFIRM'))
);

CREATE INDEX idx_t300_event_status_actions_status ON t300_event_status_actions(t200_event_statuses_id);

-- Seed: statuses + actions
WITH inserted_statuses AS (
    INSERT INTO t200_event_statuses (name, color, display_order, created_by, updated_by) VALUES
        ('Planned',     '#3b82f6', 1, 'system', 'system'),
        ('In Progress', '#f59e0b', 2, 'system', 'system'),
        ('Paused',      '#a855f7', 3, 'system', 'system'),
        ('Completed',   '#22c55e', 4, 'system', 'system'),
        ('Closed',      '#6b7280', 5, 'system', 'system')
    RETURNING t200_event_statuses_id, name
)
INSERT INTO t300_event_status_actions (t200_event_statuses_id, action, behaviour, created_by, updated_by)
SELECT s.t200_event_statuses_id, a.action, a.behaviour, 'system', 'system'
FROM inserted_statuses s
JOIN (VALUES
    ('Planned',     'EDIT_EVENT',       'INFO'),
    ('Planned',     'ADD_EXHIBIT',      'INFO'),
    ('Planned',     'ADD_DOCUMENT',     'INFO'),
    ('Planned',     'ADD_PERSON',       'INFO'),
    ('Planned',     'START',            'INFO'),
    ('Planned',     'PAUSE',            'INFO'),
    ('Planned',     'COMPLETE',         'WARNING'),
    ('Planned',     'CLOSE',            'WARNING'),
    ('Planned',     'GENERATE_REPORT',  'INFO'),
    ('In Progress', 'EDIT_EVENT',       'INFO'),
    ('In Progress', 'ADD_EXHIBIT',      'INFO'),
    ('In Progress', 'ADD_DOCUMENT',     'INFO'),
    ('In Progress', 'ADD_PERSON',       'INFO'),
    ('In Progress', 'PAUSE',            'INFO'),
    ('In Progress', 'COMPLETE',         'INFO'),
    ('In Progress', 'CLOSE',            'WARNING'),
    ('In Progress', 'GENERATE_REPORT',  'INFO'),
    ('Paused',      'EDIT_EVENT',       'INFO'),
    ('Paused',      'ADD_EXHIBIT',      'WARNING'),
    ('Paused',      'ADD_DOCUMENT',     'INFO'),
    ('Paused',      'ADD_PERSON',       'INFO'),
    ('Paused',      'RESUME',           'INFO'),
    ('Paused',      'COMPLETE',         'WARNING'),
    ('Paused',      'CLOSE',            'WARNING'),
    ('Paused',      'GENERATE_REPORT',  'INFO'),
    ('Completed',   'EDIT_EVENT',       'WARNING'),
    ('Completed',   'ADD_EXHIBIT',      'WARNING'),
    ('Completed',   'ADD_DOCUMENT',     'INFO'),
    ('Completed',   'ADD_PERSON',       'WARNING'),
    ('Completed',   'REOPEN',           'INFO'),
    ('Completed',   'CLOSE',            'INFO'),
    ('Completed',   'GENERATE_REPORT',  'INFO'),
    ('Closed',      'EDIT_EVENT',       'CONFIRM'),
    ('Closed',      'ADD_EXHIBIT',      'CONFIRM'),
    ('Closed',      'ADD_DOCUMENT',     'INFO'),
    ('Closed',      'ADD_PERSON',       'CONFIRM'),
    ('Closed',      'REOPEN',           'CONFIRM'),
    ('Closed',      'GENERATE_REPORT',  'INFO')
) AS a(status_name, action, behaviour) ON s.name = a.status_name;

-- ============================================================
-- t100_events (main entity)
-- ============================================================
CREATE TABLE t100_events (
    t100_events_id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    t100_cases_id               UUID            NOT NULL REFERENCES t100_cases(t100_cases_id),
    t200_event_statuses_id      UUID            NOT NULL REFERENCES t200_event_statuses(t200_event_statuses_id),
    title                       VARCHAR(255)    NOT NULL,
    description                 TEXT,
    location_address            TEXT,
    location_city               VARCHAR(100),
    location_coordinates        VARCHAR(50),
    t200_countries_id           UUID            REFERENCES t200_countries(t200_countries_id),
    t200_admin_divisions_id     UUID            REFERENCES t200_admin_divisions(t200_admin_divisions_id),
    scheduled_at                TIMESTAMPTZ,
    started_at                  TIMESTAMPTZ,
    completed_at                TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by                  VARCHAR(255),
    updated_by                  VARCHAR(255),
    deleted_at                  TIMESTAMPTZ
);

CREATE INDEX idx_t100_events_case       ON t100_events(t100_cases_id);
CREATE INDEX idx_t100_events_status     ON t100_events(t200_event_statuses_id);
CREATE INDEX idx_t100_events_deleted_at ON t100_events(deleted_at);
