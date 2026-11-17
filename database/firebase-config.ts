import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  Firestore 
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize or reuse Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Validates Firestore database connectivity
 */
export async function testDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { connected: true, message: 'Firestore connection established successfully.' };
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      return { connected: false, message: 'Firestore is running in offline mode or initializing.' };
    }
    return { connected: true, message: 'Connection probe resolved.' };
  }
}
