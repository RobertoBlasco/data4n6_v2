-- Line-level specialization tables for t650_ordenes.
-- One row per t650_ordenes row, sharing the same PK.

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES
    ('t650_ordenes_entrada',      'Líneas de entrada',       'Datos específicos de líneas de órdenes de entrada de almacén'),
    ('t650_ordenes_traspaso',     'Líneas de traspaso',      'Almacenes origen/destino por línea de traspaso'),
    ('t650_ordenes_adjudicacion', 'Líneas de adjudicación',  'Datos específicos de líneas de adjudicación'),
    ('t650_ordenes_prestamo',     'Líneas de préstamo',      'Datos específicos de líneas de préstamo'),
    ('t650_ordenes_devolucion',   'Líneas de devolución',    'Referencia a la línea de préstamo original'),
    ('t650_ordenes_baja',         'Líneas de baja',          'Datos específicos de líneas de baja')
ON CONFLICT (table_name) DO NOTHING;

-- Entrada: proveedor, marca, modelo and serial number per line
CREATE TABLE inventario.t650_ordenes_entrada (
    t650_ordenes_id     UUID NOT NULL PRIMARY KEY
                        REFERENCES inventario.t650_ordenes(t650_ordenes_id),
    t200_proveedores_id UUID REFERENCES inventario.t200_proveedores(t200_proveedores_id),
    t200_marcas_id      UUID REFERENCES inventario.t200_marcas(t200_marcas_id),
    t200_modelos_id     UUID REFERENCES inventario.t200_modelos(t200_modelos_id),
    numero_serie        VARCHAR(100)
);

-- Traspaso: origin and destination warehouse per line
CREATE TABLE inventario.t650_ordenes_traspaso (
    t650_ordenes_id          UUID NOT NULL PRIMARY KEY
                             REFERENCES inventario.t650_ordenes(t650_ordenes_id),
    t100_almacenes_origen_id  UUID NOT NULL REFERENCES inventario.t100_almacenes(t100_almacenes_id),
    t100_almacenes_destino_id UUID NOT NULL REFERENCES inventario.t100_almacenes(t100_almacenes_id)
);

CREATE INDEX idx_t650_traspaso_origen  ON inventario.t650_ordenes_traspaso(t100_almacenes_origen_id);
CREATE INDEX idx_t650_traspaso_destino ON inventario.t650_ordenes_traspaso(t100_almacenes_destino_id);

-- Adjudicacion: extensible subtable (no extra columns yet)
CREATE TABLE inventario.t650_ordenes_adjudicacion (
    t650_ordenes_id UUID NOT NULL PRIMARY KEY
                    REFERENCES inventario.t650_ordenes(t650_ordenes_id)
);

-- Prestamo: extensible subtable (no extra columns yet)
CREATE TABLE inventario.t650_ordenes_prestamo (
    t650_ordenes_id UUID NOT NULL PRIMARY KEY
                    REFERENCES inventario.t650_ordenes(t650_ordenes_id)
);

-- Devolucion: reference to the original prestamo line
CREATE TABLE inventario.t650_ordenes_devolucion (
    t650_ordenes_id          UUID NOT NULL PRIMARY KEY
                             REFERENCES inventario.t650_ordenes(t650_ordenes_id),
    t650_ordenes_prestamo_id UUID NOT NULL
                             REFERENCES inventario.t650_ordenes(t650_ordenes_id)
);

CREATE INDEX idx_t650_devolucion_prestamo ON inventario.t650_ordenes_devolucion(t650_ordenes_prestamo_id);

-- Baja: extensible subtable (no extra columns yet)
CREATE TABLE inventario.t650_ordenes_baja (
    t650_ordenes_id UUID NOT NULL PRIMARY KEY
                    REFERENCES inventario.t650_ordenes(t650_ordenes_id)
);
