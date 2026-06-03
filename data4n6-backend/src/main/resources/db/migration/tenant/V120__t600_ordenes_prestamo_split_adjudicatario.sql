-- Split adjudicatario_id/adjudicatario_tabla into specific FK columns
ALTER TABLE inventario.t600_ordenes_prestamo
    ADD COLUMN t100_agentes_id  UUID,
    ADD COLUMN t100_unidades_id UUID;

UPDATE inventario.t600_ordenes_prestamo
SET t100_agentes_id = adjudicatario_id
WHERE adjudicatario_tabla = 't100_agentes';

UPDATE inventario.t600_ordenes_prestamo
SET t100_unidades_id = adjudicatario_id
WHERE adjudicatario_tabla = 't100_unidades';

ALTER TABLE inventario.t600_ordenes_prestamo
    ADD CONSTRAINT t600_ordenes_prestamo_adjudicatario_check
    CHECK (t100_agentes_id IS NOT NULL OR t100_unidades_id IS NOT NULL);

ALTER TABLE inventario.t600_ordenes_prestamo
    DROP COLUMN adjudicatario_id,
    DROP COLUMN adjudicatario_tabla;
