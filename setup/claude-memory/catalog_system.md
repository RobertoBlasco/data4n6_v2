---
name: catalog-system
description: "Sistema de metadata genérico — t000_app_tables, t900_apps, t900_table_fields, CatalogAdminComponent y ShellComponent dinámico"
metadata: 
  node_type: memory
  type: project
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Sistema de metadata dirigido por base de datos para registrar tablas, sus campos y sus aplicaciones propietarias. Permite que el componente genérico `CatalogAdminComponent` renderice formularios y rejillas sin código específico por entidad.

**Why:** Evitar crear un componente Angular por cada catálogo simple. Una sola pantalla genérica sirve para todos.  
**How to apply:** Para catálogos nuevos: (1) insertar en `t000_app_tables`, (2) opcionalmente añadir filas en `t900_table_fields`. Sin código frontend adicional.

---

## Tablas del sistema de metadata (schema `common`)

### `t000_app_tables` — registro de tablas UI
| Columna | Descripción |
|---|---|
| `t000_app_tables_id` | UUID PK |
| `table_name` | nombre de la tabla BD (único) |
| `display_name` | nombre en la UI |
| `nombre_singular` / `nombre_plural` | para textos del formulario/rejilla |
| `icono` | nombre de icono Lucide |
| `endpoint_base` | ruta completa `/api/v1/...` |
| `seccion_menu` | sección del sidebar (`inventory_admin`, `inventory_catalog`) |
| `orden_menu` | orden dentro de la sección |
| `vistas` | `GRID` (por defecto) |
| `form_fields` | CSV de campos; formato `campo` o `campo:/endpoint` para FK |
| `db_schema` | schema PostgreSQL donde vive la tabla |
| `t900_apps_id` | FK → `t900_apps` (nullable) |

**Secciones de menú actuales:**
- `inventory_admin`: Admin Tablas (orden 0), Aplicaciones (orden 2), Campos de tabla (orden 3), Eventos (orden 5), Transiciones de evento (orden 6)
- `inventory_catalog`: Marcas, Modelos, Tipos de material, Tipos de almacén, etc.

### `t900_apps` — módulos de la aplicación
| Columna | Descripción |
|---|---|
| `t900_apps_id` | UUID PK |
| `name` | clave interna: `common`, `inventory`, `data4n6` |
| `display_name` | nombre visible: `Común`, `Inventario`, `Forense` |
| `description` | texto libre |
| `icono` | nombre de icono Lucide |

### `t900_table_fields` — metadatos de campo
| Columna | Tipo | Descripción |
|---|---|---|
| `t900_table_fields_id` | UUID PK | |
| `t000_app_tables_id` | UUID FK | tabla a la que pertenece el campo |
| `field_name` | VARCHAR(100) | nombre camelCase del campo en el JSON |
| `display_name` | VARCHAR(100) | etiqueta en la UI |
| `field_type` | VARCHAR(50) | `text`, `textarea`, `number`, `boolean`, `date`, `select`, `email`, `url` |
| `required` | BOOLEAN | muestra `*` en label; DEFAULT false |
| `default_value` | TEXT | valor al abrir "Nuevo" |
| `placeholder` | TEXT | hint dentro del input |
| `endpoint` | VARCHAR(200) | para `select`/FK: endpoint para cargar opciones |
| `visible_in_grid` | BOOLEAN | si aparece como columna; DEFAULT true |
| `visible_in_form` | BOOLEAN | si aparece en el formulario; DEFAULT true |
| `orden` | SMALLINT | orden de aparición |

---

## Backend: paquete `com.data4n6.catalog`

### Clases
| Clase | Rol |
|---|---|
| `AppTable` | @Entity `t000_app_tables` (common) — @Getter @Setter |
| `AppTableRepository` | `findByTableName`, `findBySeccionMenuOrderByOrdenMenu` |
| `AppTableService` | findAll, findBySeccion, findByTableName, create, update, delete |
| `AppTableController` | GET /, GET /{tableName}, POST, PUT /{id}, DELETE /{id} |
| `dto/AppTableRequest` | tableName, displayName, ..., applicationId (UUID) |
| `dto/AppTableResponse` | todos los campos + `AppResponse application` anidado |
| `App` | @Entity `t900_apps` (common) — @Getter |
| `AppRepository` | JpaRepository<App, UUID> |
| `AppService` | findAll → List<AppResponse> |
| `AppController` | GET /api/v1/catalog/apps |
| `dto/AppResponse` | id, name, displayName, description, icono |
| `TableField` | @Entity `t900_table_fields` (common) — @Getter @Setter |
| `TableFieldRepository` | `findByAppTable_IdOrderByOrden(UUID)` |
| `TableFieldService` | findByAppTable, create, update, delete |
| `TableFieldController` | GET ?tableId=, POST, PUT /{id}, DELETE /{id} |
| `dto/TableFieldRequest` | appTableId, fieldName, fieldType, required, defaultValue, etc. |
| `dto/TableFieldResponse` | todos los campos |

### Endpoints del catálogo
```
GET    /api/v1/catalog/app-tables              → lista completa (o ?seccion=X)
GET    /api/v1/catalog/app-tables/{tableName}  → por nombre de tabla
POST   /api/v1/catalog/app-tables              → crear
PUT    /api/v1/catalog/app-tables/{id}         → actualizar (usa UUID del row)
DELETE /api/v1/catalog/app-tables/{id}

GET    /api/v1/catalog/apps                    → lista aplicaciones (t900_apps)

GET    /api/v1/catalog/table-fields?tableId={uuid}  → campos de una tabla
POST   /api/v1/catalog/table-fields
PUT    /api/v1/catalog/table-fields/{id}
DELETE /api/v1/catalog/table-fields/{id}
```

---

## Frontend: componentes y servicios

### `AppTableService` (`src/app/core/services/app-table.service.ts`)
```typescript
getAll(): Observable<AppTable[]>
getBySection(seccion): Observable<AppTable[]>
getByTableName(tableName): Observable<AppTable>
getFieldsByTableId(tableId): Observable<TableField[]>
resolveEndpointPath(endpointBase): string  // quita /api/v1 para usar con ApiService
```

### Modelos (`src/app/core/models/`)
- `app-table.model.ts` — `AppTable` con `application: App | null`
- `app.model.ts` — `App { id, name, displayName, description, icono }`
- `table-field.model.ts` — `TableField { id, appTableId, fieldName, displayName, fieldType, required, defaultValue, placeholder, endpoint, visibleInGrid, visibleInForm, orden }`

### `CatalogAdminComponent` (`features/inventory/admin/catalog-admin/`)
Componente genérico que extiende `GridBase<Row>`.

**Fuentes de columnas (prioridad decreciente):**
1. `t900_table_fields` con `visibleInGrid=true` (ordenado por `orden`)
2. Auto-derivación del primer item cargado (salta campos de sistema, IDs, Nombres con FK pareja)

**Fuentes de campos de formulario (prioridad decreciente):**
1. `t900_table_fields` con `visibleInForm=true` (ordenado por `orden`)
2. `formFields` CSV en `t000_app_tables`, formato `campo` o `campo:/endpoint` para FK selects
3. Auto-derivación de columnas

**Tipos de campo en el formulario:**
- Sin `endpoint`: input normal o `textarea` (por `field_type='textarea'` o nombre en lista hardcoded)
- `boolean` → checkbox
- `number` → `<input type="number">`
- `date` → `<input type="date">`
- Con `endpoint` → `<select>` dinámico cargado desde ese endpoint

**Acciones de cabecera (cuando hay selección):**
- Editar (pencil) — habilitado solo con exactamente 1 seleccionado
- Ir al formulario (fileText) — por defecto igual a editar; sobreescribible con `openItemForm(row)`
- Eliminar (trash) — habilitado solo con exactamente 1 seleccionado
- Exportar, Deseleccionar

**Selección de filas:** clic en fila activa/desactiva; fila seleccionada → `bg-primary/10`

**`doSave()`:** campos con `endpoint` se envían como `{campo}Id: uuid` en el body.

---

## ShellComponent — menú dinámico

El sidebar se construye en tiempo real desde la BD:
```typescript
this.appTableSvc.getAll()
  .subscribe(tables => {
    const admin   = tables.filter(t => t.seccionMenu === 'inventory_admin').sort(byOrder);
    const catalog = tables.filter(t => t.seccionMenu === 'inventory_catalog').sort(byOrder);
    this.navGroups.set(buildInventoryNavGroups(admin, catalog));
  });
```

Cada entrada navega a `/inventory/admin/{tableName}` (ruta genérica).

---

## Pendientes conocidos

- **Reiniciar backend** para aplicar V56 (crea t900_table_fields, registra t900_apps y t900_table_fields en menú)
- **Reestructuración modular** de paquetes forenses (`com.data4n6.cases` → `com.data4n6.data4n6.cases`) — plan guardado en `.claude/plans/`
- **Pantallas Operaciones** (Propuestas, Órdenes) — no iniciadas
- **CRUD completo de AppTable desde UI** — endpoints ya existen; pendiente probar end-to-end
