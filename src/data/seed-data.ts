import { FamilyData } from '../domain/types';

export const seedFamilyData: FamilyData = {
  family: { id: 'family-demo', name: 'Casa da Silva' },
  members: [
    { id: 'member-ana', name: 'Ana', role: 'owner' },
    { id: 'member-bruno', name: 'Bruno', role: 'member' },
    { id: 'member-lia', name: 'Lia', role: 'member' },
  ],
  expenses: [
    {
      id: 'expense-market',
      description: 'Mercado da semana',
      amountCents: 24890,
      category: 'Mercado',
      paidByMemberId: 'member-ana',
      occurredOn: '2026-09-15',
      shares: [
        { memberId: 'member-ana', amountDueCents: 8297 },
        { memberId: 'member-bruno', amountDueCents: 8297 },
        { memberId: 'member-lia', amountDueCents: 8296 },
      ],
    },
    {
      id: 'expense-internet',
      description: 'Internet residencial',
      amountCents: 11990,
      category: 'Contas',
      paidByMemberId: 'member-bruno',
      occurredOn: '2026-09-08',
      shares: [
        { memberId: 'member-ana', amountDueCents: 5995 },
        { memberId: 'member-bruno', amountDueCents: 5995 },
      ],
    },
    {
      id: 'expense-pharmacy',
      description: 'Farmácia',
      amountCents: 7850,
      category: 'Saúde',
      paidByMemberId: 'member-lia',
      occurredOn: '2026-09-04',
      shares: [{ memberId: 'member-lia', amountDueCents: 7850 }],
    },
  ],
  reminders: [
    {
      id: 'reminder-rent',
      title: 'Aluguel',
      amountCents: 180000,
      dueOn: '2026-09-20',
      status: 'pending',
    },
    {
      id: 'reminder-school',
      title: 'Mensalidade da escola',
      amountCents: 85000,
      dueOn: '2026-09-25',
      status: 'pending',
    },
  ],
};
