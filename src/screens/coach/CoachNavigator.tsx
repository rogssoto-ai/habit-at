import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import UsersScreen from './UsersScreen';
import TemplatesScreen from './TemplatesScreen';
import InvitationsScreen from './InvitationsScreen';
import CoachSettingsScreen from './CoachSettingsScreen';
import UserDetailScreen from './UserDetailScreen';

type Tab = 'users' | 'templates' | 'invitations' | 'settings';

export default function CoachNavigator() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [tab, setTab] = useState<Tab>('users');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  if (selectedUser) {
    return <UserDetailScreen invitation={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'users', label: t('coach.tabs.users'), icon: '👥' },
    { key: 'templates', label: t('coach.tabs.templates'), icon: '📋' },
    { key: 'invitations', label: t('coach.tabs.invitations'), icon: '✉️' },
    { key: 'settings', label: t('coach.tabs.settings'), icon: '⚙️' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        {tab === 'users' && <UsersScreen onUserPress={setSelectedUser} />}
        {tab === 'templates' && <TemplatesScreen />}
        {tab === 'invitations' && <InvitationsScreen />}
        {tab === 'settings' && <CoachSettingsScreen />}
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
  tabBar: {
    flexDirection: 'row', borderTopWidth: 1,
    paddingBottom: 4,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: 11, fontWeight: '500' },
});
