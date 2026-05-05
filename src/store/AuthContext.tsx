import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult, User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'coach' | 'user' | null;

interface AuthState {
  firebaseUser: User | null;
  role: UserRole;
  coachData: CoachData | null;
  userData: UserData | null;
  loading: boolean;
}

export interface CoachData {
  id: string;
  displayName: string;
  email: string;
  plan: 'starter' | 'pro' | 'elite';
  subscriptionStatus: 'active' | 'expired' | 'grace';
  subscriptionExpiry: any;
}

export interface UserData {
  id: string;
  googleEmail: string;
  googleUid: string;
  coachId: string;
  invitationId: string;
  streak_followup: number;
  streak_completion: number;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  setRole: (role: UserRole) => void;
  refreshCoachData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const ROLE_KEY = '@habit_at_role';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    role: null,
    coachData: null,
    userData: null,
    loading: true,
  });

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let mounted = true;

    const setupAuth = async (user: User | null) => {
      if (!mounted) return;
      if (user) {
        const savedRole = await AsyncStorage.getItem(ROLE_KEY) as UserRole;
        if (savedRole === 'coach') {
          const coachData = await fetchCoachData(user.uid);
          if (mounted) setState(s => ({ ...s, firebaseUser: user, role: 'coach', coachData, loading: false }));
        } else if (savedRole === 'user') {
          const userData = await fetchUserData(user.uid);
          if (mounted) setState(s => ({ ...s, firebaseUser: user, role: 'user', userData, loading: false }));
        } else {
          if (mounted) setState(s => ({ ...s, firebaseUser: user, role: null, loading: false }));
        }
      } else {
        if (mounted) setState(s => ({ ...s, firebaseUser: null, role: null, coachData: null, userData: null, loading: false }));
      }
    };

    // Procesar el redirect de Google primero (si existe) y luego montar el listener.
    // Sin esta llamada, signInWithRedirect nunca finaliza la autenticación.
    getRedirectResult(auth)
      .then(result => {
        console.log('[Auth] getRedirectResult:', result ? result.user.email : 'null');
      })
      .catch(err => {
        console.error('[Auth] getRedirectResult error:', err.code, err.message);
      })
      .finally(() => {
        if (!mounted) return;
        unsub = onAuthStateChanged(auth, setupAuth);
      });

    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  async function fetchCoachData(uid: string): Promise<CoachData | null> {
    try {
      const snap = await getDoc(doc(db, 'coaches', uid));
      if (snap.exists()) return { id: uid, ...snap.data() } as CoachData;
    } catch {}
    return null;
  }

  async function fetchUserData(uid: string): Promise<UserData | null> {
    // Users are nested, find by googleUid
    // For now return null, full lookup implemented in Firestore hooks
    return null;
  }

  async function refreshCoachData() {
    if (state.firebaseUser) {
      const coachData = await fetchCoachData(state.firebaseUser.uid);
      setState(s => ({ ...s, coachData }));
    }
  }

  async function signOut() {
    await AsyncStorage.removeItem(ROLE_KEY);
    await firebaseSignOut(auth);
    setState(s => ({ ...s, role: null, coachData: null, userData: null }));
  }

  function setRole(role: UserRole) {
    if (role) AsyncStorage.setItem(ROLE_KEY, role);
    setState(s => ({ ...s, role }));
  }

  return (
    <AuthContext.Provider value={{ ...state, signOut, setRole, refreshCoachData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
