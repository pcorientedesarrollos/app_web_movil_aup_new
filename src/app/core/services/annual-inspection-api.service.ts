import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnnualInspectionRecord,
  AnnualInspectionSummary,
} from '../models/annual-inspection.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AnnualInspectionApiService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/visitas/apicultor/inspeccion-anual`;

  getSummary(): Promise<ApiResponse<AnnualInspectionSummary>> {
    return firstValueFrom(this.http.get<ApiResponse<AnnualInspectionSummary>>(`${this.base}/resumen`));
  }

  getGeneral(): Promise<ApiResponse<AnnualInspectionRecord>> {
    return firstValueFrom(this.http.get<ApiResponse<AnnualInspectionRecord>>(`${this.base}/general`));
  }

  saveGeneral(respuestas: Record<string, unknown>): Promise<ApiResponse<AnnualInspectionRecord>> {
    return firstValueFrom(
      this.http.patch<ApiResponse<AnnualInspectionRecord>>(`${this.base}/general`, { respuestas })
    );
  }

  sendGeneral(): Promise<ApiResponse<AnnualInspectionRecord>> {
    return firstValueFrom(
      this.http.post<ApiResponse<AnnualInspectionRecord>>(`${this.base}/general/enviar`, {})
    );
  }

  getApiary(apiarioId: string): Promise<ApiResponse<AnnualInspectionRecord>> {
    return firstValueFrom(
      this.http.get<ApiResponse<AnnualInspectionRecord>>(`${this.base}/apiarios/${apiarioId}`)
    );
  }

  saveApiary(apiarioId: string, respuestas: Record<string, unknown>): Promise<ApiResponse<AnnualInspectionRecord>> {
    return firstValueFrom(
      this.http.patch<ApiResponse<AnnualInspectionRecord>>(`${this.base}/apiarios/${apiarioId}`, { respuestas })
    );
  }

  sendApiary(apiarioId: string): Promise<ApiResponse<AnnualInspectionRecord>> {
    return firstValueFrom(
      this.http.post<ApiResponse<AnnualInspectionRecord>>(`${this.base}/apiarios/${apiarioId}/enviar`, {})
    );
  }
}
