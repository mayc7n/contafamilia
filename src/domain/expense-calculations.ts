import { Balance, Expense, ExpenseShare, FamilyMember } from './types';

export function splitEqually(amountCents: number, memberIds: string[]): ExpenseShare[] {
  if (amountCents <= 0 || memberIds.length === 0) {
    return [];
  }

  const baseAmount = Math.floor(amountCents / memberIds.length);
  const remainder = amountCents % memberIds.length;

  return memberIds.map((memberId, index) => ({
    memberId,
    amountDueCents: baseAmount + (index < remainder ? 1 : 0),
  }));
}

export function validateCustomSplit(
  amountCents: number,
  shares: ExpenseShare[],
): string | null {
  if (shares.length === 0 || shares.some((share) => share.amountDueCents < 0)) {
    return 'Escolha ao menos uma pessoa e informe valores válidos.';
  }

  const totalSharedCents = shares.reduce(
    (total, share) => total + share.amountDueCents,
    0,
  );

  if (totalSharedCents === amountCents) {
    return null;
  }

  const differenceCents = Math.abs(amountCents - totalSharedCents);
  const direction = totalSharedCents < amountCents ? 'Falta' : 'Passou';
  return `A divisão precisa fechar em ${formatCurrency(amountCents)}. ${direction} ${formatCurrency(differenceCents)}.`;
}

export function calculateBalances(expenses: Expense[], members: FamilyMember[]): Balance[] {
  const balances = new Map<string, number>(members.map((member) => [member.id, 0]));

  expenses
    .filter((expense) => !expense.deletedAt)
    .forEach((expense) => {
      const paidAmount = balances.get(expense.paidByMemberId) ?? 0;
      balances.set(expense.paidByMemberId, paidAmount - expense.amountCents);

      expense.shares.forEach((share) => {
        const dueAmount = balances.get(share.memberId) ?? 0;
        balances.set(share.memberId, dueAmount + share.amountDueCents);
      });
    });

  return members.map((member) => ({
    memberId: member.id,
    name: member.name,
    balanceCents: balances.get(member.id) ?? 0,
  }));
}

export function formatCurrency(amountCents: number): string {
  return (amountCents / 100)
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    .replace(/\u00a0/g, ' ');
}
