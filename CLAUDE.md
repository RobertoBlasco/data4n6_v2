@README.md

---

## Instrucciones para Claude

### Idioma
Comunicación con el usuario siempre en **español**. Código, nombres de variables, comentarios y mensajes de commit en **inglés**.

### Tipos de rejilla (Angular)

Toda tabla nueva debe usar uno de estos tres componentes reutilizables. Implementados con content projection (`ng-content`) para las columnas del `mat-table`.

#### 1. `<app-grid-main>` — Rejilla principal
Ocupa toda la página. Incluye: barra superior (título + botón "Nueva entrada"), buscador/filtros, paginador (`mat-paginator`), spinner de carga y tarjeta de error.

```html
<app-grid-main
  title="Casos"
  newLabel="Nuevo caso"
  newRoute="/data4n6/cases/new"
  [loading]="loading()"
  [error]="error()"
  [pageSize]="25">
  <!-- columnas mat-table via ng-content -->
</app-grid-main>
```

#### 2. `<app-grid-secondary>` — Rejilla secundaria sin footer
Tabla embebida dentro de paneles o pestañas. Sin paginador ni footer.

```html
<app-grid-secondary [loading]="loadingCases()">
  <!-- columnas mat-table -->
</app-grid-secondary>
```

#### 3. `<app-grid-secondary-footer>` — Rejilla secundaria con footer
Tabla embebida con footer que incluye: contador de registros, fila de totales de columnas numéricas, paginador compacto y botón de acción.

```html
<app-grid-secondary-footer
  [total]="cases().length"
  [totals]="{ amount: 12500 }"
  newLabel="Nueva persona"
  (newClick)="newPerson()"
  [pageSize]="10">
  <!-- columnas mat-table -->
</app-grid-secondary-footer>
```

### Librería UI
Solo **Angular Material** (`@angular/material`). PrimeNG está instalado pero no se usa — ignorarlo.

### Fuente
**Roboto** en toda la aplicación. Definida **una sola vez** en `styles.scss` (tema de Material + `html/body`). **Nunca** declarar `font-family` en componentes individuales — se hereda automáticamente.

### Layout pantalla Unidades
Cuatro paneles en grid 2×2 con divisores arrastrables (vertical y horizontal):

```
┌─────────────┬───────────────────┐
│ ① Árbol     │ ② Estadísticas    │  ← fila superior (topPct%, defecto 45%)
├─────────────┼───────────────────┤
│ ③ Personas  │ ④ Casos           │  ← fila inferior
└─────────────┴───────────────────┘
  30% (izq)       70% (der)
```

- Columnas: `leftPct% 5px 1fr` (defecto 30/70, límites 15–65%)
- Filas: `topPct% 5px 1fr` (defecto 45/55, límites 20–70%)
- Cabeceras de panel: compactas (`min-height: 32px`), título en mayúsculas pequeñas
- En móvil (`≤767px`): divisores ocultos, paneles apilados verticalmente

### Comportamiento de formularios
- Los formularios de alta/edición navegan a una **ruta separada** (no modal, no drawer)
- Al intentar salir con cambios sin guardar → **diálogo de confirmación** (`CanDeactivate` guard)
- El menú de navegación permanece **siempre activo** (nunca se deshabilita)
- Razón: los drawers no son efectivos en tablets y pantallas pequeñas

### Estilo de formularios
- Fondo de página gris suave (`#f3f4f6`) con la tarjeta del formulario centrada
- Tarjeta: `max-width: 660px`, `margin: auto`, borde + sombra suave, `border-radius: 10px`
- Cabecera de tarjeta diferenciada (`#f9fafb`) con borde inferior: botón volver + título + contexto
- Secciones separadas con línea verde suave y etiqueta en mayúsculas pequeñas (`0.68rem`, `#007d5c`)
- Campos compactos: `--mat-form-field-container-height: 48px`
- Anchos ajustados al contenido (no todo al 100%): `field-grow`, `field-280`, `field-180`, `field-160`, `field-130`
- Botones de acción alineados a la derecha, separados del formulario con borde superior
