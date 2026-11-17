import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Circle, CheckCircle2, AlertTriangle, 
  Clock, Lock, Phone, Eye, Zap, Database,
  Users, FileText, ShieldAlert, ArrowRight,
  Pause, Play, Filter, X
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ActivityConsoleSectionProps {
  className?: string;
}

const sampleEvents = [
  { id: 1, time: '09:42:15', timestamp: '2026-10-27T09:42:15.234Z', level: 'INFO', source: 'VENDOR_PORTAL', event: 'VENDOR_REGISTRATION_INITIATED', vendor: 'Solaria Clean Energy Solutions Ltd', appId: 'VND-2026-1009', details: 'New vendor self-registration started via portal', correlationId: 'corr-8f2a1b' },
  { id: 2, time: '09:38:42', timestamp: '2026-10-27T09:38:42.101Z', level: 'INFO', source: 'VENDOR_PORTAL', event: 'DOCUMENTS_SUBMITTED', vendor: 'BioChem Labs GMBH', appId: 'VND-2026-1006', details: '3 statutory documents uploaded: Incorp, Tax Reg, Bank Letter', correlationId: 'corr-7e1b9c' },
  { id: 3, time: '09:35:18', timestamp: '2026-10-27T09:35:18.056Z', level: 'SUCCESS', source: 'RULES_ENGINE', event: 'VERIFICATION_COMPLETED', vendor: 'Nordic Logistics OY', appId: 'VND-2026-1002', details: 'All 12 rules PASS. Risk: LOW (10). Auto-approval eligible.', correlationId: 'corr-6d4a3f' },
  { id: 4, time: '09:31:55', timestamp: '2026-10-27T09:31:55.789Z', level: 'WARN', source: 'REVIEW_QUEUE', event: 'RISK_REVIEW_INITIATED', vendor: 'Acme Global Construction Ltd', appId: 'VND-2026-1003', details: 'RULE-007 FAIL: Duplicate registration #08492014. Reviewer: Sarah Chen', correlationId: 'corr-5c9b2e' },
  { id: 5, time: '09:28:33', timestamp: '2026-10-27T09:28:33.442Z', level: 'INFO', source: 'APPROVAL_WORKFLOW', event: 'APPROVAL_PENDING', vendor: 'Apex Industrial Supplies', appId: 'VND-2026-1001', details: 'RULE-006 NEEDS_REVIEW: Name similarity 87%. Awaiting approver decision.', correlationId: 'corr-4b8a1d' },
  { id: 6, time: '09:24:11', timestamp: '2026-10-27T09:24:11.333Z', level: 'CRITICAL', source: 'SECURITY_MONITOR', event: 'BANK_CHANGE_HOLD_ACTIVATED', vendor: 'Pacific Freight & Haulage', appId: 'VND-2026-1007', details: 'SEC-BANK-04 triggered: Bank change requested 48h before $184K disbursement. 72-hr hold ID: BCR-2026-089', correlationId: 'corr-3a7f9c' },
  { id: 7, time: '09:20:47', timestamp: '2026-10-27T09:20:47.221Z', level: 'SUCCESS', source: 'REVIEW_QUEUE', event: 'REVIEW_RECORDED', vendor: 'Vanguard Heavy Machinery', appId: 'VND-2026-1004', details: 'Expired ISO 9001 resolved. Updated cert uploaded. RULE-005B now PASS.', correlationId: 'corr-2e6d8b' },
  { id: 8, time: '09:18:22', timestamp: '2026-10-27T09:18:22.110Z', level: 'INFO', source: 'VENDOR_PORTAL', event: 'TAX_ID_VALIDATED', vendor: 'Kyoto Precision Instruments', appId: 'VND-2026-1005', details: 'Corporate Number 1234567890123 validated. RULE-012 NEEDS_REVIEW: Dual-use screening.', correlationId: 'corr-1f5c7a' },
  { id: 9, time: '09:15:09', timestamp: '2026-10-27T09:15:09.998Z', level: 'WARN', source: 'RULES_ENGINE', event: 'DISCREPANCY_DETECTED', vendor: 'BioChem Labs GMBH', appId: 'VND-2026-1006', details: 'RULE-005A FAIL: Missing mandatory TAX_REGISTRATION document for DE jurisdiction.', correlationId: 'corr-0e4b6f' },
  { id: 10, time: '09:12:34', timestamp: '2026-10-27T09:12:34.887Z', level: 'INFO', source: 'NOTIFICATION_SERVICE', event: 'FOLLOW_UP_DISPATCHED', vendor: 'BioChem Labs GMBH', appId: 'VND-2026-1006', details: 'Automated email sent to s.meyer@biochemlabs.de requesting USt-IdNr certificate. Portal link generated.', correlationId: 'corr-9d3a5e' },
];

const levelStyles: Record<'INFO' | 'SUCCESS' | 'WARN' | 'CRITICAL', { dot: string; text: string; bg: string; border: string }> = {
  INFO: { dot: 'bg-blue-400', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  SUCCESS: { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  WARN: { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  CRITICAL: { dot: 'bg-rose-400 animate-pulse', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

const sourceIcons = {
  VENDOR_PORTAL: Users,
  RULES_ENGINE: Zap,
  REVIEW_QUEUE: ShieldAlert,
  APPROVAL_WORKFLOW: CheckCircle2,
  SECURITY_MONITOR: Lock,
  NOTIFICATION_SERVICE: Database,
};

export function ActivityConsoleSection({ className = '' }: ActivityConsoleSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'SUCCESS' | 'WARN' | 'CRITICAL'>('ALL');
  const [events, setEvents] = useState(sampleEvents);
  const [newEventIndex, setNewEventIndex] = useState(sampleEvents.length);

  // Simulate live events
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setNewEventIndex(prev => prev + 1);
      const newEvent = {
        id: newEventIndex + 1,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: new Date().toISOString(),
        level: ['INFO', 'SUCCESS', 'WARN'][Math.floor(Math.random() * 3)] as 'INFO' | 'SUCCESS' | 'WARN',
        source: ['VENDOR_PORTAL', 'RULES_ENGINE', 'REVIEW_QUEUE', 'APPROVAL_WORKFLOW'][Math.floor(Math.random() * 4)],
        event: ['VENDOR_REGISTRATION_INITIATED', 'DOCUMENTS_SUBMITTED', 'VERIFICATION_COMPLETED', 'RISK_REVIEW_INITIATED'][Math.floor(Math.random() * 4)],
        vendor: ['Test Vendor A', 'Test Vendor B', 'Test Vendor C'][Math.floor(Math.random() * 3)],
        appId: `VND-2026-${1010 + Math.floor(Math.random() * 100)}`,
        details: 'Simulated activity event for demo purposes',
        correlationId: `corr-${Math.random().toString(36).substr(2, 8)}`,
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion, newEventIndex]);

  const filteredEvents = events.filter(e => filterLevel === 'ALL' || e.level === filterLevel);

  return (
    <section
      id="activity-console"
      className={`section relative ${className}`}
      aria-labelledby="activity-heading"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-glass border border-surface-glass-border text-xs font-semibold text-electric-lime uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-electric-lime animate-pulse-glow" />
                VENDORIQ / ACTIVITY MONITOR
              </span>
              <h2 id="activity-heading" className="font-display font-extrabold text-3xl md:text-4xl leading-tight text-text-primary">
                Operational Activity Console
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-text-muted hidden sm:inline">
                Simulated activity stream — not connected to live production data
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPaused(!isPaused)}
                className={`btn btn-secondary px-4 py-2 text-sm flex items-center gap-2 ${isPaused ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : ''}`}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </motion.button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {['ALL', 'CRITICAL', 'WARN', 'SUCCESS', 'INFO'].map((level) => (
              <motion.button
                key={level}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterLevel(level as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${filterLevel === level 
                  ? `bg-electric-lime text-ink-black shadow-glow-lime-sm` 
                  : 'bg-surface-glass text-text-muted hover:text-text-primary hover:bg-surface-glass-strong border border-surface-glass-border'}`}
              >
                {level}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Console */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-strong rounded-3xl border border-surface-glass-border overflow-hidden"
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-glass-border bg-surface-glass/50">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-text-muted" />
              <span className="font-mono text-xs text-text-primary">vendoriq-activity-monitor</span>
              <span className="text-xs text-text-muted">/procurement/ops</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="font-mono text-xs text-text-muted">LIVE</span>
              <span className="font-mono text-xs text-text-muted hidden sm:inline">|</span>
              <span className="font-mono text-xs text-electric-lime hidden sm:inline">{filteredEvents.length} events</span>
            </div>
          </div>

          {/* Event Stream */}
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-2" role="log" aria-live="polite" aria-label="Activity events">
            <AnimatePresence>
              {filteredEvents.map((event, index) => {
                const levelKey = event.level as keyof typeof levelStyles;
                return (
                <motion.div
                  key={`${event.id}-${event.timestamp}`}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : index * 0.02, duration: 0.2 }}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${levelStyles[levelKey].bg} ${levelStyles[levelKey].border} group`}
                >
                  {/* Time */}
                  <div className="flex-shrink-0 w-20 text-right pt-0.5">
                    <span className="font-mono text-xs text-text-muted">{event.time}</span>
                  </div>

                  {/* Level Indicator */}
                  <div className="flex-shrink-0 w-6 flex items-center pt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${levelStyles[levelKey].dot}`} />
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-electric-lime">{event.event}</span>
                      <span className="text-[10px] text-text-muted">|</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${levelStyles[levelKey].bg} ${levelStyles[levelKey].text} ${levelStyles[levelKey].border}`}>
                        {event.level}
                      </span>
                      <span className="text-[10px] text-text-muted">|</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-glass border border-surface-glass-border text-text-muted">
                        {event.source}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                      <span className="font-medium text-text-primary">{event.vendor}</span>
                      <span className="text-text-muted">•</span>
                      <span className="font-mono text-electric-lime">{event.appId}</span>
                      <span className="text-text-muted">•</span>
                      <span>{event.details}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted">
                      <span className="font-mono">correlation_id: {event.correlationId}</span>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button className="flex-shrink-0 p-1 rounded hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100">
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </button>
                </motion.div>
              );
            })}
            {filteredEvents.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center text-text-muted"
              >
                <Filter className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No events match filter</p>
                <p className="text-xs mt-1">Try adjusting the level filter</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

          {/* Footer Status */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-surface-glass-border bg-surface-glass/30 text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Stream active
              </span>
              <span className="font-mono">Buffer: {events.length}/20</span>
              <span className="font-mono">Filter: {filterLevel}</span>
            </div>
            <span className="font-mono hidden sm:inline">
              Sample data — <span className="text-electric-lime">not live production telemetry</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}