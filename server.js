import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase, getDailyUsage, getTransfersFromAccount } from './src/db.js';
import { loginUser, logoutSession, userFromRequest, localAccessCode } from './src/auth.js';
import { listAccountsForUser, getAccountDetail, recentActivityForUser } from './src/services/accounts.js';
import { DAILY_LIMIT, transferFunds } from './src/services/transfers.js';
import { handleAssistantMessage } from './src/services/assistant.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);
await initDatabase();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function json(res, status, payload, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(JSON.stringify(payload));
}

function currentUser(req, res) {
  const user = userFromRequest(req);
  if (!user) {
    json(res, 401, { error: 'AUTH_REQUIRED' });
    return null;
  }
  return user;
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 100000) throw new Error('BODY_TOO_LARGE');
  }
  return raw ? JSON.parse(raw) : {};
}

function presentActivity(row) {
  return {
    id: row.id,
    beneficiary_name: row.beneficiaryName,
    amount: row.amount,
    status: row.status,
    created_at: row.createdAt,
    memo: row.memo
  };
}

async function staticFile(res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const file = path.normalize(path.join(PUBLIC, pathname));
  if (!file.startsWith(PUBLIC)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/api/meta' && req.method === 'GET') {
      return json(res, 200, { app: 'Asteria Digital Bank', dailyLimit: DAILY_LIMIT });
    }

    if (url.pathname === '/api/login' && req.method === 'POST') {
      const input = await readBody(req);
      const login = loginUser(input.username, input.accessCode);
      if (!login) return json(res, 401, { error: 'INVALID_LOGIN' });
      return json(res, 200, { user: login.user }, {
        'Set-Cookie': `asteria_session=${login.sid}; HttpOnly; SameSite=Strict; Path=/`
      });
    }

    if (url.pathname === '/api/logout' && req.method === 'POST') {
      logoutSession(req.headers.cookie || '');
      return json(res, 200, { ok: true }, {
        'Set-Cookie': 'asteria_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
      });
    }

    if (url.pathname === '/api/me' && req.method === 'GET') {
      const user = currentUser(req, res);
      if (!user) return;
      return json(res, 200, { user });
    }

    if (url.pathname === '/api/dashboard' && req.method === 'GET') {
      const user = currentUser(req, res);
      if (!user) return;
      return json(res, 200, {
        user,
        accounts: listAccountsForUser(user.id),
        activity: recentActivityForUser(user.id),
        transferUsage: getDailyUsage(user.id),
        dailyLimit: DAILY_LIMIT
      });
    }

    const accountMatch = url.pathname.match(/^\/api\/accounts\/(\d+)$/);
    if (accountMatch && req.method === 'GET') {
      const user = currentUser(req, res);
      if (!user) return;
      const account = getAccountDetail(user.id, Number(accountMatch[1]));
      if (!account) return json(res, 404, { error: 'ACCOUNT_NOT_FOUND' });
      return json(res, 200, {
        account,
        activity: getTransfersFromAccount(account.id).map(presentActivity)
      });
    }

    if (url.pathname === '/api/transfers' && req.method === 'POST') {
      const user = currentUser(req, res);
      if (!user) return;
      try {
        const input = await readBody(req);
        const result = await transferFunds({
          userId: user.id,
          fromAccountId: Number(input.fromAccountId),
          toAccountId: Number(input.toAccountId),
          amount: Number(input.amount),
          memo: String(input.memo ?? '')
        });
        return json(res, 201, result);
      } catch (error) {
        return json(res, error.status || 500, {
          error: error.code || 'TRANSFER_FAILED',
          message: error.message
        });
      }
    }

    if (url.pathname === '/api/assistant' && req.method === 'POST') {
      const user = currentUser(req, res);
      if (!user) return;
      const input = await readBody(req);
      return json(res, 200, await handleAssistantMessage({ userId: user.id, message: input.message }));
    }

    return staticFile(res, url);
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'INTERNAL_ERROR' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Asteria Digital Bank: http://${HOST}:${PORT}`);
  console.log(`ローカルアクセスコード: ${localAccessCode}`);
});
