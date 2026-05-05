import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

interface Habit {
  id: string;
  name: string;
  coachNote?: string;
  frequency: string;
  completedToday?: boolean;
  completedAt?: any;
}

export default function UserHabitsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const total = habits.length;
  const progress = total > 0 ? completedCount / total : 0;

  const toggleHabit = (id: string) => {
    setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Barra de progreso */}
      <View style={[styles.progressContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            {t('user.habits.progress_bar', { count: completedCount, total })}
          </Text>
          <Text style={[styles.progressPct, { color: theme.accent }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.background }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.accentSecondary, width: `${progress * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {habits.length === 0 && !loading && (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            {t('user.habits.no_habits_today')}
          </Text>
        )}

        {habits.map((habit) => {
          const done = !!completed[habit.id];
          return (
            <TouchableOpacity
              key={habit.id}
              style={[styles.habitCard, { backgroundColor: theme.surface, borderLeftColor: done ? theme.accentSecondary : theme.surface, borderLeftWidth: 4 }]}
              onPress={() => toggleHabit(habit.id)}
              activeOpacity={0.8}
            >
              <View style={styles.habitContent}>
                <Text style={[styles.habitName, { color: theme.textPrimary, textDecorationLine: done ? 'line-through' : 'none' }]}>
                  {habit.name}
                </Text>
                {habit.coachNote ? (
                  <Text style={[styles.habitNote, { color: theme.textSecondary }]}>{habit.coachNote}</Text>
                ) : null}
              </View>
              <View style={[styles.check, { borderColor: done ? theme.accentSecondary : theme.textSecondary, backgroundColor: done ? theme.accentSecondary : 'transparent' }]}>
                {done && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Nota del día */}
        <View style={[styles.noteContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.noteLabel, { color: theme.textSecondary }]}>
            📝 Nota del día
          </Text>
          <TextInput
            style={[styles.noteInput, { color: theme.textPrimary }]}
            value={note}
            onChangeText={(v) => setNote(v.slice(0, 1000))}
            placeholder={t('user.habits.day_note_placeholder')}
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={1000}
          />
          <Text style={[styles.charCount, { color: theme.textSecondary }]}>
            {note.length}/1000
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressContainer: { padding: 16, marginHorizontal: 16, marginTop: 12, borderRadius: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14 },
  progressPct: { fontSize: 14, fontWeight: '700' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  scroll: { padding: 16, gap: 10, paddingBottom: 40 },
  empty: { textAlign: 'center', fontSize: 16, marginTop: 40 },
  habitCard: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  habitContent: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  habitNote: { fontSize: 13 },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#fff', fontSize: 16, fontWeight: '700' },
  noteContainer: { borderRadius: 14, padding: 16, marginTop: 8 },
  noteLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  noteInput: { fontSize: 15, lineHeight: 22, minHeight: 80 },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 4 },
});
