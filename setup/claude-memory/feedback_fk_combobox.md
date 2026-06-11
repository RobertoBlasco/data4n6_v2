---
name: feedback-fk-combobox
description: "Patrón de combobox FK: botón con display name + input libre de búsqueda + dropdown filtrado. Sin [value] binding para evitar conflicto con OnPush."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Todos los campos FK (select con búsqueda) deben seguir este patrón: en modo reposo un botón muestra el valor seleccionado; al hacer clic aparece un input libre (sin `[value]`) con `autofocus` que filtra la lista mientras el usuario escribe.

**Why:** `[value]` binding en Angular OnPush + signals resetea el input en cada tecla porque el signal update dispara CD sincrónamente durante el event handler. Separar "modo display" (botón) de "modo búsqueda" (input fresco) elimina el conflicto por completo.

**How to apply:** Usar este bloque de template para cualquier campo FK en formularios:

```html
<!-- Campo FK con búsqueda typeahead -->
<div class="relative">
  @if (fkIsFocused(fieldKey)) {
    <!-- Modo búsqueda: input limpio, sin [value] -->
    <input
      hlmInput
      class="w-full"
      [id]="'field-' + fieldKey"
      placeholder="Buscar..."
      autocomplete="off"
      autofocus
      (input)="onFkInput(fieldKey, $any($event.target).value)"
      (blur)="onFkBlur(fieldKey)"
    />
  } @else {
    <!-- Modo display: botón con nombre seleccionado -->
    <button
      type="button"
      [id]="'field-' + fieldKey"
      class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm text-left"
      (click)="onFkFocus(fieldKey)"
    >
      <span [class.text-muted-foreground]="!currentId">
        {{ fkDisplayName(fieldKey) || '— Seleccionar —' }}
      </span>
      <ng-icon hlmIcon size="sm" name="lucideChevronDown" class="opacity-50 shrink-0" />
    </button>
  }
  @if (fkIsFocused(fieldKey)) {
    <div class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-52 overflow-auto">
      @if (filteredFkOptions()[fieldKey]?.length) {
        @for (opt of filteredFkOptions()[fieldKey]; track opt.id) {
          <button
            type="button"
            class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
            [class.bg-muted]="currentId === opt.id"
            (mousedown)="selectFkOption(fieldKey, opt)"
          >{{ opt.displayName }}</button>
        }
      } @else {
        <div class="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
      }
    </div>
  }
</div>
```

**Señales y métodos necesarios en la clase** (ver implementación de referencia):

```typescript
private readonly fkActiveSearch = signal<Record<string, string | null>>({});
private readonly fkOpen         = signal<Record<string, boolean>>({});

readonly filteredFkOptions = computed(() => { /* filtra fkOptions por fkActiveSearch */ });

fkIsFocused(key: string): boolean { return !!this.fkOpen()[key]; }
fkDisplayName(key: string): string { /* busca displayName en fkOptions por id guardado */ }
onFkFocus(key: string): void   { /* fkActiveSearch[key]='', fkOpen[key]=true */ }
onFkInput(key: string, q): void { /* fkActiveSearch[key]=q; si !q limpiar valor */ }
onFkBlur(key: string): void    { /* fkActiveSearch[key]=null, fkOpen[key]=false */ }
selectFkOption(key, opt): void  { /* setFormField, fkActiveSearch[key]=null, fkOpen[key]=false */ }
```

**Clave mousedown vs click:** Los items del dropdown usan `(mousedown)` (no `click`) para que se procese ANTES del `(blur)` del input — así `selectFkOption` corre primero y el valor queda guardado antes de cerrar el panel.

**Referencia:** `features/inventory/admin/catalog-admin/catalog-admin.component.ts`
