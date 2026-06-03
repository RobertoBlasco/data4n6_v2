import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucidePlus } from '@ng-icons/lucide';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { ApiService } from '../../../core/services/api.service';
import { AppTableService } from '../../../core/services/app-table.service';

export interface FkOption {
  id: string;
  displayName: string;
}

@Component({
  selector: 'app-fk-combobox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmInputImports, HlmIconImports],
  providers: [provideIcons({ lucideChevronDown, lucidePlus })],
  styles: [':host { display: block; }'],
  template: `
    <div class="relative">
      @if (focused()) {
        <input
          hlmInput
          class="w-full"
          placeholder="Buscar..."
          autocomplete="off"
          autofocus
          (input)="onInput($any($event.target).value)"
          (blur)="onBlur()"
        />
      } @else {
        <button
          type="button"
          class="flex h-9 w-full items-center justify-between rounded-md border border-border bg-surface-primary px-3 py-1 text-sm text-left text-[#005a3b]
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          [disabled]="disabled()"
          (click)="open()"
        >
          <span [class.text-muted-foreground]="!value()">
            {{ displayName() || '— Seleccionar —' }}
          </span>
          <ng-icon hlmIcon size="sm" name="lucideChevronDown" class="opacity-50 shrink-0" />
        </button>
      }

      @if (focused()) {
        <div class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-52 overflow-auto">
          @if (filtered().length) {
            @for (opt of filtered(); track opt.id) {
              <button
                type="button"
                class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                [class.bg-muted]="value() === opt.id"
                (mousedown)="select(opt)"
              >{{ opt.displayName }}</button>
            }
          } @else {
            <div class="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
          }
          @if (canCreate()) {
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-sm text-[#005a3b] hover:bg-muted transition-colors
                     flex items-center gap-1.5 border-t border-border"
              (mousedown)="onCreate()">
              <ng-icon hlmIcon name="lucidePlus" size="sm" />
              {{ createLabel() }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class FkComboboxComponent {
  private readonly api         = inject(ApiService);
  private readonly appTableSvc = inject(AppTableService);
  private readonly http        = inject(HttpClient);

  readonly endpoint     = input.required<string>();
  readonly baseUrl      = input<string>('');
  readonly value        = input<string>('');
  readonly displayHint  = input<string>('');
  readonly displayField = input<string>('displayName');
  readonly disabled     = input<boolean>(false);
  readonly canCreate    = input<boolean>(false);
  readonly createLabel  = input<string>('Nuevo');
  readonly refreshKey   = input<number>(0);
  readonly valueChange  = output<string>();
  readonly create       = output<void>();

  private readonly options = signal<FkOption[]>([]);
  private readonly search  = signal<string>('');
  readonly focused         = signal(false);

  readonly displayName = computed(() => {
    const id = this.value();
    if (!id) return '';
    return this.options().find(o => o.id === id)?.displayName ?? this.displayHint();
  });

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    return q
      ? this.options().filter(o => o.displayName.toLowerCase().includes(q))
      : this.options();
  });

  private readonly fetchKey = computed(() => `${this.endpoint()}::${this.refreshKey()}`);

  constructor() {
    toObservable(this.fetchKey)
      .pipe(
        tap(() => untracked(() => this.options.set([]))),
        switchMap(() => {
          const ep   = this.endpoint();
          const base = this.baseUrl();
          return base
            ? this.http.get<Record<string, unknown>[]>(`${base}${ep}`)
            : this.api.get<Record<string, unknown>[]>(this.appTableSvc.resolveEndpointPath(ep));
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: items => {
          const field = this.displayField();
          this.options.set(items.map(i => ({
            id: String(i['id'] ?? ''),
            displayName: String(i[field] ?? i['displayName'] ?? i['nombre'] ?? i['name'] ?? i['descripcion'] ?? i['id'] ?? ''),
          })));
        },
      });
  }

  open(): void {
    this.search.set('');
    this.focused.set(true);
  }

  onInput(q: string): void {
    this.search.set(q);
    if (!q) this.valueChange.emit('');
  }

  onBlur(): void {
    this.search.set('');
    this.focused.set(false);
  }

  select(opt: FkOption): void {
    this.valueChange.emit(opt.id);
    this.search.set('');
    this.focused.set(false);
  }

  onCreate(): void {
    this.focused.set(false);
    this.create.emit();
  }
}
