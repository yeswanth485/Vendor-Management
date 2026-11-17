import React from 'react';
import { motion, type Variants } from 'motion/react';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Database, Users, Clock, ExternalLink } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface HeroProps {
  onExploreClick: () => void;
  onDemoClick: () => void;
}

const stats = [
  { label: '12', suffix: '+', description: 'Validation Rules', icon: ShieldCheck },
  { label: '8', suffix: '', description: 'Countries Supported', icon: Database },
  { label: '4', suffix: '', description: 'Risk Levels', icon: Zap },
  { label: '99', suffix: '%', description: 'Auto-Approval Rate', icon: CheckCircle2 },
];

const trustBadges = [
  'SOC 2 Type II Certified',
  'GDPR Compliant',
  'ISO 27001 Aligned',
  'PCI DSS Ready',
];

export function Hero({ onExploreClick, onDemoClick }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      aria-labelledby="hero-heading"
    >
      {/* Background Layers */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-hero" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        
        {/* Radial Glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-electric-lime/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-silver-glass/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        {/* Noise Texture */}
        <div className="absolute inset-0 noise-texture" />
      </div>

      <div className="relative container mx-auto px-6 py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto text-center"
        >
          {/* Eyebrow */}
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-glass border border-surface-glass-border text-xs font-semibold text-silver-glass uppercase tracking-wider mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-electric-lime animate-pulse-glow" />
            ENTERPRISE VENDOR INTELLIGENCE PLATFORM
          </motion.span>

          {/* Headline */}
          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-text-primary mb-8"
          >
            Every Vendor.<br />
            <span className="gradient-text">Every Risk.</span><br />
            One Intelligent Platform.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Streamline vendor onboarding, centralize documentation, and strengthen risk oversight through
            a connected management platform powered by a 12-rule deterministic engine.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExploreClick}
              className="btn btn-primary px-8 py-4 text-base lg:px-10 lg:py-4 group"
            >
              Explore VendorIQ
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onDemoClick}
              className="btn btn-secondary px-8 py-4 text-base lg:px-10 lg:py-4"
            >
              Request a Demo
            </motion.button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs font-medium text-text-muted uppercase tracking-wider"
          >
            {trustBadges.map((badge, index) => (
              <motion.span
                key={badge}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.08 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-glass border border-surface-glass-border"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-electric-lime" />
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          role="list"
          aria-label="Platform statistics"
        >
          {stats.map((stat, index) => (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.08, duration: 0.5 }}
              className="group relative p-6 md:p-8 glass rounded-2xl border border-surface-glass-border hover:border-electric-lime/30 transition-all duration-300"
              role="listitem"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-6 h-6 text-electric-lime" />
                <ExternalLink className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-baseline gap-1">
                <motion.span
                  className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-text-primary"
                >
                  {stat.label}
                </motion.span>
                <span className="font-display font-extrabold text-3xl md:text-4xl text-electric-lime">
                  {stat.suffix}
                </span>
              </div>
              <p className="text-sm text-text-muted mt-2 font-medium">{stat.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted"
        aria-hidden="true"
      >
        <span className="text-xs font-medium uppercase tracking-wider">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-electric-lime/50"
        />
      </motion.div>
    </section>
  );
}