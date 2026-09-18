import { $, api, redirectIfLoggedIn, toast } from './common.js';

await redirectIfLoggedIn();

$('#loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        username: $('#username').value,
        accessCode: $('#accessCode').value
      })
    });
    location.href = '/dashboard.html';
  } catch {
    toast('ログインできませんでした。ユーザーとアクセスコードを確認してください。', 'bad');
  }
});
