-- Polymorphic identification document records (t300_docs)
-- Same pattern as t300_pictures and t300_documents

CREATE TABLE inventario.t300_docs (
    t300_docs_id       UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    t000_app_tables_id UUID                     NOT NULL REFERENCES common.t000_app_tables(t000_app_tables_id),
    record_id          UUID                     NOT NULL,
    t200_docs_id       UUID                     REFERENCES common.t200_docs(t200_docs_id),
    numero             VARCHAR(100)             NOT NULL,
    fecha_caducidad    DATE,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_t300_docs_entity ON inventario.t300_docs (t000_app_tables_id, record_id);
