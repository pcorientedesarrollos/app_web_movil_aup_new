import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { VisitasApiService } from '../../../core/services/visitas-api.service';
import { VisitData } from '../../../core/models/visit.model';

@Component({
  selector: 'app-visit-detail',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './visit-detail.component.html',
})
export class VisitDetailComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private visitas = inject(VisitasApiService);

  readonly reporte  = signal<any>(null);
  readonly loading  = signal(true);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params['id'];
    try {
      const res = await this.visitas.getReporteDetalle(id);
      if (res.success) this.reporte.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  get datos(): Partial<VisitData> | null {
    const r = this.reporte();
    if (!r) return null;
    return this.visitas.fromApiReporte(r);
  }

  get estado(): string { return this.reporte()?.estado ?? ''; }
  get fechaVisita(): string { return this.reporte()?.fechaVisita?.split('T')[0] ?? ''; }
  get observacionesInspector(): string | null { return this.reporte()?.observacionesInspector ?? null; }

  get estadoLabel(): string {
    const map: Record<string, string> = {
      REVISADO: 'Revisada', CON_OBSERVACIONES: 'Con observaciones',
      ENVIADO: 'Enviada', BORRADOR: 'Borrador',
    };
    return map[this.estado] ?? this.estado;
  }

  get estadoCls(): string {
    const map: Record<string, string> = {
      REVISADO: 'bg-success-bg text-success',
      CON_OBSERVACIONES: 'bg-error-bg text-error',
      ENVIADO: 'bg-gold/20 text-brown-muted',
      BORRADOR: 'bg-cream-tan text-brown-muted',
    };
    return map[this.estado] ?? 'bg-cream-tan text-brown-muted';
  }

  goBack(): void {
    const apiarioId = this.route.snapshot.queryParams['apiario'];
    if (apiarioId) {
      this.router.navigate(['/visits/apiary', apiarioId]);
    } else {
      this.router.navigate(['/visits']);
    }
  }

  get secciones(): { titulo: string; filas: { label: string; value: string }[] }[] {
    const d = this.datos;
    if (!d) return [];

    const total = (d.colmenasInicial ?? 0) + (d.causasDivisiones ?? 0) + (d.causasNucleos ?? 0);

    return [
      {
        titulo: 'Colmenas',
        filas: [
          { label: 'Tipo de visita',    value: d.tipo === 'RUTINA' ? 'Rutinaria' : 'Inspección' },
          { label: 'Colmenas iniciales', value: String(d.colmenasInicial ?? '—') },
          { label: 'Muerte/Enjambre',   value: d.causasMuerteEnjambre ? 'Sí' : 'No' },
          { label: 'Traslado',          value: d.causasTraslado ? 'Sí' : 'No' },
          { label: 'Divisiones',        value: String(d.causasDivisiones ?? '—') },
          { label: 'Núcleos',           value: String(d.causasNucleos ?? '—') },
          { label: 'Total colmenas',    value: String(total) },
        ],
      },
      {
        titulo: 'Mantenimiento',
        filas: [
          { label: 'Apiario',  value: (d.mantenimientoApiario ?? []).join(', ') || 'Ninguno' },
          { label: 'Equipo',   value: (d.mantenimientoEquipo ?? []).join(', ') || 'Ninguno' },
          ...(d.mantenimientoOtroDesc ? [{ label: 'Otro', value: d.mantenimientoOtroDesc }] : []),
        ],
      },
      {
        titulo: 'Alimentación',
        filas: [
          { label: 'Alimento',        value: d.tipoAlimento || '—' },
          { label: 'Cantidad',        value: d.cantidadAlimento != null ? String(d.cantidadAlimento) : '—' },
          { label: 'Marcos reserva',  value: d.marcosReserva === 'MAS_4' ? '> 4 marcos' : d.marcosReserva === 'MENOS_4' ? '< 4 marcos' : '—' },
          { label: 'Origen miel',     value: d.origenMiel === 'PROPIA' ? 'Propia' : d.origenMiel === 'EXTERNA' ? 'Comprada' : '—' },
        ],
      },
      {
        titulo: 'Varroa',
        filas: [
          { label: 'Tratamiento', value: (d.tratamientoVarroa ?? []).join(', ') || 'Ninguno' },
          ...(d.dosisVarroa ? [{ label: 'Dosis', value: d.dosisVarroa }] : []),
        ],
      },
      {
        titulo: 'Control de plagas',
        filas: [
          { label: 'Plagas',  value: (d.plagasDetectadas ?? []).join(', ') || 'Ninguna' },
          ...(d.metodoControl ? [{ label: 'Método', value: d.metodoControl }] : []),
        ],
      },
      {
        titulo: 'Cera',
        filas: [
          { label: 'Láminas',             value: String(d.ceraLaminas ?? '—') },
          { label: 'Origen',              value: d.origenCera === 'COMPRADA' ? 'Comprada' : d.origenCera === 'MAQUINA' ? 'Máquina propia' : '—' },
          { label: 'Marcos identificados', value: d.marcosIdentificados ? 'Sí' : 'No' },
        ],
      },
      {
        titulo: 'Reinas',
        filas: [
          { label: 'Introducidas', value: String(d.reinasReemplazadas ?? '—') },
          { label: 'Origen',       value: d.origenReina === 'PROPIA' ? 'Propia' : d.origenReina === 'COMPRADA' ? 'Comprada' : d.origenReina === 'CACAHUATERA' ? 'Cacahuatera' : '—' },
        ],
      },
      {
        titulo: 'Cosecha',
        filas: [
          { label: 'Miel', value: d.cosechaMiel ? `Sí — ${d.cosechaMielKg ?? 0} kg` : 'No' },
          { label: 'Cera', value: d.cosechaCera ? `Sí — ${d.cosechaCeraKg ?? 0} kg` : 'No' },
        ],
      },
      {
        titulo: 'Observaciones',
        filas: [
          { label: 'Notas', value: d.notas || '—' },
        ],
      },
    ];
  }
}
