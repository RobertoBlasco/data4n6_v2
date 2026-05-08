import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import {
  CasesService,
  CaseStatusOption,
  CaseLevelOption,
  CaseOutcomeOption,
  CaseDetail,
} from '../../../core/services/cases.service';

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button [routerLink]="cancelRoute()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <h1>{{ isEdit() ? 'Editar caso' : 'Nuevo caso' }}</h1>
    </div>

    @if (loadingData()) {
      <div class="spinner-center"><mat-spinner diameter="48" /></div>
    } @else {
      <div class="form-container">
        <form [formGroup]="form" (ngSubmit)="submit()">

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Título *</mat-label>
            <input matInput formControlName="title" placeholder="Título del caso" />
            @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
              <mat-error>El título es obligatorio</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descripción</mat-label>
            <textarea matInput formControlName="description" rows="4"
                      placeholder="Descripción del caso"></textarea>
          </mat-form-field>

          <div class="row-2">
            <mat-form-field appearance="outline">
              <mat-label>Estado *</mat-label>
              <mat-select formControlName="statusId">
                @for (s of statuses(); track s.id) {
                  <mat-option [value]="s.id">
                    <span class="option-dot" [style.background-color]="s.color"></span>
                    {{ s.name }}
                  </mat-option>
                }
              </mat-select>
              @if (form.get('statusId')?.hasError('required') && form.get('statusId')?.touched) {
                <mat-error>El estado es obligatorio</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nivel de clasificación</mat-label>
              <mat-select formControlName="classificationLevelId">
                <mat-option [value]="null">— Sin clasificar —</mat-option>
                @for (l of levels(); track l.id) {
                  <mat-option [value]="l.id">
                    <span class="option-dot" [style.background-color]="l.color"></span>
                    {{ l.name }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          @if (isEdit()) {
            <div class="row-2">
              <mat-form-field appearance="outline">
                <mat-label>Resultado</mat-label>
                <mat-select formControlName="outcomeId">
                  <mat-option [value]="null">— Sin resultado —</mat-option>
                  @for (o of outcomes(); track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Categoría de retención</mat-label>
                <input matInput formControlName="retentionCategory" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notas del resultado</mat-label>
              <textarea matInput formControlName="outcomeNotes" rows="3"></textarea>
            </mat-form-field>
          }

          <div class="form-actions">
            <button mat-stroked-button type="button" [routerLink]="cancelRoute()">
              Cancelar
            </button>
            <button mat-flat-button color="primary" type="submit"
                    [disabled]="form.invalid || saving()">
              <mat-icon [style.display]="saving() ? 'none' : ''">save</mat-icon>
              @if (saving()) {
                <mat-spinner diameter="20" />
              } @else {
                {{ isEdit() ? 'Guardar cambios' : 'Crear caso' }}
              }
            </button>
          </div>

        </form>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 1.5rem; color: #01603e; }
    .spinner-center { display: flex; justify-content: center; padding: 48px; }
    .form-container { max-width: 760px; }
    form { display: flex; flex-direction: column; gap: 16px; }
    .full-width { width: 100%; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .option-dot {
      display: inline-block; width: 10px; height: 10px;
      border-radius: 50%; margin-right: 8px;
    }
    .form-actions {
      display: flex; gap: 12px; justify-content: flex-end;
      padding-top: 8px; border-top: 1px solid #e0e0e0; margin-top: 8px;
    }
    @media (max-width: 599px) {
      .form-container { max-width: 100%; }
      .row-2 { grid-template-columns: 1fr; }
      .form-actions { justify-content: stretch; flex-direction: column; }
      .form-actions button { width: 100%; }
    }
  `],
})
export class CaseFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly casesService = inject(CasesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  isEdit = signal(false);
  loadingData = signal(true);
  saving = signal(false);
  cancelRoute = signal('/data4n6/cases');

  statuses = signal<CaseStatusOption[]>([]);
  levels = signal<CaseLevelOption[]>([]);
  outcomes = signal<CaseOutcomeOption[]>([]);

  private caseId: string | null = null;

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    statusId: ['', Validators.required],
    classificationLevelId: [null as string | null],
    outcomeId: [null as string | null],
    outcomeNotes: [''],
    retentionCategory: [''],
  });

  ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get('id');
    this.isEdit.set(!!this.caseId);
    this.cancelRoute.set(this.caseId ? `/data4n6/cases/${this.caseId}` : '/data4n6/cases');

    const catalogs$ = forkJoin({
      statuses: this.casesService.getStatuses(),
      levels: this.casesService.getLevels(),
      outcomes: this.casesService.getOutcomes(),
    });

    if (this.caseId) {
      forkJoin({
        catalogs: catalogs$,
        kase: this.casesService.findById(this.caseId),
      }).subscribe({
        next: ({ catalogs, kase }) => {
          this.statuses.set(catalogs.statuses.filter(s => s.active));
          this.levels.set(catalogs.levels.filter(l => l.active));
          this.outcomes.set(catalogs.outcomes.filter(o => o.active));
          this.patchForm(kase);
          this.loadingData.set(false);
        },
        error: () => this.handleLoadError(),
      });
    } else {
      catalogs$.subscribe({
        next: ({ statuses, levels, outcomes }) => {
          this.statuses.set(statuses.filter(s => s.active));
          this.levels.set(levels.filter(l => l.active));
          this.outcomes.set(outcomes.filter(o => o.active));
          this.loadingData.set(false);
        },
        error: () => this.handleLoadError(),
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const value = this.form.getRawValue();
    const request = {
      title: value.title!,
      description: value.description ?? undefined,
      statusId: value.statusId!,
      classificationLevelId: value.classificationLevelId ?? undefined,
      outcomeId: value.outcomeId ?? undefined,
      outcomeNotes: value.outcomeNotes ?? undefined,
      retentionCategory: value.retentionCategory ?? undefined,
    };

    const op$ = this.caseId
      ? this.casesService.update(this.caseId, request)
      : this.casesService.create(request);

    op$.subscribe({
      next: result => {
        this.snackBar.open(
          this.caseId ? 'Caso actualizado' : 'Caso creado',
          'Cerrar',
          { duration: 3000 }
        );
        this.router.navigate(['/data4n6/cases', result.id]);
      },
      error: () => {
        this.snackBar.open('Error al guardar el caso', 'Cerrar', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }

  private patchForm(kase: CaseDetail): void {
    this.form.patchValue({
      title: kase.title,
      description: kase.description,
      statusId: kase.status.id,
      classificationLevelId: kase.classificationLevelId,
      outcomeId: kase.outcome?.id ?? null,
      outcomeNotes: kase.outcomeNotes ?? '',
      retentionCategory: kase.retentionCategory ?? '',
    });
  }

  private handleLoadError(): void {
    this.snackBar.open('Error al cargar los datos', 'Cerrar', { duration: 4000 });
    this.router.navigate(['/data4n6/cases']);
  }
}
