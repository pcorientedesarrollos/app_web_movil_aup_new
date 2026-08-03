import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../../shared/bottom-nav/bottom-nav.component';
import { VisitasApiService } from '../../../core/services/visitas-api.service';
import { MiApiarioItem } from '../../../core/models/visit.model';

@Component({
  selector: 'app-visit-history',
  standalone: true,
  imports: [BottomNavComponent],
  templateUrl: './visit-history.component.html',
})
export class VisitHistoryComponent implements OnInit {
  private visitas = inject(VisitasApiService);
  private router  = inject(Router);

  readonly apiarios = signal<MiApiarioItem[]>([]);
  readonly loading  = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const res = await this.visitas.getMisApiarios();
      if (res.success && Array.isArray(res.data)) {
        this.apiarios.set(res.data);
      }
    } finally {
      this.loading.set(false);
    }
  }

  progressPct(visitasAnio: number): number {
    return Math.min(100, Math.round((visitasAnio / 24) * 100));
  }

  openApiario(id: string, nombre: string): void {
    this.router.navigate(['/visits/apiary', id], { queryParams: { nombre } });
  }
}
