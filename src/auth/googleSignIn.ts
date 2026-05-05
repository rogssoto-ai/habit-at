import { Platform } from 'react-native';
import {
  GoogleAuthProvider, signInWithPopup,
  signInWithCredential, UserCredential
} from 'firebase/auth';
import { auth } from '../firebase/config';

if (Platform.OS !== 'web') {
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
}

// En web: abre popup de Google y retorna el resultado de inmediato
// En nativo: usa el SDK nativo
export async function signInWithGoogle(): Promise<UserCredential | null> {
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken ?? response.idToken;
  if (!idToken) throw new Error('No se obtuvo el token de Google');
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

// Ya no se usa con popup — se mantiene por compatibilidad con llamadas existentes
export async function getGoogleRedirectResult(): Promise<UserCredential | null> {
  return null;
}
