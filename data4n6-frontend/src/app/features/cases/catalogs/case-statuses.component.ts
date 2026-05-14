import { Component, inject, OnInit, signal } from '@angular/core';
import { GridBaseComponent } from '../../../shared/components/grid-base/grid-base.component';
import { CasesService, CaseStatusOption } from '../../../core/services/cases.service';

@Component({
  selector: 'app-case-statuses',
  standalone: true,
  imports: [GridBaseComponent],
  template: `
    <h1 class="page-title">Estados de caso</h1>
    <app-grid-base [data]="statuses()" [loading]="loading()"
                   [showGridlines]="true" [stripedRows]="true" size="small">
      <ng-template #header>
        <tr>
          <th style="width:48px">Color</th>
          <th>Nombre</th>
          <th style="width:80px">Activo</th>
        </tr>
      </ng-template>
      <ng-template #body let-s>
        <tr>
          <td><span class="color-dot" [style.background-color]="s.color"></span></td>
          <td>{{ s.name }}</td>
          <td>{{ s.active ? 'Sí' : 'No' }}</td>
        </tr>
      </ng-template>
    </app-grid-base>
  `,
  styles: [`
    .page-title { margin: 0 0 20px; font-size: 1.5rem; color: #01603e; }
    .color-dot { display: inline-block; width: 16px; height: 16px; border-radius: 50%; }
  `],
})
export class CaseStatusesComponent implements OnInit {
  private readonly casesService = inject(CasesService);
  statuses = signal<CaseStatusOption[]>([]);
  loading  = signal(true);

  ngOnInit(): void {
    this.casesService.getStatuses().subscribe({
      next: data => { this.statuses.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
