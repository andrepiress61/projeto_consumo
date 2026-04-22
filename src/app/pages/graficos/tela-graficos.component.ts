import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConsumoResponse, ConsumoService } from '../../services/consumo.service';

interface CategoriaGrafico {
  label: string;
  valor: number;
  porcentagem: number;
  cor: string;
}

interface BarraSemana {
  label: string;
  valor: number;
  altura: number;
}

@Component({
  selector: 'app-tela-graficos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tela-graficos.component.html',
  styleUrls: ['./tela-graficos.component.css'],
  providers: [CurrencyPipe]
})
export class TelaGraficosComponent implements OnInit {
  private consumoService = inject(ConsumoService);
  private currencyPipe = inject(CurrencyPipe);

  constructor(private router: Router) {}

  menuAberto = true;
  abaAtiva: 'consumo' | 'simulacao' = 'consumo';
  carregando = false;
  erro = '';

  totalRegistros = 0;
  totalGasto = 0;

  categorias: CategoriaGrafico[] = [];
  barrasUltimos7Dias: BarraSemana[] = [];

  maiorCategoriaTexto = 'Sem dados ainda.';
  graficoPizzaStyle = 'conic-gradient(#1f3d35 0deg 360deg)';

  ngOnInit(): void {
    this.carregarGraficosConsumo();
  }

  abrirMenu(): void {
    this.menuAberto = true;
  }

  fecharMenu(): void {
    this.menuAberto = false;
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

  selecionarAba(aba: 'consumo' | 'simulacao'): void {
    this.abaAtiva = aba;

    if (aba === 'consumo') {
      this.carregarGraficosConsumo();
    } else {
      this.carregarGraficosSimulacao();
    }
  }

  carregarGraficosConsumo(): void {
    this.carregando = true;
    this.erro = '';

    this.consumoService.listarMeusConsumos().subscribe({
      next: (consumos) => {
        const lista = consumos || [];

        this.totalRegistros = lista.length;
        this.totalGasto = lista.reduce(
          (acc, item) => acc + this.extrairValor(item),
          0
        );

        this.montarGraficoCategorias(lista);
        this.montarGraficoUltimos7Dias(lista);

        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar gráficos de consumo:', err);
        this.carregando = false;
        this.erro = 'Não foi possível carregar os gráficos.';
        this.totalRegistros = 0;
        this.totalGasto = 0;
        this.categorias = [];
        this.barrasUltimos7Dias = [];
        this.graficoPizzaStyle = 'conic-gradient(#1f3d35 0deg 360deg)';
        this.maiorCategoriaTexto = 'Sem dados ainda.';
      }
    });
  }

  carregarGraficosSimulacao(): void {
    this.carregando = false;
    this.erro =
      'Sua API atual não mostrou uma rota GET para listar simulações do usuário. A tela está pronta, mas para ficar real nessa aba eu preciso do endpoint de listagem.';
    this.totalRegistros = 0;
    this.totalGasto = 0;
    this.categorias = [];
    this.barrasUltimos7Dias = [];
    this.graficoPizzaStyle = 'conic-gradient(#1f3d35 0deg 360deg)';
    this.maiorCategoriaTexto = 'Sem dados de simulação.';
  }

  private montarGraficoCategorias(consumos: ConsumoResponse[]): void {
    const mapaCategorias: Record<string, number> = {};

    for (const item of consumos) {
      const tipo = String(item.tipo || 'outros').toLowerCase();
      const valor = this.extrairValor(item);

      mapaCategorias[tipo] = (mapaCategorias[tipo] || 0) + valor;
    }

    const total = Object.values(mapaCategorias).reduce((acc, val) => acc + val, 0);

    const paleta: Record<string, string> = {
      energia: '#f5ea14',
      transporte: '#ff3c1f',
      agua: '#3ec7ff',
      alimentacao: '#63e06c',
      residuos: '#36d17c',
      outros: '#c9a56b'
    };

    const categoriasBrutas = Object.entries(mapaCategorias).map(([tipo, valor]) => ({
      label: this.labelCategoria(tipo),
      valor,
      porcentagem: total > 0 ? (valor / total) * 100 : 0,
      cor: paleta[tipo] || '#7ce0b3'
    }));

    this.categorias = categoriasBrutas.sort((a, b) => b.valor - a.valor);

    if (!this.categorias.length) {
      this.graficoPizzaStyle = 'conic-gradient(#1f3d35 0deg 360deg)';
      this.maiorCategoriaTexto = 'Sem dados ainda.';
      return;
    }

    let acumulado = 0;
    const partes: string[] = [];

    for (const categoria of this.categorias) {
      const inicio = acumulado;
      acumulado += categoria.porcentagem;
      partes.push(`${categoria.cor} ${inicio}% ${acumulado}%`);
    }

    this.graficoPizzaStyle = `conic-gradient(${partes.join(', ')})`;

    const maior = this.categorias[0];
    this.maiorCategoriaTexto = `Seu maior foco foi ${maior.label}, representando ${maior.porcentagem.toFixed(1)}%`;
  }

  private montarGraficoUltimos7Dias(consumos: ConsumoResponse[]): void {
    const hoje = new Date();
    const dias: BarraSemana[] = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(hoje.getDate() - i);

      const yyyy = data.getFullYear();
      const mm = String(data.getMonth() + 1).padStart(2, '0');
      const dd = String(data.getDate()).padStart(2, '0');
      const chave = `${yyyy}-${mm}-${dd}`;

      const valorDia = consumos
        .filter((item) => String(item.data || '').slice(0, 10) === chave)
        .reduce((acc, item) => acc + this.extrairValor(item), 0);

      dias.push({
        label: this.labelDiaSemana(data.getDay()),
        valor: valorDia,
        altura: 0
      });
    }

    const maiorValor = Math.max(...dias.map((d) => d.valor), 0);

    this.barrasUltimos7Dias = dias.map((dia) => ({
      ...dia,
      altura: maiorValor > 0 ? Math.max((dia.valor / maiorValor) * 100, dia.valor > 0 ? 8 : 0) : 0
    }));
  }

  private extrairValor(item: ConsumoResponse): number {
    const valor = item.gasto ?? item.valor ?? item.total ?? item.preco ?? 0;
    return typeof valor === 'number' ? valor : Number(valor) || 0;
  }

  private labelCategoria(tipo: string): string {
    const mapa: Record<string, string> = {
      energia: 'Energia',
      transporte: 'Transporte',
      agua: 'Água',
      alimentacao: 'Alimentação',
      residuos: 'Resíduos',
      outros: 'Outros'
    };

    return mapa[tipo] || 'Outros';
  }

  private labelDiaSemana(dia: number): string {
    const mapa = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return mapa[dia];
  }

  formatarMoeda(valor: number): string {
    return this.currencyPipe.transform(valor, 'BRL', 'symbol', '1.2-2') || 'R$0,00';
  }
}