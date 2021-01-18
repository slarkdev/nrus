import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IonicModule } from '@ionic/angular';

import { ReciclajePageRoutingModule } from './reciclaje-routing.module';
import { ReciclajePage } from './reciclaje.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReciclajePageRoutingModule,
    NgxDatatableModule
  ],
  declarations: [ReciclajePage]
})
export class ReciclajePageModule {}
