import {
  findAccountsForCustomer,
  findAccountDetail,
  findRecentActivityForCustomer
} from '../repositories/accounts.js';

function presentAccount(account) {
  return account ? {
    id: account.id,
    user_id: account.userId,
    account_number: account.accountNumber,
    account_type: account.accountType,
    display_name: account.displayName,
    balance: account.balance
  } : null;
}

function presentTransfer(row) {
  return {
    id: row.id,
    from_account_id: row.fromAccountId,
    beneficiary_name: row.beneficiaryName,
    amount: row.amount,
    status: row.status,
    created_at: row.createdAt,
    memo: row.memo
  };
}

export function listAccountsForUser(userId) {
  return findAccountsForCustomer(userId).map(presentAccount);
}

export function getAccountDetail(accountId) {
  return presentAccount(findAccountDetail(accountId));
}

export function recentActivityForUser(userId) {
  return findRecentActivityForCustomer(userId).map(presentTransfer);
}
