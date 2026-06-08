-- Consolidated icon update for all order and entity tables
-- (supersedes V151–V154 which set the same values)

UPDATE seguridad.t900_app_tables SET icono = 'lucidePackage'
  WHERE table_name = 't100_articulos';

UPDATE seguridad.t900_app_tables SET icono = 'lucideUserCheck'
  WHERE table_name = 't100_agents';

UPDATE seguridad.t900_app_tables SET icono = 'lucideDatabase'
  WHERE table_name = 't900_app_tables';

-- Órdenes de entrada al almacén
UPDATE seguridad.t900_app_tables SET icono = 'lucideArrowDownToLine'
  WHERE table_name IN ('t600_ordenes_entrada', 't650_ordenes_entrada');

-- Órdenes de traspaso de almacén
UPDATE seguridad.t900_app_tables SET icono = 'lucideArrowRightLeft'
  WHERE table_name IN ('t600_ordenes_traspaso', 't650_ordenes_traspaso');

-- Órdenes de préstamo
UPDATE seguridad.t900_app_tables SET icono = 'lucidePackageOpen'
  WHERE table_name IN ('t600_ordenes_prestamo', 't650_ordenes_prestamo');

-- Órdenes de devolución de préstamo
UPDATE seguridad.t900_app_tables SET icono = 'lucidePackageCheck'
  WHERE table_name IN ('t600_ordenes_devolucion', 't650_ordenes_devolucion');

-- Órdenes de adjudicación
UPDATE seguridad.t900_app_tables SET icono = 'lucidePackagePlus'
  WHERE table_name IN ('t600_ordenes_adjudicacion', 't650_ordenes_adjudicacion');

-- Órdenes de baja
UPDATE seguridad.t900_app_tables SET icono = 'lucideArchive'
  WHERE table_name IN ('t600_ordenes_baja', 't650_ordenes_baja');
