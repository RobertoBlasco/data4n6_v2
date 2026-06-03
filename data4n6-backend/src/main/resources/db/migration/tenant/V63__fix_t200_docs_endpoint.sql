-- Fix t200_docs missing endpoint_base and seccion_menu
-- The V59 INSERT was skipped by ON CONFLICT DO NOTHING because the row pre-existed
UPDATE common.t000_app_tables
SET endpoint_base = '/api/v1/catalog/docs',
    seccion_menu  = 'common_catalog'
WHERE table_name = 't200_docs'
  AND (endpoint_base IS NULL OR endpoint_base = '');
