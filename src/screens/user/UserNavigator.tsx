import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import UserHabitsScreen from './UserHabitsScreen';
import UserProgressScreen from './UserProgressScreen';
import UserSettingsScreen from './UserSettingsScreen';

type Tab = 'habits' | 'progress' | 'settings';

export default function UserNavigator() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [tab, setTab] = useState<Tab>('habits');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'habits', label: t('user.tabs.habits'), icon: '✅' },
    { key: 'progress', label: t('user.tabs.progress'), icon: '📊' },
    { key: 'settings', label: t('user.tabs.settings'), icon: '⚙️' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        {tab === 'habits' && <UserHabitsScreen />}
        {tab === 'progress' && <UserProgressScreen />}
        {tab === 'settings' && <UserSettingsScreen />}
      </View>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.tabBar, { backgroundColor: theme.surface, borderTopColor: theme.background }]}>
        {tabs.map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            style={styles.tabItem}
            onPress={() => setTab(key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{icon}</Text>
            <Text style={[styles.tabLabel, { color: tab === key ? theme.accent : theme.textSecondary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: 11, fontWeight: '500' },
});
