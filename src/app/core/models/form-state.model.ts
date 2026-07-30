import { VisitData } from './visit.model';

export interface VisitFormState {
  currentStep: number;
  totalSteps: number;
  lastSaved: string | null;
  isDirty: boolean;
  isSubmitting: boolean;
  visitId: string | null;
  reporteId: string | null;
  data: Partial<VisitData>;
}
