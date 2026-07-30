import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BeekerUser, AdminUser } from '../models/user.model';
import { StorageService } from './storage.service';
import { VisitasApiService } from './visitas-api.service';
import { environment } from '../../../environments/environment';

const TOKEN_KEY       = 'oaxacamiel_token';
const USER_KEY        = 'oaxacamiel_user';
const ADMIN_TOKEN_KEY = 'oaxacamiel_admin_token';
const ADMIN_USER_KEY  = 'oaxacamiel_admin_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storage = inject(StorageService);
  private visitas = inject(VisitasApiService);
  private http    = inject(HttpClient);

  private _user       = signal<BeekerUser | null>(this.storage.get<BeekerUser>(USER_KEY));
  private _token      = signal<string | null>(this.storage.get<string>(TOKEN_KEY));
  private _adminUser  = signal<AdminUser | null>(this.storage.get<AdminUser>(ADMIN_USER_KEY));
  private _adminToken = signal<string | null>(this.storage.get<string>(ADMIN_TOKEN_KEY));

  readonly currentUser     = this._user.asReadonly();
  readonly currentAdmin    = this._adminUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin         = computed(() => !!this._adminToken());
  readonly token           = this._token.asReadonly();
  readonly adminToken      = this._adminToken.asReadonly();

  async login(username: string, password: string): Promise<void> {
    const loginRes = await this.visitas.login(username, password);
    if (!loginRes.success) throw new Error(loginRes.message ?? 'Credenciales incorrectas');

    const { token } = loginRes.data;
    this._token.set(token);
    this.storage.set(TOKEN_KEY, token);

    const perfilRes = await this.visitas.getPerfil();
    const perfil    = perfilRes.data;
    const apicultor = perfil.apicultor ?? {};

    const user: BeekerUser = {
      accesoId:    '',
      apicultorId: apicultor.id ?? '',
      username,
      nombre:      apicultor.nombreCompleto ?? apicultor.nombre ?? username,
      municipio:   apicultor.localidad,
      direccion:   apicultor.direccion,
      organica:    apicultor.organica ?? false,
      apiarios:    (perfil.apiarios ?? []).map((a: any) => ({
        id:       a.id,
        nombre:   a.nombre,
        colmenas: a.colmenas,
        lat:      a.latitud,
        lng:      a.longitud,
      })),
    };

    this._user.set(user);
    this.storage.set(USER_KEY, user);
  }

  async adminLogin(username: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/api/auth/login`, { username, password })
    );
    if (!res.success) throw new Error(res.message ?? 'Credenciales incorrectas');

    const { user, token } = res.data;
    if (user.role !== 'ADMINISTRADOR') throw new Error('No tienes permisos de administrador');

    const adminUser: AdminUser = { id: user.id, username: user.username, nombre: user.nombre, role: 'ADMINISTRADOR' };
    this._adminToken.set(token);
    this._adminUser.set(adminUser);
    this.storage.set(ADMIN_TOKEN_KEY, token);
    this.storage.set(ADMIN_USER_KEY, adminUser);
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(USER_KEY);
  }

  adminLogout(): void {
    this._adminToken.set(null);
    this._adminUser.set(null);
    this.storage.remove(ADMIN_TOKEN_KEY);
    this.storage.remove(ADMIN_USER_KEY);
  }
}
