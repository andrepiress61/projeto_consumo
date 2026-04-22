import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';

export interface ConsumoRequest {
  tipo: string;
  gasto: number;
  data: string;
  meta_id?: number | null;
}

export interface ConsumoResponse {
  id?: number | string;
  consumo_id?: number | string;
  tipo?: string;
  valor?: number;
  gasto?: number;
  total?: number;
  preco?: number;
  data?: string;
  descricao?: string;
  meta_id?: number | null;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class ConsumoService {
  private http = inject(HttpClient);

  listarMeusConsumos(): Observable<ConsumoResponse[]> {
    return this.http.get<ConsumoResponse[]>(
      `${API_BASE_URL}/consumos/consumos/me`
    );
  }

  criarConsumo(payload: ConsumoRequest): Observable<unknown> {
    return this.http.post(
      `${API_BASE_URL}/consumos/consumos/`,
      payload
    );
  }

  editarConsumo(consumoId: number, payload: ConsumoRequest): Observable<unknown> {
    return this.http.put(
      `${API_BASE_URL}/consumos/consumos/${consumoId}`,
      payload
    );
  }

  deletarConsumo(consumoId: number): Observable<unknown> {
    return this.http.delete(
      `${API_BASE_URL}/consumos/consumos/${consumoId}`
    );
  }
}