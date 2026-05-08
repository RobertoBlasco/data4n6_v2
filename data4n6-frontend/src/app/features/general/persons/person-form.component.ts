import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

interface PersonRole {
  id: string;
  code: string;
  name: string;
}

@Component({
  selector: 'app-person-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <div class="form-page">
      <div class="form-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="page-title">Nueva Persona</h1>
          @if (ctx.contextName) {
            <p class="context-label">
              <mat-icon class="ctx-icon">account_tree</mat-icon>
              Vinculada a: <strong>{{ ctx.contextName }}</strong>
            </p>
          }
        </div>
      </div>

      @if (loadingRoles()) {
        <div class="spinner-center"><mat-spinner diameter="36" /></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="form-card">

          <div class="form-section-title">Datos personales</div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="field-grow">
              <mat-label>Apellidos *</mat-label>
              <input matInput formControlName="lastName" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="field-grow">
              <mat-label>Nombre *</mat-label>
              <input matInput formControlName="firstName" />
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="field-200">
              <mat-label>NIF / DNI</mat-label>
              <input matInput formControlName="nationalId" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="field-180">
              <mat-label>Fecha nacimiento</mat-label>
              <input matInput [matDatepicker]="dp" formControlName="dateOfBirth" />
              <mat-datepicker-toggle matSuffix [for]="dp" />
              <mat-datepicker #dp />
            </mat-form-field>
            <mat-form-field appearance="outline" class="field-140">
              <mat-label>Género</mat-label>
              <mat-select formControlName="gender">
                <mat-option value="">—</mat-option>
                <mat-option value="M">Hombre</mat-option>
                <mat-option value="F">Mujer</mat-option>
                <mat-option value="OTHER">Otro</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-section-title">Contacto</div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="field-200">
              <mat-label>Teléfono</mat-label>
              <input matInput formControlName="phone" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="field-grow">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Dirección</mat-label>
            <textarea matInput formControlName="address" rows="2"></textarea>
          </mat-form-field>

          <div class="form-section-title">Vinculación</div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="field-grow">
              <mat-label>Rol *</mat-label>
              <mat-select formControlName="roleId">
                @for (r of roles(); track r.id) {
                  <mat-option [value]="r.id">{{ r.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Observaciones</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit"
                    [disabled]="form.invalid || saving()">
              @if (saving()) { <mat-spinner diameter="18" /> } @else { Guardar }
            </button>
          </div>

        </form>
      }
    </div>
  `,
  styles: [`
    .form-page { max-width: 720px; }

    .form-header {
      display: flex; align-items: flex-start; gap: 8px; margin-bottom: 20px;
    }

    .page-title { margin: 0; font-size: 1.5rem; color: #01603e; }

    .context-label {
      margin: 4px 0 0; font-size: 0.85rem; color: #6b7280;
      display: flex; align-items: center; gap: 4px;
    }

    .ctx-icon { font-size: 16px; width: 16px; height: 16px; color: #007d5c; }

    .spinner-center { display: flex; justify-content: center; padding: 40px; }

    .form-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
    }

    .form-section-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: #007d5c;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin: 16px 0 8px;
    }

    .form-section-title:first-child { margin-top: 0; }

    .form-row {
      display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 0;
    }

    .field-grow { flex: 1; min-width: 140px; }
    .field-200 { width: 200px; min-width: 120px; }
    .field-180 { width: 180px; min-width: 120px; }
    .field-140 { width: 140px; min-width: 100px; }
    .full-width { width: 100%; }

    .form-actions {
      display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;
    }

    @media (max-width: 599px) {
      .form-page { max-width: 100%; }
      .form-row { flex-direction: column; }
      .field-grow, .field-200, .field-180, .field-140 { width: 100%; }
      .form-actions { flex-direction: column; }
      .form-actions button { width: 100%; }
    }
  `],
})
export class PersonFormComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);
  private readonly snack  = inject(MatSnackBar);

  ctx = (history.state ?? {}) as { tableName?: string; recordId?: string; contextName?: string };

  roles = signal<PersonRole[]>([]);
  loadingRoles = signal(true);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    firstName:   ['', Validators.required],
    lastName:    ['', Validators.required],
    nationalId:  [''],
    dateOfBirth: [null as Date | null],
    gender:      [''],
    phone:       [''],
    email:       [''],
    address:     [''],
    notes:       [''],
    roleId:      ['', Validators.required],
  });

  ngOnInit(): void {
    this.api.get<PersonRole[]>('/persons/roles').subscribe({
      next: r => { this.roles.set(r); this.loadingRoles.set(false); },
      error: () => this.loadingRoles.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const v = this.form.getRawValue();
    const body = {
      ...v,
      dateOfBirth: v.dateOfBirth ? (v.dateOfBirth as Date).toISOString().slice(0, 10) : null,
      tableName: this.ctx.tableName,
      recordId:  this.ctx.recordId,
    };

    this.api.post<unknown>('/persons', body).subscribe({
      next: () => {
        this.snack.open('Persona creada correctamente', 'Cerrar', { duration: 3000 });
        this.goBack();
      },
      error: () => {
        this.snack.open('Error al guardar la persona', 'Cerrar', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }

  goBack(): void {
    history.back();
  }
}
