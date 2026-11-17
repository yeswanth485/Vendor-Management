import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { auth, googleProvider, syncUserProfile, UserMfaProfile } from '../../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { ShieldCheck, LogIn, LogOut, CheckCircle2, Lock, Shield, KeyRound, AlertTriangle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserMfaProfile;
  onProfileUpdated: (updated: UserMfaProfile) => void;
  onOpenMfaEnrollment: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdated,
  onOpenMfaEnrollment,
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = auth.currentUser;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const synced = await syncUserProfile(result.user);
      onProfileUpdated(synced);
      onClose();
    } catch (e: any) {
      console.error('[Firebase Auth] Sign in error:', e);
      setError(e.message || 'Google Sign-In failed or popup was closed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // Reset to default reviewer profile
      const defaultProfile: UserMfaProfile = {
        uid: 'usr-sarah-chen',
        email: 'sarah.chen@terybi.com',
        displayName: 'Sarah Chen',
        role: 'reviewer',
        organizationId: 'org-terybi-corp',
        mfaEnabled: false,
        mfaType: 'TOTP',
        enforceMfaForApprovals: true,
        enforceMfaForBankChanges: true,
      };
      onProfileUpdated(defaultProfile);
      onClose();
    } catch (e: any) {
      console.error('[Firebase Auth] Sign out error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Firebase Authentication & Security Identity"
      description="Securely identify procurement officers with Google Sign-In and Firestore profile sync."
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs text-slate-700">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded">
            {error}
          </div>
        )}

        {/* Current Active Identity */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                userProfile.displayName.charAt(0)
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{userProfile.displayName}</p>
              <p className="font-mono text-[11px] text-slate-500">{userProfile.email}</p>
              <span className="inline-block px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[10px] font-mono font-bold uppercase mt-0.5">
                Role: {userProfile.role}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Firebase Auth Provider:</span>
              <span className="font-semibold text-slate-800">
                {currentUser ? 'Google OAuth2 (Verified)' : 'Enterprise Session'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cloud Firestore Persistence:</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Multi-Factor Status:</span>
              <span className={`font-semibold ${userProfile.mfaEnabled ? 'text-emerald-700' : 'text-amber-700'}`}>
                {userProfile.mfaEnabled ? 'Enrolled & Active' : 'Not Configured'}
              </span>
            </div>
          </div>
        </div>

        {/* MFA Shortcut Button */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold text-blue-900">Multi-Factor Authentication (MFA)</p>
              <p className="text-[11px] text-blue-700">Configure TOTP authenticator app & backup keys</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMfaEnrollment();
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs"
          >
            Manage MFA
          </button>
        </div>

        {/* Google Sign-in / Sign-out Actions */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          {!currentUser ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-2 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign In with Google Account</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSignOut}
              className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Sign Out of Google Identity</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
