import { computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppTableService } from '../../core/services/app-table.service';
import { AppTable } from '../../core/models/app-table.model';

type DialogState = 'open' | 'closed' | null;

export abstract class FormBase {

  private readonly _appTableSvc = inject(AppTableService);
  private readonly _route        = inject(ActivatedRoute);

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
