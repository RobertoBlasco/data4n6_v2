---
name: project-articulo-picker
description: Componente reutilizable ArticuloPickerComponent — selector dual de artículos de inventario con búsqueda y ordenación multi-columna
metadata: 
  node_type: memory
  type: project
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Componente compartido para seleccionar artículos de inventario en formularios que necesitan selección múltiple (préstamos, bajas, etc.).

**Why:** El loan-form tenía la lógica de picker inline; como se va a usar en más formularios (devoluciones, otras órdenes) se extrajo a un componente reutilizable.  
**How to apply:** Importar `ArticuloPickerComponent` y la interfaz `ArticuloMin` desde su ruta. El padre hace el GET y pasa la lista; el picker gestiona toda la UI.

---

## Localización

```
src/app/features/inventory/shared/articulo-picker/articulo-picker.component.ts
```

## API pública

```typescript
// Inputs
readonly articulosDisponibles = input<ArticuloMin[]>([]);   // lista pre-filtrada del padre
readonly estadoFilter         = input<string>('Almacén');   // filtro de estado (vacío = sin filtro)

// Two-way binding (model signal)
readonly value = model<ArticuloMin[]>([]);  // artículos seleccionados
```

## Uso en plantilla

```html
<app-articulo-picker
  [articulosDisponibles]="articulosDisponibles()"
  [(value)]="articulosSeleccionados" />
```

Con otro estado (futuras devoluciones):
```html
<app-articulo-picker
  [articulosDisponibles]="articulosPrestados()"
  estadoFilter="Prestado"
  [(value)]="articulosADevolver" />
```

## Interfaz ArticuloMin (exportada desde el componente)

```typescript
export interface ArticuloMin {
  id: string;
  serialNumber:       string | null;
  tipoMaterialNombre: string | null;
  brandName:          string | null;
  modeloDescripcion:  string | null;
  almacenNombre:      string | null;
  estadoActual:       string | null;
  descripcionEstado:  string | null;
}
```

## Funcionalidades internas

- Panel izquierdo: tabla de disponibles con búsqueda + ordenación multi-columna (Shift+clic para criterio secundario/terciario) con badge de prioridad
- Panel derecho: lista de seleccionados con botón × por fila
- Zebra stripes (`bg-surface-primary`) + hover (`hover:!bg-action/25`)
- Cabecera toolbar `bg-[#005a3b] text-white`
- Clic en fila → mueve al panel de seleccionados; × → devuelve al panel de disponibles

## Estado del loan form

El `loan-form.component.ts` tiene dos botones temporales de prueba visual en el footer (`Fondo: Amarillo/Blanco` y `Borde: Verde/Sin`). **Eliminar cuando se decida el estilo definitivo o se implemente la config dinámica.**
