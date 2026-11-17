import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, FileText, ShieldCheck, ShieldAlert, 
  CheckCircle2, Eye, Zap, Database, Users, 
  Globe, Lock, Mail, Twitter, Linkedin, Github,
  ArrowRight, ChevronRight
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FooterProps {
  className?: string;
}

const footerLinks = {
  Product: [
    { label: 'Vendor Onboarding', href: '#product' },
    { label: 'Risk Scoring', href: '#risk-intelligence' },
    { label: 'Approval Workflows', href: '#workflow' },
    { label: 'Vendor 360 Scorecards', href: '#features' },
  ],
  Platform: [
    { label: 'Document Intelligence', href: '#features' },
    { label: 'Audit Trail', href: '#features' },
    { label: 'Bank Change Surveillance', href: '#risk-intelligence' },
    { label: 'API & Integrations', href: '#contact' },
  ],
  Company: [
    { label: 'About Terybi', href: '#contact' },
    { label: 'Security & Compliance', href: '#security' },
    { label: 'Careers', href: '#contact' },
    { label: 'Contact Sales', href: '#contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Cookie Policy', href: '#cookies' },
    { label: 'Data Processing Agreement', href: '#dpa' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/terybi', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/terybi', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/terybi', label: 'GitHub' },
  { icon: Mail, href: 'mailto:hello@terybi.com', label: 'Email' },
];

export function Footer({ className = '' }: FooterProps) {
  const prefersReducedMotion = useReducedMotion();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`relative bg-bg-secondary border-t border-surface-glass-border ${className}`}
      role="contentinfo"
    >
      <div className="container mx-auto px-6 py-16 lg:py-24">
        {/* Main Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-16"
        >
          {/* Brand Column */}
          <motion.div
            className="lg:col-span-2 xl:col-span-2 max-w-xs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-lime to-lime-active flex items-center justify-center shadow-glow-lime-sm">
                <span className="font-display font-extrabold text-lg text-ink-black tracking-tight">V</span>
              </div>
              <span className="font-display font-bold text-xl text-text-primary tracking-tight">
                Vendor<span className="text-electric-lime">IQ</span>
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Enterprise vendor onboarding and risk management platform powered by a 12-rule deterministic engine. 
              Built for procurement teams who demand transparency, control, and compliance.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-glass border border-surface-glass-border text-text-muted hover:text-electric-lime hover:border-electric-lime/50 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links], catIndex) => (
            <motion.nav
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + catIndex * 0.05, duration: 0.4 }}
              aria-label={`${category} links`}
            >
              <h4 className="font-semibold text-text-primary mb-4 tracking-wide uppercase text-xs">{category}</h4>
              <ul className="space-y-3" role="list">
                {links.map((link, linkIndex) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.2 + catIndex * 0.05 + linkIndex * 0.02, duration: 0.3 }}
                  >
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-electric-lime transition-colors flex items-center gap-2 group"
                    >
                      {link.label}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-surface-glass-border to-transparent mb-10"
        />

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-text-muted"
        >
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
            <span className="font-mono">© {currentYear} VendorIQ by Terybi Global Enterprise</span>
            <span className="hidden sm:inline">·</span>
            <a href="#privacy" className="hover:text-electric-lime transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-electric-lime transition-colors">Terms of Service</a>
            <a href="#cookies" className="hover:text-electric-lime transition-colors">Cookie Policy</a>
            <a href="#dpa" className="hover:text-electric-lime transition-colors">DPA</a>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4">
            <span className="text-xs font-mono text-text-muted">
              Built with React 19 · TypeScript · Tailwind CSS · Motion
            </span>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-ghost px-4 py-2 text-xs"
            >
              Contact Sales
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}