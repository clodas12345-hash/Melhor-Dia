import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Helper to ensure user is authenticated anonymously
export async function ensureAuth() {
  if (auth.currentUser) return auth.currentUser;
  
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      }
    });
    
    signInAnonymously(auth).catch((error) => {
      unsubscribe();
      console.warn("Firebase Anonymous Auth restricted or disabled. Falling back to default user.", error);
      resolve(null); // Resolve with null to allow fallback in App.tsx
    });
  });
}
