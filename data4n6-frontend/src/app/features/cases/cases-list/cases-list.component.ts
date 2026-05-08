import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { CasesService, CaseSummary } from '../../../core/services/cases.service';

@Component({
  selector: 'app-cases-list',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule, MatCardModule,
  ],
  template: `
    <div class="page-header">
      <h1>Casos</h1>
      <button mat-flat-button color="primary" routerLink="/data4n6/cases/new">
        <mat-icon>add</mat-icon> Nuevo caso
      </button>
    </div>

    @if (loading()) {
      <div class="spinner-center">
        <mat-spinner diameter="48" />
      </div>
    } @else if (error()) {
      <mat-card class="error-card">
        <mat-card-content>
          <mat-icon color="warn">error_outline</mat-icon>
          <span>{{ error() }}</span>
        </mat-card-content>
      </mat-card>
    } @else {
      <mat-card>
        <div class="table-scroll">
        <table mat-table [dataSource]="cases()" class="full-width">

          <ng-container matColumnDef="caseNumber">
            <th mat-header-cell *matHeaderCellDef>Nº Expediente</th>
            <td mat-cell *matCellDef="let c">
              <a [routerLink]="['/data4n6/cases', c.id]" class="case-link">{{ c.code }}</a>
            </td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Título</th>
            <td mat-cell *matCellDef="let c">{{ c.title }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let c">
              <span class="status-chip" [style.background-color]="c.status.color">
                {{ c.status.name }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Fecha alta</th>
            <td mat-cell *matCellDef="let c">{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" class="table-row"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" colspan="5">No hay casos registrados</td>
          </tr>
        </table>
        </div>
      </mat-card>
    }
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    h1 { margin: 0; font-size: 1.6rem; color: #01603e; }
    .spinner-center { display: flex; justify-content: center; padding: 48px; }
    .full-width { width: 100%; }
    .case-link { color: #007d5c; text-decoration: none; font-weight: 500; }
    .case-link:hover { text-decoration: underline; }
    .status-chip {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .table-row:hover { background-color: #f0faf6; cursor: pointer; }
    .no-data { text-align: center; padding: 24px; color: #6b7280; }
    .error-card mat-card-content { display: flex; align-items: center; gap: 8px; padding: 16px; }
  `],
})
export class CasesListComponent implements OnInit {
  private readonly casesService = inject(CasesService);

  cases = signal<CaseSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  columns = ['caseNumber', 'title', 'status', 'createdAt'];

  ngOnInit(): void {
    this.casesService.findAll().subscribe({
      next: data => {
        this.cases.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('No se pudieron cargar los casos. Comprueba que el backend está activo.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
