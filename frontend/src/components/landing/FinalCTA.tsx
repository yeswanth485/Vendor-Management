import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, Database, Users, CheckCircle2, Lock } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FinalCTAProps {
  onExploreClick: () => void;
  onContactClick: () => void;
  className?: string;
}

const benefits = [
  { icon: ShieldCheck, title: '12-Rule Deterministic Engine', desc: 'Explainable, auditable decisions' },
  { icon: Zap, title: 'Instant Risk Scoring', desc: '0-100 weighted calculation' },
  { icon: Database, title: 'Multi-Tenant Isolation', desc: 'Strict data separation' },
  { icon: Users, title: 'RBAC with MFA Step-Up', desc: '5 roles, granular permissions' },
  { icon: CheckCircle2, title: 'Immutable Audit Trail', desc: '27 event types, tamper-proof' },
  { icon: Database, title: '8 Countries Supported', desc: 'Native jurisdiction validation' },
];

export function FinalCTA({ onExploreClick, onContactClick, className = '' }: FinalCTAProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="contact"
      className={`section relative ${className}`}
      aria-labelledby="cta-heading"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative glass-strong rounded-4xl p-8 md:p-12 lg:p-16 border border-surface-glass-border overflow-hidden text-center"
        >
          {/* Background Accent */}
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-electric-lime/5 blur-3xl" />
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-silver-glass/5 blur-3xl" />
          </div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.3 + index * 0.06, duration: 0.4 }}
                className="flex items-center gap-3 p-4 glass rounded-xl border border-surface-glass-border text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-electric-lime/15 border border-electric-lime/30 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-electric-lime" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{benefit.title}</p>
                  <p className="text-xs text-text-muted">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main CTA Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative max-w-3xl mx-auto"
          >
            <h2 id="cta-heading" className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-text-primary mb-6">
              Bring Clarity and Control to <br />
              <span className="gradient-text">Every Vendor Relationship</span>
            </h2>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto">
              Manage vendor onboarding and risk reviews with complete visibility through VendorIQ's 
              deterministic rules engine, role-based workflows, and immutable audit trail.
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onExploreClick}
                className="btn btn-primary px-10 py-4 text-base lg:px-12 lg:py-5 group"
              >
                Explore VendorIQ
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onContactClick}
                className="btn btn-secondary px-10 py-4 text-base lg:px-12 lg:py-5"
              >
                Contact Our Team
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm"
            >
              <div className="flex items-center gap-2 text-text-muted">
                <ShieldCheck className="w-4 h-4 text-electric-lime" />
                <span className="font-medium text-text-primary">SOC 2 Aligned</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Lock className="w-4 h-4 text-electric-lime" />
                <span className="font-medium text-text-primary">GDPR Ready</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-electric-lime" />
                <span className="font-medium text-text-primary">ISO 27001 Mapped</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Database className="w-4 h-4 text-electric-lime" />
                <span className="font-medium text-text-primary">AES-256 Encrypted</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}