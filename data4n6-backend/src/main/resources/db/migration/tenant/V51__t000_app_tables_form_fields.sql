-- Add form_fields column: comma-separated list of field names for create/edit form.
-- NULL means the generic form is not supported (complex FK fields, custom component needed).

ALTER TABLE common.t000_app_tables ADD COLUMN form_fields TEXT;

-- ── Inventory catalog ───────────────────────────────────────────────────────

UPDATE common.t000_app_tables SET form_fields = 'code,name,description'
WHERE table_name = 't200_almacenes';

UPDATE common.t000_app_tables SET form_fields = 'name,description'
WHERE table_name = 't200_marcas';

UPDATE common.t000_app_tables SET form_fields = 'name,descripcion'
WHERE table_name = 't200_materiales';

UPDATE common.t000_app_tables SET form_fields = 'code,name,description'
WHERE table_name = 't200_articulos';

UPDATE common.t000_app_tables SET form_fields = 'nombre,descripcionCorta,descripcion'
WHERE table_name = 't200_entradas_almacen';

UPDATE common.t000_app_tables SET form_fields = 'nombre,nif,contacto,telefono,email,direccion,notas'
WHERE table_name = 't200_proveedores';

-- ── Inventory admin ─────────────────────────────────────────────────────────

UPDATE common.t000_app_tables SET form_fields = 'nombre,descripcionCorta,descripcion'
WHERE table_name = 't200_eventos';

-- t200_modelos, t250_materiales_marcas, t250_eventos: NULL (FK fields, custom component)
