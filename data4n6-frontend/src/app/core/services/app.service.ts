import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { App } from '../models/app.model';

@Injectable({ providedIn: 'root' })
export class AppService {
  private readonly api = inject(ApiService);

  getByName(name: string): Observable<App> {
    return this.api.get<App>(`/catalog/apps/${name}`);
  }
}
