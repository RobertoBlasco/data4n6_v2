import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CasesService, CaseStatusOption } from '../../../core/services/cases.service';

@Component({
  selector: 'app-case-statuses',
  standalone: true,
  imports: [MatTableModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <h1 class="page-title">Estados de caso</h1>
    @if (loading()) {
      <div class="spinner-center"><mat-spinner diameter="40" /></div>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="statuses()" class="full-width">
          <ng-container matColumnDef="color">
            <th mat-header-cell *matHeaderCellDef>Color</th>
            <td mat-cell *matCellDef="let s">
              <span class="color-dot" [style.background-color]="s.color"></span>
            </td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let s">{{ s.name }}</td>
          </ng-container>
          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Activo</th>
            <td mat-cell *matCellDef="let s">{{ s.active ? 'Sí' : 'No' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    .page-title { margin: 0 0 20px; font-size: 1.5rem; color: #01603e; }
    .spinner-center { display: flex; justify-content: center; padding: 40px; }
    .full-width { width: 100%; }
    .color-dot { display: inline-block; width: 16px; height: 16px; border-radius: 50%; }
  `],
})
export class CaseStatusesComponent implements OnInit {
  private readonly casesService = inject(CasesService);
  statuses = signal<CaseStatusOption[]>([]);
  loading = signal(true);
  columns = ['color', 'name', 'active'];

  ngOnInit(): void {
    this.casesService.getStatuses().subscribe({
      next: data => { this.statuses.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
