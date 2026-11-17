import React, { useState } from 'react';
import { VendorApplication } from '../../types';
import { StatusBadge, RiskBadge, CountryFlag } from '../common/Badge';
import { AppStorage } from '../../lib/storage';
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserMinus, 
  ChevronRight, 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  Sparkles,
  Inbox
} from 'lucide-react';

interface ReviewQueueProps {
  applications: VendorApplication[];
  onSelectApplication: (id: string) => void;
}

export function ReviewQueue({ applications, onSelectApplication }: ReviewQueueProps) {
  const storage = AppStorage.getInstance();
  const currentUser = storage.getCurrentUser();
  const [queueTab, setQueueTab] = useState<'all_pending' | 'my_claimed' | 'unassigned' | 'high_risk'>('all_pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Triage filter logic
  const filtered = applications.filter((app) => {
    // Only pending/in_review/awaiting items belong in the operational review queue
    const isOperational = app.status !== 'APPROVED' && app.status !== 'REJECTED';
    if (!isOperational) return false;

    const matchesSearch = 
      app.company.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.country.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (queueTab === 'my_claimed') {
      return app.assignedReviewerId === currentUser.id;
    }
    if (queueTab === 'unassigned') {
      return !app.assignedReviewerId;
    }
    if (queueTab === 'high_risk') {
      return app.riskLevel === 'HIGH' || app.riskLevel === 'CRITICAL';
    }
    return true;
  });

  const handleClaim = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    storage.claimApplication(appId);
  };

  const handleRelease = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    storage.releaseApplication(appId);
  };

  return (
    <div className="space-y-4">
      {/* Queue Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Review & Verification Queue
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active procurement triage pool. Claim filings, inspect explainable rule results, and verify statutory documents.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <span>Logged in as:</span>
            <span className="font-bold text-blue-700">{currentUser.name} ({currentUser.role.toUpperCase()})</span>
          </div>
        </div>

        {/* Queue Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setQueueTab('all_pending')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                queueTab === 'all_pending' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Open Items ({applications.filter(a => a.status !== 'APPROVED' && a.status !== 'REJECTED').length})
            </button>

            <button
              onClick={() => setQueueTab('my_claimed')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                queueTab === 'my_claimed' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Claimed by Me ({applications.filter(a => a.assignedReviewerId === currentUser.id && a.status !== 'APPROVED' && a.status !== 'REJECTED').length})
            </button>

            <button
              onClick={() => setQueueTab('unassigned')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                queueTab === 'unassigned' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Unassigned Pool ({applications.filter(a => !a.assignedReviewerId && a.status !== 'APPROVED' && a.status !== 'REJECTED').length})
            </button>

            <button
              onClick={() => setQueueTab('high_risk')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                queueTab === 'high_risk' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              High & Critical Risk ({applications.filter(a => (a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL') && a.status !== 'APPROVED' && a.status !== 'REJECTED').length})
            </button>
          </div>

          <div className="relative w-64 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search queue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Queue Cards / Rows */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-slate-200">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Queue is Clear</p>
            <p className="text-xs text-slate-500">No applications currently match this queue filter.</p>
          </div>
        ) : (
          filtered.map((app) => {
            const isClaimedByMe = app.assignedReviewerId === currentUser.id;
            const unresolvedCount = app.discrepancies.filter(d => !d.resolved).length;
            const failedRules = app.validationResults.filter(r => r.status === 'FAIL');

            return (
              <div
                key={app.id}
                onClick={() => onSelectApplication(app.id)}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-lg p-4 shadow-xs cursor-pointer transition-all space-y-3 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {app.id}
                    </span>
                    <CountryFlag code={app.company.country} />
                    <h3 className="text-xs font-bold text-slate-900">{app.company.legalName}</h3>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-xs text-slate-500">{app.company.vendorCategory}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <RiskBadge level={app.riskLevel} score={app.riskScore} />
                    <StatusBadge status={app.status} />

                    {isClaimedByMe ? (
                      <button
                        onClick={(e) => handleRelease(e, app.id)}
                        className="px-2.5 py-1 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 rounded flex items-center gap-1 font-medium"
                      >
                        <UserMinus className="w-3.5 h-3.5 text-slate-400" />
                        Release
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleClaim(e, app.id)}
                        className="px-2.5 py-1 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded flex items-center gap-1 font-medium shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Claim Task
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Assigned Officer</span>
                    <span className={`font-medium ${isClaimedByMe ? 'text-blue-700 font-bold' : 'text-slate-800'}`}>
                      {app.assignedReviewerName || 'None (In Pool)'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Primary Finding</span>
                    <span className="font-medium text-slate-800 truncate block">
                      {app.discrepancies.find(d => !d.resolved)?.title || 'Standard statutory document verification'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Rule Verification State</span>
                    <span className="font-mono text-slate-700">
                      {failedRules.length > 0 ? (
                        <strong className="text-rose-600 font-bold">{failedRules.length} rule failure(s)</strong>
                      ) : (
                        <span className="text-emerald-700 font-medium">All baseline rules passing</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                  <span>
                    Submitted: {new Date(app.submittedAt).toLocaleDateString()} • {app.documents.length} statutory files attached
                  </span>
                  <span className="text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                    Open Inspector Workspace <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
