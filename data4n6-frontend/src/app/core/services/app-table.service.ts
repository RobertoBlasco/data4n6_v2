import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppTable } from '../models/app-table.model';
import { TableField } from '../models/table-field.model';

@Injectable({ providedIn: 'root' })
export class AppTableService {
  private readonly api = inject(ApiService);
  private readonly fieldsCache = new Map<string, Observable<TableField[]>>();

  getAll(): Observable<AppTable[]> {
    return this.api.get<AppTable[]>('/catalog/app-tables');
  }

  getBySection(seccion: string): Observable<AppTable[]> {
    return this.api.get<AppTable[]>(`/catalog/app-tables?seccion=${encodeURIComponent(seccion)}`);
  }

  getByTableName(tableName: string): Observable<AppTable> {
    return this.api.get<AppTable>(`/catalog/app-tables/${tableName}`);
  }

  getFieldsByTableId(tableId: string): Observable<TableField[]> {
    return this.api.get<TableField[]>(`/catalog/table-fields?tableId=${tableId}`);
  }

  getFieldsByTableName(tableName: string): Observable<TableField[]> {
    if (!this.fieldsCache.has(tableName)) {
      const req$ = this.getByTableName(tableName).pipe(
        switchMap(meta => this.getFieldsByTableId(meta.id)),
        shareReplay(1)
      );
      this.fieldsCache.set(tableName, req$);
    }
    return this.fieldsCache.get(tableName)!;
  }

  // Strips the leading /api/v1 prefix so the path can be used with ApiService
  resolveEndpointPath(endpointBase: string): string {
    return endpointBase.replace(/^\/api\/v1/, '');
  }
}
