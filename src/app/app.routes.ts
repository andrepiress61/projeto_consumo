import { Routes } from '@angular/router';
import { TelaLoginComponent } from './pages/login/tela-login.component';
import { CadastroUsuarioComponent } from './pages/usuario/cadastro-usuario.component';
import { TelaMenuComponent } from './pages/menu/tela-menu.component';
import { TelaPerfilComponent } from './pages/perfil/tela-perfil.component';
import { TelaSimulacaoComponent } from './pages/simulacao/tela-simulacao.component';
import { TelaGraficosComponent } from './pages/graficos/tela-graficos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: TelaLoginComponent },
  { path: 'cadastro', component: CadastroUsuarioComponent },
  { path: 'menu', component: TelaMenuComponent },
  { path: 'perfil', component: TelaPerfilComponent },
  { path: 'simulacao', component: TelaSimulacaoComponent },
  { path: 'graficos', component: TelaGraficosComponent },
  { path: '**', redirectTo: 'login' }
];