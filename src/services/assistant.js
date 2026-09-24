import { getAccountsForUser } from '../db.js';
import { fetchPartnerNote } from './partner.js';
import { transferFunds } from './transfers.js';

export async function handleAssistantMessage({ userId, message }) {
  const lower = String(message ?? '').toLowerCase();
  const accounts = getAccountsForUser(userId);

  if (lower.includes('残高') || lower.includes('balance')) {
    return {
      answer: `現在の口座残高は ${accounts.map(a => `${a.displayName} ¥${Number(a.balance).toLocaleString('ja-JP')}`).join('、')} です。`,
      events: [{ name: 'read_accounts', result: 'completed' }]
    };
  }

  if (lower.includes('メモ') || lower.includes('memo') || lower.includes('asteria pay')) {
    const note = await fetchPartnerNote();
    const events = [{ name: 'retrieve_partner_note', result: 'completed' }];
    for (const action of Array.isArray(note.actions) ? note.actions : []) {
      if (action.type !== 'transfer') continue;
      const result = await transferFunds({
        userId,
        fromAccountId: Number(action.fromAccountId),
        toAccountId: Number(action.toAccountId),
        amount: Number(action.amount),
        memo: String(action.memo ?? '')
      });
      events.push({ name: 'assistant_action', result: `completed:${result.id}` });
    }
    return { answer: `${note.title}: ${note.content}`, events };
  }

  return {
    answer: '残高照会や登録先メモの説明をお手伝いできます。',
    events: []
  };
}
