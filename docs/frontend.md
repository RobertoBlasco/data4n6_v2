# Frontend Conventions (Angular)

## Patrón de formularios de alta

### Cuándo usar diálogo vs. pantalla completa

| Tipo de entidad | Patrón |
|---|---|
| Catálogos simples (marcas, categorías, estados...) | Diálogo (`hlm-dialog`) sobre la misma página |
| Entidades complejas (caso, evento, orden de préstamo...) | Pantalla completa tipo SPA (`/ruta/new`) |

### Botones en los diálogos de alta

Todo diálogo de alta simple expone **tres acciones**, siempre en este orden:

| Botón | Comportamiento |
|---|---|
| **Cancelar** | Cierra el diálogo sin guardar |
| **Alta + Siguiente** | Guarda el registro y deja el diálogo abierto y limpio para introducir otro |
| **Alta** | Guarda el registro y cierra el diálogo |
| **Alta + Formulario** | Guarda el registro y navega a su pantalla SPA completa (con edición, baja, historial, etc.) |

> "Alta + Formulario" solo se incluye en las entidades que tienen pantalla SPA propia. Si la entidad no tiene pantalla SPA, se omite este botón.

---

## Librería UI

**Tailwind CSS + Spartan** (`spartan-ng`). Angular Material y PrimeNG están descartados — no instalar, no importar.

---

## Infraestructura de estilos

### Archivo compilado: `src/styles.css`

**Este es el único archivo de estilos que Angular compila.** Cualquier cambio global de CSS va aquí. El archivo `src/styles.scss` existe pero NO está en el build (`angular.json` → `styles: ["src/styles.css"]`) — ignorarlo.

### Capas Tailwind v4

```
@layer theme      ← variables CSS del sistema de diseño (@theme)
@layer base       ← resets y estilos globales (@layer base { ... })
@layer components ← (no usado directamente)
@layer utilities  ← clases utilitarias Tailwind (text-sm, p-2, etc.)
```

### Dónde cambiar cada cosa

| Qué | Dónde |
|---|---|
| **Fuente** (familia, tamaño base, interlineado) | `@theme` y `@layer base` en `src/styles.css` |
| **Colores del tema** (primary, background, border…) | Variables CSS en `:root` dentro de `src/styles.css` |
| **Estilo de un componente Spartan** (tabla, botón…) | Directiva correspondiente en `src/app/spartan/<componente>/src/lib/` — mediante `classes(() => '...')` |
| **Estilo de un componente de la app** | Clases Tailwind inline en el template — **nunca** `styles` del componente |

### Fuente

**Roboto** en toda la aplicación. Cargada desde Google Fonts en `index.html` y aplicada globalmente en `src/styles.scss`:

```css
@theme {
  --font-sans: 'Inter', system-ui, sans-serif;  /* ← cambiar aquí para cambiar la fuente */
}

@layer base {
  html {
    font-size: 13px;   /* tamaño base */
    line-height: 1.4;  /* interlineado global */
  }
  html, body {
    @apply font-sans;  /* aplica --font-sans */
  }
  table, thead, tbody, tfoot, tr, th, td, caption {
    font: inherit;     /* tablas no heredan font por defecto en todos los navegadores */
  }
}
```

**Nunca** declarar `font-family`, `font-size` ni `line-height` en componentes individuales — se hereda automáticamente.

### Tamaños de fuente estándar

**Tamaño base: 13px** — definido en `html { font-size: 13px }` en `src/styles.css`

Este es el tamaño por defecto que se hereda en **todos** los componentes de la aplicación. **No usar clases de tamaño** (`text-xs`, `text-sm`, etc.) excepto en casos muy específicos.

### Color de fuente estándar

**Color base: `oklch(0.25 0 0)` ≈ `#3f3f3f`** — negro suave, no agresivo

Definido en `--foreground` en `src/styles.css`. Se aplica automáticamente vía `text-foreground` en el `body`.

Este color se usa por defecto en:
- Texto general de la aplicación
- Menús y navegación
- Rejillas y tablas (excepto cuando usan `text-primary` verde)
- Formularios

**No usar clases de color** (`text-gray-800`, `text-black`, etc.) para texto general — usar las variables CSS del tema:
- `text-foreground` → negro suave por defecto (13px heredado)
- `text-primary` → verde `#005a3b` para énfasis
- `text-muted-foreground` → gris medio para texto secundario

| Elemento | Tamaño | Clase Tailwind | Notas |
|---|---|---|---|
| **Base global** | 13px | Sin clase (hereda) | Rejillas, tablas, formularios, menús |
| **Logo D4N6** | 12px | `text-xs` | Único caso especial |
| **Textos pequeños** | 10px | `text-[10px]` | Solo cuando sea estrictamente necesario |
| **Badges / chips** | 10-11px | `text-[10px]` o `text-xs` | Según contexto |

**Regla general:** Si no hay una razón específica para cambiar el tamaño, **no añadir ninguna clase de tamaño** y dejar que herede los 13px base.

```html
<!-- ✅ Correcto — hereda 13px -->
<span>Texto normal</span>
<td class="px-3 py-1.5">Celda de tabla</td>
<button class="px-3 py-1.5">Botón del menú</button>

<!-- ❌ Incorrecto — no forzar tamaños sin razón -->
<span class="text-sm">Texto normal</span>
<td class="px-3 py-1.5 text-xs">Celda de tabla</td>
```

### Iconos (`ng-icon` + `hlmIcon`)

`HlmIcon` controla el tamaño mediante la variable CSS `--ng-icon__size`, **no** mediante clases Tailwind. Las clases `size-4`, `size-3`, etc. **no tienen efecto** sobre el tamaño real del icono. Usar siempre el input `size`:

| `size=` | px | Uso |
|---|---|---|
| `"xs"` | 12 px | — |
| `"sm"` | 16 px | **Iconos dentro de filas de rejilla** |
| `"base"` | 24 px | Iconos en botones normales, sidebar (default) |
| `"lg"` | 32 px | Cabeceras, estados vacíos grandes |

```html
<!-- ✅ Correcto — fila de rejilla -->
<ng-icon hlmIcon size="sm" name="lucidePencil" />

<!-- ❌ Incorrecto — la clase size-4 no hace nada -->
<ng-icon hlmIcon name="lucidePencil" class="size-4" />
```

El default global es `'base'` (24 px), definido en `hlm-icon.token.ts`. Para cambiarlo en un componente entero se puede usar `provideHlmIconConfig({ size: 'sm' })` en sus `providers`.

---

### Cómo estilan los componentes Spartan

Spartan usa la utilidad `classes()` en las directivas TypeScript para aplicar clases Tailwind al elemento host. Ejemplo de `hlm-table.ts`:

```typescript
@Directive({ selector: 'table[hlmTable]' })
export class HlmTable {
  constructor() {
    classes(() => 'w-full caption-bottom');  // ← aquí se añaden/quitan clases
  }
}
```

Para modificar el estilo de cualquier componente Spartan (padding de celdas, altura de filas, etc.) ir al archivo de la directiva en `src/app/spartan/`.

---

---

## Rejillas

Las rejillas se construyen directamente con las directivas Spartan sobre HTML estándar `<table>`. No hay componentes wrapper reutilizables — el patrón es siempre el mismo y se replica en cada componente.

### Importaciones necesarias

```typescript
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
```

### Directivas de tabla Spartan

| Directiva | Selector | Clases aplicadas | Modificar en |
|---|---|---|---|
| `HlmTable` | `table[hlmTable]` | `w-full caption-bottom` | `spartan/table/src/lib/hlm-table.ts` |
| `HlmTHead` | `thead[hlmTHead]` | `[&_tr]:border-b` | ídem |
| `HlmTBody` | `tbody[hlmTBody]` | `[&_tr:last-child]:border-0` | ídem |
| `HlmTr` | `tr[hlmTr]` | `hover:bg-muted/50 border-b transition-colors` | ídem |
| `HlmTh` | `th[hlmTh]` | `h-8 px-2 font-medium` | ídem — **aquí se cambia la altura de cabecera** |
| `HlmTd` | `td[hlmTd]` | `py-1 px-2` | ídem — **aquí se cambia el padding de celda** |

**Línea ámbar en toolbar de rejillas:**

Todas las toolbars verdes (cabecera con título y botones) deben llevar una línea ámbar de 4px debajo:

```html
<div class="flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b-4 border-[#f4c430]" [ngClass]="toolbarColor">
```

El color `#f4c430` es el amarillo dorado corporativo (mismo que el logo y los activos en el menú). Esta línea separa visualmente la toolbar del contenido de la rejilla.

### Estructura completa de una rejilla de página

```html
<div class="space-y-4">

  <!-- Cabecera: título + botón de alta -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-semibold text-foreground">Marcas</h1>
      <p class="text-xs text-muted-foreground mt-0.5">Catálogo de marcas del inventario</p>
    </div>
    <button hlmBtn (click)="openCreate()">
      <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />
      Nueva marca
    </button>
  </div>

  <!-- Estado: cargando -->
  @if (loading()) {
    <div class="flex items-center justify-center py-12">
      <hlm-spinner />
    </div>
  }

  <!-- Estado: error -->
  @if (error() && !loading()) {
    <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
      {{ error() }}
    </div>
  }

  <!-- Tabla -->
  @if (!loading() && !error() && items().length > 0) {
    <div class="rounded-lg border border-border overflow-hidden">
      <table hlmTable class="w-full">
        <thead hlmTHead>
          <tr hlmTr>
            <th hlmTh>Nombre</th>
            <th hlmTh>Descripción</th>
            <th hlmTh class="w-20 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody hlmTBody>
          @for (item of items(); track item.id) {
            <tr hlmTr>
              <td hlmTd class="font-medium">{{ item.name }}</td>
              <td hlmTd class="text-muted-foreground">{{ item.description ?? '—' }}</td>
              <td hlmTd class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <button hlmBtn variant="ghost" size="icon" class="size-6" (click)="openEdit(item)">
                    <ng-icon hlmIcon size="sm" name="lucidePencil" />
                    <span class="sr-only">Editar</span>
                  </button>
                  <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" (click)="openDelete(item)">
                    <ng-icon hlmIcon size="sm" name="lucideTrash2" />
                    <span class="sr-only">Eliminar</span>
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }

  <!-- Estado: vacío -->
  @if (!loading() && !error() && items().length === 0) {
    <div class="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
      <ng-icon hlmIcon size="lg" name="lucideTag" class="opacity-25" />
      <p class="text-sm">No hay registros</p>
      <button hlmBtn variant="outline" size="sm" (click)="openCreate()">
        <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />
        Añadir el primero
      </button>
    </div>
  }

</div>
```

### Tipos de columna

| Tipo | Clases en `<th hlmTh>` | Clases en `<td hlmTd>` |
|---|---|---|
| Texto principal | — | `font-medium` |
| Texto secundario | — | `text-muted-foreground` |
| Código / ID | — | `font-mono text-xs` |
| Fecha | `w-32` | `text-muted-foreground` |
| Badge / estado | `w-28` | — (badge inline) |
| Acciones | `w-20 text-right` | `text-right` |
| Numérica | `text-right` | `text-right tabular-nums` |

### Botones de acción en filas

Siempre `variant="ghost" size="icon" class="size-6"` con icono `size="sm"` (16 px). El botón destructivo añade `text-destructive hover:text-destructive`.

```html
<button hlmBtn variant="ghost" size="icon" class="size-6" (click)="edit(item)">
  <ng-icon hlmIcon size="sm" name="lucidePencil" />
</button>
<button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" (click)="delete(item)">
  <ng-icon hlmIcon size="sm" name="lucideTrash2" />
</button>
```

---

## Estructura base de un formulario SPA

Todo formulario SPA sigue este esqueleto con header + cuerpo scrollable + footer fijo:

```html
<div class="h-full flex flex-col min-h-0 overflow-hidden">

  <app-spa-form-header icon="..." label="..." [description]="..." backRoute="..."
    [showMenu]="isEdit()">
    <button menu class="...">Exportar ficha</button>
  </app-spa-form-header>

  <!-- Cuerpo: ocupa el espacio disponible y hace scroll -->
  <div class="flex-1 overflow-auto p-6 space-y-4">
    ...campos y rejillas...
  </div>

  <app-spa-form-footer>
    @if (isEdit()) {
      <button hlmBtn variant="destructive" size="sm" class="h-7" (click)="openDelete()">
        Eliminar
      </button>
    }
    <button hlmBtn size="sm" class="h-7" (click)="save()">Guardar</button>
  </app-spa-form-footer>

</div>
```

- **Header** (`h-11`, fondo primary): volver + icono + título + menú acciones
- **Cuerpo** (`flex-1 overflow-auto`): contenido con scroll propio
- **Footer** (`h-11`, fondo background, borde superior): botones de acción alineados a la derecha

---

## Header de formulario SPA (`SpaFormHeaderComponent`)

Cabecera fija en todas las pantallas SPA. Incluye: botón volver, icono, título, descripción y zona de botones de acción.

**Input `showMenu`** — activa el botón hamburguesa (≡) a la derecha de los botones. Los ítems del menú se proyectan con el atributo `menu`:

```html
<app-spa-form-header
  icon="lucideUserCheck"
  label="Agente"
  [description]="entityDescription()"
  backRoute="/common/admin/t100_agents"
  [showMenu]="isEdit()">

  <!-- Botones directos (siempre visibles) -->
  <button hlmBtn variant="destructive" size="sm" class="h-7" (click)="openDelete()">Eliminar</button>
  <button hlmBtn size="sm" class="h-7" (click)="save()">Guardar</button>

  <!-- Ítems del menú hamburguesa -->
  <button menu class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
    (click)="exportarPDF()">
    Exportar PDF
  </button>
  <button menu class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
    (click)="duplicar()">
    Duplicar
  </button>
</app-spa-form-header>
```

- El menú se cierra automáticamente al hacer clic en cualquier parte fuera de él
- `showMenu="false"` (default) oculta el botón completamente
- Cada ítem lleva el atributo `menu` para que Angular lo proyecte en el slot correcto

---

## Campos de formulario

### Estilo de los inputs

Todos los campos editables tienen:
- **Fondo:** `bg-surface-primary` — el mismo verde muy suave de las filas zebra de las rejillas (`oklch(0.91 0.014 163)`)
- **Borde:** `border-border` — el gris claro de los bordes de las rejillas
- **Color de fuente:** `text-[#005a3b]` — el mismo verde del header/toolbar

Esto está definido directamente en el directive `HlmInput` (`src/app/spartan/input/src/lib/hlm-input.ts`) y en el botón de `FkComboboxComponent`, por lo que se aplica automáticamente a **todos** los `<input hlmInput>` y comboboxes FK sin necesidad de añadir clases adicionales.

### `FormFieldComponent`

Componente reutilizable en `src/app/shared/components/form-field/form-field.component.ts` que encapsula el bloque label + campo + error.

```typescript
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
```

**Inputs:**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | requerido | Texto de la etiqueta |
| `required` | `boolean` | `false` | Muestra `*` rojo junto al label |
| `error` | `string \| null` | `null` | Mensaje de error bajo el campo |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | Orientación del campo |

**Layout vertical** (label encima del campo — por defecto):

```html
<div class="space-y-4">
  <app-form-field label="Nombre" [required]="true">
    <input hlmInput class="w-1/3" [(ngModel)]="firstName" />
  </app-form-field>
  <app-form-field label="Apellidos">
    <input hlmInput class="w-1/3" [(ngModel)]="lastName" />
  </app-form-field>
  <app-form-field label="Unidad" [required]="true" [error]="unidadError() ? 'Obligatorio' : null">
    <app-fk-combobox class="w-1/3" endpoint="/catalog/units" ... />
  </app-form-field>
</div>
```

**Layout horizontal** (label a la izquierda, campo a la derecha — para formularios con grid):

El padre debe usar `grid grid-cols-[auto_1fr]`. Con `layout="horizontal"` el host del componente pasa a `display: contents`, haciendo que label y campo sean celdas directas del grid.

```html
<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-start">
  <app-form-field label="Unidad" layout="horizontal" [required]="true"
    [error]="origenError() ? 'La unidad es obligatoria' : null">
    <app-fk-combobox endpoint="/catalog/units" ... />
  </app-form-field>
  <app-form-field label="Agente" layout="horizontal">
    <app-fk-combobox endpoint="/catalog/agents" ... />
  </app-form-field>
</div>
```

### Plantilla de referencia

**`src/app/shared/components/fk-combobox/fk-combobox-template.component.ts`**

Plantilla completa para formularios con FkCombobox. Copia el archivo y reemplaza `PARENT_ENTITY`, `CHILD_ENTITY` y los endpoints. Incluye:
- Combobox simple (padre)
- Combobox subordinado con `childEndpoint = computed(() => ...)` en función del padre
- `[canCreate]` + `[refreshKey]` + diálogo de alta rápida
- Patrón de señales y métodos (`openCreateChild`, `closeDialog`, `save`)

---

### Alta rápida desde FkCombobox (`canCreate`)

Cuando el formulario necesita permitir crear la entidad referenciada sin salir de la pantalla, se activan `[canCreate]` y `[createLabel]` en el combobox. El output `(create)` abre el diálogo de alta de esa entidad; al completarla se fuerza la recarga del combobox y se selecciona el nuevo registro.

```html
<!-- Combobox con alta rápida -->
<app-fk-combobox
  endpoint="/catalog/units"
  [canCreate]="true"
  createLabel="Nueva unidad"
  [value]="unidadId()"
  (valueChange)="unidadId.set($event)"
  (create)="openCreateUnidad()" />
```

```typescript
// En el componente del formulario
readonly showCreateUnidad = signal(false);

openCreateUnidad(): void { this.showCreateUnidad.set(true); }

onUnidadCreada(id: string): void {
  this.unidadId.set(id);
  this.showCreateUnidad.set(false);
}
```

- El botón "+ [createLabel]" aparece siempre al final del desplegable, separado por una línea, en verde.
- Usar `[canCreate]="false"` (por defecto) para comboboxes de solo lectura.
- El diálogo de alta que se abra debe emitir el id del nuevo registro para que el formulario lo seleccione automáticamente.

---

## Componentes de fichas (SPA de entidades)

### `SectionHeaderComponent`

Cabecera de sección reutilizable: icono + título en mayúsculas + línea separadora + botón `+` opcional.

```html
<app-section-header
  title="Documentos de identificación"
  icon="lucideIdCard"
  [showAdd]="true"
  (add)="openDialog()" />
```

El padre debe registrar el icono en su `provideIcons()`.

### `HistoricalGridComponent`

Tabla histórica con borde, spinner y estado vacío. Proyecta `<thead>` y `<tbody>` directamente.

```html
<app-section-header title="Documentos" icon="lucideFileText" />
<app-historical-grid
  [loading]="loadingDocs()"
  [empty]="documentos().length === 0"
  emptyMessage="Sin documentos registrados">
  <thead class="bg-[#005a3b] text-white">
    <tr>
      <th class="text-left font-normal px-3 py-1.5">Tipo</th>
      <th class="text-left font-normal px-3 py-1.5 w-28">Fecha</th>
    </tr>
  </thead>
  <tbody>
    @for (d of documentos(); track d.id; let odd = $odd) {
      <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
        <td class="px-3 py-1.5 text-[#005a3b]">{{ d.tipo }}</td>
        <td class="px-3 py-1.5 text-[#005a3b] whitespace-nowrap">{{ formatDate(d.createdAt) }}</td>
      </tr>
    }
  </tbody>
</app-historical-grid>
```

Se usa junto a `SectionHeaderComponent` — el componente no incluye cabecera de sección propia.

### `PicturePanelComponent`

Panel de imágenes con navegación anterior/siguiente, marcado como principal (estrella) y botón de eliminar. Incluye diálogo de subida de imagen.

```html
<app-picture-panel
  title="Firma"
  icon="lucidePenLine"
  [appTableId]="appTableId"
  [recordId]="recordId"
  [pictureTypeId]="SIGNATURE_TYPE_ID"
  [pictures]="firmas()"
  [loading]="loadingFotos()"
  (delete)="onDeleteFoto($event)"
  (setPrincipal)="onSetPrincipal($event)"
  (pictureAdded)="onPictureAdded($event)" />
```

**Outputs:** `delete` (id), `setPrincipal` (id), `pictureAdded` (`PictureItem`).

El upload llama a `POST /api/v1/inventory/pictures/upload` con `multipart/form-data`.

---

## Comportamiento de formularios

- Los formularios de alta/edición van en un **diálogo** (`hlm-dialog`) sobre la misma página — no ruta separada para catálogos simples; ruta separada para entidades complejas (Caso, Evento, Evidencia…)
- Confirmación de borrado: segundo `hlm-dialog` con layout de alerta (título + descripción + botones Cancelar / Eliminar)
- El menú de navegación permanece **siempre activo**

### Patrón de diálogo (Spartan)

Los diálogos requieren `<ng-template brnDialogContent>` para que `hlm-dialog-content` se renderice en el portal CDK donde `BrnDialogRef` está disponible. Sin ese wrapper la página queda en blanco.

```typescript
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

formState = signal<'open' | 'closed' | null>(null);

onFormStateChanged(state: string): void {
  if (state === 'closed') this.formState.set(null);
}
```

```html
<hlm-dialog [state]="formState()" (stateChanged)="onFormStateChanged($event)">
  <ng-template brnDialogContent>
    <hlm-dialog-content class="sm:max-w-md">
      <div hlmDialogHeader>
        <h2 hlmDialogTitle>Nueva marca</h2>
      </div>
      <!-- campos -->
      <div hlmDialogFooter>
        <button hlmBtn variant="outline" hlmDialogClose>Cancelar</button>
        <button hlmBtn (click)="save()">Guardar</button>
      </div>
    </hlm-dialog-content>
  </ng-template>
</hlm-dialog>
```

---

## Templates de rejilla

Los templates definen la estructura visual y los controles estándar que seguirá cada componente de rejilla. No son componentes reutilizables — son patrones que se replican en cada componente.

### Template 1: `rejilla_completa`

Para catálogos y listados principales: búsqueda, ordenación, y pie con paginación.

Estructura general:

```
┌─ Cabecera ──────────────────────────────────────────────────────────────────┐
│ Título                   [↻] [↓] [↑] │ [≡] [⊞] [▦] [⚡] │ [+ Nueva entrada] │
├─ Buscador (punto 2) ────────────────────────────────────────────────────────┤
│ [🔍 Buscar...]                                           (filtros avanzados) │
├─ Tabla (punto 3) ───────────────────────────────────────────────────────────┤
│ Col A ↕  Col B ↕  ...                                            Acciones   │
│ ...                                                                          │
├─ Pie (punto 4) ─────────────────────────────────────────────────────────────┤
│ 142 registros · 15 por página               ← 1 2 3 ... 10 →               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

#### 1. Cabecera

```
Título de la rejilla        [↻] [↓] [↑] │ [≡] [⊞] [▦] [⚡] │ [+ Nueva entrada]
```

- Solo título, sin subtítulo
- Controles alineados a la derecha, en tres grupos separados por divisores verticales sutiles

**Grupos de controles:**

| Grupo | Controles | Icono |
|---|---|---|
| **Datos** | Recargar | `lucideRefreshCw` |
| | Exportar | `lucideDownload` |
| | Importar | `lucideUpload` |
| **Visualización** | Columnas (mostrar/ocultar) | `lucideColumns3` |
| | Vista (tabla ↔ tarjetas) | `lucideLayoutGrid` / `lucideList` |
| | Cambiar rejilla (densidad: compacta/normal/cómoda) | `lucideTable2` |
| | Filtros avanzados (toggle) | `lucideSlidersHorizontal` |
| **Acción primaria** | Nueva entrada | `lucidePlus` + texto |

**Reglas:**

- Botones de los grupos Datos y Visualización: `variant="ghost" size="icon" class="size-7"`, icono `size="sm"`
- "Nueva entrada": `variant="action" size="sm" class="h-7"` con icono `lucidePlus size="sm" class="mr-1"` + texto; **se oculta completamente** (no se deshabilita) si el rol no lo permite

```html
<button hlmBtn variant="action" size="sm" class="h-7" (click)="openCreate()">
  <ng-icon hlmIcon size="sm" name="lucidePlus" class="mr-1" />
  Nueva <entidad>
</button>
```
- "Filtros avanzados" es un toggle: al activarse despliega una fila de filtros entre la cabecera y el buscador
- Divisores entre grupos: `border-r border-border h-4 mx-1`

**Modo selección múltiple (opcional por rejilla):**

Cuando la rejilla tiene selección múltiple habilitada, aparece una primera columna de checkbox (~32px). El checkbox de cabecera es tri-estado: ninguno / algunos / todos.

Al activarse la selección (≥1 elemento marcado), la cabecera se transforma:

```
Normal:   Título                    [↻] [↓] [↑] │ [≡] [⊞] [▦] [⚡] │ [+ Nueva entrada]
Selección: ☑ 14 seleccionados       [🗑 Eliminar] [↓ Exportar] [... Más]   [✕ Deseleccionar]
```

- Los controles normales se reemplazan por las acciones masivas disponibles para esa entidad
- Las acciones masivas son específicas de cada rejilla (no hay un conjunto fijo)
- "✕ Deseleccionar" limpia la selección y restaura la cabecera normal
- Al deseleccionar todos los checkboxes manualmente también restaura la cabecera normal

---

#### 2. Buscador

```
[🔍 Buscar en marcas...                              ] [✕]
```

- Ancho completo
- Icono de lupa a la izquierda dentro del input
- Botón ✕ visible solo cuando hay texto; al pulsarlo limpia el campo y lanza nueva búsqueda
- Placeholder contextual: `"Buscar en <entidad>..."`
- Búsqueda **global** (todos los campos de texto de la entidad) y **siempre contra el servidor**
- Debounce de ~300ms — no requiere pulsar Enter ni botón

**Con filtros avanzados activos** (toggle de cabecera activado):

```
[🔍 Buscar en marcas...                              ] [✕]
── Filtros avanzados ─────────────────────────────────────
[Estado ↕]  [Tipo ↕]  [Fecha desde __]  [Fecha hasta __]
Activos: [Estado: Activo ✕]  [Tipo: Hardware ✕]
```

- Los filtros avanzados son específicos de cada rejilla
- Los chips de filtros activos aparecen debajo de la fila de filtros
- Cada chip tiene un ✕ para eliminar ese filtro individualmente
- Si no hay filtros activos, la fila de chips no se muestra

---

#### 3. Columnas

Las columnas de cabecera (`<th>`) soportan cuatro capacidades:

**Redimensionado**
- Drag handle en el borde derecho de cada `<th>`
- El ancho se guarda en `localStorage` por rejilla y por cliente (navegador)
- Clave: `grid:{gridId}:columns` → JSON con `{ widths: { colId: px }, order: [...], hidden: [...] }`
- Siempre disponible la opción "Restablecer por defecto" (en el control Columnas de la cabecera) que limpia la clave de `localStorage` y vuelve al layout inicial

**Reordenado**
- Drag & drop sobre las cabeceras para cambiar el orden de las columnas
- El orden también se guarda en `localStorage` bajo la misma clave
- "Restablecer por defecto" también restaura el orden original

**Multi-ordenación**
- Click en cabecera → ordenación primaria por esa columna (ASC → DESC → sin orden)
- Shift+click → añade esa columna como criterio de ordenación adicional
- Indicador visual: flecha + número de prioridad

```
│ Nombre ↑¹  │ Descripción  │ Fecha ↓²  │ Estado  │
```

- La ordenación es siempre contra el servidor (no ordenación local)
- Sin ordenación activa no se muestra ningún indicador en la cabecera

**Visibilidad**
- Gestionada desde el control "Columnas" en la cabecera
- También se guarda en `localStorage` bajo la misma clave
- Siempre debe haber al menos una columna visible (no se puede ocultar la última)

---

#### 4. Pie (paginación)

```
Mostrando 1–15 de 142 registros      [15 por página ▾]    ←  1  2  3  …  10  →
```

**Izquierda:** `Mostrando {desde}–{hasta} de {total} registros`

**Centro:** selector de registros por página — opciones: 15 / 25 / 50 / 100

**Derecha:** controles de navegación:
- ← primera página
- anterior
- números de página: siempre se muestran la primera, la última y las adyacentes a la página actual; el resto se colapsa con elipsis (`…`)
- siguiente
- → última página

**Persistencia en `localStorage`:**
- El tamaño de página se guarda junto al resto de preferencias de columna bajo `grid:{gridId}:columns`
- Se restaura al volver a la rejilla
- "Restablecer por defecto" también resetea el tamaño de página al valor inicial de cada rejilla
