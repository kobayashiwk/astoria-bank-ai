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
    const events = (result.events || []).map(event => `<div class="tool-event">処理：${escapeHtml(event.name)} / 結果：${escapeHtml(event.result)}</div>`).join('');
    chat.insertAdjacentHTML('beforeend', `<div class="bubble ai">${escapeHtml(result.answer)}${events}</div>`);
    chat.scrollTop = chat.scrollHeight;
  } catch {
    toast('AIアシスタントの処理を完了できませんでした。', 'bad');
  }
}
