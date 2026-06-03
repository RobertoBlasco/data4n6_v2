-- t200_propuestas is now fully replaced by t200_eventos.permite_propuesta.

DELETE FROM common.t000_app_tables WHERE table_name = 't200_propuestas';

DROP TABLE inventario.t200_propuestas;
