import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import {
  collection, onSnapshot, addDoc, doc, setDoc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config';

const PLAN_LIMITS: Record<string, number> = {
  starter: 20, pro: 40, elite: 80,
};

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function InvitationsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { firebaseUser, coachData } = useAuth();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedMsg, setGeneratedMsg] = useState('');

  const plan = coachData?.plan ?? 'starter';
  const limit = PLAN_LIMITS[plan] ?? 20;
  const activeCount = invitations.filter(i => i.status === 'active').length;
  const available = limit - activeCount;

  useEffect(() => {
    if (!firebaseUser) { setLoading(false); return; }
    const ref = collection(db, 'coaches', firebaseUser.uid, 'invitations');
    const unsub = onSnapshot(ref, (snap) => {
      setInvitations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [firebaseUser]);

  const handleGenerate = async () => {
    if (!userName.trim()) return;
    if (!firebaseUser || !coachData) return;
    if (available <= 0) {
      Alert.alert(t('coach.invitations.upgrade_required'));
      return;
    }
    setGenerating(true);
    try {
      let code = generateCode();
      // Verificar unicidad en keys/
      let attempts = 0;
      while (attempts < 10) {
        const keysRef = collection(db, 'keys');
        const snap = await getDocs(keysRef);
        const exists = snap.docs.find(d => d.id === code);
        if (!exists) break;
        code = generateCode();
        attempts++;
      }

      await addDoc(collection(db, 'coaches', firebaseUser.uid, 'invitations'), {
        code,
        status: 'pending',
        coachDisplayName: coachData.displayName,
        userName: userName.trim(),
        createdAt: serverTimestamp(),
        activatedAt: null,
        templateIds: [],
      });

      await setDoc(doc(db, 'keys', code), {
        status: 'pending',
        coachId: firebaseUser.uid,
        userId: null,
      });

      const msg = t('coach.invitations.invite_message', {
        coach: coachData.displayName,
        code,
      });
      setGeneratedCode(code);
      setGeneratedMsg(msg);
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(generatedMsg);
    Alert.alert('', '✓ Copiado');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUserName('');
    setGeneratedCode('');
    setGeneratedMsg('');
  };

  if (loading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.accent} />
    </View>;
  }

  const pieData = [
    { label: t('coach.invitations.available'), value: available, color: theme.accentSecondary },
    { label: t('coach.invitations.used'), value: activeCount, color: theme.accent },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {t('coach.invitations.title')}
        </Text>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: theme.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: theme.accentSecondary }]}>{available}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {t('coach.invitations.available')}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.background }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: theme.accent }]}>{activeCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {t('coach.invitations.used')}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.background }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: theme.textPrimary }]}>{limit}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {t('coach.invitations.total')}
            </Text>
          </View>
        </View>

        {available <= 0 ? (
          <View style={[styles.upgradeCard, { backgroundColor: theme.notification + '20' }]}>
            <Text style={[styles.upgradeText, { color: theme.textPrimary }]}>
              {t('coach.invitations.upgrade_required')}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.generateBtn, { backgroundColor: theme.accent }]}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.generateText}>{t('coach.invitations.generate')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface }]}>
            {!generatedCode ? (
              <>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  {t('coach.invitations.generate')}
                </Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.accent, color: theme.textPrimary, backgroundColor: theme.background }]}
                  value={userName}
                  onChangeText={(v) => setUserName(v.slice(0, 40))}
                  placeholder={t('coach.invitations.user_name')}
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                  maxLength={40}
                />
                <View style={styles.modalBtns}>
                  <TouchableOpacity style={[styles.modalBtn, { borderColor: theme.textSecondary }]} onPress={handleCloseModal}>
                    <Text style={{ color: theme.textSecondary }}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: userName.trim() ? theme.accent : theme.textSecondary }]}
                    onPress={handleGenerate}
                    disabled={generating || !userName.trim()}
                  >
                    {generating
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={{ color: '#fff', fontWeight: '600' }}>{t('coach.invitations.generate_btn')}</Text>
                    }
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                  <Text style={[styles.copyText, { color: theme.accent }]}>
                    {t('coach.invitations.copy')}
                  </Text>
                </TouchableOpacity>
                <View style={[styles.msgBox, { backgroundColor: theme.background, borderColor: theme.accent }]}>
                  <Text style={[styles.msgText, { color: theme.textPrimary }]}>{generatedMsg}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.accent, flex: 0, marginTop: 16 }]}
                  onPress={handleCloseModal}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>{t('common.close')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  statsCard: {
    borderRadius: 16, padding: 20, flexDirection: 'row',
    justifyContent: 'space-around', alignItems: 'center',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statNum: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  divider: { width: 1, height: 40 },
  generateBtn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  generateText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  upgradeCard: { borderRadius: 14, padding: 16 },
  upgradeText: { fontSize: 15, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  input: { borderWidth: 1.5, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1 },
  copyBtn: { alignSelf: 'flex-end', marginBottom: 12 },
  copyText: { fontSize: 15, fontWeight: '600' },
  msgBox: { borderWidth: 1.5, borderRadius: 12, padding: 16 },
  msgText: { fontSize: 15, lineHeight: 22 },
});
