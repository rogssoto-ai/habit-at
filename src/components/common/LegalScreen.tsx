import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

export type LegalType = 'terms' | 'privacy' | 'disclaimer';

interface Props {
  type: LegalType;
  onBack: () => void;
}

export default function LegalScreen({ type, onBack }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  if (type === 'privacy') {
    // Abre URL externa — no debería llegar aquí normalmente
    Linking.openURL('https://github.com');
    onBack();
    return null;
  }

  const title = type === 'terms' ? t('settings.terms') : t('settings.disclaimer');
  const body = type === 'terms' ? t('onboarding.terms_body') : t('onboarding.disclaimer_body');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={[styles.backText, { color: theme.accent }]}>← {t('onboarding.back')}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{body}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
  backText: { fontSize: 16 },
  content: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 20 },
  body: { fontSize: 16, lineHeight: 25 },
});
