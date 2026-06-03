-- Polymorphic attachment tables for the inventory module.
-- t000_app_tables_id + record_id identify any entity record across any table.

CREATE TABLE inventario.t300_notes (
    t300_notes_id      UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    t000_app_tables_id UUID                     NOT NULL REFERENCES common.t000_app_tables(t000_app_tables_id),
    record_id          UUID                     NOT NULL,
    body               TEXT                     NOT NULL,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_t300_notes_entity ON inventario.t300_notes (t000_app_tables_id, record_id);

CREATE TABLE inventario.t300_pictures (
    t300_pictures_id   UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    t000_app_tables_id UUID                     NOT NULL REFERENCES common.t000_app_tables(t000_app_tables_id),
    record_id          UUID                     NOT NULL,
    filename           VARCHAR(255)             NOT NULL,
    mime_type          VARCHAR(100),
    file_path          VARCHAR(500)             NOT NULL,
    caption            TEXT,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_t300_pictures_entity ON inventario.t300_pictures (t000_app_tables_id, record_id);

CREATE TABLE inventario.t300_documents (
    t300_documents_id  UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    t000_app_tables_id UUID                     NOT NULL REFERENCES common.t000_app_tables(t000_app_tables_id),
    record_id          UUID                     NOT NULL,
    filename           VARCHAR(255)             NOT NULL,
    mime_type          VARCHAR(100),
    file_path          VARCHAR(500)             NOT NULL,
    description        TEXT,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_t300_documents_entity ON inventario.t300_documents (t000_app_tables_id, record_id);
