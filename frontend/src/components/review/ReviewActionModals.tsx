import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AppStorage } from '../../lib/storage';
import { VendorApplication, RuleStatus, ValidationResult } from '../../types';
import { CheckCircle2, XCircle, AlertTriangle, Send, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

import { UserMfaProfile } from '../../lib/firebase';
import { MfaChallengeModal } from '../auth/MfaChallengeModal';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: VendorApplication;
  onSuccess: () => void;
  userProfile?: UserMfaProfile;
}

export function ApproveModal({ isOpen, onClose, application, onSuccess, userProfile }: ApproveModalProps) {
  const [reason, setReason] = useState('All statutory registrations, banking credentials, and compliance documents verified.');
  const [error, setError] = useState<string | null>(null);
  const [isMfaChallengeOpen, setIsMfaChallengeOpen] = useState(false);
  const storage = AppStorage.getInstance();
  const currentUser = storage.getCurrentUser();

  const executeApproval = () => {
    setError(null);
    const mfaEvidence = userProfile?.mfaEnabled ? ' [MFA 2FA Step-up Authenticated via TOTP]' : '';
    const res = storage.approveApplication(application.id, reason + mfaEvidence);
    if (!res.success) {
      setError(res.error || 'Failed to approve application.');
    } else {
      onSuccess();
      onClose();
    }
  };

  const handleApprove = () => {
    // If MFA is enabled and policy requires it for approvals, trigger challenge
    if (userProfile?.mfaEnabled && userProfile.enforceMfaForApprovals) {
      setIsMfaChallengeOpen(true);
      return;
    }
    executeApproval();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Confirm Procurement Approval: ${application.id}`}
      description="Granting approval certifies this vendor for enterprise disbursement and contract issuance."
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold">Action Blocked by Security Policy</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-2 text-slate-700">
          <div className="flex justify-between">
            <span className="font-medium text-slate-500">Vendor Entity:</span>
            <span className="font-semibold text-slate-900">{application.company.legalName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-500">Country & Tax ID:</span>
            <span>{application.company.country} — {application.tax.taxIdentifierNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-500">Bank Destination:</span>
            <span>{application.banking.bankName} ({application.banking.accountNumberMasked})</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-500">Acting Authority:</span>
            <span className="font-semibold text-blue-700">{currentUser.name} ({currentUser.role.toUpperCase()})</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Approval Documentation & Audit Notes
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Record the basis for approval..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirm Final Approval
          </button>
        </div>
      </div>

      {isMfaChallengeOpen && userProfile && (
        <MfaChallengeModal
          isOpen={true}
          onClose={() => setIsMfaChallengeOpen(false)}
          userProfile={userProfile}
          actionTitle={`Approve Vendor Application ${application.id}`}
          actionDescription={`Confirm approval for ${application.company.legalName}. Enterprise policy requires step-up authentication.`}
          onSuccess={executeApproval}
        />
      )}
    </Modal>
  );
}

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: VendorApplication;
  onSuccess: () => void;
}

export function RejectModal({ isOpen, onClose, application, onSuccess }: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [policyCode, setPolicyCode] = useState('POL-SEC-09: Unverified entity identity or duplicate record');
  const [error, setError] = useState<string | null>(null);
  const storage = AppStorage.getInstance();

  const handleReject = () => {
    if (!reason.trim()) {
      setError('A mandatory documented justification is required to reject an application.');
      return;
    }
    const fullReason = `[${policyCode}] ${reason.trim()}`;
    const res = storage.rejectApplication(application.id, fullReason);
    if (!res.success) {
      setError(res.error || 'Failed to reject application.');
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reject Vendor Application: ${application.id}`}
      description="Rejection permanently marks this registration as blocked and creates an immutable audit record."
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Governing Policy Clause
          </label>
          <select
            value={policyCode}
            onChange={(e) => setPolicyCode(e.target.value)}
            className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-rose-500"
          >
            <option value="POL-SEC-09: Unverified entity identity or duplicate record">
              POL-SEC-09: Unverified entity identity or prohibited duplicate record
            </option>
            <option value="POL-BNK-03: Failed independent bank verification">
              POL-BNK-03: Failed independent bank verification or unauthorized account holder
            </option>
            <option value="POL-SAN-01: Sanctions screening or export control conflict">
              POL-SAN-01: Sanctions screening or export control conflict
            </option>
            <option value="POL-DOC-04: Fraudulent or repeatedly unrectified compliance certificates">
              POL-DOC-04: Fraudulent or repeatedly unrectified compliance certificates
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Mandatory Rejection Explanation <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
            placeholder="Document the exact factual evidence justifying this rejection decision (e.g. verified duplicate of vendor VND-2026-1000)..."
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Rejection decisions cannot be arbitrary. Specify observable discrepancies or audit findings.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReject}
            className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 rounded hover:bg-rose-700 flex items-center gap-1.5 shadow-xs"
          >
            <XCircle className="w-3.5 h-3.5" />
            Record Mandatory Rejection
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface ManualOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: VendorApplication;
  rule: ValidationResult | null;
  onSuccess: () => void;
}

export function ManualOverrideModal({ isOpen, onClose, application, rule, onSuccess }: ManualOverrideModalProps) {
  const [newStatus, setNewStatus] = useState<RuleStatus>('PASS');
  const [justification, setJustification] = useState('');
  const [error, setError] = useState<string | null>(null);
  const storage = AppStorage.getInstance();

  if (!rule) return null;

  const handleOverride = () => {
    if (!justification.trim()) {
      setError('A documented justification is mandatory for audit trail compliance.');
      return;
    }
    const res = storage.applyManualOverride({
      applicationId: application.id,
      ruleId: rule.ruleId,
      newStatus,
      justification: justification.trim(),
    });
    if (!res.success) {
      setError(res.error || 'Failed to apply override.');
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manual Rule Override: ${rule.ruleId}`}
      description="Overrides supersede automated rules while preserving the original finding in the audit trail."
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
            {error}
          </div>
        )}

        <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
          <p className="font-semibold text-slate-900">{rule.ruleName}</p>
          <p className="text-slate-600"><span className="font-medium text-slate-500">Automated Result:</span> <span className="font-mono text-rose-600 font-bold">{rule.status}</span></p>
          <p className="text-slate-600"><span className="font-medium text-slate-500">Finding:</span> {rule.evidence}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Target Override Status
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as RuleStatus)}
            className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
          >
            <option value="PASS">PASS — Verified via Secondary Source</option>
            <option value="WARNING">WARNING — Acceptable Risk with Monitoring</option>
            <option value="NEEDS_REVIEW">NEEDS_REVIEW — Reset for Specialist Evaluation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Mandatory Override Justification <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
            placeholder="Explain the verified factual evidence that justifies overriding this automated check (e.g. bank letter inspected directly with corporate counsel)..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleOverride}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Record Override to Audit Log
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface RequestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: VendorApplication;
  onSuccess: () => void;
}

export function RequestInfoModal({ isOpen, onClose, application, onSuccess }: RequestInfoModalProps) {
  const failingRules = application.validationResults.filter(r => r.status === 'FAIL' || r.status === 'NEEDS_REVIEW');
  const [selectedItems, setSelectedItems] = useState<string[]>(
    failingRules.map(r => `${r.ruleName}: ${r.recommendedAction}`)
  );
  const [subject, setSubject] = useState(`Action required — Vendor application ${application.id}`);
  const [customNotes, setCustomNotes] = useState('');
  const [isSending, setIsSending] = useState(false);
  const storage = AppStorage.getInstance();

  const toggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const generatedBody = `Hello ${application.company.contactName || application.company.legalName},

We have received your vendor registration for ${application.company.legalName}. Before we can complete the procurement review, please provide:

${selectedItems.map(item => `• ${item}`).join('\n')}
${customNotes ? `\nAdditional instructions from reviewer:\n${customNotes}\n` : ''}
Your application remains pending until these items have been uploaded and reviewed.

Please sign in through the secure vendor portal to submit the requested information:
https://procure.terybi.com/portal/${application.id}/upload

Regards,
Terybi Procurement Operations Team`;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      storage.requestMoreInformation({
        applicationId: application.id,
        recipientEmail: application.company.contactEmail,
        subject,
        body: generatedBody,
        missingItems: selectedItems,
      });
      setIsSending(false);
      onSuccess();
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Information from Vendor (${application.id})`}
      description="Generates a structured follow-up item and triggers a simulated email via Resend to the vendor."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">
            Select Outstanding Items to Request
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded">
            {failingRules.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No automated rule failures found. You can add general notes below.</p>
            ) : (
              failingRules.map(rule => {
                const itemLabel = `${rule.ruleName}: ${rule.recommendedAction}`;
                const isChecked = selectedItems.includes(itemLabel);
                return (
                  <label key={rule.ruleId} className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(itemLabel)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-slate-900">{rule.ruleName}</span> — <span className="text-slate-600">{rule.recommendedAction}</span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Email Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full text-xs p-2 border border-slate-300 rounded font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Additional Reviewer Instructions (Optional)
          </label>
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="e.g. Please ensure document shows full corporate seal..."
            className="w-full text-xs p-2 border border-slate-300 rounded"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
            <span>Generated Follow-Up Preview</span>
            <span className="text-[11px] text-blue-600 font-mono">Recipient: {application.company.contactEmail}</span>
          </label>
          <pre className="p-3 bg-slate-900 text-slate-200 text-xs font-mono rounded overflow-x-auto whitespace-pre-wrap max-h-48">
            {generatedBody}
          </pre>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulates delivery via Resend API • Records portal link</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={handleSend}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? 'Dispatching...' : 'Dispatch Follow-up'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

interface DiscrepancyResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: VendorApplication;
  discrepancyType: string;
  onSuccess: () => void;
}

export function DiscrepancyResolveModal({ isOpen, onClose, application, discrepancyType, onSuccess }: DiscrepancyResolveModalProps) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const storage = AppStorage.getInstance();

  const handleResolve = () => {
    if (!notes.trim()) {
      setError('Resolution documentation is mandatory for audit compliance.');
      return;
    }
    const res = storage.resolveDiscrepancy({
      applicationId: application.id,
      discrepancyType,
      resolutionNotes: notes.trim(),
    });
    if (!res.success) {
      setError(res.error || 'Failed to resolve exception.');
    } else {
      onSuccess();
      onClose();
    }
  };

  const disc = application.discrepancies.find(d => d.type === discrepancyType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Document Exception Resolution: ${disc?.title || discrepancyType}`}
      description="Resolving an exception documents the auditor-approved business rationale and marks the check resolved."
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
            {error}
          </div>
        )}

        {disc && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
            <p className="text-slate-700">{disc.description}</p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
              <div>
                <span className="font-semibold text-slate-500">{disc.sourceFieldA}:</span>
                <p className="font-mono text-slate-800">{disc.valueA}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">{disc.sourceFieldB}:</span>
                <p className="font-mono text-slate-800">{disc.valueB}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Documented Business Justification & Evidence <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
            placeholder={
              discrepancyType === 'NAME_MISMATCH'
                ? 'e.g. Inspected HDFC bank confirmation letter confirming "Apex Industrial Supplies" is the certified operating DBA / trade style of Apex Industrial Supplies Private Limited.'
                : discrepancyType === 'DUPLICATE_REGISTRATION'
                ? 'e.g. Cross-referenced Companies House record. Confirmed Acme Global Construction Ltd is a subsidiary of Acme Buildcorp Ltd with common parent ownership. Linked records.'
                : 'Document factual evidence and authorized reviewer rationale...'
            }
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleResolve}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Save Resolution & Re-Run Validation
          </button>
        </div>
      </div>
    </Modal>
  );
}
