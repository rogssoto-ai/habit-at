import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  onSelectCoach: () => void;
  onSelectUser: () => void;
}

export default function ProfileSelectScreen({ onSelectCoach, onSelectUser }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Habit At</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('auth.select_profile')}
        </Text>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.accent }]}
          onPress={onSelectCoach}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>{t('auth.coach')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnOutline, { borderColor: theme.accent }]}
          onPress={onSelectUser}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, { color: theme.accent }]}>{t('auth.user')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  title: { fontSize: 36, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 18, marginBottom: 48, textAlign: 'center' },
  btn: {
    width: '100%', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', marginBottom: 16,
  },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 2 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
