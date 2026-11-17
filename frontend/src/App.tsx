import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AppStorage } from './lib/storage';
import { UserMfaProfile } from './lib/firebase';
import { LandingPage } from './components/landing';
import { AuthModal } from './components/auth/AuthModal';
import { MfaEnrollmentModal } from './components/auth/MfaEnrollmentModal';
import { TestSuiteModal } from './components/testing/TestSuiteModal';
import { auth, onAuthStateChanged, syncUserProfile } from './lib/firebase';

// Lazy load the main app components to reduce initial bundle size
const MainApp = lazy(() => import('./MainApp').then(module => ({ default: module.MainApp })));

export default function App() {
  const storage = AppStorage.getInstance();
  const [, setTick] = useState(0);

  // User Profile & MFA state
  const [userProfile, setUserProfile] = useState<UserMfaProfile>(() => {
    try {
      const stored = localStorage.getItem('vendoriq_mfa_profile_v2');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
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
  });

  // Modals state
  const [isMfaEnrollmentOpen, setIsMfaEnrollmentOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState(false);

  // Subscribe to storage mutations for reactive state
  useEffect(() => {
    return storage.subscribe(() => {
      setTick(prev => prev + 1);
    });
  }, [storage]);

  // Sync Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const synced = await syncUserProfile(fbUser, userProfile);
        setUserProfile(synced);
        try {
          localStorage.setItem('vendoriq_mfa_profile_v2', JSON.stringify(synced));
        } catch (e) {}
      }
    });
    return () => unsub();
  }, []);

  const handleUpdateUserProfile = (updated: UserMfaProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('vendoriq_mfa_profile_v2', JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Protected Application Routes */}
        <Route path="/app/*" element={
          <ProtectedAppRoute
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
            onOpenMfaEnrollment={() => setIsMfaEnrollmentOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenTestSuite={() => setIsTestSuiteOpen(true)}
          />
        } />
        
        {/* Redirect any unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals (available on all routes) */}
      <TestSuiteModal
        isOpen={isTestSuiteOpen}
        onClose={() => setIsTestSuiteOpen(false)}
      />

      <MfaEnrollmentModal
        isOpen={isMfaEnrollmentOpen}
        onClose={() => setIsMfaEnrollmentOpen(false)}
        userProfile={userProfile}
        onProfileUpdated={handleUpdateUserProfile}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdated={handleUpdateUserProfile}
        onOpenMfaEnrollment={() => setIsMfaEnrollmentOpen(true)}
      />
    </BrowserRouter>
  );
}

function ProtectedAppRoute({
  userProfile,
  onUpdateUserProfile,
  onOpenMfaEnrollment,
  onOpenAuthModal,
  onOpenTestSuite,
}: {
  userProfile: UserMfaProfile;
  onUpdateUserProfile: (updated: UserMfaProfile) => void;
  onOpenMfaEnrollment: () => void;
  onOpenAuthModal: () => void;
  onOpenTestSuite: () => void;
}) {
  return (
    <Suspense fallback={<AppLoadingFallback />}>
      <MainApp
        userProfile={userProfile}
        onUpdateUserProfile={onUpdateUserProfile}
        onOpenMfaEnrollment={onOpenMfaEnrollment}
        onOpenAuthModal={onOpenAuthModal}
        onOpenTestSuite={onOpenTestSuite}
      />
    </Suspense>
  );
}

function AppLoadingFallback() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-bg-primary"
    >
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-electric-lime to-lime-active flex items-center justify-center animate-pulse-glow">
          <span className="font-display font-extrabold text-lg text-ink-black">V</span>
        </div>
        <p className="text-text-secondary">Loading VendorIQ...</p>
      </div>
    </motion.div>
  );
}