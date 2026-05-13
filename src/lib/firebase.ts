import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

let app: ReturnType<typeof initializeApp>;
if (!hasConfig) {
  app = {} as ReturnType<typeof initializeApp>;
} else if (getApps().length > 0) {
  app = getApps()[0];
} else {
  app = initializeApp(firebaseConfig);
}

export const auth = hasConfig ? getAuth(app) : null;
export const googleProvider = hasConfig ? new GoogleAuthProvider() : null;
export const isFirebaseConfigured = hasConfig;

export default app;