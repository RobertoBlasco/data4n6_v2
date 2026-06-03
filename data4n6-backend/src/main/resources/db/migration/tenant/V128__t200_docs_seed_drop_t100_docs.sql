-- TIP/TIM/DNI/Pasaporte belong in t200_docs (ID document types), not in t200_documents.
-- t100_docs (specific ID document instances) is superseded by the future t300_docs polymorphic table.

-- ── 1. Remove wrong seed from t200_documents ────────────────────────────────

DELETE FROM common.t200_documents
WHERE t200_documents_id IN (
    'c1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000004'
);

-- ── 2. Seed t200_docs with stable UUIDs ─────────────────────────────────────

INSERT INTO common.t200_docs (t200_docs_id, description, active)
VALUES
    ('d1000000-0000-0000-0000-000000000001', 'TIP',       true),
    ('d1000000-0000-0000-0000-000000000002', 'TIM',       true),
    ('d1000000-0000-0000-0000-000000000003', 'DNI',       true),
    ('d1000000-0000-0000-0000-000000000004', 'Pasaporte', true)
ON CONFLICT (t200_docs_id) DO NOTHING;

-- ── 3. Drop t100_docs (superseded by t300_docs polymorphic table) ────────────

DELETE FROM common.t900_table_fields
WHERE t000_app_tables_id = (
    SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_docs'
);

DELETE FROM common.t000_app_tables WHERE table_name = 't100_docs';

DROP TABLE IF EXISTS common.t100_docs;
