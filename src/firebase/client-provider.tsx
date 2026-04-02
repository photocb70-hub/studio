'use client';

import React, { useMemo, ReactNode } from 'react';
import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from './config';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, auth, db } = useMemo(() => {
    const app = getFirebaseApp();
    const auth = getFirebaseAuth(app);
    const db = getFirebaseFirestore(app);
    return { app, auth, db };
  }, []);

  return (
    <FirebaseProvider app={app} auth={auth} db={db}>
      {children}
    </FirebaseProvider>
  );
}
