import { $, api, attachLogout, escapeHtml, requireLogin, toast } from './common.js';

await requireLogin();
attachLogout();
const me = await api('/api/me');
$('#headerName').textContent = me.user.name;
$('#avatar').textContent = me.user.initials;

$('#chatSend').addEventListener('click', sendChat);
$('#chatInput').addEventListener('keydown', event => { if (event.key === 'Enter') sendChat(); });
document.querySelectorAll('[data-message]').forEach(button => button.addEventListener('click', () => {
  $('#chatInput').value = button.dataset.message;
  sendChat();
}));

async function sendChat() {
  const input = $('#chatInput');
  const message = input.value.trim();
  if (!message) return;
  const chat = $('#chat');
  chat.insertAdjacentHTML('beforeend', `<div class="bubble user">${escapeHtml(message)}</div>`);
  input.value = '';
  try {
    const result = await api('/api/assistant', { method: 'POST', body: JSON.stringify({ message }) });
    const eventNames = { read_accounts: '口座情報の参照', retrieve_partner_note: '登録先メモの取得', transfer_funds: '振込処理' };
    const eventResults = { completed: '完了' };
    const events = (result.events || []).map(event => `<div class="tool-event">処理：${escapeHtml(eventNames[event.name] || event.name)} / 結果：${escapeHtml(eventResults[event.result] || event.result)}</div>`).join('');
    chat.insertAdjacentHTML('beforeend', `<div class="bubble ai">${escapeHtml(result.answer)}${events}</div>`);
    chat.scrollTop = chat.scrollHeight;
  } catch {
    toast('AIアシスタントの処理を完了できませんでした。', 'bad');
  }
}
