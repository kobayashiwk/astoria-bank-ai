import { getOwnedAccount, getAccountById, getDailyUsage, addDailyUsage, adjustBalance, addTransfer } from '../db.js';

export const DAILY_LIMIT = 500000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function transferFunds({ userId, fromAccountId, toAccountId, amount, memo = '' }) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw Object.assign(new Error('Invalid amount'), { code: 'INVALID_AMOUNT', status: 400 });
  }

  const source = getOwnedAccount(userId, fromAccountId);
  if (!source) throw Object.assign(new Error('Account not found'), { code: 'ACCOUNT_NOT_FOUND', status: 404 });
  if (getDailyUsage(userId) + amount > DAILY_LIMIT) {
    throw Object.assign(new Error('Daily transfer limit exceeded'), { code: 'DAILY_LIMIT_EXCEEDED', status: 409 });
  }
  if (source.balance < amount) {
    throw Object.assign(new Error('Insufficient balance'), { code: 'INSUFFICIENT_FUNDS', status: 409 });
  }

  await delay(180);
  const destination = getAccountById(toAccountId);
  if (!destination) throw Object.assign(new Error('Destination not found'), { code: 'DESTINATION_NOT_FOUND', status: 404 });

  adjustBalance(fromAccountId, -amount);
  adjustBalance(toAccountId, amount);
  addDailyUsage(userId, amount);
  const row = addTransfer({
    fromAccountId,
    toAccountId,
    beneficiaryName: destination.displayName,
    amount,
    memo
  });
  return { id: row.id, status: 'COMPLETED', amount };
}
