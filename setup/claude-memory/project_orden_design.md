---
name: project-orden-design
description: "Diseño del sistema de órdenes de inventario — t600 (cabecera), t650 (líneas), subtablas tipo, referencias y estado (2026-05-26)"
metadata: 
  node_type: memory
  type: project
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Sistema de órdenes de inventario. Decisiones de diseño tomadas en sesión 2026-05-26.

**Why:** Gestionar altas, traspasos, adjudicaciones, préstamos, devoluciones y bajas de material con trazabilidad completa a nivel de artículo.
**How to apply:** Seguir el patrón de dos niveles (cabecera + líneas) y las subtablas de especialización al añadir nuevas funcionalidades.

---

## Estructura de dos niveles

```
t600_ordenes (cabecera — 1 por aprobación)
  ├── numero_referencia  "{prefijo}-{año}-{00001}"
  ├── t400_propuestas_id (FK 1:1 a la propuesta que generó la orden)
  ├── t200_eventos_id    (tipo de evento: TRS, ADJ, PRS, BAJ, ENT...)
  ├── t200_estados_ordenes_id (Pendiente | En proceso | Completada | Cancelada)
  ├── aprobado_por + aprobado_en
  └── deleted_at

t650_ordenes (líneas — N por t600, una por artículo)
  ├── t600_ordenes_id  (FK a cabecera)
  ├── t100_articulos_id
  ├── deleted_at
  └── created_at
```

**Regla clave:** `t300_eventos` (historial) apunta a `t650_ordenes_id`, no a `t600_ordenes_id`, porque cada evento de historial está ligado a un artículo concreto, no a la orden entera.

---

## Subtablas de cabecera (t600_ordenes_*)

Especializan la **orden completa**. Una fila por orden, comparten PK con t600_ordenes via `@MapsId`.

| Tabla | Campos extra | Cuándo |
|---|---|---|
| `t600_ordenes_traspaso` | t100_almacenes_origen_id | órdenes TRS |
| `t600_ordenes_adjudicacion` | adjudicatario_id, adjudicatario_tabla | órdenes ADJ |
| `t600_ordenes_prestamo` | adjudicatario_id, adjudicatario_tabla, fecha_devolucion | órdenes PRS |
| `t600_ordenes_devolucion` | t600_ordenes_prestamo_id | órdenes DEV |
| `t600_ordenes_entrada` | t200_entradas_almacen_id, t200_proveedores_id | órdenes ENT |

---

## Subtablas de línea (t650_ordenes_*)

Especializan **cada línea individual** (artículo). Una fila por línea, comparten PK con t650_ordenes via `@MapsId`.

| Tabla | Campos extra | Cuándo |
|---|---|---|
| `t650_ordenes_entrada` | t200_proveedores_id, t200_marcas_id, t200_modelos_id, numero_serie | líneas ENT — proveedor/modelo puede variar por artículo |
| `t650_ordenes_traspaso` | t100_almacenes_origen_id (NOT NULL), t100_almacenes_destino_id (NOT NULL) | líneas TRS — almacenes por artículo |
| `t650_ordenes_adjudicacion` | (extensible) | líneas ADJ |
| `t650_ordenes_prestamo` | (extensible) | líneas PRS |
| `t650_ordenes_devolucion` | t650_ordenes_prestamo_id (FK a la línea PRS original) | líneas DEV |
| `t650_ordenes_baja` | (extensible) | líneas BAJ |

**Por qué tanto nivel de cabecera como de línea:** En una orden de traspaso, el almacén destino es el mismo para todas las líneas → en t600_ordenes_traspaso. Pero en una entrada, el proveedor puede ser diferente por artículo → en t650_ordenes_entrada.

---

## Contador de referencias

`t600_ordenes_contador` — tabla con PK compuesta (t200_eventos_id, anio) y campo ultimo_numero INTEGER. `OrdenContadorService` usa pessimistic write lock para generar referencias únicas.

Formato: `{evento.descripcionCorta}-{año}-{00001}` (e.g. `TRS-2026-00001`)

---

## Entidades Java (paquete `com.data4n6.inventory.orden`)

| Clase | Tabla | Notas |
|---|---|---|
| `Orden` | t600_ordenes | Cabecera; tiene `@OneToOne` a `Propuesta` |
| `EstadoOrden` | t200_estados_ordenes | En paquete `estadoorden/` |
| `LineaOrden` | t650_ordenes | Línea base; tiene FK a Orden y a Articulo |
| `LineaOrdenEntrada` | t650_ordenes_entrada | `@MapsId` sobre LineaOrden |
| `LineaOrdenTraspaso` | t650_ordenes_traspaso | almacenOrigen + almacenDestino |
| `LineaOrdenAdjudicacion` | t650_ordenes_adjudicacion | vacía por ahora |
| `LineaOrdenPrestamo` | t650_ordenes_prestamo | vacía por ahora |
| `LineaOrdenDevolucion` | t650_ordenes_devolucion | FK a LineaOrden (prestamo original) |
| `LineaOrdenBaja` | t650_ordenes_baja | vacía por ahora |
| `OrdenTraspaso` | t600_ordenes_traspaso | subtabla cabecera, almacén origen |
| `OrdenAdjudicacion` | t600_ordenes_adjudicacion | adjudicatario_id + tabla |
| `OrdenPrestamo` | t600_ordenes_prestamo | adjudicatario + fecha_devolucion |
| `OrdenDevolucion` | t600_ordenes_devolucion | FK a Orden (préstamo) |
| `OrdenContador` | t600_ordenes_contador | lock pesimista en `OrdenContadorService` |

---

## PropuestaService — flujo de aprobación

Al aprobar una propuesta:
1. Crea `Orden` (cabecera) con referencia generada por `OrdenContadorService`
2. Crea subtabla de cabecera según prefijo (TRS, ADJ, PRS, BAJ)
3. Por cada `LineaPropuesta`:
   - Crea `LineaOrden` (base)
   - Crea subtabla de línea (`LineaOrden{Tipo}`)
   - Crea `EventoHistorial` apuntando a esa `LineaOrden`
   - Actualiza `MaterialActivo`

**TODO pendiente:** caso `ENT` (entrada de almacén) — crea artículos nuevos, lógica más compleja, no implementado aún. Marcado con `// TODO: ENT` en `PropuestaService.procesarLinea()`.

---

## Devolución de préstamos (caso especial)

- Una orden PRS puede generar N órdenes DEV (devoluciones parciales)
- `t600_ordenes_devolucion.t600_ordenes_prestamo_id` → FK a la orden de préstamo original
- `t650_ordenes_devolucion.t650_ordenes_prestamo_id` → FK a la línea de préstamo original (qué artículo específico)
