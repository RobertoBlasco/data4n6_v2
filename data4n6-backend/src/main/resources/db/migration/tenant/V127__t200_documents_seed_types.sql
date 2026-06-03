-- Fixed document types with stable UUIDs so they can be referenced from application code

INSERT INTO common.t200_documents (t200_documents_id, name, active)
VALUES
    ('c1000000-0000-0000-0000-000000000001', 'TIP',       true),
    ('c1000000-0000-0000-0000-000000000002', 'TIM',       true),
    ('c1000000-0000-0000-0000-000000000003', 'DNI',       true),
    ('c1000000-0000-0000-0000-000000000004', 'Pasaporte', true)
ON CONFLICT (t200_documents_id) DO NOTHING;
