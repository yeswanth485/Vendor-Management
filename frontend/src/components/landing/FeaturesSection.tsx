import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, FileText, ShieldCheck, ShieldAlert, 
  CheckCircle2, Eye, Zap, Database, Users, 
  Clock, Lock, RotateCcw, Search, Link, 
  BarChart3, FileCheck2, AlertTriangle, 
  Smartphone, Globe, Layers, GraduationCap, ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FeaturesSectionProps {
  className?: string;
}

const features = [
  {
    category: 'Onboarding',
    icon: Building2,
    items: [
      {
        title: '5-Step Application Wizard',
        description: 'Guided vendor self-service portal capturing legal identity, tax registration, banking coordinates, and statutory documents with real-time validation.',
        icon: FileText,
      },
      {
        title: 'Multi-Jurisdiction Support',
        description: 'Native support for 8 countries (US, GB, IN, DE, AU, CA, FI, JP) with country-specific tax ID formats, banking identifiers, and required documents.',
        icon: Globe,
      },
      {
        title: 'Automated Format Validation',
        description: 'Regex-based validation for business registration numbers, tax identifiers (EIN, VAT, GSTIN, ABN), and banking codes (routing, SWIFT, IBAN, IFSC, BSB).',
        icon: ShieldCheck,
      },
    ],
  },
  {
    category: 'Document Intelligence',
    icon: FileCheck2,
    items: [
      {
        title: 'OCR-Assisted Extraction',
        description: 'Server-side OCR extracts legal names, registration numbers, tax IDs, and account details from uploaded certificates and bank letters.',
        icon: Search,
      },
      {
        title: 'Cross-Document Consistency',
        description: 'Rule engine compares extracted document data against form submissions, flagging discrepancies in tax IDs, entity names, and account holder names.',
        icon: Link,
      },
      {
        title: 'Expiry Tracking & Alerts',
        description: 'Automated monitoring of certificate expiration dates (ISO, tax, insurance) with 60/30/7-day advance notifications to vendors and reviewers.',
        icon: AlertTriangle,
      },
    ],
  },
  {
    category: 'Risk & Compliance',
    icon: ShieldAlert,
    items: [
      {
        title: '12-Rule Deterministic Engine',
        description: 'Explainable validation rules covering completeness, identity, tax, banking, compliance, duplicates, and risk triggers. Every decision is auditable.',
        icon: Zap,
      },
      {
        title: 'Name Mismatch Detection',
        description: 'Fuzzy matching (Levenshtein + Jaccard) compares legal entity name vs bank account holder name. Flags trading aliases vs registered names.',
        icon: Users,
      },
      {
        title: 'Duplicate Registration Check',
        description: 'Cross-application detection of identical business registration numbers within the same jurisdiction. Prevents duplicate vendor master records.',
        icon: RotateCcw,
      },
      {
        title: 'Bank Account Uniqueness',
        description: 'Identifies reused IBAN/account numbers across vendors. Critical for preventing payment diversion and Business Email Compromise (BEC).',
        icon: Lock,
      },
      {
        title: 'Watchlist & Sanctions Screening',
        description: 'Enhanced due diligence triggers for high-risk categories (defense, chemicals, construction) and entity screening against designated review lists.',
        icon: AlertTriangle,
      },
    ],
  },
  {
    category: 'Review & Approval',
    icon: CheckCircle2,
    items: [
      {
        title: 'Role-Based Review Queue',
        description: 'Triage pool with claim/release, filters (my claimed, unassigned, high risk), search, and real-time notifications. Reviewers see explainable rule results.',
        icon: Layers,
      },
      {
        title: 'Side-by-Side Document Review',
        description: 'Split-view document comparison with extracted data overlay. Reviewers verify OCR results against source PDFs in a single interface.',
        icon: Search,
      },
      {
        title: 'Discrepancy Resolution Workflow',
        description: 'Structured resolution for name mismatches, duplicate registrations, expired docs, and missing mandatories. Each resolution logged in audit trail.',
        icon: RotateCcw,
      },
      {
        title: 'Dual-Control Bank Changes',
        description: '72-hour mandatory fraud hold on bank detail changes. Requires independent verbal callback verification + MFA step-up before approval.',
        icon: Lock,
      },
      {
        title: 'MFA Step-Up Authentication',
        description: 'TOTP-based MFA enforcement for approvers on sensitive actions (bank changes, high-value approvals). Configurable per role and action type.',
        icon: Smartphone,
      },
    ],
  },
  {
    category: 'Analytics & Oversight',
    icon: BarChart3,
    items: [
      {
        title: 'Vendor 360 Scorecards',
        description: 'Performance tiers (Strategic/Preferred/Standard/Probation) with weighted composite scores: on-time delivery, invoice accuracy, SLA achievement, quality.',
        icon: BarChart3,
      },
      {
        title: 'SLA Breach & Service Credits',
        description: 'Contractual SLA monitoring with automated breach detection, penalty calculation, and AP credit memo generation for invoice offset.',
        icon: FileCheck2,
      },
      {
        title: 'Immutable Audit Trail',
        description: 'Tamper-proof event log capturing every action: submissions, reviews, overrides, approvals, rejections, bank changes, with actor, timestamp, and evidence.',
        icon: ShieldCheck,
      },
      {
        title: 'AP Automation & 3-Way Matching',
        description: 'Invoice ingestion with PO/GRN matching, variance flagging (price/quantity), early payment discount capture, and automated payment batch release.',
        icon: Zap,
      },
    ],
  },
];

const categoryColors = {
  Onboarding: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' },
  'Document Intelligence': { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'text-emerald-400' },
  'Risk & Compliance': { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-400', icon: 'text-rose-400' },
  'Review & Approval': { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  'Analytics & Oversight': { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-400' },
};

export function FeaturesSection({ className = '' }: FeaturesSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<number | null>(0);

  return (
    <section
      id="features"
      className={`section relative ${className}`}
      aria-labelledby="features-heading"
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
            PLATFORM CAPABILITIES
          </span>
          <h2 id="features-heading" className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight text-text-primary mb-6">
            Capabilities Across the <span className="gradient-text">Vendor Lifecycle</span>
          </h2>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Five integrated modules covering the full vendor lifecycle — from initial registration 
            through ongoing performance monitoring and risk oversight.
          </p>
        </motion.div>

        {/* Category Tabs (Desktop) / Accordion (Mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
          role="tablist"
          aria-label="Feature categories"
        >
          {/* Desktop: Tabs */}
          <div className="hidden lg:flex flex-wrap justify-center gap-3">
            {features.map((category, index) => (
              <button
                key={category.category}
                role="tab"
                aria-selected={activeCategory === index}
                onClick={() => setActiveCategory(index)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === index
                    ? 'bg-electric-lime text-ink-black shadow-glow-lime-sm'
                    : 'bg-surface-glass text-text-secondary hover:text-text-primary hover:bg-surface-glass-strong border border-surface-glass-border'
                }`}
              >
                <span className="flex items-center gap-2">
                  <category.icon 
                    className="w-4 h-4" 
                    style={{ color: `var(--color-${categoryColors[category.category as keyof typeof categoryColors].icon.replace('text-', '')})` }} 
                  />
                  {category.category}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile: Accordion */}
          <div className="lg:hidden space-y-3">
            {features.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : index * 0.05, duration: 0.3 }}
              >
                <button
                  onClick={() => setActiveCategory(activeCategory === index ? null : index)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                    activeCategory === index
                      ? 'bg-electric-lime/10 text-electric-lime border border-electric-lime/30'
                      : 'bg-surface-glass text-text-primary hover:bg-surface-glass-strong border border-surface-glass-border'
                  }`}
                  aria-expanded={activeCategory === index}
                >
                  <span className="flex items-center gap-2">
                    <category.icon 
                      className="w-5 h-5" 
                      style={{ color: `var(--color-${categoryColors[category.category as keyof typeof categoryColors].icon.replace('text-', '')})` }} 
                    />
                    {category.category}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform ${activeCategory === index ? 'rotate-180' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {activeCategory === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 pl-11 border-l border-surface-glass-border space-y-3"
                    >
                      {category.items.map((feature, featIndex) => (
                        <motion.article
                          key={`${category.category}-${feature.title}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: prefersReducedMotion ? 0 : featIndex * 0.04, duration: 0.3 }}
                          className="group relative glass rounded-2xl p-5 border hover:border-electric-lime/30 transition-all"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            className="w-10 h-10 rounded-xl bg-electric-lime/15 border border-electric-lime/30 flex items-center justify-center mb-3"
                          >
                            <feature.icon className="w-5 h-5" style={{ color: `var(--color-${categoryColors[category.category as keyof typeof categoryColors].icon.replace('text-', '')})` }} />
                          </motion.div>
                          <h3 className="font-semibold text-text-primary mb-1">{feature.title}</h3>
                          <p className="text-sm text-text-secondary">{feature.description}</p>
                        </motion.article>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Grid (Desktop only) */}
        {activeCategory !== null && (
          <div className="hidden lg:grid lg:grid-cols-1 lg:md:grid-cols-2 lg:lg:grid-cols-3 gap-6">
            {features[activeCategory].items.map((feature, featIndex) => (
            <motion.article
              key={`${features[activeCategory].category}-${feature.title}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ 
                delay: prefersReducedMotion ? 0 : featIndex * 0.05, 
                duration: 0.4, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className={`group relative glass rounded-3xl p-6 md:p-8 border ${categoryColors[features[activeCategory].category as keyof typeof categoryColors].border} hover:border-electric-lime/40 hover:shadow-glow-lime-sm transition-all duration-300`}
            >
              {/* Category Badge */}
              <div className="absolute top-5 right-5">
                <span className={`text-xs font-mono px-2 py-1 rounded-full ${categoryColors[features[activeCategory].category as keyof typeof categoryColors].bg} ${categoryColors[features[activeCategory].category as keyof typeof categoryColors].text} border ${categoryColors[features[activeCategory].category as keyof typeof categoryColors].border}`}>
                  {features[activeCategory].category.toUpperCase()}
                </span>
              </div>

              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${categoryColors[features[activeCategory].category as keyof typeof categoryColors].bg}`}
              >
                <feature.icon className="w-5 h-5" style={{ color: `var(--color-${categoryColors[features[activeCategory].category as keyof typeof categoryColors].icon.replace('text-', '')})` }} />
              </motion.div>

              {/* Content */}
              <h3 className="font-bold text-lg text-text-primary mb-2 group-hover:text-electric-lime transition-colors">
                {feature.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">{feature.description}</p>

              {/* Hover Accent */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                whileHover={{ opacity: 1, width: '48px' }}
                className="absolute bottom-5 left-5 right-auto h-1 bg-electric-lime transition-all duration-300 overflow-hidden"
              />
            </motion.article>
          ))}
        </div>
      )}
      </div>
    </section>
  );
}