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
