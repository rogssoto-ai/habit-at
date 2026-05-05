import { Platform } from 'react-native';
import {
  GoogleAuthProvider, signInWithRedirect, getRedirectResult,
  signInWithCredential, UserCredential
} from 'firebase/auth';
import { auth } from '../firebase/config';

if (Platform.OS !== 'web') {
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
}

// En web: redirige a Google (el navegador navega, no retorna UserCredential)
// En nativo: usa el SDK nativo y retorna UserCredential
export async function signInWithGoogle(): Promise<UserCredential | null> {
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    return null; // El navegador navega — esta línea nunca se ejecuta
  }
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken ?? response.idToken;
  if (!idToken) throw new Error('No se obtuvo el token de Google');
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

// Llama esto en useEffect al montar la pantalla de login (solo web)
// Firebase guarda el resultado del redirect hasta que lo consumes aquí
export async function getGoogleRedirectResult(): Promise<UserCredential | null> {
  if (Platform.OS !== 'web') return null;
  return getRedirectResult(auth);
}
