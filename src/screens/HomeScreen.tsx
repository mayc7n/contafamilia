import { Pressable, StyleSheet, View } from 'react-native';
import { calculateBalances, formatCurrency } from '../domain/expense-calculations';
import { formatBalance, formatDate } from '../domain/formatters';
import { FamilyData } from '../domain/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';

type HomeScreenProps = {
  data: FamilyData;
  onAddExpense: () => void;
  onOpenReminders: () => void;
  onShareSummary: () => Promise<void>;
};

export function HomeScreen({ data, onAddExpense, onOpenReminders, onShareSummary }: HomeScreenProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = data.expenses.filter((expense) => expense.occurredOn.startsWith(currentMonth) && !expense.deletedAt);
  const totalCents = monthExpenses.reduce((total, expense) => total + expense.amountCents, 0);
  const balances = calculateBalances(monthExpenses, data.members);
  const categoryTotals = monthExpenses.reduce<Record<string, number>>((totals, expense) => ({
    ...totals,
    [expense.category]: (totals[expense.category] ?? 0) + expense.amountCents,
  }), {});
  const topCategories = Object.entries(categoryTotals).sort(([, first], [, second]) => second - first).slice(0, 3);
  const upcomingReminders = data.reminders.filter((reminder) => reminder.status === 'pending').slice(0, 2);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <AppText variant="caption">Seu grupo doméstico</AppText>
          <AppText variant="title">Olá, Ana</AppText>
        </View>
        <View style={styles.avatar}><AppText variant="heading" color={colors.surface}>A</AppText></View>
      </View>

      <View style={styles.familyBanner}>
        <View style={styles.familyIcon}><AppText variant="heading" color={colors.primary}>⌂</AppText></View>
        <View style={styles.familyCopy}>
          <AppText variant="heading" style={styles.familyName}>{data.family.name}</AppText>
          <AppText variant="caption">{data.members.length} pessoas • dados no dispositivo</AppText>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <AppText variant="caption" style={styles.monthLabel}>SETEMBRO DE 2026</AppText>
      <View style={styles.statsRow}>
        <StatCard label="Total do mês" value={formatCurrency(totalCents)} helper={`${monthExpenses.length} lançamentos`} />
        <StatCard label="Contas próximas" value={`${upcomingReminders.length}`} helper="para acompanhar" tone="yellow" />
      </View>

      <PrimaryButton label="＋  Adicionar despesa" onPress={onAddExpense} style={styles.primaryAction} />

      <SectionHeader title="Categorias" action="Ver despesas" onAction={() => undefined} />
      <View style={styles.categoryCard}>
        {topCategories.length === 0 ? <AppText color={colors.muted}>Comece registrando uma despesa.</AppText> : topCategories.map(([category, amount]) => (
          <View key={category} style={styles.categoryRow}>
            <View style={styles.categoryDot} />
            <AppText style={styles.categoryName}>{category}</AppText>
            <AppText style={styles.categoryAmount}>{formatCurrency(amount)}</AppText>
          </View>
        ))}
      </View>

      <SectionHeader title="Como está a divisão?" />
      <View style={styles.balanceCard}>
        {balances.map((balance) => (
          <View key={balance.memberId} style={styles.balanceRow}>
            <View style={styles.memberAvatar}><AppText color={colors.primaryDark}>{balance.name.charAt(0)}</AppText></View>
            <View style={styles.balanceCopy}><AppText style={styles.memberName}>{balance.name}</AppText><AppText variant="caption">{formatBalance(balance)}</AppText></View>
            <AppText color={balance.balanceCents < 0 ? colors.success : balance.balanceCents > 0 ? colors.danger : colors.muted} style={styles.balanceValue}>{formatCurrency(Math.abs(balance.balanceCents))}</AppText>
          </View>
        ))}
      </View>

      <SectionHeader title="Próximos vencimentos" action="Ver contas" onAction={onOpenReminders} />
      <View style={styles.reminderCard}>
        {upcomingReminders.length === 0 ? <AppText color={colors.muted}>Nenhum vencimento pendente.</AppText> : upcomingReminders.map((reminder) => (
          <Pressable key={reminder.id} onPress={onOpenReminders} style={styles.reminderRow}>
            <View style={styles.calendarIcon}><AppText color={colors.primary}>◷</AppText></View>
            <View style={styles.reminderCopy}><AppText style={styles.memberName}>{reminder.title}</AppText><AppText variant="caption">Vence em {formatDate(reminder.dueOn)}</AppText></View>
            {reminder.amountCents ? <AppText style={styles.categoryAmount}>{formatCurrency(reminder.amountCents)}</AppText> : null}
          </Pressable>
        ))}
      </View>

      <PrimaryButton label="Compartilhar resumo" variant="secondary" onPress={onShareSummary} style={styles.shareButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  familyBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryDark, borderRadius: 20, padding: spacing.md, marginBottom: spacing.lg },
  familyIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  familyCopy: { flex: 1, marginLeft: spacing.sm },
  familyName: { color: colors.surface, fontSize: 16 },
  onlineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#79D49B' },
  monthLabel: { letterSpacing: 1.2, fontWeight: '700', marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', marginBottom: spacing.md },
  primaryAction: { marginBottom: spacing.sm },
  categoryCard: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  categoryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  categoryDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, marginRight: spacing.sm },
  categoryName: { flex: 1, fontWeight: '600' },
  categoryAmount: { fontWeight: '700' },
  balanceCard: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  balanceRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  balanceCopy: { flex: 1, marginLeft: spacing.sm },
  memberName: { fontWeight: '700' },
  balanceValue: { fontWeight: '800' },
  reminderCard: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  reminderRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm },
  calendarIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  reminderCopy: { flex: 1, marginLeft: spacing.sm },
  shareButton: { marginTop: spacing.lg },
});
