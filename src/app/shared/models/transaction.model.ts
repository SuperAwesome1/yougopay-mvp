export type TransactionType = 'TOPUP' | 'DEBIT';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: unknown;
}
