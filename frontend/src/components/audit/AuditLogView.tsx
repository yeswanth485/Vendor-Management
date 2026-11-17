import React, { useState } from 'react';
import { AuditEvent } from '../../types';
import { History, Search, Filter, ShieldCheck, Download, ArrowRight } from 'lucide-react';

interface AuditLogViewProps {
  auditEvents: AuditEvent[];
  onSelectApplication: (id: string) => void;
}

export function AuditLogView({ auditEvents, onSelectApplication }: AuditLogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filtered = auditEvents.filter(e => {
    const matchesSearch = 
      e.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.reason && e.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || e.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const exportAuditCsv = () => {
    const headers = ['Event ID', 'Timestamp', 'Application ID', 'Vendor Name', 'Actor', 'Role', 'Action', 'Previous Value', 'New Value', 'Reason', 'Evidence'];
    const rows = filtered.map(e => [
      e.id,
      e.timestamp,
      e.applicationId,
      `"${e.vendorName}"`,
      `"${e.actor.name}"`,
      e.actor.role,
      e.action,
      `"${e.previousValue || ''}"`,
      `"${e.newValue || ''}"`,
      `"${(e.reason || '').replace(/"/g, '""')}"`,
      `"${(e.evidence || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vendoriq_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Corporate Compliance & Security Audit Trail
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Append-only, immutable regulatory ledger logging all system evaluations, manual reviewer overrides, and disbursement approvals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAuditCsv}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export Audit CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail by actor, reason, application ID, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full py-1.5 px-2 border border-slate-200 rounded text-xs text-slate-700"
            >
              <option value="ALL">All Event Types ({auditEvents.length})</option>
              <option value="APPLICATION_APPROVED">Application Approved</option>
              <option value="APPLICATION_REJECTED">Application Rejected</option>
              <option value="MANUAL_OVERRIDE_APPLIED">Manual Override Applied</option>
              <option value="DISCREPANCY_RESOLVED">Discrepancy Resolved</option>
              <option value="BANK_CHANGE_VERIFIED">Bank Change Verified</option>
              <option value="BANK_CHANGE_REQUESTED">Bank Change Requested</option>
              <option value="VALIDATION_EVALUATED">Validation Evaluated</option>
              <option value="INFORMATION_REQUESTED">Information Requested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Stream */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit records match your query.
          </div>
        ) : (
          filtered.map((evt) => (
            <div key={evt.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {evt.id}
                  </span>
                  <button
                    onClick={() => onSelectApplication(evt.applicationId)}
                    className="font-mono font-bold text-blue-600 hover:text-blue-800 underline"
                  >
                    {evt.applicationId}
                  </button>
                  <span className="font-bold text-slate-900">{evt.vendorName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${
                    evt.action === 'APPLICATION_APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : evt.action === 'APPLICATION_REJECTED'
                      ? 'bg-rose-100 text-rose-800'
                      : evt.action === 'MANUAL_OVERRIDE_APPLIED'
                      ? 'bg-purple-100 text-purple-800'
                      : evt.action === 'BANK_CHANGE_VERIFIED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {evt.action.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-slate-700">
                <span className="text-slate-500 font-medium">Actor: </span>
                <strong className="text-slate-900">{evt.actor.name}</strong> ({evt.actor.email} • <span className="uppercase text-[11px] font-semibold text-blue-700">{evt.actor.role}</span>)
              </div>

              {evt.reason && (
                <div className="p-2.5 bg-slate-50 border border-slate-150 rounded text-slate-800">
                  <span className="font-semibold text-slate-600">Reason / Basis: </span>
                  {evt.reason}
                </div>
              )}

              {(evt.previousValue || evt.newValue) && (
                <div className="grid grid-cols-2 gap-3 font-mono text-[11px] bg-slate-50/80 p-2 rounded border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Previous Recorded State</span>
                    <span className="text-slate-700">{evt.previousValue || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">New Certified State</span>
                    <span className="text-blue-700 font-bold">{evt.newValue || 'N/A'}</span>
                  </div>
                </div>
              )}

              {evt.evidence && (
                <p className="text-[11px] font-mono text-slate-500">
                  Audit Evidence: {evt.evidence}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
