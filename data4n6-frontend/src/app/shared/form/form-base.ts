import { computed, effect, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppTableService } from '../../core/services/app-table.service';
import { AppTable } from '../../core/models/app-table.model';
import { FormLockService } from './form-lock.service';

type DialogState = 'open' | 'closed' | null;

export abstract class FormBase {

  private readonly _appTableSvc = inject(AppTableService);
  private readonly _route        = inject(ActivatedRoute);
  private readonly _formLockSvc  = inject(FormLockService);
  private readonly _destroyRef   = inject(DestroyRef);

  /**
   * Nombre de tabla en t900_app_tables. Cuando se define, FormBase carga
   * automáticamente el icono y el título desde los metadatos de la tabla.
   */
  protected readonly colMetaTableName: string | null = null;

  /** Icono fallback si no se define colMetaTableName o la tabla no tiene icono. */
  protected readonly icon: string = 'lucideFileText';

  /** Título singular fallback. */
  protected readonly labelSingular: string = '';

  /**
   * Ruta de retorno por defecto. Cada subclase la sobreescribe.
   * Si el componente fue abierto con ?back=<url>, esa url tiene prioridad.
   */
  protected readonly defaultBackRoute: string | string[] = '/';

  /**
   * Ruta de retorno resuelta:
   * - Si existe ?back= en la URL → usa esa ruta (navegación contextual)
   * - Si no → usa defaultBackRoute
   */
  readonly resolvedBackRoute = computed((): string | string[] => {
    const back = this._route.snapshot.queryParamMap.get('back');
    return back ?? this.defaultBackRoute;
  });

  protected abstract entityDescription(): string;

  // ── Metadatos de la tabla ──────────────────────────────────────────────────

  readonly tableMeta = signal<AppTable | null>(null);

  readonly formIcon = computed(() =>
    this.tableMeta()?.icono ?? this.icon
  );

  readonly formTitle = computed(() =>
    this.tableMeta()?.nombreSingular ?? this.tableMeta()?.displayName ?? this.labelSingular
  );

  // ── Modo del formulario ────────────────────────────────────────────────────

  /**
   * null  → no muestra indicador (formulario de alta)
   * true  → SOLO LECTURA
   * false → EDICIÓN
   */
  readonly formReadonly = signal<boolean | null>(null);

  /**
   * Indica si el formulario es de edición (id existente en la ruta).
   * Por defecto detecta si la ruta tiene un id !== 'new'.
   * Las subclases pueden sobreescribirlo con su propia lógica.
   */
  readonly isEditMode = computed(() => {
    const id = this._route.snapshot.paramMap.get('id');
    return id !== null && id !== 'new';
  });

  /**
   * Modo del formulario para el header:
   * - Si formReadonly === true → "SOLO LECTURA"
   * - Si formReadonly === false o null → "EDICIÓN" (tanto alta como edición)
   *
   * Por defecto siempre muestra "EDICIÓN" a menos que se establezca explícitamente
   * formReadonly.set(true) para modo solo lectura.
   */
  readonly formMode = computed<boolean | null>(() => {
    return this.formReadonly() === true ? true : false;
  });

  // ── Bloqueo de navegación ──────────────────────────────────────────────────

  /**
   * Indica si el formulario tiene cambios sin guardar.
   * Las subclases deben establecer esto manualmente cuando detecten cambios.
   */
  readonly hasUnsavedChanges = signal(false);

  /**
   * Determina si se debe bloquear la navegación.
   * La navegación se bloquea cuando:
   * - El formulario está en modo edición (formMode === false)
   * - Y hay cambios sin guardar (hasUnsavedChanges === true)
   */
  readonly navigationLocked = computed(() => {
    return this.formMode() === false && this.hasUnsavedChanges();
  });

  /**
   * Determina si se debe ocultar el botón volver en el header.
   * Se oculta cuando el formulario está en modo edición (no solo lectura).
   */
  readonly hideBackButton = computed(() => {
    return this.formMode() === false;
  });

  constructor() {
    // Sincronizar el estado de bloqueo con el servicio global
    // El menú se bloquea siempre en modo edición, no solo cuando hay cambios
    effect(() => {
      if (this.formMode() === false) {
        // Modo edición → bloquear menú
        this._formLockSvc.lock('Formulario en modo edición');
      } else {
        // Solo lectura o vista → desbloquear menú
        this._formLockSvc.unlock();
      }
    });

    // Desbloquear menú cuando el componente se destruya
    this._destroyRef.onDestroy(() => {
      this._formLockSvc.unlock();
    });
  }

  // ── Estado común ───────────────────────────────────────────────────────────

  readonly loading     = signal(false);
  readonly saving      = signal(false);
  readonly loadError   = signal<string | null>(null);
  readonly saveError   = signal<string | null>(null);
  readonly savedOk     = signal(false);
  readonly deleteState = signal<DialogState>(null);

  openDelete(): void { this.deleteState.set('open'); }

  onDeleteStateChanged(state: string): void {
    if (state === 'closed') this.deleteState.set(null);
  }

  /** Llamar en ngOnInit de la subclase para cargar los metadatos. */
  protected loadFormMeta(): void {
    if (!this.colMetaTableName) return;
    this._appTableSvc.getByTableName(this.colMetaTableName).subscribe({
      next: meta => this.tableMeta.set(meta),
    });
  }
}
