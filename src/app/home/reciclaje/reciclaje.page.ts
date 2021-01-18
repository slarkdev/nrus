import { Component, OnInit } from '@angular/core';
import { Compras } from 'src/app/shared/models/compras.interface';
import Swal from "sweetalert2";

//servicios
import { UtilitariosService } from "../../shared/services/utilitarios.service";
import { AuthService } from 'src/app/shared/services/auth.service';
import { ResumenService } from 'src/app/shared/services/resumen.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { ComprasService } from '../../shared/services/compras.service';
import { ErrorService } from "../../shared/services/error.service";
import { VentasService } from 'src/app/shared/services/ventas.service';

// interfaces
import { User } from 'src/app/shared/models/user.interface';
import { Resumen } from 'src/app/shared/models/resumen.interface';
import { Ventas } from 'src/app/shared/models/ventas.interface';

@Component({
  selector: 'app-reciclaje',
  templateUrl: './reciclaje.page.html',
  styleUrls: ['./reciclaje.page.scss'],
})
export class ReciclajePage implements OnInit {
  meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  compras: Compras[] = new Array<Compras>();
  comprasAux: Compras[] = new Array<Compras>();

  ventas: Ventas[] = new Array<Ventas>();
  ventasAux: Ventas[] = new Array<Ventas>();

  user: User = {
    uid: '',
    email: '',
    displayName: '',
  };

  resumen: Resumen = {
    Fecha: '',
    Compras: 0,
    Ventas: 0,
    Estado: true,
    Foto: '',
    NombreFoto: '',
    Observacion: '',
    UsuarioCrea: this.user.uid,
    UsuarioModifica: this.user.uid,
  };

  constructor(private comprasSvc: ComprasService,
    private ventasSvc: VentasService,
    private resumenSvc: ResumenService,
    private authSvc: AuthService,
    private util: UtilitariosService,
    private loading: LoadingService,
    private errorSvc: ErrorService) { }

  async ngOnInit() {
    await this.listarCompras();
    await this.listarVentas();
    this.authSvc.afAuth.user.subscribe(res => {
      this.user = res;
    });
  }

  async listarCompras() {
    try {
      await this.loading.abrir();
      await this.comprasSvc.getComprasEliminadas().subscribe(res => {
        this.compras = res;
        this.comprasAux = this.compras;
      });
      this.loading.cerrar();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  async listarVentas() {
    try {
      await this.loading.abrir();
      await this.ventasSvc.getVentasEliminadas().subscribe(res => {
        this.ventas = res;
        this.ventasAux = this.ventas;
      });
      this.loading.cerrar();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  delCompra(row: Compras) {
    try {
      Swal.fire({
        icon: 'question',
        title: 'Mensaje de confirmación',
        text: '¿Esta seguro de eliminar este registro? No podrá recuperarlo',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Eliminar',
        cancelButtonText: 'No'
      }).then(res => {
        if (res.value) {
          this.comprasSvc.removeCompra(row.id);
        }
      })
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  delVenta(row: Ventas) {
    try {
      Swal.fire({
        icon: 'question',
        title: 'Mensaje de confirmación',
        text: '¿Esta seguro de eliminar este registro? No podrá recuperarlo',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Eliminar',
        cancelButtonText: 'No'
      }).then(res => {
        if (res.value) {
          this.ventasSvc.removeVenta(row.id);
        }
      })
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  async updateCompra(row: Compras) {
    try {
      Swal.fire({
        icon: 'question',
        title: 'Mensaje de confirmación',
        text: '¿Quiere recuperar este registro?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Recuperar',
        cancelButtonText: 'No'
      }).then(res => {
        if (res.value) {
          row.Estado = true;
          this.comprasSvc.updateCompra(row, row.id).then(() => {
            this.actualizarResumen(row.Fecha, 0, row.Monto);
          });
        }
      })
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  async updateVenta(row: Ventas) {
    try {
      Swal.fire({
        icon: 'question',
        title: 'Mensaje de confirmación',
        text: '¿Quiere recuperar este registro?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Recuperar',
        cancelButtonText: 'No'
      }).then(res => {
        if (res.value) {
          row.Estado = true;
          this.ventasSvc.updateVenta(row, row.id).then(() => {
            this.actualizarResumen(row.Fecha, row.Monto, 0);
          });
        }
      })
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  filtrarCompras(event) {
    if (this.comprasAux.length > 0) {
      let val = event.target.value.toLowerCase();
      let data = this.comprasAux;
      this.compras = this.comprasAux.filter(item => {
        return (item.ConceptoCompra ? item.ConceptoCompra.toString().toLowerCase().indexOf(val) !== -1 : false) || (item.Monto ? item.Monto.toString().toLowerCase().indexOf(val) !== -1 : false) || (item.Fecha ? item.Fecha.toString().toLowerCase().indexOf(val) !== -1 : false)
      }
      );
      this.comprasAux = data;
    }
  }
  filtrarVentas(event) {
    if (this.ventasAux.length > 0) {
      let val = event.target.value.toLowerCase();
      let data = this.ventasAux;
      this.ventas = this.ventasAux.filter(item => {
        return (item.ConceptoVenta ? item.ConceptoVenta.toString().toLowerCase().indexOf(val) !== -1 : false) || (item.Monto ? item.Monto.toString().toLowerCase().indexOf(val) !== -1 : false) || (item.Fecha ? item.Fecha.toString().toLowerCase().indexOf(val) !== -1 : false)
      });
      this.ventasAux = data;
    }
  }

  async actualizarResumen(mes: string, venta: number, compra: number) {
    try {
      console.log('actualizando resumen');

      await this.loading.abrir();
      let f = this.util.soloFechaGuiones(mes);
      f = f.slice(0, -2) + '01';
      let trampa = 0;
      // actualizamos el valor de la tabla resumen
      this.resumenSvc.getResumenFecha(f).subscribe(res => {
        trampa++;
        if (trampa < 2 && res.length > 0) {
          this.resumen = res[0];
          this.resumen.Compras = this.resumen.Compras + compra;
          this.resumen.Ventas = this.resumen.Ventas + venta;
          this.resumen.UsuarioModifica = this.user.uid;
          this.resumenSvc.updateResumen(this.resumen, this.resumen.id).then(() => this.loading.cerrar());
          console.log('se modifico');
        } else {
          this.loading.cerrar();
          console.log('no se modifico');
        }
      })
    } catch (error) {
      this.loading.cerrar();
      this.errorSvc.showError(error);
    }
  }

  verFoto(row) {
    Swal.fire({
      html: 'Fecha:  ' + this.util.soloFecha(row.Fecha) + '<br>'
        + 'Concepto: ' + row.ConceptoCompra ? row.ConceptoCompra : row.ConceptoVenta + '<br>'
        + 'Monto: ' + row.Monto.toFixed(2) + '<br>'
        + 'Observación: ' + row.Observacion,
      imageUrl: row.Foto,
      imageWidth: 300,
      imageHeight: 300,
      imageAlt: row.NombreFoto,
      backdrop: `
        rgba(123,0,34,0.45)
        `
    })
  }
}
