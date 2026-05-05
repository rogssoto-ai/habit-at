import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { calendarColors } from '../../../theme/themes';

interface Props {
  invitation: any;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function UserMonitorTab({ invitation }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames: Record<string, string[]> = {
    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  };
  const lang = t('common.ok') === 'OK' ? 'en' : 'es';
  const monthName = monthNames[lang]?.[month] ?? month;

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

  // Placeholder — sin datos reales aún, todo gris
  const getColor = (_day: number) => calendarColors.none;

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.scroll}>

      {/* Rachas */}
      <View style={styles.streaksRow}>
        <View style={[styles.streakCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={[styles.streakNum, { color: theme.textPrimary }]}>0</Text>
          <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>
            {t('user_detail.monitor.streak_followup')}
          </Text>
          <Text style={[styles.streakDays, { color: theme.textSecondary }]}>
            {t('user_detail.monitor.days')}
          </Text>
        </View>
        <View style={[styles.streakCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.streakEmoji}>⭐</Text>
          <Text style={[styles.streakNum, { color: theme.textPrimary }]}>0</Text>
          <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>
            {t('user_detail.monitor.streak_completion')}
          </Text>
          <Text style={[styles.streakDays, { color: theme.textSecondary }]}>
            {t('user_detail.monitor.days')}
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
            {monthName} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Text style={[styles.navArrow, { color: theme.accent }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {/* Espacios vacíos para alinear el primer día */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const color = getColor(day);
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayCell, { backgroundColor: color },
                  isToday(day) && { borderWidth: 2, borderColor: theme.accent },
                  selectedDay === day && { opacity: 0.7 }
                ]}
                onPress={() => setSelectedDay(day === selectedDay ? null : day)}
              >
                <Text style={[styles.dayNum, { color: '#fff' }]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Detalle del día seleccionado */}
      {selectedDay && (
        <View style={[styles.dayDetail, { backgroundColor: theme.surface }]}>
          <Text style={[styles.dayDetailTitle, { color: theme.textPrimary }]}>
            {selectedDay} {monthName}
          </Text>
          <Text style={[styles.noData, { color: theme.textSecondary }]}>
            {t('user_detail.monitor.no_data')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  streaksRow: { flexDirection: 'row', gap: 12 },
  streakCard: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', gap: 2 },
  streakEmoji: { fontSize: 24 },
  streakNum: { fontSize: 28, fontWeight: '700' },
  streakLabel: { fontSize: 11, textAlign: 'center' },
  streakDays: { fontSize: 11 },
  calCard: { borderRadius: 16, padding: 16 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calMonth: { fontSize: 17, fontWeight: '600' },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 24, fontWeight: '300' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dayCell: { width: '13%', aspectRatio: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontSize: 12, fontWeight: '500' },
  dayDetail: { borderRadius: 14, padding: 20 },
  dayDetailTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  noData: { fontSize: 14 },
});
