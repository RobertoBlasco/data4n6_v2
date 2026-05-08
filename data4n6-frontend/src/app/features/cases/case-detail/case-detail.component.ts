import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { CasesService, CaseDetail } from '../../../core/services/cases.service';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button routerLink="/data4n6/cases">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <div class="header-text">
        <span class="case-code">{{ kase()?.code }}</span>
        <h1>{{ kase()?.title ?? 'Cargando...' }}</h1>
      </div>
      <span class="spacer"></span>
      @if (kase()) {
        <button mat-stroked-button [routerLink]="['/data4n6/cases', kase()!.id, 'edit']">
          <mat-icon>edit</mat-icon> Editar
        </button>
        <button mat-stroked-button color="warn" (click)="confirmDelete()">
          <mat-icon>delete_outline</mat-icon> Eliminar
        </button>
      }
    </div>

    @if (deleteConfirm()) {
      <div class="delete-banner">
        <mat-icon color="warn">warning_amber</mat-icon>
        <span>¿Eliminar este caso? Esta acción no se puede deshacer.</span>
        <button mat-flat-button color="warn" (click)="doDelete()" [disabled]="deleting()">
          {{ deleting() ? 'Eliminando...' : 'Sí, eliminar' }}
        </button>
        <button mat-stroked-button (click)="deleteConfirm.set(false)">Cancelar</button>
      </div>
    }

    @if (loading()) {
      <div class="spinner-center"><mat-spinner diameter="48" /></div>
    } @else if (kase()) {
      <div class="detail-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Información general</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <dl class="detail-list">
              <dt>Estado</dt>
              <dd>
                <span class="status-chip" [style.background-color]="kase()!.status.color">
                  {{ kase()!.status.name }}
                </span>
              </dd>

              <dt>Descripción</dt>
              <dd>{{ kase()!.description || '—' }}</dd>

              @if (kase()!.outcome) {
                <dt>Resultado</dt>
                <dd>{{ kase()!.outcome!.name }}</dd>
              }

              @if (kase()!.outcomeNotes) {
                <dt>Notas</dt>
                <dd>{{ kase()!.outcomeNotes }}</dd>
              }

              @if (kase()!.retentionCategory) {
                <dt>Retención</dt>
                <dd>{{ kase()!.retentionCategory }}</dd>
              }

              <dt>Creado</dt>
              <dd>{{ kase()!.createdAt | date:'dd/MM/yyyy HH:mm' }} por {{ kase()!.createdBy }}</dd>

              <dt>Modificado</dt>
              <dd>{{ kase()!.updatedAt | date:'dd/MM/yyyy HH:mm' }} por {{ kase()!.updatedBy }}</dd>
            </dl>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .page-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;
    }
    .header-text { display: flex; flex-direction: column; }
    .case-code { font-size: 0.8rem; color: #6b7280; font-weight: 500; }
    h1 { margin: 0; font-size: 1.5rem; color: #01603e; }
    .spacer { flex: 1 1 auto; }
    .spinner-center { display: flex; justify-content: center; padding: 48px; }
    .detail-grid { display: grid; gap: 16px; max-width: 760px; }
    .detail-list { display: grid; grid-template-columns: 160px 1fr; gap: 8px 16px; margin: 0; }
    dt { font-weight: 500; color: #6b7280; align-self: start; padding-top: 2px; }
    dd { margin: 0; }
    .status-chip {
      display: inline-block; padding: 2px 12px; border-radius: 12px;
      color: #fff; font-size: 0.8rem; font-weight: 500;
    }
    .delete-banner {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      background: #fff3cd; border: 1px solid #ffc107;
      border-radius: 4px; padding: 12px 16px; margin-bottom: 20px;
    }
    @media (max-width: 599px) {
      .detail-grid { max-width: 100%; }
      .detail-list { grid-template-columns: 1fr; }
      dt { color: #9ca3af; font-size: 0.75rem; margin-top: 10px; }
      dt:first-child { margin-top: 0; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .spacer { display: none; }
    }
  `],
})
export class CaseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly casesService = inject(CasesService);
  private readonly snackBar = inject(MatSnackBar);

  kase = signal<CaseDetail | null>(null);
  loading = signal(true);
  deleteConfirm = signal(false);
  deleting = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.casesService.findById(id).subscribe({
      next: data => { this.kase.set(data); this.loading.set(false); },
      error: () => {
        this.snackBar.open('No se encontró el caso', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/data4n6/cases']);
      },
    });
  }

  confirmDelete(): void {
    this.deleteConfirm.set(true);
  }

  doDelete(): void {
    this.deleting.set(true);
    this.casesService.delete(this.kase()!.id).subscribe({
      next: () => {
        this.snackBar.open('Caso eliminado', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/data4n6/cases']);
      },
      error: () => {
        this.snackBar.open('Error al eliminar el caso', 'Cerrar', { duration: 4000 });
        this.deleting.set(false);
      },
    });
  }
}
