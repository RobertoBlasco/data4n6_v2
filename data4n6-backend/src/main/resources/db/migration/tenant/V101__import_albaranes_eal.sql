-- Import historical entry orders from tmp schema
-- Source: tmp.t700_albaranes_eal (headers) + tmp.t370_albaranes_eal (lines)
--         + tmp.t370_eventos_inventario (event history)
--
-- Data quality note: 3 references appear twice in the source with different UUIDs
-- (EAL20250001, EAL20250002, EAL20250003). Only one UUID per reference is kept;
-- any line linked to the discarded UUID is silently dropped (affects ~1 line in EAL20250003).

-- Step 1: order headers — ON CONFLICT DO NOTHING covers both PK and unique(numero_referencia)
INSERT INTO inventario.t600_ordenes
       (t600_ordenes_id, numero_referencia, t200_eventos_id,
        t200_estados_ordenes_id, aprobado_por, aprobado_en, created_at)
SELECT lower(src.t700_albaranes_eal_id)::uuid,
       src.referencia,
       '10000000-0000-0000-0000-000000000001',
       CASE src.esta_cerrado
           WHEN 1 THEN 'bf5c1113-038d-4756-a0a4-ba4a1a288cfb'::uuid
           ELSE        'da472cd5-865f-4798-af6e-5cad06f96673'::uuid
       END,
       'Importación',
       src.fecha,
       src.fecha
FROM   tmp.t700_albaranes_eal src
ON CONFLICT DO NOTHING;

-- Step 2: entrada header subtable — only for headers actually inserted in step 1
INSERT INTO inventario.t600_ordenes_entrada
       (t600_ordenes_id, t200_entradas_almacen_id)
SELECT lower(src.t700_albaranes_eal_id)::uuid,
       '9c7d7f7a-def0-41f8-a357-568e795b8372'
FROM   tmp.t700_albaranes_eal src
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(src.t700_albaranes_eal_id)::uuid
ON CONFLICT DO NOTHING;

-- Step 3: order lines — only for headers that were actually inserted (guards against orphan lines)
INSERT INTO inventario.t650_ordenes
       (t650_ordenes_id, t600_ordenes_id, t100_articulos_id, created_at)
SELECT lower(lin.t370_albaranes_eal_id)::uuid,
       lower(lin.t700_albaranes_eal_id)::uuid,
       lower(ev.t700_inventario_id)::uuid,
       cab.fecha
FROM   tmp.t370_albaranes_eal      lin
JOIN   tmp.t700_albaranes_eal      cab ON cab.t700_albaranes_eal_id      = lin.t700_albaranes_eal_id
JOIN   tmp.t370_eventos_inventario ev  ON ev.t370_eventos_inventario_id  = lin.t370_eventos_inventario_id
JOIN   inventario.t600_ordenes     o   ON o.t600_ordenes_id              = lower(lin.t700_albaranes_eal_id)::uuid
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- Step 4: entrada line subtable (24 lines will have t200_modelos_id = NULL — no match)
INSERT INTO inventario.t650_ordenes_entrada
       (t650_ordenes_id, t200_marcas_id, t200_modelos_id,
        numero_serie, t100_almacenes_id)
SELECT lower(lin.t370_albaranes_eal_id)::uuid,
       lower(lin.t200_marcas_id)::uuid,
       CASE WHEN mo.t200_modelos_id IS NOT NULL
            THEN lower(lin.t200_modelos_id)::uuid ELSE NULL END,
       lin.num_serie,
       lower(cab.t700_almacenes_id)::uuid
FROM   tmp.t370_albaranes_eal lin
JOIN   tmp.t700_albaranes_eal cab ON cab.t700_albaranes_eal_id = lin.t700_albaranes_eal_id
JOIN   inventario.t600_ordenes o  ON o.t600_ordenes_id         = lower(lin.t700_albaranes_eal_id)::uuid
LEFT JOIN inventario.t200_modelos mo
       ON mo.t200_modelos_id::text = lower(lin.t200_modelos_id)
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- Step 5: event history
INSERT INTO inventario.t300_eventos
       (t300_eventos_id, t200_eventos_id, t100_articulos_id,
        t650_ordenes_id, fecha_ini, fecha_fin, created_at)
SELECT lower(ev.t370_eventos_inventario_id)::uuid,
       '10000000-0000-0000-0000-000000000001',
       lower(ev.t700_inventario_id)::uuid,
       lower(lin.t370_albaranes_eal_id)::uuid,
       ev.fecha_inicio,
       ev.fecha_fin,
       COALESCE(ev.fecha, ev.fecha_inicio)
FROM   tmp.t370_albaranes_eal      lin
JOIN   tmp.t370_eventos_inventario ev  ON ev.t370_eventos_inventario_id = lin.t370_eventos_inventario_id
JOIN   inventario.t600_ordenes     o   ON o.t600_ordenes_id             = lower(lin.t700_albaranes_eal_id)::uuid
ON CONFLICT (t300_eventos_id) DO NOTHING;
