-- Split inventory_admin into two sections:
--   inventory_admin   → system config tables (events, event transitions)
--   inventory_catalog → catalog/lookup tables (brands, models, materials, etc.)
-- Top-level nav items (articulos, almacenes) removed from menu sections.

-- ── Catalog tables → inventory_catalog ─────────────────────────────────────

UPDATE common.t000_app_tables SET seccion_menu = 'inventory_catalog', orden_menu = 1 WHERE table_name = 't200_almacenes';
UPDATE common.t000_app_tables SET seccion_menu = 'inventory_catalog', orden_menu = 2 WHERE table_name = 't200_materiales';
UPDATE common.t000_app_tables SET seccion_menu = 'inventory_catalog', orden_menu = 3 WHERE table_name = 't200_marcas';
UPDATE common.t000_app_tables SET seccion_menu = 'inventory_catalog', orden_menu = 4 WHERE table_name = 't200_modelos';
UPDATE common.t000_app_tables SET seccion_menu = 'inventory_catalog', orden_menu = 5 WHERE table_name = 't200_articulos';
UPDATE common.t000_app_tables SET seccion_menu = 'inventory_catalog', orden_menu = 6 WHERE table_name = 't200_entradas_almacen';
UPDATE common.t000_app_tables SET seccion_menu = 'inventory_catalog', orden_menu = 7 WHERE table_name = 't250_materiales_marcas';
UPDATE common.t000_app_tables SET seccion_menu = 'inventory_catalog', orden_menu = 8 WHERE table_name = 't200_proveedores';

-- ── System config stays in inventory_admin (re-order) ──────────────────────

UPDATE common.t000_app_tables SET orden_menu = 1 WHERE table_name = 't200_eventos';
UPDATE common.t000_app_tables SET orden_menu = 2 WHERE table_name = 't250_eventos';

-- ── Top-level nav items: remove from menu sections ─────────────────────────

UPDATE common.t000_app_tables SET seccion_menu = NULL, orden_menu = NULL WHERE table_name = 't100_almacenes';
UPDATE common.t000_app_tables SET seccion_menu = NULL, orden_menu = NULL WHERE table_name = 't100_articulos';
