export type VisitStatus = 'PENDIENTE' | 'COMPLETADA' | 'BORRADOR' | 'CON_OBSERVACIONES' | 'REVISADA';
export type VisitType   = 'RUTINA' | 'INSPECCION';

export type EstadoReporte = 'BORRADOR' | 'ENVIADO' | 'REVISADO' | 'CON_OBSERVACIONES';

export interface Visit {
  id: string;
  apicultorId: string;
  apiaryId: string;
  apiaryNombre: string;
  fechaVisita: string;
  tipo: VisitType;
  status: VisitStatus;
  mes: string;
  anio: number;
  createdAt: string;
  inspectorNotas?: string;
  datos?: VisitData;
}

export interface PendingVisit {
  id: string;
  mes: string;
  anio: number;
  diasRestantes: number;
  apiaries: string[];
}

export interface VisitaActivaResponse {
  id: string;
  fecha: string;
  tipoVisita: 'RUTINARIA' | 'INSPECCION';
  observaciones?: string;
  estado: 'ACTIVA' | 'CERRADA';
  reporte: {
    id: string;
    estado: EstadoReporte;
  } | null;
}

export interface MiReporteItem {
  id: string;
  visitaId: string;
  estado: EstadoReporte;
  fechaVisita?: string;
  tipoVisitaApicultor?: 'RUTINARIA' | 'INSPECCION';
  observacionesInspector?: string;
  fechaEnvio?: string;
  createdAt: string;
}

export interface VisitData {
  fecha: string;
  tipo: VisitType;
  apiarios: string[];
  colmenasInicial: number;
  colmenasPerdidas: number;
  colmenasAumentadas: number;
  colmenasFinal: number;
  causasMuerteEnjambre: number;
  causasTraslado: number;
  causasDivisiones: number;
  causasNucleos: number;
  mantenimientoApiario: string[];
  mantenimientoEquipo: string[];
  mantenimientoOtroDesc: string;
  tipoAlimento: string;
  cantidadAlimento: number;
  origenMiel: 'PROPIA' | 'EXTERNA';
  marcosReserva: 'MAS_4' | 'MENOS_4';
  tratamientoVarroa: string[];
  dosisVarroa: string;
  plagasDetectadas: string[];
  metodoControl: string;
  ceraLaminas: number;
  origenCera: 'COMPRADA' | 'MAQUINA';
  marcosIdentificados: boolean;
  reinasReemplazadas: number;
  origenReina: 'PROPIA' | 'COMPRADA' | 'CACAHUATERA';
  cosechaMiel: boolean;
  cosechaMielKg: number;
  cosechaCera: boolean;
  cosechaCeraKg: number;
  notas: string;
  firma: string;
}
