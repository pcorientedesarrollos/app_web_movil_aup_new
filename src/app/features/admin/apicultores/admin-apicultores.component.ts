import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { VisitasApiService } from '../../../core/services/visitas-api.service';

interface ApicultorItem {
  id: string;
  codigo: string;
  nombreCompleto: string;
  localidad: string | null;
  organica: boolean;
  acceso: { username: string; activo: boolean } | null;
}

@Component({
  selector: 'app-admin-apicultores',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-apicultores.component.html',
})
export class AdminApicultoresComponent implements OnInit {
  private router  = inject(Router);
  readonly auth   = inject(AuthService);
  private visitas = inject(VisitasApiService);

  readonly loading      = signal(true);
  readonly apicultores  = signal<ApicultorItem[]>([]);
  readonly errorMsg     = signal('');
  searchText = '';

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(search?: string): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      const res = await this.visitas.adminGetApicultores(1, 100, search);
      if (res.success) {
        this.apicultores.set(res.data ?? []);
      }
    } catch {
      this.errorMsg.set('Error al cargar apicultores. Verifica tu sesión.');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(): void {
    this.cargar(this.searchText.trim() || undefined);
  }

  verVisitas(apicultorId: string): void {
    this.router.navigate(['/admin/apicultor', apicultorId]);
  }

  cerrarSesion(): void {
    this.auth.adminLogout();
    this.router.navigate(['/admin/login']);
  }
}
