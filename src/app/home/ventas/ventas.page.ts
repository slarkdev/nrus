import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import Swal from "sweetalert2";

//servicios
import { UtilitariosService } from "../../shared/services/utilitarios.service";
import { AuthService } from 'src/app/shared/services/auth.service';
import { ResumenService } from 'src/app/shared/services/resumen.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { ErrorService } from "../../shared/services/error.service";
import { PDFService } from 'src/app/shared/services/pdf.service';
import { VentasService } from 'src/app/shared/services/ventas.service';

// interfaces
import { Resumen } from 'src/app/shared/models/resumen.interface';
import { User } from 'src/app/shared/models/user.interface';
import { Ventas } from "../../shared/models/ventas.interface";

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.page.html',
  styleUrls: ['./ventas.page.scss'],
})
export class VentasPage implements OnInit {
  meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  mes: string;
  sumaVentas = 0;
  ventas: Ventas[] = new Array<Ventas>();
  ventasAux: Ventas[] = new Array<Ventas>();
  ventaForm: FormGroup;
  venta: Ventas;

  user: User = {
    uid: '',
    email: '',
    displayName: '',
  };

  resumen: Resumen = {
    Fecha: '',
    Compras: 0,
    Ventas: this.sumaVentas,
    Estado: true,
    Foto: '',
    NombreFoto: '',
    Observacion: '',
    UsuarioCrea: this.user.uid,
    UsuarioModifica: this.user.uid,
  };

  show: boolean = false;
  modify: boolean = false;
  hideButtons: boolean= false;

  constructor(
    private ventasSvc: VentasService,
    private camera: Camera,
    public util: UtilitariosService,
    private authSvc: AuthService,
    private resumenSvc: ResumenService,
    private loading: LoadingService,
    private pdfSvc: PDFService,
    private errorSvc: ErrorService
  ) { }

  async ngOnInit() {
    this.mes = (new Date()).toISOString();
    this.limpiar();
    this.listarVentas();

    this.authSvc.afAuth.user.subscribe(res => {
      this.user = res;
    });
  }

  listarVentas() {
    try {
      this.ventasSvc.getVentas().subscribe(res => {
        this.ventas = res;
        this.ventasAux = this.ventas;
        this.filtrarVentas();
      });

    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  verTodo() {
    try {
      this.ventasSvc.getVentas().subscribe(res => {
        this.ventas = res;
        this.ventasAux = this.ventas;
        this.sumaVentas = this.util.sumarArray(this.ventas);
        this.resumen.Ventas = this.sumaVentas;
        this.hideButtons = true;
      });
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  limpiar() {
    this.ventaForm = new FormGroup({
      ConceptoVenta: new FormControl('', [Validators.maxLength(50), Validators.required]),
      Monto: new FormControl('', [Validators.maxLength(50), Validators.required]),
      Fecha: new FormControl(new Date().toISOString(), [Validators.maxLength(50), Validators.required]),
      NombreFoto: new FormControl('', [Validators.required]),
      Foto: new FormControl('', [Validators.required]),
      Observacion: new FormControl(''),
    })
    this.modify = false;
    this.venta = {
      ConceptoVenta: '',
      Monto: 0,
      Fecha: '',
      NombreFoto: '',
      Foto: '',
      Observacion: '',
      Estado: false,
      UsuarioCrea: '',
      UsuarioModifica: ''
    }
  }
  refresh() {
    this.listarVentas();
  }
  add() {
    this.limpiar();
    this.show = !this.show;
  }
  mod(row) {
    this.show = true;
    this.modify = true;
    this.venta = row;
    this.ventaForm.setValue({
      ConceptoVenta: row.ConceptoVenta,
      Monto: row.Monto,
      Fecha: row.Fecha,
      NombreFoto: row.NombreFoto,
      Foto: row.Foto,
      Observacion: row.Observacion
    });
  }

  
  async addVenta() {
    try {
      this.venta = {
        ConceptoVenta: this.ventaForm.value.ConceptoVenta,
        Monto: this.ventaForm.value.Monto,
        Fecha: this.ventaForm.value.Fecha,
        NombreFoto: this.ventaForm.value.NombreFoto,
        Foto: this.ventaForm.value.Foto,
        Observacion: this.ventaForm.value.Observacion,
        Estado: true,
        UsuarioCrea: this.user.uid,
        UsuarioModifica: this.user.uid
      }

      await this.ventasSvc.addVenta(this.venta);
      this.limpiar();
      this.show = false;

      //aqui registramos en la tabla Resumenes si el mes seleccionado no existe
      await this.actualizarResumen();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  async updateVenta() {
    try {
      this.venta.ConceptoVenta = this.ventaForm.value.ConceptoVenta;
      this.venta.Monto = this.ventaForm.value.Monto;
      this.venta.Fecha = this.ventaForm.value.Fecha;
      this.venta.NombreFoto = this.ventaForm.value.NombreFoto;
      this.venta.Foto = this.ventaForm.value.Foto;
      this.venta.Observacion = this.ventaForm.value.Observacion;
      this.venta.UsuarioModifica = this.user.uid;
      this.ventasSvc.updateVenta(this.venta, this.venta.id);
      this.limpiar();
      this.show = false;

      //aqui registramos en la tabla Resumenes si el mes seleccionado no existe
      await this.actualizarResumen();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  delVenta(row) {
    try {
      Swal.fire({
        icon: 'question',
        title: 'Mensaje de confirmación',
        text: '¿Esta seguro de eliminar este registro?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Eliminar',
        cancelButtonText: 'No'
      }).then(res => {
        if (res.value) {
          row.Estado = false;
          this.show = false;
          this.ventasSvc.updateVenta(row, row.id);
          this.actualizarResumen();
          //actualizar la tabla resumen
        }
      })
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  filtrar(event) {
    if (this.ventasAux.length > 0) {
      let val = event.target.value.toLowerCase();
      let keys = Object.keys(this.ventasAux[0]);
      let data = this.ventasAux;
      this.ventas = this.ventasAux.filter(item => {
        return (item.ConceptoVenta ? item.ConceptoVenta.toString().toLowerCase().indexOf(val) !== -1 : false) || (item.Monto ? item.Monto.toString().toLowerCase().indexOf(val) !== -1 : false) || (item.Fecha ? item.Fecha.toString().toLowerCase().indexOf(val) !== -1 : false)
      });
      this.ventasAux = data;
    }
  }
  async filtrarVentas() {
    try {
      this.hideButtons = false;
      let m = this.util.soloMes(this.mes);
      let a = this.util.soloAnio(this.mes);

      let data = this.ventasAux;
      this.ventas = this.ventasAux.filter((e) => {
        return this.util.soloMes(e.Fecha) === m && this.util.soloAnio(e.Fecha) === a
      });
      this.ventasAux = data;
      this.sumaVentas = this.util.sumarArray(this.ventas);
      await this.actualizarResumen();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  async actualizarResumen() {
    try {
      await this.loading.abrir();
      let f = this.util.soloFechaGuiones(this.mes);
      f = f.slice(0, -2) + '01';

      // actualizamos el valor de la tabla resumen
      this.resumenSvc.getResumenFecha(f).subscribe(res => {
        if (res.length === 0) {
          this.resumen = {
            Fecha: f,
            Compras: 0,
            Ventas: this.sumaVentas,
            Estado: true,
            Foto: '',
            NombreFoto: '',
            Observacion: '',
            UsuarioCrea: this.user.uid,
            UsuarioModifica: this.user.uid,
          };
          this.resumenSvc.addResumen(this.resumen);
        }
        else {
          this.resumen = res[0];
          if (res[0].Ventas !== this.sumaVentas) {
            this.resumen.Ventas = this.sumaVentas;
            this.resumen.UsuarioModifica = this.user.uid;
            this.resumenSvc.updateResumen(this.resumen, this.resumen.id);
          }
        }
      })
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
      this.ventaForm.controls.Foto.setValue('data:image/jpeg;base64,' + imageData);
      this.venta.Foto = 'data:image/jpeg;base64,' + imageData;
    }, (error) => {
      this.errorSvc.showError(error);
    });
  }

  verFoto(row) {
    Swal.fire({
      html: 'Fecha:  ' + this.util.soloFecha(row.Fecha) + '<br>'
        + 'Venta: ' + row.ConceptoVenta + '<br>'
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


  descargar() {
    this.pdfSvc.construirPDF(this.ventas, this.user, this.hideButtons ? '' : this.mes, this.sumaVentas,'REPORTE DE VENTAS - SHESSIRA', 'VENTAS');
  }
}
