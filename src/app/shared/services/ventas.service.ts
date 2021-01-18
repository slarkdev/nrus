import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

//interfaces
import { Ventas } from "../models/ventas.interface";
@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private ventasCollection: AngularFirestoreCollection<Ventas>;
  private ventas: Observable<Ventas[]>;

  constructor(private db: AngularFirestore) {

    this.ventasCollection = db.collection<Ventas>('Ventas', ref => ref.orderBy('Fecha').where('Estado', '==', true));
    this.datos();
  }
  datos() {
    this.ventas = this.ventasCollection.snapshotChanges().pipe(map(
      actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      }
    ));
  }

  getVentas() {
    this.ventasCollection = this.db.collection<Ventas>('Ventas', ref => ref.orderBy('Fecha').where('Estado', '==', true));
    this.datos();
    return this.ventas;
  }

  getVentasEliminadas() {
    this.ventasCollection = this.db.collection<Ventas>('Ventas', ref => ref.orderBy('Fecha').where('Estado', '==', false));
    this.datos();
    return this.ventas;
  }

  getVenta(id: string) {
    return this.ventasCollection.doc<Ventas>(id).valueChanges();
  }

  updateVenta(venta: Ventas, id: string) {
    let aux = this.ventasCollection.doc<Ventas>(id).update(venta);
    return aux;
  }

  addVenta(venta: Ventas) {
    let aux = this.ventasCollection.add(venta);
    return aux;
  }

  removeVenta(id: string) {
    let aux = this.ventasCollection.doc(id).delete();
    return aux;
  }

}
