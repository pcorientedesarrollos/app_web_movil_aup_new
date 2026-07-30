import { Injectable, signal, computed, inject } from '@angular/core';
import { BeekerUser } from '../models/user.model';
import { StorageService } from './storage.service';
import { VisitasApiService } from './visitas-api.service';

const TOKEN_KEY = 'oaxacamiel_token';
const USER_KEY  = 'oaxacamiel_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storage = inject(StorageService);
  private visitas = inject(VisitasApiService);

  private _user  = signal<BeekerUser | null>(this.storage.get<BeekerUser>(USER_KEY));
  private _token = signal<string | null>(this.storage.get<string>(TOKEN_KEY));

  readonly currentUser     = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly token           = this._token.asReadonly();

  async login(username: string, password: string): Promise<void> {
    const loginRes = await this.visitas.login(username, password);
    if (!loginRes.success) throw new Error(loginRes.message ?? 'Credenciales incorrectas');

    const { token } = loginRes.data;
    this._token.set(token);
    this.storage.set(TOKEN_KEY, token);

    const perfilRes = await this.visitas.getPerfil();
    const perfil = perfilRes.data;
    const apicultor = perfil.apicultor ?? {};

    const user: BeekerUser = {
      accesoId:    '',
      apicultorId: apicultor.id ?? '',
      username,
      nombre:      apicultor.nombreCompleto ?? apicultor.nombre ?? username,
      municipio:   apicultor.localidad,
      direccion:   apicultor.direccion,
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

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(USER_KEY);
  }
}
