---
name: project-grid-system
description: "Diseño del sistema de rejillas (GridBase + GridViewDef) — arquitectura, extensión y convenciones"
metadata: 
  node_type: memory
  type: project
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Sistema de rejillas genérico basado en la clase abstracta `GridBase<T>`.

**Why:** Centralizar paginación, búsqueda, ordenación, selección múltiple y selector de vista en una sola base reutilizable, evitando duplicar lógica en cada componente de catálogo.  
**How to apply:** Toda nueva rejilla extiende `GridBase<T>` y solo declara las propiedades abstractas y la lógica de negocio propia.

---

## Ficheros clave

| Fichero | Rol |
|---|---|
| `src/app/shared/grid/grid-base.ts` | Clase abstracta + tipos `GridViewDef`, `GRID_VIEW`, `SortCriterion` |
| `src/app/features/inventory/admin/catalog-admin/catalog-admin.component.ts` | Componente genérico driven por metadata (ver [[catalog-system]]) |
| `src/app/features/inventory/catalogs/brands.component.ts` | Ejemplo: catálogo simple sin SPA |

---

## Propiedades abstractas (obligatorias en cada subclase)

```typescript
protected abstract readonly gridId: string;         // clave para localStorage
protected abstract readonly labelSingular: string;  // 'Marca'
protected abstract readonly labelPlural: string;    // 'Marcas'
protected abstract readonly icon: string;           // 'lucideTag'
```

## Propiedades sobreescribibles (tienen defaults en GridBase)

```typescript
protected readonly toolbarColor   = 'bg-[#005a3b] text-white';   // hex explícito — bg-primary tiene bug de resolución con oklch
protected readonly headerColor    = 'bg-surface-warm';
protected readonly footerColor    = 'bg-surface-warm';
protected readonly rowStripeClass = 'bg-surface-primary';
protected readonly rowHoverClass  = 'hover:!bg-action/25';
protected readonly gridViews: GridViewDef[] = [GRID_VIEW.GRID];
protected readonly defaultView: GridViewDef = GRID_VIEW.GRID;
```

## Computeds clave en GridBase

```typescript
readonly singleSelected = computed((): T | null => {
  // devuelve el item si hay exactamente 1 seleccionado, null en caso contrario
});
```

---

## Sistema de vistas (GridViewDef)

```typescript
export const GRID_VIEW = {
  GRID:        { id: 'GRID',        icon: 'lucideTable2',          label: 'Rejilla',           description: 'Lista de registros en tabla' },
  GRID_DETAIL: { id: 'GRID_DETAIL', icon: 'lucidePanelsLeftRight', label: 'Rejilla + detalle', description: 'Tabla con panel de detalle lateral' },
  CARD:        { id: 'CARD',        icon: 'lucideLayoutGrid',      label: 'Tarjetas',          description: 'Vista en tarjetas' },
}
```

---

## Comportamiento de interacción en filas

**Para el `CatalogAdminComponent` genérico:** clic en fila selecciona/deselecciona; fila seleccionada → `bg-primary/10`. La cabecera muestra acciones (editar, ir a formulario, eliminar) cuando hay selección.

**Para componentes específicos (BrandsComponent, etc.):** las filas NO tienen `(click)` para abrir diálogo. La edición se abre exclusivamente desde el botón de lápiz (✏) en la columna de acciones.

**Por qué:** tener doble acceso en componentes simples (click en fila + botón editar) es redundante y confuso.

---

## Patrón de cabecera con acciones de selección

Cuando `selectionCount() > 0`, la cabecera muestra (en `CatalogAdminComponent` y extensiones):
```html
<!-- Editar — solo con 1 seleccionado -->
<button [disabled]="selectionCount() !== 1" (click)="singleSelected() && openEdit(singleSelected()!)">
  <ng-icon name="lucidePencil" />
</button>
<!-- Ir al formulario — solo con 1 seleccionado; openItemForm() sobreescribible -->
<button [disabled]="selectionCount() !== 1" (click)="singleSelected() && openItemForm(singleSelected()!)">
  <ng-icon name="lucideFileText" />
</button>
<!-- Eliminar — solo con 1 seleccionado -->
<button [disabled]="selectionCount() !== 1" (click)="singleSelected() && openDelete(singleSelected()!)">
  <ng-icon name="lucideTrash2" />
</button>
```

`openItemForm(row)` por defecto llama a `openEdit(row)`. Las rejillas con ruta de formulario propia lo sobreescriben para navegar.

---

## Estado actual de las vistas (2026-05-22)

- **GRID**: única vista con renderizado implementado (tabla Spartan).
- **GRID_DETAIL** y **CARD**: registradas en el picker pero sin renderizado — solo cambia el icono.

---

## Colores del sistema

| Token | Valor | Uso |
|---|---|---|
| `bg-[#005a3b]` | `#005a3b` — verde oscuro GC | Toolbar (hex explícito, no usar bg-primary) |
| `bg-surface-warm` | oklch(0.96 0.008 83) — #f4f2ee | Header thead + footer |
| `bg-surface-primary` | oklch(0.91 0.014 163) | Zebra stripes (filas impares) |
| `bg-action` | oklch(0.796 0.18 83) — #f1b800 ámbar | Botón de alta + hover de fila |

---

## Tipografía

`html { font-size: 13px }`. Las celdas `th[hlmTh]` y `td[hlmTd]` tienen `text-sm` centralizado en `src/app/spartan/table/src/lib/hlm-table.ts`. No añadir `text-sm` manualmente en cada componente.

---

## Patrones de diálogo por tipo de catálogo

**Sin SPA** (ej. Marcas): `Cancelar / Alta + Siguiente / Alta`  
**Con SPA** (ej. Tipos de material): `Cancelar / Alta + Siguiente / Alta + Formulario / Alta`  
En modo edición siempre: `Cancelar / Aceptar`
