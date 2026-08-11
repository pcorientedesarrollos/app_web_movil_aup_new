import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import { VisitasApiService } from '../../../core/services/visitas-api.service';
import { VisitaDeApiario } from '../../../core/models/visit.model';

@Component({
  selector: 'app-apiary-visits',
  standalone: true,
  imports: [NgClass],
  templateUrl: './apiary-visits.component.html',
})
export class ApiaryVisitsComponent implements OnInit {
  private visitas = inject(VisitasApiService);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);

  readonly visitas$        = signal<VisitaDeApiario[]>([]);
  readonly loading         = signal(true);
  readonly confirmandoId   = signal<string | null>(null);
  readonly limpiando       = signal(false);

  readonly apiarioId     = this.route.snapshot.params['id'] as string;
  readonly nombreApiario = (this.route.snapshot.queryParams['nombre'] ?? 'Apiario') as string;

  async ngOnInit(): Promise<void> {
    try {
      const res = await this.visitas.getVisitasApiario(this.apiarioId);
      if (res.success && Array.isArray(res.data)) {
        this.visitas$.set(res.data);
      }
    } finally {
      this.loading.set(false);
    }
  }

  openVisita(v: VisitaDeApiario): void {
    if (v.estado === 'BORRADOR' || v.estado === 'SIN_REPORTE') {
      this.router.navigate(['/form'], { queryParams: { visitaId: v.visitaId } });
    } else if (v.reporteId) {
      this.router.navigate(['/visits', v.reporteId], { queryParams: { apiario: this.apiarioId } });
    }
  }

  confirmLimpiar(reporteId: string): void {
    this.confirmandoId.set(reporteId);
  }

  cancelLimpiar(): void {
    this.confirmandoId.set(null);
  }

  async limpiarBorrador(reporteId: string): Promise<void> {
    this.limpiando.set(true);
    try {
      await this.visitas.limpiarBorrador(reporteId);
      const res = await this.visitas.getVisitasApiario(this.apiarioId);
      if (res.success && Array.isArray(res.data)) {
        this.visitas$.set(res.data);
      }
    } catch {
      // stay on page
    } finally {
      this.limpiando.set(false);
      this.confirmandoId.set(null);
    }
  }

  goBack(): void {
    this.router.navigate(['/visits']);
  }

  getStatusConfig(estado: string): { label: string; cls: string } {
    const map: Record<string, { label: string; cls: string }> = {
      REVISADO:          { label: 'Revisada',          cls: 'bg-success-bg text-success' },
      CON_OBSERVACIONES: { label: 'Con observaciones', cls: 'bg-error-bg text-error' },
      ENVIADO:           { label: 'Enviada',            cls: 'bg-gold/20 text-brown-muted' },
      BORRADOR:          { label: 'Borrador',           cls: 'bg-cream-tan text-brown-muted' },
      SIN_REPORTE:       { label: 'Sin reporte',        cls: 'bg-cream-tan text-brown-muted' },
    };
    return map[estado] ?? { label: estado, cls: 'bg-cream-tan text-brown-muted' };
  }

  tipoLabel(tipo: string): string {
    return tipo === 'RUTINARIA' ? 'Rutinaria' : tipo === 'INSPECCION' ? 'Inspección' : tipo;
  }

  formatFecha(fecha: string): string {
    const d = new Date(fecha + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
