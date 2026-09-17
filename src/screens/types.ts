import { FamilyData, Expense, Reminder } from '../domain/types';

export type TabKey = 'home' | 'expenses' | 'reminders' | 'family';

export type ScreenActions = {
  onSaveExpense: (expense: Expense) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onSaveReminder: (reminder: Reminder) => Promise<void>;
  onUpdateReminder: (reminderId: string, status: Reminder['status']) => Promise<void>;
  onDeleteReminder: (reminderId: string) => Promise<void>;
  onShareSummary: () => Promise<void>;
  onShareInvite: () => Promise<void>;
  onDeleteFamily: () => Promise<void>;
};

export type DataProps = { data: FamilyData };
