-- Set endpoint_base and seccion_menu for common catalog tables
-- so they can be driven by CatalogAdminComponent

UPDATE common.t000_app_tables
SET endpoint_base = '/api/v1/catalog/units',
    seccion_menu  = 'common_catalog',
    display_name  = 'Unidades'
WHERE table_name = 't100_units';
