import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { signInWithGoogle } from '../../auth/googleSignIn';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export default function CoachLoginScreen({ onBack, onSuccess }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { setRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [pendingUser, setPendingUser] = useState<any>(null);


  const handlePostAuth = async (user: any) => {
    setLoading(true);
    try {
      const coachRef = doc(db, 'coaches', user.uid);
      const snap = await getDoc(coachRef);
      if (!snap.exists()) {
        setPendingUser(user);
        setShowNameModal(true);
      } else {
        setRole('coach');
        onSuccess();
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result?.user) {
        await handlePostAuth(result.user);
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
      setLoading(false);
    }
  };

  const handleConfirmName = async () => {
    if (!displayName.trim() || !pendingUser) return;
    try {
      await setDoc(doc(db, 'coaches', pendingUser.uid), {
        displayName: displayName.trim(),
        email: pendingUser.email,
        plan: 'starter',
        subscriptionStatus: 'expired',
        subscriptionExpiry: null,
        createdAt: serverTimestamp(),
      });
      setShowNameModal(false);
      setRole('coach');
      onSuccess();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={[styles.backText, { color: theme.accent }]}>← {t('onboarding.back')}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {t('auth.coach_login_title')}
        </Text>

        <TouchableOpacity
          style={[styles.googleBtn, { backgroundColor: theme.surface, borderColor: theme.textSecondary }]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={theme.accent} />
            : <Text style={[styles.googleText, { color: theme.textPrimary }]}>
                {t('auth.google_signin')}
              </Text>
          }
        </TouchableOpacity>

      </View>

      <Modal visible={showNameModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {t('auth.display_name_title')}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.accent, color: theme.textPrimary, backgroundColor: theme.background }]}
              value={displayName}
              onChangeText={(v) => setDisplayName(v.slice(0, 40))}
              placeholder={t('auth.display_name_placeholder')}
              placeholderTextColor={theme.textSecondary}
              maxLength={40}
              autoFocus
            />
            <Text style={[styles.charCount, { color: theme.textSecondary }]}>
              {displayName.length}/40
            </Text>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: displayName.trim() ? theme.accent : theme.textSecondary }]}
              onPress={handleConfirmName}
              disabled={!displayName.trim()}
            >
              <Text style={styles.confirmText}>{t('auth.display_name_confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { paddingHorizontal: 24, paddingTop: 16 },
  backText: { fontSize: 16 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 24, textAlign: 'center' },
  googleBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1,
  },
  googleText: { fontSize: 17, fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: { width: '100%', borderRadius: 20, padding: 28 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1.5, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 4 },
  charCount: { fontSize: 12, textAlign: 'right', marginBottom: 20 },
  confirmBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
