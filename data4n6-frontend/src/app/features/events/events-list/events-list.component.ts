import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="page-header">
      <h1>Eventos</h1>
    </div>
    <p style="color:#6b7280">Módulo en construcción</p>
  `,
  styles: [`.page-header { margin-bottom: 24px; } h1 { margin: 0; font-size: 1.6rem; color: #01603e; }`],
})
export class EventsListComponent {}
