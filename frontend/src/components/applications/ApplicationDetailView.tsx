import React, { useState } from 'react';
import { 
  VendorApplication, 
  ValidationResult, 
  RuleStatus, 
  VendorDocument 
} from '../../types';
import { AppStorage } from '../../lib/storage';
import { StatusBadge, RiskBadge, RuleStatusBadge, CountryFlag } from '../common/Badge';
import { 
  ApproveModal, 
  RejectModal, 
  ManualOverrideModal, 
  RequestInfoModal, 
  DiscrepancyResolveModal 
} from '../review/ReviewActionModals';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  History, 
  Mail, 
  RefreshCw, 
  UserCheck, 
  UserMinus, 
  CheckCircle, 
  XCircle, 
  Upload, 
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Building2,
  CreditCard,
  FileCheck,
  Split
} from 'lucide-react';

import { UserMfaProfile } from '../../lib/firebase';

interface ApplicationDetailViewProps {
  applicationId: string;
  onBack: () => void;
  onNavigateToApplication?: (id: string) => void;
  userProfile?: UserMfaProfile;
}

export function ApplicationDetailView({ applicationId, onBack, onNavigateToApplication, userProfile }: ApplicationDetailViewProps) {
  const storage = AppStorage.getInstance();
  const [activeTab, setActiveTab] = useState<'rules' | 'compare' | 'documents' | 'audit' | 'communications'>('rules');
  const [selectedRuleForOverride, setSelectedRuleForOverride] = useState<ValidationResult | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [resolveDiscrepancyType, setResolveDiscrepancyType] = useState<string | null>(null);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [selectedDocCategory, setSelectedDocCategory] = useState<VendorDocument['category']>('ISO_COMPLIANCE');
  const [docUploadFileName, setDocUploadFileName] = useState('');
  const [docUploadExpiry, setDocUploadExpiry] = useState('2028-10-27');
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const currentUser = storage.getCurrentUser();
  const app = storage.getApplicationById(applicationId);

  if (!app) {
    return (
      <div className="p-8 text-center bg-white rounded border border-slate-200">
        <p className="text-sm text-slate-600">Application not found: {applicationId}</p>
        <button
          onClick={onBack}
          className="mt-4 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications
        </button>
      </div>
    );
  }

  const toggleRuleExpand = (ruleId: string) => {
    setExpandedRules(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  const handleClaim = () => {
    storage.claimApplication(app.id);
  };

  const handleRelease = () => {
    storage.releaseApplication(app.id);
  };

  const handleReevaluate = () => {
    storage.revalidateApplication(app.id);
  };

  const handleDocUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUploadFileName.trim()) return;
    storage.replaceDocument({
      applicationId: app.id,
      documentCategory: selectedDocCategory,
      fileName: docUploadFileName.trim(),
      fileSize: 1540000,
      fileType: 'application/pdf',
      expiryDate: docUploadExpiry,
    });
    setIsUploadDocOpen(false);
    setDocUploadFileName('');
  };

  const relatedAudits = storage.getAuditEvents().filter(e => e.applicationId === app.id);
  const relatedFollowUps = storage.getFollowUps().filter(f => f.applicationId === app.id);
  const unresolvedDiscrepancies = app.discrepancies.filter(d => !d.resolved);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {app.id}
                </span>
                <CountryFlag code={app.company.country} />
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {app.company.legalName}
                </h1>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Category: <strong className="text-slate-700">{app.company.vendorCategory}</strong></span>
                <span>•</span>
                <span>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Reviewer: <strong className="text-slate-700">{app.assignedReviewerName || 'Unassigned'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={app.status} />
            <RiskBadge level={app.riskLevel} score={app.riskScore} />

            {/* Claim / Release buttons */}
            {app.assignedReviewerId === currentUser.id ? (
              <button
                onClick={handleRelease}
                className="px-2.5 py-1 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 rounded flex items-center gap-1 font-medium"
              >
                <UserMinus className="w-3.5 h-3.5 text-slate-500" />
                Release Review
              </button>
            ) : (
              <button
                onClick={handleClaim}
                className="px-2.5 py-1 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded flex items-center gap-1 font-medium shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Claim Review
              </button>
            )}

            <button
              onClick={handleReevaluate}
              className="px-2.5 py-1 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 rounded flex items-center gap-1 font-medium"
              title="Re-run rules engine"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Re-run Rules
            </button>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {unresolvedDiscrepancies.length > 0 ? (
              <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded font-semibold border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                {unresolvedDiscrepancies.length} Item(s) Need Manager Attention
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded font-semibold border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                All Verification Rules Certified
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRequestInfoOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 rounded flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Request Info
            </button>

            {app.status !== 'REJECTED' && (
              <button
                onClick={() => setIsRejectOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100 rounded flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            )}

            {app.status !== 'APPROVED' && (
              <button
                onClick={() => setIsApproveOpen(true)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve Vendor {currentUser.role === 'approver' && '(MFA)'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manager Executive Decision Brief */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Manager Executive Brief
          </span>
          <span className="text-xs font-medium text-slate-500">
            Target SLA: Net 30 Terms • High-Risk Watchlist: {app.riskLevel}
          </span>
        </div>

        {/* Highlighted Manager Summary */}
        <div className={`p-4 rounded-lg border text-xs space-y-2 ${
          unresolvedDiscrepancies.length > 0 
            ? 'bg-amber-50/60 border-amber-200 text-amber-900' 
            : app.status === 'APPROVED'
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            : 'bg-blue-50/60 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-2">
              {unresolvedDiscrepancies.length > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Exception: {unresolvedDiscrepancies[0].title}
                </>
              ) : app.status === 'APPROVED' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Vendor Certified for Enterprise Disbursement
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Ready for Manager Review & Sign-Off
                </>
              )}
            </span>

            {unresolvedDiscrepancies.length > 0 && (
              <button
                onClick={() => setResolveDiscrepancyType(unresolvedDiscrepancies[0].type)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs shadow-xs"
              >
                Resolve Exception
              </button>
            )}
          </div>

          <p className="text-xs">
            {unresolvedDiscrepancies.length > 0
              ? unresolvedDiscrepancies[0].description
              : app.decisionReason || 'All corporate identity checks, tax identifiers, and bank coordinates pass baseline procurement policy.'}
          </p>
        </div>

        {/* 4 Pillars at a Glance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">1. Entity Identity</span>
            <p className="font-bold text-slate-900 truncate">{app.company.legalName}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Reg: {app.company.businessRegistrationNumber}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">2. Tax Registration</span>
            <p className="font-bold text-slate-900 truncate">{app.tax.taxIdentifierType}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{app.tax.taxIdentifierNumber} ({app.tax.taxRegistrationStatus})</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">3. Bank Beneficiary</span>
            <p className="font-bold text-slate-900 truncate">{app.banking.accountHolderName}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{app.banking.bankName} ({app.banking.accountNumberMasked})</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">4. Compliance Files</span>
            <p className="font-bold text-slate-900">{app.documents.length} Files Attached</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {app.documents.some(d => d.expiryDate && d.expiryDate < '2026-10-27') ? (
                <span className="text-rose-600 font-bold">1 Expired File</span>
              ) : (
                <span className="text-emerald-600 font-bold">All Valid</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-6 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'rules' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Explainable Rules ({app.validationResults.length})
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'compare' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Split className="w-4 h-4" />
          Side-by-Side Comparison ({app.discrepancies.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'documents' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Compliance Documents & Extractions ({app.documents.length})
        </button>

        <button
          onClick={() => setActiveTab('communications')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'communications' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          Follow-ups & Resend ({relatedFollowUps.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'audit' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Audit Trail ({relatedAudits.length})
        </button>
      </div>

      {/* Tab 1: Rules & Explainability */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Manager Focus:</span>
              <span>Passing checks are auto-collapsed to highlight exceptions.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-700 font-semibold">
                Pass Rate: {app.validationResults.filter(r => r.status === 'PASS').length} / {app.validationResults.length}
              </span>
              <button
                onClick={() => {
                  const allExpanded = Object.keys(expandedRules).length === app.validationResults.length && Object.values(expandedRules).every(Boolean);
                  const next: Record<string, boolean> = {};
                  app.validationResults.forEach(r => {
                    next[r.ruleId] = !allExpanded;
                  });
                  setExpandedRules(next);
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                Toggle Expand All
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {app.validationResults.map((rule) => {
              // Smart collapse: failing/needs_review open by default, passing closed by default
              const isExpanded = expandedRules[rule.ruleId] !== undefined
                ? expandedRules[rule.ruleId]
                : (rule.status !== 'PASS');
              return (
                <div
                  key={rule.ruleId}
                  className={`border rounded-lg bg-white overflow-hidden transition-shadow ${
                    rule.status === 'FAIL' 
                      ? 'border-rose-200 shadow-xs' 
                      : rule.status === 'NEEDS_REVIEW' 
                      ? 'border-blue-200' 
                      : rule.status === 'WARNING'
                      ? 'border-amber-200'
                      : 'border-slate-200'
                  }`}
                >
                  <div 
                    onClick={() => toggleRuleExpand(rule.ruleId)}
                    className="flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <span className="font-mono text-xs font-semibold text-slate-600">{rule.ruleId}</span>
                      <span className="text-xs font-semibold text-slate-900">{rule.ruleName}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">[{rule.category}]</span>
                      {rule.override && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded font-medium">
                          Manually Overridden
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <RuleStatusBadge status={rule.status} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRuleForOverride(rule);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        Override
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 space-y-3 text-xs bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded">
                          <p className="font-semibold text-slate-500 text-[11px] mb-1">EVALUATED EVIDENCE</p>
                          <p className="font-mono text-slate-800 text-xs">{rule.evidence}</p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded md:col-span-2">
                          <p className="font-semibold text-slate-500 text-[11px] mb-1">HUMAN-READABLE EXPLANATION</p>
                          <p className="text-slate-800 text-xs">{rule.explanation}</p>
                        </div>
                      </div>

                      <div className="flex items-start justify-between p-2.5 bg-blue-50/50 border border-blue-100 rounded text-slate-700">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-900">Recommended Next Step: </span>
                            <span>{rule.recommendedAction}</span>
                          </div>
                        </div>
                        {rule.manualReviewRequired && (
                          <span className="text-[11px] text-amber-700 font-semibold px-2 py-0.5 bg-amber-50 rounded border border-amber-200 shrink-0">
                            Manual Review Mandated
                          </span>
                        )}
                      </div>

                      {rule.override && (
                        <div className="p-2.5 bg-purple-50/50 border border-purple-200 rounded text-xs space-y-1">
                          <p className="font-semibold text-purple-900">
                            Historical Override Applied by {rule.override.approvedBy} on {new Date(rule.override.approvedAt).toLocaleString()}
                          </p>
                          <p className="text-purple-800">
                            Original Automated Finding: <span className="font-mono font-bold">{rule.override.originalStatus}</span>
                          </p>
                          <p className="text-purple-800 italic">
                            Justification: "{rule.override.justification}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Side-by-Side Comparison */}
      {activeTab === 'compare' && (
        <div className="space-y-5">
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
            Compare contradictory or divergent fields directly side-by-side to understand why automated policy flagged an exception.
          </div>

          {app.discrepancies.length === 0 ? (
            <div className="p-8 text-center bg-white rounded border border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Zero Discrepancies Detected</p>
              <p className="text-xs text-slate-500">Corporate legal identity, tax filings, and banking credentials are completely aligned.</p>
            </div>
          ) : (
            app.discrepancies.map((disc, idx) => (
              <div 
                key={idx} 
                className={`bg-white border rounded-lg overflow-hidden shadow-xs ${
                  disc.resolved ? 'border-slate-200' : 'border-amber-200'
                }`}
              >
                <div className={`p-4 border-b flex items-center justify-between ${
                  disc.resolved ? 'bg-slate-50/70 border-slate-200' : 'bg-amber-50/50 border-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded uppercase ${
                      disc.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {disc.type}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">{disc.title}</h3>
                  </div>

                  {disc.resolved ? (
                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolved by {disc.resolvedBy}
                    </span>
                  ) : (
                    <button
                      onClick={() => setResolveDiscrepancyType(disc.type)}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
                    >
                      Document Resolution
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  <p className="text-xs text-slate-700">{disc.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                        {disc.sourceFieldA}
                      </p>
                      <p className="font-mono text-xs font-medium text-slate-900 bg-white p-2 rounded border border-slate-200">
                        {disc.valueA}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                        {disc.sourceFieldB}
                      </p>
                      <p className="font-mono text-xs font-medium text-amber-900 bg-amber-50/50 p-2 rounded border border-amber-200">
                        {disc.valueB}
                      </p>
                    </div>
                  </div>

                  {disc.relatedApplicationId && onNavigateToApplication && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-xs flex items-center justify-between">
                      <span className="text-blue-900">
                        Matching duplicate application record detected: <strong>{disc.relatedApplicationId}</strong>
                      </span>
                      <button
                        onClick={() => onNavigateToApplication(disc.relatedApplicationId!)}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 underline"
                      >
                        Inspect Colliding Record <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {disc.resolved && disc.resolutionNotes && (
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded text-xs space-y-1">
                      <p className="font-semibold text-emerald-900">Documented Auditor Resolution Rationale:</p>
                      <p className="text-emerald-800 italic">"{disc.resolutionNotes}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Compliance Documents & Extractions */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
            <span>
              All uploaded statutory documents. Extracted data is labeled as <strong>UNVERIFIED</strong> until certified by a human reviewer.
            </span>
            <button
              onClick={() => setIsUploadDocOpen(true)}
              className="px-3 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded font-medium flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Replacement Document
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {app.documents.map((doc) => {
              const isExpired = doc.expiryDate && doc.expiryDate < '2026-10-27';
              return (
                <div key={doc.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{doc.category.replace(/_/g, ' ')}</h4>
                        <p className="font-mono text-[11px] text-slate-500 mt-0.5">{doc.fileName}</p>
                      </div>
                    </div>
                    {isExpired ? (
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        Expired ({doc.expiryDate})
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <div>
                      <span>File Size: </span>
                      <strong className="text-slate-700">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</strong>
                    </div>
                    <div>
                      <span>Uploaded By: </span>
                      <strong className="text-slate-700">{doc.uploadedBy}</strong>
                    </div>
                    <div>
                      <span>Date Added: </span>
                      <strong className="text-slate-700">{new Date(doc.uploadedAt).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span>Validity End: </span>
                      <strong className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {doc.expiryDate || 'Perpetual / N/A'}
                      </strong>
                    </div>
                  </div>

                  {/* OCR Extracted Data Container */}
                  {doc.extractedData ? (
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Server-Side OCR Extraction
                        </span>
                        <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-1.5 rounded">
                          Unverified Data
                        </span>
                      </div>
                      <div className="space-y-0.5 font-mono text-[11px] text-slate-700">
                        {doc.extractedData.legalName && (
                          <p>Legal Name: <strong>{doc.extractedData.legalName}</strong></p>
                        )}
                        {doc.extractedData.registrationNumber && (
                          <p>Reg #: <strong>{doc.extractedData.registrationNumber}</strong></p>
                        )}
                        {doc.extractedData.taxIdentifier && (
                          <p>Tax ID: <strong>{doc.extractedData.taxIdentifier}</strong></p>
                        )}
                        {doc.extractedData.accountHolderName && (
                          <p>Beneficiary: <strong>{doc.extractedData.accountHolderName}</strong></p>
                        )}
                        {doc.extractedData.expiryDate && (
                          <p>Expiration: <strong className={isExpired ? 'text-rose-600' : ''}>{doc.extractedData.expiryDate}</strong></p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 rounded">
                      No automated OCR fields extracted.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Follow-ups & Resend */}
      {activeTab === 'communications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
            <span>
              Outbound vendor notifications and clarification dispatches. Sent messages simulate Resend API delivery and generate secure portal links.
            </span>
            <button
              onClick={() => setIsRequestInfoOpen(true)}
              className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded font-medium flex items-center gap-1.5 shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              Compose New Follow-up
            </button>
          </div>

          {relatedFollowUps.length === 0 ? (
            <div className="p-8 text-center bg-white rounded border border-slate-200">
              <Mail className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No Follow-ups Sent</p>
              <p className="text-xs text-slate-500">No clarification inquiries have been dispatched to this vendor yet.</p>
            </div>
          ) : (
            relatedFollowUps.map((flw) => (
              <div key={flw.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {flw.id}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{flw.subject}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {flw.sentAt ? new Date(flw.sentAt).toLocaleString() : 'Draft'}
                    </span>
                    <span className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                      Dispatched (Simulated Resend)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <p><span className="font-medium text-slate-500">Recipient:</span> <span className="font-mono">{flw.recipientEmail}</span></p>
                  <p><span className="font-medium text-slate-500">Sender:</span> {flw.sentBy}</p>
                </div>

                <div className="p-3 bg-slate-900 text-slate-200 rounded text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {flw.body}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 text-[11px]">
                    Portal Target: <span className="font-mono text-blue-600">{flw.securePortalUrl}</span>
                  </span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(flw.securePortalUrl)}
                    className="text-xs text-slate-600 hover:text-slate-900 underline"
                  >
                    Copy Portal Link
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
            Append-only, immutable event log documenting all system evaluations, manual overrides, and human reviewer decisions.
          </div>

          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {relatedAudits.map((event) => (
              <div key={event.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-slate-500">{event.id}</span>
                    <span className="text-xs font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">
                      {event.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-slate-700">
                  <span className="font-medium text-slate-500">Actor:</span>{' '}
                  <strong className="text-slate-900">{event.actor.name}</strong> ({event.actor.email} • {event.actor.role})
                </div>

                {event.reason && (
                  <p className="text-xs text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-semibold text-slate-600">Reason: </span>
                    {event.reason}
                  </p>
                )}

                {(event.previousValue || event.newValue) && (
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2 rounded">
                    <div>
                      <span className="text-slate-400 block text-[10px]">PREVIOUS VALUE</span>
                      <span className="text-slate-700">{event.previousValue || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">NEW VALUE</span>
                      <span className="text-blue-700 font-bold">{event.newValue}</span>
                    </div>
                  </div>
                )}

                {event.evidence && (
                  <p className="text-[11px] font-mono text-slate-500">
                    Evidence: {event.evidence}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ApproveModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        application={app}
        userProfile={userProfile}
        onSuccess={() => {}}
      />

      <RejectModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        application={app}
        onSuccess={() => {}}
      />

      <ManualOverrideModal
        isOpen={!!selectedRuleForOverride}
        onClose={() => setSelectedRuleForOverride(null)}
        application={app}
        rule={selectedRuleForOverride}
        onSuccess={() => {}}
      />

      <RequestInfoModal
        isOpen={isRequestInfoOpen}
        onClose={() => setIsRequestInfoOpen(false)}
        application={app}
        onSuccess={() => {}}
      />

      {resolveDiscrepancyType && (
        <DiscrepancyResolveModal
          isOpen={true}
          onClose={() => setResolveDiscrepancyType(null)}
          application={app}
          discrepancyType={resolveDiscrepancyType}
          onSuccess={() => {}}
        />
      )}

      {/* Upload Replacement Document Modal */}
      {isUploadDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Upload Replacement Compliance Document</h3>
            <p className="text-xs text-slate-500">
              Uploading a replacement certificate automatically clears the expired/missing finding and re-runs validation rule RULE-005.
            </p>

            <form onSubmit={handleDocUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Document Category</label>
                <select
                  value={selectedDocCategory}
                  onChange={(e) => setSelectedDocCategory(e.target.value as VendorDocument['category'])}
                  className="w-full text-xs p-2 border border-slate-300 rounded"
                >
                  <option value="ISO_COMPLIANCE">ISO 9001 / Quality Compliance Certificate</option>
                  <option value="TAX_REGISTRATION">Tax Registration Certificate (W-8BEN-E / VAT)</option>
                  <option value="CERTIFICATE_OF_INCORPORATION">Certificate of Incorporation</option>
                  <option value="BANK_VERIFICATION_LETTER">Bank Verification Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={docUploadFileName}
                  onChange={(e) => setDocUploadFileName(e.target.value)}
                  placeholder="e.g. ISO_9001_Renewed_2026_2029.pdf"
                  className="w-full text-xs p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">New Expiry Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={docUploadExpiry}
                  onChange={(e) => setDocUploadExpiry(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadDocOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 shadow-xs"
                >
                  Confirm Upload & Revalidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
