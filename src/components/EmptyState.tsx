import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppText } from './AppText';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.mark}><AppText variant="heading" color={colors.primary}>+</AppText></View>
      <AppText variant="heading" style={styles.title}>{title}</AppText>
      <AppText color={colors.muted} style={styles.description}>{description}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  mark: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  title: { textAlign: 'center', marginBottom: 4 },
  description: { textAlign: 'center', lineHeight: 20 },
});
