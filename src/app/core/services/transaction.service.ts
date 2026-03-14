import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { WalletTransaction } from '../../shared/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(private firestore: Firestore) {}

  getWalletTransactions(walletId: string): Observable<WalletTransaction[]> {
    const q = query(
      collection(this.firestore, 'transactions'),
      where('walletId', '==', walletId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<WalletTransaction[]>;
  }
}
