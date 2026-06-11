---
name: project-catalog-backend
description: "Paquete catalog del backend — clases Java, endpoints, DTOs, y relaciones (2026-05-26)"
metadata:
  node_type: memory
  type: project
  originSessionId: current
---

Paquete `com.data4n6.catalog` — metadatos de UI, agentes, unidades, documentos.

**Why:** Proporcionar catálogos compartidos entre módulos y la metadata que alimenta la navegación dinámica del frontend.
**How to apply:** Endpoints en `/api/v1/catalog/...`; usar `AppTableService.getAll()` para cargar el menú dinámico.

---

## Clases principales

| Clase | Tabla | Endpoint | Notas |
|---|---|---|---|
| `AppTable` | `common.t000_app_tables` | `GET /api/v1/catalog/app-tables` | Metadata de todas las tablas del frontend |
| `App` | `common.t900_apps` | `GET /api/v1/catalog/apps` | Aplicaciones (inventory, data4n6, common) |
| `TableField` | `common.t900_table_fields` | `GET /api/v1/catalog/table-fields` | Campos de formulario por tabla |
| `Unit` | `common.t100_units` | `GET /api/v1/catalog/units` | Unidades de la organización |
| `Agent` | `common.t100_agents` | `GET /api/v1/catalog/agents` | Agentes (personas de la organización) |
| `IdentDoc` | `common.t100_docs` | `GET /api/v1/catalog/id-docs` | Documentos de identidad |

## AppTable — campos clave

```java
String tableName;       // nombre único de la tabla BD
String displayName;     // nombre visible en UI
String nombreSingular;  // para formularios
String nombrePlural;    // para rejillas
String icono;           // nombre del icono Lucide
String vistas;          // "GRID" por defecto
String endpointBase;    // ej: /api/v1/inventory/articulos
String seccionMenu;     // inventory_admin | inventory_catalog | inventory_ops | common_catalog
Short  ordenMenu;
String formFields;      // campos para el formulario genérico (CatalogAdminComponent)
String dbSchema;        // esquema BD
App    application;     // FK a t900_apps (puede ser null)
```

## Secciones de menú en uso (seccionMenu)

- `inventory_admin` — aparece en nav inventario (admin): Eventos, Transiciones, Apps, TableFields, t000_app_tables
- `inventory_catalog` — aparece en nav inventario (catálogos): Marcas, Tipos almacén, Modelos, etc.
- `inventory_ops` — **NO aparece en nav aún** (pendiente implementar): Propuestas, Órdenes, Historial
- `common_catalog` — aparece en nav datos comunes: Unidades, Docs, Agentes

## DTOs

```java
// AppTableRequest — para crear/actualizar
record AppTableRequest(String tableName, String displayName, String description,
    String nombreSingular, String nombrePlural, String icono, String vistas,
    String endpointBase, String seccionMenu, Short ordenMenu, String formFields,
    String dbSchema, UUID applicationId)

// AppTableResponse — añade formRoute + App expandida
record AppTableResponse(..., String formRoute, AppResponse application)

// AppResponse — id, name, displayName, description, icono
```

## Notas de implementación

- `AppTableService` usa `AppRepository` para resolver la FK de `application`
- `AppTableController.@RequestMapping("/api/v1/catalog/app-tables")` — NO es `/catalog/app-tables`
- Los archivos `AppTableController.java`, `AppTableService.java`, `AppController.java`, etc. son **untracked** en git (nuevos, no commiteados aún)
