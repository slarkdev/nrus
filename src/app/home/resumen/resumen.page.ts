import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import Swal from 'sweetalert2';

// services
import { AuthService } from 'src/app/shared/services/auth.service';
import { ResumenService } from 'src/app/shared/services/resumen.service';
import { UtilitariosService } from 'src/app/shared/services/utilitarios.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { ErrorService } from 'src/app/shared/services/error.service';
import { PDFService } from 'src/app/shared/services/pdf.service';

// interfaces
import { Resumen } from 'src/app/shared/models/resumen.interface';
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss'],
})
export class ResumenPage implements OnInit {
  user;
  graficoBarras: any[] = [];
  graficoCircular: any[] = [];
  graficoBarrasTotal: any[] = [];
  anio: string = (new Date()).toISOString();
  resumenes: Resumen[] = new Array<Resumen>();
  resumenesAux: Resumen[] = new Array<Resumen>();
  resumenForm: FormGroup;
  resumen: Resumen;
  sumaComprasAnual = 0;
  sumaVentasAnual = 0;
  show: boolean = false;

  colorScheme = {
    domain: ['#eb445a', '#6370ff', '#50c8ff']
  };

  constructor(private authSvc: AuthService,
    private resumenSvc: ResumenService,
    private camera: Camera,
    private util: UtilitariosService,
    private loading: LoadingService,
    private pdfSvc: PDFService,
    private errorSvc: ErrorService) {
  }

  async ngOnInit() {
    try {
      this.limpiar();
      // this.user = (await this.authSvc.afAuth.currentUser).uid;
      await this.authSvc.afAuth.user.subscribe(res => {
        this.user = res;
      });
      this.listarResumenes();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  async listarResumenes() {
    try {
      await this.loading.abrir();
      await this.resumenSvc.getResumenes().subscribe(res => {
        this.resumenes = res;
        this.resumenesAux = this.resumenes;
        this.filtrarResumenes();
        this.loading.cerrar();
      });
    } catch (error) {
      this.loading.cerrar();
      this.errorSvc.showError(error);
    }
  }

  limpiar() {
    this.resumenForm = new FormGroup({
      Observacion: new FormControl(''),
      Foto: new FormControl('', Validators.required),
      NombreFoto: new FormControl('', Validators.required),
    })
    this.resumen = {
      Compras: 0,
      Ventas: 0,
      Fecha: '',
      NombreFoto: '',
      Foto: '',
      Observacion: '',
      Estado: false,
      UsuarioCrea: '',
      UsuarioModifica: ''
    }
    this.show = false;
  }
  refresh() {
    this.limpiar();
    this.listarResumenes();
  }

  tomarFoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then((imageData) => {
      this.resumenForm.controls.Foto.setValue('data:image/jpeg;base64,' + imageData);
      this.resumenForm.controls.NombreFoto.setValue(this.resumen.Fecha + '.jpg');
      this.resumen.Foto = 'data:image/jpeg;base64,' + imageData;

    }, (error) => {
      this.errorSvc.showError(error);
    });
  }

  verFoto(row) {
    Swal.fire({
      // title: row.NombreFoto,
      html: 'Fecha:  ' + this.util.soloFecha(row.Fecha) + '<br>'
        + 'Compras: ' + row.Compras + '<br>'
        + 'Ventas: ' + row.Ventas.toFixed(2) + '<br>'
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
  agregarFoto(row) {
    this.show = true;
    this.resumen = row;
    this.resumenForm.setValue({
      Observacion: row.Observacion,
      Foto: row.Foto,
      NombreFoto: row.NombreFoto
    });
  }

  async updateResumen() {
    await this.loading.abrir();
    this.resumen.Observacion = this.resumenForm.value.Observacion;
    this.resumen.Foto = this.resumenForm.value.Foto;
    this.resumen.NombreFoto = this.resumenForm.value.NombreFoto;
    this.resumen.UsuarioModifica = this.user.uid;
    await this.resumenSvc.updateResumen(this.resumen, this.resumen.id);
    this.limpiar();
    this.loading?.cerrar();
  }

  filtrarResumenes() {
    let a = this.util.soloAnio(this.anio);
    let data = this.resumenesAux;
    this.resumenes = this.resumenesAux.filter((e) => {
      return this.util.soloAnio(e.Fecha) === a
    });
    this.resumenesAux = data;
    this.sumaComprasAnual = this.sumarCompras(this.resumenes);
    this.sumaVentasAnual = this.sumarVentas(this.resumenes);
    this.crearGrafico(this.resumenes);
    this.crearGraficoTodosAnios(this.resumenesAux);
  }
  sumarCompras(array: Resumen[]) {
    let suma = 0;
    if (array.length > 1) {
      suma = Object.values(array).reduce((t, { Compras }) => t + Compras, 0);
    } else {
      suma = array[0]?.Compras || 0.00;
    }
    return suma;
  }
  sumarVentas(array: Resumen[]) {
    let suma = 0;
    if (array.length > 1) {
      suma = Object.values(array).reduce((t, { Ventas }) => t + Ventas, 0);
    } else {
      suma = array[0]?.Ventas || 0.00;
    }
    return suma;
  }
  crearGrafico(array: Resumen[]) {
    this.graficoBarras = array.map((x) => {
      return {
        name: this.util.soloMes(x.Fecha) + '/' + this.util.soloAnio(x.Fecha),
        series: [{
          name: 'Compras',
          value: x.Compras
        },
        {
          name: 'Ventas',
          value: x.Ventas
        }]
      }
    });
    this.graficoCircular = [
      {
        name: 'Compras Anual',
        value: this.sumaComprasAnual
      },
      {
        name: 'Ventas Anual',
        value: this.sumaVentasAnual
      }
    ];
  }
  crearGraficoTodosAnios(array: Resumen[]) {

    this.graficoBarrasTotal = array.map((e) => {
      let anio = this.util.soloAnio(e.Fecha);
      let arrayAux = array.filter((e) => {
        return this.util.soloAnio(e.Fecha) === anio
      });
      let comprasAnual: number = this.sumarCompras(arrayAux);
      let ventasAnual: number = this.sumarVentas(arrayAux);

      return {
        name: anio,
        series: [{
          name: 'Compras',
          value: comprasAnual
        },
        {
          name: 'Ventas',
          value: ventasAnual
        }]
      }
    });
    let hash = {};
    this.graficoBarrasTotal = this.graficoBarrasTotal.filter(o => hash[o.name] ? false : hash[o.name] = true);

  }

  async descargar() {
    await this.loading.abrir();

    const chart = document.getElementById('chart-barras');
    const pie = document.getElementById('chart-pie');
    const chartTotal = document.getElementById('chart-barras-total');

    const options = {
      background: 'white',
      quality: 1
    };
    domtoimage.toPng(chart, options).then((img) => {
      domtoimage.toPng(pie, options).then((img2) => {
        domtoimage.toPng(chartTotal, options).then((img3) => {
          this.pdfSvc.construirPDFResumen(this.resumenes, this.user, this.anio, this.sumaComprasAnual, this.sumaVentasAnual, img, img2, img3).then(() => { this.loading.cerrar() });;
        })
      })
    })
  }
}
