-- Show description column in t200_pictures and t200_documents grids

UPDATE common.t900_table_fields
SET visible_in_grid = true
WHERE field_name = 'description'
  AND t000_app_tables_id IN (
      SELECT t000_app_tables_id FROM common.t000_app_tables
      WHERE table_name IN ('t200_pictures', 't200_documents')
  );
