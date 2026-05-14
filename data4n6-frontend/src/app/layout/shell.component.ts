import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MegaMenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { MegaMenuModule } from 'primeng/megamenu';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    DrawerModule, MegaMenuModule,
  ],
  template: `
    <div class="shell-wrapper">

      <!-- ── Drawer móvil ─────────────────────────────────────────── -->
      <p-drawer [(visible)]="drawerVisible" position="left" styleClass="mobile-drawer">
        <ng-template #header>
          <div class="drawer-header-content">
            <i class="pi pi-shield"></i>
            <span class="drawer-brand">data4n6</span>
          </div>
        </ng-template>

        <nav class="drawer-nav">
          <a routerLink="/" class="drawer-link drawer-home"
             (click)="drawerVisible = false">
            <i class="pi pi-home"></i> Inicio
          </a>

          @for (item of megaMenuItems; track item.label) {
            @if (!item.items?.length) {
              <a class="drawer-link" [routerLink]="item.routerLink"
                 routerLinkActive="drawer-link-active"
                 (click)="drawerVisible = false">
                {{ item.label }}
              </a>
            } @else {
              <div class="drawer-group">
                <span class="drawer-group-title">{{ item.label }}</span>
                @for (col of item.items!; track $index) {
                  @for (group of col; track $index) {
                    @if (group.label) {
                      <span class="drawer-sub-group">{{ group.label }}</span>
                    }
                    @for (child of group.items ?? []; track $index) {
                      @if (!child.separator) {
                        <a class="drawer-sub-link" [routerLink]="child.routerLink"
                           routerLinkActive="drawer-link-active"
                           (click)="drawerVisible = false">
                          {{ child.label }}
                        </a>
                      }
                    }
                  }
                }
              </div>
            }
          }
        </nav>
      </p-drawer>

      <!-- ── Contenido principal ──────────────────────────────────── -->
      <div class="shell-content">

        <div class="topbar">
          <button class="icon-btn hamburger-btn" (click)="drawerVisible = true" title="Menú">
            <i class="pi pi-bars"></i>
          </button>
          <a routerLink="/" class="brand-link">
            <i class="pi pi-shield"></i>
            <span class="brand-name">data4n6</span>
          </a>
          <span class="spacer"></span>
          <a routerLink="/" class="icon-btn" title="Inicio">
            <i class="pi pi-home"></i>
          </a>
        </div>

        <!-- Navegación horizontal — oculta en móvil -->
        <nav class="module-nav">
          <p-megamenu [model]="megaMenuItems" breakpoint="0px" />
        </nav>

        <main class="content-area">
          <router-outlet />
        </main>

      </div>
    </div>
  `,
  styles: [`
    /* ── Estructura ───────────────────────────────────────────────── */
    .shell-wrapper { height: 100vh; display: flex; flex-direction: column; }

    .shell-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    /* ── Topbar ───────────────────────────────────────────────────── */
    .topbar {
      background-color: #01603e;
      color: #ffffff;
      height: 56px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 8px;
    }

    .brand-link {
      display: flex; align-items: center; gap: 8px;
      text-decoration: none; color: #ffffff;
      font-size: 1.1rem;
    }
    .brand-name { font-size: 1.2rem; font-weight: 700; }
    .spacer { flex: 1 1 auto; }

    .icon-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 50%;
      background: none; border: none; cursor: pointer;
      color: #fff; font-size: 1.1rem;
      transition: background 0.15s;
      text-decoration: none;
    }
    .icon-btn:hover { background: rgba(255,255,255,0.15); }

    .hamburger-btn { display: none; }

    /* ── Nav wrapper + tokens del MegaMenu ───────────────────────── */
    .module-nav {
      flex-shrink: 0;

      /* Tokens del componente — se heredan al p-megamenu interno */
      --p-megamenu-background:                     #007d5c;
      --p-megamenu-border-color:                   transparent;
      --p-megamenu-border-radius:                  0;
      --p-megamenu-color:                          rgba(255,255,255,0.85);
      --p-megamenu-horizontal-orientation-padding: 0 8px;
      --p-megamenu-gap:                            0;

      /* Items raíz (barra horizontal) */
      --p-megamenu-item-color:             rgba(255,255,255,0.8);
      --p-megamenu-item-focus-color:       #fff;
      --p-megamenu-item-active-color:      #fff;
      --p-megamenu-item-focus-background:  rgba(255,255,255,0.1);
      --p-megamenu-item-active-background: rgba(255,255,255,0.12);
      --p-megamenu-item-border-radius:     0;
      --p-megamenu-item-icon-color:        rgba(255,255,255,0.8);
      --p-megamenu-item-icon-focus-color:  #fff;
      --p-megamenu-item-icon-active-color: #fff;

      /* Panel desplegable */
      --p-megamenu-overlay-background:    #006b50;
      --p-megamenu-overlay-border-color:  rgba(255,255,255,0.22);
      --p-megamenu-overlay-border-radius: 0 0 6px 6px;
      --p-megamenu-overlay-color:         rgba(255,255,255,0.9);
      --p-megamenu-overlay-shadow:        0 6px 20px rgba(0,0,0,0.3);

      /* Submenu dentro del panel */
      --p-megamenu-submenu-label-background: transparent;
      --p-megamenu-submenu-label-color:      #fff;
      --p-megamenu-submenu-icon-color:       rgba(255,255,255,0.7);
      --p-megamenu-submenu-icon-focus-color:  #fff;
      --p-megamenu-submenu-icon-active-color: #fff;

      /* Separador */
      --p-megamenu-separator-border-color: rgba(255,255,255,0.28);
    }

    /* Altura fija 44px + indicador inferior en items raíz */
    ::ng-deep .module-nav .p-megamenu-root-list
        > .p-megamenu-item > .p-megamenu-item-content > .p-megamenu-item-link {
      height: 44px;
      border-radius: 0;
      border-bottom: 3px solid transparent;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }
    ::ng-deep .module-nav .p-megamenu-root-list
        > .p-megamenu-item.p-megamenu-item-active
        > .p-megamenu-item-content > .p-megamenu-item-link {
      border-bottom-color: rgba(255,255,255,0.85);
    }

    /* Panel: ancho ajustado al contenido */
    ::ng-deep .module-nav .p-megamenu-panel { width: fit-content; }
    ::ng-deep .module-nav .p-megamenu-grid  { width: fit-content; }

    /* Fuente uniforme en todo el megamenu */
    ::ng-deep .module-nav .p-megamenu,
    ::ng-deep .module-nav .p-megamenu * {
      font-family: Roboto, 'Helvetica Neue', sans-serif !important;
    }

    /* Tamaño de fuente: items del panel = igual que la barra */
    ::ng-deep .module-nav .p-megamenu-submenu .p-megamenu-item-label {
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Hover en items del submenú */
    ::ng-deep .module-nav .p-megamenu-submenu .p-megamenu-item.p-focus
        > .p-megamenu-item-content > .p-megamenu-item-link,
    ::ng-deep .module-nav .p-megamenu-submenu .p-megamenu-item
        > .p-megamenu-item-content > .p-megamenu-item-link:hover {
      color: #f1b800 !important;
    }

    /* Cabeceras de grupo */
    ::ng-deep .module-nav .p-megamenu-submenu-item,
    ::ng-deep .module-nav .p-megamenu-submenu-item span,
    ::ng-deep .module-nav .p-megamenu-submenu-item-label,
    ::ng-deep .module-nav .p-megamenu-submenu-label {
      font-size: 0.875rem !important;
      font-weight: 700 !important;
      color: #fff !important;
      text-decoration: none !important;
    }

    /* ── Contenido ────────────────────────────────────────────────── */
    .content-area {
      flex: 1; overflow-y: auto;
      background-color: #f5f5f5;
      padding: 24px;
    }

    /* ── Drawer móvil ─────────────────────────────────────────────── */
    ::ng-deep .mobile-drawer { width: 300px !important; }

    .drawer-header-content {
      display: flex; align-items: center; gap: 8px;
      color: #007d5c; font-size: 1rem;
    }
    .drawer-brand { font-size: 1.1rem; font-weight: 700; }

    .drawer-nav { padding: 4px 0 16px; }

    .drawer-home {
      display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px; margin-bottom: 4px;
    }

    .drawer-group { border-top: 1px solid #f3f4f6; }

    .drawer-group-title {
      display: block; padding: 10px 16px 4px;
      font-size: 0.7rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: #007d5c;
    }

    .drawer-link {
      display: block; padding: 10px 16px;
      text-decoration: none; color: #374151; font-size: 0.875rem;
      transition: background 0.12s, color 0.12s;
    }

    .drawer-sub-link {
      display: block; padding: 8px 16px 8px 28px;
      text-decoration: none; color: #6b7280; font-size: 0.85rem;
      transition: background 0.12s, color 0.12s;
    }

    .drawer-link:hover, .drawer-sub-link:hover {
      background: #f0faf6; color: #007d5c;
    }

    .drawer-link-active { color: #007d5c !important; font-weight: 600; }

    .drawer-sub-group {
      display: block; padding: 8px 16px 2px 16px;
      font-size: 0.68rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.07em;
      color: #9ca3af;
    }

    /* ── Responsive ───────────────────────────────────────────────── */
    @media (max-width: 1023px) {
      .hamburger-btn { display: inline-flex; }
      .module-nav { display: none; }
    }

    @media (max-width: 599px) {
      .content-area { padding: 12px; }
      .brand-name { font-size: 1rem; }
    }
  `],
})
export class ShellComponent {
  drawerVisible = false;

  megaMenuItems: MegaMenuItem[] = [
    { label: 'Administración', routerLink: '/data4n6/admin' },
    { label: 'Configuración',  routerLink: '/data4n6/config' },
    {
      label: 'Datos Generales',
      items: [[
        {
          label: 'Listados',
          items: [
            { label: 'Unidades',   routerLink: '/data4n6/general/units' },
            { label: 'Personas',   routerLink: '/data4n6/general/persons' },
            { label: 'Documentos', routerLink: '/data4n6/general/documents' },
            { label: 'Fotos',      routerLink: '/data4n6/general/photos' },
          ],
        },
      ]],
    },
    {
      label: 'Casos',
      items: [
        [{
          label: 'Acciones',
          items: [
            { label: 'Alta Caso',     routerLink: '/data4n6/cases/new' },
            { label: 'Listado Casos', routerLink: '/data4n6/cases' },
          ],
        }],
        [{
          label: 'Catálogos',
          items: [
            { label: 'Estados',       routerLink: '/data4n6/cases/statuses' },
            { label: 'Clasificación', routerLink: '/data4n6/cases/levels' },
            { label: 'Resultados',    routerLink: '/data4n6/cases/outcomes' },
            { label: 'Dominios',      routerLink: '/data4n6/cases/domains' },
          ],
        }],
      ],
    },
    {
      label: 'Eventos',
      items: [
        [{
          label: 'Acciones',
          items: [
            { label: 'Alta Evento',    routerLink: '/data4n6/events/new' },
            { label: 'Listado Eventos', routerLink: '/data4n6/events' },
          ],
        }],
        [{
          label: 'Catálogos',
          items: [
            { label: 'Estados', routerLink: '/data4n6/events/statuses' },
          ],
        }],
      ],
    },
    {
      label: 'Efectos',
      items: [
        [{
          label: 'Acciones',
          items: [
            { label: 'Alta Efecto',    routerLink: '/data4n6/exhibits/new' },
            { label: 'Listado Efectos', routerLink: '/data4n6/exhibits' },
          ],
        }],
        [{
          label: 'Catálogos',
          items: [
            { label: 'Estados', routerLink: '/data4n6/exhibits/statuses' },
          ],
        }],
      ],
    },
    {
      label: 'Evidencias',
      items: [
        [{
          label: 'Acciones',
          items: [
            { label: 'Alta Evidencia',    routerLink: '/data4n6/evidence/new' },
            { label: 'Listado Evidencias', routerLink: '/data4n6/evidence' },
          ],
        }],
        [{
          label: 'Catálogos',
          items: [
            { label: 'Estados', routerLink: '/data4n6/evidence/statuses' },
          ],
        }],
      ],
    },
  ];
}
