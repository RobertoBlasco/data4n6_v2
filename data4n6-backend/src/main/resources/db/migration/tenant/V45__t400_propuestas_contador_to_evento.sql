-- Migrate t400_propuestas_contador PK from (t200_propuestas_id, anio) to (t200_eventos_id, anio).

ALTER TABLE inventario.t400_propuestas_contador
    ADD COLUMN t200_eventos_id UUID;

UPDATE inventario.t400_propuestas_contador c
SET t200_eventos_id = e.t200_eventos_id
FROM inventario.t200_propuestas tp
JOIN inventario.t200_eventos e ON e.prefijo_referencia = tp.descripcion_corta
WHERE c.t200_propuestas_id = tp.t200_propuestas_id;

DELETE FROM inventario.t400_propuestas_contador c
USING inventario.t200_propuestas tp
WHERE c.t200_propuestas_id = tp.t200_propuestas_id
  AND tp.descripcion_corta = 'ENT';

ALTER TABLE inventario.t400_propuestas_contador
    DROP CONSTRAINT t400_propuestas_contador_pkey;

ALTER TABLE inventario.t400_propuestas_contador
    ALTER COLUMN t200_eventos_id SET NOT NULL,
    ADD CONSTRAINT t400_propuestas_contador_pkey PRIMARY KEY (t200_eventos_id, anio),
    ADD CONSTRAINT t400_propuestas_contador_t200_eventos_fk
        FOREIGN KEY (t200_eventos_id) REFERENCES inventario.t200_eventos(t200_eventos_id),
    DROP COLUMN t200_propuestas_id;
