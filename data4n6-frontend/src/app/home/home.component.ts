import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

interface ModuleCard {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
  available: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatRippleModule, MatIconModule],
  template: `
    <div class="home-wrapper">
      <header class="home-header">
        <div class="brand">
          <mat-icon class="brand-icon">security</mat-icon>
          <span class="brand-name">data4n6</span>
        </div>
        <p class="brand-tagline">Plataforma de gestión forense digital</p>
      </header>

      <div class="modules-grid">
        @for (m of modules; track m.route) {
          <div
            class="module-card"
            [class.unavailable]="!m.available"
            matRipple
            [matRippleDisabled]="!m.available"
            (click)="navigate(m)">
            <div class="card-icon-wrap" [style.background-color]="m.color + '1a'">
              <mat-icon [style.color]="m.color">{{ m.icon }}</mat-icon>
            </div>
            <div class="card-body">
              <h2>{{ m.title }}</h2>
              <p>{{ m.subtitle }}</p>
            </div>
            @if (!m.available) {
              <span class="badge-soon">Próximamente</span>
            } @else {
              <mat-icon class="arrow-icon">chevron_right</mat-icon>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .home-wrapper {
      min-height: 100vh;
      background: #f5f5f5;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 24px 40px;
    }
    .home-header { text-align: center; margin-bottom: 56px; }
    .brand {
      display: flex; align-items: center; justify-content: center;
      gap: 12px; margin-bottom: 8px;
    }
    .brand-icon { font-size: 48px; width: 48px; height: 48px; color: #007d5c; }
    .brand-name { font-size: 2.8rem; font-weight: 700; color: #01603e; letter-spacing: -1px; }
    .brand-tagline { margin: 0; color: #6b7280; font-size: 1rem; }
    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      width: 100%;
      max-width: 960px;
    }
    .module-card {
      background: #ffffff;
      border-radius: 8px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      cursor: pointer;
      border: 1px solid #e5e7eb;
      transition: box-shadow 0.2s, transform 0.15s;
      position: relative;
      overflow: hidden;
    }
    .module-card:not(.unavailable):hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }
    .module-card.unavailable { cursor: default; opacity: 0.6; }
    .card-icon-wrap {
      width: 56px; height: 56px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .card-icon-wrap mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .card-body { flex: 1; }
    .card-body h2 { margin: 0 0 4px; font-size: 1.1rem; font-weight: 600; color: #111827; }
    .card-body p { margin: 0; font-size: 0.875rem; color: #6b7280; }
    .arrow-icon { color: #9ca3af; }
    .badge-soon {
      font-size: 0.7rem; font-weight: 600; background: #e5e7eb;
      color: #6b7280; padding: 2px 8px; border-radius: 12px; white-space: nowrap;
    }
  `],
})
export class HomeComponent {
  private readonly router = inject(Router);

  modules: ModuleCard[] = [
    {
      title: 'data4n6',
      subtitle: 'Gestión de evidencias, efectos y cadena de custodia',
      icon: 'fingerprint',
      color: '#007d5c',
      route: '/data4n6/cases',
      available: true,
    },
    {
      title: 'Inventario',
      subtitle: 'Control de equipamiento y material técnico',
      icon: 'inventory_2',
      color: '#2563eb',
      route: '/inventario',
      available: false,
    },
    {
      title: 'Herramientas',
      subtitle: 'Utilidades de análisis forense y generación de informes',
      icon: 'build',
      color: '#7c3aed',
      route: '/herramientas',
      available: false,
    },
  ];

  navigate(m: ModuleCard): void {
    if (m.available) this.router.navigate([m.route]);
  }
}
