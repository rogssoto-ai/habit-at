import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';

interface Props {
  invitation: any;
}

export default function UserInfoTab({ invitation }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handleUnlink = () => {
    Alert.alert(
      t('user_detail.unlink'),
      t('user_detail.unlink_confirm'),
      [
        { text: t('user_detail.unlink_cancel'), style: 'cancel' },
        { text: t('user_detail.unlink_ok'), style: 'destructive', onPress: () => {} },
      ]
    );
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
              {invitation.userEmail ?? '—'}
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
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Clave
            </Text>
            <Text style={[styles.fieldValue, { color: theme.accent }]}>
              {invitation.code}
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.unlinkBtn, { borderColor: '#EF4444' }]}
        onPress={handleUnlink}
      >
        <Text style={[styles.unlinkText]}>🗑 {t('user_detail.unlink')}</Text>
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
