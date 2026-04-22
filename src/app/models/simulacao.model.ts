export type TipoSimulacao = 'energia' | 'agua';

export interface CriarSimulacaoRequest {
  tipo: TipoSimulacao;
  nome_atividade: string;
  consumo: number;
  descricao?: string;
  data_registro?: string;
}

export interface SimulacaoResponse {
  id: number;
  tipo: TipoSimulacao;
  nome_atividade: string;
  consumo: number;
  custo?: number;
  descricao?: string;
  data_registro?: string;
  created_at?: string;
}