import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OfflineService } from '../../core/services/offline.service';
import { VisitasApiService } from '../../core/services/visitas-api.service';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { OfflineBannerComponent } from '../../shared/offline-banner/offline-banner.component';
import { VisitaActivaResponse, MiReporteItem } from '../../core/models/visit.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, BottomNavComponent, OfflineBannerComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private router  = inject(Router);
  private visitas = inject(VisitasApiService);
  readonly auth    = inject(AuthService);
  readonly offline = inject(OfflineService);

  readonly visitaActiva  = signal<VisitaActivaResponse | null>(null);
  readonly completedCount = signal(0);
  readonly totalMonths    = signal(0);
  readonly loading        = signal(true);

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadVisitaActiva(), this.loadReportes()]);
    this.loading.set(false);
  }

  private async loadVisitaActiva(): Promise<void> {
    try {
      const res = await this.visitas.getVisitaActiva();
      if (res.success && res.data?.visita) {
        this.visitaActiva.set({ ...res.data.visita, reporte: res.data.reporte ?? null });
      }
    } catch {
      this.visitaActiva.set(null);
    }
  }

  private async loadReportes(): Promise<void> {
    try {
      const res = await this.visitas.getMisReportes();
      if (res.success && Array.isArray(res.data)) {
        const reportes: MiReporteItem[] = res.data;
        this.totalMonths.set(reportes.length);
        this.completedCount.set(
          reportes.filter(r => r.estado === 'ENVIADO' || r.estado === 'REVISADO' || r.estado === 'CON_OBSERVACIONES').length
        );
      }
    } catch {
      // stats quedan en 0
    }
  }

  diasRestantes(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    // Parse date-only to avoid UTC→local timezone shift
    const [y, m, d] = fecha.split('T')[0].split('-').map(Number);
    const dest = new Date(y, m - 1, d);
    return Math.ceil((dest.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatFecha(iso: string): string {
    const [y, m, d] = iso.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      BORRADOR: 'Borrador', ENVIADO: 'Enviado',
      REVISADO: 'Revisado', CON_OBSERVACIONES: 'Con observaciones',
    };
    return map[estado] ?? estado;
  }

  getUrgencyClass(fecha: string): string {
    const dias = this.diasRestantes(fecha);
    if (dias < 0)  return 'border-l-4 border-error bg-error-bg';
    if (dias <= 3) return 'border-l-4 border-gold bg-gold/10';
    return 'border border-cream-tan bg-cream-pure';
  }

  startForm(): void {
    const visita = this.visitaActiva();
    if (!visita) return;
    this.router.navigate(['/form'], { queryParams: { visitaId: visita.id } });
  }
}
