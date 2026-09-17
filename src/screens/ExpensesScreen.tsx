import { Pressable, StyleSheet, View } from 'react-native';
import { formatCurrency } from '../domain/expense-calculations';
import { formatDate } from '../domain/formatters';
import { Expense, FamilyData } from '../domain/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';

export function ExpensesScreen({ data, onAddExpense, onSelectExpense }: { data: FamilyData; onAddExpense: () => void; onSelectExpense: (expense: Expense) => void }) {
  const expenses = data.expenses.filter((expense) => !expense.deletedAt);
  const memberName = (memberId: string) => data.members.find((member) => member.id === memberId)?.name ?? 'Pessoa';

  return (
    <Screen>
      <View style={styles.header}><View><AppText variant="caption">SETEMBRO DE 2026</AppText><AppText variant="title">Despesas</AppText></View><View style={styles.countPill}><AppText color={colors.primary}>{expenses.length}</AppText></View></View>
      <PrimaryButton label="＋  Nova despesa" onPress={onAddExpense} />
      <View style={styles.filterRow}><View style={styles.filterActive}><AppText color={colors.surface} style={styles.filterText}>Todas</AppText></View><View style={styles.filter}><AppText color={colors.muted} style={styles.filterText}>Por categoria</AppText></View><View style={styles.filter}><AppText color={colors.muted} style={styles.filterText}>Por pessoa</AppText></View></View>
      <SectionHeader title="Lançamentos recentes" />
      {expenses.length === 0 ? <EmptyState title="Nenhuma despesa ainda" description="Registre o primeiro gasto da casa para começar a acompanhar a divisão." /> : (
        <View style={styles.listCard}>
          {expenses.map((expense) => <Pressable key={expense.id} onPress={() => onSelectExpense(expense)} style={styles.expenseRow}>
            <View style={styles.expenseIcon}><AppText color={colors.primary}>{expense.category === 'Mercado' ? '⌁' : expense.category === 'Contas' ? '⌂' : '＋'}</AppText></View>
            <View style={styles.expenseCopy}><AppText style={styles.expenseTitle}>{expense.description}</AppText><AppText variant="caption">{expense.category} • pago por {memberName(expense.paidByMemberId)}</AppText><AppText variant="caption">{formatDate(expense.occurredOn)}</AppText></View>
            <AppText style={styles.expenseAmount}>{formatCurrency(expense.amountCents)}</AppText>
          </Pressable>)}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  countPill: { backgroundColor: colors.primarySoft, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', marginTop: spacing.lg, gap: 8 },
  filterActive: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  filter: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  filterText: { fontSize: 12, fontWeight: '700' },
  listCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: spacing.sm },
  expenseRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  expenseIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  expenseCopy: { flex: 1, marginLeft: spacing.sm },
  expenseTitle: { fontWeight: '700', marginBottom: 2 },
  expenseAmount: { fontWeight: '800', marginLeft: spacing.xs },
});
