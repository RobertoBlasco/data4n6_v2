import { Component, inject, OnInit, signal } from '@angular/core';
import { GridBaseComponent } from '../../../shared/components/grid-base/grid-base.component';
import { CasesService, CaseOutcomeOption } from '../../../core/services/cases.service';

@Component({
  selector: 'app-case-outcomes',
  standalone: true,
  imports: [GridBaseComponent],
  template: `
    <h1 class="page-title">Resultados de caso</h1>
    <app-grid-base [data]="outcomes()" [loading]="loading()"
                   [showGridlines]="true" [stripedRows]="true" size="small">
      <ng-template #header>
        <tr>
          <th>Nombre</th>
          <th>Activo</th>
        </tr>
      </ng-template>
      <ng-template #body let-o>
        <tr>
          <td>{{ o.name }}</td>
          <td>{{ o.active ? 'Sí' : 'No' }}</td>
        </tr>
      </ng-template>
    </app-grid-base>
  `,
  styles: [`
    .page-title { margin: 0 0 20px; font-size: 1.5rem; color: #01603e; }
  `],
})
export class CaseOutcomesComponent implements OnInit {
  private readonly casesService = inject(CasesService);
  outcomes = signal<CaseOutcomeOption[]>([]);
  loading  = signal(true);

  ngOnInit(): void {
    this.casesService.getOutcomes().subscribe({
      next: data => { this.outcomes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
