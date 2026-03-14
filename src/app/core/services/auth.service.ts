import { Injectable } from '@angular/core';
import { Auth, ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber, signOut } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AppUser } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private recaptchaVerifier?: RecaptchaVerifier;

  constructor(private auth: Auth, private firestore: Firestore) {}

  setupRecaptcha(containerId: string): RecaptchaVerifier {
    this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, { size: 'normal' });
    return this.recaptchaVerifier;
  }

  requestOtp(phoneNumber: string): Promise<ConfirmationResult> {
    if (!this.recaptchaVerifier) {
      throw new Error('Recaptcha is not initialized');
    }
    return signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier);
  }

  getCurrentUserProfile(uid: string): Observable<AppUser> {
    return docData(doc(this.firestore, `users/${uid}`)) as Observable<AppUser>;
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
