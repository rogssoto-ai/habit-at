import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from './es';
import en from './en';

const LANGUAGE_KEY = '@habit_at_language';

export async function initI18n() {
  let savedLang: string | null = null;
  try {
    savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {}

  const deviceLang = getLocales()[0]?.languageCode ?? 'es';
  const lng = savedLang ?? (deviceLang.startsWith('es') ? 'es' : 'en');

  await i18n.use(initReactI18next).init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  });
}

export async function setLanguage(lang: 'es' | 'en') {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

export default i18n;
