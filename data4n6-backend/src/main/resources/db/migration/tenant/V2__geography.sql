-- ============================================================
-- t200_countries (catalog)
-- ============================================================
CREATE TABLE t200_countries (
    t200_countries_id   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    iso_code_2          CHAR(2)         NOT NULL,
    iso_code_3          CHAR(3)         NOT NULL,
    country_name        VARCHAR(100)    NOT NULL,
    phone_prefix        VARCHAR(10),
    currency_code       CHAR(3),
    flag_emoji          VARCHAR(8),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by          VARCHAR(255),
    updated_by          VARCHAR(255),
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT t200_countries_iso_code_2_unique UNIQUE (iso_code_2),
    CONSTRAINT t200_countries_iso_code_3_unique UNIQUE (iso_code_3),
    CONSTRAINT t200_countries_name_unique     UNIQUE (country_name)
);

CREATE INDEX idx_t200_countries_iso_code_2  ON t200_countries(iso_code_2);
CREATE INDEX idx_t200_countries_iso_code_3  ON t200_countries(iso_code_3);
CREATE INDEX idx_t200_countries_country_name ON t200_countries(country_name);
CREATE INDEX idx_t200_countries_is_active ON t200_countries(is_active);

-- ============================================================
-- t200_administrative_divisions (catalog)
-- ============================================================
CREATE TABLE t200_admin_divisions (
    t200_admin_divisions_id             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_countries_id                   UUID            NOT NULL REFERENCES t200_countries(t200_countries_id),
    iso_code                            VARCHAR(10),    -- ISO 3166-2 e.g. ES-MD, FR-75
    name                                VARCHAR(100)    NOT NULL,
    type                                VARCHAR(50),    -- Province, State, Region, County...
    is_active                           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at                          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by                          VARCHAR(255),
    updated_by                          VARCHAR(255),
    deleted_at                          TIMESTAMPTZ,
    CONSTRAINT t200_admin_divisions_iso_code_unique UNIQUE (iso_code)
);

CREATE INDEX idx_t200_admin_divisions_country   ON t200_admin_divisions(t200_countries_id);
CREATE INDEX idx_t200_admin_divisions_is_active ON t200_admin_divisions(is_active);

