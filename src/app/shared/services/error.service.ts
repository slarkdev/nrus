import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  showError(error) {
    console.log('error', error);
    let message = error.message ? error.message : 'Ocurrió un error';
    if (error.code === "auth/weak-password") {
      message = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (error.code === "auth/invalid-email") {
      message = 'Ingrese un correo válido';
    }
    if (error.code === "auth/user-not-found") {
      message = 'El correo no esta asociado a un usuario';
    }
    if (error.code === "auth/wrong-password") {
      message = 'La contraseña ingresada es inválida';
    }
    if (error.code === "auth/popup-closed-by-user") {
      message = 'Ocurrió un error';
    }
    if (error.code === "auth/network-request-failed") {
      message = 'Necesita conexión de red para iniciar sesión';
    }
    if (error.code === 'auth/email-already-in-use') {
      message = 'El correo ya se encuentra en uso';
    }
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
    });
  }
}