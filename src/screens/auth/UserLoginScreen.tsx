import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import {
  collection, doc, getDoc, getDocs, query,
  where, setDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithGoogle } from '../../auth/googleSignIn';

const ROLE_KEY = '@habit_at_role';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export default function UserLoginScreen({ onBack, onSuccess }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { setRole, refreshUserData } = useAuth();
  const [key, setKey] = useState('');
  const [keyStatus, setKeyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validatingKey, setValidatingKey] = useState(false);
  const [returningUser, setReturningUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatKey = (text: string) => {
    const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length <= 4) return clean;
    return clean.slice(0, 4) + '-' + clean.slice(4, 8);
  };

  const handleKeyChange = (text: string) => {
    setKey(formatKey(text));
    setKeyStatus('idle');
  };

  const validateKey = async () => {
    if (key.length !== 9) { setKeyStatus('invalid'); return; }
    setValidatingKey(true);
    try {
      const snap = await getDoc(doc(db, 'keys', key));
      setKeyStatus(snap.exists() && snap.data().status === 'pending' ? 'valid' : 'invalid');
    } catch {
      setKeyStatus('invalid');
    } finally {
      setValidatingKey(false);
    }
  };

  const canContinue = keyStatus === 'valid' || returningUser;

  const linkNewUser = async (user: any, invitationCode: string) => {
    const keySnap = await getDoc(doc(db, 'keys', invitationCode));
    if (!keySnap.exists() || keySnap.data().status !== 'pending') {
      throw new Error(t('auth.key_already_used'));
    }
    const coachId: string = keySnap.data().coachId;

    const invSnap = await getDocs(
      query(collection(db, 'coaches', coachId, 'invitations'), where('code', '==', invitationCode))
    );
    if (invSnap.empty) throw new Error(t('auth.invitation_not_found'));
    const invitationId = invSnap.docs[0].id;

    await updateDoc(doc(db, 'keys', invitationCode), {
      status: 'active',
      userId: user.uid,
    });
    await updateDoc(doc(db, 'coaches', coachId, 'invitations', invitationId), {
      status: 'active',
      activatedAt: serverTimestamp(),
      googleUid: user.uid,
      googleEmail: user.email,
    });
    await setDoc(doc(db, 'coaches', coachId, 'users', user.uid), {
      googleEmail: user.email,
      googleUid: user.uid,
      coachId,
      invitationId,
      streak_followup: 0,
      streak_completion: 0,
      createdAt: serverTimestamp(),
    });
    // Top-level lookup doc so AuthContext can find this user by UID
    await setDoc(doc(db, 'users', user.uid), { coachId, invitationId });
  };

  const handleGoogleSignIn = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result?.user) { setLoading(false); return; }
      const user = result.user;

      if (returningUser) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) throw new Error(t('auth.returning_not_found'));
      } else {
        await linkNewUser(user, key);
      }

      await AsyncStorage.setItem(ROLE_KEY, 'user');
      await refreshUserData(user.uid);
      setRole('user');
    } catch (e: any) {
      if ((e as any).code !== 'auth/popup-closed-by-user') {
        Alert.alert(t('common.error'), e.message);
      }
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={[styles.backText, { color: theme.accent }]}>← {t('onboarding.back')}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {t('auth.user_login_title')}
        </Text>

        {!returningUser && (
          <>
            <View style={styles.keyRow}>
              <TextInput
                style={[styles.keyInput, { borderColor: theme.accent, color: theme.textPrimary, backgroundColor: theme.surface }]}
                value={key}
                onChangeText={handleKeyChange}
                placeholder={t('auth.key_placeholder')}
                placeholderTextColor={theme.textSecondary}
                maxLength={9}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.validateBtn, { backgroundColor: theme.accent }]}
                onPress={validateKey}
                disabled={validatingKey || key.length !== 9}
              >
                {validatingKey
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.validateText}>{t('auth.validate_key')}</Text>
                }
              </TouchableOpacity>
            </View>

            {keyStatus === 'valid' && (
              <Text style={[styles.keyMsg, { color: '#16A34A' }]}>{t('auth.key_valid')}</Text>
            )}
            {keyStatus === 'invalid' && (
              <Text style={[styles.keyMsg, { color: '#EF4444' }]}>{t('auth.key_invalid')}</Text>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => { setReturningUser(!returningUser); setKeyStatus('idle'); setKey(''); }}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox, { borderColor: theme.accent },
            returningUser && { backgroundColor: theme.accent }
          ]}>
            {returningUser && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={[styles.checkLabel, { color: theme.textSecondary }]}>
            {t('auth.returning_user')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleBtn, {
            backgroundColor: canContinue ? theme.surface : theme.background,
            borderColor: canContinue ? theme.accent : theme.textSecondary,
            opacity: canContinue ? 1 : 0.5,
          }]}
          onPress={handleGoogleSignIn}
          disabled={!canContinue || loading}
        >
          {loading
            ? <ActivityIndicator color={theme.accent} />
            : <Text style={[styles.googleText, { color: theme.textPrimary }]}>
                {t('auth.google_signin')}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { paddingHorizontal: 24, paddingTop: 16 },
  backText: { fontSize: 16 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  keyRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  keyInput: {
    flex: 1, borderWidth: 1.5, borderRadius: 10,
    padding: 14, fontSize: 18, letterSpacing: 2, textAlign: 'center',
  },
  validateBtn: { borderRadius: 10, padding: 14, alignItems: 'center' },
  validateText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  keyMsg: { fontSize: 14, marginTop: -4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 5, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkLabel: { fontSize: 14, flex: 1 },
  googleBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1.5, marginTop: 8,
  },
  googleText: { fontSize: 17, fontWeight: '500' },
});
