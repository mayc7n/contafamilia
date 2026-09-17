export type ExpenseCategory =
  | 'Moradia'
  | 'Mercado'
  | 'Contas'
  | 'Transporte'
  | 'Saúde'
  | 'Educação'
  | 'Lazer'
  | 'Assinaturas'
  | 'Outros';

export type MemberRole = 'owner' | 'member';

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
}

export interface ExpenseShare {
  memberId: string;
  amountDueCents: number;
}

export interface Expense {
  id: string;
  description: string;
  amountCents: number;
  category: ExpenseCategory;
  paidByMemberId: string;
  occurredOn: string;
  shares: ExpenseShare[];
  note?: string;
  deletedAt?: string;
}

export interface Reminder {
  id: string;
  title: string;
  amountCents?: number;
  dueOn: string;
  note?: string;
  status: 'pending' | 'completed';
}

export interface SyncOperation {
  id: string;
  entity: 'expense' | 'reminder' | 'family';
  entityId: string;
  action: 'upsert' | 'delete';
  clientOperationId: string;
  payloadJson: string;
  createdAt: string;
}

export interface Balance {
  memberId: string;
  name: string;
  balanceCents: number;
}

export interface FamilyData {
  family: {
    id: string;
    name: string;
  };
  members: FamilyMember[];
  expenses: Expense[];
  reminders: Reminder[];
}
