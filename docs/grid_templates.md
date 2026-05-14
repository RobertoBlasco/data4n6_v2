# Grid Templates (PrimeNG p-table)

Componentes reutilizables basados en PrimeNG `p-table` con una jerarquía de herencia que permite extender funcionalidad sin duplicar lógica.

---

## Jerarquía de componentes

```
GridBaseComponent
       ↑
GridExpandableComponent    (añade expansión de filas)
       ↑
GridGroupedComponent       (añade agrupación de filas y columnas)
```

Cada componente hereda inputs y lógica del padre via `extends`. Cada uno define su propio template añadiendo únicamente las partes específicas.

---

## Estrategia de templates

**Opción B — Templates proyectados.** El componente acepta templates via `ng-template` con referencias nombradas (`#header`, `#body`, etc.). El componente gestiona internamente todo el plumbing de PrimeNG.

```html
<app-grid-base [data]="persons()" [loading]="loadingRight()">
  <ng-template #header>
    <tr>
      <th>Nombre</th>
      <th>Rol</th>
    </tr>
  </ng-template>
  <ng-template #body let-row>
    <tr>
      <td>{{ row.lastName }}, {{ row.firstName }}</td>
      <td>{{ row.roleName }}</td>
    </tr>
  </ng-template>
</app-grid-base>
```

---

## GridBaseComponent

Componente base con el 80% de las funcionalidades comunes.

### Inputs

| Input | Tipo | Default | PrimeNG prop | Descripción |
|---|---|---|---|---|
| `data` | `any[]` | `[]` | `[value]` | Array de datos a mostrar |
| `loading` | `boolean` | `false` | `[loading]` | Muestra spinner de carga |
| `header` | `boolean` | `true` | template `#header` | Muestra/oculta la cabecera |
| `footer` | `boolean` | `false` | template `#footer` | Muestra/oculta el pie |
| `paginator` | `boolean` | `false` | `[paginator]` | Activa paginación. Solo tiene efecto si `footer=true` |
| `sortMultiple` | `boolean` | `false` | `sortMode="multiple"` | Permite ordenar por múltiples columnas simultáneamente |
| `sortField` | `string` | — | `[sortField]` | Campo por el que ordenar inicialmente (presort) |
| `sortOrder` | `1 \| -1` | `1` | `[sortOrder]` | Dirección del presort: 1 ascendente, -1 descendente |
| `globalFilterFields` | `string[]` | — | `[globalFilterFields]` | Campos sobre los que actúa la búsqueda global. Si tiene valores y `header=true`, se renderiza el campo de búsqueda automáticamente |
| `selection` | `'row' \| 'checkbox' \| null` | `null` | `selectionMode` | Modo de selección. `'checkbox'` añade columna de checks a la izquierda |
| `scroll` | `boolean` | `false` | `[scrollable]` + `scrollHeight` | Activa scroll vertical. Interacción con `paginator` a definir en implementación |
| `horizontalScroll` | `boolean` | `false` | `[scrollable]` | Activa scroll horizontal. Independiente del paginador |
| `resizableColumns` | `boolean` | `false` | `[resizableColumns]` | Permite redimensionar columnas arrastrando sus bordes |

### Outputs

| Output | PrimeNG evento | Descripción |
|---|---|---|
| `(rowSelect)` | `(onRowSelect)` | Emite al seleccionar una fila |
| `(rowUnselect)` | `(onRowUnselect)` | Emite al deseleccionar una fila |

### Templates proyectados

| Referencia | Descripción |
|---|---|
| `#header` | Fila(s) de cabecera (`<tr><th>...</th></tr>`). Cada `<th>` puede usar `pSortableColumn="field"` para habilitar sort en esa columna |
| `#body let-row` | Fila de datos (`<tr><td>...</td></tr>`) |

### Notas

- `sortMultiple` solo tiene sentido si alguna columna usa `pSortableColumn`
- `paginator` solo tiene efecto si `footer=true`
- `globalFilterFields` solo renderiza el buscador si `header=true`
- El campo de búsqueda global lo renderiza el componente internamente — el usuario no necesita añadirlo al template

---

## GridExpandableComponent

Extiende `GridBaseComponent`. Añade la posibilidad de expandir filas mostrando contenido detallado.

### Inputs adicionales

| Input | Tipo | Default | PrimeNG prop | Descripción |
|---|---|---|---|---|
| `rowExpansion` | `boolean` | `false` | `[expandedRowKeys]` | Activa la expansión de filas |
| `dataKey` | `string` | — | `[dataKey]` | Campo identificador único de cada fila. Requerido cuando `rowExpansion=true` |

### Templates adicionales

| Referencia | Descripción |
|---|---|
| `#expandedRow let-row` | Contenido que se muestra al expandir una fila |

### Outputs adicionales

| Output | PrimeNG evento | Descripción |
|---|---|---|
| `(rowExpand)` | `(onRowExpand)` | Emite al expandir una fila |
| `(rowCollapse)` | `(onRowCollapse)` | Emite al colapsar una fila |

---

## GridGroupedComponent

Extiende `GridExpandableComponent`. Añade agrupación de filas y columnas.

### Inputs adicionales

| Input | Tipo | Default | PrimeNG prop | Descripción |
|---|---|---|---|---|
| `rowGroup` | `'subheader' \| 'rowspan' \| null` | `null` | `[rowGroupMode]` + `[groupRowsBy]` | Modo de agrupación de filas |
| `groupRowsBy` | `string` | — | `[groupRowsBy]` | Campo por el que agrupar las filas |
| `expandableRowGroups` | `boolean` | `false` | `[expandableRowGroups]` | Permite expandir/colapsar grupos. Solo aplica con `rowGroup='subheader'` |
| `columnGroup` | `boolean` | `false` | `<p-columnGroup>` en template | Habilita agrupación de columnas con rowspan/colspan en cabecera |

### Templates adicionales

| Referencia | Descripción |
|---|---|
| `#groupHeader let-row` | Cabecera de grupo (cuando `rowGroup='subheader'`) |
| `#groupFooter let-row` | Pie de grupo (cuando `rowGroup='subheader'`) |

---

## Pendiente de diseñar

- **Filtro por columna** — más opciones, más complejo. Se diseñará en una iteración posterior.
- **Interacción scroll + paginator** — cuando ambos están activos hay que definir si el scroll es sobre el área de datos con altura fija o si el paginador limita las filas.
- **columnResizeMode** — decidir si exponer `'fit'` o `'expand'` como opción o fijar uno por defecto.
