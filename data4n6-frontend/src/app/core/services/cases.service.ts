import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CaseStatusRef {
  id: string;
  name: string;
  color: string;
}

export interface CaseOutcomeRef {
  id: string;
  name: string;
}

export interface CaseSummary {
  id: string;
  code: string;
  title: string;
  status: CaseStatusRef;
  classificationLevelId: string | null;
  createdAt: string;
}

export interface CaseDetail {
  id: string;
  code: string;
  title: string;
  description: string;
  status: CaseStatusRef;
  classificationLevelId: string | null;
  outcome: CaseOutcomeRef | null;
  closedDate: string | null;
  outcomeNotes: string | null;
  retentionCategory: string | null;
  retentionReviewDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CaseStatusOption {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

export interface CaseLevelOption {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

export interface CaseOutcomeOption {
  id: string;
  name: string;
  active: boolean;
}

export interface CaseRequest {
  title: string;
  description?: string;
  statusId: string;
  classificationLevelId?: string;
  outcomeId?: string;
  closedDate?: string;
  outcomeNotes?: string;
  retentionReviewDate?: string;
  retentionCategory?: string;
}

@Injectable({ providedIn: 'root' })
export class CasesService {
  private readonly api = inject(ApiService);

  findAll(): Observable<CaseSummary[]> {
    return this.api.get<CaseSummary[]>('/cases');
  }

  findById(id: string): Observable<CaseDetail> {
    return this.api.get<CaseDetail>(`/cases/${id}`);
  }

  create(request: CaseRequest): Observable<CaseDetail> {
    return this.api.post<CaseDetail>('/cases', request);
  }

  update(id: string, request: CaseRequest): Observable<CaseDetail> {
    return this.api.put<CaseDetail>(`/cases/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`/cases/${id}`);
  }

  getStatuses(): Observable<CaseStatusOption[]> {
    return this.api.get<CaseStatusOption[]>('/case-statuses');
  }

  getLevels(): Observable<CaseLevelOption[]> {
    return this.api.get<CaseLevelOption[]>('/case-levels');
  }

  getOutcomes(): Observable<CaseOutcomeOption[]> {
    return this.api.get<CaseOutcomeOption[]>('/case-outcomes');
  }
}
