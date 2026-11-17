import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { generateRandomBase32Secret, generateBackupCodes, getTotpCode, verifyTotpCode } from '../../lib/mfa';
import { UserMfaProfile, saveUserMfaSettings } from '../../lib/firebase';
import { 
  ShieldCheck, 
  Smartphone, 
  Key, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  ShieldAlert,
  Download
} from 'lucide-react';

interface MfaEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserMfaProfile;
  onProfileUpdated: (updated: UserMfaProfile) => void;
}

export function MfaEnrollmentModal({ isOpen, onClose, userProfile, onProfileUpdated }: MfaEnrollmentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(userProfile.mfaEnabled ? 3 : 1);
  const [secret, setSecret] = useState(userProfile.totpSecret || generateRandomBase32Secret());
  const [backupCodes, setBackupCodes] = useState<string[]>(userProfile.backupCodes || generateBackupCodes());
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Live TOTP simulation ticker
  const [currentSimulatedTotp, setCurrentSimulatedTotp] = useState({ code: '000000', remainingSeconds: 30 });

  useEffect(() => {
    const updateTicker = () => {
      const totp = getTotpCode(secret);
      setCurrentSimulatedTotp(totp);
    };
    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [secret]);

  const handleVerifyAndEnable = async () => {
    setError(null);
    const verification = verifyTotpCode(verificationCode, secret, backupCodes);
    if (!verification.isValid) {
      setError('Invalid 6-digit authentication code. Please check your authenticator app or enter the demo code shown.');
      return;
    }

    const updatedProfile: UserMfaProfile = {
      ...userProfile,
      mfaEnabled: true,
      mfaEnrolledAt: new Date().toISOString(),
      totpSecret: secret,
      backupCodes: backupCodes,
      mfaType: 'TOTP',
      lastMfaVerifiedAt: new Date().toISOString(),
    };

    await saveUserMfaSettings(userProfile.uid, updatedProfile);
    onProfileUpdated(updatedProfile);
    setStep(3);
  };

  const handleDisableMfa = async () => {
    const updatedProfile: UserMfaProfile = {
      ...userProfile,
      mfaEnabled: false,
      mfaEnrolledAt: undefined,
      totpSecret: undefined,
      backupCodes: undefined,
    };
    await saveUserMfaSettings(userProfile.uid, updatedProfile);
    onProfileUpdated(updatedProfile);
    onClose();
  };

  const handleCopySecret = () => {
    navigator.clipboard?.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard?.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Factor Authentication (MFA) Security Center"
      description="Protect enterprise procurement decisions with time-based one-time password (TOTP) verification."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Status Header */}
        <div className={`p-4 rounded-lg border flex items-center justify-between ${
          userProfile.mfaEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              userProfile.mfaEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {userProfile.mfaEnabled ? '✓' : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-bold text-sm">
                {userProfile.mfaEnabled ? 'Multi-Factor Authentication is Active' : 'MFA is Not Configured'}
              </p>
              <p className="text-[11px] text-slate-500">
                {userProfile.mfaEnabled
                  ? `Enrolled with TOTP Authenticator App on ${new Date(userProfile.mfaEnrolledAt || '').toLocaleDateString()}`
                  : 'Add a second security layer using Google Authenticator, Microsoft Authenticator, or 1Password.'}
              </p>
            </div>
          </div>

          {userProfile.mfaEnabled && (
            <button
              onClick={handleDisableMfa}
              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded"
            >
              Disable MFA
            </button>
          )}
        </div>

        {/* Step 1: Scan / Enter Secret */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-blue-900 space-y-1">
              <p className="font-bold">Step 1: Set Up Authenticator App</p>
              <p>
                Open your authenticator app (Google Authenticator, Microsoft Authenticator, Duo, or 1Password) and enter the secret configuration key below.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Manual Entry Secret Key (Base32)
                </label>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-2 border border-slate-300 rounded font-mono text-sm tracking-wider font-bold text-slate-900 flex-1">
                    {secret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-medium flex items-center gap-1 shadow-xs"
                  >
                    {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Simulated QR Code Box */}
              <div className="p-3 bg-white border border-slate-200 rounded text-center space-y-1">
                <div className="w-36 h-36 mx-auto bg-slate-900 text-white flex flex-col items-center justify-center rounded p-2 text-center shadow-inner">
                  <div className="grid grid-cols-4 gap-1 p-2 bg-white text-slate-900 rounded">
                    <div className="w-5 h-5 bg-slate-900" />
                    <div className="w-5 h-5 bg-slate-200" />
                    <div className="w-5 h-5 bg-slate-900" />
                    <div className="w-5 h-5 bg-slate-900" />
                    <div className="w-5 h-5 bg-slate-200" />
                    <div className="w-5 h-5 bg-slate-900" />
                    <div className="w-5 h-5 bg-slate-200" />
                    <div className="w-5 h-5 bg-slate-900" />
                  </div>
                  <span className="font-mono text-[9px] text-slate-300 mt-1">TOTP QR Code</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  otpauth://totp/VendorIQ:{userProfile.email}?secret={secret}&issuer=VendorIQ
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-1.5 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-xs"
              >
                Next: Verify Code
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-blue-900 space-y-1">
              <p className="font-bold">Step 2: Enter 6-Digit Authenticator Code</p>
              <p>
                Enter the rotating verification code from your authenticator app to complete pairing.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  6-Digit Verification Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="text-center font-mono text-lg font-bold tracking-widest w-44 p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setVerificationCode(currentSimulatedTotp.code)}
                    className="px-3 py-2 text-xs border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded font-medium shadow-xs"
                  >
                    Auto-Fill Current Code ({currentSimulatedTotp.code})
                  </button>
                </div>
              </div>

              {/* Live Ticker helper */}
              <div className="p-2.5 bg-white border border-slate-200 rounded text-[11px] flex items-center justify-between">
                <span className="text-slate-500 font-medium">Live Generator Clock:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{currentSimulatedTotp.code}</span>
                  <span className="font-mono text-blue-600 font-semibold">({currentSimulatedTotp.remainingSeconds}s)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerifyAndEnable}
                className="px-4 py-1.5 font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Verify & Activate MFA
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Backup Codes & Enforcement Policy */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                MFA is Fully Configured and Enforcing Security Policies
              </p>
              <p>
                Save these 8 one-time emergency backup recovery codes in a secure vault. Each code can be used once if you lose access to your authenticator app.
              </p>
            </div>

            {/* Backup Codes Grid */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Emergency Single-Use Recovery Codes
                </span>
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCodes ? 'Copied Codes!' : 'Copy All Codes'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="p-2 bg-white border border-slate-200 rounded text-center font-bold text-slate-800">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            {/* Procurement Policy Enforcements */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                Active Mandatory Step-Up Policies
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={userProfile.enforceMfaForApprovals}
                  onChange={async (e) => {
                    const updated = { ...userProfile, enforceMfaForApprovals: e.target.checked };
                    await saveUserMfaSettings(userProfile.uid, updated);
                    onProfileUpdated(updated);
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Mandate MFA step-up verification before granting final <strong>Vendor Approvals</strong></span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={userProfile.enforceMfaForBankChanges}
                  onChange={async (e) => {
                    const updated = { ...userProfile, enforceMfaForBankChanges: e.target.checked };
                    await saveUserMfaSettings(userProfile.uid, updated);
                    onProfileUpdated(updated);
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Mandate MFA step-up verification before approving <strong>Disbursement Bank Changes (Edge Case D)</strong></span>
              </label>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
