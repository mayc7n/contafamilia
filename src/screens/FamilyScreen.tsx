import { useState } from 'react';
import { Share, StyleSheet, TextInput, View } from 'react-native';
import { FamilyData } from '../domain/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';

export function FamilyScreen({ data, isOnline, onShareInvite, onDeleteFamily }: { data: FamilyData; isOnline: boolean; onShareInvite: () => Promise<void>; onDeleteFamily: () => Promise<void> }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  async function confirmDelete() {
    if (confirmation.trim() !== data.family.name) return;
    await onDeleteFamily();
  }
  return <Screen>
    <AppText variant="caption">SEU GRUPO DOMÉSTICO</AppText><AppText variant="title" style={styles.title}>Família</AppText>
    <View style={styles.hero}><View style={styles.familyMark}><AppText variant="title" color={colors.primary}>⌂</AppText></View><AppText variant="heading" color={colors.surface}>{data.family.name}</AppText><AppText variant="caption" color="#B6D7CB" style={styles.heroCaption}>{data.members.length} membros • {isOnline ? 'conectado' : 'offline'}</AppText></View>
    <SectionHeader title="Membros" />
    <View style={styles.card}>{data.members.map((member) => <View key={member.id} style={styles.memberRow}><View style={styles.avatar}><AppText color={colors.primaryDark}>{member.name.charAt(0)}</AppText></View><View style={styles.memberCopy}><AppText style={styles.memberName}>{member.name}</AppText><AppText variant="caption">{member.role === 'owner' ? 'Administrador' : 'Membro'}</AppText></View>{member.role === 'owner' ? <AppText variant="caption" color={colors.primary}>você</AppText> : null}</View>)}</View>
    <SectionHeader title="Convide alguém" />
    <View style={styles.inviteCard}><AppText variant="heading">Dividam a responsabilidade</AppText><AppText color={colors.muted} style={styles.inviteText}>Gere um convite para outra pessoa participar desta família.</AppText><PrimaryButton label="Compartilhar convite" variant="secondary" onPress={onShareInvite} /></View>
    <SectionHeader title="Privacidade e dados" />
    <View style={styles.privacyCard}><AppText color={colors.primaryDark} style={styles.privacyTitle}>🔒 Controle manual, por padrão</AppText><AppText color={colors.muted}>O Conta Família não acessa contas bancárias. Seus dados financeiros ficam neste dispositivo até a sincronização configurada.</AppText></View>
    <PrimaryButton label="Excluir todos os dados" variant="danger" onPress={() => setIsDeleting(true)} style={styles.deleteButton} />
    {isDeleting ? <View style={styles.deleteCard}><AppText variant="heading">Excluir {data.family.name}?</AppText><AppText color={colors.muted} style={styles.inviteText}>Essa ação remove as despesas, contas e membros. Digite o nome do grupo para confirmar.</AppText><TextInput value={confirmation} onChangeText={setConfirmation} placeholder={data.family.name} placeholderTextColor={colors.muted} style={styles.input} /><View style={styles.actions}><PrimaryButton label="Cancelar" variant="ghost" onPress={() => { setIsDeleting(false); setConfirmation(''); }} style={styles.actionButton} /><PrimaryButton label="Excluir agora" variant="danger" disabled={confirmation.trim() !== data.family.name} onPress={confirmDelete} style={styles.actionButton} /></View></View> : null}
  </Screen>;
}

export async function shareInvite(familyName: string): Promise<void> {
  await Share.share({ message: `Você foi convidado para participar da família ${familyName} no Conta Família. Abra o app para aceitar o convite.` });
}

const styles = StyleSheet.create({
  title: { marginTop: 3 },
  hero: { backgroundColor: colors.primaryDark, borderRadius: 22, padding: spacing.lg, marginTop: spacing.lg, alignItems: 'center' },
  familyMark: { width: 58, height: 58, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  heroCaption: { marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  memberCopy: { flex: 1, marginLeft: spacing.sm },
  memberName: { fontWeight: '700' },
  inviteCard: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  inviteText: { lineHeight: 21, marginVertical: spacing.sm },
  privacyCard: { backgroundColor: colors.primarySoft, borderRadius: 20, padding: spacing.md },
  privacyTitle: { fontWeight: '800', marginBottom: 5 },
  deleteButton: { marginTop: spacing.xl },
  deleteCard: { backgroundColor: colors.dangerSoft, borderRadius: 20, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: '#F6CACA' },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: '#E6B5B5', borderRadius: 13, minHeight: 48, paddingHorizontal: spacing.md, color: colors.ink },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionButton: { flex: 1 },
});
