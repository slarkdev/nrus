import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

// services
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AuthService } from '../../shared/services/auth.service';

// interfaces
import { User } from '../../shared/models/user.interface';
import { ErrorService } from 'src/app/shared/services/error.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage implements OnDestroy {
  public user$: Observable<User> = this.authSvc.afAuth.user;
  constructor(private authSvc: AuthService,
    private router: Router,
    private loading: LoadingService,
    private errorSvc: ErrorService) { }

  ngOnDestroy() {
    this.authSvc.logout();
    this.router.navigate(['/login'])
  }

  async onSendEmail(): Promise<void> {
    try {
      this.loading.abrir();
      await this.authSvc.sendVerificationEmail();
      this.loading.cerrar();
      Swal.fire({
        icon: 'success',
        title: 'Verificar Correo',
        text: 'Se volvió a enviar el correo. Revise su bandeja de entrada',
      });      
      this.router.navigate(['/login']);
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
}
