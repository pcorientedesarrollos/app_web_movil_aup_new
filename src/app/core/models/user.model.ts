export interface Apiario {
  id: string;
  nombre: string;
  colmenas: number;
  lat?: number;
  lng?: number;
  municipio?: string;
}

export interface BeekerUser {
  accesoId: string;
  apicultorId: string;
  username: string;
  nombre: string;
  curp?: string;
  municipio?: string;
  estado?: string;
  direccion?: string;
  apiarios: Apiario[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
