import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// services
import { AuthService } from '../shared/services/auth.service';
import { ErrorService } from '../shared/services/error.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  user: any = {
    displayName: '',
    email: '',
    photoURL: '',
  };
  constructor(private router: Router, private authSvc: AuthService, private errorSvc: ErrorService) {
  }
  async ngOnInit() {
    this.user = await this.authSvc.afAuth.currentUser;
  }
  compras() {
    this.router.navigate(['home/compras']);
  }
  ventas() {
    this.router.navigate(["home/ventas"]);
  }
  resumen() {
    this.router.navigate(["/home/resumen"]);
  }
  perfil() {
    this.router.navigate(["/home/perfil"]);
  }
  reciclaje() {
    this.router.navigate(["/home/reciclaje"]);
  }
  async logout() {
    try {
      await this.authSvc.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
}
