import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  readonly loading      = signal(false);
  readonly errorMsg     = signal('');
  readonly showPassword = signal(false);

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) return;
    this.errorMsg.set('');
    this.loading.set(true);

    try {
      const { username, password } = this.form.value;
      await this.auth.adminLogin(username!, password!);
      this.router.navigate(['/admin']);
    } catch (err: any) {
      const status = err?.status;
      if (status === 401 || err?.message?.includes('permisos')) {
        this.errorMsg.set(err.message ?? 'Usuario o contraseña incorrectos');
      } else {
        this.errorMsg.set('Error de conexión. Intenta de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
