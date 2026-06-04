import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import {
  lucideFlaskConical,
  lucideWarehouse,
  lucideDatabase,
  lucideShield,
  lucideZap,
  lucideArrowRight,
} from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';

interface Module {
  title: string;
  description: string;
  icon: string;
  route: string;
  available: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, HlmIconImports],
  providers: [provideIcons({ lucideFlaskConical, lucideWarehouse, lucideDatabase, lucideShield, lucideZap, lucideArrowRight })],
  template: `
    <div class="min-h-screen bg-background flex flex-col">

      <!-- Brand header -->
      <header class="border-b border-border px-8 py-6">
        <div class="max-w-2xl">
          <h1 class="text-xl font-semibold tracking-tight text-foreground">data4n6</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Sistema integrado de gestión forense y control de inventario</p>
        </div>
      </header>

      <!-- Modules -->
      <main class="flex-1 px-8 py-8">
        <p class="text-xs text-muted-foreground uppercase tracking-wider mb-4">Módulos</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          @for (m of modules; track m.route) {
            <div
              class="group flex flex-col border border-border rounded-lg p-5 bg-card transition-all duration-150"
              [ngClass]="m.available
                ? 'cursor-pointer hover:border-primary/60 hover:shadow-sm'
                : 'opacity-55 cursor-default'"
              (click)="navigate(m)"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-2.5">
                  <ng-icon hlmIcon [name]="m.icon" size="sm"
                    [class.text-primary]="m.available"
                    [class.text-muted-foreground]="!m.available" />
                  <span class="text-sm font-semibold text-foreground">{{ m.title }}</span>
                </div>
                @if (!m.available) {
                  <span class="text-[10px] uppercase tracking-wider border border-border rounded px-1.5 py-0.5 text-muted-foreground shrink-0">
                    Próximamente
                  </span>
                }
              </div>

              <p class="text-xs text-muted-foreground leading-relaxed flex-1">{{ m.description }}</p>

              @if (m.available) {
                <div class="flex items-center gap-1 mt-4 text-xs font-medium text-primary">
                  Acceder
                  <ng-icon hlmIcon name="lucideArrowRight" size="xs"
                    class="transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
              }
            </div>
          }
        </div>
      </main>

    </div>
  `,
})
export class HomeComponent {
  private readonly router = inject(Router);

  readonly modules: Module[] = [
    {
      title: 'data4n6',
      description: 'Gestión de casos, cadena de custodia, evidencias digitales y efectos judiciales.',
      icon: 'lucideFlaskConical',
      route: '/data4n6/cases',
      available: true,
    },
    {
      title: 'Inventario',
      description: 'Control de equipamiento técnico, almacenes, propuestas y órdenes de material.',
      icon: 'lucideWarehouse',
      route: '/inventory/items',
      available: true,
    },
    {
      title: 'Datos Generales',
      description: 'Catálogos y datos compartidos entre módulos: unidades, tipos de documento y clasificaciones.',
      icon: 'lucideDatabase',
      route: '/common/admin/t100_units',
      available: true,
    },
    {
      title: 'Administración',
      description: 'Gestión de perfiles, roles y usuarios del sistema.',
      icon: 'lucideShield',
      route: '/security/profiles',
      available: true,
    },
    {
      title: 'Herramientas',
      description: 'Análisis forense y generación de informes. Integración con herramientas externas.',
      icon: 'lucideZap',
      route: '/herramientas',
      available: false,
    },
  ];

  navigate(m: Module): void {
    if (m.available) this.router.navigate([m.route]);
  }
}
