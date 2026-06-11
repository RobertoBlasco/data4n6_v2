---
name: feedback-use-established-templates
description: "Siempre usar los templates establecidos (items-list, GridDialogBase) para grids y catálogos, nunca escribir plantillas ad-hoc"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Usar SIEMPRE los templates establecidos para grids, a no ser que el usuario indique lo contrario.

**Why:** Evitar código redundante/ad-hoc. El patrón está definido en `items-list.component.ts` (GridBase) y los componentes de catálogo (GridDialogBase). Escribir plantillas propias lleva a inconsistencias visuales y duplicación de lógica.

**How to apply:**
- Grids de solo lectura (sin CRUD): copiar el template de `items-list.component.ts`, quitar checkbox/acciones, extender `GridBase<T>`
- Grids con alta/edición/borrado: extender `GridDialogBase<T>` siguiendo el patrón de los componentes en `features/inventory/catalogs/`
- Elementos obligatorios del template: `[ngClass]="toolbarColor"`, `hlmTHead`/`hlmTBody`/`hlmTr`, `[ngClass]="headerColor"` en thead, `[ngClass]="footerColor"` en pie, `[ngClass]="[odd ? rowStripeClass : '', rowHoverClass]"` en filas, estados vacíos con icono, buscador con input bordado
- Cabecera completa obligatoria: Recargar, Exportar, separador, Columnas, selector de vista (con dropdown), Filtros avanzados — en ese orden. Para grids CRUD añadir botón "Nuevo" al final
- Checkboxes obligatorios: columna checkbox en thead con `#selectAllCb` + `effect()` para estado indeterminado via `viewChild`; checkbox en cada fila; toolbar alterna a estado de selección con "N seleccionadas" + Exportar + X; filas con `(click)="toggleSelect(o.id)"` y `[class.bg-primary/15]`
- Clase implementa `OnInit`; carga en `ngOnInit()`, no en constructor
- Panel de filtros avanzados debajo del buscador (`@if (showAdvancedFilters())`)
- Nunca hardcodear `bg-primary text-primary-foreground` ni clases de stripe directamente en las filas
- **DIRECTIVA acciones en grid**: NO poner botones de borrar/editar/formulario en las filas de la tabla. Los botones van en el toolbar de selección: selección simple → [Eliminar] [Editar] [Ir formulario] [Exportar] | [X]; selección múltiple → [Eliminar] [Exportar] | [X]. Borrado múltiple con `forkJoin`. `goDetail()` navega al registro sin `/edit`.
- **DIRECTIVA comportamiento de selección en filas**: Click en fila NO selecciona; solo el checkbox selecciona. Doble-click abre el formulario/diálogo. Checkbox usa `(click)="toggleSelectRange(item.id, $index, $event)"` (shift+click hace range-select). Fila seleccionada muestra `bg-action/25` (= color hover), NO `bg-primary/15`. `[ngClass]` de fila: `[odd && !selectedIds().has(id) ? rowStripeClass : '', rowHoverClass]`. `lastSelectedIdx` en GridBase se resetea al cambiar de página o limpiar selección. NUNCA cambiar colores de fuente sin instrucción explícita.
