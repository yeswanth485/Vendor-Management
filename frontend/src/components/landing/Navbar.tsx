import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown, ShieldCheck, Zap, Building2, FileText, Lock, BarChart3, ArrowRight } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface NavbarProps {
  onCtaClick: () => void;
  onDemoClick: () => void;
}

const navItems = [
  { label: 'Product', href: '#product', subItems: [
    { label: 'Vendor Onboarding', href: '#onboarding', description: '5-step automated application wizard' },
    { label: 'Document Intelligence', href: '#documents', description: 'OCR-assisted verification & extraction' },
    { label: 'Risk Scoring', href: '#risk', description: '12-rule deterministic engine' },
    { label: 'Approval Workflows', href: '#workflows', description: 'RBAC review & dual-control' },
  ]},
  { label: 'Platform', href: '#platform', subItems: [
    { label: 'Vendor 360 Scorecards', href: '#scorecards', description: 'Performance tiers & SLA tracking' },
    { label: 'AP Automation', href: '#ap', description: '3-way matching & variance resolution' },
    { label: 'Contract Management', href: '#contracts', description: 'SLA breach & service credits' },
    { label: 'Audit Trail', href: '#audit', description: 'Immutable event log' },
  ]},
  { label: 'Workflow', href: '#workflow', subItems: [] },
  { label: 'Risk Management', href: '#risk-management', subItems: [
    { label: 'Bank Change Surveillance', href: '#bank-change', description: '72-hour fraud hold protocol' },
    { label: 'Duplicate Detection', href: '#duplicate', description: 'Cross-tenant registration check' },
    { label: 'Watchlist Screening', href: '#watchlist', description: 'Enhanced due diligence triggers' },
    { label: 'Document Expiry', href: '#expiry', description: 'Automated renewal notifications' },
  ]},
  { label: 'Security', href: '#security', subItems: [] },
];

const ctaButtons = [
  { label: 'Sign In', variant: 'ghost' as const, onClick: () => window.location.href = '/app' },
  { label: 'Request Demo', variant: 'primary' as const, onClick: () => {} },
];

export function Navbar({ onCtaClick, onDemoClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);
  const [activeMobileNav, setActiveMobileNav] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleSubItemClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
    setHoveredNavIndex(null);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-bg-primary/95 backdrop-blur-md border-b border-surface-glass-border' : 'bg-transparent'
      }`}
      role="banner"
    >
      <nav className="container mx-auto px-6" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 z-60"
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-lime to-lime-active flex items-center justify-center shadow-glow-lime-sm">
              <span className="font-display font-extrabold text-ink-black text-lg tracking-tight">V</span>
            </div>
            <span className="font-display font-bold text-xl text-text-primary tracking-tight hidden sm:block">
              Vendor<span className="text-electric-lime">IQ</span>
            </span>
            <span className="text-xs font-mono font-semibold text-electric-lime uppercase tracking-wider hidden md:inline-block px-2 py-0.5 rounded bg-lime-muted border border-electric-lime/30">
              PRO
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setHoveredNavIndex(index)}
                onMouseLeave={() => setHoveredNavIndex(null)}
              >
                <button
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    hoveredNavIndex === index
                      ? 'text-electric-lime bg-lime-muted'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-glass'
                  }`}
                  onClick={() => item.href.startsWith('#') ? handleNavClick(item.href) : {}}
                >
                  {item.label}
                  {item.subItems.length > 0 && <ChevronDown className="w-3.5 h-3.5 transition-transform" />}
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {hoveredNavIndex === index && item.subItems.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-full mt-3 w-72 lg:w-80 glass-strong rounded-2xl p-3 shadow-xl border border-surface-glass-border z-50"
                      role="menu"
                    >
                      {item.subItems.map((sub, subIndex) => (
                        <motion.button
                          key={sub.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.03 * subIndex, duration: 0.15 }}
                          onClick={() => handleSubItemClick(sub.href)}
                          className="w-full flex flex-col gap-0.5 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-surface-glass-strong hover:text-text-primary group"
                          role="menuitem"
                        >
                          <span className="font-medium text-sm">{sub.label}</span>
                          <span className="text-xs text-text-muted">{sub.description}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {ctaButtons.map((btn, idx) => (
              <motion.button
                key={btn.label}
                whileHover={{ scale: btn.variant === 'primary' ? 1.02 : 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={btn.onClick}
                className={`btn ${btn.variant === 'primary' ? 'btn-primary' : 'btn-ghost'} px-5 py-2.5 text-sm`}
              >
                {btn.label}
                {btn.variant === 'primary' && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-glass transition-colors z-60"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden border-t border-surface-glass-border bg-bg-primary"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item, index) => (
                  <div key={item.label} className="border-b border-surface-glass-border pb-4 last:border-0 last:pb-0">
                    <button
                      onClick={() => setActiveMobileNav(activeMobileNav === index ? null : index)}
                      className="w-full flex items-center justify-between px-2 py-3 text-left text-base font-medium text-text-primary rounded-lg transition-colors hover:bg-surface-glass"
                    >
                      <span>{item.label}</span>
                      {item.subItems.length > 0 && (
                        <ChevronDown
                          className={`w-5 h-5 text-text-muted transition-transform ${activeMobileNav === index ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>

                    <AnimatePresence>
                      {activeMobileNav === index && item.subItems.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="mt-3 space-y-1 pl-2 border-l border-surface-glass-border"
                        >
                          {item.subItems.map((sub, subIndex) => (
                            <motion.button
                              key={sub.label}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.03 * subIndex }}
                              onClick={() => handleSubItemClick(sub.href)}
                              className="w-full flex flex-col gap-1 px-3 py-2.5 text-left text-sm rounded-lg transition-colors hover:bg-surface-glass group"
                            >
                              <span className="font-medium text-text-primary">{sub.label}</span>
                              <span className="text-xs text-text-muted">{sub.description}</span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Mobile CTAs */}
                <div className="flex flex-col gap-3 pt-4 border-t border-surface-glass-border">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onDemoClick}
                    className="btn btn-primary py-3 text-base"
                  >
                    Request Demo
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = '/app'}
                    className="btn btn-secondary py-3 text-base"
                  >
                    Sign In
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}