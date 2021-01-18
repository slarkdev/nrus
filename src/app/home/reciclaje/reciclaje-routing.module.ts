import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReciclajePage } from './reciclaje.page';

const routes: Routes = [
  {
    path: '',
    component: ReciclajePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReciclajePageRoutingModule {}
