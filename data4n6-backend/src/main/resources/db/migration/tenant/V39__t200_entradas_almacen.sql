-- t200_entradas_almacen: catalog of reasons why items enter the inventory
-- (compra, donación, préstamo externo, decomiso, hallazgo, etc.)

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t200_entradas_almacen', 'Tipos de entrada', 'Motivo por el que un artículo ingresa al inventario')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t200_entradas_almacen (
    t200_entradas_almacen_id  UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre                    VARCHAR(150) NOT NULL,
    descripcion_corta         VARCHAR(10)  NOT NULL,
    descripcion               TEXT,
    deleted_at                TIMESTAMPTZ,
    CONSTRAINT t200_entradas_almacen_nombre_uq      UNIQUE (nombre),
    CONSTRAINT t200_entradas_almacen_desc_corta_uq  UNIQUE (descripcion_corta)
);

INSERT INTO inventario.t200_entradas_almacen (nombre, descripcion_corta, descripcion) VALUES
    ('Compra',            'CMP', 'Adquisición mediante contrato de compra'),
    ('Donación',          'DON', 'Cesión gratuita de un tercero'),
    ('Préstamo externo',  'PRE', 'Artículo cedido temporalmente por un tercero'),
    ('Decomiso',          'DEC', 'Artículo intervenido o confiscado'),
    ('Hallazgo',          'HAL', 'Artículo encontrado sin propietario conocido'),
    ('Traspaso interno',  'TRP', 'Entrada procedente de otra unidad de la organización');
