import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import Swal from "sweetalert2";

//servicios
import { UtilitariosService } from "../../shared/services/utilitarios.service";
import { AuthService } from 'src/app/shared/services/auth.service';
import { ResumenService } from 'src/app/shared/services/resumen.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { ComprasService } from '../../shared/services/compras.service';
import { ErrorService } from "../../shared/services/error.service";
import { PDFService } from 'src/app/shared/services/pdf.service';

// interfaces
import { Resumen } from 'src/app/shared/models/resumen.interface';
import { User } from 'src/app/shared/models/user.interface';
import { Compras } from "../../shared/models/compras.interface";

@Component({
  selector: 'app-compras',
  templateUrl: './compras.page.html',
  styleUrls: ['./compras.page.scss'],
})
export class ComprasPage implements OnInit {
  meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  mes: string;
  sumaCompras = 0;
  compras: Compras[] = new Array<Compras>();
  comprasAux: Compras[] = new Array<Compras>();
  compraForm: FormGroup;
  compra: Compras; // = new Compras();

  user: User = {
    uid: '',
    email: '',
    displayName: '',
  };

  resumen: Resumen = {
    Fecha: '',
    Compras: this.sumaCompras,
    Ventas: 0,
    Estado: true,
    Foto: '',
    NombreFoto: '',
    Observacion: '',
    UsuarioCrea: this.user.uid,
    UsuarioModifica: this.user.uid,
  };

  show: boolean = false;
  modify: boolean = false;
  hideButtons: boolean = false;

  constructor(private comprasSvc: ComprasService,
    private camera: Camera,
    public util: UtilitariosService,
    private authSvc: AuthService,
    private resumenSvc: ResumenService,
    private loading: LoadingService,
    private pdfSvc: PDFService,
    private errorSvc: ErrorService
  ) { }

  async ngOnInit() {
    try {
      this.mes = (new Date()).toISOString();
      this.limpiar();
      this.authSvc.afAuth.user.subscribe(res => {
        this.user = res;
      });
      await this.listarCompras();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  async listarCompras() {
    try {
      await this.comprasSvc.getCompras().subscribe(res => {
        this.compras = res;
        this.comprasAux = this.compras;
        this.filtrarCompras();
      });

    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  verTodo() {
    try {
      this.comprasSvc.getCompras().subscribe(res => {
        this.compras = res;
        this.comprasAux = this.compras;
        this.sumaCompras = this.util.sumarArray(this.compras);
        this.resumen.Compras = this.sumaCompras;        
        this.hideButtons = true;
      });
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  limpiar() {
    this.compraForm = new FormGroup({
      ConceptoCompra: new FormControl('', [Validators.maxLength(50), Validators.required]),
      Monto: new FormControl('', [Validators.maxLength(50), Validators.required]),
      Fecha: new FormControl(new Date().toISOString(), [Validators.maxLength(50), Validators.required]),
      NombreFoto: new FormControl('', [Validators.required]),
      Foto: new FormControl('', [Validators.required]),
      Observacion: new FormControl(''),
    })
    this.modify = false;
    this.compra = {
      ConceptoCompra: '',
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
    this.listarCompras();
  }
  add() {
    this.limpiar();
    this.show = !this.show;
  }
  mod(row) {
    this.show = true;
    this.modify = true;
    this.compra = row;
    this.compraForm.setValue({
      ConceptoCompra: row.ConceptoCompra,
      Monto: row.Monto,
      Fecha: row.Fecha,
      NombreFoto: row.NombreFoto,
      Foto: row.Foto,
      Observacion: row.Observacion
    });
  }


  async addCompra() {
    try {
      this.compra = {
        ConceptoCompra: this.compraForm.value.ConceptoCompra,
        Monto: this.compraForm.value.Monto,
        Fecha: this.compraForm.value.Fecha,
        NombreFoto: this.compraForm.value.NombreFoto,
        Foto: this.compraForm.value.Foto,
        Observacion: this.compraForm.value.Observacion,
        Estado: true,
        UsuarioCrea: this.user.uid,
        UsuarioModifica: this.user.uid
      }

      await this.comprasSvc.addCompra(this.compra);
      this.limpiar();
      this.show = false;

      //aqui registramos en la tabla Resumenes si el mes seleccionado no existe
      await this.actualizarResumen();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  async updateCompra() {
    try {
      this.compra.ConceptoCompra = this.compraForm.value.ConceptoCompra;
      this.compra.Monto = this.compraForm.value.Monto;
      this.compra.Fecha = this.compraForm.value.Fecha;
      this.compra.NombreFoto = this.compraForm.value.NombreFoto;
      this.compra.Foto = this.compraForm.value.Foto;
      this.compra.Observacion = this.compraForm.value.Observacion;
      this.compra.UsuarioModifica = this.user.uid;
      this.comprasSvc.updateCompra(this.compra, this.compra.id);
      this.limpiar();
      this.show = false;

      //aqui registramos en la tabla Resumenes si el mes seleccionado no existe
      await this.actualizarResumen();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  delCompra(row) {
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
          this.comprasSvc.updateCompra(row, row.id);
          this.actualizarResumen();
        }
      })
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  filtrar(event) {
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
  async filtrarCompras() {
    try {
      this.hideButtons = false;
      let m = this.util.soloMes(this.mes);
      let a = this.util.soloAnio(this.mes);

      let data = this.comprasAux;
      this.compras = this.comprasAux.filter((e) => {
        return this.util.soloMes(e.Fecha) === m && this.util.soloAnio(e.Fecha) === a
      });
      this.comprasAux = data;

      this.sumaCompras = this.util.sumarArray(this.compras);
      await this.actualizarResumen();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  async actualizarResumen() {
    try {
      await this.loading.abrir();
      console.log('actualizando resumen en compras');
      let f = this.util.soloFechaGuiones(this.mes);
      f = f.slice(0, -2) + '01';

      // actualizamos el valor de la tabla resumen
      this.resumenSvc.getResumenFecha(f).subscribe(res => {
        if (res.length === 0) {
          this.resumen = {
            Fecha: f,
            Compras: this.sumaCompras,
            Ventas: 0,
            Estado: true,
            Foto: '',
            NombreFoto: '',
            Observacion: '',
            UsuarioCrea: this.user.uid,
            UsuarioModifica: this.user.uid,
          };
          this.resumenSvc.addResumen(this.resumen).then(() => this.loading.cerrar());
          console.log('se agrego');          
        }
        else {
          this.resumen = res[0];
          if (res[0].Compras !== this.sumaCompras) {
            this.resumen.Compras = this.sumaCompras;
            this.resumen.UsuarioModifica = this.user.uid;
            this.resumenSvc.updateResumen(this.resumen, this.resumen.id).then(() => this.loading.cerrar());
            console.log('se modifico');
          } else { 
            this.loading.cerrar();
            console.log('no se modifico'); }
        }
      })
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
      this.compraForm.controls.Foto.setValue('data:image/jpeg;base64,' + imageData);
      this.compra.Foto = 'data:image/jpeg;base64,' + imageData;
    }, (error) => {
      this.errorSvc.showError(error);
    });
  }

  verFoto(row) {
    Swal.fire({
      html: 'Fecha:  ' + this.util.soloFecha(row.Fecha) + '<br>'
        + 'Compra: ' + row.ConceptoCompra + '<br>'
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
    this.pdfSvc.construirPDF(this.compras, this.user, this.hideButtons ? '' : this.mes, this.sumaCompras, 'REPORTE DE COMPRAS - SHESSIRA', 'COMPRAS');
  }
}
