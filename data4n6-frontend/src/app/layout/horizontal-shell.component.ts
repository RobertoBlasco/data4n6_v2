import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArchive, lucideAward, lucideBox, lucideBoxes, lucideBuilding2, lucideCalendar,
  lucideChevronDown, lucideFileText, lucideFlag, lucideBeaker, lucideFolder,
  lucideGrid3x3, lucideHome, lucideImage, lucideLayoutList, lucideLayers,
  lucideLink, lucideLogIn, lucideLogOut, lucidePackage, lucidePlus, lucideSettings,
  lucideShieldCheck, lucideTag, lucideUser, lucideUsers, lucideWarehouse,
  lucideSwatchBook, lucideCircleDot, lucideArrowRightLeft, lucideFlaskConical,
  lucideShield, lucideClipboardList, lucidePackagePlus, lucideArrowDownToLine,
  lucidePackageOpen, lucideHand, lucideZap, lucideDatabase, lucideUserCheck,
  lucideIdCard, lucidePackageCheck,
  lucideTruck, lucideColumns, lucideFileCheck, lucideGitMerge, lucideHistory,
  lucideTable2, lucidePanelsLeftRight, lucideSlidersHorizontal, lucideRefreshCw,
  lucideDownload, lucideUpload, lucideLayoutGrid,
} from '@ng-icons/lucide';
import { AppTableService } from '../core/services/app-table.service';
import { AppService } from '../core/services/app.service';
import { AppTable } from '../core/models/app-table.model';
import { FormLockService } from '../shared/form/form-lock.service';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';

interface NavItem {
  title: string;
  icon?: string;
  url?: string;
  exactMatch?: boolean;
  children?: NavItem[];
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const HOME_GROUP: NavGroup = {
  items: [
    { title: 'Inicio', icon: 'lucideHome', url: '/' },
  ],
};

const INVENTORY_OPS_ITEMS: NavItem[] = [
  { title: 'Todas las órdenes', icon: 'lucideLayoutList', url: '/inventory/orders', exactMatch: true },
  { title: 'Entrada Almacén', icon: 'lucideArrowDownToLine', url: '/inventory/orders/warehouse-entries' },
  { title: 'Traspaso Almacén', icon: 'lucideArrowRightLeft', url: '/inventory/orders/warehouse-transfers' },
  { title: 'Adjudicación', icon: 'lucidePackagePlus', url: '/inventory/orders/adjudication-orders' },
  { title: 'Préstamo', icon: 'lucidePackageOpen', url: '/inventory/orders/loans' },
  { title: 'Devolución', icon: 'lucidePackageCheck', url: '/inventory/orders/returns' },
  { title: 'Baja', icon: 'lucideArchive', url: '/inventory/orders/decommissions' },
];

function toNavItem(t: AppTable, baseUrl: string): NavItem {
  return {
    title: t.nombrePlural ?? t.displayName,
    icon: t.icono ?? 'lucideSettings',
    url: `${baseUrl}/${t.tableName}`,
  };
}

function buildInventoryNavGroups(catalogTables: AppTable[]): NavGroup[] {
  return [
    HOME_GROUP,
    {
      label: 'Inventario',
      items: [
        { title: 'Artículos', icon: 'lucidePackage', url: '/inventory/items' },
        { title: 'Almacenes', icon: 'lucideWarehouse', url: '/inventory/warehouses' },
        {
          title: 'Órdenes',
          icon: 'lucideClipboardList',
          children: INVENTORY_OPS_ITEMS,
        },
        {
          title: 'Catálogos',
          icon: 'lucideSwatchBook',
          children: catalogTables.map(t => toNavItem(t, '/inventory/admin')),
        },
      ],
    },
  ];
}

@Component({
  selector: 'app-horizontal-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HlmIconImports, HlmDialogImports, HlmButtonImports, BrnDialogContent],
  providers: [
    provideIcons({
      lucideHome, lucideFolder, lucideCalendar, lucidePackage, lucideBeaker,
      lucideUsers, lucideShieldCheck, lucideSettings, lucidePlus, lucideLayoutList,
      lucideTag, lucideAward, lucideFlag, lucideGrid3x3, lucideBuilding2,
      lucideUser, lucideFileText, lucideImage, lucideChevronDown,
      lucideWarehouse, lucideSwatchBook, lucideCircleDot, lucideArrowRightLeft,
      lucideFlaskConical, lucideShield, lucideClipboardList, lucideUserCheck,
      lucideIdCard, lucidePackagePlus, lucideArrowDownToLine, lucidePackageOpen,
      lucideHand, lucideArchive, lucidePackageCheck, lucideBox, lucideBoxes, lucideLayers,
      lucideLink, lucideLogIn, lucideLogOut, lucideZap, lucideDatabase,
      lucideTruck, lucideColumns, lucideFileCheck, lucideGitMerge, lucideHistory,
      lucideTable2, lucidePanelsLeftRight, lucideSlidersHorizontal, lucideRefreshCw,
      lucideDownload, lucideUpload, lucideLayoutGrid,
    }),
  ],
  template: `
    <div class="flex flex-col h-screen">

      <!-- ── Barra superior ────────────────────────────────────────────────── -->
      <header class="h-11 shrink-0 border-b-2 border-[#004d32] bg-[#005a3b] flex items-center px-4 gap-4"
        [class.pointer-events-none]="navigationDisabled()"
        [class.opacity-50]="navigationDisabled()">

        <!-- Logo / Marca -->
        <button type="button" class="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity" (click)="openAboutDialog()">
          <img src="logo-aguila.png" alt="Logo Guardia Civil" class="size-7 object-contain" />
          <div class="h-6 w-px bg-white/40"></div>
          <ng-icon hlmIcon [name]="moduleIcon()" size="sm" class="text-white" />
          <span class="font-semibold text-white">{{ moduleLabel }}</span>
        </button>

        <div class="h-6 w-px bg-white/20"></div>

        <!-- Menú principal horizontal -->
        <nav class="flex items-center gap-1 flex-1">
          @for (group of navGroups(); track group.label) {
            @for (item of group.items; track item.title) {
              @if (item.children; as children) {
                <!-- Item con submenu -->
                <div class="relative group">
                  <button
                    type="button"
                    class="flex items-center gap-1.5 px-3 py-1.5 font-medium text-white/80 rounded hover:bg-white/10 hover:text-white transition-colors">
                    @if (item.icon) {
                      <ng-icon hlmIcon [name]="item.icon" size="sm" />
                    }
                    <span>{{ item.title }}</span>
                    <ng-icon hlmIcon name="lucideChevronDown" size="sm" class="opacity-60" />
                  </button>

                  <!-- Dropdown -->
                  <div class="absolute left-0 top-full mt-0.5 min-w-48 bg-white border-2 border-[#005a3b] rounded-md shadow-xl
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
                    @for (child of children; track child.title) {
                      <a
                        [routerLink]="child.url"
                        routerLinkActive="bg-[#f4c430] text-[#005a3b] font-semibold"
                        [routerLinkActiveOptions]="{ exact: child.exactMatch ?? false }"
                        class="flex items-center gap-2 px-3 py-2 text-[#005a3b] hover:bg-[#f4c430]/20 transition-colors">
                        @if (child.icon) {
                          <ng-icon hlmIcon [name]="child.icon" size="sm" />
                        }
                        {{ child.title }}
                      </a>
                    }
                  </div>
                </div>
              } @else if (item.url !== '/') {
                <!-- Item directo (sin submenu, excepto Inicio) -->
                <a
                  [routerLink]="item.url"
                  routerLinkActive="bg-[#f4c430] text-[#005a3b] font-semibold"
                  [routerLinkActiveOptions]="{ exact: item.exactMatch ?? false }"
                  class="flex items-center gap-1.5 px-3 py-1.5 font-medium text-white/80 rounded hover:bg-white/10 hover:text-white transition-colors">
                  @if (item.icon) {
                    <ng-icon hlmIcon [name]="item.icon" size="sm" />
                  }
                  <span>{{ item.title }}</span>
                </a>
              }
            }
          }
        </nav>

        <!-- Área derecha (usuario, etc.) -->
        <div class="flex items-center gap-2 shrink-0">
          <button type="button" class="flex items-center gap-1.5 px-3 py-1.5 text-white/80 rounded hover:bg-white/10 hover:text-white transition-colors" title="Usuario">
            <ng-icon hlmIcon name="lucideUser" size="sm" />
          </button>
          <div class="h-6 w-px bg-white/20"></div>
          <button type="button" routerLink="/" class="flex items-center gap-1.5 px-3 py-1.5 text-white/80 rounded hover:bg-white/10 hover:text-white transition-colors" title="Ir al menú principal">
            <ng-icon hlmIcon name="lucideHome" size="sm" />
          </button>
          <div class="h-6 w-px bg-white/20"></div>
          <button type="button" class="flex items-center gap-1.5 px-3 py-1.5 text-white/80 rounded hover:bg-white/10 hover:text-white transition-colors" title="Salir">
            <ng-icon hlmIcon name="lucideLogOut" size="sm" />
          </button>
        </div>

      </header>

      <!-- ── Contenido principal ───────────────────────────────────────────── -->
      <main class="flex-1 overflow-auto bg-muted/40 p-4">
        <router-outlet />
      </main>

    </div>

    <!-- ── Diálogo About ─────────────────────────────────────────────────── -->
    <hlm-dialog [state]="showAboutDialog() ? 'open' : 'closed'" (stateChanged)="showAboutDialog.set($event === 'open')">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md">
          <div hlmDialogHeader>
            <h2 hlmDialogTitle class="flex items-center gap-2">
              <ng-icon hlmIcon [name]="moduleIcon()" size="base" class="text-primary" />
              {{ moduleLabel }}
            </h2>
          </div>

          <div class="space-y-4 py-4">
            <div class="flex items-center gap-3">
              <img src="logo-aguila.png" alt="Logo Guardia Civil" class="size-16 object-contain" />
              <div class="flex-1">
                <p class="font-semibold">{{ moduleLabel }}</p>
                <p class="text-sm text-muted-foreground">{{ moduleSubtitle }}</p>
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Versión:</span>
                <span class="font-medium">1.0.0</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Plataforma:</span>
                <span class="font-medium">data4n6</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Entorno:</span>
                <span class="font-medium">Desarrollo</span>
              </div>
            </div>

            <p class="text-xs text-muted-foreground pt-2 border-t">
              Sistema de gestión de inventario para control de equipamiento.
            </p>
          </div>

          <div hlmDialogFooter>
            <button hlmBtn variant="outline" (click)="closeAboutDialog()">Cerrar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class HorizontalShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly appTableSvc = inject(AppTableService);
  private readonly appSvc = inject(AppService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formLockSvc = inject(FormLockService);

  readonly navigationDisabled = this.formLockSvc.isLocked;

  private readonly module = this.route.snapshot.data['module'] as string | undefined;

  protected readonly navGroups = signal<NavGroup[]>(
    this.module === 'inventory' ? buildInventoryNavGroups([]) : []
  );

  protected readonly moduleLabel =
    this.module === 'inventory' ? 'Inventario' : 'data4n6';

  protected readonly moduleSubtitle =
    this.module === 'inventory' ? 'Control de equipamiento' : 'Laboratorio forense';

  protected readonly moduleIcon = signal<string>('lucideBoxes');
  protected readonly showAboutDialog = signal(false);

  constructor() {
    if (this.module) {
      // Cargar icono del módulo desde la base de datos
      this.appSvc.getByName(this.module)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(app => {
          if (app.icono) {
            this.moduleIcon.set(app.icono);
          }
        });
    }

    if (this.module === 'inventory') {
      this.appTableSvc.getAll()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(tables => {
          const byOrder = (a: AppTable, b: AppTable) => (a.ordenMenu ?? 99) - (b.ordenMenu ?? 99);
          const catalog = tables.filter(t => t.seccionMenu === 'inventory_catalog').sort(byOrder);
          this.navGroups.set(buildInventoryNavGroups(catalog));
        });
    }
  }

  openAboutDialog(): void {
    this.showAboutDialog.set(true);
  }

  closeAboutDialog(): void {
    this.showAboutDialog.set(false);
  }
}
