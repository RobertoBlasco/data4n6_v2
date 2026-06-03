-- Set icons for common catalog tables so CatalogAdminComponent can display them
UPDATE common.t000_app_tables SET icono = 'lucideFileText' WHERE table_name = 't200_docs';
UPDATE common.t000_app_tables SET icono = 'lucideRuler'    WHERE table_name = 't100_units';
