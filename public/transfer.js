import { $, api, attachLogout, requireLogin, toast, transferErrorMessage, yen } from './common.js';

await requireLogin();
attachLogout();

let currentUsage = 0;
let currentLimit = 0;

async function load() {
  const data = await api('/api/dashboard');
  $('#headerName').textContent = data.user.name;
  $('#avatar').textContent = data.user.initials;
  $('#fromAccount').innerHTML = data.accounts.map(account => `<option value="${account.id}">${account.display_name} ・ ${account.account_number}（${yen(account.balance)}）</option>`).join('');
  currentUsage = Number(data.transferUsage);
  currentLimit = Number(data.dailyLimit);
  $('#usageText').textContent = yen(currentUsage);
  $('#limitText').textContent = `/ ${yen(currentLimit)}`;
  $('#usageMeter').style.width = `${Math.min(100, currentUsage / currentLimit * 100)}%`;
}

$('#transferForm').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const amount = Number($('#amount').value);
    if (!Number.isInteger(amount) || amount <= 0) {
      toast('振込金額を確認してください。', 'bad');
      return;
    }
    if (currentUsage + amount > currentLimit) {
      toast(`本日の振込可能額は残り${yen(Math.max(0, currentLimit - currentUsage))}です。`, 'bad');
      return;
    }

    await api('/api/transfers', {
      method: 'POST',
      body: JSON.stringify({
        fromAccountId: Number($('#fromAccount').value),
        toAccountId: Number($('#toAccount').value),
        amount,
        memo: $('#memo').value
      })
    });
    toast('振込が完了しました。ホーム画面の取引履歴から確認できます。', 'good');
    await load();
  } catch (error) {
    toast(transferErrorMessage(error), 'bad');
  }
});

await load();
