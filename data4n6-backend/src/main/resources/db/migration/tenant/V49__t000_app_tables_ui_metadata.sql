-- Extend t000_app_tables with UI metadata for frontend-agnostic admin screens

ALTER TABLE common.t000_app_tables
    ADD COLUMN nombre_singular VARCHAR(100),
    ADD COLUMN nombre_plural   VARCHAR(100),
    ADD COLUMN icono           VARCHAR(100),
    ADD COLUMN vistas          VARCHAR(100) NOT NULL DEFAULT 'GRID',
    ADD COLUMN endpoint_base   VARCHAR(200),
    ADD COLUMN seccion_menu    VARCHAR(50),
    ADD COLUMN orden_menu      SMALLINT;

-- ── Inventory: catalog tables not yet registered ────────────────────────────

INSERT INTO common.t000_app_tables
    (table_name, display_name, description, nombre_singular, nombre_plural, icono, endpoint_base, seccion_menu, orden_menu)
VALUES
    ('t200_almacenes',  'Tipos de almacén',       'Tipos de almacén de inventario',
     'Tipo de almacén',       'Tipos de almacén',       'lucideBuilding2',
     '/api/v1/inventory/tipos-almacen',        'inventory_admin',  1),

    ('t100_almacenes',  'Almacenes',              'Almacenes de inventario',
     'Almacén',               'Almacenes',              'lucideWarehouse',
     '/api/v1/inventory/almacenes',            'inventory_admin',  2),

    ('t200_materiales', 'Tipos de material',      'Tipos de material del inventario',
     'Tipo de material',      'Tipos de material',      'lucideLayers',
     '/api/v1/inventory/tipos-material',       'inventory_admin',  3),

    ('t200_articulos',  'Categorías de artículo', 'Categorías de artículo del inventario',
     'Categoría de artículo', 'Categorías de artículo', 'lucideGrid3X3',
     '/api/v1/inventory/categorias-articulos', 'inventory_admin',  6),

    ('t100_articulos',  'Artículos',              'Artículos del inventario',
     'Artículo',              'Artículos',              'lucidePackage',
     '/api/v1/inventory/articulos',            'inventory_admin',  7)

ON CONFLICT (table_name) DO NOTHING;

-- ── Inventory admin: catalog tables already registered ─────────────────────

UPDATE common.t000_app_tables SET
    nombre_singular = 'Marca',            nombre_plural = 'Marcas',
    icono = 'lucideTag',
    endpoint_base = '/api/v1/inventory/brands',
    seccion_menu = 'inventory_admin',     orden_menu = 4
WHERE table_name = 't200_marcas';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Modelo',           nombre_plural = 'Modelos',
    icono = 'lucideBox',
    endpoint_base = '/api/v1/inventory/modelos',
    seccion_menu = 'inventory_admin',     orden_menu = 5
WHERE table_name = 't200_modelos';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Tipo de entrada',  nombre_plural = 'Tipos de entrada',
    icono = 'lucideLogIn',
    endpoint_base = '/api/v1/inventory/entry-types',
    seccion_menu = 'inventory_admin',     orden_menu = 8
WHERE table_name = 't200_entradas_almacen';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Material × Marca', nombre_plural = 'Materiales × Marcas',
    icono = 'lucideLink',
    endpoint_base = '/api/v1/inventory/materiales-marcas',
    seccion_menu = 'inventory_admin',     orden_menu = 9
WHERE table_name = 't250_materiales_marcas';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Proveedor',        nombre_plural = 'Proveedores',
    icono = 'lucideTruck',
    endpoint_base = '/api/v1/inventory/proveedores',
    seccion_menu = 'inventory_admin',     orden_menu = 10
WHERE table_name = 't200_proveedores';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Evento',           nombre_plural = 'Eventos',
    icono = 'lucideZap',
    endpoint_base = '/api/v1/inventory/eventos',
    seccion_menu = 'inventory_admin',     orden_menu = 11
WHERE table_name = 't200_eventos';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Transición de evento', nombre_plural = 'Transiciones de evento',
    icono = 'lucideArrowRightLeft',
    endpoint_base = '/api/v1/inventory/evento-transiciones',
    seccion_menu = 'inventory_admin',         orden_menu = 12
WHERE table_name = 't250_eventos';

-- ── Inventory ops: operational tables ──────────────────────────────────────

UPDATE common.t000_app_tables SET
    nombre_singular = 'Propuesta',        nombre_plural = 'Propuestas',
    icono = 'lucideClipboardList',
    endpoint_base = '/api/v1/inventory/propuestas',
    seccion_menu = 'inventory_ops',       orden_menu = 1
WHERE table_name = 't400_propuestas';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Orden',            nombre_plural = 'Órdenes',
    icono = 'lucideFileCheck',
    endpoint_base = '/api/v1/inventory/ordenes',
    seccion_menu = 'inventory_ops',       orden_menu = 2
WHERE table_name = 't600_ordenes';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Material activo',  nombre_plural = 'Materiales activos',
    icono = 'lucidePackageCheck',
    seccion_menu = 'inventory_ops',       orden_menu = 3
WHERE table_name = 't400_materiales_activos';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Evento de inventario', nombre_plural = 'Historial de eventos',
    icono = 'lucideHistory',
    seccion_menu = 'inventory_ops',           orden_menu = 4
WHERE table_name = 't300_eventos';

-- ── Internal / no menu ──────────────────────────────────────────────────────

UPDATE common.t000_app_tables SET
    nombre_singular = 'Material',              nombre_plural = 'Materiales'
WHERE table_name = 't100_materiales';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Conflicto de propuesta', nombre_plural = 'Conflictos de propuesta',
    icono = 'lucideGitMerge'
WHERE table_name = 't250_propuestas';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Línea de propuesta',    nombre_plural = 'Líneas de propuesta'
WHERE table_name = 't400_lineas_propuesta';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Material reservado',    nombre_plural = 'Materiales reservados'
WHERE table_name = 't400_materiales_reservados';

-- ── Data4n6 (forensics) module ──────────────────────────────────────────────

UPDATE common.t000_app_tables SET
    nombre_singular = 'Caso',   nombre_plural = 'Casos'   WHERE table_name = 't100_cases';

UPDATE common.t000_app_tables SET
    nombre_singular = 'Evento', nombre_plural = 'Eventos' WHERE table_name = 't100_events';
