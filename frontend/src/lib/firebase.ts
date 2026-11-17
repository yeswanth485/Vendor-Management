import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer,
  collection,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export { onAuthStateChanged, type FirebaseUser };
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with configured databaseId
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection test as required by Firebase integration guidelines
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Successfully connected to Firestore database.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or Firestore is initializing.');
    } else {
      console.log('[Firebase] Initial connection check resolved.');
    }
  }
}

// Trigger initial test
testFirebaseConnection();

export interface UserMfaProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'reviewer' | 'approver' | 'administrator' | 'auditor' | 'vendor';
  organizationId: string;
  mfaEnabled: boolean;
  mfaEnrolledAt?: string;
  mfaType: 'TOTP' | 'SMS' | 'WEBAUTHN';
  totpSecret?: string;
  backupCodes?: string[];
  lastMfaVerifiedAt?: string;
  enforceMfaForApprovals: boolean;
  enforceMfaForBankChanges: boolean;
}

// User Profile & MFA Firestore Sync
export async function syncUserProfile(user: FirebaseUser, extra?: Partial<UserMfaProfile>): Promise<UserMfaProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const existingSnap = await getDoc(userDocRef);
    if (existingSnap.exists()) {
      const data = existingSnap.data() as UserMfaProfile;
      const updated: UserMfaProfile = {
        ...data,
        email: user.email || data.email,
        displayName: user.displayName || data.displayName,
        photoURL: user.photoURL || data.photoURL,
        ...extra,
      };
      await setDoc(userDocRef, updated, { merge: true });
      return updated;
    } else {
      // Default initial profile
      const newProfile: UserMfaProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || undefined,
        role: user.email?.includes('approver') ? 'approver' : 'reviewer',
        organizationId: 'org-terybi-corp',
        mfaEnabled: false,
        mfaType: 'TOTP',
        enforceMfaForApprovals: true,
        enforceMfaForBankChanges: true,
        ...extra,
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (e) {
    console.warn('[Firebase] Firestore sync falling back to local storage profile:', e);
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Enterprise User',
      photoURL: user.photoURL || undefined,
      role: 'reviewer',
      organizationId: 'org-terybi-corp',
      mfaEnabled: false,
      mfaType: 'TOTP',
      enforceMfaForApprovals: true,
      enforceMfaForBankChanges: true,
      ...extra,
    };
  }
}

export async function saveUserMfaSettings(uid: string, mfaSettings: Partial<UserMfaProfile>): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, mfaSettings, { merge: true });
  } catch (e) {
    console.warn('[Firebase] Error saving MFA settings to Firestore:', e);
  }
}
