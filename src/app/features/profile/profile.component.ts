import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [BottomNavComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  readonly auth   = inject(AuthService);
  private router  = inject(Router);

  readonly showLogoutModal = signal(false);

  readonly user = computed(() => this.auth.currentUser());

  readonly personalData = computed(() => {
    const u = this.user();
    return [
      { label: 'Usuario',    value: u?.username  ?? '—' },
      { label: 'CURP',       value: u?.curp       ?? '—' },
      { label: 'Municipio',  value: u?.municipio  ?? '—' },
      { label: 'Estado',     value: u?.estado     ?? '—' },
      { label: 'Domicilio',  value: u?.direccion  ?? '—' },
    ].filter(d => d.value !== '—');
  });

  readonly apiaries = computed(() => this.user()?.apiarios ?? []);
  readonly totalColmenas = computed(() => this.apiaries().reduce((sum, a) => sum + (a.colmenas ?? 0), 0));

  confirmLogout(): void { this.showLogoutModal.set(true); }
  cancelLogout():  void { this.showLogoutModal.set(false); }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
