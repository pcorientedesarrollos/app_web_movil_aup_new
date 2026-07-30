import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VisitasApiService } from '../../../core/services/visitas-api.service';
import { VisitData } from '../../../core/models/visit.model';

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

  get tableRows(): { label: string; value: string }[] {
    const d = this.datos;
    if (!d) return [];
    return [
      { label: 'Tipo de visita',     value: d.tipo === 'RUTINA' ? 'Rutinaria' : 'Inspección' },
      { label: 'Colmenas iniciales', value: String(d.colmenasInicial ?? '—') },
      { label: 'Bajas / Altas',      value: `${d.colmenasPerdidas ?? 0} / ${d.colmenasAumentadas ?? 0}` },
      { label: 'Total colmenas',     value: String((d.colmenasInicial ?? 0) - (d.colmenasPerdidas ?? 0) + (d.colmenasAumentadas ?? 0)) },
      { label: 'Tratamiento varroa', value: (d.tratamientoVarroa ?? []).join(', ') || 'Ninguno' },
      { label: 'Miel cosechada',     value: d.cosechaMiel ? `${d.cosechaMielKg} kg` : 'No' },
      { label: 'Cera (láminas)',     value: String(d.ceraLaminas ?? '—') },
      { label: 'Notas',              value: d.notas || '—' },
    ];
  }
}
