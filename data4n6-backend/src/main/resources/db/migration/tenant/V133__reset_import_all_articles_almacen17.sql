-- Reset all orders, create a single ENT import order for every article,
-- and assign all articles to almacén 17.

-- ── 1. Delete all order history and lines (reverse FK order) ─────────────────

DELETE FROM inventario.t300_eventos;

DELETE FROM inventario.t650_ordenes_devolucion;
DELETE FROM inventario.t650_ordenes_prestamo;
DELETE FROM inventario.t650_ordenes_entrada;
DELETE FROM inventario.t650_ordenes_traspaso;
DELETE FROM inventario.t650_ordenes_adjudicacion;
DELETE FROM inventario.t650_ordenes_baja;
DELETE FROM inventario.t650_ordenes;

DELETE FROM inventario.t600_ordenes_devolucion;
DELETE FROM inventario.t600_ordenes_prestamo;
DELETE FROM inventario.t600_ordenes_entrada;
DELETE FROM inventario.t600_ordenes_traspaso;
DELETE FROM inventario.t600_ordenes_adjudicacion;
DELETE FROM inventario.t600_ordenes;

-- Reset order counters
DELETE FROM inventario.t600_ordenes_contador;

-- ── 2. Create the ENT import order ────────────────────────────────────────────

DO $$
DECLARE
    v_orden_id      UUID := gen_random_uuid();
    v_almacen_id    UUID;
    v_entry_type_id UUID;
    v_estado_id     UUID;
    v_anio          SMALLINT := EXTRACT(YEAR FROM NOW())::SMALLINT;
    v_referencia    TEXT;
BEGIN
    -- Resolve ARMARIO 17
    SELECT t100_almacenes_id INTO v_almacen_id
    FROM   inventario.t100_almacenes
    WHERE  name = 'ARMARIO 17' AND deleted_at IS NULL
    LIMIT  1;

    IF v_almacen_id IS NULL THEN
        RAISE EXCEPTION 'Almacén con nombre "ARMARIO 17" no encontrado en inventario.t100_almacenes';
    END IF;

    -- Resolve entry type (Importación)
    SELECT t200_entradas_almacen_id INTO v_entry_type_id
    FROM   inventario.t200_entradas_almacen
    WHERE  nombre = 'Importación'
    LIMIT  1;

    IF v_entry_type_id IS NULL THEN
        RAISE EXCEPTION 'Tipo de entrada "Importación" no encontrado en inventario.t200_entradas_almacen';
    END IF;

    -- Resolve estado "Completada"
    SELECT t200_estados_ordenes_id INTO v_estado_id
    FROM   inventario.t200_estados_ordenes
    WHERE  nombre = 'Completada'
    LIMIT  1;

    v_referencia := 'ENT-' || v_anio::TEXT || '-00001';

    -- Order header
    INSERT INTO inventario.t600_ordenes
           (t600_ordenes_id, numero_referencia, t200_eventos_id,
            t200_estados_ordenes_id, aprobado_por, aprobado_en, fecha_inicio)
    VALUES (v_orden_id, v_referencia,
            '10000000-0000-0000-0000-000000000001',
            v_estado_id, 'Importación', NOW(), NOW());

    -- Order header subtable (ENT)
    INSERT INTO inventario.t600_ordenes_entrada
           (t600_ordenes_id, t200_entradas_almacen_id)
    VALUES (v_orden_id, v_entry_type_id);

    -- Order lines: one per active article
    INSERT INTO inventario.t650_ordenes
           (t650_ordenes_id, t600_ordenes_id, t100_articulos_id)
    SELECT gen_random_uuid(), v_orden_id, t100_articulos_id
    FROM   inventario.t100_articulos
    WHERE  deleted_at IS NULL;

    -- Line subtables (ENT — all nullable, just need the PK)
    INSERT INTO inventario.t650_ordenes_entrada (t650_ordenes_id)
    SELECT lo.t650_ordenes_id
    FROM   inventario.t650_ordenes lo
    WHERE  lo.t600_ordenes_id = v_orden_id;

    -- Event history: one event per line
    INSERT INTO inventario.t300_eventos
           (t300_eventos_id, t200_eventos_id, t100_articulos_id,
            t650_ordenes_id, estado_resultante, descripcion_estado, created_at)
    SELECT gen_random_uuid(),
           '10000000-0000-0000-0000-000000000001',
           lo.t100_articulos_id,
           lo.t650_ordenes_id,
           'Almacén',
           'Almacén ' || alm.name,
           NOW()
    FROM   inventario.t650_ordenes lo
    JOIN   inventario.t100_almacenes alm ON alm.t100_almacenes_id = v_almacen_id
    WHERE  lo.t600_ordenes_id = v_orden_id;

    -- ── 3. Assign all articles to almacén 17 ─────────────────────────────────
    UPDATE inventario.t100_articulos
    SET    t100_almacenes_id = v_almacen_id
    WHERE  deleted_at IS NULL;

    -- ── 4. Set ENT counter to 1 so next generated ref will be ENT-yyyy-00002 ─
    INSERT INTO inventario.t600_ordenes_contador
           (t200_eventos_id, anio, ultimo_numero)
    VALUES ('10000000-0000-0000-0000-000000000001', v_anio, 1)
    ON CONFLICT (t200_eventos_id, anio)
    DO UPDATE SET ultimo_numero = 1;

END $$;
