import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { getTotpCode, verifyTotpCode } from '../../lib/mfa';
import { UserMfaProfile } from '../../lib/firebase';
import { ShieldCheck, Lock, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

interface MfaChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserMfaProfile;
  actionTitle: string;
  actionDescription: string;
  onSuccess: () => void;
}

export function MfaChallengeModal({
  isOpen,
  onClose,
  userProfile,
  actionTitle,
  actionDescription,
  onSuccess,
}: MfaChallengeModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentTotp, setCurrentTotp] = useState({ code: '000000', remainingSeconds: 30 });

  const secret = userProfile.totpSecret || 'JBSWY3DPEHPK3PXP';

  useEffect(() => {
    const updateTicker = () => {
      const t = getTotpCode(secret);
      setCurrentTotp(t);
    };
    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [secret]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const verification = verifyTotpCode(code, secret, userProfile.backupCodes);
    if (!verification.isValid) {
      setError('Invalid 6-digit verification code or recovery code. Try again or click Auto-fill.');
      return;
    }

    onSuccess();
    onClose();
  };

  const handleAutoFill = () => {
    setCode(currentTotp.code);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Second-Factor Authentication Required"
      description="This sensitive procurement action is protected by multi-factor security policy."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Target Action: {actionTitle}</span>
          </div>
          <p className="text-[11px] text-amber-800">{actionDescription}</p>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-800">
            Enter 6-Digit Authenticator Code or Recovery Code
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              maxLength={9}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="text-center font-mono text-xl font-bold tracking-widest w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Current Authenticator Code:</span>
            <button
              type="button"
              onClick={handleAutoFill}
              className="font-mono text-blue-600 font-bold hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
            >
              Auto-fill {currentTotp.code} ({currentTotp.remainingSeconds}s)
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify & Proceed
          </button>
        </div>
      </form>
    </Modal>
  );
}
