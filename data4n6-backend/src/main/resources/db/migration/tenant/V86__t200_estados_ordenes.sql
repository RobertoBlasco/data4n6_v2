INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t200_estados_ordenes', 'Estados de orden', 'Catálogo de estados del ciclo de vida de una orden de inventario')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t200_estados_ordenes (
    t200_estados_ordenes_id UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre                  VARCHAR(100) NOT NULL,
    descripcion_corta       VARCHAR(20)  NOT NULL,
    descripcion             TEXT,
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT t200_estados_ordenes_nombre_key UNIQUE (nombre)
);

INSERT INTO inventario.t200_estados_ordenes (nombre, descripcion_corta, descripcion) VALUES
    ('Pendiente',   'PEN', 'Orden creada, pendiente de ejecución'),
    ('En proceso',  'ENP', 'Ejecución iniciada parcialmente'),
    ('Completada',  'COM', 'Todos los artículos han sido procesados'),
    ('Cancelada',   'CAN', 'Orden anulada');
