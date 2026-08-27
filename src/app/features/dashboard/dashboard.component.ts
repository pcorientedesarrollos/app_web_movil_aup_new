import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OfflineService } from '../../core/services/offline.service';
import { VisitasApiService } from '../../core/services/visitas-api.service';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { OfflineBannerComponent } from '../../shared/offline-banner/offline-banner.component';
import { ProximaVisita, MiReporteItem } from '../../core/models/visit.model';
import { AnnualInspectionApiService } from '../../core/services/annual-inspection-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, DecimalPipe, BottomNavComponent, OfflineBannerComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private router  = inject(Router);
  private visitas = inject(VisitasApiService);
  private annualInspection = inject(AnnualInspectionApiService);
  readonly auth    = inject(AuthService);
  readonly offline = inject(OfflineService);

  readonly proximasVisitas = signal<ProximaVisita[]>([]);
  readonly completedCount  = signal(0);
  readonly totalAnual      = 24;
  readonly currentYear     = new Date().getFullYear();
  readonly annualEnabled   = signal(false);
  readonly loading         = signal(true);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadProximasVisitas(),
      this.loadReportes(),
      this.loadAnnualAvailability(),
    ]);
    this.loading.set(false);
  }

  private async loadProximasVisitas(): Promise<void> {
    try {
      const res = await this.visitas.getProximaVisita();
      if (res.success && Array.isArray(res.data)) {
        this.proximasVisitas.set(res.data);
      }
    } catch {
      this.proximasVisitas.set([]);
    }
  }

  private async loadReportes(): Promise<void> {
    try {
      const res = await this.visitas.getMisReportes();
      if (res.success && Array.isArray(res.data)) {
        const anioActual = new Date().getFullYear();
        const reportes: MiReporteItem[] = res.data.filter((r: MiReporteItem) => {
          const fecha = r.fechaVisita ?? r.createdAt;
          return fecha && new Date(fecha).getFullYear() === anioActual;
        });
        this.completedCount.set(
          reportes.filter(r => r.estado === 'ENVIADO' || r.estado === 'REVISADO' || r.estado === 'CON_OBSERVACIONES').length
        );
      }
    } catch {
      // stats quedan en 0
    }
  }

  private async loadAnnualAvailability(): Promise<void> {
    if (!this.auth.currentUser()?.organica) return;
    try {
      const response = await this.annualInspection.getSummary();
      this.annualEnabled.set(response.data.habilitado);
    } catch {
      this.annualEnabled.set(false);
    }
  }

  diasRestantes(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
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

  getUrgencyClass(fecha: string): string {
    const dias = this.diasRestantes(fecha);
    if (dias < 0)  return 'border-l-4 border-error bg-error-bg';
    if (dias <= 3) return 'border-l-4 border-gold bg-gold/10';
    return 'border border-cream-tan bg-cream-pure';
  }

  startForm(visita: ProximaVisita): void {
    this.router.navigate(['/form'], { queryParams: { visitaId: visita.visitaId } });
  }

  openAnnualInspection(): void {
    this.router.navigate(['/annual-inspection']);
  }
}
