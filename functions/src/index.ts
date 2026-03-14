import * as admin from 'firebase-admin';
import * as bcrypt from 'bcryptjs';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

admin.initializeApp();
const db = admin.firestore();

const users = db.collection('users');
const parents = db.collection('parents');
const students = db.collection('students');
const wallets = db.collection('wallets');
const transactions = db.collection('transactions');
const pins = db.collection('pins');

export const createStudent = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Auth required');

  const { name, dailyLimit } = request.data;
  if (!name || typeof dailyLimit !== 'number') {
    throw new HttpsError('invalid-argument', 'name and dailyLimit are required');
  }

  const userSnap = await users.doc(auth.uid).get();
  if (userSnap.data()?.role !== 'PARENT') {
    throw new HttpsError('permission-denied', 'Only parents can create students');
  }

  const studentRef = students.doc();
  const now = admin.firestore.FieldValue.serverTimestamp();

  await studentRef.set({
    parentId: auth.uid,
    name,
    dailyLimit,
    createdAt: now
  });

  await createWalletInternal(studentRef.id);

  return { studentId: studentRef.id };
});

export const createWallet = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Auth required');
  const { studentId } = request.data;
  if (!studentId) throw new HttpsError('invalid-argument', 'studentId is required');

  await createWalletInternal(studentId);
  return { ok: true };
});

async function createWalletInternal(studentId: string) {
  const existing = await wallets.where('studentId', '==', studentId).limit(1).get();
  if (!existing.empty) return existing.docs[0].id;

  const walletRef = wallets.doc();
  await walletRef.set({
    studentId,
    balance: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return walletRef.id;
}

export const topupWallet = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Auth required');

  const { studentId, amount, description } = request.data;
  if (!studentId || typeof amount !== 'number' || amount <= 0) {
    throw new HttpsError('invalid-argument', 'studentId and positive amount are required');
  }

  const studentSnap = await students.doc(studentId).get();
  if (!studentSnap.exists || studentSnap.data()?.parentId !== auth.uid) {
    throw new HttpsError('permission-denied', 'Parent can only top-up own student wallet');
  }

  return applyLedgerEntry(studentId, 'TOPUP', amount, description || 'Parent top-up');
});

export const authorizeTransaction = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Auth required');

  const { studentId, amount, description } = request.data;
  if (!studentId || typeof amount !== 'number' || amount <= 0) {
    throw new HttpsError('invalid-argument', 'studentId and positive amount are required');
  }

  if (auth.uid !== studentId) {
    throw new HttpsError('permission-denied', 'Students can only debit their own wallet');
  }

  const spentToday = await calculateDailySpendInternal(studentId);
  const studentSnap = await students.doc(studentId).get();
  const dailyLimit = Number(studentSnap.data()?.dailyLimit || 0);

  if (spentToday + amount > dailyLimit) {
    throw new HttpsError('failed-precondition', 'Daily limit exceeded');
  }

  return applyLedgerEntry(studentId, 'DEBIT', amount, description || 'Student debit');
});

export const calculateDailySpend = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Auth required');
  const { studentId } = request.data;
  if (!studentId) throw new HttpsError('invalid-argument', 'studentId is required');

  const total = await calculateDailySpendInternal(studentId);
  return { total };
});

async function calculateDailySpendInternal(studentId: string): Promise<number> {
  const walletSnapshot = await wallets.where('studentId', '==', studentId).limit(1).get();
  if (walletSnapshot.empty) return 0;

  const walletId = walletSnapshot.docs[0].id;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const tx = await transactions
    .where('walletId', '==', walletId)
    .where('type', '==', 'DEBIT')
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(start))
    .where('createdAt', '<', admin.firestore.Timestamp.fromDate(end))
    .get();

  return tx.docs.reduce((sum, doc) => sum + Number(doc.data().amount || 0), 0);
}

type TransactionType = 'TOPUP' | 'DEBIT';

async function applyLedgerEntry(studentId: string, type: TransactionType, amount: number, description: string) {
  const walletSnapshot = await wallets.where('studentId', '==', studentId).limit(1).get();
  if (walletSnapshot.empty) throw new HttpsError('not-found', 'Wallet not found');

  const walletRef = walletSnapshot.docs[0].ref;

  await db.runTransaction(async (trx) => {
    const walletDoc = await trx.get(walletRef);
    const currentBalance = Number(walletDoc.data()?.balance || 0);
    const newBalance = type === 'TOPUP' ? currentBalance + amount : currentBalance - amount;

    if (newBalance < 0) {
      throw new HttpsError('failed-precondition', 'Insufficient balance');
    }

    const txRef = transactions.doc();
    trx.set(txRef, {
      walletId: walletRef.id,
      type,
      amount,
      description,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    trx.update(walletRef, { balance: newBalance });
  });

  return { ok: true };
}

export const validatePin = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Auth required');
  const { pin, mode, role } = request.data;

  if (!pin || !/^\d{4}$/.test(pin)) {
    throw new HttpsError('invalid-argument', 'PIN must be 4 digits');
  }

  const pinRef = pins.doc(auth.uid);

  if (mode === 'SET') {
    const pinHash = await bcrypt.hash(pin, 10);
    await pinRef.set({ uid: auth.uid, pinHash });

    await users.doc(auth.uid).set({
      uid: auth.uid,
      phone: auth.token.phone_number,
      role: role || 'STUDENT',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    if (role === 'PARENT') {
      await parents.doc(auth.uid).set({
        id: auth.uid,
        phone: auth.token.phone_number,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    return { ok: true };
  }

  const pinSnap = await pinRef.get();
  const pinHash = pinSnap.data()?.pinHash;
  if (!pinHash) throw new HttpsError('not-found', 'PIN not found');

  const isValid = await bcrypt.compare(pin, pinHash);
  if (!isValid) throw new HttpsError('permission-denied', 'Invalid PIN');

  return { ok: true };
});
