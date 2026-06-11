# Sistema de bloqueo de navegación en formularios

## Descripción

Sistema automático para prevenir la pérdida de datos cuando el usuario intenta navegar fuera de un formulario con cambios sin guardar.

## Componentes

### 1. **FormBase**

Clase base que proporciona:

- **`hasUnsavedChanges`** — Signal que indica si hay cambios sin guardar
- **`navigationLocked`** — Computed que indica si se debe bloquear la navegación
- **`hideBackButton`** — Computed que oculta el botón volver en modo edición
- **`formMode`** — Computed que determina el modo (true=SOLO LECTURA, false=EDICIÓN)

### 2. **FormLockService**

Servicio global que:

- Mantiene el estado de bloqueo a nivel de aplicación
- Permite deshabilitar el menú lateral y otros elementos de navegación
- Se sincroniza automáticamente con FormBase

### 3. **formNavigationGuard**

Guard de Angular Router que:

- Previene la navegación cuando `navigationLocked() === true`
- Muestra un diálogo de confirmación al usuario

### 4. **SpaFormHeaderComponent**

Componente de cabecera que:

- Oculta el botón "volver" cuando `hideBack === true`
- Muestra indicadores visuales de modo (EDICIÓN / SOLO LECTURA)

## Comportamiento automático

### Modo EDICIÓN (formMode === false)

- ✅ Oculta botón "volver" en el header
- ✅ Registra bloqueo global en FormLockService
- ✅ El menú lateral debería mostrarse deshabilitado
- ⚠️ Si hay cambios sin guardar → guard previene navegación

### Modo SOLO LECTURA (formMode === true)

- ✅ Muestra botón "volver"
- ✅ No hay bloqueo de navegación
- ✅ Menú lateral activo

## Uso en componentes

### 1. Extender FormBase

```typescript
export class MyFormComponent extends FormBase implements OnInit {
  protected override readonly colMetaTableName = 't100_my_table';
  protected override readonly icon = 'lucideFileText';
  protected override readonly labelSingular = 'Mi Entidad';
  protected override readonly defaultBackRoute = '/my-route';

  constructor() {
    super(); // IMPORTANTE: llamar a super()
  }

  override entityDescription(): string {
    return this.myEntityName();
  }
}
```

### 2. Detectar cambios en el formulario

```typescript
// Marcar cuando hay cambios
onFieldChange(): void {
  this.hasUnsavedChanges.set(true);
}

// Limpiar al guardar exitosamente
save(): void {
  this.http.post(...).subscribe({
    next: () => {
      this.hasUnsavedChanges.set(false); // Desbloquea navegación
      this.router.navigate([this.defaultBackRoute]);
    }
  });
}
```

### 3. Configurar el header

```html
<app-spa-form-header
  [icon]="formIcon()"
  [readonly]="formMode()"
  [hideBack]="hideBackButton()"
  [label]="headerLabel()"
  [backRoute]="resolvedBackRoute()" />
```

### 4. Aplicar directiva de readonly

```html
<div class="h-full flex flex-col" [appFormReadonly]="formReadonly()">
  <!-- contenido del formulario -->
</div>
```

### 5. Registrar guard en las rutas

```typescript
const routes: Routes = [
  {
    path: 'edit/:id',
    component: MyFormComponent,
    canDeactivate: [formNavigationGuard]
  }
];
```

## Modos de formulario

### Alta nueva

```typescript
// Ruta: /ruta/new
// formReadonly = null → formMode() = false → "EDICIÓN"
// hideBackButton() = true (oculta botón volver)
```

### Edición

```typescript
// Ruta: /ruta/123
// formReadonly = null → formMode() = false → "EDICIÓN"
// hideBackButton() = true (oculta botón volver)
```

### Solo lectura (vista)

```typescript
// En ngOnInit o donde detectes que es vista
this.formReadonly.set(true);
// formMode() = true → "SOLO LECTURA"
// hideBackButton() = false (muestra botón volver)
```

## Integración con el menú lateral

El menú lateral debe usar `FormLockService` para deshabilitarse:

```typescript
export class ShellComponent {
  private readonly formLockSvc = inject(FormLockService);
  readonly navigationDisabled = this.formLockSvc.isLocked;
}
```

```html
<nav [class.pointer-events-none]="navigationDisabled()" 
     [class.opacity-50]="navigationDisabled()">
  <!-- items del menú -->
</nav>
```

## Ejemplo completo

Ver `loan-form.component.ts` para un ejemplo completo de implementación.
