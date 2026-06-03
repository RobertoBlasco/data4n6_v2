-- Add proposal-workflow columns to t200_eventos.
-- permite_propuesta: marks events that can have a prior proposal.
-- prefijo_referencia: prefix used for proposal reference numbers (e.g. TRS-2026-00001).

ALTER TABLE inventario.t200_eventos
    ADD COLUMN permite_propuesta  BOOLEAN     NOT NULL DEFAULT false,
    ADD COLUMN prefijo_referencia VARCHAR(10);

UPDATE inventario.t200_eventos SET permite_propuesta = true, prefijo_referencia = 'TRS'
WHERE t200_eventos_id = '10000000-0000-0000-0000-000000000002';

UPDATE inventario.t200_eventos SET permite_propuesta = true, prefijo_referencia = 'ADJ'
WHERE t200_eventos_id = '10000000-0000-0000-0000-000000000003';

UPDATE inventario.t200_eventos SET permite_propuesta = true, prefijo_referencia = 'PRS'
WHERE t200_eventos_id = '10000000-0000-0000-0000-000000000004';

UPDATE inventario.t200_eventos SET permite_propuesta = true, prefijo_referencia = 'BAJ'
WHERE t200_eventos_id = '10000000-0000-0000-0000-000000000006';

ALTER TABLE inventario.t200_eventos
    ADD CONSTRAINT t200_eventos_prefijo_referencia_uq UNIQUE (prefijo_referencia);
