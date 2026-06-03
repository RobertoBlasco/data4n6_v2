-- Rename existing columns to _origen and add _destino counterparts
ALTER TABLE inventario.t600_ordenes_prestamo
    RENAME COLUMN t100_agentes_id  TO t100_agentes_origen_id;

ALTER TABLE inventario.t600_ordenes_prestamo
    RENAME COLUMN t100_unidades_id TO t100_unidades_origen_id;

ALTER TABLE inventario.t600_ordenes_prestamo
    ADD COLUMN t100_agentes_destino_id  UUID,
    ADD COLUMN t100_unidades_destino_id UUID;

ALTER TABLE inventario.t600_ordenes_prestamo
    DROP CONSTRAINT IF EXISTS t600_ordenes_prestamo_adjudicatario_check;

ALTER TABLE inventario.t600_ordenes_prestamo
    ADD CONSTRAINT t600_ordenes_prestamo_destino_check
        CHECK (t100_agentes_destino_id IS NOT NULL OR t100_unidades_destino_id IS NOT NULL) NOT VALID;
