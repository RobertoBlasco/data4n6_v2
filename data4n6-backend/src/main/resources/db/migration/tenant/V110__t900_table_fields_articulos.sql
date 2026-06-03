INSERT INTO common.t900_table_fields
    (t900_table_fields_id, t000_app_tables_id, field_name, display_name,
     field_type, visible_in_grid, visible_in_form, orden, grid_width)
SELECT
    gen_random_uuid(),
    (SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_articulos'),
    v.field_name, v.display_name, 'text', true, false, v.orden, v.grid_width
FROM (VALUES
    ('serialNumber',       'N.º Serie',     1::SMALLINT,  96::SMALLINT),
    ('tipoMaterialNombre', 'Tipo material', 2::SMALLINT, 112::SMALLINT),
    ('brandName',          'Marca',         3::SMALLINT,  80::SMALLINT),
    ('modeloDescripcion',  'Modelo',        4::SMALLINT, 128::SMALLINT),
    ('almacenNombre',      'Almacén',       5::SMALLINT, NULL::SMALLINT),
    ('estadoActual',       'Estado',        6::SMALLINT, 144::SMALLINT)
) AS v(field_name, display_name, orden, grid_width)
ON CONFLICT (t000_app_tables_id, field_name) DO NOTHING;
