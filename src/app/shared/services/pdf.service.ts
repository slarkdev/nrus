import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// interfaces
import { Resumen } from '../models/resumen.interface';
import { LoadingService } from './loading.service';
import { User } from '../models/user.interface';
import { UtilitariosService } from './utilitarios.service';

@Injectable({
  providedIn: 'root'
})
export class PDFService {
  pdf: any;
  color = '#ed576b';
  constructor(
    private loadingSvc: LoadingService,
    private util: UtilitariosService
  ) { }

  async construirPDF(array: any[], user: User, fecha: string, sumaCompras: number, titulo: string, nombreTabla: string) {
    if (array.length > 0) {
      await this.loadingSvc.abrir();
      let aux = this.util.soloMes(fecha) + '/' + this.util.soloAnio(fecha);
      fecha = aux ? 'FECHA: ' + aux : fecha;
      let datos = this.contruirDatos(array, sumaCompras, nombreTabla);
      let docDefinition = {
        info: {
          title: titulo,
          author: 'SHESSIRA',
          subject: user.displayName,
          keywords: 'Documento de ' + nombreTabla + ' generado por: ' + user.displayName,
          creationDate: fecha,
        },
        fontsize: 8,
        pageSize: 'A4',
        pageOrientation: 'portrait',   //landscape
        watermark: { text: 'Shessira', fontSize: 120, color: 'pink', opacity: 0.25, bold: true, italics: false, angle: -60 },
        footer: function (currentPage, pageCount) { return { text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'center', fontsize: 8 } },
        content: [
          {
            text: titulo,
            style: 'header',
          },
          {
            text: fecha,
            style: 'subheader',
          },
          {
            style: 'small',
            table: {
              heights: 20,
              widths: [20, 60, 120, 70, 100, 100],
              body: datos,
            },
          },
        ],
        styles: {
          header: {
            alignment: 'center',
            fontSize: 18,
            bold: true
          },
          subheader: {
            alignment: 'center',
            fontSize: 9,
            bold: true
          },
          small: {
            alignment: 'center',
            fontSize: 8,
            margin: [0, 10, 0, 10]
          },
        }
      };
      this.pdf = pdfMake.createPdf(docDefinition);
      this.pdf.download(titulo);
      this.loadingSvc.cerrar();
    } else {
      Swal.fire({
        icon: 'info',
        text: 'No hay elementos para mostrar',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
  }
  async construirPDFResumen(array: Resumen[], user: User, fecha: string, comprasAnual: number, ventasAnual: number, grafico1, grafico2, grafico3) {
    if (array.length > 0) {

      fecha = this.util.soloAnio(fecha);
      let datos = this.contruirDatosResumen(array, comprasAnual, ventasAnual);

      let docDefinition: any = {
        info: {
          title: 'RESUMEN ANUAL ' + fecha,
          author: 'SHESSIRA',
          subject: user.displayName,
          keywords: 'Resumen Anual generado por: ' + user.displayName,
          creationDate: fecha,
        },
        fontsize: 8,
        pageSize: 'A4',
        pageOrientation: 'portrait',   //landscape
        watermark: { text: 'Shessira', fontSize: 120, color: 'pink', opacity: 0.25, bold: true, italics: false, angle: -60 },
        footer: function (currentPage, pageCount) { return { text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'center', fontsize: 8 } },
        content: [
          {
            text: 'RESUMEN ANUAL SHESSIRA',
            style: 'header',
          },
          {
            text: fecha,
            style: 'subheader',
          },
          {
            pageBreak: 'after',
            style: 'small',
            table: {
              heights: 20,
              widths: [20, 60, 100, 100, 70, 100],
              body: datos,
            },
          },
          {
            text: 'COMPRAS/VENTAS MENSUALES - AÑO ' + fecha,
            style: 'subheader',
          },
          {
            style: 'small',
            image: grafico1, width: 400
          },
          {
            text: 'COMPRAS/VENTAS ANUALES - AÑO ' + fecha,
            style: 'subheader',
          },
          {
            pageBreak: 'after',
            style: 'end',
            image: grafico2, width: 400
          },
          {
            text: 'COMPRAS/VENTAS TODOS LOS AÑOS',
            style: 'subheader',
          },
          {
            style: 'small',
            image: grafico3, width: 400
          }
        ],
        styles: {
          header: {
            alignment: 'center',
            fontSize: 18,
            bold: true
          },
          subheader: {
            alignment: 'center',
            fontSize: 12,
            bold: true
          },
          small: {
            alignment: 'center',
            fontSize: 8,
            margin: [0, 10, 0, 10]
          },
          end: {
            alignment: 'right',
            fontSize: 8,
          },
        }
      };

      this.pdf = pdfMake.createPdf(docDefinition);
      this.pdf.download('RESUMEN ANUAL ' + fecha);
    } else {
      Swal.fire({
        icon: 'info',
        text: 'No hay elementos para mostrar',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
  }
  contruirDatos(array: any[], sumaCompras, nombreTabla: string) {
    let body = [];
    body.push(
      [
        { text: 'NRO', fillColor: this.color, alignment: 'center' },
        { text: 'FECHA', fillColor: this.color, bold: true, alignment: 'center' },
        { text: nombreTabla, alignment: 'center', fillColor: this.color, bold: true },
        { text: 'FOTO', fillColor: this.color, bold: true, alignment: 'center' },
        { text: 'MONTO S/', fillColor: this.color, bold: true, alignment: 'center' },
        { text: 'OBSERVACIÓN', fillColor: this.color, bold: true, alignment: 'center' }]
    );

    array.forEach((e, index) => {
      body.push(
        [{ text: index + 1, alignment: 'center' },
        { text: this.util.soloFecha(e.Fecha), bold: true, alignment: 'center' },
        { text: nombreTabla === 'COMPRAS' ? e.ConceptoCompra.toUpperCase() : e.ConceptoVenta.toUpperCase(), alignment: 'left' },
        e.Foto ?
          { image: e.Foto, width: 50, height: 50, alignment: 'center' } : { text: '--', alignment: 'center' },
        { text: e.Monto.toFixed(2), bold: true, alignment: 'right' },
        { text: e.Observacion, alignment: 'left' }]
      );
    });

    body.push([
      { text: 'TOTAL S/', fillColor: this.color, bold: true, alignment: 'right', colSpan: 4 }, '', '', '',
      { text: sumaCompras.toFixed(2), fillColor: this.color, bold: true, alignment: 'right' },
      { text: '', fillColor: this.color }]);
    return body;
  }

  contruirDatosResumen(array: Resumen[], comprasAnual: number, ventasAnual: number) {

    let body = [];
    body.push(
      [
        { text: 'NRO', fillColor: this.color, alignment: 'center' },
        { text: 'FECHA', fillColor: this.color, bold: true, alignment: 'center' },
        { text: 'COMPRAS S/', alignment: 'center', fillColor: this.color, bold: true },
        { text: 'VENTAS S/', alignment: 'center', fillColor: this.color, bold: true },
        { text: 'FOTO', fillColor: this.color, bold: true, alignment: 'center' },
        { text: 'OBSERVACIÓN', fillColor: this.color, bold: true, alignment: 'center' }]
    );

    array.forEach((e: Resumen, index) => {
      body.push(
        [
          { text: index + 1, alignment: 'center' },
          { text: this.util.convertirFechaGuionesSlash(e.Fecha).slice(-7), bold: true, alignment: 'center' },
          { text: e.Compras.toFixed(2), alignment: 'right' },
          { text: e.Ventas.toFixed(2), alignment: 'right' },
          e.Foto ?
            { image: e.Foto, width: 50, height: 50, alignment: 'center' } : { text: '--', alignment: 'center' },
          { text: e.Observacion, alignment: 'left' }]
      );
    });

    body.push([
      { text: 'TOTAL S/', fillColor: this.color, bold: true, alignment: 'right', colSpan: 2 }, '',
      { text: comprasAnual.toFixed(2), fillColor: this.color, bold: true, alignment: 'right' },
      { text: ventasAnual.toFixed(2), fillColor: this.color, bold: true, alignment: 'right' },
      { text: '', fillColor: this.color, colSpan: 2 }]);

    return body;
  }
}