import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useOnboarding } from '../../store/OnboardingContext';

interface Props {
  onBack: () => void;
  onDone: () => void;
}

type InnerScreen = 'terms' | 'disclaimer' | null;

export default function O3Screen({ onBack, onDone }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { completeOnboarding } = useOnboarding();
  const [accepted, setAccepted] = useState(false);
  const [innerScreen, setInnerScreen] = useState<InnerScreen>(null);

  const handleContinue = async () => {
    if (!accepted) return;
    await completeOnboarding();
    onDone();
  };

  const openPrivacy = () => {
    // URL a definir durante desarrollo
    Linking.openURL('https://github.com');
  };

  if (innerScreen) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setInnerScreen(null)}>
          <Text style={[styles.backText, { color: theme.accent }]}>← {t('onboarding.back')}</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {innerScreen === 'terms' ? t('onboarding.terms_title') : t('onboarding.disclaimer_title')}
          </Text>
          <Text style={[styles.body, { color: theme.textSecondary }]}>
            {innerScreen === 'terms' ? t('onboarding.terms_body') : t('onboarding.disclaimer_body')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={[styles.backText, { color: theme.accent }]}>← {t('onboarding.back')}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {t('onboarding.o3_title')}
        </Text>
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          {t('onboarding.o3_legal_intro')}
        </Text>

        <TouchableOpacity onPress={() => setInnerScreen('terms')}>
          <Text style={[styles.link, { color: theme.accent }]}>
            • {t('onboarding.o3_terms')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openPrivacy}>
          <Text style={[styles.link, { color: theme.accent }]}>
            • {t('onboarding.o3_privacy')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setInnerScreen('disclaimer')}>
          <Text style={[styles.link, { color: theme.accent }]}>
            • {t('onboarding.o3_disclaimer')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            { borderColor: theme.accent },
            accepted && { backgroundColor: theme.accent }
          ]}>
            {accepted && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={[styles.checkLabel, { color: theme.textSecondary }]}>
            {t('onboarding.o3_checkbox')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: accepted ? theme.accent : theme.textSecondary }
          ]}
          onPress={handleContinue}
          disabled={!accepted}
        >
          <Text style={styles.nextText}>{t('onboarding.continue')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
  backText: { fontSize: 16 },
  content: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 16, lineHeight: 36 },
  intro: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
  link: { fontSize: 16, marginBottom: 10, textDecorationLine: 'underline' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 28, gap: 12 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0,
  },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  checkLabel: { fontSize: 15, lineHeight: 22, flex: 1 },
  body: { fontSize: 16, lineHeight: 25 },
  footer: { padding: 24 },
  nextBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  nextText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
