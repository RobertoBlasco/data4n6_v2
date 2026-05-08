import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { CaseSummary } from '../../../core/services/cases.service';

interface DomainNode {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  children: DomainNode[];
}

interface FlatDomain {
  id: string;
  parentId: string | null;
  name: string;
  description: string | null;
  active: boolean;
}

@Component({
  selector: 'app-case-domains',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatTreeModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTableModule, MatTabsModule,
  ],
  template: `
    <h1 class="page-title">Dominios</h1>

    <div class="split-layout">

      <!-- Árbol izquierdo -->
      <div class="tree-panel">
        @if (loadingTree()) {
          <div class="spinner-center"><mat-spinner diameter="36" /></div>
        } @else {
          <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="domain-tree">

            <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding matTreeNodePaddingIndent="20">
              <button mat-icon-button disabled></button>
              <span class="tree-label" [class.selected]="selected()?.id === node.id"
                    (click)="selectDomain(node)">{{ node.name }}</span>
            </mat-tree-node>

            <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
              <div class="mat-tree-node">
                <button mat-icon-button matTreeNodeToggle>
                  <mat-icon>{{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}</mat-icon>
                </button>
                <span class="tree-label tree-label-parent" [class.selected]="selected()?.id === node.id"
                      (click)="selectDomain(node)">{{ node.name }}</span>
              </div>
              <div [class.hidden]="!treeControl.isExpanded(node)" role="group">
                <ng-container matTreeNodeOutlet />
              </div>
            </mat-nested-tree-node>

          </mat-tree>
        }
      </div>

      <!-- Panel detalle -->
      <div class="detail-panel">
        @if (!selected()) {
          <div class="empty-state">
            <mat-icon>folder_open</mat-icon>
            <p>Selecciona un dominio para ver sus casos</p>
          </div>
        } @else {
          <div class="detail-header">
            <h2 class="detail-title">{{ selected()!.name }}</h2>
            @if (!selected()!.active) {
              <span class="badge-inactive">Inactivo</span>
            }
          </div>

          @if (loadingCases()) {
            <div class="spinner-center"><mat-spinner diameter="36" /></div>
          } @else {
            <mat-tab-group animationDuration="150ms" class="detail-tabs">

              <!-- Tab Resumen -->
              <mat-tab label="Resumen">
                <div class="tab-content">
                  @if (selected()!.description) {
                    <p class="domain-desc">{{ selected()!.description }}</p>
                  } @else {
                    <p class="no-items">Sin descripción</p>
                  }
                  <div class="summary-stat">
                    <span class="stat-number">{{ cases().length }}</span>
                    <span class="stat-label">casos en este dominio</span>
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
                          No hay casos asignados a este dominio
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

    .split-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
      overflow: hidden;
      min-height: 480px;
    }

    /* Árbol */
    .tree-panel {
      border-right: 1px solid #e5e7eb;
      background: #fafafa;
      overflow-y: auto;
      padding: 8px 0;
    }

    .domain-tree { background: transparent; }

    .tree-label {
      cursor: pointer; padding: 4px 8px; border-radius: 4px;
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

    /* Header */
    .detail-header {
      display: flex; align-items: center; gap: 10px;
      padding: 16px 20px 0; flex-shrink: 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-title { margin: 0 0 12px; font-size: 1.05rem; color: #111827; font-weight: 600; }

    .badge-inactive {
      font-size: 0.72rem; background: #f3f4f6; color: #9ca3af;
      padding: 2px 8px; border-radius: 10px; margin-bottom: 12px;
    }

    /* Tabs */
    .detail-tabs { flex: 1; }

    .tab-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: #007d5c; color: #fff;
      font-size: 0.7rem; font-weight: 700; border-radius: 9px;
      margin-left: 6px; line-height: 1;
    }

    .tab-content { padding: 20px; }

    /* Resumen */
    .domain-desc { font-size: 0.875rem; color: #374151; margin: 0 0 20px; }

    .summary-stat {
      display: inline-flex; flex-direction: column; align-items: center;
      padding: 14px 24px; border: 1px solid #007d5c;
      border-radius: 8px; background: #f0faf7;
    }

    .stat-number { font-size: 2rem; font-weight: 700; color: #007d5c; line-height: 1; }
    .stat-label  { font-size: 0.72rem; color: #6b7280; margin-top: 4px; }

    /* Tabla */
    .table-scroll { overflow-x: auto; }
    .full-width   { width: 100%; }

    .striped tr.mat-mdc-row:nth-child(even) td { background: #f7faf9; }
    .striped tr.mat-mdc-row:nth-child(odd)  td { background: #ffffff; }
    .striped tr.mat-mdc-row:hover           td { background: #e8f5f0 !important; }

    .no-data-cell {
      padding: 16px !important; color: #9ca3af;
      font-style: italic; font-size: 0.875rem; text-align: center;
    }

    .no-items { color: #6b7280; font-style: italic; margin: 0; }

    .case-link { color: #007d5c; text-decoration: none; font-weight: 500; }
    .case-link:hover { text-decoration: underline; }

    .status-chip {
      display: inline-block; padding: 2px 10px; border-radius: 12px;
      color: #fff; font-size: 0.78rem; font-weight: 500;
    }

    @media (max-width: 767px) {
      .split-layout { grid-template-columns: 1fr; min-height: unset; }
      .tree-panel { border-right: none; border-bottom: 1px solid #e5e7eb; max-height: 220px; }
    }
  `],
})
export class CaseDomainsComponent implements OnInit {
  private readonly api = inject(ApiService);

  treeControl = new NestedTreeControl<DomainNode>(node => node.children);
  dataSource  = new MatTreeNestedDataSource<DomainNode>();

  loadingTree  = signal(true);
  loadingCases = signal(false);
  selected     = signal<DomainNode | null>(null);
  cases        = signal<CaseSummary[]>([]);
  caseColumns  = ['code', 'title', 'status', 'createdAt'];

  hasChild = (_: number, node: DomainNode) => node.children.length > 0;

  ngOnInit(): void {
    this.api.get<FlatDomain[]>('/case-domains').subscribe({
      next: flat => {
        this.dataSource.data = this.buildTree(flat);
        this.treeControl.dataNodes = this.dataSource.data;
        this.treeControl.expandAll();
        this.loadingTree.set(false);
      },
      error: () => this.loadingTree.set(false),
    });
  }

  selectDomain(node: DomainNode): void {
    this.selected.set(node);
    this.cases.set([]);
    this.loadingCases.set(true);
    this.api.get<CaseSummary[]>(`/case-domains/${node.id}/cases`).subscribe({
      next: data => { this.cases.set(data); this.loadingCases.set(false); },
      error: () => this.loadingCases.set(false),
    });
  }

  private buildTree(flat: FlatDomain[]): DomainNode[] {
    const map = new Map<string, DomainNode>();
    flat.forEach(d => map.set(d.id, { ...d, children: [] }));
    const roots: DomainNode[] = [];
    flat.forEach(d => {
      const node = map.get(d.id)!;
      if (d.parentId) { map.get(d.parentId)?.children.push(node); }
      else             { roots.push(node); }
    });
    return roots;
  }
}
