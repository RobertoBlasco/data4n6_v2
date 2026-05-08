-- ============================================================
-- t200_person_roles — roles de persona (catálogo)
-- ============================================================
CREATE TABLE t200_person_roles (
    t200_person_roles_id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    code                    VARCHAR(30)  NOT NULL,
    name                    VARCHAR(100) NOT NULL,
    description             TEXT,
    display_order           INTEGER      NOT NULL DEFAULT 0,
    is_active               BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by              VARCHAR(255),
    updated_by              VARCHAR(255),
    deleted_at              TIMESTAMPTZ,
    CONSTRAINT t200_person_roles_code_unique UNIQUE (code)
);

INSERT INTO t200_person_roles (code, name, display_order, created_by, updated_by) VALUES
    ('AGENT',        'Agente',                          1,  'system', 'system'),
    ('DETAINEE',     'Detenido',                        2,  'system', 'system'),
    ('SUSPECT',      'Investigado',                     3,  'system', 'system'),
    ('WITNESS',      'Testigo',                         4,  'system', 'system'),
    ('VICTIM',       'Víctima',                         5,  'system', 'system'),
    ('EXPERT',       'Perito',                          6,  'system', 'system'),
    ('LAJ',          'Letrado de la Administración de Justicia', 7, 'system', 'system'),
    ('LAWYER',       'Abogado defensor',                8,  'system', 'system'),
    ('PROSECUTOR',   'Fiscal',                          9,  'system', 'system'),
    ('OTHER',        'Otro',                            99, 'system', 'system');

-- ============================================================
-- t100_persons — personas
-- ============================================================
CREATE TABLE t100_persons (
    t100_persons_id UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(200) NOT NULL,
    national_id     VARCHAR(30),
    date_of_birth   DATE,
    gender          VARCHAR(10),
    phone           VARCHAR(30),
    email           VARCHAR(255),
    address         TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT t100_persons_gender_check CHECK (gender IN ('M', 'F', 'OTHER'))
);

CREATE INDEX idx_t100_persons_national_id ON t100_persons(national_id);
CREATE INDEX idx_t100_persons_deleted_at  ON t100_persons(deleted_at);

-- ============================================================
-- t100_person_links — vínculos polimórficos persona ↔ entidad
-- Clave única: una persona tiene un rol específico por registro
-- ============================================================
CREATE TABLE t100_person_links (
    t100_person_links_id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    t100_persons_id         UUID        NOT NULL REFERENCES t100_persons(t100_persons_id),
    t000_app_tables_id      UUID        NOT NULL REFERENCES t000_app_tables(t000_app_tables_id),
    record_id               UUID        NOT NULL,
    t200_person_roles_id    UUID        NOT NULL REFERENCES t200_person_roles(t200_person_roles_id),
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              VARCHAR(255),
    CONSTRAINT t100_person_links_unique UNIQUE (t100_persons_id, t000_app_tables_id, record_id, t200_person_roles_id)
);

CREATE INDEX idx_t100_person_links_person   ON t100_person_links(t100_persons_id);
CREATE INDEX idx_t100_person_links_entity   ON t100_person_links(t000_app_tables_id, record_id);
