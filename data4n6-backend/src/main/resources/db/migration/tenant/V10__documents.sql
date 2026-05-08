-- ============================================================
-- t100_documents — documentos adjuntos polimórficos
-- ============================================================
CREATE TABLE t100_documents (
    t100_documents_id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    t000_app_tables_id  UUID         NOT NULL REFERENCES t000_app_tables(t000_app_tables_id),
    record_id           UUID         NOT NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    original_filename   VARCHAR(500) NOT NULL,
    stored_filename     VARCHAR(500) NOT NULL,
    mime_type           VARCHAR(100),
    file_size_bytes     BIGINT,
    file_path           TEXT         NOT NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by          VARCHAR(255),
    updated_by          VARCHAR(255),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_t100_documents_entity ON t100_documents(t000_app_tables_id, record_id);
CREATE INDEX idx_t100_documents_deleted_at ON t100_documents(deleted_at);
