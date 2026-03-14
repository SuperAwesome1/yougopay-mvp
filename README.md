# YouGoPay MVP

Production-ready serverless fintech MVP with Angular + Firebase.

## Features
- Phone + OTP authentication with 4-digit PIN validation via Cloud Function.
- Parent flows: add students, set daily limits, top-up wallets.
- Student flows: view wallet balance, transaction history, remaining daily limit.
- Ledger-only wallet updates (transaction + atomic balance updates in Cloud Functions).

## Project Structure
```
src/app/
  core/
    auth/
    guards/
    services/
  modules/
    parent/
    student/
    wallet/
    transactions/
  shared/
    components/
    models/
  pages/
    login/
    register/
    parent-dashboard/
    student-dashboard/
```

## Firestore Collections
- `users/{uid}`: uid, phone, role, createdAt
- `pins/{uid}`: uid, pinHash
- `parents/{id}`: id, phone, createdAt
- `students/{id}`: parentId, name, dailyLimit, createdAt
- `wallets/{id}`: studentId, balance, createdAt
- `transactions/{id}`: walletId, type(TOPUP|DEBIT), amount, description, createdAt

## Cloud Functions
- `createStudent`
- `createWallet`
- `topupWallet`
- `authorizeTransaction`
- `calculateDailySpend`
- `validatePin`

## Run
```bash
npm install
cd functions && npm install && cd ..
npm run build
firebase deploy
```

Update Firebase keys in:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
