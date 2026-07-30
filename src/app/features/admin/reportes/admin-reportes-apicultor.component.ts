import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { VisitasApiService } from '../../../core/services/visitas-api.service';

interface ReporteItem {
  id: string;
  apicultorId: string;
  visitaId: string;
  estado: 'BORRADOR' | 'ENVIADO' | 'REVISADO' | 'CON_OBSERVACIONES';
  fechaVisita: string | null;
  tipoVisitaApicultor: 'RUTINARIA' | 'INSPECCION' | null;
  fechaEnvio: string | null;
  createdAt: string;
  apicultor?: { codigo: string; nombreCompleto: string };
  visita?: { fecha: string; tipoVisita: string };
}

@Component({
  selector: 'app-admin-reportes-apicultor',
  standalone: true,
  imports: [NgClass],
  templateUrl: './admin-reportes-apicultor.component.html',
})
export class AdminReportesApicultorComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private visitas = inject(VisitasApiService);

  readonly loading    = signal(true);
  readonly reportes   = signal<ReporteItem[]>([]);
  readonly errorMsg   = signal('');
  readonly nombre     = signal('');
  readonly totalAnual = 24;

  readonly apicultorId = this.route.snapshot.paramMap.get('id')!;

  get completados(): number {
    const anio = new Date().getFullYear();
    return this.reportes().filter(r => {
      const fecha = r.fechaVisita ?? r.createdAt;
      const mismoAnio = fecha ? new Date(fecha).getFullYear() === anio : true;
      return mismoAnio && (r.estado === 'ENVIADO' || r.estado === 'REVISADO' || r.estado === 'CON_OBSERVACIONES');
    }).length;
  }

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.visitas.adminGetReportesApicultor(this.apicultorId, 1, 100);
      if (res.success) {
        const data: ReporteItem[] = res.data ?? [];
        this.reportes.set(data);
        if (data.length > 0 && data[0].apicultor) {
          this.nombre.set(data[0].apicultor.nombreCompleto);
        }
      }
    } catch {
      this.errorMsg.set('Error al cargar reportes. Verifica tu sesión.');
    } finally {
      this.loading.set(false);
    }
  }

  verDetalle(reporteId: string): void {
    this.router.navigate(['/admin/reporte', reporteId]);
  }

  volver(): void {
    this.router.navigate(['/admin']);
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      BORRADOR: 'Borrador', ENVIADO: 'Enviado',
      REVISADO: 'Revisado', CON_OBSERVACIONES: 'Con observaciones',
    };
    return map[estado] ?? estado;
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      BORRADOR: 'bg-cream-tan/50 text-brown-muted',
      ENVIADO: 'bg-gold/20 text-brown',
      REVISADO: 'bg-success-bg text-success',
      CON_OBSERVACIONES: 'bg-error-bg text-error',
    };
    return map[estado] ?? 'bg-cream-tan/50 text-brown-muted';
  }

  formatFecha(iso: string | null): string {
    if (!iso) return '—';
    const [y, m, d] = iso.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
