import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { TabKey } from '../screens/types';

const tabs: { key: TabKey; label: string; symbol: string }[] = [
  { key: 'home', label: 'Início', symbol: '⌂' },
  { key: 'expenses', label: 'Despesas', symbol: '↗' },
  { key: 'reminders', label: 'Contas', symbol: '◷' },
  { key: 'family', label: 'Família', symbol: '♧' },
];

export function BottomTabs({ activeTab, onChange }: { activeTab: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={tab.label} onPress={() => onChange(tab.key)} style={styles.tab}>
            <Text style={[styles.symbol, active && styles.active]}>{tab.symbol}</Text>
            <Text style={[styles.label, active && styles.active]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, paddingBottom: 12 },
  tab: { flex: 1, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  symbol: { color: colors.muted, fontSize: 22, lineHeight: 24, fontWeight: '700' },
  label: { color: colors.muted, fontSize: 11, marginTop: 3, fontWeight: '600' },
  active: { color: colors.primary },
});
