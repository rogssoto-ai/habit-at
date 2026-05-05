import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { calendarColors } from '../../theme/themes';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function UserProgressScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames: string[] = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    const now = new Date();
    if (year === now.getFullYear() && month === now.getMonth()) return;
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t('user.progress.title')}</Text>

        {/* Rachas */}
        <View style={styles.streaksRow}>
          <View style={[styles.streakCard, { backgroundColor: theme.surface }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakNum, { color: theme.textPrimary }]}>0</Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>
              {t('user_detail.monitor.streak_followup')}
            </Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: theme.surface }]}>
            <Text style={styles.streakEmoji}>⭐</Text>
            <Text style={[styles.streakNum, { color: theme.textPrimary }]}>0</Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>
              {t('user_detail.monitor.streak_completion')}
            </Text>
          </View>
        </View>

        {/* Calendario */}
        <View style={[styles.calCard, { backgroundColor: theme.surface }]}>
          <View style={styles.calHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Text style={[styles.navArrow, { color: theme.accent }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.calMonth, { color: theme.textPrimary }]}>
              {monthNames[month]} {year}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Text style={[styles.navArrow, { color: theme.accent }]}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`e-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    { backgroundColor: calendarColors.none },
                    isToday(day) && { borderWidth: 2, borderColor: theme.accent },
                  ]}
                  onPress={() => setSelectedDay(day === selectedDay ? null : day)}
                >
                  <Text style={[styles.dayNum, { color: '#fff' }]}>{day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedDay && (
          <View style={[styles.dayDetail, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dayDetailTitle, { color: theme.textPrimary }]}>
              {selectedDay} {monthNames[month]}
            </Text>
            <Text style={[styles.noData, { color: theme.textSecondary }]}>
              {t('user_detail.monitor.no_data')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700' },
  streaksRow: { flexDirection: 'row', gap: 12 },
  streakCard: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', gap: 4 },
  streakEmoji: { fontSize: 24 },
  streakNum: { fontSize: 28, fontWeight: '700' },
  streakLabel: { fontSize: 11, textAlign: 'center' },
  calCard: { borderRadius: 16, padding: 16 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calMonth: { fontSize: 17, fontWeight: '600' },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dayCell: { width: '13%', aspectRatio: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontSize: 12, fontWeight: '500' },
  dayDetail: { borderRadius: 14, padding: 20 },
  dayDetailTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  noData: { fontSize: 14 },
});
