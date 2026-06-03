-- Migrate t400_propuestas from t200_propuestas_id FK to t200_eventos_id FK.
-- ENT proposals are removed (no corresponding event with permite_propuesta).

ALTER TABLE inventario.t400_propuestas
    ADD COLUMN t200_eventos_id UUID;

-- Map via prefijo_referencia == descripcion_corta in t200_propuestas
UPDATE inventario.t400_propuestas p
SET t200_eventos_id = e.t200_eventos_id
FROM inventario.t200_propuestas tp
JOIN inventario.t200_eventos e ON e.prefijo_referencia = tp.descripcion_corta
WHERE p.t200_propuestas_id = tp.t200_propuestas_id;

-- Remove orphaned ENT lines and proposals
DELETE FROM inventario.t400_lineas_propuesta lp
USING inventario.t400_propuestas p
JOIN inventario.t200_propuestas tp ON p.t200_propuestas_id = tp.t200_propuestas_id
WHERE lp.t400_propuestas_id = p.t400_propuestas_id
  AND tp.descripcion_corta = 'ENT';

DELETE FROM inventario.t400_propuestas p
USING inventario.t200_propuestas tp
WHERE p.t200_propuestas_id = tp.t200_propuestas_id
  AND tp.descripcion_corta = 'ENT';

ALTER TABLE inventario.t400_propuestas
    ALTER COLUMN t200_eventos_id SET NOT NULL,
    ADD CONSTRAINT t400_propuestas_t200_eventos_fk
        FOREIGN KEY (t200_eventos_id) REFERENCES inventario.t200_eventos(t200_eventos_id),
    DROP COLUMN t200_propuestas_id;

CREATE INDEX idx_t400_propuestas_evento ON inventario.t400_propuestas(t200_eventos_id);
