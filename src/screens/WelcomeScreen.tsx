import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';

export function WelcomeScreen({ onStart }: { onStart: (name: string) => Promise<void> }) {
  const [name, setName] = useState('');
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
    <View style={styles.mark}><AppText variant="title" color={colors.surface}>CF</AppText></View>
    <AppText variant="title" style={styles.title}>Organizar a casa fica mais leve quando todo mundo participa.</AppText>
    <AppText color={colors.muted} style={styles.description}>Registre despesas, divida contas e acompanhe os vencimentos — sem conectar nenhum banco.</AppText>
    <View style={styles.notice}><AppText color={colors.primaryDark} style={styles.noticeText}>🔒 Seus dados ficam protegidos e você decide o que compartilhar.</AppText></View>
    <AppText variant="caption" style={styles.label}>COMO PODEMOS TE CHAMAR?</AppText>
    <TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Seu nome" />
    <PrimaryButton label="Começar offline" onPress={() => onStart(name.trim() || 'Ana')} style={styles.button} />
    <AppText variant="caption" style={styles.footer}>Você poderá convidar sua família depois.</AppText>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, justifyContent: 'center', padding: spacing.xl },
  mark: { width: 68, height: 68, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title: { maxWidth: 340, fontSize: 30, lineHeight: 36 },
  description: { fontSize: 16, lineHeight: 24, marginTop: spacing.md, maxWidth: 340 },
  notice: { backgroundColor: colors.primarySoft, padding: spacing.md, borderRadius: 16, marginTop: spacing.xl },
  noticeText: { fontWeight: '600', lineHeight: 21 },
  label: { letterSpacing: 1, fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 15, minHeight: 52, paddingHorizontal: spacing.md, fontSize: 16, color: colors.ink, backgroundColor: colors.surface },
  button: { marginTop: spacing.md },
  footer: { textAlign: 'center', marginTop: spacing.md },
});
