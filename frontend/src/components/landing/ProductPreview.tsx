import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, FileText, ShieldAlert, CheckCircle2, Clock, AlertTriangle, 
  TrendingUp, Database, Users, Zap, Eye, Menu, X, ChevronRight, ShieldCheck, Search
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ProductPreviewProps {
  className?: string;
}

const sampleVendors = [
  { id: 'VND-2026-1001', name: 'Apex Industrial Supplies', country: 'IN', category: 'Industrial Equipment', status: 'IN_REVIEW', risk: 'MEDIUM', score: 35, discrepancies: 1 },
  { id: 'VND-2026-1002', name: 'Nordic Logistics OY', country: 'FI', category: 'Logistics', status: 'APPROVED', risk: 'LOW', score: 10, discrepancies: 0 },
  { id: 'VND-2026-1003', name: 'Acme Global Construction', country: 'GB', category: 'Construction', status: 'IN_REVIEW', risk: 'HIGH', score: 70, discrepancies: 1 },
  { id: 'VND-2026-1004', name: 'Vanguard Heavy Machinery', country: 'US', category: 'Industrial Equipment', status: 'AWAITING_VENDOR', risk: 'MEDIUM', score: 45, discrepancies: 1 },
  { id: 'VND-2026-1005', name: 'Kyoto Precision Instruments', country: 'JP', category: 'Defense & Aerospace', status: 'IN_REVIEW', risk: 'CRITICAL', score: 88, discrepancies: 1 },
  { id: 'VND-2026-1006', name: 'BioChem Labs GMBH', country: 'DE', category: 'Chemicals', status: 'AWAITING_VENDOR', risk: 'MEDIUM', score: 40, discrepancies: 1 },
  { id: 'VND-2026-1007', name: 'Pacific Freight & Haulage', country: 'AU', category: 'Logistics', status: 'APPROVED', risk: 'HIGH', score: 65, discrepancies: 1 },
  { id: 'VND-2026-1008', name: 'Solaria Clean Energy', country: 'CA', category: 'Engineering & Energy', status: 'IN_REVIEW', risk: 'LOW', score: 20, discrepancies: 0 },
];

const sampleActivity = [
  { time: '09:42', event: 'Vendor registration received', vendor: 'Solaria Clean Energy', type: 'registration', status: 'new' },
  { time: '09:38', event: 'Documentation submitted', vendor: 'BioChem Labs GMBH', type: 'documents', status: 'submitted' },
  { time: '09:35', event: 'Verification completed', vendor: 'Nordic Logistics OY', type: 'verification', status: 'completed' },
  { time: '09:31', event: 'Risk review initiated', vendor: 'Acme Global Construction', type: 'risk', status: 'in_progress' },
  { time: '09:28', event: 'Approval pending', vendor: 'Apex Industrial Supplies', type: 'approval', status: 'pending' },
  { time: '09:24', event: 'Bank change hold activated', vendor: 'Pacific Freight & Haulage', type: 'security', status: 'hold' },
  { time: '09:20', event: 'Review recorded', vendor: 'Vanguard Heavy Machinery', type: 'review', status: 'completed' },
];

const riskDistribution = [
  { level: 'LOW', count: 3, color: '#10B981' },
  { level: 'MEDIUM', count: 2, color: '#F59E0B' },
  { level: 'HIGH', count: 2, color: '#EF4444' },
  { level: 'CRITICAL', count: 1, color: '#7C2D12' },
];

const statusColors = {
  APPROVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  IN_REVIEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  AWAITING_VENDOR: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SUBMITTED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  REJECTED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const riskColors = {
  LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  HIGH: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  CRITICAL: 'bg-rose-900/30 text-rose-400 border-rose-900/50',
};

export function ProductPreview({ className = '' }: ProductPreviewProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = React.useState<'vendors' | 'risk' | 'activity'>('vendors');

  const tabs = [
    { id: 'vendors', label: 'Vendor Directory', icon: Building2, count: sampleVendors.length },
    { id: 'risk', label: 'Risk Intelligence', icon: ShieldAlert, count: riskDistribution.reduce((a, b) => a + b.count, 0) },
    { id: 'activity', label: 'Activity Monitor', icon: Database, count: sampleActivity.length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      className={`relative glass-strong rounded-3xl border border-surface-glass-border overflow-hidden ${className}`}
      role="region"
      aria-label="VendorIQ platform preview"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-5 border-b border-surface-glass-border bg-surface-glass">
        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/60" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>

        {/* Title */}
        <div className="flex-1 text-center">
          <span className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">
            vendoriq.dashboard.procurement.ops
          </span>
        </div>

        {/* Search */}
        <div className="relative w-48">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search vendors, apps, risks..."
            className="w-full pl-10 pr-3 py-1.5 text-xs bg-bg-elevated border border-surface-glass-border rounded-lg text-text-primary placeholder-text-muted focus:border-electric-lime focus:outline-none focus:ring-1 focus:ring-electric-lime/30 transition-all"
            readOnly
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-surface-glass-border bg-surface-glass/50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap relative ${
              activeTab === tab.id
                ? 'text-electric-lime bg-bg-primary'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-glass'
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-glass border border-surface-glass-border">
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-electric-lime"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 md:p-5 h-[520px] overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'vendors' && (
            <motion.div
              key="vendors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Master Vendor Directory</h3>
                <span className="badge badge-lime">LIVE DATA</span>
              </div>
              <div className="flex-1 overflow-hidden rounded-xl bg-bg-primary/50 border border-surface-glass-border">
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b border-surface-glass-border bg-surface-glass">
                      <th className="px-3 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider text-xs">ID</th>
                      <th className="px-3 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider text-xs">Vendor</th>
                      <th className="px-3 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider text-xs hidden sm:table-cell">Country</th>
                      <th className="px-3 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider text-xs hidden md:table-cell">Category</th>
                      <th className="px-3 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider text-xs">Status</th>
                      <th className="px-3 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider text-xs">Risk</th>
                      <th className="px-3 py-2.5 text-right font-medium text-text-muted uppercase tracking-wider text-xs">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-glass-border">
                    {sampleVendors.map((vendor, index) => (
                      <motion.tr
                        key={vendor.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: prefersReducedMotion ? 0 : index * 0.04, duration: 0.3 }}
                        className="hover:bg-surface-glass transition-colors cursor-pointer"
                        whileHover={{ backgroundColor: 'rgba(199, 208, 206, 0.06)' }}
                      >
                        <td className="px-3 py-2.5 font-mono text-text-muted">{vendor.id}</td>
                        <td className="px-3 py-2.5 font-medium text-text-primary">{vendor.name}</td>
                        <td className="px-3 py-2.5 text-text-secondary hidden sm:table-cell">
                          <span className="font-mono uppercase">{vendor.country}</span>
                        </td>
                        <td className="px-3 py-2.5 text-text-muted hidden md:table-cell">{vendor.category}</td>
                        <td className="px-3 py-2.5">
                          <span className={`badge ${statusColors[vendor.status as keyof typeof statusColors]}`}>
                            {vendor.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`badge ${riskColors[vendor.risk as keyof typeof riskColors]}`}>
                            {vendor.risk}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-semibold text-text-primary">
                          {vendor.score}
                          {vendor.discrepancies > 0 && (
                            <span className="ml-1.5 text-xs text-amber-400">⚠ {vendor.discrepancies}</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'risk' && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Risk Distribution & Intelligence</h3>
                <span className="badge badge-lime">12-RULE ENGINE</span>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                {/* Risk Distribution Chart */}
                <div className="col-span-2 lg:col-span-1 glass rounded-2xl p-5 border border-surface-glass-border">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Risk Level Breakdown</h4>
                  <div className="space-y-3">
                    {riskDistribution.map((risk, index) => (
                      <motion.div
                        key={risk.level}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '100%' }}
                        transition={{ delay: prefersReducedMotion ? 0 : index * 0.08, duration: 0.5 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{risk.level}</span>
                          <span className="text-xs font-mono text-text-muted">{risk.count} vendors</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-bg-primary border border-surface-glass-border overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(risk.count / 8) * 100}%` }}
                            transition={{ delay: prefersReducedMotion ? 0 : 0.3 + index * 0.08, duration: 0.6 }}
                            className="h-full rounded-full transition-all"
                            style={{ backgroundColor: risk.color }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Risk Details */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="glass rounded-2xl p-4 border border-surface-glass-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">Auto-Approval Eligible</p>
                        <p className="text-xs text-text-muted">3 vendors with zero discrepancies</p>
                      </div>
                    </div>
                    <div className="text-xs text-text-muted space-y-1">
                      <div className="flex justify-between"><span>Rules Passing</span><span className="font-mono">12/12</span></div>
                      <div className="flex justify-between"><span>Manual Review Required</span><span className="font-mono">0</span></div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-4 border border-surface-glass-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">Active Exceptions</p>
                        <p className="text-xs text-text-muted">4 vendors requiring review</p>
                      </div>
                    </div>
                    <div className="text-xs text-text-muted space-y-1">
                      <div className="flex justify-between"><span>Name Mismatch</span><span className="font-mono text-amber-400">1</span></div>
                      <div className="flex justify-between"><span>Duplicate Registration</span><span className="font-mono text-rose-400">1</span></div>
                      <div className="flex justify-between"><span>Expired Document</span><span className="font-mono text-amber-400">1</span></div>
                      <div className="flex justify-between"><span>Watchlist Flag</span><span className="font-mono text-rose-400">1</span></div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-4 border border-surface-glass-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-electric-lime/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-electric-lime" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">Bank Change Surveillance</p>
                        <p className="text-xs text-text-muted">1 active 72-hr security hold</p>
                      </div>
                    </div>
                    <div className="text-xs text-text-muted">
                      Pacific Freight & Haulage — Dual-control verification pending
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Operational Activity Monitor</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-400/20" />
                  <span className="text-xs font-mono text-text-muted">LIVE</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3" role="log" aria-live="polite">
                {sampleActivity.map((activity, index) => (
                  <motion.div
                    key={activity.time}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.06, duration: 0.3 }}
                    className="flex items-start gap-3 p-3 glass rounded-xl border border-surface-glass-border group hover:border-electric-lime/30 transition-colors"
                  >
                    <div className="flex-shrink-0 w-20 text-right">
                      <span className="font-mono text-xs text-text-muted">{activity.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-text-primary">{activity.event}</span>
                        <span className={`badge ${activity.type === 'security' ? 'badge-danger' : activity.type === 'approval' ? 'badge-warning' : activity.type === 'risk' ? 'badge-info' : 'badge-lime'}`}>
                          {activity.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">{activity.vendor}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        activity.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        activity.status === 'hold' ? 'bg-rose-500/20 text-rose-400' :
                        activity.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        activity.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-surface-glass text-text-muted'
                      }`}>
                        {activity.status.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-surface-glass-border bg-surface-glass/50 text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Connected to Terybi Global Enterprise
          </span>
          <span className="flex items-center gap-1.5">
            <Database className="w-3 h-3" />
            8 vendors • 3 active reviews
          </span>
        </div>
        <span className="font-mono">Last sync: <span className="text-text-secondary">Just now</span></span>
      </div>
    </motion.div>
  );
}

// Simple Search Icon
function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}