import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  onNext: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export default function O1Screen({ onNext, showBack, onBack }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {showBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={[styles.backText, { color: theme.accent }]}>← {t('onboarding.back')}</Text>
        </TouchableOpacity>
      )}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {t('onboarding.o1_title')}
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          {t('onboarding.o1_body')}
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: theme.accent }]} onPress={onNext}>
          <Text style={styles.nextText}>{t('onboarding.next')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
  backText: { fontSize: 16 },
  content: { paddingHorizontal: 28, paddingTop: 40, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 24, lineHeight: 36 },
  body: { fontSize: 17, lineHeight: 26 },
  footer: { padding: 24 },
  nextBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
