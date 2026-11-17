import React, { useState } from 'react';
import { FollowUpItem, VendorApplication } from '../../types';
import { AppStorage } from '../../lib/storage';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  FileText,
  Search
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface FollowUpManagerProps {
  followUps: FollowUpItem[];
  applications: VendorApplication[];
  onSelectApplication: (id: string) => void;
}

export function FollowUpManager({ followUps, applications, onSelectApplication }: FollowUpManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<FollowUpItem | null>(null);

  const filtered = followUps.filter(f => 
    f.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyLink = (item: FollowUpItem) => {
    navigator.clipboard?.writeText(item.securePortalUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Automated Vendor Communications & Follow-ups
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dispatches structured requests for missing statutory certificates and clarification evidence with secure self-service portal links.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <span>Provider:</span>
            <span className="font-mono text-emerald-700 font-bold">Resend API (Simulated Webhook Active)</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative pt-2 border-t border-slate-100 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-4.5" />
          <input
            type="text"
            placeholder="Search follow-ups by vendor, email, application ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Follow-up Queue */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-slate-200">
            <Mail className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No Follow-ups Found</p>
            <p className="text-xs text-slate-500">There are no pending or dispatched notifications matching your query.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {item.id}
                  </span>
                  <button
                    onClick={() => onSelectApplication(item.applicationId)}
                    className="font-mono text-xs text-slate-500 hover:text-blue-600 underline"
                  >
                    {item.applicationId}
                  </button>
                  <h3 className="text-xs font-bold text-slate-900">{item.vendorName}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Delivered via Resend Simulation
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.sentAt ? new Date(item.sentAt).toLocaleString() : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-800">{item.subject}</p>
                <p className="text-slate-500 font-mono text-[11px]">
                  Recipient: <span className="text-slate-700">{item.recipientEmail}</span> • Dispatched by {item.sentBy}
                </p>
              </div>

              {/* Outstanding requested items checklist */}
              {item.missingItems && item.missingItems.length > 0 && (
                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded text-xs space-y-1">
                  <span className="font-bold text-purple-900 text-[11px] uppercase tracking-wide block">
                    Outstanding Information Requested:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-purple-800 text-[11px]">
                    {item.missingItems.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer with portal link and email preview button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Secure Vendor Portal URL:</span>
                  <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] text-slate-700">
                    {item.securePortalUrl}
                  </code>
                  <button
                    onClick={() => handleCopyLink(item)}
                    className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                    title="Copy Link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedId === item.id && (
                    <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPreview(item)}
                  className="px-3 py-1 text-xs border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-medium flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Inspect Email Body
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Email Body Inspector Modal */}
      {selectedPreview && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPreview(null)}
          title={`Email Preview: ${selectedPreview.subject}`}
          description={`Simulated Resend API delivery to ${selectedPreview.recipientEmail}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1 font-mono">
              <p><span className="text-slate-500">From:</span> Terybi Procurement Operations &lt;procure@terybi.com&gt;</p>
              <p><span className="text-slate-500">To:</span> {selectedPreview.recipientEmail}</p>
              <p><span className="text-slate-500">Subject:</span> {selectedPreview.subject}</p>
              <p><span className="text-slate-500">Timestamp:</span> {selectedPreview.sentAt}</p>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded overflow-x-auto whitespace-pre-wrap max-h-72">
              {selectedPreview.body}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
