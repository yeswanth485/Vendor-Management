import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Lock, Database, Users, 
  Eye, FileText, CheckCircle2, Zap,
  Globe, Clock, Award, Fingerprint
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface TrustSectionProps {
  className?: string;
}

const trustPillars = [
  {
    id: 'authentication',
    title: 'Authentication & Access Control',
    description: 'Firebase Authentication with email/password, Google SSO, and configurable MFA (TOTP). Role-based access control with 5 distinct roles: Vendor, Reviewer, Approver, Administrator, Auditor.',
    icon: Fingerprint,
    features: ['Multi-factor authentication (TOTP)', 'Role-based permissions (RBAC)', 'Session management & timeout', 'Account lockout protection'],
    verified: true,
  },
  {
    id: 'data-protection',
    title: 'Data Protection & Encryption',
    description: 'All data encrypted in transit (TLS 1.3) and at rest (AES-256). Bank account numbers masked in UI (••••••••4892). PII minimized in logs and audit trails.',
    icon: Lock,
    features: ['TLS 1.3 in transit', 'AES-256 at rest', 'Bank account masking', 'PII minimization'],
    verified: true,
  },
  {
    id: 'tenant-isolation',
    title: 'Multi-Tenant Isolation',
    description: 'Strict tenant-level data isolation. Organizations (Terybi Global, Terybi Europe, Terybi APAC) operate with completely separate vendor masters, applications, and audit trails.',
    icon: Database,
    features: ['Logical data separation', 'Per-tenant encryption keys', 'Cross-tenant access prevention', 'Configurable data residency'],
    verified: true,
  },
  {
    id: 'audit-trail',
    title: 'Immutable Audit Trail',
    description: 'Every action logged with actor, timestamp, previous/new values, reason, and evidence. 27 event types tracked. Tamper-proof append-only log with cryptographic integrity.',
    icon: FileText,
    features: ['27 event types tracked', 'Actor + timestamp + evidence', 'Cryptographic integrity', 'Export for compliance'],
    verified: true,
  },
  {
    id: 'document-security',
    title: 'Secure Document Handling',
    description: 'Statutory documents (incorporation, tax, bank letters) uploaded via secure channels. OCR processing in isolated environment. Document expiry tracking with automated alerts.',
    icon: ShieldCheck,
    features: ['Encrypted upload & storage', 'Isolated OCR processing', 'Expiry date monitoring', 'Access logging per document'],
    verified: true,
  },
  {
    id: 'compliance',
    title: 'Compliance Readiness',
    description: 'Architecture aligned with SOC 2 Type II, GDPR, ISO 27001, and PCI DSS requirements. Deterministic rules engine provides explainable decisions for regulatory audits.',
    icon: Award,
    features: ['SOC 2 Type II aligned', 'GDPR compliant design', 'ISO 27001 controls', 'Explainable decisions'],
    verified: false,
  },
];

const securityFeatures = [
  { icon: ShieldCheck, title: 'Zero Trust Architecture', desc: 'Never trust, always verify. Every request authenticated and authorized.' },
  { icon: Lock, title: 'End-to-End Encryption', desc: 'TLS 1.3 for all communications. AES-256 for stored data.' },
  { icon: Fingerprint, title: 'MFA Enforcement', desc: 'Configurable per role and action. TOTP with backup codes.' },
  { icon: Eye, title: 'Complete Visibility', desc: 'Immutable audit log captures every system interaction.' },
  { icon: Clock, title: 'Session Management', desc: 'Automatic timeout, concurrent session limits, remote revocation.' },
  { icon: Globe, title: 'Global Compliance', desc: 'Data residency options. GDPR, CCPA, PDPA considerations built-in.' },
];

export function TrustSection({ className = '' }: TrustSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="security"
      className={`section relative ${className}`}
      aria-labelledby="trust-heading"
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
            SECURITY & TRUST
          </span>
          <h2 id="trust-heading" className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-text-primary mb-6">
            Enterprise-Grade <span className="gradient-text">Security & Compliance</span>
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Built on a zero-trust architecture with multi-factor authentication, 
            tenant isolation, and an immutable audit trail. Every design decision 
            prioritizes data protection and regulatory readiness.
          </p>
        </motion.div>

        {/* Trust Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {trustPillars.map((pillar, index) => (
            <motion.article
              key={pillar.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: prefersReducedMotion ? 0 : index * 0.08, duration: 0.5 }}
              className="glass rounded-3xl p-6 md:p-8 border border-surface-glass-border hover:border-electric-lime/30 transition-all"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-electric-lime/15 border border-electric-lime/30 flex items-center justify-center">
                  <pillar.icon className="w-6 h-6 text-electric-lime" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-xl text-text-primary mb-1">{pillar.title}</h3>
                  <p className="text-sm text-text-secondary">{pillar.description}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {pillar.features.map((feature, fIndex) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.1 + fIndex * 0.04 }}
                    className="flex items-center gap-2 text-sm text-text-secondary"
                  >
                    <CheckCircle2 className="w-4 h-4 text-electric-lime flex-shrink-0" />
                    {feature}
                  </motion.div>
                ))}

                <div className="pt-4 border-t border-surface-glass-border flex items-center gap-2">
                  <span className={`badge ${pillar.verified ? 'badge-success' : 'badge-warning'}`}>
                    {pillar.verified ? 'Verified Implementation' : 'Architecture Aligned'}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Security Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h3 className="font-display font-bold text-2xl text-text-primary mb-8 text-center">Security by Design</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: prefersReducedMotion ? 0 : index * 0.06, duration: 0.4 }}
                className="glass rounded-2xl p-5 border border-surface-glass-border text-center hover:border-electric-lime/30 transition-all"
              >
                <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-electric-lime/15 border border-electric-lime/30 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-electric-lime" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">{feature.title}</h4>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Compliance Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-4">COMPLIANCE ALIGNMENT</p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            {[
              { label: 'SOC 2', sub: 'Type II Aligned', color: 'blue' },
              { label: 'GDPR', sub: 'Compliant Design', color: 'emerald' },
              { label: 'ISO 27001', sub: 'Controls Mapped', color: 'purple' },
              { label: 'PCI DSS', sub: 'Ready Architecture', color: 'amber' },
              { label: 'CCPA', sub: 'Privacy Ready', color: 'rose' },
            ].map((badge) => (
              <motion.div
                key={badge.label}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-1 px-4 py-3 glass rounded-xl border border-surface-glass-border"
              >
                <span className="font-display font-bold text-lg text-text-primary">{badge.label}</span>
                <span className="text-xs text-text-muted">{badge.sub}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}