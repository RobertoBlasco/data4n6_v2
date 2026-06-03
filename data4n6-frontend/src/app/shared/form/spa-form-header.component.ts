import {
  ChangeDetectionStrategy, Component, HostListener, input, signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideMenu } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-spa-form-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HlmButtonImports, HlmIconImports],
  providers: [provideIcons({ lucideArrowLeft, lucideMenu })],
  template: `
    <div class="flex items-center justify-between px-4 h-11 shrink-0 border-b border-border bg-primary text-primary-foreground">

      <!-- Izquierda: volver + icono + título + descripción -->
      <div class="flex items-center gap-2 min-w-0">
        <a hlmBtn variant="ghost" size="icon"
           class="size-7 shrink-0 hover:bg-primary-foreground/15 hover:text-primary-foreground"
           title="Volver al listado" [routerLink]="backRoute()">
          <ng-icon hlmIcon size="sm" name="lucideArrowLeft" />
        </a>
        <div class="h-4 w-px bg-primary-foreground/20 shrink-0"></div>
        <ng-icon hlmIcon size="sm" [name]="icon()" class="shrink-0" />
        <span class="text-sm font-semibold shrink-0">{{ label() }}</span>
        <span class="text-primary-foreground/40 shrink-0">·</span>
        <span class="text-sm truncate opacity-80">{{ description() }}</span>
      </div>

      <!-- Derecha: botones de acción + menú hamburguesa -->
      <div class="flex items-center gap-1.5 shrink-0">
        <ng-content />

        @if (showMenu()) {
          <div class="relative">
            <button hlmBtn variant="ghost" size="icon"
              class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
              title="Más acciones"
              (click)="$event.stopPropagation(); menuOpen.update(v => !v)">
              <ng-icon hlmIcon size="sm" name="lucideMenu" />
            </button>

            @if (menuOpen()) {
              <div class="absolute right-0 top-full mt-1 min-w-44 bg-popover border border-border rounded-md shadow-lg z-50 py-1 text-foreground"
                (click)="menuOpen.set(false)">
                <ng-content select="[menu]" />
              </div>
            }
          </div>
        }
      </div>

    </div>
  `,
})
export class SpaFormHeaderComponent {
  readonly icon        = input.required<string>();
  readonly label       = input.required<string>();
  readonly description = input<string>('');
  readonly backRoute   = input.required<string | string[]>();
  readonly showMenu    = input<boolean>(false);

  readonly menuOpen = signal(false);

  @HostListener('document:click')
  closeMenu(): void { this.menuOpen.set(false); }
}
