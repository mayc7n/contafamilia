import {
  calculateBalances,
  splitEqually,
  validateCustomSplit,
} from './expense-calculations';
import { Expense, FamilyMember } from './types';

describe('expense calculations', () => {
  test('splits cents evenly and distributes the remainder in participant order', () => {
    expect(splitEqually(1000, ['ana', 'bia', 'cai'])).toEqual([
      { memberId: 'ana', amountDueCents: 334 },
      { memberId: 'bia', amountDueCents: 333 },
      { memberId: 'cai', amountDueCents: 333 },
    ]);
  });

  test('rejects a custom split that does not close the total', () => {
    expect(
      validateCustomSplit(1000, [
        { memberId: 'ana', amountDueCents: 500 },
        { memberId: 'bia', amountDueCents: 499 },
      ]),
    ).toBe('A divisão precisa fechar em R$ 10,00. Falta R$ 0,01.');
  });

  test('calculates what each person owes from paid and due amounts', () => {
    const members: FamilyMember[] = [
      { id: 'ana', name: 'Ana', role: 'owner' },
      { id: 'bia', name: 'Bia', role: 'member' },
    ];
    const expenses: Expense[] = [
      {
        id: 'expense-1',
        description: 'Mercado',
        amountCents: 1000,
        category: 'Mercado',
        paidByMemberId: 'ana',
        occurredOn: '2026-09-10',
        shares: [
          { memberId: 'ana', amountDueCents: 500 },
          { memberId: 'bia', amountDueCents: 500 },
        ],
      },
    ];

    expect(calculateBalances(expenses, members)).toEqual([
      { memberId: 'ana', name: 'Ana', balanceCents: -500 },
      { memberId: 'bia', name: 'Bia', balanceCents: 500 },
    ]);
  });
});
