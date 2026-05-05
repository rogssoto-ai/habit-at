import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import { ThemeName, themes } from '../../theme/themes';
import { setLanguage } from '../../i18n';
import OnboardingNavigator from '../onboarding/OnboardingNavigator';
import LegalScreen, { LegalType } from '../../components/common/LegalScreen';

export default function UserSettingsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, themeName, setTheme } = useTheme();
  const { firebaseUser, signOut } = useAuth();
  const [showTheme, setShowTheme] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [legalScreen, setLegalScreen] = useState<LegalType | null>(null);

  const confirmSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('settings.sign_out') + '?')) signOut();
    } else {
      Alert.alert(t('settings.sign_out'), undefined, [
        { text: t('settings.cancel'), style: 'cancel' },
        { text: t('settings.confirm'), onPress: signOut },
      ]);
    }
  };

  const confirmDelete = () => {
    Alert.alert(t('settings.delete_account'), t('settings.delete_confirm_user'), [
      { text: t('settings.cancel'), style: 'cancel' },
      { text: t('settings.confirm'), style: 'destructive', onPress: () => {} },
    ]);
  };

  if (showTutorial) {
    return (
      <OnboardingNavigator
        onDone={() => setShowTutorial(false)}
        tutorialMode
        onTutorialClose={() => setShowTutorial(false)}
      />
    );
  }

  if (legalScreen) {
    return <LegalScreen type={legalScreen} onBack={() => setLegalScreen(null)} />;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* CUENTA */}
        <Text style={[styles.section, { color: theme.textSecondary }]}>{t('settings.account')}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              {firebaseUser?.displayName ?? '—'}
            </Text>
            <Text style={[styles.value, { color: theme.textSecondary }]}>
              {firebaseUser?.email ?? '—'}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={styles.row} onPress={confirmSignOut}>
            <Text style={[styles.label, { color: '#EF4444' }]}>{t('settings.sign_out')}</Text>
          </TouchableOpacity>
          <View style={[styles.sep, { backgroundColor: theme.background }]} />
          <TouchableOpacity style={styles.row} onPress={confirmDelete}>
            <Text style={[styles.label, { color: '#EF4444' }]}>{t('settings.delete_account')}</Text>
          </TouchableOpacity>
        </View>

        {/* GENERAL */}
        <Text style={[styles.section, { color: theme.textSecondary }]}>{t('settings.general')}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={styles.row} onPress={() => setShowTheme(true)}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.change_theme')}</Text>
            <Text style={[styles.value, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.sep, { backgroundColor: theme.background }]} />
          <TouchableOpacity style={styles.row} onPress={() => setShowLang(true)}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.change_language')}</Text>
            <Text style={[styles.value, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* NOTIFICACIONES — solo en móvil */}
        {Platform.OS !== 'web' && (
          <>
            <Text style={[styles.section, { color: theme.textSecondary }]}>{t('settings.notifications')}</Text>
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.enable_reminders')}</Text>
                <Text style={[styles.value, { color: theme.textSecondary }]}>›</Text>
              </View>
            </View>
          </>
        )}

        {/* LEGAL */}
        <Text style={[styles.section, { color: theme.textSecondary }]}>{t('settings.legal')}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={styles.row} onPress={() => setLegalScreen('terms')}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.terms')}</Text>
            <Text style={[styles.value, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.sep, { backgroundColor: theme.background }]} />
          <TouchableOpacity style={styles.row} onPress={() => setLegalScreen('privacy')}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.privacy')}</Text>
            <Text style={[styles.value, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.sep, { backgroundColor: theme.background }]} />
          <TouchableOpacity style={styles.row} onPress={() => setLegalScreen('disclaimer')}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.disclaimer')}</Text>
            <Text style={[styles.value, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ACERCA DE */}
        <Text style={[styles.section, { color: theme.textSecondary }]}>{t('settings.about')}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.version')}</Text>
            <Text style={[styles.value, { color: theme.textSecondary }]}>1.0.0</Text>
          </View>
          <View style={[styles.sep, { backgroundColor: theme.background }]} />
          <TouchableOpacity style={styles.row} onPress={() => setShowTutorial(true)}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.tutorial')}</Text>
            <Text style={[styles.value, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal temas */}
      <Modal visible={showTheme} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{t('settings.change_theme')}</Text>
            {(Object.keys(themes) as ThemeName[]).map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.themeRow, themeName === key && { borderColor: themes[key].accent, borderWidth: 2 }]}
                onPress={() => { setTheme(key); setShowTheme(false); }}
              >
                <View style={[styles.swatch, { backgroundColor: themes[key].background, borderColor: themes[key].accent }]} />
                <View>
                  <Text style={[styles.themeName, { color: theme.textPrimary }]}>{themes[key].label}</Text>
                  <View style={styles.swatchRow}>
                    {[themes[key].accent, themes[key].accentSecondary, themes[key].notification].map((c, i) => (
                      <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.closeBtn, { borderColor: theme.textSecondary }]} onPress={() => setShowTheme(false)}>
              <Text style={{ color: theme.textSecondary }}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal idioma */}
      <Modal visible={showLang} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{t('settings.change_language')}</Text>
            {(['es', 'en'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.langRow, i18n.language === lang && { borderColor: theme.accent, borderWidth: 2 }]}
                onPress={() => { setLanguage(lang); setShowLang(false); }}
              >
                <Text style={[styles.langText, { color: theme.textPrimary }]}>
                  {lang === 'es' ? '🇲🇽 Español' : '🇺🇸 English'}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.closeBtn, { borderColor: theme.textSecondary }]} onPress={() => setShowLang(false)}>
              <Text style={{ color: theme.textSecondary }}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 8 },
  section: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginTop: 12, marginBottom: 4, textTransform: 'uppercase' },
  card: { borderRadius: 14, paddingVertical: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  label: { fontSize: 16 },
  value: { fontSize: 14 },
  sep: { height: 1, marginHorizontal: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: { width: '100%', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', marginBottom: 8 },
  swatch: { width: 44, height: 44, borderRadius: 10, borderWidth: 2 },
  swatchRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  themeName: { fontSize: 16, fontWeight: '600' },
  closeBtn: { borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, marginTop: 8 },
  langRow: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', marginBottom: 8 },
  langText: { fontSize: 17 },
});
