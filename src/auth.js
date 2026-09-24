import crypto from 'node:crypto';
import { getUserByUsername, getUserById } from './db.js';

const sessions = new Map();
export const localAccessCode = '999999';

function parseCookies(raw = '') {
  return Object.fromEntries(raw.split(';').map(v => v.trim()).filter(Boolean).map(pair => {
    const i = pair.indexOf('=');
    return i < 0 ? [pair, ''] : [pair.slice(0, i), decodeURIComponent(pair.slice(i + 1))];
  }));
}

export function loginUser(username, accessCode) {
  if (String(accessCode ?? '') !== localAccessCode) return null;
  const user = getUserByUsername(String(username ?? ''));
  if (!user) return null;
  const sid = crypto.randomUUID();
  sessions.set(sid, user.id);
  return { sid, user };
}

export function logoutSession(cookieHeader) {
  const sid = parseCookies(cookieHeader).asteria_session;
  if (sid) sessions.delete(sid);
}

export function userFromRequest(req) {
  const sid = parseCookies(req.headers.cookie).asteria_session;
  const userId = sessions.get(sid);
  return userId ? getUserById(userId) : null;
}
