-- Fixed picture types with stable UUIDs so they can be referenced from application code

INSERT INTO common.t200_pictures (t200_pictures_id, name, active)
VALUES
    ('b1000000-0000-0000-0000-000000000001', 'Signature', true),
    ('b1000000-0000-0000-0000-000000000002', 'Portrait',  true),
    ('b1000000-0000-0000-0000-000000000003', 'Scene',     true),
    ('b1000000-0000-0000-0000-000000000004', 'Evidence',  true)
ON CONFLICT (t200_pictures_id) DO NOTHING;
