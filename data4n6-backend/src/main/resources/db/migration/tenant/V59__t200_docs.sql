-- Identity document types (DNI, Passport, NIE, etc.)

CREATE TABLE IF NOT EXISTS common.t200_docs (
    t200_docs_id UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    description  VARCHAR(100) NOT NULL,
    active       BOOLEAN     NOT NULL DEFAULT true,
    deleted_at   TIMESTAMP WITH TIME ZONE
);

-- Register in app tables catalog
INSERT INTO common.t000_app_tables (t000_app_tables_id, table_name, display_name, db_schema, endpoint_base, seccion_menu)
VALUES (gen_random_uuid(), 't200_docs', 'Tipos de Documento', 'common', '/api/v1/catalog/docs', 'common_catalog')
ON CONFLICT (table_name) DO NOTHING;
