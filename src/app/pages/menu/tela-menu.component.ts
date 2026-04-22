import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MetaService, MetaResponse } from '../../services/meta.service';
import { ConsumoService, ConsumoResponse } from '../../services/consumo.service';
import { AuthService, UsuarioLocal } from '../../core/auth.service';
import { UsuarioService, UsuarioMeResponse } from '../../services/usuarioservice';

interface MetaView {
  id: number | string;
  titulo: string;
}

@Component({
  selector: 'app-tela-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tela-menu.component.html',
  styleUrls: ['./tela-menu.component.css']
})
export class TelaMenuComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private metaService = inject(MetaService);
  private consumoService = inject(ConsumoService);
  private authService = inject(AuthService);

  menuAberto = true;
  mostrarResumo = true;
  mostrarInputMeta = false;
  carregando = false;
  erro = '';

  novaMeta = '';

  usuarioNome = 'Usuário';
  usuarioEmail = '';
  usuarioCidade = '';

  registro = 0;
  totalGasto = 0;
  pontos = 0;
  rankRegional = 'Sem ranking';

  configuracoes: string[] = [];
  metas: MetaView[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.carregarTela();
  }

  carregarTela(): void {
    this.carregando = true;
    this.erro = '';

    this.carregarUsuario();
    this.carregarMetas();
    this.carregarConsumos();
  }

  carregarUsuario(): void {
    this.usuarioService.buscarUsuarioLogado().subscribe({
      next: (usuario) => {
        this.aplicarUsuario(usuario);
        this.authService.atualizarUsuarioLocal({
          id: usuario?.id,
          nome: usuario?.nome,
          email: usuario?.email,
          cidade: usuario?.cidade
        });
      },
      error: () => {
        const usuarioLocal = this.authService.getUsuarioLocal();

        if (usuarioLocal) {
          this.aplicarUsuario(usuarioLocal);
        } else {
          this.erro = 'Não foi possível carregar os dados do usuário.';
        }
      }
    });
  }

  carregarMetas(): void {
    this.metaService.listarMinhasMetas().subscribe({
      next: (metas) => {
        this.metas = (metas || []).map((meta) => ({
          id: this.extrairMetaId(meta),
          titulo: this.extrairTituloMeta(meta)
        }));

        this.atualizarPontos();
      },
      error: () => {
        this.metas = [];
        this.atualizarPontos();
      }
    });
  }

  carregarConsumos(): void {
    this.consumoService.listarMeusConsumos().subscribe({
      next: (consumos) => {
        const lista = consumos || [];

        this.registro = lista.length;
        this.totalGasto = lista.reduce(
          (acc, item) => acc + this.extrairValorConsumo(item),
          0
        );

        this.carregando = false;
      },
      error: () => {
        this.registro = 0;
        this.totalGasto = 0;
        this.carregando = false;
      }
    });
  }

  aplicarUsuario(usuario: UsuarioMeResponse | UsuarioLocal): void {
    this.usuarioNome = String(usuario?.nome || 'Usuário');
    this.usuarioEmail = String(usuario?.email || '');
    this.usuarioCidade = String(usuario?.cidade || '');

    this.configuracoes = [
      `Nome: ${this.usuarioNome}`,
      this.usuarioEmail ? `Email: ${this.usuarioEmail}` : 'Email não informado',
      this.usuarioCidade ? `Cidade: ${this.usuarioCidade}` : 'Cidade não informada'
    ];
  }

  abrirMenu(): void {
    this.menuAberto = true;
  }

  fecharMenu(): void {
    this.menuAberto = false;
  }

  toggleResumo(): void {
    this.mostrarResumo = !this.mostrarResumo;
  }

  abrirInputMeta(): void {
    this.mostrarInputMeta = !this.mostrarInputMeta;
  }

  adicionarMeta(): void {
    const titulo = this.novaMeta.trim();

    if (!titulo) {
      return;
    }

    this.metaService.criarMeta({ titulo }).subscribe({
      next: () => {
        this.novaMeta = '';
        this.mostrarInputMeta = false;
        this.recarregarMetas();
      },
      error: () => {
        alert('Não foi possível cadastrar a meta.');
      }
    });
  }

  removerMeta(id: number | string): void {
    this.metaService.deletarMeta(id).subscribe({
      next: () => {
        this.recarregarMetas();
      },
      error: () => {
        alert('Não foi possível remover a meta.');
      }
    });
  }

  recarregarMetas(): void {
    this.metaService.listarMinhasMetas().subscribe({
      next: (metas) => {
        this.metas = (metas || []).map((meta) => ({
          id: this.extrairMetaId(meta),
          titulo: this.extrairTituloMeta(meta)
        }));

        this.atualizarPontos();
      },
      error: () => {
        this.metas = [];
        this.atualizarPontos();
      }
    });
  }

  atualizarPontos(): void {
    this.pontos = this.metas.length * 10;

    if (this.pontos >= 100) {
      this.rankRegional = '1° LUGAR';
    } else if (this.pontos >= 60) {
      this.rankRegional = '2° LUGAR';
    } else if (this.pontos >= 30) {
      this.rankRegional = '3° LUGAR';
    } else if (this.pontos > 0) {
      this.rankRegional = '4° LUGAR';
    } else {
      this.rankRegional = 'Sem ranking';
    }
  }

  irParaMenu(): void {
    this.router.navigate(['/menu']);
  }

  irParaPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  irParaConsumo():void {
    this.router.navigate(['/consumo'])
  }

  irParaGraficos(): void {
    this.router.navigate(['/graficos']);
  }

  irParaSimulacao(): void {
    this.router.navigate(['/simulacao']);
  }

  voltarParaLogin(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private extrairMetaId(meta: MetaResponse): number | string {
    return meta.id ?? meta.meta_id ?? Date.now();
  }

  private extrairTituloMeta(meta: MetaResponse): string {
    const titulo = meta.titulo ?? meta.nome ?? meta.descricao;
    return String(titulo || 'Meta sem título');
  }

  private extrairValorConsumo(item: ConsumoResponse): number {
    const valor = item.valor ?? item.gasto ?? item.total ?? item.preco ?? 0;
    return typeof valor === 'number' ? valor : Number(valor) || 0;
  }
}