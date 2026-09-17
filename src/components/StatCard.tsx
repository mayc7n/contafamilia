import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppText } from './AppText';

export function StatCard({ label, value, helper, tone = 'green' }: { label: string; value: string; helper?: string; tone?: 'green' | 'yellow' | 'lavender' }) {
  return (
    <View style={[styles.card, tone === 'yellow' && styles.yellow, tone === 'lavender' && styles.lavender]}>
      <AppText variant="caption" color={colors.muted}>{label}</AppText>
      <AppText variant="amount" style={styles.value}>{value}</AppText>
      {helper ? <AppText variant="caption">{helper}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 118, padding: spacing.md, borderRadius: 20, backgroundColor: colors.primarySoft, justifyContent: 'space-between', marginRight: spacing.sm },
  yellow: { backgroundColor: colors.accentSoft },
  lavender: { backgroundColor: colors.lavender },
  value: { marginVertical: 4 },
});
