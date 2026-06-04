-- Return order: agente/unidad origen, agente/unidad destino, fecha_devolucion
ALTER TABLE inventario.t600_ordenes_devolucion
    ADD COLUMN t100_agentes_origen_id   UUID NULL,
    ADD COLUMN t100_unidades_origen_id  UUID NULL,
    ADD COLUMN t100_agentes_destino_id  UUID NULL,
    ADD COLUMN t100_unidades_destino_id UUID NULL,
    ADD COLUMN fecha_devolucion         DATE NULL;

-- Loan line: record article's state before lending so return can restore it
ALTER TABLE inventario.t650_ordenes_prestamo
    ADD COLUMN estado_previo     VARCHAR(50) NULL,
    ADD COLUMN almacen_previo_id UUID        NULL;
