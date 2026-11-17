import React from 'react';
import { RiskLevel, ApplicationStatus, RuleStatus } from '../../types';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const configs: Record<ApplicationStatus, { label: string; text: string; dot: string; bg: string; ring: string }> = {
    APPROVED: { 
      label: 'Approved', 
      text: 'text-emerald-800 font-semibold', 
      dot: 'bg-emerald-500 ring-2 ring-emerald-400/40', 
      bg: 'bg-emerald-50/90 border-emerald-200/80',
      ring: 'ring-1 ring-emerald-400/20 shadow-2xs'
    },
    PENDING: { 
      label: 'Pending Review', 
      text: 'text-amber-800 font-semibold', 
      dot: 'bg-amber-500 animate-pulse ring-2 ring-amber-400/40', 
      bg: 'bg-amber-50/90 border-amber-200/80',
      ring: 'ring-1 ring-amber-400/20 shadow-2xs'
    },
    IN_REVIEW: { 
      label: 'In Review', 
      text: 'text-indigo-800 font-semibold', 
      dot: 'bg-indigo-500 animate-pulse ring-2 ring-indigo-400/40', 
      bg: 'bg-indigo-50/90 border-indigo-200/80',
      ring: 'ring-1 ring-indigo-400/20 shadow-2xs'
    },
    AWAITING_VENDOR: { 
      label: 'Awaiting Vendor', 
      text: 'text-purple-800 font-semibold', 
      dot: 'bg-purple-500 ring-2 ring-purple-400/40', 
      bg: 'bg-purple-50/90 border-purple-200/80',
      ring: 'ring-1 ring-purple-400/20 shadow-2xs'
    },
    REJECTED: { 
      label: 'Rejected', 
      text: 'text-rose-800 font-semibold', 
      dot: 'bg-rose-500 ring-2 ring-rose-400/40', 
      bg: 'bg-rose-50/90 border-rose-200/80',
      ring: 'ring-1 ring-rose-400/20 shadow-2xs'
    },
    DRAFT: { 
      label: 'Draft', 
      text: 'text-slate-600 font-medium', 
      dot: 'bg-slate-400', 
      bg: 'bg-slate-100/80 border-slate-200/80',
      ring: 'shadow-2xs'
    },
    SUBMITTED: { 
      label: 'Submitted', 
      text: 'text-sky-800 font-semibold', 
      dot: 'bg-sky-500 animate-pulse ring-2 ring-sky-400/40', 
      bg: 'bg-sky-50/90 border-sky-200/80',
      ring: 'ring-1 ring-sky-400/20 shadow-2xs'
    },
  };

  const c = configs[status] || configs.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${c.bg} ${c.text} ${c.ring} transition-all duration-200 hover:scale-102`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
      <span>{c.label}</span>
    </span>
  );
}

export function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  const configs: Record<RiskLevel, { label: string; text: string; border: string; bg: string; dot: string }> = {
    LOW: { 
      label: 'Low Risk', 
      text: 'text-emerald-800 font-semibold', 
      border: 'border-emerald-200/90', 
      bg: 'bg-emerald-50/90',
      dot: 'bg-emerald-500'
    },
    MEDIUM: { 
      label: 'Medium Risk', 
      text: 'text-amber-800 font-semibold', 
      border: 'border-amber-200/90', 
      bg: 'bg-amber-50/90',
      dot: 'bg-amber-500'
    },
    HIGH: { 
      label: 'High Risk', 
      text: 'text-orange-900 font-bold', 
      border: 'border-orange-200/90', 
      bg: 'bg-orange-50/90',
      dot: 'bg-orange-500 animate-pulse'
    },
    CRITICAL: { 
      label: 'Critical Risk', 
      text: 'text-rose-900 font-bold', 
      border: 'border-rose-300', 
      bg: 'bg-rose-50/90',
      dot: 'bg-rose-600 animate-pulse ring-2 ring-rose-500/30'
    },
  };

  const c = configs[level] || configs.LOW;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border shadow-2xs ${c.bg} ${c.border} ${c.text} transition-all duration-200 hover:scale-102`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      <span>{c.label}</span>
      {score !== undefined && (
        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/5 font-semibold">
          {score}/100
        </span>
      )}
    </span>
  );
}

export function RuleStatusBadge({ status }: { status: RuleStatus }) {
  const configs: Record<RuleStatus, { label: string; bg: string; text: string; border: string }> = {
    PASS: { 
      label: 'PASS', 
      bg: 'bg-emerald-50 text-emerald-800', 
      text: 'text-emerald-800', 
      border: 'border-emerald-300 shadow-2xs' 
    },
    WARNING: { 
      label: 'WARNING', 
      bg: 'bg-amber-50 text-amber-900', 
      text: 'text-amber-900', 
      border: 'border-amber-300 shadow-2xs' 
    },
    FAIL: { 
      label: 'FAIL', 
      bg: 'bg-rose-50 text-rose-800', 
      text: 'text-rose-800', 
      border: 'border-rose-300 shadow-2xs' 
    },
    NEEDS_REVIEW: { 
      label: 'NEEDS REVIEW', 
      bg: 'bg-indigo-50 text-indigo-800', 
      text: 'text-indigo-800', 
      border: 'border-indigo-300 shadow-2xs' 
    },
  };

  const c = configs[status] || configs.WARNING;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider border font-mono ${c.bg} ${c.border} transition-transform hover:scale-105`}>
      {c.label}
    </span>
  );
}

export function CountryFlag({ code }: { code: string }) {
  const flagMap: Record<string, string> = {
    US: '🇺🇸',
    GB: '🇬🇧',
    DE: '🇩🇪',
    IN: '🇮🇳',
    AU: '🇦🇺',
    CA: '🇨🇦',
    FI: '🇫🇮',
    JP: '🇯🇵',
  };

  return (
    <span className="text-base select-none inline-flex items-center justify-center p-0.5 rounded bg-slate-100/70 border border-slate-200/60 shadow-2xs" title={code}>
      {flagMap[code] || '🌐'}
    </span>
  );
}
