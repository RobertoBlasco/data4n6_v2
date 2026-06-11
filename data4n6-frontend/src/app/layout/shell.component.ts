import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArchive,
  lucideAward,
  lucideBox,
  lucideBuilding2,
  lucideCalendar,
  lucideChevronRight,
  lucideFileText,
  lucideFlag,
  lucideBeaker,
  lucideFolder,
  lucideGrid3x3,
  lucideHome,
  lucideImage,
  lucideLayoutList,
  lucideLayers,
  lucideLink,
  lucideLogIn,
  lucidePackage,
  lucidePlus,
  lucideSettings,
  lucideShieldCheck,
  lucideTag,
  lucideUser,
  lucideUsers,
  lucideWarehouse,
  lucideSwatchBook,
  lucideCircleDot,
  lucideArrowRightLeft,
  lucideFlaskConical,
  lucideShield,
  lucideClipboardList,
  lucidePackagePlus,
  lucideArrowDownToLine,
  lucidePackageOpen,
  lucideHand,
  lucideZap,
  lucideDatabase,
  lucideUserCheck,
  lucideIdCard,
  lucidePackageCheck,
  lucideTruck,
  lucideBoxes,
  lucideColumns,
  lucideFileCheck,
  lucideGitMerge,
  lucideHistory,
} from '@ng-icons/lucide';
import { AppTableService } from '../core/services/app-table.service';
import { AppTable } from '../core/models/app-table.model';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';

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

const DATA4N6_NAV_GROUPS: NavGroup[] = [
  HOME_GROUP,
  {
    label: 'Forense',
    items: [
      {
        title: 'Casos', icon: 'lucideFolder', children: [
          { title: 'Nuevo caso',    icon: 'lucidePlus',       url: '/data4n6/cases/new' },
          { title: 'Listado',       icon: 'lucideLayoutList', url: '/data4n6/cases' },
          { title: 'Estados',       icon: 'lucideTag',        url: '/data4n6/cases/statuses' },
          { title: 'Clasificación', icon: 'lucideAward',      url: '/data4n6/cases/levels' },
          { title: 'Resultados',    icon: 'lucideFlag',       url: '/data4n6/cases/outcomes' },
          { title: 'Dominios',      icon: 'lucideGrid3x3',    url: '/data4n6/cases/domains' },
        ],
      },
      {
        title: 'Eventos', icon: 'lucideCalendar', children: [
          { title: 'Nuevo evento', icon: 'lucidePlus',       url: '/data4n6/events/new' },
          { title: 'Listado',      icon: 'lucideLayoutList', url: '/data4n6/events' },
          { title: 'Estados',      icon: 'lucideTag',        url: '/data4n6/events/statuses' },
        ],
      },
      {
        title: 'Efectos', icon: 'lucidePackage', children: [
          { title: 'Nuevo efecto', icon: 'lucidePlus',       url: '/data4n6/exhibits/new' },
          { title: 'Listado',      icon: 'lucideLayoutList', url: '/data4n6/exhibits' },
          { title: 'Estados',      icon: 'lucideTag',        url: '/data4n6/exhibits/statuses' },
        ],
      },
      {
        title: 'Evidencias', icon: 'lucideBeaker', children: [
          { title: 'Nueva evidencia', icon: 'lucidePlus',       url: '/data4n6/evidence/new' },
          { title: 'Listado',         icon: 'lucideLayoutList', url: '/data4n6/evidence' },
          { title: 'Estados',         icon: 'lucideTag',        url: '/data4n6/evidence/statuses' },
        ],
      },
    ],
  },
  {
    label: 'General',
    items: [
      {
        title: 'Directorio', icon: 'lucideUsers', children: [
          { title: 'Unidades', icon: 'lucideBuilding2', url: '/data4n6/general/units' },
          { title: 'Personas', icon: 'lucideUser',      url: '/data4n6/general/persons' },
        ],
      },
      { title: 'Documentos', icon: 'lucideFileText', url: '/data4n6/general/documents' },
      { title: 'Fotos',      icon: 'lucideImage',    url: '/data4n6/general/photos' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { title: 'Datos Generales', icon: 'lucideDatabase',    url: '/common' },
      {
        title: 'Administración', icon: 'lucideShieldCheck', children: [
          { title: 'Tablas del sistema', icon: 'lucideDatabase', url: '/data4n6/admin/app-tables' },
        ],
      },
      { title: 'Configuración',  icon: 'lucideSettings',    url: '/data4n6/config' },
    ],
  },
];

const STATIC_ADMIN_ITEMS: NavItem[] = [
  { title: 'Perfiles / Roles',   icon: 'lucideShield',   url: '/inventory/admin/roles' },
  { title: 'Usuarios',           icon: 'lucideUsers',    url: '/inventory/admin/users' },
  { title: 'Unidades / Agentes', icon: 'lucideBuilding2', url: '/inventory/admin/units' },
];

const INVENTORY_OPS_ITEMS: NavItem[] = [
  { title: 'Todas las órdenes',     icon: 'lucideLayoutList',  url: '/inventory/orders', exactMatch: true },
  { title: 'Entrada Almacén',       icon: 'lucideArrowDownToLine', url: '/inventory/orders/warehouse-entries' },
  { title: 'Traspaso Almacén',      icon: 'lucideArrowRightLeft', url: '/inventory/orders/warehouse-transfers' },
  { title: 'Adjudicación',          icon: 'lucidePackagePlus',     url: '/inventory/orders/adjudication-orders' },
  { title: 'Préstamo',              icon: 'lucidePackageOpen', url: '/inventory/orders/loans' },
  { title: 'Devolución',            icon: 'lucidePackageCheck',        url: '/inventory/orders/returns' },
  { title: 'Baja',                  icon: 'lucideArchive',     url: '/inventory/orders/decommissions' },
];

function toNavItem(t: AppTable, baseUrl: string): NavItem {
  return {
    title: t.nombrePlural ?? t.displayName,
    icon:  t.icono ?? 'lucideSettings',
    url:   `${baseUrl}/${t.tableName}`,
  };
}

function buildSecurityNavGroups(): NavGroup[] {
  return [
    HOME_GROUP,
    {
      label: 'Administración',
      items: [
        {
          title: 'Seguridad', icon: 'lucideShield', children: [
            { title: 'Perfiles', icon: 'lucideShieldCheck', url: '/security/profiles' },
            { title: 'Roles',    icon: 'lucideShield',      url: '/security/roles'    },
            { title: 'Usuarios', icon: 'lucideUsers',       url: '/security/users'    },
          ],
        },
        {
          title: 'Aplicaciones', icon: 'lucideZap', children: [
            { title: 'Aplicaciones', icon: 'lucideZap',      url: '/security/apps'         },
            { title: 'Tablas',       icon: 'lucideDatabase',  url: '/security/app-tables'   },
            { title: 'Campos',       icon: 'lucideLayers',    url: '/security/table-fields' },
          ],
        },
      ],
    },
  ];
}

function buildCommonNavGroups(_tables: AppTable[]): NavGroup[] {
  return [
    HOME_GROUP,
    {
      label: 'Datos Generales',
      items: [
        {
          title: 'Comunes', icon: 'lucideDatabase', children: [
            { title: 'Tipos Docs Id',      icon: 'lucideIdCard',  url: '/common/doc-types'      },
            { title: 'Tipos de documentos',icon: 'lucideFile',    url: '/common/document-types' },
            { title: 'Unidades',           icon: 'lucideBuilding2', url: '/common/units'         },
            { title: 'Agentes',            icon: 'lucideUserCheck', url: '/common/agents'        },
          ],
        },
        { title: 'Data4n6',    icon: 'lucideFolder',    children: [] },
        { title: 'Inventario', icon: 'lucideWarehouse', children: [] },
      ],
    },
  ];
}

function buildInventoryNavGroups(adminTables: AppTable[], catalogTables: AppTable[]): NavGroup[] {
  return [
    HOME_GROUP,
    {
      label: 'Inventario',
      items: [
        { title: 'Artículos', icon: 'lucidePackage',   url: '/inventory/items' },
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
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    HlmSidebarImports,
    HlmCollapsibleImports,
    HlmIconImports,
  ],
  providers: [
    provideIcons({
      lucideHome, lucideFolder, lucideCalendar, lucidePackage, lucideBeaker,
      lucideUsers, lucideShieldCheck, lucideSettings, lucidePlus, lucideLayoutList,
      lucideTag, lucideAward, lucideFlag, lucideGrid3x3, lucideBuilding2,
      lucideUser, lucideFileText, lucideImage, lucideChevronRight,
      lucideWarehouse, lucideSwatchBook, lucideCircleDot, lucideArrowRightLeft, lucideFlaskConical,
      lucideShield, lucideClipboardList, lucideUserCheck, lucideIdCard,
      lucidePackagePlus, lucideArrowDownToLine, lucidePackageOpen, lucideHand, lucideArchive, lucidePackageCheck,
      lucideBox, lucideLayers, lucideLink, lucideLogIn, lucideZap, lucideDatabase,
      lucideTruck, lucideBoxes, lucideColumns, lucideFileCheck, lucideGitMerge, lucideHistory,
    }),
  ],
  template: `
    <nav hlmSidebarWrapper>
      <hlm-sidebar collapsible="icon">

        <!-- ── Header / Marca ──────────────────────────────────────────────── -->
        <hlm-sidebar-header>
          <ul hlmSidebarMenu>
            <li hlmSidebarMenuItem>
              <a hlmSidebarMenuButton size="lg" routerLink="/">
                <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">D4N6</div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">{{ moduleLabel }}</span>
                  <span class="truncate text-xs text-muted-foreground">{{ moduleSubtitle }}</span>
                </div>
              </a>
            </li>
          </ul>
        </hlm-sidebar-header>

        <!-- ── Menú de navegación ──────────────────────────────────────────── -->
        <hlm-sidebar-content>
          @for (group of navGroups(); track group.label) {
            <hlm-sidebar-group>
              @if (group.label) {
                <div hlmSidebarGroupLabel>{{ group.label }}</div>
              }
              <div hlmSidebarGroupContent>
                <ul hlmSidebarMenu>
                  @for (item of group.items; track item.title) {
                    @if (item.children; as children) {
                      <!-- Grupo colapsable -->
                      <li hlmSidebarMenuItem>
                        <hlm-collapsible class="group/collapsible">
                          <button
                            type="button"
                            hlmCollapsibleTrigger
                            hlmSidebarMenuButton
                            class="flex w-full items-center justify-between"
                            [closeMobileSidebarOnClick]="false"
                            [tooltip]="item.title"
                          >
                            @if (item.icon) {
                              <ng-icon hlmIcon [name]="item.icon" />
                            }
                            <span>{{ item.title }}</span>
                            <ng-icon
                              name="lucideChevronRight"
                              hlmIcon
                              class="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
                            />
                          </button>
                          <hlm-collapsible-content>
                            <ul hlmSidebarMenuSub>
                              @for (child of children; track child.title) {
                                <li hlmSidebarMenuSubItem>
                                  <a
                                    hlmSidebarMenuSubButton
                                    routerLinkActive="bg-primary/10 text-primary font-semibold"
                                    [routerLinkActiveOptions]="{ exact: child.exactMatch ?? false }"
                                    class="w-full"
                                    [routerLink]="child.url"
                                  >
                                    @if (child.icon) {
                                      <ng-icon hlmIcon [name]="child.icon" class="size-3.5" />
                                    }
                                    {{ child.title }}
                                  </a>
                                </li>
                              }
                            </ul>
                          </hlm-collapsible-content>
                        </hlm-collapsible>
                      </li>
                    } @else {
                      <!-- Enlace directo -->
                      <li hlmSidebarMenuItem>
                        <a
                          hlmSidebarMenuButton
                          routerLinkActive="bg-primary/10 text-primary font-semibold"
                          [routerLinkActiveOptions]="{ exact: item.url === '/' }"
                          class="w-full"
                          [tooltip]="item.title"
                          [routerLink]="item.url"
                        >
                          @if (item.icon) {
                            <ng-icon hlmIcon [name]="item.icon" />
                          }
                          <span>{{ item.title }}</span>
                        </a>
                      </li>
                    }
                  }
                </ul>
              </div>
            </hlm-sidebar-group>
          }
        </hlm-sidebar-content>

      </hlm-sidebar>

      <!-- ── Contenido principal ─────────────────────────────────────────── -->
      <main hlmSidebarInset class="flex flex-col h-screen overflow-hidden">

        <!-- Topbar -->
        <header class="flex h-11 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur z-30">
          <button type="button" hlmSidebarTrigger class="text-muted-foreground hover:text-foreground">
            <span class="sr-only">Toggle sidebar</span>
          </button>
          <div class="h-4 w-px bg-border"></div>
          <span class="text-sm font-medium text-muted-foreground">{{ moduleLabel }}</span>
          <div class="flex-1"></div>
        </header>

        <!-- Contenido — router outlet -->
        <div class="flex-1 overflow-auto bg-muted/40 p-4">
          <router-outlet />
        </div>

      </main>
    </nav>
  `,
})
export class ShellComponent {
  private readonly sidebarService = inject(HlmSidebarService);
  private readonly route          = inject(ActivatedRoute);
  private readonly appTableSvc    = inject(AppTableService);
  private readonly destroyRef     = inject(DestroyRef);

  protected readonly collapsed = computed(() => this.sidebarService.state() === 'collapsed');

  private readonly module = this.route.snapshot.data['module'] as string | undefined;

  protected readonly navGroups = signal<NavGroup[]>(
    this.module === 'inventory' ? buildInventoryNavGroups([], []) :
    this.module === 'common'    ? buildCommonNavGroups([]) :
    this.module === 'security'  ? buildSecurityNavGroups() :
    DATA4N6_NAV_GROUPS,
  );

  protected readonly moduleLabel =
    this.module === 'inventory' ? 'Inventario' :
    this.module === 'common'    ? 'Datos Generales' :
    this.module === 'security'  ? 'Administración' :
    'data4n6';

  protected readonly moduleSubtitle =
    this.module === 'inventory' ? 'Control de equipamiento' :
    this.module === 'common'    ? 'Catálogos y configuración' :
    this.module === 'security'  ? 'Perfiles, roles y usuarios' :
    'Laboratorio forense';

  constructor() {
    if (this.module === 'inventory' || this.module === 'common') {
      this.appTableSvc.getAll()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(tables => {
          const byOrder = (a: AppTable, b: AppTable) => (a.ordenMenu ?? 99) - (b.ordenMenu ?? 99);
          if (this.module === 'common') {
            const common = tables.filter(t => t.seccionMenu === 'common_catalog').sort(byOrder);
            this.navGroups.set(buildCommonNavGroups(common));
          } else {
            const admin   = tables.filter(t => t.seccionMenu === 'inventory_admin').sort(byOrder);
            const catalog = tables.filter(t => t.seccionMenu === 'inventory_catalog').sort(byOrder);
            this.navGroups.set(buildInventoryNavGroups(admin, catalog));
          }
        });
    }
  }
}
