import { getAccountsForUser, getAccountById, getTransfersForUser } from '../db.js';

export function findAccountsForCustomer(customerId) {
  return getAccountsForUser(customerId);
}

export function findAccountDetail(accountId) {
  return getAccountById(accountId);
}

export function findRecentActivityForCustomer(customerId) {
  return getTransfersForUser(customerId);
}
