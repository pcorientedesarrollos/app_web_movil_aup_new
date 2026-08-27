export type AnnualInspectionStatus = 'PENDIENTE' | 'BORRADOR' | 'ENVIADO' | 'REVISADO' | 'CON_OBSERVACIONES';

export interface AnnualInspectionRecord {
  id: string | null;
  anio: number;
  estado: AnnualInspectionStatus;
  versionFormulario: string;
  datosIdentificacion: Record<string, string | number>;
  respuestas: Record<string, unknown>;
  fechaEnvio: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AnnualInspectionApiarySummary {
  id: string;
  nombre: string;
  colmenas: number;
  formularioId: string | null;
  estado: AnnualInspectionStatus;
  habilitado: boolean;
  updatedAt: string | null;
  fechaEnvio: string | null;
}

export interface AnnualInspectionSummary {
  anio: number;
  versionFormulario: string;
  elegible: boolean;
  habilitado: boolean;
  iniciadoAt: string | null;
  general: {
    id: string | null;
    estado: AnnualInspectionStatus;
    updatedAt: string | null;
    fechaEnvio: string | null;
  };
  apiariosHabilitados: boolean;
  apiarios: AnnualInspectionApiarySummary[];
}

export type AnnualQuestionType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'radio'
  | 'checkbox'
  | 'boolean'
  | 'signature';

export interface AnnualQuestion {
  key: string;
  label: string;
  type: AnnualQuestionType;
  options?: string[];
  required?: boolean;
  mustBeTrue?: boolean;
  suffix?: string;
  placeholder?: string;
}

export interface AnnualQuestionSection {
  title: string;
  eyebrow?: string;
  questions: AnnualQuestion[];
}
