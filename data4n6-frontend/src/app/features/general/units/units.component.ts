import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CaseSummary } from '../../../core/services/cases.service';

interface UnitNode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  children: UnitNode[];
}

interface FlatUnit {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

interface StatusCount { id: string; name: string; color: string; count: number; }
interface UnitStats   { totalCases: number; byStatus: StatusCount[]; }
interface PersonSummary {
  id: string; firstName: string; lastName: string;
  nationalId: string | null; roleName: string; roleCode: string;
}

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatTreeModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTableModule, MatTabsModule,
  ],
  template: `
    <h1 class="page-title">Unidades</h1>

    <div class="split-layout">

      <!-- Árbol izquierdo -->
      <div class="tree-panel">
        @if (loadingTree()) {
          <div class="spinner-center"><mat-spinner diameter="36" /></div>
        } @else {
          <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="unit-tree">

            <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding matTreeNodePaddingIndent="20">
              <button mat-icon-button disabled></button>
              <span class="unit-code">{{ node.code }}</span>
              <span class="tree-label" [class.selected]="selected()?.id === node.id"
                    (click)="selectUnit(node)">{{ node.name }}</span>
            </mat-tree-node>

            <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
              <div class="mat-tree-node">
                <button mat-icon-button matTreeNodeToggle>
                  <mat-icon>{{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}</mat-icon>
                </button>
                <span class="unit-code">{{ node.code }}</span>
                <span class="tree-label tree-label-parent" [class.selected]="selected()?.id === node.id"
                      (click)="selectUnit(node)">{{ node.name }}</span>
              </div>
              <div [class.hidden]="!treeControl.isExpanded(node)" role="group">
                <ng-container matTreeNodeOutlet />
              </div>
            </mat-nested-tree-node>

          </mat-tree>
        }
      </div>

      <!-- Panel derecho -->
      <div class="detail-panel">
        @if (!selected()) {
          <div class="empty-state">
            <mat-icon>account_tree</mat-icon>
            <p>Selecciona una unidad para ver su información</p>
          </div>
        } @else {
          <div class="detail-header">
            <span class="unit-code-lg">{{ selected()!.code }}</span>
            <h2 class="detail-title">{{ selected()!.name }}</h2>
          </div>

          @if (loadingRight()) {
            <div class="spinner-center"><mat-spinner diameter="36" /></div>
          } @else {
            <mat-tab-group animationDuration="150ms" class="detail-tabs">

              <!-- Tab Resumen -->
              <mat-tab label="Resumen">
                <div class="tab-content">
                  <div class="stats-row">
                    <div class="stat-card stat-total">
                      <span class="stat-number">{{ stats()!.totalCases }}</span>
                      <span class="stat-label">casos asignados</span>
                    </div>
                    @for (s of stats()!.byStatus; track s.id) {
                      <div class="stat-card">
                        <span class="stat-number" [style.color]="s.color">{{ s.count }}</span>
                        <span class="stat-label">
                          <span class="status-dot" [style.background-color]="s.color"></span>
                          {{ s.name }}
                        </span>
                      </div>
                    }
                    @if (stats()!.byStatus.length === 0) {
                      <p class="no-items">Sin casos asignados</p>
                    }
                  </div>
                  @if (selected()!.description) {
                    <p class="unit-desc">{{ selected()!.description }}</p>
                  }
                </div>
              </mat-tab>

              <!-- Tab Personas -->
              <mat-tab>
                <ng-template mat-tab-label>
                  Personas
                  @if (persons().length > 0) {
                    <span class="tab-badge">{{ persons().length }}</span>
                  }
                </ng-template>
                <div class="tab-content">
                  <div class="tab-actions">
                    <button mat-stroked-button class="btn-add" (click)="newPerson()">
                      <mat-icon>person_add</mat-icon> Nueva persona
                    </button>
                  </div>
                  <div class="table-scroll">
                    <table mat-table [dataSource]="persons()" class="full-width striped">
                      <ng-container matColumnDef="name">
                        <th mat-header-cell *matHeaderCellDef>Nombre</th>
                        <td mat-cell *matCellDef="let p">{{ p.lastName }}, {{ p.firstName }}</td>
                      </ng-container>
                      <ng-container matColumnDef="nationalId">
                        <th mat-header-cell *matHeaderCellDef>NIF/DNI</th>
                        <td mat-cell *matCellDef="let p">{{ p.nationalId ?? '—' }}</td>
                      </ng-container>
                      <ng-container matColumnDef="role">
                        <th mat-header-cell *matHeaderCellDef>Rol</th>
                        <td mat-cell *matCellDef="let p">
                          <span class="role-chip">{{ p.roleName }}</span>
                        </td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="personColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: personColumns;"></tr>
                      <tr class="mat-mdc-row" *matNoDataRow>
                        <td class="mat-mdc-cell no-data-cell" [attr.colspan]="personColumns.length">
                          No hay personas vinculadas a esta unidad
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </mat-tab>

              <!-- Tab Casos -->
              <mat-tab>
                <ng-template mat-tab-label>
                  Casos
                  @if (cases().length > 0) {
                    <span class="tab-badge">{{ cases().length }}</span>
                  }
                </ng-template>
                <div class="tab-content">
                  <div class="table-scroll">
                    <table mat-table [dataSource]="cases()" class="full-width striped">
                      <ng-container matColumnDef="code">
                        <th mat-header-cell *matHeaderCellDef>Nº Exp.</th>
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
                      <tr mat-header-row *matHeaderRowDef="caseColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: caseColumns;"></tr>
                      <tr class="mat-mdc-row" *matNoDataRow>
                        <td class="mat-mdc-cell no-data-cell" [attr.colspan]="caseColumns.length">
                          No hay casos asignados a esta unidad
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </mat-tab>

            </mat-tab-group>
          }
        }
      </div>

    </div>
  `,
  styles: [`
    .page-title { margin: 0 0 20px; font-size: 1.5rem; color: #01603e; }

    /* Layout */
    .split-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 0;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
      overflow: hidden;
      min-height: 520px;
    }

    /* Árbol */
    .tree-panel {
      border-right: 1px solid #e5e7eb;
      background: #fafafa;
      overflow-y: auto;
      padding: 8px 0;
    }

    .unit-tree { background: transparent; }

    .unit-code {
      font-size: 0.72rem; font-weight: 700; color: #007d5c;
      background: #e8f5f0; padding: 1px 6px; border-radius: 4px;
      margin-right: 6px; white-space: nowrap;
    }

    .tree-label {
      cursor: pointer; padding: 3px 6px; border-radius: 4px;
      font-size: 0.875rem; color: #374151; flex: 1;
    }
    .tree-label:hover { background: #e8f5f0; color: #007d5c; }
    .tree-label.selected { background: #007d5c; color: #fff; font-weight: 500; }
    .tree-label-parent { font-weight: 500; }
    .hidden { display: none; }

    /* Panel detalle */
    .detail-panel { display: flex; flex-direction: column; overflow: hidden; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; flex: 1; gap: 8px; color: #9ca3af; padding: 48px;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }

    .spinner-center { display: flex; justify-content: center; padding: 40px; }

    /* Header del detalle */
    .detail-header {
      display: flex; align-items: center; gap: 10px;
      padding: 16px 20px 0;
      border-bottom: 1px solid #e5e7eb;
      flex-shrink: 0;
    }

    .unit-code-lg {
      font-size: 0.8rem; font-weight: 700; color: #007d5c;
      background: #e8f5f0; padding: 3px 10px; border-radius: 4px;
    }

    .detail-title { margin: 0 0 12px; font-size: 1.05rem; color: #111827; font-weight: 600; }

    /* Tabs */
    .detail-tabs { flex: 1; overflow: hidden; }

    .tab-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: #007d5c; color: #fff;
      font-size: 0.7rem; font-weight: 700; border-radius: 9px;
      margin-left: 6px; line-height: 1;
    }

    .tab-content { padding: 20px; }

    .tab-actions { display: flex; justify-content: flex-end; margin-bottom: 12px; }

    .btn-add {
      font-size: 0.8rem; height: 30px; padding: 0 10px;
      color: #007d5c; border-color: #007d5c;
    }
    .btn-add mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; vertical-align: middle; }

    /* Stats */
    .stats-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }

    .stat-card {
      display: flex; flex-direction: column; align-items: center;
      padding: 14px 20px; border: 1px solid #e5e7eb; border-radius: 8px;
      min-width: 90px; background: #fafafa;
    }

    .stat-total { border-color: #007d5c; background: #f0faf7; }

    .stat-number { font-size: 1.8rem; font-weight: 700; color: #007d5c; line-height: 1; }
    .stat-total .stat-number { color: #007d5c; }

    .stat-label {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.72rem; color: #6b7280; margin-top: 4px;
      text-align: center;
    }

    .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

    .unit-desc { font-size: 0.875rem; color: #6b7280; margin: 0; }

    /* Tablas */
    .table-scroll { overflow-x: auto; }
    .full-width { width: 100%; }

    .striped tr.mat-mdc-row:nth-child(even) td { background: #f7faf9; }
    .striped tr.mat-mdc-row:nth-child(odd)  td { background: #ffffff; }
    .striped tr.mat-mdc-row:hover           td { background: #e8f5f0 !important; }

    .no-data-cell {
      padding: 16px !important; color: #9ca3af;
      font-style: italic; font-size: 0.875rem; text-align: center;
    }

    .no-items { color: #6b7280; font-style: italic; margin: 0; font-size: 0.875rem; }

    .role-chip {
      display: inline-block; padding: 1px 8px; border-radius: 10px;
      background: #e8f5f0; color: #007d5c; font-size: 0.78rem; font-weight: 500;
    }

    .case-link { color: #007d5c; text-decoration: none; font-weight: 500; }
    .case-link:hover { text-decoration: underline; }

    .status-chip {
      display: inline-block; padding: 2px 10px; border-radius: 12px;
      color: #fff; font-size: 0.78rem; font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 767px) {
      .split-layout { grid-template-columns: 1fr; min-height: unset; }
      .tree-panel { border-right: none; border-bottom: 1px solid #e5e7eb; max-height: 200px; }
    }
  `],
})
export class UnitsComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly router = inject(Router);

  treeControl = new NestedTreeControl<UnitNode>(node => node.children);
  dataSource  = new MatTreeNestedDataSource<UnitNode>();

  loadingTree  = signal(true);
  loadingRight = signal(false);
  selected     = signal<UnitNode | null>(null);
  stats        = signal<UnitStats | null>(null);
  persons      = signal<PersonSummary[]>([]);
  cases        = signal<CaseSummary[]>([]);

  personColumns = ['name', 'nationalId', 'role'];
  caseColumns   = ['code', 'title', 'status', 'createdAt'];

  hasChild = (_: number, node: UnitNode) => node.children.length > 0;

  ngOnInit(): void {
    this.api.get<FlatUnit[]>('/units').subscribe({
      next: flat => {
        this.dataSource.data = this.buildTree(flat);
        this.treeControl.dataNodes = this.dataSource.data;
        this.treeControl.expandAll();
        this.loadingTree.set(false);
      },
      error: () => this.loadingTree.set(false),
    });
  }

  selectUnit(node: UnitNode): void {
    this.selected.set(node);
    this.stats.set(null);
    this.persons.set([]);
    this.cases.set([]);
    this.loadingRight.set(true);

    forkJoin({
      stats:   this.api.get<UnitStats>(`/units/${node.id}/stats`),
      persons: this.api.get<PersonSummary[]>(`/units/${node.id}/persons`),
      cases:   this.api.get<CaseSummary[]>(`/units/${node.id}/cases`),
    }).subscribe({
      next: ({ stats, persons, cases }) => {
        this.stats.set(stats);
        this.persons.set(persons);
        this.cases.set(cases);
        this.loadingRight.set(false);
      },
      error: () => this.loadingRight.set(false),
    });
  }

  newPerson(): void {
    const unit = this.selected()!;
    this.router.navigate(['/data4n6/general/persons/new'], {
      state: { tableName: 't200_units', recordId: unit.id, contextName: unit.name },
    });
  }

  private buildTree(flat: FlatUnit[]): UnitNode[] {
    const map = new Map<string, UnitNode>();
    flat.forEach(u => map.set(u.id, { ...u, children: [] }));
    const roots: UnitNode[] = [];
    flat.forEach(u => {
      const node = map.get(u.id)!;
      if (u.parentId) { map.get(u.parentId)?.children.push(node); }
      else             { roots.push(node); }
    });
    return roots;
  }
}
