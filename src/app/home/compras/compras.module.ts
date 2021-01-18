import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComprasPageRoutingModule } from './compras-routing.module';

import { ComprasPage } from './compras.page';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
// import { Camera } from '@ionic-native/camera/ngx';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComprasPageRoutingModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    // Camera
  ],
  declarations: [ComprasPage]
})
export class ComprasPageModule {}
