import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

// interfaces
import { Compras } from "../models/compras.interface";
@Injectable({
  providedIn: 'root'
})
export class ComprasService {
  private comprasCollection: AngularFirestoreCollection<Compras>;
  private compras: Observable<Compras[]>;

  constructor(private db: AngularFirestore) {

    this.comprasCollection = db.collection<Compras>('Compras', ref => ref.orderBy('Fecha').where('Estado', '==', true));
    this.datos();
  }
  datos() {
    this.compras = this.comprasCollection.snapshotChanges().pipe(map(
      actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      }
    ));
  }

  getCompras() {
    this.comprasCollection = this.db.collection<Compras>('Compras', ref => ref.orderBy('Fecha').where('Estado', '==', true));
    this.datos();
    return this.compras;
  }

  getComprasEliminadas() {
    this.comprasCollection = this.db.collection<Compras>('Compras', ref => ref.orderBy('Fecha').where('Estado', '==', false));
    this.datos();
    return this.compras;
  }

  getCompra(id: string) {
    return this.comprasCollection.doc<Compras>(id).valueChanges();
  }

  updateCompra(compra: Compras, id: string) {
    let aux = this.comprasCollection.doc<Compras>(id).update(compra);
    return aux;
  }

  addCompra(compra: Compras) {
    let aux = this.comprasCollection.add(compra);
    return aux;
  }

  removeCompra(id: string) {
    let aux = this.comprasCollection.doc(id).delete();
    return aux;
  }

}
