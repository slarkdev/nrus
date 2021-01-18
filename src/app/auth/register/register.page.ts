import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// services
import { AuthService } from '../../shared/services/auth.service';
import { UtilitariosService } from 'src/app/shared/services/utilitarios.service';
import { ErrorService } from 'src/app/shared/services/error.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  show: boolean = false;
  registerForm = new FormGroup({
    nombres: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
  })

  constructor(private authSvc: AuthService, private router: Router, private util: UtilitariosService, private errorSvc: ErrorService) { }

  ngOnInit() {
  }

  //#region Registrarse
  async onRegister() {
    // const { email, password } = this.registerForm.value;
    try {
      if (this.registerForm.valid) {
        if (this.registerForm.value.password === this.registerForm.value.confirmPassword) {
          const user = await this.authSvc.register(this.registerForm.value.nombres, this.registerForm.value.email, this.registerForm.value.password);
          if (user) {
            const isVerified = this.authSvc.isEmailVerified(user);
            this.util.redirectUser(isVerified);
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Las contraseñas no coinciden',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
        }
      }
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  //#endregion Registrarse
}
