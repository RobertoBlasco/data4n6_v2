-- Reseed t250_eventos using hardcoded UUIDs (replaces V134 name-based lookup).
-- UUID map (from V27 initial seed, V46 comment):
--   001 = Entrada Almacén   (ENT)
--   002 = Traspaso Almacén  (TRS)
--   003 = Adjudicación      (ADJ)
--   004 = Préstamo          (PRS)
--   005 = Reparación        (REP) — inserted here if missing
--   006 = Baja              (BAJ)
--   007 = Devolución Préstamo
--   008 = Fin de Reparación — inserted here if missing
--   009 = Devolución Adjudicación

-- Ensure Reparación exists
INSERT INTO inventario.t200_eventos
    (t200_eventos_id, nombre, descripcion_corta, descripcion, permite_propuesta)
VALUES
    ('10000000-0000-0000-0000-000000000005',
     'Reparación', 'REP',
     'Artículo enviado a reparación', false)
ON CONFLICT (t200_eventos_id) DO NOTHING;

-- Ensure Fin de Reparación exists
INSERT INTO inventario.t200_eventos
    (t200_eventos_id, nombre, descripcion_corta, descripcion, permite_propuesta)
VALUES
    ('10000000-0000-0000-0000-000000000008',
     'Fin de Reparación', 'FRP',
     'Artículo recuperado tras reparación, vuelve al almacén', false)
ON CONFLICT (t200_eventos_id) DO NOTHING;

-- Replace all existing transitions
DELETE FROM inventario.t250_eventos;

-- ── From Almacén (001/ENT, 002/TRS, 007/DEV, 008/FRP, 009/DAD) ──────────────
-- → Préstamo (004), Traspaso Almacén (002), Baja (006), Adjudicación (003), Reparación (005)
INSERT INTO inventario.t250_eventos (t200_eventos_origen_id, t200_eventos_destino_id)
SELECT o.id, d.id
FROM (VALUES
    ('10000000-0000-0000-0000-000000000001'::uuid),
    ('10000000-0000-0000-0000-000000000002'::uuid),
    ('10000000-0000-0000-0000-000000000007'::uuid),
    ('10000000-0000-0000-0000-000000000008'::uuid),
    ('10000000-0000-0000-0000-000000000009'::uuid)
) o(id)
CROSS JOIN (VALUES
    ('10000000-0000-0000-0000-000000000004'::uuid),
    ('10000000-0000-0000-0000-000000000002'::uuid),
    ('10000000-0000-0000-0000-000000000006'::uuid),
    ('10000000-0000-0000-0000-000000000003'::uuid),
    ('10000000-0000-0000-0000-000000000005'::uuid)
) d(id)
ON CONFLICT DO NOTHING;

-- ── From Prestado (004) → Devolución Préstamo (007) ─────────────────────────
INSERT INTO inventario.t250_eventos (t200_eventos_origen_id, t200_eventos_destino_id)
VALUES ('10000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000007')
ON CONFLICT DO NOTHING;

-- ── From Adjudicado (003) → Préstamo (004), Devolución Adjudicación (009) ────
INSERT INTO inventario.t250_eventos (t200_eventos_origen_id, t200_eventos_destino_id)
VALUES
    ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004'),
    ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000009')
ON CONFLICT DO NOTHING;

-- ── From En reparación (005) → Fin de Reparación (008) ───────────────────────
INSERT INTO inventario.t250_eventos (t200_eventos_origen_id, t200_eventos_destino_id)
VALUES ('10000000-0000-0000-0000-000000000005',
        '10000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;
