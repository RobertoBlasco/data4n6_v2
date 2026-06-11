# Grid Templates

Arquitectura de rejillas basada en **Tailwind CSS + Spartan** y Angular signals.

---

## Jerarquía

```
GridBase (clase abstracta)          ← shared/grid/grid-base.ts
    └── GridDialogBase              ← shared/grid/grid-dialog-base.ts

HistoricalGridComponent             ← shared/components/historical-grid/
SectionHeaderComponent              ← shared/components/historical-grid/
```

---

## GridBase

Clase abstracta que implementa toda la lógica común de las rejillas principales: carga de datos, búsqueda, ordenación multi-columna, paginación, selección múltiple y carga de metadatos desde `t900_app_tables`.

**Archivo:** `src/app/shared/grid/grid-base.ts`

### Propiedades abstractas (obligatorias en cada subclase)

```typescript
protected abstract readonly gridId:        string;  // clave única para localStorage
protected abstract readonly labelSingular: string;  // fallback singular
protected abstract readonly labelPlural:   string;  // fallback plural
protected abstract readonly icon:          string;  // nombre del icono lucide
```

### Propiedad opcional

```typescript
protected readonly colMetaTableName: string | null = null;
```

Cuando se define, `loadGridPrefs()` carga automáticamente:
- `tableMeta` — metadatos de `t900_app_tables` (displayName, nombrePlural…)
- `colMetaFields` — definición de columnas de `t900_table_fields`

### Signals expuestos al template

| Signal | Tipo | Descripción |
|---|---|---|
| `tableMeta` | `AppTable \| null` | Metadatos de la tabla desde `t900_app_tables` |
| `gridTitle` | `string` (computed) | `nombrePlural ?? displayName ?? labelPlural` |
| `allItems` | `T[]` | Todos los registros cargados |
| `filteredItems` | `T[]` (computed) | Tras aplicar búsqueda y ordenación |
| `pageItems` | `T[]` (computed) | Página actual |
| `loading` | `boolean` | Cargando datos |
| `error` | `string \| null` | Mensaje de error |
| `searchInput` | `string` | Valor actual del campo de búsqueda |
| `searchQuery` | `string` | Valor debounced (300ms) |
| `sortCriteria` | `SortCriterion[]` | Criterios de ordenación activos |
| `selectedIds` | `Set<string>` | IDs seleccionados |
| `selectionCount` | `number` (computed) | Número de elementos seleccionados |
| `singleSelected` | `T \| null` (computed) | El elemento seleccionado si es exactamente 1 |
| `allSelected` | `boolean` (computed) | Todos los de la página seleccionados |
| `someSelected` | `boolean` (computed) | Algunos (tri-estado para el checkbox de cabecera) |
| `currentPage` | `number` | Página actual (base 0) |
| `pageSize` | `number` | Registros por página |
| `totalRecords` | `number` (computed) | Total tras filtro |
| `totalPages` | `number` (computed) | Páginas totales |
| `pageNumbers` | `(number \| '...')[]` (computed) | Números de página para mostrar |
| `displayFrom` / `displayTo` | `number` (computed) | Rango visible ("15–30 de 142") |
| `colMetaFields` | `TableField[]` | Definición de columnas |
| `activeView` | `GridViewDef` | Vista activa (GRID, CARD…) |

### Métodos del template

| Método | Descripción |
|---|---|
| `reload()` | Recarga los datos |
| `onSearchInput(value)` | Actualiza la búsqueda |
| `clearSearch()` | Limpia la búsqueda |
| `toggleSort(field, $event)` | Ordena por columna; Shift+click añade criterio |
| `sortDir(field)` | `'asc' \| 'desc' \| null` para el indicador visual |
| `setPage(n)` | Navega a la página n |
| `setPageSize(n)` | Cambia el tamaño de página (persiste en localStorage) |
| `toggleSelectAll()` | Selecciona/deselecciona todos de la página |
| `toggleSelectRange(id, idx, $event)` | Selección con Shift para rangos |
| `clearSelection()` | Limpia la selección |
| `loadGridPrefs()` | Carga pageSize de localStorage y tableMeta/colMeta |

### Método abstracto

```typescript
protected abstract load(): void;
```

Cada subclase implementa la llamada HTTP y actualiza `allItems`.

### Colores estándar

```typescript
toolbarColor   = 'bg-[#005a3b] text-white'
headerColor    = 'bg-surface-warm'
footerColor    = 'bg-surface-warm'
rowStripeClass = 'bg-surface-primary'
rowHoverClass  = 'hover:!bg-action/25'
```

### Patrón de cabecera (selección)

Todas las rejillas implementan este patrón en el header:

```html
@if (selectionCount() === 0) {
  <!-- Título + controles normales -->
  <h1>{{ gridTitle() }}</h1>
} @else {
  <!-- Modo selección: acciones en este orden exacto -->
  <span>{{ selectionCount() }} seleccionado(s)</span>
  <button ...>Eliminar</button>                          <!-- siempre (salvo órdenes) -->
  @if (selectionCount() === 1) {
    <button lucideExternalLink>Ir formulario</button>    <!-- solo con 1 seleccionado -->
  }
  <button lucideDownload>Exportar</button>               <!-- siempre -->
  <!-- divisor -->
  <button lucideX (click)="clearSelection()">✕</button>  <!-- siempre -->
}
```

> **Regla:** Las rejillas de órdenes (`t600_*`) NO incluyen el botón Eliminar — las órdenes son inmutables una vez creadas.

### Ejemplo de subclase mínima

```typescript
@Component({ ... })
export class MiRejillaComponent extends GridBase<MiEntidad> implements OnInit {
  protected override readonly gridId        = 'mi-rejilla';
  protected override readonly labelSingular = 'Elemento';
  protected override readonly labelPlural   = 'Elementos';
  protected override readonly icon          = 'lucideTag';
  protected override readonly colMetaTableName = 't200_mi_tabla'; // opcional

  override ngOnInit(): void {
    this.loadGridPrefs();
    this.sortCriteria.set([{ field: 'nombre', dir: 'asc' }]);
    this.load();
  }

  protected override load(): void {
    this.loading.set(true);
    this.http.get<MiEntidad[]>(API).subscribe({
      next:  data => { this.allItems.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Error al cargar'); this.loading.set(false); },
    });
  }
}
```

---

## GridDialogBase

Extiende `GridBase`. Para catálogos simples que incluyen diálogo de alta/edición integrado en la misma pantalla.

**Archivo:** `src/app/shared/grid/grid-dialog-base.ts`

Añade la gestión del estado del diálogo y los botones del patrón de alta:

| Botón | Comportamiento |
|---|---|
| Cancelar | Cierra el diálogo sin guardar |
| Alta + Siguiente | Guarda y deja el diálogo abierto y limpio |
| Alta | Guarda y cierra el diálogo |

---

## HistoricalGridComponent

Rejilla histórica para mostrar dentro de formularios SPA. Proyecta `<thead>` y `<tbody>` directamente; gestiona internamente el spinner y el estado vacío.

**Archivo:** `src/app/shared/components/historical-grid/historical-grid.component.ts`

### Inputs

| Input | Tipo | Descripción |
|---|---|---|
| `loading` | `boolean` | Muestra spinner |
| `empty` | `boolean` | Muestra estado vacío |
| `emptyMessage` | `string` | Texto del estado vacío |

### Uso

```html
<app-section-header title="Historial de movimientos" icon="lucideHistory" />
<app-historical-grid
  [loading]="loadingHistorial()"
  [empty]="historial().length === 0"
  emptyMessage="Sin movimientos registrados">
  <thead class="bg-[#005a3b] text-white">
    <tr>
      <th class="text-left font-normal px-3 py-1.5 w-36">Fecha</th>
      <th class="text-left font-normal px-3 py-1.5">Evento</th>
    </tr>
  </thead>
  <tbody>
    @for (m of historial(); track m.id; let odd = $odd) {
      <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
        <td class="px-3 py-1.5 text-[#005a3b]">{{ m.fecha }}</td>
        <td class="px-3 py-1.5 text-[#005a3b]">{{ m.tipo }}</td>
      </tr>
    }
  </tbody>
</app-historical-grid>
```

Se usa siempre junto a `SectionHeaderComponent`.

---

## SectionHeaderComponent

Cabecera de sección reutilizable: icono + título en mayúsculas + línea separadora + botón `+` opcional.

**Archivo:** `src/app/shared/components/historical-grid/section-header.component.ts`

### Inputs

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | requerido | Texto del título |
| `icon` | `string` | requerido | Nombre del icono lucide |
| `showAdd` | `boolean` | `false` | Muestra el botón `+` |

### Output

| Output | Descripción |
|---|---|
| `(add)` | Emite al pulsar el botón `+` |

### Uso

```html
<app-section-header
  title="Documentos"
  icon="lucideFileText"
  [showAdd]="true"
  (add)="openDialog()" />
```
