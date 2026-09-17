import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { formatCurrency } from '../domain/expense-calculations';
import { formatDate } from '../domain/formatters';
import { FamilyData, Reminder } from '../domain/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';

export function RemindersScreen({ data, onSaveReminder, onUpdateReminder, onDeleteReminder }: { data: FamilyData; onSaveReminder: (reminder: Reminder) => Promise<void>; onUpdateReminder: (reminderId: string, status: Reminder['status']) => Promise<void>; onDeleteReminder: (reminderId: string) => Promise<void> }) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [dueOn, setDueOn] = useState('2026-09-30');
  const [amountText, setAmountText] = useState('');
  const pendingReminders = data.reminders.filter((reminder) => reminder.status === 'pending');
  const completedReminders = data.reminders.filter((reminder) => reminder.status === 'completed');

  async function saveReminder() {
    const parsedAmount = amountText.includes(',') ? amountText.replace(',', '.') : amountText;
    await onSaveReminder({
      id: `reminder-${Date.now()}`,
      title: title.trim() || 'Novo vencimento',
      dueOn,
      amountCents: Number(parsedAmount) > 0 ? Math.round(Number(parsedAmount) * 100) : undefined,
      status: 'pending',
    });
    setTitle(''); setAmountText(''); setIsCreating(false);
  }

  return <Screen>
    <View style={styles.header}><View><AppText variant="caption">PARA NÃO ESQUECER</AppText><AppText variant="title">Contas</AppText></View><View style={styles.countPill}><AppText color={colors.primary}>{pendingReminders.length}</AppText></View></View>
    <PrimaryButton label="＋  Novo lembrete" onPress={() => setIsCreating((current) => !current)} />
    {isCreating ? <View style={styles.formCard}><AppText variant="heading">Novo lembrete</AppText><TextInput value={title} onChangeText={setTitle} placeholder="Ex.: Aluguel" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Título do lembrete" /><TextInput value={dueOn} onChangeText={setDueOn} placeholder="AAAA-MM-DD" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Data de vencimento" /><TextInput value={amountText} onChangeText={setAmountText} placeholder="Valor opcional: 0,00" placeholderTextColor={colors.muted} keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Valor do lembrete" /><PrimaryButton label="Salvar lembrete" onPress={saveReminder} /></View> : null}
    <SectionHeader title="Pendentes" />
    {pendingReminders.length === 0 ? <EmptyState title="Tudo em dia" description="Nenhum vencimento pendente para acompanhar." /> : <View style={styles.listCard}>{pendingReminders.map((reminder) => <ReminderRow key={reminder.id} reminder={reminder} onComplete={() => onUpdateReminder(reminder.id, 'completed')} onDelete={() => onDeleteReminder(reminder.id)} />)}</View>}
    {completedReminders.length > 0 ? <><SectionHeader title="Concluídas" /><View style={styles.listCard}>{completedReminders.map((reminder) => <ReminderRow key={reminder.id} reminder={reminder} onComplete={() => onUpdateReminder(reminder.id, 'pending')} onDelete={() => onDeleteReminder(reminder.id)} />)}</View></> : null}
  </Screen>;
}

function ReminderRow({ reminder, onComplete, onDelete }: { reminder: Reminder; onComplete: () => void; onDelete: () => void }) {
  return <View style={styles.row}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: reminder.status === 'completed' }} onPress={onComplete} style={[styles.check, reminder.status === 'completed' && styles.checked]}><AppText color={reminder.status === 'completed' ? colors.surface : colors.primary}>{reminder.status === 'completed' ? '✓' : ''}</AppText></Pressable><View style={styles.copy}><AppText style={[styles.title, reminder.status === 'completed' && styles.strikethrough]}>{reminder.title}</AppText><AppText variant="caption">Vence em {formatDate(reminder.dueOn)}</AppText></View><View style={styles.right}>{reminder.amountCents ? <AppText style={styles.amount}>{formatCurrency(reminder.amountCents)}</AppText> : null}<AppText accessibilityRole="button" onPress={onDelete} color={colors.danger} style={styles.delete}>Excluir</AppText></View></View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  countPill: { backgroundColor: colors.primarySoft, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  formCard: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md, gap: 10 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 13, minHeight: 48, paddingHorizontal: spacing.md, color: colors.ink, fontSize: 15 },
  listCard: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  check: { width: 28, height: 28, borderRadius: 10, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: colors.primary },
  copy: { flex: 1, marginLeft: spacing.sm },
  title: { fontWeight: '700' },
  strikethrough: { textDecorationLine: 'line-through', color: colors.muted },
  right: { alignItems: 'flex-end' },
  amount: { fontWeight: '800' },
  delete: { fontSize: 11, marginTop: 4 },
});
