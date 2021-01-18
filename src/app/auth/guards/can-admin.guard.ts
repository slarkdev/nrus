import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import Swal from "sweetalert2";

// services
import { AuthService } from '../../shared/services/auth.service';
@Injectable({
  providedIn: 'root'
})
export class CanAdminGuard implements CanActivate {

  constructor(private authSvc: AuthService, private router: Router) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.authSvc.user$.pipe(
      take(1),
      map((user) => {
        if(user) {
          // significa que se logeó
          return user && this.authSvc.isAdmin(user) 
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Acceso denegado. Necesitas permisos.',
          });
          this.authSvc.logout();
          this.router.navigate(['/login'])
          return false
        }}),
      tap(canEdit => {
        if (!canEdit) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Acceso denegado. Necesitas permisos de administrador.',
          });
          // this.router.navigate(['/login'])
          return false;
        } else { return true }
      })
    );
  }
}
