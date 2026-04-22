import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CriarSimulacaoRequest,
  SimulacaoResponse
} from '../models/simulacao.model';

@Injectable({
  providedIn: 'root'
})
export class SimulacaoService {
  private http = inject(HttpClient);

  private apiUrl = 'https://projeto-sustentavel-0-1.onrender.com/';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  criarSimulacao(payload: CriarSimulacaoRequest): Observable<SimulacaoResponse> {
    return this.http.post<SimulacaoResponse>(
      `${this.apiUrl}/simulacao/simulacoes/`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  listarSimulacoes(): Observable<SimulacaoResponse[]> {
    return this.http.get<SimulacaoResponse[]>(
      `${this.apiUrl}/simulacao/simulacoes/`,
      { headers: this.getHeaders() }
    );
  }

  deletarSimulacao(simulacaoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/simulacao/simulacoes/${simulacaoId}`,
      { headers: this.getHeaders() }
    );
  }
}