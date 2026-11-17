import React from 'react';
import { motion } from 'motion/react';
import { 
  FileQuestion, FolderOpen, Clock, ShieldAlert, 
  AlertTriangle, Search, Link, RotateCcw, 
  Database, Users, Zap, Eye, Lock, FileX
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ProblemSectionProps {
  className?: string;
}

const problems = [
  {
    id: 'fragmented',
    title: 'Fragmented Vendor Data',
    description: 'Vendor information scattered across emails, spreadsheets, ERP systems, and shared drives. No single source of truth for procurement teams.',
    icon: Database,
    impact: 'High',
    metric: 'Data silos slow down every procurement decision',
  },
  {
    id: 'manual-onboarding',
    title: 'Manual Onboarding Workflows',
    description: 'Paper-based or email-driven vendor registration creates bottlenecks. Onboarding takes weeks with repeated back-and-forth.',
    icon: FolderOpen,
    impact: 'Critical',
    metric: 'Weeks of manual effort per vendor',
  },
  {
    id: 'document-chaos',
    title: 'Document Collection Chaos',
    description: 'Statutory documents (incorporation, tax, bank letters) arrive in inconsistent formats. Manual verification is error-prone and slow.',
    icon: FileQuestion,
    impact: 'High',
    metric: 'Frequent re-submissions delay activation',
  },
  {
    id: 'approval-delays',
    title: 'Opaque Approval Cycles',
    description: 'Review queues lack visibility. Stakeholders don\'t know status, required actions, or blockers. Decisions stall without accountability.',
    icon: Clock,
    impact: 'Critical',
    metric: 'Approval cycles stretch without clear ownership',
  },
  {
    id: 'risk-blindness',
    title: 'Limited Risk Visibility',
    description: 'No systematic risk scoring. High-risk vendors (sanctions, duplicate registrations, bank fraud) slip through undetected until payment issues arise.',
    icon: ShieldAlert,
    impact: 'Critical',
    metric: 'Risk signals missed until after payment',
  },
  {
    id: 'renewal-gaps',
    title: 'Missed Expirations & Renewals',
    description: 'Expired ISO certificates, tax registrations, and insurance go unnoticed. Compliance gaps expose the organization to regulatory and operational risk.',
    icon: AlertTriangle,
    impact: 'High',
    metric: 'Expired certificates slip through unnoticed',
  },
];

const impactColors = {
  Critical: { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-400', iconBg: 'bg-rose-500/20' },
  High: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', iconBg: 'bg-amber-500/20' },
  Medium: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', iconBg: 'bg-blue-500/20' },
};

export function ProblemSection({ className = '' }: ProblemSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="problem"
      className={`section relative ${className}`}
      aria-labelledby="problem-heading"
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-glass border border-surface-glass-border text-xs font-semibold text-electric-lime uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-electric-lime animate-pulse-glow" />
            COMMON VENDOR MANAGEMENT CHALLENGES
          </span>
          <h2 id="problem-heading" className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight text-text-primary mb-6">
            Why Vendor Management Needs a <span className="gradient-text">Modern Approach</span>
          </h2>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Most organizations rely on fragmented tools and manual processes that create blind spots, 
            delays, and compliance risks. Here are the six challenges VendorIQ addresses.
          </p>
        </motion.div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <motion.article
              key={problem.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: prefersReducedMotion ? 0 : index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative glass rounded-3xl p-6 md:p-8 border ${impactColors[problem.impact as keyof typeof impactColors].border} hover:border-electric-lime/40 hover:shadow-glow-lime-sm transition-all duration-500`}
              role="listitem"
            >
              {/* Impact Badge */}
              <div className="absolute top-6 right-6">
                <span className={`badge ${impactColors[problem.impact as keyof typeof impactColors].text.replace('text-', 'bg-').replace('400', '500/20')} ${impactColors[problem.impact as keyof typeof impactColors].text} border-${impactColors[problem.impact as keyof typeof impactColors].border.split('-')[1]}-${impactColors[problem.impact as keyof typeof impactColors].border.split('/')[1]}`}>
                  {problem.impact} Impact
                </span>
              </div>

              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                transition={{ duration: 0.3 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${impactColors[problem.impact as keyof typeof impactColors].iconBg}`}
              >
                <problem.icon className="w-7 h-7" style={{ color: `var(--color-status-${problem.impact.toLowerCase()})` }} />
              </motion.div>

              {/* Content */}
              <h3 className="font-display font-bold text-xl text-text-primary mb-3 group-hover:text-electric-lime transition-colors">
                {problem.title}
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">{problem.description}</p>

              {/* Metric */}
              <div className="pt-4 border-t border-surface-glass-border flex items-center gap-2">
                <Search className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-mono text-text-muted">{problem.metric}</span>
              </div>

              {/* Hover Indicator */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-electric-lime to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}