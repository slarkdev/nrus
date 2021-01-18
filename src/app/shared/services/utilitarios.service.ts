import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable({
    providedIn: 'root'
})
export class UtilitariosService {
    constructor(private router: Router) { }

    public convertirFechaGuionesSlash(fecha: string) {        
        let f = fecha.split('-');
        return f[2] + '/' + f[1] + '/' + f[0];
    }
    public soloFecha(fecha: string) {
        let f = fecha.split('T');
        
        let res = '';
        if (f.length > 1) {
           res = this.convertirFechaGuionesSlash(f[0]);
        }
        return res;
    }

    public soloFechaGuiones(fecha: string) {
        let f = fecha.split('T');
        return f[0];
    }
    public soloMes(fecha: string) {
        let f = fecha.split('T');
        f = f[0].split('-');
        let res = f[1];
        return res;
    }

    public soloAnio(fecha: string) {
        let f = fecha.split('T');
        f = f[0].split('-');
        let res = f[0];
        return res;
    }
    public redirectUser(isVerified: boolean): void {
        if (isVerified) {
            this.router.navigate(['/home']);
        } else {
            this.router.navigate(['/verify-email']);
        }
    }

    public sumarArray(array: any[]) {
        let suma: number = 0;
        if (array.length > 1) {
            suma = Object.values(array).reduce((t, { Monto }) => t + Monto, 0);
        } else {
            suma = array[0]?.Monto || 0.00;
        }
        return suma;
    }
}