import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ExpenseCategory, Expense, ExpenseShare, FamilyData } from '../domain/types';
import { formatCurrency, splitEqually, validateCustomSplit } from '../domain/expense-calculations';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';

const categories: ExpenseCategory[] = ['Mercado', 'Contas', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros'];

function parseAmountToCents(value: string): number {
  const normalizedValue = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
  const amount = Number(normalizedValue.replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export function ExpenseFormScreen({ data, onCancel, onSave }: { data: FamilyData; onCancel: () => void; onSave: (expense: Expense) => Promise<void> }) {
  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Mercado');
  const [paidByMemberId, setPaidByMemberId] = useState(data.members[0]?.id ?? '');
  const [participantIds, setParticipantIds] = useState<string[]>(data.members.map((member) => member.id));
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const amountCents = parseAmountToCents(amountText);
  const equalShares = useMemo(() => splitEqually(amountCents, participantIds), [amountCents, participantIds]);
  const customShares: ExpenseShare[] = participantIds.map((memberId) => ({ memberId, amountDueCents: parseAmountToCents(customValues[memberId] ?? '') }));
  const currentShares = splitMode === 'equal' ? equalShares : customShares;

  function toggleParticipant(memberId: string) {
    setParticipantIds((currentIds) => currentIds.includes(memberId) ? currentIds.filter((id) => id !== memberId) : [...currentIds, memberId]);
  }

  async function handleSave() {
    if (!description.trim()) { setError('Dê um nome para essa despesa.'); return; }
    if (amountCents <= 0) { setError('Informe um valor maior que zero.'); return; }
    if (participantIds.length === 0) { setError('Escolha pelo menos uma pessoa.'); return; }
    const splitError = validateCustomSplit(amountCents, currentShares);
    if (splitError) { setError(splitMode === 'equal' ? 'Não foi possível dividir essa conta.' : splitError); return; }
    await onSave({
      id: `expense-${Date.now()}`,
      description: description.trim(),
      amountCents,
      category,
      paidByMemberId,
      occurredOn: new Date().toISOString().slice(0, 10),
      shares: currentShares,
    });
  }

  return <Screen>
    <AppText accessibilityRole="button" onPress={onCancel} color={colors.primary} style={styles.back}>‹  Cancelar</AppText>
    <AppText variant="title">Nova despesa</AppText>
    <AppText color={colors.muted} style={styles.subtitle}>Registre de forma simples e divida com a casa.</AppText>
    <AppText variant="caption" style={styles.label}>O QUE FOI?</AppText>
    <TextInput value={description} onChangeText={setDescription} placeholder="Ex.: Mercado do mês" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Descrição da despesa" />
    <AppText variant="caption" style={styles.label}>VALOR</AppText>
    <View style={styles.amountInput}><AppText variant="heading" color={colors.primary}>R$</AppText><TextInput value={amountText} onChangeText={setAmountText} keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={colors.muted} style={styles.amountText} accessibilityLabel="Valor da despesa" /></View>
    <AppText variant="caption" style={styles.label}>CATEGORIA</AppText>
    <View style={styles.chipWrap}>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.selectedChip]}><AppText color={category === item ? colors.surface : colors.ink} style={styles.chipText}>{item}</AppText></Pressable>)}</View>
    <AppText variant="caption" style={styles.label}>QUEM PAGOU?</AppText>
    <View style={styles.chipWrap}>{data.members.map((member) => <Pressable key={member.id} onPress={() => setPaidByMemberId(member.id)} style={[styles.chip, paidByMemberId === member.id && styles.selectedChip]}><AppText color={paidByMemberId === member.id ? colors.surface : colors.ink} style={styles.chipText}>{member.name}</AppText></Pressable>)}</View>
    <AppText variant="caption" style={styles.label}>QUEM PARTICIPA?</AppText>
    <View style={styles.chipWrap}>{data.members.map((member) => <Pressable key={member.id} onPress={() => toggleParticipant(member.id)} style={[styles.chip, participantIds.includes(member.id) && styles.selectedChip]}><AppText color={participantIds.includes(member.id) ? colors.surface : colors.ink} style={styles.chipText}>{participantIds.includes(member.id) ? '✓ ' : ''}{member.name}</AppText></Pressable>)}</View>
    <View style={styles.modeRow}><AppText variant="caption">DIVISÃO</AppText><View style={styles.modeButtons}><Pressable onPress={() => setSplitMode('equal')} style={[styles.modeButton, splitMode === 'equal' && styles.modeSelected]}><AppText color={splitMode === 'equal' ? colors.primary : colors.muted} style={styles.modeText}>Igual</AppText></Pressable><Pressable onPress={() => setSplitMode('custom')} style={[styles.modeButton, splitMode === 'custom' && styles.modeSelected]}><AppText color={splitMode === 'custom' ? colors.primary : colors.muted} style={styles.modeText}>Personalizada</AppText></Pressable></View></View>
    <View style={styles.shareCard}>{currentShares.map((share) => { const member = data.members.find((item) => item.id === share.memberId); return <View key={share.memberId} style={styles.shareLine}><AppText>{member?.name}</AppText>{splitMode === 'custom' ? <TextInput value={customValues[share.memberId] ?? ''} onChangeText={(value) => setCustomValues((current) => ({ ...current, [share.memberId]: value }))} keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={colors.muted} style={styles.customInput} /> : <AppText style={styles.shareValue}>{formatCurrency(share.amountDueCents)}</AppText>}</View>; })}</View>
    {error ? <AppText color={colors.danger} style={styles.error}>{error}</AppText> : null}
    <PrimaryButton label="Salvar despesa" onPress={handleSave} style={styles.saveButton} />
  </Screen>;
}

const styles = StyleSheet.create({
  back: { fontWeight: '700', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  subtitle: { marginTop: 5, marginBottom: spacing.md },
  label: { letterSpacing: 1, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 15, minHeight: 52, paddingHorizontal: spacing.md, fontSize: 16, color: colors.ink, backgroundColor: colors.surface },
  amountInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 15, minHeight: 58, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  amountText: { flex: 1, paddingLeft: spacing.sm, fontSize: 24, fontWeight: '800', color: colors.ink },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '700' },
  modeRow: { marginTop: spacing.lg },
  modeButtons: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 4, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  modeButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 11 },
  modeSelected: { backgroundColor: colors.primarySoft },
  modeText: { fontSize: 13, fontWeight: '700' },
  shareCard: { backgroundColor: colors.surface, padding: spacing.sm, borderRadius: 18, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  shareLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  shareValue: { fontWeight: '800' },
  customInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, width: 90, textAlign: 'right', color: colors.ink },
  error: { marginTop: spacing.sm, lineHeight: 20 },
  saveButton: { marginTop: spacing.lg },
});
