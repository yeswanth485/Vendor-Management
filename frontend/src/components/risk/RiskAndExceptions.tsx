import React, { useState } from 'react';
import { VendorApplication, BankChangeRequest } from '../../types';
import { AppStorage } from '../../lib/storage';
import { StatusBadge, RiskBadge, CountryFlag } from '../common/Badge';
import { 
  ShieldAlert, 
  Lock, 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  FileText,
  Building2,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { UserMfaProfile } from '../../lib/firebase';
import { MfaChallengeModal } from '../auth/MfaChallengeModal';

interface RiskAndExceptionsProps {
  applications: VendorApplication[];
  onSelectApplication: (id: string) => void;
  userProfile?: UserMfaProfile;
}

export function RiskAndExceptions({ applications, onSelectApplication, userProfile }: RiskAndExceptionsProps) {
  const storage = AppStorage.getInstance();
  const currentUser = storage.getCurrentUser();
  const bankChanges = storage.getBankChangeRequests();

  // Selected Bank Change Modal State
  const [selectedBankChange, setSelectedBankChange] = useState<BankChangeRequest | null>(null);
  const [phoneNotes, setPhoneNotes] = useState('Spoke directly with Liam O’Connor (Finance Controller) via verified headquarters switchboard (+61 2 9234 5678). Verified change authorization code and corporate resolution.');
  const [isVerifying, setIsVerifying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMfaChallengeOpen, setIsMfaChallengeOpen] = useState(false);

  // Filter high/critical risk applications or those with active exceptions
  const highRiskApps = applications.filter(a => 
    a.riskLevel === 'HIGH' || 
    a.riskLevel === 'CRITICAL' || 
    a.discrepancies.some(d => !d.resolved)
  );

  const executeBankChangeDecision = (action: 'APPROVE' | 'REJECT') => {
    if (!selectedBankChange) return;
    setActionError(null);

    const mfaProof = userProfile?.mfaEnabled ? ' [MFA 2FA Authenticated]' : '';
    const res = storage.verifyBankChangeRequest({
      requestId: selectedBankChange.id,
      action,
      notes: phoneNotes.trim() + mfaProof,
    });

    if (!res.success) {
      setActionError(res.error || 'Failed to update bank change request.');
    } else {
      setSelectedBankChange(null);
    }
  };

  const handleBankChangeDecision = (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE' && userProfile?.mfaEnabled && userProfile.enforceMfaForBankChanges) {
      setIsMfaChallengeOpen(true);
      return;
    }
    executeBankChangeDecision(action);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Risk & Exception Management Center
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Surveillance and intervention hub for policy violations, sanctions alerts, duplicate records, and sensitive disbursement changes.
        </p>
      </div>

      {/* Section 1: Edge Case D - Bank Detail Change Requests on Security Hold */}
      <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Disbursement Account Change Surveillance (Edge Case D)
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              {bankChanges.filter(b => b.status === 'PENDING_HOLD').length} On Mandatory Fraud Hold
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Dual-Control Protocol Enforced
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Payment instructions cannot be modified automatically by form validation. To prevent Business Email Compromise (BEC) and unauthorized diversion, existing verified bank details remain active until independent verbal call-back confirmation is logged.
        </p>

        <div className="space-y-3">
          {bankChanges.map((req) => {
            const isHold = req.status === 'PENDING_HOLD';
            return (
              <div 
                key={req.id} 
                className={`p-4 rounded-lg border text-xs space-y-3 ${
                  isHold ? 'bg-amber-50/40 border-amber-300 shadow-xs' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">{req.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-900">{req.currentDetails.accountHolderName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-blue-600 font-semibold">{req.applicationId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isHold ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-amber-700" /> 72-Hour Security Hold
                      </span>
                    ) : req.status === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Dual-Control Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                        <XCircle className="w-3.5 h-3.5 text-rose-700" /> Modification Rejected
                      </span>
                    )}

                    {isHold && (
                      <button
                        onClick={() => setSelectedBankChange(req)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium shadow-xs flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        Execute Verbal Verification
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                      Currently Verified Account (Active & Preserved)
                    </span>
                    <p className="font-medium text-slate-900">{req.currentDetails.bankName}</p>
                    <p className="font-mono text-slate-600">
                      Account: <strong>{req.currentDetails.accountNumberMasked}</strong> ({req.currentDetails.routingIdentifierType}: {req.currentDetails.routingIdentifierValue})
                    </p>
                    <p className="text-[11px] text-slate-400">Verified at: {new Date(req.currentDetails.verifiedAt || '').toLocaleDateString()}</p>
                  </div>

                  <div className="p-3 bg-white rounded border border-amber-300 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">
                      Proposed Unverified Account (Security Hold)
                    </span>
                    <p className="font-medium text-slate-900">{req.proposedDetails.bankName}</p>
                    <p className="font-mono text-slate-600">
                      Account: <strong>{req.proposedDetails.accountNumberMasked}</strong> ({req.proposedDetails.routingIdentifierType}: {req.proposedDetails.routingIdentifierValue})
                    </p>
                    <p className="text-[11px] text-slate-500">Requested by: {req.requestedBy}</p>
                  </div>
                </div>

                {req.verificationNotes && (
                  <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                    <span className="font-semibold text-slate-500">Verification Protocol Log: </span>
                    {req.verificationNotes}
                    {req.reviewedBy && <span className="font-mono text-slate-400 ml-1">[{req.reviewedBy}]</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: High & Critical Risk Exceptions Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Active Corporate Discrepancies & Surveillance Alerts
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {highRiskApps.length} Flagged Applications
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {highRiskApps.map((app) => (
            <div 
              key={app.id} 
              className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-blue-600">{app.id}</span>
                  <CountryFlag code={app.company.country} />
                  <span className="text-xs font-bold text-slate-900">{app.company.legalName}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span>Category: {app.company.vendorCategory}</span>
                  <span>•</span>
                  <span className="text-rose-700 font-semibold">
                    {app.discrepancies.find(d => !d.resolved)?.title || 'High Risk Review Trigger'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RiskBadge level={app.riskLevel} score={app.riskScore} />
                <StatusBadge status={app.status} />
                <button
                  onClick={() => onSelectApplication(app.id)}
                  className="px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50 flex items-center gap-1"
                >
                  Inspect Exceptions <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Dialog for Edge Case D */}
      {selectedBankChange && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBankChange(null)}
          title={`Dual-Control Bank Verification: ${selectedBankChange.id}`}
          description="Authenticate bank instruction change via independent out-of-band verbal phone callback."
        >
          <div className="space-y-4">
            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
                {actionError}
              </div>
            )}

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Vendor:</span>
                <span className="font-bold text-slate-900">{selectedBankChange.currentDetails.accountHolderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Existing Preserved Bank:</span>
                <span className="font-mono">{selectedBankChange.currentDetails.bankName} ({selectedBankChange.currentDetails.accountNumberMasked})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">New Requested Bank:</span>
                <span className="font-mono text-amber-800 font-bold">{selectedBankChange.proposedDetails.bankName} ({selectedBankChange.proposedDetails.accountNumberMasked})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Executing Officer:</span>
                <span className="font-bold text-blue-700">{currentUser.name} ({currentUser.role.toUpperCase()})</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Out-of-Band Verbal Verification Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={phoneNotes}
                onChange={(e) => setPhoneNotes(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 font-mono"
                placeholder="Record exact timestamp, telephone number called from known corporate registry, person spoken with, and verification response..."
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Policy mandates independent verification with corporate officer before replacing payment coordinates.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleBankChangeDecision('REJECT')}
                className="px-3.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject Bank Change Request
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBankChange(null)}
                  className="px-3 py-1.5 text-xs text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleBankChangeDecision('APPROVE')}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Certify & Approve Account Update
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MFA Step-Up Challenge for Edge Case D */}
      {isMfaChallengeOpen && userProfile && selectedBankChange && (
        <MfaChallengeModal
          isOpen={true}
          onClose={() => setIsMfaChallengeOpen(false)}
          userProfile={userProfile}
          actionTitle={`Certify Sensitive Bank Change ${selectedBankChange.id}`}
          actionDescription={`Update payout instructions to ${selectedBankChange.proposedDetails.bankName} (${selectedBankChange.proposedDetails.accountNumberMasked}). MFA verification is required by procurement security governance.`}
          onSuccess={() => executeBankChangeDecision('APPROVE')}
        />
      )}
    </div>
  );
}
