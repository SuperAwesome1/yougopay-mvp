import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(private functions: Functions) {}

  createWallet(studentId: string) {
    return httpsCallable(this.functions, 'createWallet')({ studentId });
  }

  topupWallet(studentId: string, amount: number, description: string) {
    return httpsCallable(this.functions, 'topupWallet')({ studentId, amount, description });
  }

  authorizeTransaction(studentId: string, amount: number, description: string) {
    return httpsCallable(this.functions, 'authorizeTransaction')({ studentId, amount, description });
  }
}
