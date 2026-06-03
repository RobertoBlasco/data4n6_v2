-- Import historical transfer orders from tmp schema
-- Source: tmp.t700_albaranes_tal (headers) + tmp.t370_albaranes_tal (lines)
--         + tmp.t370_eventos_inventario (event history)
--
-- Mapping notes:
--   fecha_inicio (header): not mapped — transfer start is not tracked at order level
--   fecha_fin    (header): mapped to t600_ordenes.fecha_fin
--   esta_cerrado (header): not mapped — status derived from fecha_fin presence
--   t700_almacenes_origen_id (header): not mapped — origin is per-line
--   t700_almacenes_destino_id (header): mapped to each t650_ordenes_traspaso.t100_almacenes_destino_id
--   t700_almacenes_origen_id (line): mapped to t650_ordenes_traspaso.t100_almacenes_origen_id

-- Step 1: order headers
INSERT INTO inventario.t600_ordenes
       (t600_ordenes_id, numero_referencia, t200_eventos_id,
        t200_estados_ordenes_id, aprobado_por, aprobado_en, fecha_fin)
SELECT lower(src.t700_albaranes_tal_id)::uuid,
       src.referencia,
       '10000000-0000-0000-0000-000000000002',
       CASE WHEN src.fecha_fin IS NOT NULL
            THEN (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Completada')
            ELSE (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Pendiente')
       END,
       'Importación',
       COALESCE(src.fecha_inicio, src.fecha_fin),
       src.fecha_fin
FROM   tmp.t700_albaranes_tal src
ON CONFLICT DO NOTHING;

-- Step 2: traspaso header subtable (type marker, no extra columns after V102)
INSERT INTO inventario.t600_ordenes_traspaso
       (t600_ordenes_id)
SELECT lower(src.t700_albaranes_tal_id)::uuid
FROM   tmp.t700_albaranes_tal src
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(src.t700_albaranes_tal_id)::uuid
ON CONFLICT DO NOTHING;

-- Step 3: order lines
INSERT INTO inventario.t650_ordenes
       (t650_ordenes_id, t600_ordenes_id, t100_articulos_id)
SELECT lower(lin.t370_albaranes_tal_id)::uuid,
       lower(lin.t700_albaranes_tal_id)::uuid,
       lower(lin.t700_inventario_id)::uuid
FROM   tmp.t370_albaranes_tal lin
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(lin.t700_albaranes_tal_id)::uuid
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- Step 4: traspaso line subtable (origin from line, destination from header)
INSERT INTO inventario.t650_ordenes_traspaso
       (t650_ordenes_id, t100_almacenes_origen_id, t100_almacenes_destino_id)
SELECT lower(lin.t370_albaranes_tal_id)::uuid,
       lower(lin.t700_almacenes_origen_id)::uuid,
       lower(cab.t700_almacenes_destino_id)::uuid
FROM   tmp.t370_albaranes_tal lin
JOIN   tmp.t700_albaranes_tal  cab ON cab.t700_albaranes_tal_id = lin.t700_albaranes_tal_id
JOIN   inventario.t650_ordenes lo  ON lo.t650_ordenes_id       = lower(lin.t370_albaranes_tal_id)::uuid
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- Step 5: event history
INSERT INTO inventario.t300_eventos
       (t300_eventos_id, t200_eventos_id, t100_articulos_id,
        t650_ordenes_id, fecha_ini, fecha_fin, created_at)
SELECT lower(ev.t370_eventos_inventario_id)::uuid,
       '10000000-0000-0000-0000-000000000002',
       lower(ev.t700_inventario_id)::uuid,
       lower(lin.t370_albaranes_tal_id)::uuid,
       ev.fecha_inicio,
       ev.fecha_fin,
       COALESCE(ev.fecha, ev.fecha_inicio)
FROM   tmp.t370_albaranes_tal      lin
JOIN   tmp.t370_eventos_inventario ev  ON ev.t370_eventos_inventario_id = lin.t370_eventos_inventario_id
JOIN   inventario.t650_ordenes     lo  ON lo.t650_ordenes_id            = lower(lin.t370_albaranes_tal_id)::uuid
ON CONFLICT (t300_eventos_id) DO NOTHING;
