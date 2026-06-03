-- ── t200_materials — materials catalog ────────────────────────────────────────

CREATE TABLE t200_materials (
    t200_materials_id   UUID         NOT NULL PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    created_at          TIMESTAMPTZ  NOT NULL,
    updated_at          TIMESTAMPTZ  NOT NULL,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT t200_materials_name_unique UNIQUE (name)
);
