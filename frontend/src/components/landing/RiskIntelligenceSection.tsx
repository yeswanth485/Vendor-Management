import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, XCircle, 
  Clock, Lock, Phone, Eye, Zap, BarChart3,
  TrendingUp, Database, Users, FileText
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface RiskIntelligenceSectionProps {
  className?: string;
}

const riskLevels = [
  { level: 'LOW', range: '0-24', color: '#10B981', description: 'Clean submission, all rules passing, zero discrepancies. Eligible for accelerated approval.', count: 3 },
  { level: 'MEDIUM', range: '25-49', color: '#F59E0B', description: 'Minor warnings or single discrepancy (e.g., name alias). Requires reviewer confirmation.', count: 2 },
  { level: 'HIGH', range: '50-74', color: '#EF4444', description: 'Multiple rule failures or significant discrepancies (duplicate registration, expired docs). Manual review mandatory.', count: 2 },
  { level: 'CRITICAL', range: '75-100', color: '#7C2D12', description: 'Watchlist match, sanctions alert, or critical identity mismatch. Director-level sign-off required.', count: 1 },
];

const edgeCases = [
  {
    id: 'name-mismatch',
    title: 'Edge Case A: Name Mismatch',
    rule: 'RULE-006',
    description: 'Legal entity "Apex Industrial Supplies Private Limited" vs bank account "Apex Industrial Supplies". Trading alias detected. Similarity: 87%.',
    severity: 'MEDIUM',
    resolution: 'Reviewer confirms with bank letter or DBA documentation.',
    status: 'NEEDS_REVIEW',
  },
  {
    id: 'duplicate-reg',
    title: 'Edge Case B: Duplicate Registration',
    rule: 'RULE-007',
    description: 'Companies House #08492014 matches existing vendor "Acme Buildcorp Ltd". Different contact email & banking coordinates.',
    severity: 'HIGH',
    resolution: 'Authorized reviewer must link, merge, or reject redundant filing.',
    status: 'FAIL',
  },
  {
    id: 'expired-doc',
    title: 'Edge Case C: Expired Compliance Document',
    rule: 'RULE-005B',
    description: 'ISO 9001 certificate expired 2026-08-15 (73 days ago). Policy requires current active certification.',
    severity: 'HIGH',
    resolution: 'Automated notification dispatched. Awaiting vendor renewal upload.',
    status: 'FAIL',
  },
  {
    id: 'bank-change',
    title: 'Edge Case D: Bank Change Surveillance',
    rule: 'RULE-011 + SEC-BANK-04',
    description: 'Vendor requested bank change 2 days before $184K disbursement. Existing verified ANZ account preserved. 72-hr fraud hold active.',
    severity: 'HIGH',
    resolution: 'Independent verbal callback to verified CFO number (+61 2 9234 5678) + MFA step-up required.',
    status: 'PENDING_HOLD',
  },
];

const riskMetrics = [
  { label: 'Rules Engine', value: '12', description: 'Deterministic validation rules' },
  { label: 'Risk Tiers', value: '4', description: 'Low, Medium, High, Critical' },
  { label: 'Auto-Scoring', value: '0-100', description: 'Weighted risk calculation' },
  { label: 'Explainability', value: '100%', description: 'Every decision auditable' },
];

export function RiskIntelligenceSection({ className = '' }: RiskIntelligenceSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="risk-intelligence"
      className={`section relative ${className}`}
      aria-labelledby="risk-heading"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-glass border border-surface-glass-border text-xs font-semibold text-rose-400 uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse-glow" style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)' }} />
            RISK & COMPLIANCE INTELLIGENCE
          </span>
          <h2 id="risk-heading" className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-text-primary mb-6">
            <span className="gradient-text">Risk Assessment</span> Powered by a 12-Rule Deterministic Engine
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Every vendor application is evaluated against 12 explainable validation rules. 
            Risk scores (0-100) and tiers (LOW/MEDIUM/HIGH/CRITICAL) are calculated instantly 
            with full auditability — no black-box AI, no hidden logic.
          </p>
        </motion.div>

        {/* Risk Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {riskMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: prefersReducedMotion ? 0 : index * 0.06, duration: 0.4 }}
              className="glass rounded-2xl p-6 border border-surface-glass-border text-center"
            >
              <p className="font-display font-extrabold text-4xl md:text-5xl text-text-primary mb-1">{metric.value}</p>
              <p className="font-semibold text-text-primary mb-1">{metric.label}</p>
              <p className="text-xs text-text-muted">{metric.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Risk Level Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="font-display font-bold text-2xl text-text-primary mb-8 text-center">Risk Level Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {riskLevels.map((risk, index) => (
              <motion.article
                key={risk.level}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: prefersReducedMotion ? 0 : index * 0.08, duration: 0.5 }}
                className={`relative glass rounded-3xl p-6 md:p-8 border overflow-hidden ${risk.level === 'CRITICAL' ? 'border-rose-900/30' : 'border-surface-glass-border'}`}
              >
                {/* Color Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: risk.color }} />

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`font-display font-extrabold text-3xl px-3 py-1 rounded-xl ${risk.level === 'CRITICAL' ? 'bg-rose-900/30 text-rose-400 border border-rose-900/50' : 'bg-surface-glass text-text-primary border border-surface-glass-border'}`}>
                      {risk.level}
                    </span>
                    <span className="ml-3 font-mono text-xs text-text-muted">Score: {risk.range}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-3xl text-text-primary">{risk.count}</p>
                    <p className="text-xs text-text-muted">Sample Vendors</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-secondary text-sm leading-relaxed mb-6">{risk.description}</p>

                {/* Visual Indicator */}
                <div className="h-2 rounded-full bg-bg-primary border border-surface-glass-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(riskLevels.indexOf(risk) + 1) / riskLevels.length * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.3 + index * 0.1, duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: risk.color }}
                  />
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* Edge Cases */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="font-display font-bold text-2xl text-text-primary mb-8 text-center">Real-World Edge Cases Handled</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {edgeCases.map((edgeCase, index) => (
              <motion.article
                key={edgeCase.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: prefersReducedMotion ? 0 : index * 0.08, duration: 0.5 }}
                className="glass rounded-3xl p-6 border border-surface-glass-border hover:border-electric-lime/30 transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${edgeCase.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : edgeCase.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {edgeCase.severity === 'CRITICAL' ? <XCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display font-bold text-lg text-text-primary">{edgeCase.title}</h4>
                      <span className={`badge ${edgeCase.severity === 'CRITICAL' ? 'badge-danger' : edgeCase.severity === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>
                        {edgeCase.severity}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-electric-lime">{edgeCase.rule}</span>
                  </div>
                </div>

                <p className="text-text-secondary text-sm mb-4">{edgeCase.description}</p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Lock className="w-3.5 h-3.5" />
                    <span><strong>Resolution:</strong> {edgeCase.resolution}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${edgeCase.status === 'FAIL' ? 'badge-danger' : edgeCase.status === 'NEEDS_REVIEW' ? 'badge-warning' : 'badge-info'}`}>
                      {edgeCase.status.replace('_', ' ')}
                    </span>
                    <span className="text-text-muted">Engine Status</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* Risk Visualization - Sample Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 glass rounded-3xl p-6 md:p-8 border border-surface-glass-border"
        >
          <h3 className="font-display font-bold text-2xl text-text-primary mb-6 text-center">Sample Risk Distribution (8 Vendors)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {riskLevels.map((risk, index) => (
              <motion.div
                key={risk.level}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.4 + index * 0.06, duration: 0.4 }}
                className="text-center"
              >
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg viewBox="0 0 128 128" className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="rgba(199, 208, 206, 0.15)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke={risk.color}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 56 * (risk.count / 8)}
                      strokeDashoffset={2 * Math.PI * 56}
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - risk.count / 8) }}
                      viewport={{ once: true }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.5 + index * 0.08, duration: 0.8 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display font-extrabold text-3xl text-text-primary">{risk.count}</span>
                  </div>
                </div>
                <p className="font-semibold text-text-primary capitalize">{risk.level.toLowerCase()} risk</p>
                <p className="text-xs text-text-muted mt-1">{risk.range} score range</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}