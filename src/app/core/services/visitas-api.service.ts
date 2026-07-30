import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { VisitData } from '../models/visit.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VisitasApiService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/visitas`;

  login(username: string, password: string): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.base}/auth/login`, { username, password })
    );
  }

  getPerfil(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.base}/auth/perfil`));
  }

  getVisitaActiva(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.base}/apicultor/visita-activa`));
  }

  getMisReportes(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.base}/apicultor/mis-reportes`));
  }

  getReporteDetalle(id: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.base}/apicultor/mis-reportes/${id}`));
  }

  iniciarReporte(visitaId: string): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.base}/apicultor/reportes`, { visitaId })
    );
  }

  saveReporte(reporteId: string, data: Partial<VisitData>): Promise<any> {
    return firstValueFrom(
      this.http.patch<any>(`${this.base}/apicultor/reportes/${reporteId}`, this.toApiDto(data))
    );
  }

  enviarReporte(reporteId: string): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.base}/apicultor/reportes/${reporteId}/enviar`, {})
    );
  }

  // ── Admin ────────────────────────────────────────────────────────────────
  private readonly adminBase = `${environment.apiUrl}/api/visitas/admin`;

  adminGetApicultores(page = 1, limit = 50, search?: string): Promise<any> {
    const params: any = { page, limit, organica: 'true' };
    if (search) params.search = search;
    return firstValueFrom(this.http.get<any>(`${this.adminBase}/apicultores`, { params }));
  }

  adminGetReportesApicultor(apicultorId: string, page = 1, limit = 50): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(`${this.adminBase}/reportes`, { params: { apicultorId, page, limit } })
    );
  }

  adminGetReporteDetalle(reporteId: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.adminBase}/reportes/${reporteId}`));
  }

  // Frontend VisitData → backend SaveReporteDTO
  toApiDto(data: Partial<VisitData>): Record<string, unknown> {
    const dto: Record<string, unknown> = {};

    if (data.fecha !== undefined) dto['fechaVisita'] = data.fecha;
    if (data.tipo !== undefined) {
      dto['tipoVisitaApicultor'] = data.tipo === 'RUTINA' ? 'RUTINARIA' : data.tipo;
    }
    if (data.apiarios !== undefined) dto['apiariosRevisados'] = data.apiarios;

    if (data.colmenasInicial !== undefined) dto['colmenasAnteriores'] = data.colmenasInicial;
    if (data.colmenasPerdidas !== undefined) dto['bajas'] = data.colmenasPerdidas;
    if (data.colmenasAumentadas !== undefined) dto['altas'] = data.colmenasAumentadas;
    if (data.causasMuerteEnjambre !== undefined) dto['muerteEnjambrazon'] = data.causasMuerteEnjambre;
    if (data.causasTraslado !== undefined) dto['traslado'] = data.causasTraslado;
    if (data.causasDivisiones !== undefined) dto['divisiones'] = data.causasDivisiones;
    if (data.causasNucleos !== undefined) dto['nucleos'] = data.causasNucleos;

    if (data.mantenimientoApiario !== undefined) {
      dto['desyerbe'] = data.mantenimientoApiario.includes('Desyerbe');
      dto['recoleccionBasura'] = data.mantenimientoApiario.includes('Recolección de basura');
      dto['agua'] = data.mantenimientoApiario.includes('Agua');
    }
    if (data.mantenimientoEquipo !== undefined) {
      dto['herramientas'] = data.mantenimientoEquipo.includes('Herramientas');
      dto['banca'] = data.mantenimientoEquipo.includes('Banca');
      dto['extractor'] = data.mantenimientoEquipo.includes('Extractor');
      dto['otroMantenimiento'] = data.mantenimientoEquipo.includes('Otro');
    }
    if (data.mantenimientoOtroDesc !== undefined) dto['otroMantenimientoDesc'] = data.mantenimientoOtroDesc;

    if (data.tipoAlimento !== undefined) dto['queSeAlimento'] = data.tipoAlimento;
    if (data.cantidadAlimento !== undefined) dto['cantidadAlimentacion'] = data.cantidadAlimento;
    if (data.origenMiel !== undefined) {
      dto['origenMiel'] = data.origenMiel === 'EXTERNA' ? 'COMPRADA' : data.origenMiel;
    }
    if (data.marcosReserva !== undefined) dto['marcosReserva'] = data.marcosReserva;

    if (data.tratamientoVarroa !== undefined) {
      dto['varroaTimol'] = data.tratamientoVarroa.includes('Timol');
      dto['varroaAcidoOxalico'] = data.tratamientoVarroa.includes('Ácido oxálico');
      dto['varroaAcidoFormico'] = data.tratamientoVarroa.includes('Ácido fórmico');
      dto['varroaCorteCria'] = data.tratamientoVarroa.includes('Corte de cría de zángano');
    }
    if (data.dosisVarroa !== undefined) dto['varroaDosis'] = data.dosisVarroa;

    if (data.plagasDetectadas !== undefined) {
      dto['plagaXulab'] = data.plagasDetectadas.includes('Xulab (Metarhizium)');
      dto['plagaPec'] = data.plagasDetectadas.includes('PEC');
      dto['plagaPolilla'] = data.plagasDetectadas.includes('Polilla de la cera');
    }
    if (data.metodoControl !== undefined) dto['plagasMetodo'] = data.metodoControl;

    if (data.ceraLaminas !== undefined) dto['ceraLaminas'] = data.ceraLaminas;
    if (data.origenCera !== undefined) {
      dto['ceraOrigen'] = data.origenCera === 'MAQUINA' ? 'MAQUINA_PROPIA' : data.origenCera;
    }
    if (data.marcosIdentificados !== undefined) dto['ceraMarcosIdentificados'] = data.marcosIdentificados;

    if (data.reinasReemplazadas !== undefined) dto['reinasIntroducidas'] = data.reinasReemplazadas;
    if (data.origenReina !== undefined) dto['reinaOrigen'] = data.origenReina;

    if (data.cosechaMiel !== undefined) dto['cosechoMiel'] = data.cosechaMiel;
    if (data.cosechaMielKg !== undefined) dto['kilosMiel'] = data.cosechaMielKg;
    if (data.cosechaCera !== undefined) dto['cosechoCera'] = data.cosechaCera;
    if (data.cosechaCeraKg !== undefined) dto['kilosCera'] = data.cosechaCeraKg;

    if (data.notas !== undefined) dto['notas'] = data.notas;
    if (data.firma !== undefined) dto['firma'] = data.firma;

    return dto;
  }

  // Backend reporte → frontend VisitData
  fromApiReporte(r: any): Partial<VisitData> {
    const d: Partial<VisitData> = {};

    if (r.fechaVisita) d.fecha = r.fechaVisita.split('T')[0];
    if (r.tipoVisitaApicultor) d.tipo = r.tipoVisitaApicultor === 'RUTINARIA' ? 'RUTINA' : 'INSPECCION';
    if (r.apiariosRevisados) d.apiarios = r.apiariosRevisados;

    if (r.colmenasAnteriores != null) d.colmenasInicial = r.colmenasAnteriores;
    if (r.bajas != null) d.colmenasPerdidas = r.bajas;
    if (r.altas != null) d.colmenasAumentadas = r.altas;
    if (r.muerteEnjambrazon != null) d.causasMuerteEnjambre = r.muerteEnjambrazon;
    if (r.traslado != null) d.causasTraslado = r.traslado;
    if (r.divisiones != null) d.causasDivisiones = r.divisiones;
    if (r.nucleos != null) d.causasNucleos = r.nucleos;

    if (r.desyerbe != null) {
      const a: string[] = [];
      if (r.desyerbe) a.push('Desyerbe');
      if (r.recoleccionBasura) a.push('Recolección de basura');
      if (r.agua) a.push('Agua');
      d.mantenimientoApiario = a;
    }
    if (r.herramientas != null) {
      const e: string[] = [];
      if (r.herramientas) e.push('Herramientas');
      if (r.banca) e.push('Banca');
      if (r.extractor) e.push('Extractor');
      if (r.otroMantenimiento) e.push('Otro');
      d.mantenimientoEquipo = e;
    }
    if (r.otroMantenimientoDesc) d.mantenimientoOtroDesc = r.otroMantenimientoDesc;

    if (r.queSeAlimento) d.tipoAlimento = r.queSeAlimento;
    if (r.cantidadAlimentacion != null) d.cantidadAlimento = Number(r.cantidadAlimentacion);
    if (r.origenMiel) d.origenMiel = r.origenMiel === 'COMPRADA' ? 'EXTERNA' : 'PROPIA';
    if (r.marcosReserva) d.marcosReserva = r.marcosReserva;

    if (r.varroaTimol != null) {
      const v: string[] = [];
      if (r.varroaTimol) v.push('Timol');
      if (r.varroaAcidoOxalico) v.push('Ácido oxálico');
      if (r.varroaAcidoFormico) v.push('Ácido fórmico');
      if (r.varroaCorteCria) v.push('Corte de cría de zángano');
      d.tratamientoVarroa = v;
    }
    if (r.varroaDosis) d.dosisVarroa = r.varroaDosis;

    if (r.plagaXulab != null) {
      const p: string[] = [];
      if (r.plagaXulab) p.push('Xulab (Metarhizium)');
      if (r.plagaPec) p.push('PEC');
      if (r.plagaPolilla) p.push('Polilla de la cera');
      d.plagasDetectadas = p;
    }
    if (r.plagasMetodo) d.metodoControl = r.plagasMetodo;

    if (r.ceraLaminas != null) d.ceraLaminas = r.ceraLaminas;
    if (r.ceraOrigen) d.origenCera = r.ceraOrigen === 'MAQUINA_PROPIA' ? 'MAQUINA' : 'COMPRADA';
    if (r.ceraMarcosIdentificados != null) d.marcosIdentificados = r.ceraMarcosIdentificados;

    if (r.reinasIntroducidas != null) d.reinasReemplazadas = r.reinasIntroducidas;
    if (r.reinaOrigen) d.origenReina = r.reinaOrigen;

    if (r.cosechoMiel != null) d.cosechaMiel = r.cosechoMiel;
    if (r.kilosMiel != null) d.cosechaMielKg = Number(r.kilosMiel);
    if (r.cosechoCera != null) d.cosechaCera = r.cosechoCera;
    if (r.kilosCera != null) d.cosechaCeraKg = Number(r.kilosCera);

    if (r.notas) d.notas = r.notas;
    if (r.firma) d.firma = r.firma;

    return d;
  }
}
