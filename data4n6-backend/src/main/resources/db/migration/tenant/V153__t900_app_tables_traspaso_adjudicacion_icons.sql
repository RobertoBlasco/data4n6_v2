UPDATE seguridad.t900_app_tables
SET icono = 'lucideArrowDownToLine'
WHERE table_name IN ('t600_ordenes_entrada', 't650_ordenes_entrada');

UPDATE seguridad.t900_app_tables
SET icono = 'lucideArrowRightLeft'
WHERE table_name IN ('t600_ordenes_traspaso', 't650_ordenes_traspaso');

UPDATE seguridad.t900_app_tables
SET icono = 'lucidePackagePlus'
WHERE table_name IN ('t600_ordenes_adjudicacion', 't650_ordenes_adjudicacion');
