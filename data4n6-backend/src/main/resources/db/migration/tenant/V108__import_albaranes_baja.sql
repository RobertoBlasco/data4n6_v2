-- Import historical write-off orders (bajas) from tmp schema
-- Source: tmp.t700_albaranes_baja (headers) + tmp.t370_albaranes_baja (lines)
--         + tmp.t370_eventos_inventario (event history)
--
-- No t600_ordenes_baja header subtable exists (baja has no extra header fields).
-- t650_ordenes_baja is a type marker only (no extra columns).

-- Step 1: order headers
INSERT INTO inventario.t600_ordenes
       (t600_ordenes_id, numero_referencia, t200_eventos_id,
        t200_estados_ordenes_id, aprobado_por, aprobado_en, fecha_fin)
SELECT lower(src.t700_albaranes_baja_id)::uuid,
       src.referencia,
       '10000000-0000-0000-0000-000000000006',
       CASE WHEN src.esta_cerrado = 1
            THEN (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Completada')
            ELSE (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Pendiente')
       END,
       'Importación',
       COALESCE(src.fecha, NOW()),
       src.fecha
FROM   tmp.t700_albaranes_baja src
ON CONFLICT DO NOTHING;

-- Step 2: order lines
INSERT INTO inventario.t650_ordenes
       (t650_ordenes_id, t600_ordenes_id, t100_articulos_id)
SELECT lower(lin.t370_albaranes_baja_id)::uuid,
       lower(lin.t700_albaranes_baja_id)::uuid,
       lower(lin.t700_inventario_id)::uuid
FROM   tmp.t370_albaranes_baja lin
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(lin.t700_albaranes_baja_id)::uuid
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- Step 3: line subtype marker
INSERT INTO inventario.t650_ordenes_baja (t650_ordenes_id)
SELECT lower(lin.t370_albaranes_baja_id)::uuid
FROM   tmp.t370_albaranes_baja lin
JOIN   inventario.t650_ordenes lo ON lo.t650_ordenes_id = lower(lin.t370_albaranes_baja_id)::uuid
ON CONFLICT DO NOTHING;

-- Step 4: event history
INSERT INTO inventario.t300_eventos
       (t300_eventos_id, t200_eventos_id, t100_articulos_id,
        t650_ordenes_id, fecha_ini, fecha_fin, created_at)
SELECT lower(ev.t370_eventos_inventario_id)::uuid,
       '10000000-0000-0000-0000-000000000006',
       lower(ev.t700_inventario_id)::uuid,
       lower(lin.t370_albaranes_baja_id)::uuid,
       ev.fecha_inicio,
       ev.fecha_fin,
       COALESCE(ev.fecha, ev.fecha_inicio)
FROM   tmp.t370_albaranes_baja     lin
JOIN   tmp.t370_eventos_inventario ev  ON ev.t370_eventos_inventario_id = lin.t370_eventos_inventario_id
JOIN   inventario.t650_ordenes     lo  ON lo.t650_ordenes_id = lower(lin.t370_albaranes_baja_id)::uuid
ON CONFLICT (t300_eventos_id) DO NOTHING;
