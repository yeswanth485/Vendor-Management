import React, { useState } from 'react';
import { motion } from 'motion/react';
import { VendorApplication, ApplicationStatus, RiskLevel } from '../../types';
import { StatusBadge, RiskBadge, CountryFlag } from '../common/Badge';
import { Search, Filter, ArrowUpDown, ChevronRight, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { AppStorage } from '../../lib/storage';

interface ApplicationListProps {
  applications: VendorApplication[];
  onSelectApplication: (id: string) => void;
  onNewApplication: () => void;
}

export function ApplicationList({ applications, onSelectApplication, onNewApplication }: ApplicationListProps) {
  const storage = AppStorage.getInstance();
  const currentUser = storage.getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'risk' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter & Search
  const filtered = applications.filter((app) => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.businessRegistrationNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || app.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date') {
      const timeA = new Date(a.submittedAt).getTime();
      const timeB = new Date(b.submittedAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    }
    if (sortBy === 'risk') {
      return sortOrder === 'desc' ? b.riskScore - a.riskScore : a.riskScore - b.riskScore;
    }
    if (sortBy === 'name') {
      return sortOrder === 'desc' 
        ? b.company.legalName.localeCompare(a.company.legalName)
        : a.company.legalName.localeCompare(b.company.legalName);
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-indigo-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              IN-FLIGHT SUBMISSIONS
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Vendor Applications</h2>
            <p className="text-xs text-slate-500">
              Active onboarding submissions undergoing automated explainable rule verification and reviewer triage.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={onNewApplication}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-lg shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all"
          >
            + New Application
          </motion.button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, name, email, reg #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/70 text-slate-900"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Statuses ({applications.length})</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="AWAITING_VENDOR">Awaiting Vendor Info</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUBMITTED">Submitted</option>
            </select>
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk (Watchlist/Sanctions)</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="date">Sort: Submission Date</option>
              <option value="risk">Sort: Risk Score</option>
              <option value="name">Sort: Company Name</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Company Name & Country</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk Evaluation</th>
                <th className="py-3 px-4">Assigned Reviewer</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No vendor applications match the filter criteria.
                  </td>
                </tr>
              ) : (
                sorted.map((app) => {
                  const unresolvedCount = app.discrepancies.filter(d => !d.resolved).length;
                  const isClaimedByMe = app.assignedReviewerId === currentUser.id;

                  return (
                    <tr
                      key={app.id}
                      onClick={() => onSelectApplication(app.id)}
                      className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {app.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <CountryFlag code={app.company.country} />
                          <div>
                            <p className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">{app.company.legalName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">Reg: {app.company.businessRegistrationNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {app.company.vendorCategory}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <RiskBadge level={app.riskLevel} score={app.riskScore} />
                          {unresolvedCount > 0 && (
                            <span className="block text-[10px] text-amber-700 font-semibold">
                              ⚠️ {unresolvedCount} exception(s)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {app.assignedReviewerName ? (
                          <span className={`inline-flex items-center gap-1 font-semibold ${isClaimedByMe ? 'text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60' : 'text-slate-700'}`}>
                            {isClaimedByMe ? '★ You' : app.assignedReviewerName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApplication(app.id);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/80 hover:border-indigo-600 transition-all inline-flex items-center gap-1 shadow-2xs group"
                        >
                          Review <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white transition-colors" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
