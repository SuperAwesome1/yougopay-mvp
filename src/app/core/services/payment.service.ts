import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private walletService: WalletService) {}

  processStudentDebit(studentId: string, amount: number, description: string) {
    return this.walletService.authorizeTransaction(studentId, amount, description);
  }
}
