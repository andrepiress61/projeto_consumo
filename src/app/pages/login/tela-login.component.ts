import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { UsuarioService } from '../../services/usuarioservice';

@Component({
  selector: 'app-tela-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tela-login.component.html',
  styleUrls: ['./tela-login.component.css']
})
export class TelaLoginComponent {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  email = '';
  senha = '';
  mostrarSenha = false;
  carregando = false;
  erro = '';

  entrar(): void {
    this.erro = '';

    const emailLimpo = this.email.trim();
    const senhaLimpa = this.senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      this.erro = 'Preencha email e senha.';
      return;
    }

    this.carregando = true;

    this.authService.login({
      email: emailLimpo,
      senha: senhaLimpa
    }).subscribe({
      next: () => {
        this.usuarioService.buscarUsuarioLogado().subscribe({
          next: (usuario) => {
            this.authService.atualizarUsuarioLocal({
              id: usuario?.id,
              nome: String(usuario?.nome || ''),
              email: String(usuario?.email || ''),
              cidade: String(usuario?.cidade || '')
            });

            this.carregando = false;
            this.router.navigate(['/menu']);
          },
          error: (err) => {
            console.error('Erro ao buscar usuário logado:', err);

            this.carregando = false;
            this.router.navigate(['/menu']);
          }
        });
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.carregando = false;
        this.erro = this.extrairMensagemErro(err);
      }
    });
  }

  irParaCadastro(): void {
    this.router.navigate(['/cadastro']);
  }

  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  private extrairMensagemErro(err: any): string {
    if (typeof err?.error?.detail === 'string') {
      return err.error.detail;
    }

    if (Array.isArray(err?.error?.detail)) {
      return err.error.detail.map((item: any) => item?.msg || 'Erro').join(', ');
    }

    if (typeof err?.error?.message === 'string') {
      return err.error.message;
    }

    if (typeof err?.error === 'string') {
      return err.error;
    }

    if (err?.status === 401) {
      return 'Email ou senha inválidos.';
    }

    if (err?.status === 404) {
      return 'Rota de login não encontrada.';
    }

    if (err?.status === 422) {
      return 'Dados inválidos. Verifique email e senha.';
    }

    return 'Não foi possível fazer login.';
  }
}