import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { of, Observable } from 'rxjs';
import { switchMap } from "rxjs/operators";
import Swal from 'sweetalert2';

// services
import { ErrorService } from './error.service';

// interfaces
import { RoleValidator } from '../utilitarios/roleValidator';
import { User } from '../models/user.interface';
import { auth } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends RoleValidator {

  public user$: Observable<User>;

  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore, private errorSvc: ErrorService) {
    super();
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        }
        return of(null);
      })
    )
  }

  datosUsuario(){  
    return this.user$;
  }

  async loginGoogle(): Promise<User> {
    try {
      const { user } = await this.afAuth.signInWithPopup(new auth.GoogleAuthProvider());
      this.updateUserData(user);
      return user;
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  async loginFacebook(): Promise<User> {
    try {
      const { user } =  await this.afAuth.signInWithPopup(new auth.FacebookAuthProvider());
      
      this.updateUserData(user);
      return user;
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {  
        const { user } = await this.afAuth.signInWithEmailAndPassword(email, password);
        return user;
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  async sendVerificationEmail(): Promise<void> {
    try {
      return (await this.afAuth.currentUser).sendEmailVerification();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  isEmailVerified(user: User): boolean {
    return user.emailVerified;
  }

  async register(nombres:string, email: string, password: string): Promise<User> {
    try {
      const { user } = await this.afAuth.createUserWithEmailAndPassword(email, password);
      this.updateUserData(user, nombres);
      //enviar email de verificacion
      this.sendVerificationEmail();
      return user;
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      return this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
    } catch (error) {
      this.errorSvc.showError(error);
    }
  }

  public updateUserData(user: User, nombres?: string) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const data: User = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: nombres ? nombres : user.displayName,
      photoURL: user.photoURL,
      role: 'USUARIO',
    };
    return userRef.set(data, { merge: true });
  }
}
