-- Add column definitions for t250_eventos (event transitions) in the generic catalog admin.
-- Field names match EventoTransicionResponse JSON keys.

DELETE FROM common.t900_table_fields
WHERE t000_app_tables_id = (
    SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't250_eventos'
);

INSERT INTO common.t900_table_fields
    (t900_table_fields_id, t000_app_tables_id, field_name, display_name, field_type,
     required, visible_in_grid, visible_in_form, orden)
SELECT
    gen_random_uuid(),
    t.t000_app_tables_id,
    f.field_name, f.display_name, f.field_type,
    f.req::boolean, true, false, f.ord::smallint
FROM common.t000_app_tables t
CROSS JOIN (VALUES
    ('eventoOrigenNombre', 'Evento origen',  'text', 'true',  '1'),
    ('eventoDestinoNombre','Evento destino', 'text', 'true',  '2')
) AS f(field_name, display_name, field_type, req, ord)
WHERE t.table_name = 't250_eventos';
