import { StyleSheet, View } from 'react-native';
import { formatCurrency } from '../domain/expense-calculations';
import { formatDate } from '../domain/formatters';
import { Expense, FamilyData } from '../domain/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';

export function ExpenseDetailScreen({ expense, data, onBack, onDelete }: { expense: Expense; data: FamilyData; onBack: () => void; onDelete: () => Promise<void> }) {
  const memberName = (memberId: string) => data.members.find((member) => member.id === memberId)?.name ?? 'Pessoa';
  return <Screen>
    <AppText accessibilityRole="button" onPress={onBack} color={colors.primary} style={styles.back}>‹  Voltar para despesas</AppText>
    <View style={styles.hero}><View style={styles.icon}><AppText variant="title" color={colors.primary}>＋</AppText></View><AppText variant="title" style={styles.title}>{expense.description}</AppText><AppText variant="caption">{expense.category} • {formatDate(expense.occurredOn)}</AppText><AppText variant="amount" style={styles.amount}>{formatCurrency(expense.amountCents)}</AppText></View>
    <View style={styles.card}><AppText variant="caption">PAGO POR</AppText><AppText variant="heading" style={styles.payer}>{memberName(expense.paidByMemberId)}</AppText></View>
    <AppText variant="heading" style={styles.section}>Divisão da conta</AppText>
    <View style={styles.card}>{expense.shares.map((share) => <View key={share.memberId} style={styles.shareRow}><AppText>{memberName(share.memberId)}</AppText><AppText style={styles.shareAmount}>{formatCurrency(share.amountDueCents)}</AppText></View>)}</View>
    <PrimaryButton label="Excluir despesa" variant="danger" onPress={onDelete} style={styles.deleteButton} />
  </Screen>;
}

const styles = StyleSheet.create({
  back: { fontWeight: '700', paddingVertical: spacing.sm },
  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  icon: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { textAlign: 'center' },
  amount: { color: colors.primaryDark, marginTop: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  payer: { marginTop: 4 },
  section: { marginTop: spacing.xl, marginBottom: spacing.sm },
  shareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  shareAmount: { fontWeight: '700' },
  deleteButton: { marginTop: spacing.xl },
});
