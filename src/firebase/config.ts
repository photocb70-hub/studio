import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

export function getFirebaseApp(): FirebaseApp {
  const existingApp = getApps().at(0);
  return existingApp || initializeApp(firebaseConfig);
}

export function getFirebaseAuth(app: FirebaseApp): Auth {
  return getAuth(app);
}

export function getFirebaseFirestore(app: FirebaseApp): Firestore {
  return getFirestore(app);
}
