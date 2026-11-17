import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, CheckCircle2, ShieldCheck, Zap, Database, Users, FileText, Lock, Eye, Globe } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FAQSectionProps {
  className?: string;
}

const faqs = [
  {
    question: 'What is VendorIQ and who is it for?',
    answer: 'VendorIQ is an enterprise vendor onboarding and risk management platform designed for procurement teams, finance departments, and compliance officers. It streamlines the entire vendor lifecycle — from self-service registration through document verification, risk scoring, approval workflows, and ongoing performance monitoring. Organizations with 50+ vendors or complex multi-jurisdiction requirements benefit most.',
    category: 'General',
  },
  {
    question: 'How does the vendor onboarding process work?',
    answer: 'Vendors complete a guided 5-step wizard: (1) Company Information — legal identity, contact details, business registration; (2) Tax Registration — country-specific tax ID (EIN, VAT, GSTIN, ABN) with format validation; (3) Banking Details — account holder name, bank, IBAN/account number, routing codes; (4) Documents — upload incorporation certificate, tax registration, bank verification letter; (5) Review & Submit — final validation against 12 deterministic rules before entering the review queue.',
    category: 'Onboarding',
  },
  {
    question: 'Which countries and jurisdictions are supported?',
    answer: 'VendorIQ natively supports 8 countries with country-specific validation: United States (EIN, Routing), United Kingdom (VAT, Sort Code), India (GSTIN, IFSC), Germany (USt-IdNr, IBAN), Australia (ABN, BSB), Canada (BN/RT, Transit), Finland (ALV, IBAN), Japan (Corporate Number, Bank Code). Each jurisdiction has configured tax ID regex, banking identifiers, and required document types.',
    category: 'Onboarding',
  },
  {
    question: 'How does the risk scoring engine work?',
    answer: 'A deterministic 12-rule engine evaluates every application instantly. Rules cover: completeness, contact format, tax ID format, business registration format, document presence, document expiry, name vs bank account matching, duplicate registration detection, bank account uniqueness, banking identifier consistency, cross-document consistency, bank verification evidence, and watchlist/high-risk category screening. Each rule produces PASS/WARNING/FAIL/NEEDS_REVIEW with severity. Weighted scoring (0-100) determines risk tier: LOW (0-24), MEDIUM (25-49), HIGH (50-74), CRITICAL (75-100).',
    category: 'Risk',
  },
  {
    question: 'What happens when a risk discrepancy is found?',
    answer: 'Discrepancies are categorized (name mismatch, duplicate registration, expired document, missing mandatory doc, suspicious bank change, watchlist flag) and routed to the review queue. Reviewers claim applications, inspect side-by-side document comparisons, read explainable rule results, and resolve discrepancies with documented notes. Resolutions are logged in the immutable audit trail. Some discrepancies (e.g., name mismatch) auto-verify banking once resolved.',
    category: 'Risk',
  },
  {
    question: 'How are approval decisions made and controlled?',
    answer: 'Role-based workflow: Reviewers (triage & inspect) → Approvers (final approve/reject) → Administrators (full access). Approvers must provide mandatory rejection reasons. Manual overrides on rule results require documented justification and are audited. MFA step-up (TOTP) enforced for sensitive actions: bank changes, high-value approvals. Dual-control protocol for bank detail changes: 72-hour fraud hold + independent verbal callback verification.',
    category: 'Approval',
  },
  {
    question: 'Can VendorIQ handle bank account changes securely?',
    answer: 'Yes. Edge Case D (Bank Change Surveillance) implements a mandatory 72-hour fraud hold when vendors request payment instruction changes. The existing verified account remains active. Change requires: (1) Independent verbal callback to verified corporate phone number, (2) MFA step-up authentication for approver, (3) Detailed verification notes logged, (4) Approver certification. Only then is the new account activated and the hold released.',
    category: 'Security',
  },
  {
    question: 'What document types are managed and how are they verified?',
    answer: 'Three mandatory document categories per jurisdiction: Certificate of Incorporation, Tax Registration, Bank Verification Letter. Optional: ISO Compliance, Insurance. OCR-assisted extraction pulls legal names, registration numbers, tax IDs, account holder names, and expiry dates. Cross-document consistency checks compare extracted data against form submissions. Expiry dates tracked with 60/30/7-day automated notifications.',
    category: 'Documents',
  },
  {
    question: 'Does VendorIQ support different user roles and permissions?',
    answer: 'Five built-in roles with granular permissions: Vendor (portal access only, submit applications, view own status), Reviewer (claim/release queue, inspect applications, resolve discrepancies, request info), Approver (final approve/reject, MFA step-up, bank change certification), Administrator (full access, rules config, user management, tenant settings), Auditor (read-only audit trail, export compliance reports). RBAC enforced at API and UI level.',
    category: 'Security',
  },
  {
    question: 'How is vendor data protected and isolated?',
    answer: 'Multi-tenant architecture with strict logical isolation. Each organization (e.g., Terybi Global, Terybi Europe, Terybi APAC) has completely separate vendor masters, applications, audit trails, and configurations. Data encrypted in transit (TLS 1.3) and at rest (AES-256). Bank account numbers masked in all UI views (••••••••4892). PII minimized in logs. Immutable append-only audit trail with 27 event types captures every action with actor, timestamp, before/after values, and evidence.',
    category: 'Security',
  },
  {
    question: 'What ongoing monitoring and analytics are available?',
    answer: 'Vendor 360 Scorecards with performance tiers (Strategic/Preferred/Standard/Probation) and composite scores: on-time delivery, invoice accuracy, SLA achievement, quality. Contract management with SLA breach detection, automated penalty calculation, and AP credit memo generation. Bank change surveillance with 72-hour holds. Automated renewal notifications for contracts and compliance certificates. Immutable audit trail for compliance reporting.',
    category: 'Analytics',
  },
];

const categories = ['All', 'General', 'Onboarding', 'Risk', 'Approval', 'Security', 'Documents', 'Analytics'];

export function FAQSection({ className = '' }: FAQSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className={`section relative ${className}`}
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-glass border border-surface-glass-border text-xs font-semibold text-electric-lime uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-electric-lime animate-pulse-glow" />
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 id="faq-heading" className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-text-primary mb-6">
            Everything You Need to Know About <span className="gradient-text">VendorIQ</span>
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Based on actual platform capabilities. No hypothetical features — only what's implemented and verified.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
          role="tablist"
          aria-label="FAQ categories"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(0); }}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat 
                ? 'bg-electric-lime text-ink-black shadow-glow-lime-sm' 
                : 'bg-surface-glass text-text-secondary hover:text-text-primary hover:bg-surface-glass-strong border border-surface-glass-border'}`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-4"
        >
          {filteredFaqs.map((faq, index) => (
            <motion.article
              key={`${faq.category}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : index * 0.05, duration: 0.4 }}
              className="glass rounded-2xl border border-surface-glass-border overflow-hidden hover:border-electric-lime/30 transition-all"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left focus:outline-none focus:ring-2 focus:ring-electric-lime/50 focus:ring-offset-2 focus:ring-offset-bg-primary"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-electric-lime/15 border border-electric-lime/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-electric-lime" />
                  </span>
                  <span className="font-semibold text-text-primary pr-4">{faq.question}</span>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 text-electric-lime"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 border-t border-surface-glass-border bg-surface-glass/30"
                  >
                    <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-text-secondary mb-6 max-w-xl mx-auto">
            Didn't find your answer? Our team is ready to help with technical questions, 
            compliance requirements, or implementation planning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:security@terybi.com" className="btn btn-secondary px-8 py-3">
              Email Security Team
            </a>
            <a href="#contact" className="btn btn-primary px-8 py-3">
              Request Technical Deep-Dive
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}