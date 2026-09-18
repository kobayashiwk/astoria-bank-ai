import { $, api, attachLogout, requireLogin, yen } from './common.js';

await requireLogin();
attachLogout();

const data = await api('/api/dashboard');
$('#headerName').textContent = data.user.name;
$('#avatar').textContent = data.user.initials;
$('#greeting').textContent = `こんにちは、${data.user.name}さん`;

const total = data.accounts.reduce((sum, account) => sum + Number(account.balance), 0);
$('#totalBalance').textContent = yen(total);
$('#accounts').innerHTML = data.accounts.map(account => `
  <div class="account-row">
    <div><strong>${account.display_name}</strong><div class="small on-dark">${account.account_type} ・ ${account.account_number}</div></div>
    <div class="account-row-right"><strong>${yen(account.balance)}</strong><div><a href="/account.html?id=${account.id}" class="small account-link">詳細を見る</a></div></div>
  </div>`).join('');

$('#activity').innerHTML = data.activity.map(row => `
  <tr><td>${new Date(row.created_at).toLocaleDateString('ja-JP')}</td><td><strong>${row.beneficiary_name}</strong><div class="small">${row.memo || '—'}</div></td><td><span class="status">完了</span></td><td class="amount">-${yen(row.amount)}</td></tr>`).join('') || '<tr><td colspan="4">取引履歴はありません</td></tr>';

$('#usageText').textContent = yen(data.transferUsage);
$('#limitText').textContent = `/ ${yen(data.dailyLimit)}`;
$('#usageMeter').style.width = `${Math.min(100, data.transferUsage / data.dailyLimit * 100)}%`;
