
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "placeholder-api-key",
  authDomain: "placeholder-auth-domain",
  projectId: "placeholder-project-id",
  storageBucket: "placeholder-storage-bucket",
  messagingSenderId: "placeholder-messaging-sender-id",
  appId: "placeholder-app-id",
  firestoreDatabaseId: "(default)"
};

/**
 * Initializes the Firebase app or retrieves the existing one.
 */
export function getFirebaseApp(): FirebaseApp {
  const existingApp = getApps().at(0);
  return existingApp || initializeApp(firebaseConfig);
}

/**
 * Gets the Firebase Auth instance for the given app.
 */
export function getFirebaseAuth(app: FirebaseApp): Auth {
  return getAuth(app);
}

/**
 * Gets the Firebase Firestore instance for the given app.
 */
export function getFirebaseFirestore(app: FirebaseApp): Firestore {
  return getFirestore(app);
}
