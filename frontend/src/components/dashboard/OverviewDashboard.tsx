import React from 'react';
import { VendorApplication, Vendor, AuditEvent, FollowUpItem } from '../../types';
import { StatusBadge, RiskBadge, CountryFlag } from '../common/Badge';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ArrowRight,
  Lock,
  FileCheck2,
  TrendingUp,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

interface OverviewDashboardProps {
  applications: VendorApplication[];
  vendors: Vendor[];
  auditEvents: AuditEvent[];
  followUps: FollowUpItem[];
  onSelectApplication: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export function OverviewDashboard({
  applications,
  vendors,
  auditEvents,
  followUps,
  onSelectApplication,
  onNavigateToTab,
}: OverviewDashboardProps) {
  // Key Manager Metrics
  const pendingDecisions = applications.filter(a => a.status === 'IN_REVIEW' || a.status === 'SUBMITTED');
  const approvedTotal = applications.filter(a => a.status === 'APPROVED').length;
  const securityHolds = vendors.filter(v => v.hasActiveBankChangeHold).length;

  // Urgent Manager Queue (items needing immediate sign-off or resolution)
  const urgentQueue = applications.filter(a => 
    (a.status === 'IN_REVIEW' || a.status === 'SUBMITTED') ||
    a.discrepancies.some(d => !d.resolved)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Executive Welcome & Key Focus Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-xl p-6 border border-slate-800 shadow-md">
        {/* Ambient Gradient Blur */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-indigo-300 font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>EXECUTIVE PROCUREMENT COCKPIT</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-normal">Real-Time Risk & AP Orchestration</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Procurement Operations Overview
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              <strong className="text-amber-300 font-semibold">{pendingDecisions.length} filings</strong> require review. Dual-control security holds and 3-way matching automated.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateToTab('review_queue')}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <span>Open Review Queue ({pendingDecisions.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* 4 Essential Manager KPIs with Top Accent Color Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigateToTab('review_queue')}
          className="relative bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer hover:shadow-md hover:border-amber-300 transition-all overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold text-slate-600">Awaiting Decision</span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{pendingDecisions.length}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Ready for manager triage</p>
        </motion.div>

        {/* KPI 2 */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigateToTab('risk_exceptions')}
          className="relative bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer hover:shadow-md hover:border-rose-300 transition-all overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold text-slate-600">Security Bank Holds</span>
            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{securityHolds}</span>
            {securityHolds > 0 && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full animate-pulse">
                Active Freeze
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">72-hr payment lockout</p>
        </motion.div>

        {/* KPI 3 */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigateToTab('invoices_ap')}
          className="relative bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold text-slate-600">AP 3-Way Matched</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">$18,400</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Ready for disbursement</p>
        </motion.div>

        {/* KPI 4 */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigateToTab('vendors')}
          className="relative bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold text-slate-600">Vendor Master</span>
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{approvedTotal} Active</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">SLA-governed suppliers</p>
        </motion.div>
      </div>

      {/* AP & Cash Flow Action Strip with Gradient Accents */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-xl p-4.5 flex flex-wrap items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                Accounts Payable Reconciliation Active
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                2% Early-Payment Discount Available
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              3-way reconciliation verified $18,400 for release. 2 invoice variances require manager review ($368 discount capture available).
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigateToTab('invoices_ap')}
          className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          Manage Invoices & Payments <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Immediate Attention: Manager Action Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Applications Requiring Manager Action
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review exceptions, verify identity discrepancies, and grant final disbursement approvals.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('review_queue')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            View All ({applications.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {urgentQueue.map((app) => {
            const disc = app.discrepancies.find(d => !d.resolved);
            const isApproved = app.status === 'APPROVED';

            return (
              <motion.div
                key={app.id}
                whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}
                onClick={() => onSelectApplication(app.id)}
                className="p-4 cursor-pointer transition-colors flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                {/* Vendor Identity */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <CountryFlag code={app.company.country} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{app.company.legalName}</span>
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                        {app.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {app.company.vendorCategory} • Contact: {app.company.contactName} ({app.company.contactEmail})
                    </p>
                  </div>
                </div>

                {/* Key Finding for Manager */}
                <div className="flex-1 max-w-md">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider mb-0.5">
                    Triage Note
                  </span>
                  {disc ? (
                    <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80 block truncate">
                      {disc.title}
                    </span>
                  ) : isApproved ? (
                    <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 block truncate">
                      12 validation rules certified
                    </span>
                  ) : (
                    <span className="text-slate-600 text-[11px] font-normal block truncate">
                      Statutory documents verified; awaiting sign-off.
                    </span>
                  )}
                </div>

                {/* Risk and Status */}
                <div className="flex items-center gap-2.5">
                  <RiskBadge level={app.riskLevel} score={app.riskScore} />
                  <StatusBadge status={app.status} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectApplication(app.id);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
