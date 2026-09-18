import { $, api, attachLogout, requireLogin, yen } from './common.js';

await requireLogin();
attachLogout();
const me = await api('/api/me');
$('#headerName').textContent = me.user.name;
$('#avatar').textContent = me.user.initials;

const id = new URLSearchParams(location.search).get('id') || '101';

async function boot() {
  try {
    const response = await fetch(`/api/accounts/${encodeURIComponent(id)}`);
    if (response.status === 401) {
      location.replace('/');
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      $('#content').innerHTML = '<div class="notice-banner"><strong>口座情報を表示できません。</strong><br>指定された口座を確認できませんでした。</div>';
      return;
    }
    $('#content').innerHTML = `
      <div class="account-hero">
        <div><div class="small">${data.account.account_type}</div><h2>${data.account.display_name}</h2><div class="account-number">ASTERIA ・ ${data.account.account_number}</div><div class="account-amount">${yen(data.account.balance)}</div></div>
        <div class="status">利用可能</div>
      </div>
      <h3 class="section-title">最近の取引</h3>
      <table class="activity"><tbody>${data.activity.map(row => `<tr><td>${new Date(row.created_at).toLocaleDateString('ja-JP')}</td><td>${row.beneficiary_name}<div class="small">${row.memo || ''}</div></td><td class="amount">-${yen(row.amount)}</td></tr>`).join('') || '<tr><td>取引履歴はありません</td></tr>'}</tbody></table>`;
  } catch {
    $('#content').innerHTML = '<div class="notice-banner"><strong>口座情報を表示できません。</strong><br>しばらくしてからもう一度お試しください。</div>';
  }
}

boot();
