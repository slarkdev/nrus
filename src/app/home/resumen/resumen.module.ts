import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ResumenPageRoutingModule } from './resumen-routing.module';
import { ResumenPage } from './resumen.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxChartsModule } from '@swimlane/ngx-charts';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResumenPageRoutingModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    NgxChartsModule
  ],
  declarations: [ResumenPage]
})
export class ResumenPageModule {}
