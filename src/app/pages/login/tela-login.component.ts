import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-tela-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tela-login.component.html',
  styleUrls: ['./tela-login.component.css']
})
export class TelaLoginComponent {
  private authService = inject(AuthService);

  email = '';
  senha = '';
  mostrarSenha = false;
  carregando = false;
  erro = '';

  constructor(private router: Router) {}

  entrar(): void {
    this.erro = '';

    if (!this.email.trim() || !this.senha.trim()) {
      this.erro = 'Preencha email e senha.';
      return;
    }

    this.carregando = true;

    this.authService.login({
      email: this.email.trim(),
      senha: this.senha.trim()
    }).subscribe({
      next: (usuario) => {
        console.log('Usuário logado:', usuario);

        this.carregando = false;
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.carregando = false;
        this.erro =
          err?.error?.detail ||
          err?.error?.message ||
          JSON.stringify(err?.error) ||
          'Não foi possível fazer login.';
      }
    });
  }

  irParaCadastro(): void {
    this.router.navigate(['/cadastro']);
  }

  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }
}