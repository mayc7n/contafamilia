import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, View } from 'react-native';
import { clearSessionToken, getSessionToken, saveSessionToken } from './src/auth/auth-store';
import { clearFamilyData, loadFamilyData, saveFamilyData, syncQueue } from './src/data/local-store';
import { buildMonthlySummary } from './src/domain/formatters';
import { Expense, FamilyData, Reminder } from './src/domain/types';
import { AppText } from './src/components/AppText';
import { BottomTabs } from './src/components/BottomTabs';
import { ExpenseDetailScreen } from './src/screens/ExpenseDetailScreen';
import { ExpenseFormScreen } from './src/screens/ExpenseFormScreen';
import { ExpensesScreen } from './src/screens/ExpensesScreen';
import { FamilyScreen, shareInvite } from './src/screens/FamilyScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RemindersScreen } from './src/screens/RemindersScreen';
import { TabKey } from './src/screens/types';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';

type DetailState = { type: 'form' } | { type: 'detail'; expense: Expense } | null;

export default function App() {
  const [data, setData] = useState<FamilyData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [detailState, setDetailState] = useState<DetailState>(null);

  useEffect(() => {
    let isMounted = true;
    getSessionToken().then(async (token) => {
      if (!isMounted) return;
      if (token) {
        setData(await loadFamilyData());
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });
    const unsubscribe = NetInfo.addEventListener((state) => setIsOnline(Boolean(state.isConnected)));
    return () => { isMounted = false; unsubscribe(); };
  }, []);

  async function startLocalSession(name: string) {
    await saveSessionToken(`local-session-${Date.now()}`);
    const loadedData = await loadFamilyData();
    const namedData = { ...loadedData, members: loadedData.members.map((member, index) => index === 0 ? { ...member, name } : member) };
    await saveFamilyData(namedData);
    setData(namedData);
    setIsAuthenticated(true);
  }

  async function saveData(nextData: FamilyData) {
    setData(nextData);
    await saveFamilyData(nextData);
  }

  async function enqueueChange(entity: 'expense' | 'reminder' | 'family', entityId: string, action: 'upsert' | 'delete', payload: unknown) {
    await syncQueue.enqueue({
      id: `operation-${Date.now()}-${entityId}`,
      clientOperationId: `client-${Date.now()}-${entityId}`,
      entity,
      entityId,
      action,
      payloadJson: JSON.stringify(payload),
      createdAt: new Date().toISOString(),
    });
  }

  async function handleSaveExpense(expense: Expense) {
    if (!data) return;
    await saveData({ ...data, expenses: [...data.expenses, expense] });
    await enqueueChange('expense', expense.id, 'upsert', expense);
    setDetailState(null);
    setActiveTab('expenses');
  }

  async function handleDeleteExpense(expenseId: string) {
    if (!data) return;
    const deletedAt = new Date().toISOString();
    await saveData({ ...data, expenses: data.expenses.map((expense) => expense.id === expenseId ? { ...expense, deletedAt } : expense) });
    await enqueueChange('expense', expenseId, 'delete', { deletedAt });
    setDetailState(null);
  }

  async function handleSaveReminder(reminder: Reminder) {
    if (!data) return;
    await saveData({ ...data, reminders: [...data.reminders, reminder] });
    await enqueueChange('reminder', reminder.id, 'upsert', reminder);
  }

  async function handleUpdateReminder(reminderId: string, status: Reminder['status']) {
    if (!data) return;
    const nextData = { ...data, reminders: data.reminders.map((reminder) => reminder.id === reminderId ? { ...reminder, status } : reminder) };
    await saveData(nextData);
    const reminder = nextData.reminders.find((item) => item.id === reminderId);
    if (reminder) await enqueueChange('reminder', reminderId, 'upsert', reminder);
  }

  async function handleDeleteReminder(reminderId: string) {
    if (!data) return;
    await saveData({ ...data, reminders: data.reminders.filter((reminder) => reminder.id !== reminderId) });
    await enqueueChange('reminder', reminderId, 'delete', { deletedAt: new Date().toISOString() });
  }

  async function handleShareSummary() {
    if (!data) return;
    await Share.share({ message: buildMonthlySummary(data, new Date().toISOString().slice(0, 7)) });
  }

  async function handleShareInvite() {
    if (data) await shareInvite(data.family.name);
  }

  async function handleDeleteFamily() {
    await clearFamilyData();
    await clearSessionToken();
    setData(null);
    setIsAuthenticated(false);
    setDetailState(null);
  }

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} /><AppText color={colors.muted} style={styles.loadingText}>Preparando seu espaço...</AppText></View>;
  }

  if (!isAuthenticated || !data) {
    return <><WelcomeScreen onStart={startLocalSession} /><StatusBar style="dark" /></>;
  }

  if (detailState?.type === 'form') {
    return <><ExpenseFormScreen data={data} onCancel={() => setDetailState(null)} onSave={handleSaveExpense} /><StatusBar style="dark" /></>;
  }

  if (detailState?.type === 'detail') {
    return <><ExpenseDetailScreen expense={detailState.expense} data={data} onBack={() => setDetailState(null)} onDelete={() => handleDeleteExpense(detailState.expense.id)} /><StatusBar style="dark" /></>;
  }

  return <View style={styles.app}><View style={styles.content}>{activeTab === 'home' ? <HomeScreen data={data} onAddExpense={() => setDetailState({ type: 'form' })} onOpenReminders={() => setActiveTab('reminders')} onShareSummary={handleShareSummary} /> : activeTab === 'expenses' ? <ExpensesScreen data={data} onAddExpense={() => setDetailState({ type: 'form' })} onSelectExpense={(expense) => setDetailState({ type: 'detail', expense })} /> : activeTab === 'reminders' ? <RemindersScreen data={data} onSaveReminder={handleSaveReminder} onUpdateReminder={handleUpdateReminder} onDeleteReminder={handleDeleteReminder} /> : <FamilyScreen data={data} isOnline={isOnline} onShareInvite={handleShareInvite} onDeleteFamily={handleDeleteFamily} />}</View><BottomTabs activeTab={activeTab} onChange={setActiveTab} /><StatusBar style="dark" /></View>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas },
  loadingText: { marginTop: spacing.sm },
});
