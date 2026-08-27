import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AnnualInspectionApiService } from '../../core/services/annual-inspection-api.service';
import {
  AnnualInspectionApiarySummary,
  AnnualInspectionStatus,
  AnnualInspectionSummary,
} from '../../core/models/annual-inspection.model';

@Component({
  selector: 'app-annual-inspection-overview',
  standalone: true,
  imports: [BottomNavComponent],
  templateUrl: './annual-inspection-overview.component.html',
})
export class AnnualInspectionOverviewComponent implements OnInit {
  private api = inject(AnnualInspectionApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly summary = signal<AnnualInspectionSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  async ngOnInit(): Promise<void> {
    if (!this.auth.currentUser()?.organica) {
      this.error.set('Este cuestionario aplica solo para apicultores orgánicos.');
      this.loading.set(false);
      return;
    }

    try {
      const response = await this.api.getSummary();
      this.summary.set(response.data);
    } catch (error: any) {
      this.error.set(error?.error?.message ?? 'No fue posible cargar la inspección anual.');
    } finally {
      this.loading.set(false);
    }
  }

  openGeneral(): void {
    this.router.navigate(['/annual-inspection/general']);
  }

  goDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  openApiary(apiary: AnnualInspectionApiarySummary): void {
    if (!apiary.habilitado) return;
    this.router.navigate(['/annual-inspection/apiary', apiary.id]);
  }

  statusLabel(status: AnnualInspectionStatus): string {
    const labels: Record<AnnualInspectionStatus, string> = {
      PENDIENTE: 'Pendiente',
      BORRADOR: 'Borrador',
      ENVIADO: 'Enviado',
      REVISADO: 'Revisado',
      CON_OBSERVACIONES: 'Con observaciones',
    };
    return labels[status];
  }

  statusClass(status: AnnualInspectionStatus): string {
    if (status === 'ENVIADO' || status === 'REVISADO') return 'bg-success-bg text-success';
    if (status === 'CON_OBSERVACIONES') return 'bg-error-bg text-error';
    if (status === 'BORRADOR') return 'bg-gold/15 text-brown';
    return 'bg-cream-tan/60 text-brown-muted';
  }

  completedApiaries(): number {
    return this.summary()?.apiarios.filter((item) => item.estado === 'ENVIADO' || item.estado === 'REVISADO').length ?? 0;
  }
}
