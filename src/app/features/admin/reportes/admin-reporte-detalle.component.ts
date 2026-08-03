import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VisitasApiService } from '../../../core/services/visitas-api.service';
import { VisitData } from '../../../core/models/visit.model';

interface SeccionDetalle {
  titulo: string;
  filas: { label: string; value: string }[];
}

@Component({
  selector: 'app-admin-reporte-detalle',
  standalone: true,
  imports: [],
  templateUrl: './admin-reporte-detalle.component.html',
})
export class AdminReporteDetalleComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private visitas = inject(VisitasApiService);

  readonly reporte = signal<any>(null);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params['id'];
    try {
      const res = await this.visitas.adminGetReporteDetalle(id);
      if (res.success) this.reporte.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  volver(): void {
    const apicultorId = this.reporte()?.apicultorId;
    if (apicultorId) {
      this.router.navigate(['/admin/apicultor', apicultorId]);
    } else {
      this.router.navigate(['/admin']);
    }
  }

  get datos(): Partial<VisitData> | null {
    const r = this.reporte();
    if (!r) return null;
    return this.visitas.fromApiReporte(r);
  }

  get estado(): string { return this.reporte()?.estado ?? ''; }
  get fechaVisita(): string { return this.reporte()?.fechaVisita?.split('T')[0] ?? ''; }
  get apicultorNombre(): string { return this.reporte()?.apicultor?.nombreCompleto ?? ''; }
  get observacionesInspector(): string | null { return this.reporte()?.observacionesInspector ?? null; }
  get firma(): string | null { return this.datos?.firma ?? null; }

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

  get secciones(): SeccionDetalle[] {
    const d = this.datos;
    if (!d) return [];
    return [
      {
        titulo: 'Datos de la visita',
        filas: [
          { label: 'Tipo de visita',     value: d.tipo === 'RUTINA' ? 'Rutinaria' : (d.tipo ? 'Inspección' : '—') },
          { label: 'Apiario', value: d.apiarioId ?? '—' },
        ],
      },
      {
        titulo: 'Colmenas',
        filas: [
          { label: 'Colmenas iniciales', value: String(d.colmenasInicial ?? '—') },
          { label: 'Total final',        value: String((d.colmenasInicial ?? 0) + (d.causasDivisiones ?? 0) + (d.causasNucleos ?? 0)) },
          { label: 'Muerte/Enjambre',    value: d.causasMuerteEnjambre ? 'Sí' : 'No' },
          { label: 'Traslado',           value: d.causasTraslado ? 'Sí' : 'No' },
          { label: 'Divisiones',         value: d.causasDivisiones != null ? String(d.causasDivisiones) : '—' },
          { label: 'Núcleos',            value: d.causasNucleos != null ? String(d.causasNucleos) : '—' },
        ],
      },
      {
        titulo: 'Mantenimiento',
        filas: [
          { label: 'Apiario',     value: (d.mantenimientoApiario ?? []).join(', ') || 'Ninguno' },
          { label: 'Equipo',      value: (d.mantenimientoEquipo ?? []).join(', ') || 'Ninguno' },
          { label: 'Descripción', value: d.mantenimientoOtroDesc || '—' },
        ],
      },
      {
        titulo: 'Alimentación',
        filas: [
          { label: 'Tipo alimento',  value: d.tipoAlimento || '—' },
          { label: 'Cantidad',       value: d.cantidadAlimento != null ? `${d.cantidadAlimento} kg` : '—' },
          { label: 'Origen miel',    value: d.origenMiel === 'PROPIA' ? 'Propia' : d.origenMiel === 'EXTERNA' ? 'Externa / Comprada' : '—' },
          { label: 'Marcos reserva', value: d.marcosReserva === 'MAS_4' ? 'Más de 4' : d.marcosReserva === 'MENOS_4' ? 'Menos de 4' : '—' },
        ],
      },
      {
        titulo: 'Tratamiento Varroa',
        filas: [
          { label: 'Tratamientos', value: (d.tratamientoVarroa ?? []).join(', ') || 'Ninguno' },
          { label: 'Dosis',        value: d.dosisVarroa || '—' },
        ],
      },
      {
        titulo: 'Control de Plagas',
        filas: [
          { label: 'Plagas detectadas', value: (d.plagasDetectadas ?? []).join(', ') || 'Ninguna' },
          { label: 'Método control',    value: d.metodoControl || '—' },
        ],
      },
      {
        titulo: 'Cera',
        filas: [
          { label: 'Láminas de cera',      value: d.ceraLaminas != null ? String(d.ceraLaminas) : '—' },
          { label: 'Origen cera',          value: d.origenCera || '—' },
          { label: 'Marcos identificados', value: d.marcosIdentificados != null ? String(d.marcosIdentificados) : '—' },
        ],
      },
      {
        titulo: 'Reinas',
        filas: [
          { label: 'Reinas reemplazadas', value: d.reinasReemplazadas != null ? String(d.reinasReemplazadas) : '—' },
          { label: 'Origen reina',        value: d.origenReina || '—' },
        ],
      },
      {
        titulo: 'Cosecha',
        filas: [
          { label: 'Cosecha miel', value: d.cosechaMiel ? `Sí — ${d.cosechaMielKg ?? 0} kg` : 'No' },
          { label: 'Cosecha cera', value: d.cosechaCera ? `Sí — ${d.cosechaCeraKg ?? 0} kg` : 'No' },
        ],
      },
      {
        titulo: 'Notas',
        filas: [
          { label: 'Observaciones', value: d.notas || 'Sin observaciones' },
        ],
      },
    ];
  }
}
