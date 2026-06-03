-- Import historical loan orders (préstamos) and returns (devoluciones) from tmp schema
-- Source: tmp.t700_albaranes_agr (PRS headers) + tmp.t370_albaranes_agr (PRS lines)
--         tmp.t700_albaranes_agr_dev (DEV headers) + tmp.t370_albaranes_agr_dev (DEV lines)
--         tmp.t370_eventos_inventario (event history)
--
-- FK constraint: t650_ordenes_devolucion.t650_ordenes_prestamo_id requires PRS lines
-- to exist before inserting DEV lines — steps 1-4 must complete before steps 5-10.
--
-- Adjudicatario = COALESCE(t100_agentes_destino_id, t100_unidades_destino_id).
-- PRS records where both are NULL are skipped in step 2 (adjudicatario_id is NOT NULL).

-- Step 1: PRS order headers
INSERT INTO inventario.t600_ordenes
       (t600_ordenes_id, numero_referencia, t200_eventos_id,
        t200_estados_ordenes_id, aprobado_por, aprobado_en,
        fecha_inicio, fecha_fin)
SELECT lower(src.t700_albaranes_agr_id)::uuid,
       src.referencia,
       '10000000-0000-0000-0000-000000000004',
       CASE WHEN src.esta_cerrado = 1
            THEN (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Completada')
            ELSE (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Pendiente')
       END,
       'Importación',
       COALESCE(src.fecha_inicio, src.fecha_fin, NOW()),
       src.fecha_inicio,
       src.fecha_fin
FROM   tmp.t700_albaranes_agr src
ON CONFLICT DO NOTHING;

-- Step 2: PRS header subtable (adjudicatario + expected return date)
INSERT INTO inventario.t600_ordenes_prestamo
       (t600_ordenes_id, adjudicatario_id, adjudicatario_tabla, fecha_devolucion)
SELECT lower(src.t700_albaranes_agr_id)::uuid,
       lower(COALESCE(src.t100_agentes_destino_id, src.t100_unidades_destino_id))::uuid,
       CASE WHEN src.t100_agentes_destino_id IS NOT NULL THEN 't100_agentes' ELSE 't100_unidades' END,
       src.fecha_fin::date
FROM   tmp.t700_albaranes_agr src
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(src.t700_albaranes_agr_id)::uuid
WHERE  COALESCE(src.t100_agentes_destino_id, src.t100_unidades_destino_id) IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 3: PRS order lines
INSERT INTO inventario.t650_ordenes
       (t650_ordenes_id, t600_ordenes_id, t100_articulos_id)
SELECT lower(lin.t370_albaranes_agr_id)::uuid,
       lower(lin.t700_albaranes_agr_id)::uuid,
       lower(lin.t700_inventario_id)::uuid
FROM   tmp.t370_albaranes_agr lin
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(lin.t700_albaranes_agr_id)::uuid
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- Step 4: PRS line subtable (type marker, no extra columns)
INSERT INTO inventario.t650_ordenes_prestamo (t650_ordenes_id)
SELECT lower(lin.t370_albaranes_agr_id)::uuid
FROM   tmp.t370_albaranes_agr lin
JOIN   inventario.t650_ordenes lo ON lo.t650_ordenes_id = lower(lin.t370_albaranes_agr_id)::uuid
ON CONFLICT DO NOTHING;

-- Step 5: DEV order headers (requires PRS headers from step 1)
INSERT INTO inventario.t600_ordenes
       (t600_ordenes_id, numero_referencia, t200_eventos_id,
        t200_estados_ordenes_id, aprobado_por, aprobado_en, fecha_fin)
SELECT lower(dev.t700_albaranes_agr_dev_id)::uuid,
       dev.referencia,
       '10000000-0000-0000-0000-000000000007',
       CASE WHEN dev.esta_cerrado = 1
            THEN (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Completada')
            ELSE (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Pendiente')
       END,
       'Importación',
       dev.fecha,
       dev.fecha
FROM   tmp.t700_albaranes_agr_dev dev
JOIN   inventario.t600_ordenes prs ON prs.t600_ordenes_id = lower(dev.t700_albaranes_agr_id)::uuid
ON CONFLICT DO NOTHING;

-- Step 6: DEV header subtable (FK to original PRS header)
INSERT INTO inventario.t600_ordenes_devolucion
       (t600_ordenes_id, t600_ordenes_prestamo_id)
SELECT lower(dev.t700_albaranes_agr_dev_id)::uuid,
       lower(dev.t700_albaranes_agr_id)::uuid
FROM   tmp.t700_albaranes_agr_dev dev
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(dev.t700_albaranes_agr_dev_id)::uuid
ON CONFLICT DO NOTHING;

-- Step 7: DEV order lines
INSERT INTO inventario.t650_ordenes
       (t650_ordenes_id, t600_ordenes_id, t100_articulos_id)
SELECT lower(lin.t370_albaranes_agr_dev_id)::uuid,
       lower(lin.t700_albaranes_agr_dev_id)::uuid,
       lower(lin.t700_inventario_id)::uuid
FROM   tmp.t370_albaranes_agr_dev lin
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(lin.t700_albaranes_agr_dev_id)::uuid
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- Step 8: DEV line subtable (FK to original PRS line — requires step 3)
INSERT INTO inventario.t650_ordenes_devolucion
       (t650_ordenes_id, t650_ordenes_prestamo_id)
SELECT lower(lin.t370_albaranes_agr_dev_id)::uuid,
       lower(lin.t370_albaranes_agr_id)::uuid
FROM   tmp.t370_albaranes_agr_dev lin
JOIN   inventario.t650_ordenes lo ON lo.t650_ordenes_id = lower(lin.t370_albaranes_agr_dev_id)::uuid
JOIN   inventario.t650_ordenes lp ON lp.t650_ordenes_id = lower(lin.t370_albaranes_agr_id)::uuid
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- Step 9: event history for PRS lines
INSERT INTO inventario.t300_eventos
       (t300_eventos_id, t200_eventos_id, t100_articulos_id,
        t650_ordenes_id, fecha_ini, fecha_fin, created_at)
SELECT lower(ev.t370_eventos_inventario_id)::uuid,
       '10000000-0000-0000-0000-000000000004',
       lower(ev.t700_inventario_id)::uuid,
       lower(lin.t370_albaranes_agr_id)::uuid,
       ev.fecha_inicio,
       ev.fecha_fin,
       COALESCE(ev.fecha, ev.fecha_inicio)
FROM   tmp.t370_albaranes_agr      lin
JOIN   tmp.t370_eventos_inventario ev  ON ev.t370_eventos_inventario_id = lin.t370_eventos_inventario_id
JOIN   inventario.t650_ordenes     lo  ON lo.t650_ordenes_id = lower(lin.t370_albaranes_agr_id)::uuid
ON CONFLICT (t300_eventos_id) DO NOTHING;

-- Step 10: event history for DEV lines
INSERT INTO inventario.t300_eventos
       (t300_eventos_id, t200_eventos_id, t100_articulos_id,
        t650_ordenes_id, fecha_ini, fecha_fin, created_at)
SELECT lower(ev.t370_eventos_inventario_id)::uuid,
       '10000000-0000-0000-0000-000000000007',
       lower(ev.t700_inventario_id)::uuid,
       lower(lin.t370_albaranes_agr_dev_id)::uuid,
       ev.fecha_inicio,
       ev.fecha_fin,
       COALESCE(ev.fecha, ev.fecha_inicio)
FROM   tmp.t370_albaranes_agr_dev  lin
JOIN   tmp.t370_eventos_inventario ev  ON ev.t370_eventos_inventario_id = lin.t370_eventos_inventario_id
JOIN   inventario.t650_ordenes     lo  ON lo.t650_ordenes_id = lower(lin.t370_albaranes_agr_dev_id)::uuid
ON CONFLICT (t300_eventos_id) DO NOTHING;
