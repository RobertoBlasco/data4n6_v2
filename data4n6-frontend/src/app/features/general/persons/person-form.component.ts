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

interface PersonRole { id: string; code: string; name: string; }

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
    <div class="page-bg">
      <div class="form-card">

        <!-- Cabecera ───────────────────────────────────────────────────────── -->
        <div class="card-header">
          <button mat-icon-button class="btn-back" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1 class="form-title">Nueva Persona</h1>
            @if (ctx.contextName) {
              <p class="context-label">
                <mat-icon class="ctx-icon">account_tree</mat-icon>
                Vinculada a <strong>{{ ctx.contextName }}</strong>
              </p>
            }
          </div>
        </div>

        @if (loadingRoles()) {
          <div class="spinner-center"><mat-spinner diameter="32" /></div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()">

            <!-- Sección: Datos personales ─────────────────────────────────── -->
            <div class="section-label">Datos personales</div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="field-grow">
                <mat-label>Apellidos *</mat-label>
                <input matInput formControlName="lastName" autocomplete="off" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="field-grow">
                <mat-label>Nombre *</mat-label>
                <input matInput formControlName="firstName" autocomplete="off" />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="field-180">
                <mat-label>NIF / DNI</mat-label>
                <input matInput formControlName="nationalId" autocomplete="off" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="field-160">
                <mat-label>Fecha nacimiento</mat-label>
                <input matInput [matDatepicker]="dp" formControlName="dateOfBirth" />
                <mat-datepicker-toggle matSuffix [for]="dp" />
                <mat-datepicker #dp />
              </mat-form-field>
              <mat-form-field appearance="outline" class="field-130">
                <mat-label>Género</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="">—</mat-option>
                  <mat-option value="M">Hombre</mat-option>
                  <mat-option value="F">Mujer</mat-option>
                  <mat-option value="OTHER">Otro</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Sección: Contacto ──────────────────────────────────────────── -->
            <div class="section-label">Contacto</div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="field-180">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="phone" autocomplete="off" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="field-grow">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" autocomplete="off" />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="field-full">
                <mat-label>Dirección</mat-label>
                <textarea matInput formControlName="address" rows="2"></textarea>
              </mat-form-field>
            </div>

            <!-- Sección: Vinculación ───────────────────────────────────────── -->
            <div class="section-label">Vinculación</div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="field-280">
                <mat-label>Rol *</mat-label>
                <mat-select formControlName="roleId">
                  @for (r of roles(); track r.id) {
                    <mat-option [value]="r.id">{{ r.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="field-full">
                <mat-label>Observaciones</mat-label>
                <textarea matInput formControlName="notes" rows="2"></textarea>
              </mat-form-field>
            </div>

            <!-- Acciones ───────────────────────────────────────────────────── -->
            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
              <button mat-flat-button color="primary" type="submit"
                      [disabled]="form.invalid || saving()">
                @if (saving()) { <mat-spinner diameter="16" /> } @else { Guardar }
              </button>
            </div>

          </form>
        }

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ── Fondo y centrado ────────────────────────────────────────────────────── */
    .page-bg {
      min-height: calc(100vh - 80px);
      background: #f3f4f6;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 32px 16px 48px;
    }

    .form-card {
      width: 100%;
      max-width: 660px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      box-shadow: 0 1px 4px rgba(0,0,0,.07);
      overflow: hidden;
    }

    /* ── Cabecera ────────────────────────────────────────────────────────────── */
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .btn-back { color: #6b7280; flex-shrink: 0; }

    .header-text { display: flex; flex-direction: column; gap: 2px; }

    .form-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #111827;
      line-height: 1.2;
    }

    .context-label {
      margin: 0;
      font-size: 0.75rem;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .ctx-icon { font-size: 13px; width: 13px; height: 13px; color: #007d5c; }

    /* ── Spinner carga ────────────────────────────────────────────────────────── */
    .spinner-center { display: flex; justify-content: center; padding: 40px; }

    /* ── Secciones ───────────────────────────────────────────────────────────── */
    form { padding: 20px 24px; }

    .section-label {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #007d5c;
      margin: 20px 0 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e8f5f0;
    }

    .section-label:first-of-type { margin-top: 0; }

    /* ── Filas y campos ──────────────────────────────────────────────────────── */
    .form-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 0;
    }

    .field-grow { flex: 1; min-width: 140px; }
    .field-full { flex: 1 1 100%; }
    .field-280  { width: 280px; min-width: 160px; }
    .field-180  { width: 180px; min-width: 120px; }
    .field-160  { width: 160px; min-width: 120px; }
    .field-130  { width: 130px; min-width: 100px; }

    /* Reducir altura de los campos */
    mat-form-field { --mat-form-field-container-height: 48px; }

    /* ── Acciones ────────────────────────────────────────────────────────────── */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    /* ── Responsive ──────────────────────────────────────────────────────────── */
    @media (max-width: 599px) {
      .page-bg { padding: 16px 12px 32px; align-items: stretch; }
      .form-card { border-radius: 8px; }
      .card-header { padding: 12px 16px; }
      form { padding: 16px; }
      .form-row { flex-direction: column; }
      .field-grow, .field-full, .field-280,
      .field-180, .field-160, .field-130 { width: 100%; }
      .form-actions { flex-direction: column-reverse; }
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

  roles        = signal<PersonRole[]>([]);
  loadingRoles = signal(true);
  saving       = signal(false);

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

  goBack(): void { history.back(); }
}
