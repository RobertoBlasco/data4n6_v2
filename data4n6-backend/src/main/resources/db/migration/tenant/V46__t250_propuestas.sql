-- Conflict-resolution matrix for pending proposals.
-- When an event is executed on an article, this table defines what happens
-- to each type of pending proposal on that same article:
--   cancela = true  → cancel the pending proposal and notify the proposer
--   cancela = false → keep the proposal open, show an informational warning

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t250_propuestas', 'Conflictos de propuesta', 'Comportamiento de propuestas pendientes al ejecutar un evento sobre un artículo')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t250_propuestas (
    t200_eventos_id_ejecutado  UUID    NOT NULL REFERENCES inventario.t200_eventos(t200_eventos_id),
    t200_eventos_id_propuesta  UUID    NOT NULL REFERENCES inventario.t200_eventos(t200_eventos_id),
    cancela                    BOOLEAN NOT NULL,
    PRIMARY KEY (t200_eventos_id_ejecutado, t200_eventos_id_propuesta)
);

CREATE INDEX idx_t250_propuestas_ejecutado ON inventario.t250_propuestas(t200_eventos_id_ejecutado);

-- Fixed IDs (from V27):
--   002 = Traspaso Almacén  (TRS)
--   003 = Adjudicación      (ADJ)
--   004 = Préstamo          (PRS)
--   006 = Baja              (BAJ)
--   007 = Devolución Préstamo
--   009 = Devolución Adjudicación

INSERT INTO inventario.t250_propuestas (t200_eventos_id_ejecutado, t200_eventos_id_propuesta, cancela) VALUES
    -- Traspaso ejecutado: artículo sigue en almacén → todas las propuestas siguen siendo posibles
    ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', false),
    ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', false),
    ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', false),
    ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', false),

    -- Adjudicación ejecutada: artículo ya no en almacén → TRS/ADJ/PRS inviables
    ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', true),
    ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', true),
    ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', true),
    ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', false),

    -- Préstamo ejecutado: artículo prestado → TRS/ADJ/PRS inviables
    ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', true),
    ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', true),
    ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', true),
    ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', false),

    -- Baja ejecutada: estado terminal → todas las propuestas pendientes se cancelan
    ('10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', true),
    ('10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', true),
    ('10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', true),
    ('10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', true),

    -- Devolución Préstamo: artículo vuelve a almacén → todas las propuestas siguen siendo posibles
    ('10000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', false),
    ('10000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', false),
    ('10000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', false),
    ('10000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', false),

    -- Devolución Adjudicación: artículo vuelve a almacén → ídem
    ('10000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', false),
    ('10000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', false),
    ('10000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000004', false),
    ('10000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000006', false);
