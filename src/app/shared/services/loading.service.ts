import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading = false;

  constructor(public loadingController: LoadingController) { }

  async abrir() {
    this.isLoading = true;
    return await this.loadingController.create({
      message: 'Por favor espere',
      spinner: 'circular',
      translucent: true,
      cssClass: 'loading',
      backdropDismiss: true
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss();
        }
      });
    });
  }

  async cerrar() {
    if (this.isLoading) {
      this.isLoading = false;
      return await this.loadingController.dismiss();
    }
    return null;
  }
}