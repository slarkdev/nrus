import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// services
import { AuthService } from '../../shared/services/auth.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { ErrorService } from 'src/app/shared/services/error.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  userEmail = new FormControl('');
  constructor(private authSvc: AuthService, private router: Router, private loading: LoadingService, private errorSvc: ErrorService) { }

  ngOnInit() {
  }
  async onReset() {
    try {
      this.loading.abrir();
      const email = this.userEmail.value;
      await this.authSvc.resetPassword(email);
      this.loading.cerrar();
      Swal.fire({
        icon: 'success',
        title: 'Verificar Correo',
        text: 'Se envió un correo para que recupere su contraseña. Revise su bandeja de entrada',
      });
      this.router.navigate(['/login'])
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
}
