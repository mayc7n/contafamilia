import { formatCurrency } from './expense-calculations';
import { Balance, FamilyData } from './types';

export { formatCurrency };

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function formatBalance(balance: Balance): string {
  if (balance.balanceCents < 0) {
    return `tem a receber ${formatCurrency(Math.abs(balance.balanceCents))}`;
  }

  if (balance.balanceCents > 0) {
    return `deve pagar ${formatCurrency(balance.balanceCents)}`;
  }

  return 'está em dia';
}

export function buildMonthlySummary(data: FamilyData, month: string): string {
  const expenses = data.expenses.filter(
    (expense) => expense.occurredOn.startsWith(month) && !expense.deletedAt,
  );
  const totalCents = expenses.reduce((total, expense) => total + expense.amountCents, 0);
  const balances = data.members.map((member) => {
    const balance = expenses.reduce((total, expense) => {
      const paid = expense.paidByMemberId === member.id ? expense.amountCents : 0;
      const due = expense.shares.find((share) => share.memberId === member.id)?.amountDueCents ?? 0;
      return total + due - paid;
    }, 0);
    return { memberId: member.id, name: member.name, balanceCents: balance };
  });
  const monthLabel = new Date(`${month}-15T12:00:00`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  const memberLines = balances.map((balance) => `- ${balance.name}: ${formatBalance(balance)}`);
  const reminderLines = data.reminders
    .filter((reminder) => reminder.status === 'pending')
    .slice(0, 3)
    .map((reminder) => `- ${reminder.title} vence em ${formatDate(reminder.dueOn)}`);

  return [
    `Conta Família — resumo de ${monthLabel}`,
    `Total registrado: ${formatCurrency(totalCents)}`,
    '',
    'Por pessoa:',
    ...memberLines,
    '',
    'Contas próximas:',
    ...(reminderLines.length > 0 ? reminderLines : ['- Nenhuma conta pendente']),
  ].join('\n');
}
