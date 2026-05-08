import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CaseSummary } from '../../../core/services/cases.service';

interface UnitNode {
  id: string; code: string; name: string; description: string | null;
  active: boolean; children: UnitNode[];
}
interface FlatUnit {
  id: string; parentId: string | null; code: string; name: string;
  description: string | null; active: boolean;
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
    MatProgressSpinnerModule, MatTableModule,
  ],
  template: `
    <div #container class="quad-layout"
         [style.grid-template-columns]="gridCols()"
         [style.grid-template-rows]="gridRows()">

      <!-- ① Árbol ──────────────────────────────────────────────────────────── -->
      <div class="panel panel-tree">
        <div class="panel-header">
          <span class="panel-title">Unidades</span>
        </div>
        <div class="panel-body panel-scroll">
          @if (loadingTree()) {
            <div class="spinner-center"><mat-spinner diameter="28" /></div>
          } @else {
            <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="unit-tree">

              <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding matTreeNodePaddingIndent="16">
                <div class="node-row" [class.node-selected]="selected()?.id === node.id"
                     (click)="selectUnit(node)">
                  <span class="node-spacer"></span>
                  <span class="unit-badge" [class.badge-inactive]="!node.active">{{ node.code }}</span>
                  <span class="node-name">{{ node.name }}</span>
                </div>
              </mat-tree-node>

              <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
                <div class="node-row" [class.node-selected]="selected()?.id === node.id"
                     (click)="selectUnit(node)">
                  <button mat-icon-button matTreeNodeToggle class="toggle-btn"
                          (click)="$event.stopPropagation()">
                    <mat-icon class="toggle-icon">
                      {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
                    </mat-icon>
                  </button>
                  <span class="unit-badge" [class.badge-inactive]="!node.active">{{ node.code }}</span>
                  <span class="node-name node-name-bold">{{ node.name }}</span>
                </div>
                <div [class.hidden]="!treeControl.isExpanded(node)" role="group">
                  <ng-container matTreeNodeOutlet />
                </div>
              </mat-nested-tree-node>

            </mat-tree>
          }
        </div>
      </div>

      <!-- Divisor vertical (abarca todas las filas) ───────────────────────── -->
      <div class="resizer resizer-col" (mousedown)="startResizeCol($event)">
        <div class="resizer-dots"></div>
      </div>

      <!-- ② Estadísticas ──────────────────────────────────────────────────── -->
      <div class="panel panel-stats">
        <div class="panel-header">
          <span class="panel-title">Estadísticas</span>
          @if (selected()) {
            <span class="panel-subtitle">{{ selected()!.code }} · {{ selected()!.name }}</span>
          }
        </div>
        <div class="panel-body">
          @if (!selected()) {
            <div class="empty-state">
              <mat-icon class="empty-icon">bar_chart</mat-icon>
              <p class="empty-text">Selecciona una unidad</p>
            </div>
          } @else if (loadingRight()) {
            <div class="spinner-center"><mat-spinner diameter="28" /></div>
          } @else {
            <div class="stats-placeholder">
              <mat-icon>construction</mat-icon>
              <p>Próximamente</p>
            </div>
          }
        </div>
      </div>

      <!-- Divisor horizontal (abarca todas las columnas) ─────────────────── -->
      <div class="resizer resizer-row" (mousedown)="startResizeRow($event)">
        <div class="resizer-dots resizer-dots-h"></div>
      </div>

      <!-- ③ Personas ──────────────────────────────────────────────────────── -->
      <div class="panel panel-persons">
        <div class="panel-header">
          <span class="panel-title">Personas</span>
          @if (selected() && !loadingRight()) {
            <span class="panel-count">{{ persons().length }}</span>
            <button mat-flat-button color="primary" class="btn-new" (click)="newPerson()">
              <mat-icon>person_add</mat-icon> Nueva
            </button>
          }
        </div>
        <div class="panel-body">
          @if (!selected()) {
            <div class="empty-state">
              <mat-icon class="empty-icon">people_outline</mat-icon>
              <p class="empty-text">Selecciona una unidad</p>
            </div>
          } @else if (loadingRight()) {
            <div class="spinner-center"><mat-spinner diameter="28" /></div>
          } @else {
            <div class="table-scroll">
              <table mat-table [dataSource]="persons()" class="full-width striped">
                <ng-container matColumnDef="avatar">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let p" class="avatar-cell">
                    <div class="avatar">{{ initials(p) }}</div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let p">
                    <span class="person-name">{{ p.lastName }}, {{ p.firstName }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Rol</th>
                  <td mat-cell *matCellDef="let p">
                    <span class="role-chip">{{ p.roleName }}</span>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="personColumns; sticky: true"></tr>
                <tr mat-row *matRowDef="let row; columns: personColumns;"></tr>
                <tr class="mat-mdc-row" *matNoDataRow>
                  <td class="mat-mdc-cell no-data-cell" [attr.colspan]="personColumns.length">
                    No hay personas vinculadas a esta unidad
                  </td>
                </tr>
              </table>
            </div>
          }
        </div>
      </div>

      <!-- ④ Casos ─────────────────────────────────────────────────────────── -->
      <div class="panel panel-cases">
        <div class="panel-header">
          <span class="panel-title">Casos</span>
          @if (selected() && !loadingRight()) {
            <span class="panel-count">{{ cases().length }}</span>
          }
        </div>
        <div class="panel-body">
          @if (!selected()) {
            <div class="empty-state">
              <mat-icon class="empty-icon">folder_open</mat-icon>
              <p class="empty-text">Selecciona una unidad</p>
            </div>
          } @else if (loadingRight()) {
            <div class="spinner-center"><mat-spinner diameter="28" /></div>
          } @else {
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
                <tr mat-header-row *matHeaderRowDef="caseColumns; sticky: true"></tr>
                <tr mat-row *matRowDef="let row; columns: caseColumns;"></tr>
                <tr class="mat-mdc-row" *matNoDataRow>
                  <td class="mat-mdc-cell no-data-cell" [attr.colspan]="caseColumns.length">
                    No hay casos asignados a esta unidad
                  </td>
                </tr>
              </table>
            </div>
          }
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { font-family: Roboto, 'Helvetica Neue', sans-serif; }

    /* ── Grid ────────────────────────────────────────────────────────────────── */
    .quad-layout {
      display: grid;
      height: calc(100vh - 130px);
      min-height: 500px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
      background: #fff;
    }

    /* ── Posición de paneles ──────────────────────────────────────────────────── */
    .panel { display: flex; flex-direction: column; overflow: hidden; }

    .panel-tree    { grid-column: 1; grid-row: 1; background: #f9fafb; }
    .panel-stats   { grid-column: 3; grid-row: 1; }
    .panel-persons { grid-column: 1; grid-row: 3; }
    .panel-cases   { grid-column: 3; grid-row: 3; }

    /* ── Resizers ────────────────────────────────────────────────────────────── */
    .resizer {
      background: #e5e7eb;
      display: flex; align-items: center; justify-content: center;
      position: relative; z-index: 10;
      transition: background 0.15s;
    }
    .resizer:hover  { background: #cbd5e1; }
    .resizer:active { background: #007d5c; }
    .resizer::before { content: ''; position: absolute; inset: -4px; }

    .resizer-col {
      grid-column: 2; grid-row: 1 / span 3;
      cursor: col-resize; flex-direction: column;
    }

    .resizer-row {
      grid-column: 1 / span 3; grid-row: 2;
      cursor: row-resize;
    }

    .resizer-dots {
      display: flex; flex-direction: column; gap: 3px; pointer-events: none;
    }
    .resizer-dots::before,
    .resizer-dots::after {
      content: ''; width: 3px; height: 3px;
      background: #9ca3af; border-radius: 50%;
    }
    .resizer:hover .resizer-dots::before,
    .resizer:hover .resizer-dots::after { background: #6b7280; }

    .resizer-dots-h { flex-direction: row; }

    /* ── Panel header ────────────────────────────────────────────────────────── */
    .panel-header {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 12px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
      flex-shrink: 0;
      min-height: 32px;
      font-family: Roboto, 'Helvetica Neue', sans-serif;
    }

    .panel-title {
      font-size: 0.72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.07em;
      color: #6b7280;
    }

    .panel-subtitle {
      font-size: 0.72rem; color: #9ca3af;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
    }

    .panel-count {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: #007d5c; color: #fff;
      font-size: 0.65rem; font-weight: 700; border-radius: 9px;
      margin-left: auto;
    }

    .btn-new {
      font-size: 0.75rem; height: 24px; line-height: 24px;
      padding: 0 8px; margin-left: 6px;
      font-family: Roboto, 'Helvetica Neue', sans-serif;
    }
    .btn-new mat-icon { font-size: 14px; width: 14px; height: 14px; vertical-align: middle; margin-right: 3px; }

    /* ── Panel body ──────────────────────────────────────────────────────────── */
    .panel-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
    .panel-scroll { overflow-y: auto; }

    /* ── Empty / Spinner ─────────────────────────────────────────────────────── */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; flex: 1; gap: 4px; padding: 20px;
    }
    .empty-icon { font-size: 32px; width: 32px; height: 32px; color: #d1d5db; }
    .empty-text { margin: 0; font-size: 0.78rem; color: #9ca3af; }

    .spinner-center { display: flex; justify-content: center; align-items: center; flex: 1; }

    .stats-placeholder {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; flex: 1; gap: 6px; color: #9ca3af;
    }
    .stats-placeholder mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stats-placeholder p { margin: 0; font-size: 0.78rem; }

    /* ── Árbol ───────────────────────────────────────────────────────────────── */
    .unit-tree { background: transparent; }

    .node-row {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 8px 4px 0; cursor: pointer;
      border-left: 3px solid transparent;
      transition: background 0.1s, border-color 0.1s;
      min-height: 30px;
      font-family: Roboto, 'Helvetica Neue', sans-serif;
    }
    .node-row:hover { background: #e8f5f0; border-left-color: #007d5c; }
    .node-row.node-selected { background: #007d5c; border-left-color: #005a44; }
    .node-row.node-selected .node-name { color: #fff; }
    .node-row.node-selected .unit-badge { background: rgba(255,255,255,.2); color: #fff; }
    .node-row.node-selected .toggle-icon { color: rgba(255,255,255,.8); }

    .node-spacer { width: 36px; flex-shrink: 0; }
    .toggle-btn  { flex-shrink: 0; width: 36px; height: 36px; }
    .toggle-icon { font-size: 16px; color: #6b7280; }
    .hidden { display: none; }

    .unit-badge {
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em;
      color: #007d5c; background: #d1fae5;
      padding: 1px 6px; border-radius: 4px; white-space: nowrap; flex-shrink: 0;
    }
    .badge-inactive { color: #9ca3af; background: #f3f4f6; }

    .node-name { font-size: 0.82rem; color: #374151; line-height: 1.3; }
    .node-name-bold { font-weight: 600; }

    /* ── Tablas ──────────────────────────────────────────────────────────────── */
    .table-scroll { overflow: auto; flex: 1; }
    .full-width   { width: 100%; font-family: Roboto, 'Helvetica Neue', sans-serif; }

    .striped tr.mat-mdc-row:nth-child(even) td { background: #f7faf9; }
    .striped tr.mat-mdc-row:nth-child(odd)  td { background: #ffffff; }
    .striped tr.mat-mdc-row:hover           td { background: #e8f5f0 !important; }

    .no-data-cell {
      padding: 20px !important; color: #9ca3af;
      font-style: italic; font-size: 0.82rem; text-align: center;
    }

    .avatar-cell { width: 40px; padding-right: 0 !important; }
    .avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: #007d5c; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.62rem; font-weight: 700;
    }
    .person-name { font-weight: 500; font-size: 0.82rem; color: #111827; }

    .role-chip {
      display: inline-block; padding: 1px 8px; border-radius: 10px;
      background: #d1fae5; color: #065f46; font-size: 0.72rem; font-weight: 500;
    }

    .case-link { color: #007d5c; text-decoration: none; font-weight: 500; font-size: 0.82rem; }
    .case-link:hover { text-decoration: underline; }

    .status-chip {
      display: inline-block; padding: 1px 8px; border-radius: 12px;
      color: #fff; font-size: 0.72rem; font-weight: 500;
    }

    /* ── Responsive ──────────────────────────────────────────────────────────── */
    @media (max-width: 767px) {
      .quad-layout {
        grid-template-columns: 1fr !important;
        grid-template-rows: 180px auto auto auto !important;
        height: auto;
      }
      .resizer { display: none; }
      .panel-tree    { grid-column: 1; grid-row: 1; }
      .panel-stats   { grid-column: 1; grid-row: 2; min-height: 120px; }
      .panel-persons { grid-column: 1; grid-row: 3; min-height: 240px; }
      .panel-cases   { grid-column: 1; grid-row: 4; min-height: 240px; }
    }
  `],
})
export class UnitsComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly router = inject(Router);

  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;

  leftPct = signal(30);
  topPct  = signal(45);
  gridCols = computed(() => `${this.leftPct()}% 5px 1fr`);
  gridRows = computed(() => `${this.topPct()}% 5px 1fr`);

  treeControl = new NestedTreeControl<UnitNode>(node => node.children);
  dataSource  = new MatTreeNestedDataSource<UnitNode>();

  loadingTree  = signal(true);
  loadingRight = signal(false);
  selected     = signal<UnitNode | null>(null);
  stats        = signal<UnitStats | null>(null);
  persons      = signal<PersonSummary[]>([]);
  cases        = signal<CaseSummary[]>([]);

  personColumns = ['avatar', 'name', 'role'];
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
    this.stats.set(null); this.persons.set([]); this.cases.set([]);
    this.loadingRight.set(true);

    forkJoin({
      stats:   this.api.get<UnitStats>(`/units/${node.id}/stats`),
      persons: this.api.get<PersonSummary[]>(`/units/${node.id}/persons`),
      cases:   this.api.get<CaseSummary[]>(`/units/${node.id}/cases`),
    }).subscribe({
      next: ({ stats, persons, cases }) => {
        this.stats.set(stats); this.persons.set(persons); this.cases.set(cases);
        this.loadingRight.set(false);
      },
      error: () => this.loadingRight.set(false),
    });
  }

  startResizeCol(e: MouseEvent): void {
    e.preventDefault();
    const container = this.containerRef.nativeElement;
    const startX = e.clientX;
    const startPct = this.leftPct();

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      this.leftPct.set(Math.round(Math.min(65, Math.max(15, startPct + (delta / container.offsetWidth) * 100))));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  startResizeRow(e: MouseEvent): void {
    e.preventDefault();
    const container = this.containerRef.nativeElement;
    const startY = e.clientY;
    const startPct = this.topPct();

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientY - startY;
      this.topPct.set(Math.round(Math.min(70, Math.max(20, startPct + (delta / container.offsetHeight) * 100))));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  newPerson(): void {
    const unit = this.selected()!;
    this.router.navigate(['/data4n6/general/persons/new'], {
      state: { tableName: 't200_units', recordId: unit.id, contextName: unit.name },
    });
  }

  initials(p: PersonSummary): string {
    return (p.firstName[0] ?? '').toUpperCase() + (p.lastName[0] ?? '').toUpperCase();
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
