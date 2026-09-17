import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../theme/spacing';

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.row}>
      <AppText variant="heading">{title}</AppText>
      {action && onAction ? (
        <AppText accessibilityRole="button" onPress={onAction} color="#0E6B54" style={styles.action}>
          {action}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.lg },
  action: { fontWeight: '700', padding: 8 },
});
