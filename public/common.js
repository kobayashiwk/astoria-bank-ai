export const $ = selector => document.querySelector(selector);
export const yen = value => `¥${Number(value).toLocaleString('ja-JP')}`;

export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}

export function toast(message, type = '') {
  const element = $('#toast');
  if (!element) return;
  element.textContent = message;
  element.className = `toast show ${type}`;
  setTimeout(() => { element.className = 'toast'; }, 3200);
}

export async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(payload.message || payload.error || '処理に失敗しました'), {
      status: response.status,
      body: payload
    });
  }
  return payload;
}

export async function requireLogin() {
  try {
    return await api('/api/me');
  } catch {
    location.replace('/');
    throw new Error('AUTH_REQUIRED');
  }
}

export async function redirectIfLoggedIn() {
  try {
    await api('/api/me');
    location.replace('/dashboard.html');
    return true;
  } catch {
    return false;
  }
}

export async function logout() {
  try {
    await api('/api/logout', { method: 'POST' });
  } finally {
    location.replace('/');
  }
}

export function transferErrorMessage(error) {
  const code = error?.body?.error;
  const messages = {
    INVALID_AMOUNT: '振込金額を確認してください。',
    ACCOUNT_NOT_FOUND: '出金口座を確認できませんでした。',
    DAILY_LIMIT_EXCEEDED: '1日の振込限度額を超えています。',
    INSUFFICIENT_FUNDS: '残高が不足しています。',
    DESTINATION_NOT_FOUND: '振込先を確認できませんでした。'
  };
  return messages[code] || '振込処理を完了できませんでした。';
}

export function attachLogout() {
  const button = $('#logoutBtn');
  if (button) button.addEventListener('click', logout);
}
