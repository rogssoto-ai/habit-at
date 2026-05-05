import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../store/AuthContext';
import {
  collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface Habit {
  id: string;
  name: string;
  coachNote?: string;
  frequency: 'daily' | 'specific_days' | 'times_per_week';
  specificDays?: string[];
  timesPerWeek?: number;
  isActive: boolean;
}

interface Props {
  invitation: any;
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function UserHabitsTab({ invitation }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { firebaseUser } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'specific_days' | 'times_per_week'>('daily');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState('3');

  const userId = invitation.userId;

  useEffect(() => {
    if (!firebaseUser || !userId) { setLoading(false); return; }
    const ref = collection(
      db, 'coaches', firebaseUser.uid, 'invitations', invitation.id, 'users', userId, 'habits'
    );
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() })) as Habit[];
      setHabits(data.filter(h => h.isActive));
      setLoading(false);
    });
    return unsub;
  }, [firebaseUser, userId]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !firebaseUser || !userId) return;
    if (habits.length >= 20) {
      Alert.alert(t('user_detail.habits.max_reached'));
      return;
    }
    const ref = collection(
      db, 'coaches', firebaseUser.uid, 'invitations', invitation.id, 'users', userId, 'habits'
    );
    await addDoc(ref, {
      name: name.trim(),
      coachNote: note.trim(),
      frequency,
      specificDays: frequency !== 'daily' ? selectedDays : [],
      timesPerWeek: frequency === 'times_per_week' ? parseInt(timesPerWeek) : null,
      startDate: null,
      endDate: null,
      order: habits.length,
      groupId: null,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    setShowForm(false);
    setName(''); setNote(''); setFrequency('daily'); setSelectedDays([]);
  };

  if (!userId) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          Usuario pendiente de registro
        </Text>
      </View>
    );
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={theme.accent} /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {habits.length >= 20 && (
          <Text style={[styles.maxNote, { color: theme.notification }]}>
            {t('user_detail.habits.max_reached')}
          </Text>
        )}
        {habits.map((habit) => (
          <View key={habit.id} style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.habitName, { color: theme.textPrimary }]}>{habit.name}</Text>
            {habit.coachNote ? (
              <Text style={[styles.habitNote, { color: theme.textSecondary }]}>{habit.coachNote}</Text>
            ) : null}
            <Text style={[styles.habitFreq, { color: theme.accent }]}>
              {habit.frequency === 'daily' ? t('user_detail.habits.daily')
                : habit.frequency === 'specific_days' ? t('user_detail.habits.specific_days')
                : t('user_detail.habits.times_per_week')}
            </Text>
          </View>
        ))}
      </ScrollView>

      {habits.length < 20 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.accent }]}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.addText}>+ {t('user_detail.habits.add')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.overlay}>
          <ScrollView style={[styles.modal, { backgroundColor: theme.surface }]} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {t('user_detail.habits.add')}
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              {t('user_detail.habits.name')}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.accent, color: theme.textPrimary, backgroundColor: theme.background }]}
              value={name}
              onChangeText={setName}
              placeholder={t('user_detail.habits.name')}
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              {t('user_detail.habits.coach_note')}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.accent, color: theme.textPrimary, backgroundColor: theme.background }]}
              value={note}
              onChangeText={setNote}
              placeholder={t('user_detail.habits.coach_note')}
              placeholderTextColor={theme.textSecondary}
              multiline
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              {t('user_detail.habits.frequency')}
            </Text>
            {(['daily', 'specific_days', 'times_per_week'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.freqBtn, { borderColor: frequency === f ? theme.accent : theme.textSecondary }]}
                onPress={() => setFrequency(f)}
              >
                <Text style={{ color: frequency === f ? theme.accent : theme.textSecondary }}>
                  {t(`user_detail.habits.${f}`)}
                </Text>
              </TouchableOpacity>
            ))}

            {frequency !== 'daily' && (
              <View style={styles.daysRow}>
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayBtn, { backgroundColor: selectedDays.includes(day) ? theme.accent : theme.surface, borderColor: theme.accent }]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={{ color: selectedDays.includes(day) ? '#fff' : theme.accent, fontSize: 13 }}>
                      {t(`user_detail.habits.days.${day}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {frequency === 'times_per_week' && (
              <TextInput
                style={[styles.input, { borderColor: theme.accent, color: theme.textPrimary, backgroundColor: theme.background }]}
                value={timesPerWeek}
                onChangeText={setTimesPerWeek}
                keyboardType="number-pad"
                placeholder="3"
                maxLength={1}
              />
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: theme.textSecondary }]} onPress={() => setShowForm(false)}>
                <Text style={{ color: theme.textSecondary }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: name.trim() ? theme.accent : theme.textSecondary }]}
                onPress={handleSave}
                disabled={!name.trim()}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>{t('user_detail.habits.save')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, gap: 10, paddingBottom: 80 },
  maxNote: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
  empty: { fontSize: 16 },
  card: { borderRadius: 14, padding: 16 },
  habitName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  habitNote: { fontSize: 13, marginBottom: 4 },
  habitFreq: { fontSize: 12, fontWeight: '500' },
  footer: { padding: 16 },
  addBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  addText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 4 },
  freqBtn: { borderWidth: 1.5, borderRadius: 10, padding: 12, marginBottom: 8 },
  daysRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  dayBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalBtn: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1 },
});
