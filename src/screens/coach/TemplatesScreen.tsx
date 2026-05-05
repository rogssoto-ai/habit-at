import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';

interface Template {
  id: string;
  name: string;
  habits: any[];
}

export default function TemplatesScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { firebaseUser } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!firebaseUser) { setLoading(false); return; }
    const ref = collection(db, 'coaches', firebaseUser.uid, 'templates');
    const unsub = onSnapshot(ref, (snap) => {
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Template[]);
      setLoading(false);
    });
    return unsub;
  }, [firebaseUser]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    if (!firebaseUser) return;
    await addDoc(collection(db, 'coaches', firebaseUser.uid, 'templates'), {
      name: newName.trim(),
      habits: [],
      createdAt: serverTimestamp(),
    });
    setNewName('');
    setShowNew(false);
  };

  const handleDelete = (t_: Template) => {
    Alert.alert(
      t('coach.templates.delete_confirm'),
      undefined,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.ok'), style: 'destructive',
          onPress: () => {
            deleteDoc(doc(db, 'coaches', firebaseUser!.uid, 'templates', t_.id));
          },
        },
      ]
    );
  };

  if (loading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.accent} />
    </View>;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t('coach.templates.title')}</Text>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: templates.length >= 10 ? theme.textSecondary : theme.accent }]}
          onPress={() => setShowNew(true)}
          disabled={templates.length >= 10}
        >
          <Text style={styles.newBtnText}>+ {t('coach.templates.new')}</Text>
        </TouchableOpacity>
      </View>

      {templates.length >= 10 && (
        <Text style={[styles.maxNote, { color: theme.notification }]}>
          {t('coach.templates.max_reached')}
        </Text>
      )}

      <FlatList
        data={templates}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tName, { color: theme.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.tCount, { color: theme.textSecondary }]}>
                {item.habits?.length === 1
                  ? t('coach.templates.habits_count', { count: 1 })
                  : t('coach.templates.habits_count_plural', { count: item.habits?.length ?? 0 })}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)}>
              <Text style={{ color: '#EF4444', fontSize: 20 }}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={showNew} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {t('coach.templates.new')}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.accent, color: theme.textPrimary, backgroundColor: theme.background }]}
              value={newName}
              onChangeText={(v) => setNewName(v.slice(0, 40))}
              placeholder={t('coach.templates.name_placeholder')}
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: theme.textSecondary }]} onPress={() => setShowNew(false)}>
                <Text style={{ color: theme.textSecondary }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.accent }]} onPress={handleCreate}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>{t('coach.templates.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  newBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  newBtnText: { color: '#fff', fontWeight: '600' },
  maxNote: { paddingHorizontal: 20, marginBottom: 8, fontSize: 13 },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
  card: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center' },
  tName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  tCount: { fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: { width: '100%', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1.5, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1 },
});
