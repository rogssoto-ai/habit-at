import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import UserInfoTab from './tabs/UserInfoTab';
import UserHabitsTab from './tabs/UserHabitsTab';
import UserMonitorTab from './tabs/UserMonitorTab';

type Tab = 'info' | 'habits' | 'monitor';

interface Props {
  invitation: any;
  onBack: () => void;
}

export default function UserDetailScreen({ invitation, onBack }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [tab, setTab] = useState<Tab>('info');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: t('user_detail.tab_info') },
    { key: 'habits', label: t('user_detail.tab_habits') },
    { key: 'monitor', label: t('user_detail.tab_monitor') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[styles.back, { color: theme.accent }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{invitation.userName}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={[styles.tabBar, { borderBottomColor: theme.background }]}>
        {tabs.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabItem, tab === key && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabLabel, { color: tab === key ? theme.accent : theme.textSecondary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'info' && <UserInfoTab invitation={invitation} onUnlinked={onBack} />}
        {tab === 'habits' && <UserHabitsTab invitation={invitation} />}
        {tab === 'monitor' && <UserMonitorTab invitation={invitation} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
  back: { fontSize: 24, width: 32 },
  title: { fontSize: 18, fontWeight: '600' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabLabel: { fontSize: 14, fontWeight: '500' },
});
