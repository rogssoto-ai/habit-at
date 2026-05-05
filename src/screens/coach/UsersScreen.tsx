import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface Invitation {
  id: string;
  code: string;
  status: 'pending' | 'active' | 'deactivated';
  userName: string;
  userId?: string;
  userEmail?: string;
  userDeleted?: boolean;
  groupId?: string;
}

interface Props {
  onUserPress: (invitation: Invitation) => void;
}

export default function UsersScreen({ onUserPress }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { firebaseUser } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }
    const ref = collection(db, 'coaches', firebaseUser.uid, 'invitations');
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Invitation[];
      setInvitations(data);
      setLoading(false);
    });
    return unsub;
  }, [firebaseUser]);

  const filtered = invitations.filter(inv => {
    const s = search.toLowerCase();
    return (
      inv.userName?.toLowerCase().includes(s) ||
      inv.userEmail?.toLowerCase().includes(s) ||
      inv.code?.toLowerCase().includes(s)
    );
  });

  const renderItem = ({ item }: { item: Invitation }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }]}
      onPress={() => onUserPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.userName, { color: theme.textPrimary }]}>{item.userName}</Text>
        {item.status === 'pending' && (
          <View style={styles.row}>
            <Text style={[styles.statusBadge, { color: theme.notification }]}>
              {t('coach.users.pending')}
            </Text>
            <Text style={[styles.code, { color: theme.textSecondary }]}>{item.code}</Text>
          </View>
        )}
        {item.status === 'active' && !item.userDeleted && (
          <Text style={[styles.email, { color: theme.textSecondary }]}>{item.userEmail}</Text>
        )}
        {item.userDeleted && (
          <Text style={[styles.email, { color: '#EF4444' }]}>{t('coach.users.eliminated')}</Text>
        )}
      </View>
      <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
        <Text style={{ color: theme.textSecondary }}>🔍 </Text>
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          value={search}
          onChangeText={setSearch}
          placeholder={t('coach.users.search_placeholder')}
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {t('coach.users.no_users')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 16 },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
  card: {
    borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  cardContent: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  statusBadge: { fontSize: 13, fontWeight: '500' },
  code: { fontSize: 13 },
  email: { fontSize: 14 },
  arrow: { fontSize: 22 },
  emptyText: { fontSize: 16 },
});
