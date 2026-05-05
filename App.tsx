import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { OnboardingProvider, useOnboarding } from './src/store/OnboardingContext';
import { AuthProvider, useAuth } from './src/store/AuthContext';
import { initI18n } from './src/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';

import OnboardingNavigator from './src/screens/onboarding/OnboardingNavigator';
import ProfileSelectScreen from './src/screens/auth/ProfileSelectScreen';
import CoachLoginScreen from './src/screens/auth/CoachLoginScreen';
import UserLoginScreen from './src/screens/auth/UserLoginScreen';
import CoachNavigator from './src/screens/coach/CoachNavigator';
import UserNavigator from './src/screens/user/UserNavigator';

type AuthScreen = 'select' | 'coach_login' | 'user_login';

function AppContent() {
  const { theme } = useTheme();
  const { onboardingDone, loading: onboardingLoading } = useOnboarding();
  const { firebaseUser, role, loading: authLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('select');
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  const isLoading = !i18nReady || onboardingLoading || authLoading;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  // ── Lógica de arranque (Sección 8) ──────────────────────────

  // 1. ¿Ya se mostró el onboarding?
  if (!onboardingDone) {
    return (
      <OnboardingNavigator
        onDone={() => {}} // OnboardingContext maneja el estado
      />
    );
  }

  // 2. ¿El usuario está logueado?
  if (!firebaseUser) {
    if (authScreen === 'coach_login') {
      return (
        <CoachLoginScreen
          onBack={() => setAuthScreen('select')}
          onSuccess={() => {}}
        />
      );
    }
    if (authScreen === 'user_login') {
      return (
        <UserLoginScreen
          onBack={() => setAuthScreen('select')}
          onSuccess={() => {}}
        />
      );
    }
    return (
      <ProfileSelectScreen
        onSelectCoach={() => setAuthScreen('coach_login')}
        onSelectUser={() => setAuthScreen('user_login')}
      />
    );
  }

  // 3. ¿Logueado como Coach?
  if (role === 'coach') {
    return <CoachNavigator />;
  }

  // 3. ¿Logueado como Usuario?
  if (role === 'user') {
    return <UserNavigator />;
  }

  // Sin rol definido aún — mostrar selección
  return (
    <ProfileSelectScreen
      onSelectCoach={() => setAuthScreen('coach_login')}
      onSelectUser={() => setAuthScreen('user_login')}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <OnboardingProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </OnboardingProvider>
        </ThemeProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
