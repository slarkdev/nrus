import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// services
import { AuthService } from '../../shared/services/auth.service';
import { LoadingService } from '../../shared/services/loading.service';
import { UtilitariosService } from 'src/app/shared/services/utilitarios.service';
import { ErrorService } from 'src/app/shared/services/error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  login: boolean = true;
  show: boolean = false;
  loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  })
  
  constructor(private authSvc: AuthService,
    private router: Router,
    private loadingSvc: LoadingService,
    private util: UtilitariosService,
    private errorSvc: ErrorService) { }

  async ngOnInit() {
    try {
      await this.loadingSvc.abrir();
      await this.authSvc.afAuth.onAuthStateChanged(res => {        
        if (res) {          
          const isVerified = this.authSvc.isEmailVerified(res);
          this.util.redirectUser(isVerified);
        }
        this.loadingSvc.cerrar();
      })
    } catch (error) {
      this.loadingSvc.cerrar();
      this.errorSvc.showError(error);
    }
  }
  async onLogin() {
    try {
      await this.loadingSvc.abrir();
      const user = await this.authSvc.login(this.loginForm.value.email, this.loginForm.value.password);
      if (user) {
        const isVerified = this.authSvc.isEmailVerified(user);
        this.util.redirectUser(isVerified);
      }
      this.loadingSvc.cerrar();
    } catch (error) {
      this.loadingSvc.cerrar();
      this.errorSvc.showError(error);
    }
  }

  async onGoogleLogin() {
    try {
      await this.loadingSvc.abrir();
      const user = await this.authSvc.loginGoogle();
      if (user) {
        const isVerified = this.authSvc.isEmailVerified(user);
        this.util.redirectUser(isVerified);
      }
      this.loadingSvc.cerrar();
    } catch (error) {
      this.loadingSvc.cerrar();
      this.errorSvc.showError(error);
    }
  }

  async onFacebookLogin() {
    try {
      await this.loadingSvc.abrir();
      const user = await this.authSvc.loginFacebook();
      if (user) {
        const isVerified = this.authSvc.isEmailVerified(user);
        this.util.redirectUser(isVerified);
        this.loadingSvc.cerrar();
      }
    } catch (error) {
      this.loadingSvc.cerrar();
      this.errorSvc.showError(error);
    }
  }
}
