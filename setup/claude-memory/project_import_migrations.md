---
name: project-import-migrations
description: "Proceso completo de importación histórica tmp→inventario — migraciones, pitfalls, diagnóstico y recuperación de errores Flyway (actualizado 2026-06-02)"
metadata: 
  node_type: memory
  type: project
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

# Importaciones históricas: tmp → inventario

Todas las migraciones de importación leen del schema `tmp` (datos legacy del sistema anterior) e insertan en el schema `inventario`. Son idempotentes (`ON CONFLICT DO NOTHING`).

**Why:** Migración de datos históricos del sistema AGR/TAL al nuevo sistema. Se necesitará re-ejecutar en producción con los datos reales del cliente.

**How to apply:** Al desplegar en producción, el schema `tmp` debe estar poblado ANTES de que Flyway aplique estas migraciones. El orden es obligatorio por FKs.

---

## Importación inicial de producción (V133) — 2026-06-02

`V133__reset_import_all_articles_almacen17.sql` — **migración de estado inicial para producción**.

Hace:
1. Borra TODAS las órdenes y eventos (t300_eventos, t650_*, t600_*, t600_ordenes_contador)
2. Crea una única orden ENT (`ENT-{año}-00001`) de tipo "Importación", estado "Completada"
3. Crea una línea + evento `estado_resultante = 'Almacén'` por cada artículo activo
4. Asigna todos los artículos a **ARMARIO 17** (`t100_almacenes.name = 'ARMARIO 17'`)
5. Resetea el contador ENT a 1

**Pitfalls conocidos:**
- `t200_entradas_almacen.descripcion_corta` estaba vacío en esta BD → buscar por `nombre = 'Importación'`
- El almacén debe existir con `name = 'ARMARIO 17'` exactamente

**Para producción:** ejecutar esta migración con el almacén correcto en destino. Ajustar el `name` del almacén si es diferente.

---

## Pre-requisito: schema tmp con tablas fuente

| Tabla fuente | Usada por | Contenido |
|---|---|---|
| `tmp.t700_albaranes_eal` | V101 | Cabeceras entrada a almacén |
| `tmp.t370_albaranes_eal` | V101 | Líneas entrada a almacén |
| `tmp.t700_albaranes_tal` | V106 | Cabeceras traspaso |
| `tmp.t370_albaranes_tal` | V106 | Líneas traspaso |
| `tmp.t700_albaranes_agr` | V107/V119 | Cabeceras préstamo (puede tener `referencia` duplicada y `t100_casos_id`) |
| `tmp.t370_albaranes_agr` | V107/V119 | Líneas préstamo |
| `tmp.t700_albaranes_agr_dev` | V107/V119 | Cabeceras devolución |
| `tmp.t370_albaranes_agr_dev` | V107/V119 | Líneas devolución |
| `tmp.t370_eventos_inventario` | V101/V106/V119 | Historial de eventos (algunos registros tienen `fecha` y `fecha_inicio` ambos NULL — válido) |

---

## Secuencia completa de migraciones de importación

### V101 — Entradas a almacén (EAL)

Pasos: `t600_ordenes` → `t600_ordenes_entrada` → `t650_ordenes` → `t650_ordenes_entrada` → `t300_eventos`

Evento: `10000000-0000-0000-0000-000000000001`

---

### V106 — Traspasos de almacén (TAL)

Pasos: `t600_ordenes` → `t600_ordenes_traspaso` → `t650_ordenes` → `t650_ordenes_traspaso` → `t300_eventos`

Evento: `10000000-0000-0000-0000-000000000002`  
Estado: `fecha_fin IS NOT NULL` → Completada, else Pendiente

---

### V107 — Préstamos (PRS) y devoluciones (DEV) de AGR — VERSIÓN ORIGINAL

Archivo: `V107__import_albaranes_agr.sql`

Esta versión NO incluye `t100_casos_id`. Fue sustituida funcionalmente por V119 (ver más abajo). Los datos que insertó V107 son borrados y reimportados por V119.

---

### V108 — Bajas

Archivo: `V108__import_albaranes_baja.sql`

---

### V111 — Añade columna `descripcion_estado` a `t300_eventos`

Backfill automático: Almacén → `'Almacén ' + alm.name`, Prestado/agente → `'Unidad X Agente Y'`, etc.

---

### V112 — Añade FK `t100_casos_id` a `t600_ordenes_prestamo`

```sql
ALTER TABLE inventario.t600_ordenes_prestamo
    ADD COLUMN t100_casos_id UUID REFERENCES data4n6.t100_cases(t100_cases_id);
```

---

### V115 — Añade `reference VARCHAR(50)` a `data4n6.t100_cases`

### V116 — Elimina columna `code` de `data4n6.t100_cases`

---

### V117 — Importa casos stub desde tmp.t700_albaranes_agr

Crea una fila en `data4n6.t100_cases` por cada UUID distinto de `t100_casos_id` en las cabeceras de préstamo. Título: `'Caso importado (pendiente de actualizar)'`.

```sql
INSERT INTO data4n6.t100_cases (t100_cases_id, title, created_by, updated_by)
SELECT lower(src.t100_casos_id)::uuid, 'Caso importado (pendiente de actualizar)', 'import', 'import'
FROM (SELECT DISTINCT t100_casos_id FROM tmp.t700_albaranes_agr WHERE t100_casos_id IS NOT NULL) src
ON CONFLICT (t100_cases_id) DO NOTHING;
```

**Debe aplicarse ANTES de V118/V119** (V119 referencia esa FK).

---

### V118 — Reimporta PRS/DEV con t100_casos_id — VERSIÓN PARCIAL (buggy)

Borra lo que importó V107 y vuelve a importar incluyendo `t100_casos_id`. **Problema**: `ON CONFLICT DO NOTHING` silencia también los conflictos en el UNIQUE de `numero_referencia`, no solo en el PK. Las 78 cabeceras con referencia duplicada nunca se insertan.

---

### V119 — Reimporta PRS/DEV — VERSIÓN CORRECTA (fix de referencias duplicadas)

Archivo: `V119__reimport_prestamos_fix_dup_ref.sql`

**Fix clave**: `ROW_NUMBER() OVER (PARTITION BY referencia ORDER BY ...)` en el INSERT de cabeceras PRS. La primera fila de cada referencia mantiene el nombre original; las duplicadas reciben sufijo `-2`, `-3`, etc. (máx. 30 chars: `LEFT(referencia, 26) || '-' || rn::text`).

Orden de preferencia dentro de la partición:
1. `(t100_casos_id IS NOT NULL) DESC` — primero la que tiene caso
2. `fecha_inicio DESC NULLS LAST` — luego la más reciente
3. `t700_albaranes_agr_id` — desempate determinista

**Pasos**:
1. DELETE todo lo importado por V118 (inverso de FKs): t300_eventos → t650_dev → t650_prs → t650_ordenes(dev) → t650_ordenes(prs) → t600_dev → t600_prs → t600_ordenes(dev) → t600_ordenes(prs)
2. INSERT cabeceras PRS con sufijo para duplicados
3. INSERT `t600_ordenes_prestamo` con `t100_casos_id`
4. INSERT líneas PRS (`t650_ordenes`)
5. INSERT subtabla líneas PRS (`t650_ordenes_prestamo`)
6. INSERT cabeceras DEV
7. INSERT `t600_ordenes_devolucion`
8. INSERT líneas DEV
9. INSERT subtabla líneas DEV (`t650_ordenes_devolucion`)
10. INSERT eventos PRS — `created_at = COALESCE(ev.fecha, ev.fecha_inicio, NOW())`
11. INSERT eventos DEV — ídem con NOW() fallback
12. Recalcula `estado_resultante` (CTE recursiva, forward-propagation con restore_state stack)
13. Recalcula `descripcion_estado` (3 UPDATEs: Almacén / Prestado-agente / Prestado-unidad)

**IMPORTANTE**: en los pasos 10 y 11, usar siempre `COALESCE(ev.fecha, ev.fecha_inicio, NOW())` — algunos registros legacy tienen ambos campos NULL y `created_at` es NOT NULL.

---

## UUIDs de eventos de inventario (t200_eventos_id)

| UUID | Tipo |
|---|---|
| `10000000-0000-0000-0000-000000000001` | Entrada almacén (ENT) |
| `10000000-0000-0000-0000-000000000002` | Traspaso (TRS) |
| `10000000-0000-0000-0000-000000000004` | Préstamo (PRS) |
| `10000000-0000-0000-0000-000000000007` | Devolución (DEV) |

---

## Recuperación de errores Flyway

Cuando una migración falla en PostgreSQL, la transacción se revierte automáticamente (no hay cambios en BD). Pero Flyway registra la entrada con `success = false` y no reintenta.

**Pasos para corregir y reintentar**:

```sql
-- 1. Borrar la entrada fallida
DELETE FROM tenant_default.flyway_schema_history
WHERE version = '119' AND success = false;

-- 2. Corregir el archivo SQL
-- 3. Reiniciar el backend
```

**Verificar estado Flyway**:
```sql
SELECT version, description, success, installed_on
FROM tenant_default.flyway_schema_history
ORDER BY installed_rank;
```

---

## Queries de diagnóstico para V119

```sql
-- Cuántos PRS hay en la fuente y cuántos tienen adjudicatario y caso
SELECT
    COUNT(*)                                                          AS total,
    COUNT(*) FILTER (WHERE COALESCE(t100_agentes_destino_id, t100_unidades_destino_id) IS NOT NULL) AS con_adjudicatario,
    COUNT(*) FILTER (WHERE t100_casos_id IS NOT NULL)                AS con_caso
FROM tmp.t700_albaranes_agr;

-- Referencias duplicadas en la fuente (causa del bug de V118)
SELECT referencia, COUNT(*), array_agg(t700_albaranes_agr_id)
FROM tmp.t700_albaranes_agr
GROUP BY referencia HAVING COUNT(*) > 1;

-- Verificación post-migración
SELECT COUNT(*) FROM inventario.t600_ordenes_prestamo;   -- esperado: = total con adjudicatario
SELECT COUNT(*) FROM inventario.t600_ordenes
WHERE t200_eventos_id = '10000000-0000-0000-0000-000000000004'::uuid
  AND aprobado_por = 'Importación';                       -- esperado: = total PRS fuente

-- Cuántos PRS tienen caso asociado tras la importación
SELECT COUNT(*) FROM inventario.t600_ordenes_prestamo WHERE t100_casos_id IS NOT NULL;
```

## Queries de verificación pre-migración

```sql
-- Artículos PRS sin match en inventario (debe ser 0)
SELECT COUNT(*) FROM tmp.t370_albaranes_agr lin
WHERE NOT EXISTS (SELECT 1 FROM inventario.t100_articulos a WHERE a.t100_articulos_id = lower(lin.t700_inventario_id)::uuid);

-- Artículos DEV sin match (debe ser 0)
SELECT COUNT(*) FROM tmp.t370_albaranes_agr_dev lin
WHERE NOT EXISTS (SELECT 1 FROM inventario.t100_articulos a WHERE a.t100_articulos_id = lower(lin.t700_inventario_id)::uuid);

-- Casos referenciados en préstamos sin fila en t100_cases (debe ser 0 tras V117)
SELECT COUNT(DISTINCT t100_casos_id) FROM tmp.t700_albaranes_agr
WHERE t100_casos_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM data4n6.t100_cases c WHERE c.t100_cases_id = lower(t100_casos_id)::uuid
  );
```
