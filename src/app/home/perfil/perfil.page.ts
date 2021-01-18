import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import Swal from 'sweetalert2';

// services
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { ErrorService } from 'src/app/shared/services/error.service';

// interfaces
import { User } from 'src/app/shared/models/user.interface';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  perfilForm: FormGroup = new FormGroup({
    nombres: new FormControl(''),
    email: new FormControl(''),
    PhotoURL: new FormControl(''),
  });

  passwordForm: FormGroup = new FormGroup({
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  })

  user: firebase.User;
  show=false;
  constructor(private authSvc: AuthService,
    private camera: Camera,
    private loading: LoadingService,
    private router: Router,
    private errorSvc: ErrorService) { }

  async ngOnInit() {
    try {
      await this.loading.abrir();
      this.authSvc.afAuth.user.subscribe(res => {
        this.user = res;
        this.perfilForm.setValue({
          nombres: res?.displayName,
          email: res?.email,
          PhotoURL: res?.photoURL,
        });
      });
      this.loading.cerrar();
    } catch (error) {
      this.loading.cerrar();
      this.errorSvc.showError(error);
    }
  }

  tomarFoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then((imageData) => {
      this.perfilForm.controls.PhotoURL.setValue('data:image/jpeg;base64,' + imageData);
    }, (error) => {
      this.errorSvc.showError(error);
    });
  }

  verFoto() {
    Swal.fire({
      text: this.perfilForm.value.nombres,
      imageUrl: this.perfilForm.value.PhotoURL,
      imageWidth: 300,
      imageHeight: 300,
      imageAlt: this.perfilForm.value.nombres,
      backdrop: `
        rgba(123,0,34,0.45)
        `
    })
  }

  async actualizarDatos() {
    try {
      if (this.perfilForm.valid) {

        let message = 'Ocurrió un error. Intente más tarde';
        let passAntiguo = '';
        await Swal.fire({
          title: 'Ingrese su contraseña',
          input: 'text',
          inputAttributes: {
            autocapitalize: 'off'
          },
          showCancelButton: true,
          confirmButtonText: 'OK',
          showLoaderOnConfirm: true,
          allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
          if (result) {
            passAntiguo = result.value.toString();
          }
        });
        await this.loading.abrir();
        if (this.passwordForm.value.password !== '' && this.passwordForm.value.confirmPassword !== '' && this.passwordForm.valid) {
          if (this.passwordForm.value.password === this.passwordForm.value.confirmPassword) {
            message = await this.actualizarPerfil(passAntiguo, true) ? 'Los datos se actualizaron correctamente' : 'No se puede actualizar los datos de usuario';
            this.authSvc.logout();
            this.router.navigate(['/login']);
          } else {
            message = 'Las contraseñas no coinciden'
          }
        } else {
          message = await this.actualizarPerfil(passAntiguo) ? 'Los datos se actualizaron correctamente' : 'No se puede actualizar los datos de usuario';
        }
        this.loading.cerrar();
        Swal.fire({
          icon: 'info',
          text: message,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        })
      }
    } catch (error) {
      this.loading.cerrar();
      this.errorSvc.showError(error);
    }
  }

  async actualizarPerfil(passAntiguo, passNuevo?) {
    try {
      let res = false;
      const usuario: User = {
        uid: this.user.uid,
        email: this.perfilForm.value.email,
        emailVerified: this.user.emailVerified,
        displayName: this.perfilForm.value.nombres,
        photoURL: this.perfilForm.value.PhotoURL,
        role: 'USUARIO',
      };
      const userCredential = await this.authSvc.afAuth.signInWithEmailAndPassword(this.user.email, passAntiguo)
      if (userCredential) {
        if (this.perfilForm.value.email !== this.user.email) {
          await userCredential.user.updateEmail(this.perfilForm.value.email);
        }
        await userCredential.user.updateProfile({
          photoURL: this.perfilForm.value.PhotoURL,
          displayName: this.perfilForm.value.nombres,
        });
        if (passNuevo) {
          await userCredential.user.updatePassword(this.passwordForm.value.password);
        }
        await this.authSvc.updateUserData(usuario);
        this.user = userCredential.user;
        res = true;
      }
      this.perfilForm.setValue({
        nombres: this.user.displayName,
        email: this.user.email,
        PhotoURL: this.user.photoURL,
      });
      return res;
    } catch (error) {
      this.errorSvc.showError(error);
      this.perfilForm.setValue({
        nombres: this.user.displayName,
        email: this.user.email,
        PhotoURL: this.user.photoURL,
      });
      return false;
    }
  }
}
