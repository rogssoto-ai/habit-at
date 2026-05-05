import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../store/AuthContext';
import { doc, updateDoc, deleteDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface Props {
  invitation: any;
  onUnlinked: () => void;
}

export default function UserInfoTab({ invitation, onUnlinked }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { firebaseUser } = useAuth();
  const [unlinking, setUnlinking] = useState(false);

  const doUnlink = async () => {
    if (!firebaseUser) return;
    setUnlinking(true);
    try {
      const coachId = firebaseUser.uid;

      await updateDoc(doc(db, 'coaches', coachId, 'invitations', invitation.id), {
        status: 'pending',
        activatedAt: null,
        googleUid: deleteField(),
        googleEmail: deleteField(),
      });

      await updateDoc(doc(db, 'keys', invitation.code), {
        status: 'pending',
        userId: null,
      });

      const linkedUid: string | undefined = invitation.googleUid;
      if (linkedUid) {
        await deleteDoc(doc(db, 'coaches', coachId, 'users', linkedUid));
        await deleteDoc(doc(db, 'users', linkedUid));
      }

      onUnlinked();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setUnlinking(false);
    }
  };

  const handleUnlink = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('user_detail.unlink_confirm'))) doUnlink();
    } else {
      Alert.alert(
        t('user_detail.unlink'),
        t('user_detail.unlink_confirm'),
        [
          { text: t('user_detail.unlink_cancel'), style: 'cancel' },
          { text: t('user_detail.unlink_ok'), style: 'destructive', onPress: doUnlink },
        ]
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          {t('user_detail.display_name')}
        </Text>
        <Text style={[styles.fieldValue, { color: theme.textPrimary }]}>
          {invitation.userName}
        </Text>

        {invitation.status === 'active' && !invitation.userDeleted && (
          <>
            <View style={[styles.sep, { backgroundColor: theme.background }]} />
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              {t('user_detail.email')}
            </Text>
            <Text style={[styles.fieldValue, { color: theme.textPrimary }]}>
              {invitation.googleEmail ?? invitation.userEmail ?? '—'}
            </Text>
          </>
        )}

        {invitation.userDeleted && (
          <>
            <View style={[styles.sep, { backgroundColor: theme.background }]} />
            <Text style={[styles.fieldValue, { color: '#EF4444' }]}>
              {t('user_detail.eliminated')}
            </Text>
          </>
        )}

        {invitation.status === 'pending' && (
          <>
            <View style={[styles.sep, { backgroundColor: theme.background }]} />
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Clave</Text>
            <Text style={[styles.fieldValue, { color: theme.accent }]}>{invitation.code}</Text>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.unlinkBtn, { borderColor: '#EF4444', opacity: unlinking ? 0.5 : 1 }]}
        onPress={handleUnlink}
        disabled={unlinking}
      >
        {unlinking
          ? <ActivityIndicator color="#EF4444" />
          : <Text style={styles.unlinkText}>🗑 {t('user_detail.unlink')}</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 16 },
  card: { borderRadius: 14, padding: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  fieldValue: { fontSize: 16 },
  sep: { height: 1, marginVertical: 16 },
  unlinkBtn: { borderWidth: 2, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  unlinkText: { color: '#EF4444', fontWeight: '600', fontSize: 16 },
});
