import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { VisitFormState } from '../../../../core/models/form-state.model';
import { VisitData } from '../../../../core/models/visit.model';
import { DraftService } from '../../../../core/services/draft.service';
import { OfflineService } from '../../../../core/services/offline.service';
import { VisitasApiService } from '../../../../core/services/visitas-api.service';

const TOTAL_STEPS = 10;
const DRAFT_KEY   = 'visit_draft_current';

const INITIAL_STATE: VisitFormState = {
  currentStep:  0,
  totalSteps:   TOTAL_STEPS,
  lastSaved:    null,
  isDirty:      false,
  isSubmitting: false,
  visitId:      null,
  reporteId:    null,
  data:         {},
};

@Injectable({ providedIn: 'root' })
export class VisitFormStore {
  private draftService = inject(DraftService);
  private offline      = inject(OfflineService);
  private visitas      = inject(VisitasApiService);

  private _state = signal<VisitFormState>({ ...INITIAL_STATE });

  readonly state        = this._state.asReadonly();
  readonly currentStep  = computed(() => this._state().currentStep);
  readonly progressPct  = computed(() => Math.round((this._state().currentStep / (TOTAL_STEPS - 1)) * 100));
  readonly formData     = computed(() => this._state().data);
  readonly isDirty      = computed(() => this._state().isDirty);
  readonly isSubmitting = computed(() => this._state().isSubmitting);
  readonly lastSaved    = computed(() => this._state().lastSaved);
  readonly reporteId    = computed(() => this._state().reporteId);

  readonly hiveCount = computed(() => {
    const d = this._state().data;
    return (d.colmenasInicial ?? 0) - (d.colmenasPerdidas ?? 0) + (d.colmenasAumentadas ?? 0);
  });

  private saveTimeout:    ReturnType<typeof setTimeout> | null = null;
  private apiSaveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      if (this._state().isDirty) {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.persistDraft(), 800);

        if (!this.offline.isOffline() && this._state().reporteId) {
          if (this.apiSaveTimeout) clearTimeout(this.apiSaveTimeout);
          this.apiSaveTimeout = setTimeout(() => this.saveToApi(), 1200);
        }
      }
    });
  }

  private async persistDraft(): Promise<void> {
    await this.draftService.saveDraft(DRAFT_KEY, this._state());
    this._state.update(s => ({ ...s, lastSaved: new Date().toISOString(), isDirty: false }));
  }

  private async saveToApi(): Promise<void> {
    const reporteId = this._state().reporteId;
    if (!reporteId) return;
    try {
      await this.visitas.saveReporte(reporteId, this._state().data);
    } catch {
      // Silently fail — IndexedDB conserva el borrador
    }
  }

  patchData(partial: Partial<VisitData>): void {
    this._state.update(s => ({ ...s, isDirty: true, data: { ...s.data, ...partial } }));
  }

  nextStep(): void {
    this._state.update(s => ({ ...s, currentStep: Math.min(s.currentStep + 1, TOTAL_STEPS - 1) }));
  }

  prevStep(): void {
    this._state.update(s => ({ ...s, currentStep: Math.max(s.currentStep - 1, 0) }));
  }

  goToStep(step: number): void {
    this._state.update(s => ({ ...s, currentStep: step }));
  }

  setSubmitting(val: boolean): void {
    this._state.update(s => ({ ...s, isSubmitting: val }));
  }

  async iniciarReporte(visitaId: string): Promise<void> {
    this._state.update(s => ({ ...s, visitId: visitaId }));
    try {
      const res = await this.visitas.iniciarReporte(visitaId);
      if (res.success && res.data) {
        const reporte = res.data;
        this._state.update(s => ({ ...s, reporteId: reporte.id }));
        if (reporte.estado === 'BORRADOR') {
          const visitData = this.visitas.fromApiReporte(reporte);
          this._state.update(s => ({
            ...s,
            data: { ...visitData },
            lastSaved: reporte.updatedAt ?? null,
          }));
        }
      }
    } catch {
      await this.loadDraft();
    }
  }

  async enviarReporte(): Promise<void> {
    const reporteId = this._state().reporteId;
    if (!reporteId) throw new Error('Sin reporteId activo');
    await this.visitas.enviarReporte(reporteId);
  }

  async loadDraft(): Promise<void> {
    const saved = await this.draftService.getDraft<VisitFormState>(DRAFT_KEY);
    if (saved) {
      this._state.set({ ...saved, isSubmitting: false });
    }
  }

  async clearDraft(): Promise<void> {
    if (this.saveTimeout)    clearTimeout(this.saveTimeout);
    if (this.apiSaveTimeout) clearTimeout(this.apiSaveTimeout);
    await this.draftService.deleteDraft(DRAFT_KEY);
    this._state.set({ ...INITIAL_STATE });
  }
}
