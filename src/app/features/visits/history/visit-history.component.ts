import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { BottomNavComponent } from '../../../shared/bottom-nav/bottom-nav.component';
import { VisitasApiService } from '../../../core/services/visitas-api.service';
import { MiReporteItem } from '../../../core/models/visit.model';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

@Component({
  selector: 'app-visit-history',
  standalone: true,
  imports: [RouterLink, DatePipe, NgClass, BottomNavComponent],
  templateUrl: './visit-history.component.html',
})
export class VisitHistoryComponent implements OnInit {
  private visitas = inject(VisitasApiService);

  readonly reportes = signal<MiReporteItem[]>([]);
  readonly loading  = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const res = await this.visitas.getMisReportes();
      if (res.success && Array.isArray(res.data)) {
        this.reportes.set(res.data);
      }
    } finally {
      this.loading.set(false);
    }
  }

  getStatusConfig(estado: string): { label: string; cls: string } {
    const map: Record<string, { label: string; cls: string }> = {
      REVISADO:          { label: 'Revisada',          cls: 'bg-success-bg text-success' },
      CON_OBSERVACIONES: { label: 'Con observaciones', cls: 'bg-error-bg text-error' },
      ENVIADO:           { label: 'Enviada',            cls: 'bg-gold/20 text-brown-muted' },
      BORRADOR:          { label: 'Borrador',           cls: 'bg-cream-tan text-brown-muted' },
    };
    return map[estado] ?? { label: estado, cls: 'bg-cream-tan text-brown-muted' };
  }

  tipoLabel(tipo?: string): string {
    return tipo === 'RUTINARIA' ? 'Rutinaria' : tipo === 'INSPECCION' ? 'Inspección' : '—';
  }

  mesCorto(fecha?: string): string {
    if (!fecha) return '—';
    const m = new Date(fecha).getMonth();
    return MESES[m]?.substring(0, 3) ?? '—';
  }

  mesCompleto(fecha?: string): string {
    if (!fecha) return '—';
    return MESES[new Date(fecha).getMonth()] ?? '—';
  }

  anio(fecha?: string): number | string {
    if (!fecha) return '—';
    return new Date(fecha).getFullYear();
  }
}
