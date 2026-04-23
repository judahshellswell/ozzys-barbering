import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Provide a placeholder config so the module can be imported server-side
// without throwing. Actual API calls only happen in client components.
const safeConfig = {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey || 'placeholder-key-for-build',
  projectId: firebaseConfig.projectId || 'placeholder-project',
  appId: firebaseConfig.appId || 'placeholder-app-id',
};

const app = getApps().length ? getApp() : initializeApp(safeConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
