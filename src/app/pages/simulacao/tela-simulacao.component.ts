import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { SimulacaoService } from '../../services/simulacao.service';
import { AuthService } from '../../services/auth.service';
import {
  CriarSimulacaoRequest,
  SimulacaoResponse,
  TipoSimulacao
} from '../../models/simulacao.model';

@Component({
  selector: 'app-tela-simulacao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tela-simulacao.component.html',
  styleUrls: ['./tela-simulacao.component.css']
})
export class TelaSimulacaoComponent implements OnInit {
  private simulacaoService = inject(SimulacaoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarAberta = false;

  tipoSelecionado: TipoSimulacao = 'energia';
  nomeAtividade = '';
  consumo = 0;
  descricao = '';
  dataRegistro = '';

  carregando = false;
  carregandoHistorico = false;
  mensagem = '';
  erro = '';

  usuarioNome = 'Usuário';
  simulacoes: SimulacaoResponse[] = [];

  ngOnInit(): void {
    this.usuarioNome = this.authService.getUsuarioNome() || 'Usuário';
    this.dataRegistro = this.dataMaxima;
    this.carregarHistorico();
  }
    irParaMenu(): void {
    this.router.navigate(['/menu']);
  }

  irParaPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  irParaConsumo(): void {
    this.router.navigate(['/consumo']);

  }

  irParaGraficos(): void {
  this.router.navigate(['/graficos']);
  }

  irParaSimulacao(): void {
    this.router.navigate(['/simulacao']);
  }



  get dataMaxima(): string {
    return new Date().toISOString().split('T')[0];
  }

  toggleSidebar(): void {
    this.sidebarAberta = !this.sidebarAberta;
  }

  fecharSidebar(): void {
    this.sidebarAberta = false;
  }

  selecionarTipo(tipo: TipoSimulacao): void {
    this.tipoSelecionado = tipo;
  }

  getUnidade(): string {
    return this.tipoSelecionado === 'agua' ? 'Litros' : 'kWh';
  }

  getLabelConsumo(item: SimulacaoResponse): string {
    return item.tipo === 'agua' ? 'Litros' : 'kWh';
  }

  criarSimulacao(): void {
    this.mensagem = '';
    this.erro = '';

    if (!this.nomeAtividade.trim()) {
      this.erro = 'Informe o nome da atividade.';
      return;
    }

    if (!this.consumo || this.consumo <= 0) {
      this.erro = 'Informe um consumo maior que zero.';
      return;
    }

    const payload: CriarSimulacaoRequest = {
      tipo: this.tipoSelecionado,
      nome_atividade: this.nomeAtividade.trim(),
      consumo: Number(this.consumo),
      descricao: this.descricao?.trim() || '',
      data_registro: this.dataRegistro
    };

    this.carregando = true;

    this.simulacaoService.criarSimulacao(payload).subscribe({
      next: () => {
        this.mensagem = 'Simulação criada com sucesso.';
        this.nomeAtividade = '';
        this.consumo = 0;
        this.descricao = '';
        this.dataRegistro = this.dataMaxima;
        this.carregando = false;
        this.carregarHistorico();
      },
      error: (error) => {
        this.carregando = false;
        this.erro = this.extrairMensagemErro(error);
      }
    });
  }

  carregarHistorico(): void {
    this.carregandoHistorico = true;

    this.simulacaoService.listarSimulacoes().subscribe({
      next: (res) => {
        this.simulacoes = Array.isArray(res) ? res : [];
        this.carregandoHistorico = false;
      },
      error: () => {
        this.carregandoHistorico = false;
        this.simulacoes = [];
      }
    });
  }

  excluirSimulacao(id: number): void {
    this.simulacaoService.deletarSimulacao(id).subscribe({
      next: () => {
        this.simulacoes = this.simulacoes.filter(item => item.id !== id);
      },
      error: (error) => {
        this.erro = this.extrairMensagemErro(error);
      }
    });
  }

  getIconeTipo(tipo: string | undefined): string {
    return tipo === 'agua' ? '💧' : '⚡';
  }

  getTituloTipo(tipo: string | undefined): string {
    return tipo === 'agua' ? 'Água' : 'Energia';
  }

  formatarData(data?: string): string {
    if (!data) return '-';
    const novaData = new Date(data);
    if (isNaN(novaData.getTime())) return data;
    return novaData.toLocaleDateString('pt-BR');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  extrairMensagemErro(error: any): string {
    if (error?.error?.detail && typeof error.error.detail === 'string') {
      return error.error.detail;
    }

    if (Array.isArray(error?.error?.detail)) {
      return error.error.detail.map((item: any) => item?.msg || 'Erro').join(', ');
    }

    if (typeof error?.error === 'string') {
      return error.error;
    }

    if (error?.error && typeof error.error === 'object') {
      const valores = Object.values(error.error).flat();
      return valores.join(', ');
    }

    return 'Ocorreu um erro ao processar sua solicitação.';
  }
}