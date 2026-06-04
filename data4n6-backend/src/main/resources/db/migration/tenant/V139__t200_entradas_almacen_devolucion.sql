INSERT INTO inventario.t200_entradas_almacen
    (t200_entradas_almacen_id, nombre, descripcion_corta, descripcion)
VALUES
    ('20000000-0000-0000-0000-000000000001',
     'Devolución préstamo', 'DEV',
     'Artículo devuelto tras préstamo, entra de nuevo al almacén')
ON CONFLICT (t200_entradas_almacen_id) DO NOTHING;
