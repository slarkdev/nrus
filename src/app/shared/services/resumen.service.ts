import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

// interfaces
import { Resumen } from "../models/resumen.interface";
@Injectable({
  providedIn: 'root'
})
export class ResumenService {
  private resumenCollection: AngularFirestoreCollection<Resumen>;
  private resumenes: Observable<Resumen[]>;

  constructor(private db: AngularFirestore) {    
    this.resumenCollection = db.collection<Resumen>('Resumen', ref => ref.orderBy('Fecha').where('Estado','==', true));
    this.datos();
   }

   datos(){
    this.resumenes = this.resumenCollection.snapshotChanges().pipe(map(
      actions=>{ return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data};
      })}
    ));
   }

   getResumenes(){
    this.resumenCollection = this.db.collection<Resumen>('Resumen', ref => ref.orderBy('Fecha').where('Estado','==', true));
    this.datos();
     return this.resumenes;
   }
   getResumenFecha(fecha: string){     
    // this.resumenCollection = this.db.collection<Resumen>('Resumen', ref => ref.orderBy('Fecha').where('Estado','==', true));
    //AQUI ESTAS
    this.resumenCollection = this.db.collection<Resumen>('Resumen', ref => ref.where('Fecha','==',fecha).where('Estado','==', true).limit(1));
    this.datos();
    return this.resumenes;
    // return this.resumenCollection.doc<Resumen>(fecha).valueChanges();
   }
   getResumen(id: string){
    return this.resumenCollection.doc<Resumen>(id).valueChanges();
   }
   updateResumen(resumen: Resumen, id:string){
     let aux = this.resumenCollection.doc<Resumen>(id).update(resumen);
     return aux;
   }

   addResumen(resumen: Resumen){
     let aux = this.resumenCollection.add(resumen);
     return aux;
   }

   removeResumen(id:string){
     let aux = this.resumenCollection.doc(id).delete();
     return aux;
   }
}
