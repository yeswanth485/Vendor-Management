import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, FileText, ShieldCheck, ShieldAlert, 
  CheckCircle2, Eye, ArrowRight, ChevronRight, 
  Zap, Database, Users, Clock, Lock, RotateCcw
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface WorkflowSectionProps {
  className?: string;
}

const workflowSteps = [
  {
    id: 'registration',
    number: '01',
    title: 'Vendor Registration',
    description: 'Vendors submit applications through a guided 5-step wizard capturing legal identity, tax registration, banking details, and statutory documents.',
    icon: Building2,
    features: [
      'Multi-jurisdiction support (8 countries)',
      'Real-time validation & format checking',
      'Auto-save draft progress',
      'Vendor self-service portal',
    ],
    metrics: { duration: '< 15 min', rules: '4/12', automation: '95%' },
    preview: (
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2 text-xs">
          {['Company', 'Tax ID', 'Banking', 'Documents', 'Review'].map((step, i) => (
            <div key={step} className={`px-3 py-2 rounded-lg text-center font-medium ${
              i <= 1 ? 'bg-electric-lime/20 text-electric-lime border border-electric-lime/30' : 
              i === 2 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
              'bg-surface-glass text-text-muted border border-surface-glass-border'
            }`}>
              {step}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            4/12 Rules Passing
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
            <Zap className="w-3 h-3" />
            Auto-validated
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'documentation',
    number: '02',
    title: 'Document Collection',
    description: 'OCR-assisted document ingestion extracts and validates data from incorporation certificates, tax registrations, and bank verification letters.',
    icon: FileText,
    features: [
      'Automated OCR data extraction',
      'Format validation (PDF, PNG, JPG)',
      'Expiry date tracking & alerts',
      'Cross-field consistency checks',
    ],
    metrics: { duration: 'Real-time', rules: '2/12', automation: '90%' },
    preview: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Incorporation', status: 'verified', type: 'OCR_ASSISTED' },
            { name: 'Tax Registration', status: 'verified', type: 'OCR_ASSISTED' },
            { name: 'Bank Letter', status: 'pending', type: 'MANUAL_REVIEW' },
          ].map((doc) => (
            <div key={doc.name} className={`p-3 rounded-xl text-center ${doc.status === 'verified' ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-amber-500/15 border-amber-500/30'} border`}>
              <p className="font-medium text-sm">{doc.name}</p>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${doc.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {doc.status.toUpperCase()}
              </span>
              <span className="text-[10px] text-text-muted block mt-1">{doc.type}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'verification',
    number: '03',
    title: 'Verification & Review',
    description: 'Reviewers inspect applications in a dedicated workspace with side-by-side document comparison, rule explanations, and discrepancy resolution tools.',
    icon: ShieldCheck,
    features: [
      'Claim/release review queue',
      'Side-by-side document viewer',
      'Explainable rule results (12 rules)',
      'Discrepancy resolution workflow',
    ],
    metrics: { duration: '2-5 days', rules: '6/12', automation: '60%' },
    preview: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-surface-glass border border-surface-glass-border">
            <p className="text-xs text-text-muted uppercase tracking-wide">Rule Results</p>
            <div className="space-y-1.5 mt-2">
              {[
                { rule: 'RULE-001', status: 'PASS' },
                { rule: 'RULE-006', status: 'NEEDS_REVIEW' },
                { rule: 'RULE-007', status: 'FAIL' },
                { rule: 'RULE-012', status: 'PASS' },
              ].map((r) => (
                <div key={r.rule} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-text-muted">{r.rule}</span>
                  <span className={`badge ${r.status === 'PASS' ? 'badge-success' : r.status === 'NEEDS_REVIEW' ? 'badge-warning' : 'badge-danger'}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-glass border border-surface-glass-border">
            <p className="text-xs text-text-muted uppercase tracking-wide">Discrepancies</p>
            <div className="space-y-1.5 mt-2">
              <span className="badge badge-warning text-xs">Name Mismatch</span>
              <span className="badge badge-danger text-xs">Duplicate Registration</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'risk-assessment',
    number: '04',
    title: 'Risk Assessment',
    description: 'Deterministic 12-rule engine calculates risk scores (0-100) and assigns risk levels (LOW/MEDIUM/HIGH/CRITICAL) with full explainability.',
    icon: ShieldAlert,
    features: [
      '12 validation rules evaluated',
      'Weighted risk scoring (0-100)',
      '4-tier risk classification',
      'Watchlist & sanctions screening',
    ],
    metrics: { duration: 'Instant', rules: '12/12', automation: '100%' },
    preview: (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-glass border border-surface-glass-border">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide">Risk Score</p>
            <p className="font-display font-extrabold text-4xl text-text-primary">72</p>
          </div>
          <div className="text-right">
            <span className="badge badge-danger text-lg px-4 py-1.5">HIGH RISK</span>
            <p className="text-xs text-text-muted mt-1">Threshold: 50</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Completeness', score: 100, color: 'emerald' },
            { label: 'Identity', score: 60, color: 'amber' },
            { label: 'Tax', score: 100, color: 'emerald' },
            { label: 'Banking', score: 30, color: 'rose' },
          ].map((item) => (
            <div key={item.label} className={`p-3 rounded-xl bg-${item.color}-500/15 border border-${item.color}-500/30`}>
              <p className="text-xs text-text-muted">{item.label}</p>
              <p className="font-display font-bold text-2xl text-${item.color}-400">{item.score}%</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'approval',
    number: '05',
    title: 'Approval Decision',
    description: 'Role-based approval workflow with dual-control for sensitive changes. Approvers review rule results, discrepancies, and audit trail before deciding.',
    icon: CheckCircle2,
    features: [
      'RBAC: Reviewer → Approver → Admin',
      'MFA step-up for bank changes',
      'Mandatory rejection reasons',
      'Manual override with audit trail',
    ],
    metrics: { duration: '1-3 days', rules: 'N/A', automation: '40%' },
    preview: (
      <div className="space-y-3">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-glass border border-surface-glass-border">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Ready for Approval</p>
            <p className="text-sm text-text-muted">All baseline rules passing • 1 discrepancy resolved</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-primary py-3 text-sm">Approve</button>
          <button className="btn btn-secondary py-3 text-sm">Request Info</button>
        </div>
      </div>
    ),
  },
  {
    id: 'oversight',
    number: '06',
    title: 'Ongoing Oversight',
    description: 'Continuous monitoring with Vendor 360 scorecards, SLA breach detection, contract renewal tracking, and automated bank change surveillance.',
    icon: Eye,
    features: [
      'Vendor 360 performance scorecards',
      'SLA breach & service credit automation',
      '72-hr bank change fraud hold',
      'Automated renewal notifications',
    ],
    metrics: { duration: 'Continuous', rules: 'N/A', automation: '85%' },
    preview: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Active Vendors', value: '247', trend: '+12%', color: 'emerald' },
            { label: 'Open Reviews', value: '8', trend: '-3', color: 'blue' },
            { label: 'SLA Breaches', value: '2', trend: '0', color: 'rose' },
            { label: 'Bank Holds', value: '1', trend: '+1', color: 'amber' },
          ].map((metric) => (
            <div key={metric.label} className={`p-3 rounded-xl bg-${metric.color}-500/15 border border-${metric.color}-500/30`}>
              <p className="text-xs text-text-muted">{metric.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-2xl text-${metric.color}-400">{metric.value}</span>
                <span className={`text-xs font-mono ${metric.trend.startsWith('+') ? 'text-emerald-400' : metric.trend.startsWith('-') ? 'text-rose-400' : 'text-text-muted'}`}>
                  {metric.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function WorkflowSection({ className = '' }: WorkflowSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  const stepNumbers = workflowSteps.map((_, i) => i);

  return (
    <section
      id="workflow"
      className={`section relative ${className}`}
      aria-labelledby="workflow-heading"
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
            HOW VENDORIQ WORKS
          </span>
          <h2 id="workflow-heading" className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-text-primary mb-6">
            From Registration to <span className="gradient-text">Ongoing Oversight</span> in 6 Steps
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Each step is powered by our deterministic rules engine, providing full transparency 
            and auditability at every stage of the vendor lifecycle.
          </p>
        </motion.div>

        {/* Workflow Stepper */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connecting Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block absolute top-14 left-1/2 -translate-x-1/2 w-1 h-[calc(100%-56px)] bg-gradient-to-b from-electric-lime/30 via-transparent to-electric-lime/30"
            aria-hidden="true"
          />

          {/* Steps */}
          <div className="space-y-12 lg:space-y-16">
            {workflowSteps.map((step, index) => {
              const isActive = activeStep === index;
              const isCompleted = activeStep > index;
              const isLeft = index % 2 === 0;

              return (
                <motion.article
                  key={step.id}
                  initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: prefersReducedMotion ? 0 : index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex flex-col lg:flex-row ${isLeft ? 'lg:items-end' : 'lg:items-start'} gap-8`}
                >
                  {/* Step Number & Icon */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`relative flex-shrink-0 w-28 lg:w-32 ${isLeft ? 'lg:pr-8 text-right' : 'lg:pl-8 text-left'}`}
                  >
                    <div className="relative z-10">
                      <motion.div
                        animate={{ 
                          backgroundColor: isActive 
                            ? 'var(--color-electric-lime)' 
                            : isCompleted 
                              ? 'var(--color-status-success)' 
                              : 'var(--color-bg-elevated)',
                          borderColor: isActive 
                            ? 'var(--color-electric-lime)' 
                            : isCompleted 
                              ? 'var(--color-status-success)' 
                              : 'var(--color-surface-glass-border)',
                        }}
                        transition={{ duration: 0.3 }}
                        className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-2xl border-2 flex items-center justify-center shadow-lg"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-10 h-10 text-ink-black" />
                        ) : (
                          <span className={`font-display font-extrabold text-4xl ${isActive ? 'text-ink-black' : 'text-text-muted'}`}>
                            {step.number}
                          </span>
                        )}
                        <step.icon className={`absolute -top-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-electric-lime text-ink-black' : 
                          isCompleted ? 'bg-emerald-500 text-white' : 
                          'bg-surface-glass text-text-muted border border-surface-glass-border'
                        }`} />
                      </motion.div>

                      {/* Pulse Ring when active */}
                      {isActive && !prefersReducedMotion && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-0 rounded-2xl border-2 border-electric-lime"
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Step Content */}
                  <motion.div
                    layout
                    className={`flex-1 w-full lg:w-1/2 ${isLeft ? 'lg:text-right' : ''}`}
                  >
                    <div className={`glass rounded-3xl p-6 md:p-8 border transition-all duration-300 ${
                      isActive ? 'border-electric-lime/40 shadow-glow-lime-sm' : 'border-surface-glass-border hover:border-electric-lime/20'
                    }`}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-electric-lime/20 text-electric-lime' : 'bg-surface-glass text-text-muted'}`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div className={isLeft ? 'text-right' : ''}>
                          <span className="text-xs font-mono text-electric-lime uppercase tracking-wider">Step {step.number}</span>
                          <h3 className="font-display font-bold text-2xl text-text-primary mt-1">{step.title}</h3>
                        </div>
                      </div>

                      <p className="text-text-secondary leading-relaxed mb-6">{step.description}</p>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        {step.features.map((feature, fIndex) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: prefersReducedMotion ? 0 : 0.2 + fIndex * 0.05 }}
                            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                          >
                            <motion.div
                              animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
                              transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                              className="w-1.5 h-1.5 rounded-full bg-electric-lime"
                            />
                            {feature}
                          </motion.div>
                        ))}
                      </div>

                      {/* Metrics */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-surface-glass-border">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-surface-glass border border-surface-glass-border rounded-full">
                            <Clock className="w-3 h-3 text-text-muted" />
                            <span className="font-mono text-text-primary">{step.metrics.duration}</span>
                          </span>
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-surface-glass border border-surface-glass-border rounded-full">
                            <Zap className="w-3 h-3 text-text-muted" />
                            <span className="font-mono text-text-primary">{step.metrics.automation} Auto</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted uppercase tracking-wide">Rules:</span>
                          <span className="font-mono font-semibold text-text-primary px-2 py-1 bg-surface-glass border border-surface-glass-border rounded">
                            {step.metrics.rules}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Preview Panel */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 + 0.2, duration: 0.5 }}
                    className={`hidden lg:block w-1/2 ${isLeft ? 'order-first' : 'order-last'}`}
                  >
                    <div className={`glass rounded-3xl p-5 border transition-all duration-300 ${isActive ? 'border-electric-lime/30 shadow-glow-lime-sm' : 'border-surface-glass-border'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Live Preview</span>
                        <span className="badge badge-lime">SAMPLE DATA</span>
                      </div>
                      {step.preview}
                    </div>
                  </motion.div>
                </motion.article>
              );
            })}
          </div>
        </div>

        {/* Mobile Stepper Controls */}
        <div className="lg:hidden mt-12 flex items-center justify-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="btn btn-secondary px-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Previous
          </motion.button>
          <div className="flex items-center gap-2">
            {workflowSteps.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveStep(index)}
                whileTap={{ scale: 1.2 }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === activeStep 
                    ? 'bg-electric-lime w-8' 
                    : 'bg-surface-glass-border hover:bg-electric-lime/50'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveStep(Math.min(workflowSteps.length - 1, activeStep + 1))}
            disabled={activeStep === workflowSteps.length - 1}
            className="btn btn-secondary px-6"
          >
            Next <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}