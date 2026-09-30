import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Helper to ensure user is authenticated anonymously with resilient timeout
export async function ensureAuth(): Promise<any> {
  if (auth.currentUser) return auth.currentUser;
  
  const authPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      }
    });
    
    signInAnonymously(auth).catch((error) => {
      unsubscribe();
      console.info("Anonymous Auth offline or unavailable, continuing with local storage.", error?.code || error);
      resolve(null);
    });
  });

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 2000);
  });

  return Promise.race([authPromise, timeoutPromise]);
}
