import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import UsersScreen from './UsersScreen';
import TemplatesScreen from './TemplatesScreen';
import InvitationsScreen from './InvitationsScreen';
import CoachSettingsScreen from './CoachSettingsScreen';
import UserDetailScreen from './UserDetailScreen';

type Tab = 'users' | 'templates' | 'invitations' | 'settings';

export default function CoachNavigator() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { firebaseUser, coachData, refreshCoachData } = useAuth();
  const [tab, setTab] = useState<Tab>('users');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveName = async () => {
    if (!displayName.trim() || !firebaseUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'coaches', firebaseUser.uid), {
        displayName: displayName.trim(),
        email: firebaseUser.email,
        plan: 'starter',
        subscriptionStatus: 'expired',
        subscriptionExpiry: null,
        createdAt: serverTimestamp(),
      });
      await refreshCoachData();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setSaving(false);
    }
  };

  // Coach nuevo: pedir nombre antes de mostrar el panel
  if (!coachData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: '600', color: theme.textPrimary, marginBottom: 8, textAlign: 'center' }}>
          {t('auth.display_name_title')}
        </Text>
        <TextInput
          style={{ borderWidth: 1.5, borderColor: theme.accent, borderRadius: 10, padding: 14, fontSize: 16, color: theme.textPrimary, backgroundColor: theme.surface, width: '100%', marginBottom: 4 }}
          value={displayName}
          onChangeText={(v) => setDisplayName(v.slice(0, 40))}
          placeholder={t('auth.display_name_placeholder')}
          placeholderTextColor={theme.textSecondary}
          maxLength={40}
          autoFocus
        />
        <Text style={{ fontSize: 12, color: theme.textSecondary, alignSelf: 'flex-end', marginBottom: 20 }}>
          {displayName.length}/40
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: displayName.trim() ? theme.accent : theme.textSecondary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', width: '100%' }}
          onPress={handleSaveName}
          disabled={!displayName.trim() || saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{t('auth.display_name_confirm')}</Text>
          }
        </TouchableOpacity>
      </View>
    );
  }

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
