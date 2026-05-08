import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';

type SubItem = { label: string; route: string; divider?: false } | { divider: true };

interface NavItem {
  label: string;
  route: string;
  segment: string;
  children: SubItem[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatDividerModule, MatSidenavModule,
  ],
  template: `
    <mat-sidenav-container class="shell-wrapper">

      <!-- ── Drawer móvil ─────────────────────────────────────────── -->
      <mat-sidenav #sidenav mode="over" class="mobile-drawer">
        <div class="drawer-header">
          <mat-icon>security</mat-icon>
          <span class="drawer-brand">data4n6</span>
          <span class="spacer"></span>
          <button mat-icon-button (click)="sidenav.close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <nav class="drawer-nav">
          <a routerLink="/" class="drawer-link drawer-home"
             (click)="sidenav.close()">
            <mat-icon>home</mat-icon> Inicio
          </a>

          @for (item of navItems; track item.segment) {
            @if (item.children.length === 0) {
              <a class="drawer-link" [routerLink]="item.route"
                 routerLinkActive="drawer-link-active"
                 (click)="sidenav.close()">
                {{ item.label }}
              </a>
            } @else {
              <div class="drawer-group">
                <span class="drawer-group-title">{{ item.label }}</span>
                @for (child of item.children; track $index) {
                  @if (!child.divider) {
                    <a class="drawer-sub-link" [routerLink]="child.route"
                       routerLinkActive="drawer-link-active"
                       (click)="sidenav.close()">
                      {{ child.label }}
                    </a>
                  }
                }
              </div>
            }
          }
        </nav>
      </mat-sidenav>

      <!-- ── Contenido principal ──────────────────────────────────── -->
      <mat-sidenav-content class="shell-content">

        <mat-toolbar class="topbar">
          <!-- Hamburger: visible solo en móvil -->
          <button mat-icon-button class="hamburger-btn" (click)="sidenav.open()">
            <mat-icon>menu</mat-icon>
          </button>
          <a routerLink="/" class="brand-link">
            <mat-icon>security</mat-icon>
            <span class="brand-name">data4n6</span>
          </a>
          <span class="spacer"></span>
          <a routerLink="/" mat-icon-button title="Inicio" class="home-btn">
            <mat-icon>home</mat-icon>
          </a>
        </mat-toolbar>

        <!-- Navegación horizontal — oculta en móvil -->
        <nav class="module-nav">
          @for (item of navItems; track item.segment) {
            @if (item.children.length === 0) {
              <a [routerLink]="item.route"
                 routerLinkActive="nav-active"
                 [routerLinkActiveOptions]="{ exact: false }"
                 class="nav-item">
                {{ item.label }}
              </a>
            } @else {
              <button class="nav-item nav-item-btn"
                      [class.nav-active]="isActive(item.segment)"
                      [matMenuTriggerFor]="menu">
                {{ item.label }}
                <mat-icon class="dropdown-arrow">arrow_drop_down</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                @for (child of item.children; track $index) {
                  @if (child.divider) {
                    <mat-divider class="menu-divider" />
                  } @else {
                    <a mat-menu-item [routerLink]="child.route"
                       routerLinkActive="menu-item-active">
                      {{ child.label }}
                    </a>
                  }
                }
              </mat-menu>
            }
          }
        </nav>

        <main class="content-area">
          <router-outlet />
        </main>

      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    /* ── Estructura ───────────────────────────────────────────────── */
    .shell-wrapper { height: 100vh; }

    .shell-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    /* ── Topbar ───────────────────────────────────────────────────── */
    .topbar {
      background-color: #01603e !important;
      color: #ffffff;
      height: 56px;
      flex-shrink: 0;
    }

    .brand-link {
      display: flex; align-items: center; gap: 8px;
      text-decoration: none; color: #ffffff;
    }
    .brand-name { font-size: 1.2rem; font-weight: 700; }
    .spacer { flex: 1 1 auto; }

    /* Hamburger oculto en escritorio */
    .hamburger-btn { display: none; color: #fff; margin-right: 4px; }

    /* ── Nav horizontal ───────────────────────────────────────────── */
    .module-nav {
      background-color: #007d5c;
      display: flex;
      flex-shrink: 0;
      padding: 0 16px;
      overflow-x: auto;
    }

    .nav-item {
      display: inline-flex; align-items: center; gap: 2px;
      padding: 0 16px; height: 44px;
      color: rgba(255,255,255,0.8);
      text-decoration: none; font-size: 0.875rem; font-weight: 500;
      border-bottom: 3px solid transparent;
      transition: color 0.15s, background-color 0.15s;
      white-space: nowrap;
    }
    .nav-item:hover { color: #fff; background-color: rgba(255,255,255,0.08); }
    .nav-item.nav-active { color: #fff; border-bottom-color: #fff; background-color: rgba(255,255,255,0.1); }
    .nav-item-btn { background: none; border: none; cursor: pointer; font-family: inherit; border-radius: 0; }
    .dropdown-arrow { font-size: 18px; width: 18px; height: 18px; }

    /* ── Contenido ────────────────────────────────────────────────── */
    .content-area {
      flex: 1; overflow-y: auto;
      background-color: #f5f5f5;
      padding: 24px;
    }

    /* ── Drawer móvil ─────────────────────────────────────────────── */
    .mobile-drawer { width: 300px; }

    .drawer-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 8px 12px 16px;
      background: #01603e; color: #fff;
      flex-shrink: 0;
    }
    .drawer-brand { font-size: 1.1rem; font-weight: 700; }

    .drawer-nav { overflow-y: auto; padding: 4px 0 16px; }

    .drawer-home {
      display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px; margin-bottom: 4px;
    }
    .drawer-home mat-icon { font-size: 20px; width: 20px; height: 20px; color: #007d5c; }

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

    /* ── Responsive breakpoints ───────────────────────────────────── */
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
  private readonly router = inject(Router);

  navItems: NavItem[] = [
    { label: 'Administración',  segment: 'admin',    route: '/data4n6/admin',    children: [] },
    { label: 'Configuración',   segment: 'config',   route: '/data4n6/config',   children: [] },
    {
      label: 'Datos Generales', segment: 'general',  route: '/data4n6/general',
      children: [
        { label: 'Listado Unidades',   route: '/data4n6/general/units' },
        { divider: true },
        { label: 'Listado Personas',   route: '/data4n6/general/persons' },
        { divider: true },
        { label: 'Listado Documentos', route: '/data4n6/general/documents' },
        { label: 'Listado Fotos',      route: '/data4n6/general/photos' },
      ],
    },
    {
      label: 'Casos', segment: 'cases', route: '/data4n6/cases',
      children: [
        { label: 'Alta Caso',                route: '/data4n6/cases/new' },
        { label: 'Listado Casos',            route: '/data4n6/cases' },
        { divider: true },
        { label: 'Estados de Caso',          route: '/data4n6/cases/statuses' },
        { label: 'Niveles de Clasificación', route: '/data4n6/cases/levels' },
        { label: 'Resultados de Caso',       route: '/data4n6/cases/outcomes' },
        { label: 'Dominios',                 route: '/data4n6/cases/domains' },
      ],
    },
    {
      label: 'Eventos', segment: 'events', route: '/data4n6/events',
      children: [
        { label: 'Alta Evento',       route: '/data4n6/events/new' },
        { label: 'Listado Eventos',   route: '/data4n6/events' },
        { divider: true },
        { label: 'Estados de Evento', route: '/data4n6/events/statuses' },
      ],
    },
    {
      label: 'Efectos', segment: 'exhibits', route: '/data4n6/exhibits',
      children: [
        { label: 'Alta Efecto',        route: '/data4n6/exhibits/new' },
        { label: 'Listado Efectos',    route: '/data4n6/exhibits' },
        { divider: true },
        { label: 'Estados de Efecto',  route: '/data4n6/exhibits/statuses' },
      ],
    },
    {
      label: 'Evidencias', segment: 'evidence', route: '/data4n6/evidence',
      children: [
        { label: 'Alta Evidencia',       route: '/data4n6/evidence/new' },
        { label: 'Listado Evidencias',   route: '/data4n6/evidence' },
        { divider: true },
        { label: 'Estados de Evidencia', route: '/data4n6/evidence/statuses' },
      ],
    },
  ];

  isActive(segment: string): boolean {
    return this.router.url.startsWith(`/data4n6/${segment}`);
  }
}
