---
name: inventory-backend
description: "Estructura completa del módulo inventory — tablas, clases Java, endpoints, patrones y convenciones de nombrado (2026-05-20)"
metadata: 
  node_type: memory
  type: project
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Módulo `com.data4n6.inventory` — gestión de inventario físico de equipos y materiales forenses.

**Why:** Controlar el inventario de equipos, materiales y almacenes de la unidad forense.
**How to apply:** Seguir los patrones establecidos al crear nuevas entidades. Ver sección "Patrón de implementación".

---

## Tablas y correspondencia Java

### t100_ — Entidades de inventario

| Tabla BD | Clase Java | Paquete | Endpoint |
|---|---|---|---|
| `t100_almacenes` | `Almacen` | `almacen/` | `/api/v1/inventory/almacenes` |
| `t100_articulos` | `Articulo` | `articulo/` | `/api/v1/inventory/articulos` |
| `t100_materiales` | `Material` | `material/` | `/api/v1/inventory/materiales` |

### t200_ — Catálogos de referencia

| Tabla BD | Clase Java | Paquete | Endpoint |
|---|---|---|---|
| `t200_almacenes` | `TipoAlmacen` | `tipoalmacen/` | `/api/v1/inventory/tipos-almacen` |
| `t200_articulos` | `CategoriaArticulo` | `categoriarticulo/` | `/api/v1/inventory/categorias-articulos` |
| `t200_item_statuses` | `ItemStatus` | `itemstatus/` | `/api/v1/inventory/item-statuses` ← **pendiente renombrar** |
| `t200_marcas` | `T200Marca` | `marca/` | `/api/v1/inventory/marcas` |
| `t200_materiales` | `TipoMaterial` | `tipomaterial/` | `/api/v1/inventory/tipos-material` |

---

## Relaciones entre tablas

```
t200_almacenes (TipoAlmacen)
    └── t100_almacenes (Almacen) — FK: t200_almacenes_id

t200_articulos (CategoriaArticulo)
    └── t100_articulos (Articulo) — FK: t200_articulos_id  [NOT NULL]

t200_marcas (T200Marca)
    ├── t100_articulos (Articulo) — FK: t200_marcas_id     [nullable]
    └── t100_materiales (Material) — FK: t200_marcas_id   [nullable]

t200_materiales (TipoMaterial)
    └── t100_materiales (Material) — FK: t200_materiales_id [NOT NULL]

t200_item_statuses (ItemStatus)
    └── t100_articulos (Articulo) — FK: t200_item_statuses_id [nullable]
```

---

## Convenciones de nombrado (establecidas 2026-05-20)

- **Tablas BD:** siempre en **español**, snake_case. Prefijo indica nivel: `t100_` inventario, `t200_` catálogo.
- **PKs:** `{nombre_tabla}_id` (UUID).
- **FKs:** `{tabla_referenciada}_id` — nombre de la tabla destino, no de la clase Java.
- **Clases Java:** nombre semántico en español o inglés según legibilidad. No tienen que coincidir con el nombre de la tabla.
- **Paquetes Java:** snake_case sin separadores (ej. `categoriarticulo`, `tipoalmacen`).
- **Endpoints:** kebab-case en español (ej. `/tipos-almacen`, `/categorias-articulos`).

---

## Patrón de implementación de una entidad inventory

Cada entidad tiene exactamente 6 ficheros:

```
{paquete}/
├── {Entidad}.java                      ← @Entity + @Table + @AttributeOverride PK
├── dto/{Entidad}Request.java           ← record con campos planos (IDs para FKs)
├── dto/{Entidad}Response.java          ← record con campos expandidos (id + nombre de FK)
├── repository/{Entidad}Repository.java ← JpaRepository con findAllActive() / findActiveById()
├── service/{Entidad}Service.java       ← CRUD + applyRequest() para resolver FKs
└── controller/{Entidad}Controller.java ← @RestController CRUD estándar
```

### InventoryBaseEntity
```java
// Campos heredados:
UUID id            // @GeneratedValue, @Column(name = "{tabla}_id") via @AttributeOverride
Instant deletedAt  // soft delete
// Métodos:
softDelete()       // sets deletedAt = now
isDeleted()
```

### applyRequest() — patrón para FKs
Cuando la entidad tiene FKs a otras entidades, el servicio usa `applyRequest()` para resolverlas:
```java
private void applyRequest(Entidad e, EntidadRequest req) {
    e.setFkEntidad(req.fkId() == null ? null :
        fkRepository.findById(req.fkId())
            .orElseThrow(() -> new ResourceNotFoundException("FkEntidad", req.fkId())));
}
```

### findAllActive() con JOIN FETCH
Cuando la entidad tiene FKs lazy, el repositorio usa JOIN FETCH para evitar N+1:
```java
@Query("SELECT a FROM Articulo a JOIN FETCH a.categoria LEFT JOIN FETCH a.brand ...")
List<Articulo> findAllActive();
```

---

## InventoryMapper (MapStruct)

Fichero único `com.data4n6.inventory.InventoryMapper` con todos los mapeos del módulo.

Para entidades con FKs en el response:
```java
@Mapping(target = "tipoAlmacenId",     source = "tipoAlmacen.id")
@Mapping(target = "tipoAlmacenNombre", source = "tipoAlmacen.name")
AlmacenResponse toResponse(Almacen almacen);

@Mapping(target = "id",          ignore = true)
@Mapping(target = "deletedAt",   ignore = true)
@Mapping(target = "tipoAlmacen", ignore = true)  // se resuelve en applyRequest()
Almacen toEntity(AlmacenRequest request);
```

---

## Paquetes de órdenes y estados (añadidos 2026-05-26)

Ver [[project-orden-design]] para el diseño completo. Resumen de paquetes nuevos:

- `orden/` — `Orden`, `LineaOrden`, `LineaOrden{Entrada,Traspaso,Adjudicacion,Prestamo,Devolucion,Baja}`, `Orden{Traspaso,Adjudicacion,Prestamo,Devolucion,Entrada}`, `OrdenContador`, `OrdenContadorId`; servicio `OrdenContadorService`
- `estadoorden/` — `EstadoOrden` (t200_estados_ordenes: Pendiente, En proceso, Completada, Cancelada)
- `eventohistorial/` — `EventoHistorial` extiende `InventoryBaseEntity`; tabla `t300_eventos`; campo `lineaOrden` (FK a t650_ordenes)
- `propuesta/service/PropuestaService` — flujo de aprobación crea Orden + subtablas + LineaOrden + EventoHistorial

**TODO pendiente en PropuestaService:** caso `ENT` no implementado (crea artículos nuevos, más complejo).

---

## Tabla t000_app_tables (common)
Cada tabla de inventario tiene un registro en `common.t000_app_tables` con su `table_name`, `display_name` y `description`.
El `MetadataService.onCreate()` / `onUpdate()` recibe el nombre de tabla como constante `TABLE` en cada servicio.
