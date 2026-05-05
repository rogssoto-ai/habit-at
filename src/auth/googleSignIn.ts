import { Platform } from 'react-native';
import {
  GoogleAuthProvider, signInWithRedirect,
  signInWithCredential, UserCredential
} from 'firebase/auth';
import { auth } from '../firebase/config';

if (Platform.OS !== 'web') {
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
}

// En web: redirige a Google. El rol debe guardarse en AsyncStorage ANTES de llamar
// esto para que onAuthStateChanged lo encuentre al volver.
// En nativo: usa el SDK nativo y retorna UserCredential de inmediato.
export async function signInWithGoogle(): Promise<UserCredential | null> {
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    return null;
  }
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken ?? response.idToken;
  if (!idToken) throw new Error('No se obtuvo el token de Google');
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export async function getGoogleRedirectResult(): Promise<UserCredential | null> {
  return null;
}
