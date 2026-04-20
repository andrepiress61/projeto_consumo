import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';

import { API_BASE_URL } from './api.config';
import { UsuarioMeResponse, UsuarioService } from '../service/usuarioservice';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private usuarioService = inject(UsuarioService);

  login(payload: LoginRequest): Observable<UsuarioMeResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE_URL}/login/auth/login`, payload)
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('token_type', response.token_type || 'bearer');
          localStorage.setItem('senha_usuario', payload.senha);
        }),
        switchMap(() => this.usuarioService.buscarUsuarioLogado()),
        tap((usuario) => {
          this.atualizarUsuarioLocal(usuario);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('usuario_logado');
    localStorage.removeItem('senha_usuario');
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  getTokenType(): string {
    return localStorage.getItem('token_type') || 'bearer';
  }

  isAutenticado(): boolean {
    return !!this.getToken();
  }

  getUsuarioLocal(): UsuarioMeResponse | null {
    const usuario = localStorage.getItem('usuario_logado');

    if (!usuario) {
      return null;
    }

    try {
      return JSON.parse(usuario) as UsuarioMeResponse;
    } catch {
      return null;
    }
  }

  atualizarUsuarioLocal(usuario: UsuarioMeResponse): void {
    localStorage.setItem('usuario_logado', JSON.stringify(usuario));
  }

  getSenhaLocal(): string {
    return localStorage.getItem('senha_usuario') || '';
  }

  atualizarSenhaLocal(senha: string): void {
    localStorage.setItem('senha_usuario', senha);
  }
}