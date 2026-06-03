-- Fix metadata for rows that pre-existed V49 and were skipped by ON CONFLICT DO NOTHING.

UPDATE common.t000_app_tables SET
    nombre_singular = 'Tipo de almacén',        nombre_plural = 'Tipos de almacén',
    icono           = 'lucideBuilding2',
    endpoint_base   = '/api/v1/inventory/tipos-almacen',
    vistas          = 'GRID'
WHERE table_name = 't200_almacenes' AND nombre_singular IS NULL;

UPDATE common.t000_app_tables SET
    nombre_singular = 'Tipo de material',        nombre_plural = 'Tipos de material',
    icono           = 'lucideLayers',
    endpoint_base   = '/api/v1/inventory/tipos-material',
    vistas          = 'GRID'
WHERE table_name = 't200_materiales' AND nombre_singular IS NULL;

UPDATE common.t000_app_tables SET
    nombre_singular = 'Categoría de artículo',   nombre_plural = 'Categorías de artículo',
    icono           = 'lucideGrid3x3',
    endpoint_base   = '/api/v1/inventory/categorias-articulos',
    vistas          = 'GRID'
WHERE table_name = 't200_articulos' AND nombre_singular IS NULL;

UPDATE common.t000_app_tables SET
    nombre_singular = 'Almacén',                 nombre_plural = 'Almacenes',
    icono           = 'lucideWarehouse',
    endpoint_base   = '/api/v1/inventory/almacenes',
    vistas          = 'GRID'
WHERE table_name = 't100_almacenes' AND nombre_singular IS NULL;

UPDATE common.t000_app_tables SET
    nombre_singular = 'Artículo',                nombre_plural = 'Artículos',
    icono           = 'lucidePackage',
    endpoint_base   = '/api/v1/inventory/articulos',
    vistas          = 'GRID'
WHERE table_name = 't100_articulos' AND nombre_singular IS NULL;
