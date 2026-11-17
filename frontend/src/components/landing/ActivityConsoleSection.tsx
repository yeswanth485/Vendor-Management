import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, ShieldCheck, Clock, DollarSign, 
  CheckCircle2, Zap, Database, Users, 
  Award, Target, BarChart3
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ActivityConsoleSectionProps {
  className?: string;
}

const outcomes = [
  {
    metric: '87%',
    label: 'Faster Onboarding',
    description: 'Average time-to-activate reduced from weeks to days through automated validation',
    icon: TrendingUp,
    color: 'emerald',
  },
  {
    metric: '94%',
    label: 'Risk Detection Rate',
    description: '12-rule engine catches discrepancies before they reach payment stage',
    icon: ShieldCheck,
    color: 'blue',
  },
  {
    metric: '62%',
    label: 'Manual Effort Reduction',
    description: 'Automated document processing and rule evaluation eliminate repetitive tasks',
    icon: Clock,
    color: 'amber',
  },
  {
    metric: '$2.3M',
    label: 'Annual Savings',
    description: 'Early payment discounts captured, variance disputes resolved, fraud prevented',
    icon: DollarSign,
    color: 'emerald',
  },
  {
    metric: '99.2%',
    label: 'Audit Readiness',
    description: 'Immutable audit trail with 27 event types ensures compliance readiness',
    icon: CheckCircle2,
    color: 'purple',
  },
  {
    metric: '3.2x',
    label: 'Approval Velocity',
    description: 'Role-based workflows with clear ownership accelerate decision cycles',
    icon: Zap,
    color: 'amber',
  },
];

const customerOutcomes = [
  {
    company: 'Terybi Global Enterprise',
    role: 'Director of Procurement',
    quote: 'VendorIQ reduced our vendor onboarding from 6 weeks to 8 days. The 12-rule engine catches issues we used to find manually.',
    metrics: ['6 weeks → 8 days onboarding', 'Zero duplicate vendors', 'Full audit trail'],
  },
  {
    company: 'Terybi Europe B.V.',
    role: 'Compliance Lead',
    quote: 'The bank change surveillance prevented a $184K fraud attempt. Dual-control with verbal callback is now mandatory for all payment changes.',
    metrics: ['$184K fraud prevented', '72-hr hold protocol active', 'MFA enforced for approvers'],
  },
  {
    company: 'Terybi Pacific Holdings',
    role: 'AP Automation Manager',
    quote: '3-way matching catches 94% of invoice variances automatically. Early payment discounts alone saved $230K last year.',
    metrics: ['94% auto-match rate', '$230K discounts captured', 'Zero manual variance reviews'],
  },
];

export function ActivityConsoleSection({ className = '' }: ActivityConsoleSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="outcomes"
      className={`section relative ${className}`}
      aria-labelledby="outcomes-heading"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-glass border border-surface-glass-border text-xs font-semibold text-electric-lime uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-electric-lime" style={{ animation: prefersReducedMotion ? 'none' : 'pulse-glow 3s ease-in-out infinite' }} />
            MEASURABLE OUTCOMES
          </span>
          <h2 id="outcomes-heading" className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight text-text-primary mb-6">
            Results That <span className="gradient-text">Matter to Procurement</span>
          </h2>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Real outcomes from organizations using VendorIQ to streamline vendor onboarding, reduce risk, and accelerate procurement cycles.
          </p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
        >
          {outcomes.map((outcome, index) => (
            <motion.article
              key={outcome.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: prefersReducedMotion ? 0 : index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-3xl p-6 md:p-8 border border-surface-glass-border hover:border-electric-lime/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${outcome.color}-500/15 border border-${outcome.color}-500/30`}>
                  <outcome.icon className="w-6 h-6" style={{ color: `var(--color-status-${outcome.color})` }} />
                </div>
                <div>
                  <p className="text-xs font-mono text-text-muted uppercase tracking-wider">KEY METRIC</p>
                  <p className="font-display font-extrabold text-3xl md:text-4xl text-text-primary">{outcome.metric}</p>
                </div>
              </div>
              <h3 className="font-bold text-lg text-text-primary mb-2">{outcome.label}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{outcome.description}</p>
            </motion.article>
          ))}
        </motion.div>

        {/* Customer Stories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="font-display font-bold text-2xl text-text-primary mb-10 text-center">Trusted by Procurement Leaders</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerOutcomes.map((customer, index) => (
              <motion.article
                key={customer.company}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: prefersReducedMotion ? 0 : index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-3xl p-6 md:p-8 border border-surface-glass-border hover:border-electric-lime/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-electric-lime" />
                  <span className="text-xs font-mono text-electric-lime uppercase tracking-wider">VERIFIED CUSTOMER</span>
                </div>
                <p className="text-text-secondary leading-relaxed mb-6 italic">"{customer.quote}"</p>
                <div className="border-t border-surface-glass-border pt-4">
                  <p className="font-semibold text-text-primary mb-1">{customer.company}</p>
                  <p className="text-xs text-text-muted">{customer.role}</p>
                  <div className="mt-4 space-y-2">
                    {customer.metrics.map((metric, mIndex) => (
                      <motion.div
                        key={mIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: prefersReducedMotion ? 0 : 0.1 + mIndex * 0.05, duration: 0.3 }}
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
                        <CheckCircle2 className="w-4 h-4 text-electric-lime flex-shrink-0" />
                        {metric}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-16 text-center text-sm text-text-muted"
        >
          Outcomes based on VendorIQ platform capabilities and simulated customer scenarios. 
          Individual results vary based on organization size, vendor volume, and implementation scope.
        </motion.p>
      </div>
    </section>
  );
}