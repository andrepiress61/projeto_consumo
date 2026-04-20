import { Routes } from '@angular/router';
import { TelaLoginComponent } from './pages/login/tela-login.component';
import { CadastroUsuarioComponent } from './pages/usuario/cadastro-usuario.component';
import { TelaMenuComponent } from './pages/menu/tela-menu.component';
import { TelaPerfilComponent } from './pages/perfil/tela-perfil.component';
import { TelaConsumoComponent } from './pages/consumo/tela-consumo.component';
import { TelaGraficosComponent } from './pages/graficos/tela-graficos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: TelaLoginComponent },
  { path: 'cadastro', component: CadastroUsuarioComponent },
  { path: 'menu', component: TelaMenuComponent },
  { path: 'perfil', component: TelaPerfilComponent },
  { path: 'consumo', component: TelaConsumoComponent },
  { path: 'graficos', component: TelaGraficosComponent }
];