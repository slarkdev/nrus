import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { CanUserGuard } from '../auth/guards/can-user.guard';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    canActivate: [CanUserGuard],
    children: [
      {
        path: 'compras',
        loadChildren: () => import('./compras/compras.module').then( m => m.ComprasPageModule)
      },
      {
        path: 'ventas',
        loadChildren: () => import('./ventas/ventas.module').then( m => m.VentasPageModule)
      },
      {
        path: 'resumen',
        loadChildren: () => import('./resumen/resumen.module').then( m => m.ResumenPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('./perfil/perfil.module').then( m => m.PerfilPageModule)
      },
      {
        path: 'reciclaje',
        loadChildren: () => import('./reciclaje/reciclaje.module').then( m => m.ReciclajePageModule)
      },
    ]
  },  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
