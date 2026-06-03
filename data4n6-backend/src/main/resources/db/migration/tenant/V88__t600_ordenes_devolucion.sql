UPDATE inventario.t200_eventos
SET prefijo_referencia = 'DEV'
WHERE nombre = 'Devolución Préstamo';

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t600_ordenes_devolucion', 'Devoluciones de préstamo', 'Órdenes de devolución asociadas a una orden de préstamo original')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t600_ordenes_devolucion (
    t600_ordenes_id          UUID NOT NULL PRIMARY KEY
                             REFERENCES inventario.t600_ordenes(t600_ordenes_id),
    t600_ordenes_prestamo_id UUID NOT NULL
                             REFERENCES inventario.t600_ordenes(t600_ordenes_id)
);

CREATE INDEX idx_t600_ordenes_devolucion_prestamo ON inventario.t600_ordenes_devolucion(t600_ordenes_prestamo_id);
