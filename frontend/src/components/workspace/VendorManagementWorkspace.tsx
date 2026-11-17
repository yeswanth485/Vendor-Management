import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppStorage } from '../../lib/storage';
import { 
  Vendor, 
  VendorScorecard, 
  VendorContract, 
  SlaBreach, 
  CorrectiveActionPlan
} from '../../types';
import { UserMfaProfile } from '../../lib/firebase';
import { 
  Building2, 
  Award, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  ArrowRight, 
  Search, 
  Filter, 
  RefreshCw, 
  Layers, 
  BarChart3, 
  ChevronRight, 
  Plus, 
  ExternalLink,
  Sliders,
  Check,
  X,
  Scale,
  Sparkles,
  Percent,
  Receipt,
  FileCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface VendorManagementWorkspaceProps {
  userProfile: UserMfaProfile;
  onNavigateToAp?: () => void;
  onNavigateToVendorDetail?: (vendorId: string) => void;
}

export function VendorManagementWorkspace({
  userProfile,
  onNavigateToAp,
  onNavigateToVendorDetail,
}: VendorManagementWorkspaceProps) {
  const storage = AppStorage.getInstance();
  const vendors = storage.getVendors();
  const scorecards = storage.getScorecards();
  const contracts = storage.getContracts();
  const breaches = storage.getSlaBreaches();
  const cimPlans = storage.getCimPlans();
  const invoices = storage.getInvoices();

  // Filters & State
  const [filterTab, setFilterTab] = useState<'ALL' | 'STRATEGIC' | 'BREACHES' | 'RENEWALS' | 'CIM'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection for comparison
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>(['vnd-nordic-1002', 'vnd-apex-1001']);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Selected vendor for 360 Workspace Drawer/Modal
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);

  // Modals for Actions
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isNewCimOpen, setIsNewCimOpen] = useState(false);
  const [claimSuccessToast, setClaimSuccessToast] = useState<string | null>(null);

  // New Contract Form State
  const [newContractForm, setNewContractForm] = useState({
    vendorId: vendors[0]?.id || 'vnd-nordic-1002',
    title: '',
    totalValue: 120000,
    endDate: '2027-12-31',
    slaName: 'Order Fulfillment Lead Time',
    slaTarget: 98.0,
    slaPenalty: 500,
  });

  // New CIM Plan Form State
  const [newCimForm, setNewCimForm] = useState({
    vendorId: vendors[0]?.id || 'vnd-apex-1001',
    title: '',
    issueDescription: '',
    requiredAction: '',
    severity: 'HIGH' as const,
    dueDate: '2026-11-30',
  });

  // Calculate high-level portfolio metrics
  const activeVendors = vendors.filter(v => v.status === 'ACTIVE');
  const scoredVendorsCount = Object.keys(scorecards).length;
  
  const avgCompositeScore = scoredVendorsCount > 0 
    ? Math.round(Object.values(scorecards).reduce((acc, sc) => acc + (sc.compositeScore || 85), 0) / scoredVendorsCount)
    : 92;

  const openBreaches = breaches.filter(b => b.status === 'OPEN');
  const claimablePenaltiesTotal = openBreaches.reduce((acc, b) => acc + b.serviceCreditPenalty, 0);

  const totalContractValue = contracts.reduce((acc, c) => acc + c.totalValue, 0);
  
  // Contracts renewing within 75 days
  const now = new Date();
  const renewingSoonContracts = contracts.filter(c => {
    const end = new Date(c.endDate);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 75;
  });

  const activeCimPlans = cimPlans.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS');

  // Filter vendors list
  const filteredVendors = vendors.filter(v => {
    const sc = scorecards[v.id];
    const vContracts = contracts.filter(c => c.vendorId === v.id);
    const vBreaches = breaches.filter(b => b.vendorId === v.id && b.status === 'OPEN');
    const vCim = cimPlans.filter(p => p.vendorId === v.id && (p.status === 'OPEN' || p.status === 'IN_PROGRESS'));

    // Category
    if (categoryFilter !== 'ALL' && v.category !== categoryFilter) return false;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchCat = v.category.toLowerCase().includes(q);
      const matchCountry = v.country.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchCountry) return false;
    }

    // Tabs
    if (filterTab === 'STRATEGIC') {
      return sc?.tier === 'STRATEGIC';
    }
    if (filterTab === 'BREACHES') {
      return vBreaches.length > 0;
    }
    if (filterTab === 'RENEWALS') {
      return vContracts.some(c => {
        const diffDays = Math.ceil((new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 75;
      });
    }
    if (filterTab === 'CIM') {
      return vCim.length > 0;
    }

    return true;
  });

  const uniqueCategories = Array.from(new Set(vendors.map(v => v.category)));

  // Handlers
  const handleToggleCompare = (vendorId: string) => {
    if (selectedForCompare.includes(vendorId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== vendorId));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare a maximum of 3 vendors simultaneously.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, vendorId]);
    }
  };

  const handleClaimCredit = (breachId: string) => {
    const res = storage.claimServiceCredit(breachId);
    if (res.success) {
      setClaimSuccessToast(res.message);
      setTimeout(() => setClaimSuccessToast(null), 5000);
    } else {
      alert(res.message);
    }
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === newContractForm.vendorId);
    if (!vendor || !newContractForm.title) return;

    storage.createContract({
      vendorId: vendor.id,
      vendorName: vendor.name,
      title: newContractForm.title,
      totalValue: Number(newContractForm.totalValue),
      endDate: newContractForm.endDate,
      slas: [
        {
          id: `sla-${Date.now()}`,
          name: newContractForm.slaName,
          target: Number(newContractForm.slaTarget),
          unit: '%',
          direction: 'MAXIMIZE',
          currentMetric: Number(newContractForm.slaTarget),
          status: 'MET',
          penaltyClause: `$${newContractForm.slaPenalty} service fee deduction per % point breach`,
          penaltyPerUnit: Number(newContractForm.slaPenalty),
        }
      ]
    });

    setIsNewContractOpen(false);
    setClaimSuccessToast(`Contract created successfully for ${vendor.name}`);
    setTimeout(() => setClaimSuccessToast(null), 4000);
  };

  const handleCreateCim = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === newCimForm.vendorId);
    if (!vendor || !newCimForm.title) return;

    storage.createCimPlan({
      vendorId: vendor.id,
      vendorName: vendor.name,
      title: newCimForm.title,
      issueDescription: newCimForm.issueDescription,
      requiredAction: newCimForm.requiredAction,
      severity: newCimForm.severity,
      dueDate: newCimForm.dueDate,
    });

    setIsNewCimOpen(false);
    setClaimSuccessToast(`Continual Improvement Plan assigned to ${vendor.name}`);
    setTimeout(() => setClaimSuccessToast(null), 4000);
  };

  const activeVendor = vendors.find(v => v.id === activeVendorId);
  const activeScorecard = activeVendorId ? scorecards[activeVendorId] : undefined;
  const activeVendorContracts = activeVendorId ? contracts.filter(c => c.vendorId === activeVendorId) : [];
  const activeVendorBreaches = activeVendorId ? breaches.filter(b => b.vendorId === activeVendorId) : [];
  const activeVendorCim = activeVendorId ? cimPlans.filter(p => p.vendorId === activeVendorId) : [];
  const activeVendorInvoices = activeVendorId ? invoices.filter(i => i.vendorId === activeVendorId) : [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {claimSuccessToast && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{claimSuccessToast}</span>
          <button onClick={() => setClaimSuccessToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner: Manager Workspace */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-lg border border-indigo-900/60 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5 text-xs text-indigo-300">
            <span className="font-bold tracking-wider uppercase text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
              ⚡ LIVE COCKPIT
            </span>
            <span>·</span>
            <span>Procurement & Supplier Performance Cockpit</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Vendor Management Workspace
          </h1>
          <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl">
            Composite supplier scorecards, contractual SLA tracking, and automated accounts payable credit offsets with real-time analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Scale className="w-3.5 h-3.5 text-indigo-300" />
            Compare ({selectedForCompare.length})
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsNewCimOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 backdrop-blur-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            + New CIM Plan
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsNewContractOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/30"
          >
            <Plus className="w-3.5 h-3.5" />
            New Contract
          </motion.button>
        </div>
      </motion.div>

      {/* Top 4 KPI Summary Cards with Gradient Accent & Micro-Interactions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Composite Vendor Performance Index */}
        <motion.div 
          whileHover={{ y: -4, transition: { duration: 0.18 } }}
          className="relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Portfolio Performance Index</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{avgCompositeScore}%</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Grade A-
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Weighted SLA, AP accuracy & compliance index</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>SLA Met: <strong className="text-indigo-600 font-semibold">96.9%</strong></span>
            <span>AP Clean: <strong className="text-emerald-600 font-semibold">95.9%</strong></span>
          </div>
        </motion.div>

        {/* KPI 2: Active Breached SLAs & Claimable Service Credits */}
        <motion.div 
          whileHover={{ y: -4, transition: { duration: 0.18 } }}
          className="relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Active SLA Breaches & Credits</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{openBreaches.length} Breaches</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              ${claimablePenaltiesTotal.toLocaleString()} Owed
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Contract liquidated damages eligible for deduction</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            {openBreaches.length > 0 ? (
              <button 
                onClick={() => handleClaimCredit(openBreaches[0].id)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
              >
                Claim ${openBreaches[0].serviceCreditPenalty.toLocaleString()} Credit <ArrowRight className="w-3 h-3 text-indigo-500" />
              </button>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> All SLAs within tolerance
              </span>
            )}
          </div>
        </motion.div>

        {/* KPI 3: Managed Contracts & Renewal Alerts */}
        <motion.div 
          whileHover={{ y: -4, transition: { duration: 0.18 } }}
          className="relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Contract Commitments</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">${(totalContractValue / 1000).toFixed(0)}k</span>
            <span className="text-[11px] text-slate-500 font-normal">in {contracts.length} agreements</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Committed spend under active governance</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {renewingSoonContracts.length} renewing soon (&lt;75d)
            </span>
            <button 
              onClick={() => setFilterTab('RENEWALS')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              View Renewals →
            </button>
          </div>
        </motion.div>

        {/* KPI 4: Continual Improvement Management (CIM) */}
        <motion.div 
          whileHover={{ y: -4, transition: { duration: 0.18 } }}
          className="relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Improvement (CIM)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{activeCimPlans.length} Active Plans</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              In flight
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Supplier corrective action requests (SCAR)</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">0 Overdue SCARs</span>
            <button 
              onClick={() => setFilterTab('CIM')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              Track Plans →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Workspace Card: Modern Enterprise Directory Grid */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterTab === 'ALL'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-900'
              }`}
            >
              All Vendors ({vendors.length})
            </button>
            <button
              onClick={() => setFilterTab('STRATEGIC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterTab === 'STRATEGIC'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-900'
              }`}
            >
              Strategic (Tier 1)
            </button>
            <button
              onClick={() => setFilterTab('BREACHES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterTab === 'BREACHES'
                  ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-xs'
                  : 'bg-transparent text-rose-700 hover:bg-rose-50/80'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              SLA Breaches ({openBreaches.length})
            </button>
            <button
              onClick={() => setFilterTab('RENEWALS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterTab === 'RENEWALS'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                  : 'bg-transparent text-amber-700 hover:bg-amber-50/80'
              }`}
            >
              Renewals Due ({renewingSoonContracts.length})
            </button>
            <button
              onClick={() => setFilterTab('CIM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterTab === 'CIM'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs'
                  : 'bg-transparent text-slate-700 hover:bg-indigo-50/60'
              }`}
            >
              CIM Plans ({activeCimPlans.length})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search vendor or country..."
                className="pl-8 pr-2.5 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-52 text-slate-900 transition-all"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vendors Table: Rich Enterprise Styling */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3 w-10 text-center">Compare</th>
                <th className="py-3 px-4 font-semibold text-slate-800">Vendor & Tier</th>
                <th className="py-3 px-4 font-semibold text-slate-800">Composite Health</th>
                <th className="py-3 px-4 font-semibold text-slate-800">SLA Achievement</th>
                <th className="py-3 px-4 font-semibold text-slate-800">AP Reconciliation</th>
                <th className="py-3 px-4 font-semibold text-slate-800">Active Contract & Term</th>
                <th className="py-3 px-4 font-semibold text-slate-800">Breaches & Credits</th>
                <th className="py-3 px-4 font-semibold text-slate-800">CIM Action Plan</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-800">Manager Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No vendors matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVendors.map(vendor => {
                  const sc = scorecards[vendor.id];
                  const vContracts = contracts.filter(c => c.vendorId === vendor.id);
                  const activeContract = vContracts[0];
                  const vBreaches = breaches.filter(b => b.vendorId === vendor.id && b.status === 'OPEN');
                  const vCim = cimPlans.filter(p => p.vendorId === vendor.id && (p.status === 'OPEN' || p.status === 'IN_PROGRESS'));
                  const isChecked = selectedForCompare.includes(vendor.id);

                  // Days to contract end
                  const daysToExpiry = activeContract
                    ? Math.ceil((new Date(activeContract.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : 999;

                  const isRenewingSoon = daysToExpiry > 0 && daysToExpiry <= 75;

                  return (
                    <tr 
                      key={vendor.id} 
                      className={`hover:bg-indigo-50/40 transition-colors ${
                        vBreaches.length > 0 ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Compare Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCompare(vendor.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                        />
                      </td>

                      {/* Vendor & Tier */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                            {vendor.name.charAt(0)}
                          </div>
                          <div>
                            <button
                              onClick={() => setActiveVendorId(vendor.id)}
                              className="font-semibold text-slate-900 hover:text-indigo-600 text-left block leading-tight transition-colors"
                            >
                              {vendor.name}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                              <span>{vendor.category}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">{vendor.country}</span>
                              {sc?.tier && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60 text-[10px]">
                                    {sc.tier}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Composite Health */}
                      <td className="py-3.5 px-4">
                        {sc ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 font-mono text-xs">{sc.compositeScore}%</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              sc.compositeScore >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                              sc.compositeScore >= 75 ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 'bg-rose-50 text-rose-700 border-rose-200/60'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                sc.compositeScore >= 85 ? 'bg-emerald-500' :
                                sc.compositeScore >= 75 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                              }`} />
                              {sc.compositeScore >= 85 ? 'Good' : sc.compositeScore >= 75 ? 'Fair' : 'At Risk'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Pending</span>
                        )}
                      </td>

                      {/* SLA Achievement */}
                      <td className="py-3.5 px-4">
                        {sc?.slaAchievementRate ? (
                          <div className="flex items-center gap-1.5 font-medium text-xs text-slate-800">
                            <span className="font-mono font-semibold">{sc.slaAchievementRate}%</span>
                            {sc.slaAchievementRate >= 98 ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded text-[10px] font-semibold">✓ Met</span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded text-[10px] font-semibold">Lag</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">98.5%</span>
                        )}
                      </td>

                      {/* AP Reconciliation */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800">
                            {sc?.invoiceAccuracyRate ? `${sc.invoiceAccuracyRate}% Clean` : '100% Match'}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            Terms: {vendor.paymentTerms}
                          </span>
                        </div>
                      </td>

                      {/* Active Contract & Term */}
                      <td className="py-3.5 px-4">
                        {activeContract ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-slate-800 font-semibold block">
                              {activeContract.contractNumber}
                            </span>
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="font-medium text-indigo-700">${(activeContract.totalValue / 1000).toFixed(0)}k/yr</span>
                              <span>•</span>
                              <span className={isRenewingSoon ? 'text-amber-700 font-bold' : 'text-slate-500'}>
                                {isRenewingSoon ? `Renew in ${daysToExpiry}d` : `Valid to ${activeContract.endDate}`}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Standard Terms</span>
                        )}
                      </td>

                      {/* Breaches & Claimable Credits */}
                      <td className="py-3.5 px-4">
                        {vBreaches.length > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse shrink-0" />
                              {vBreaches.length} Breach (${vBreaches.reduce((a,b)=>a+b.serviceCreditPenalty,0).toLocaleString()})
                            </span>
                            <button
                              onClick={() => handleClaimCredit(vBreaches[0].id)}
                              className="block text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                            >
                              Claim Credit Memo →
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            0 Breaches
                          </span>
                        )}
                      </td>

                      {/* CIM Action Plan */}
                      <td className="py-3.5 px-4">
                        {vCim.length > 0 ? (
                          <div className="space-y-0.5">
                            <span className="font-medium text-slate-800 truncate max-w-[140px] block" title={vCim[0].title}>
                              {vCim[0].title}
                            </span>
                            <span className="text-[10px] text-amber-700 font-mono font-medium">
                              Due: {vCim[0].dueDate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">None required</span>
                        )}
                      </td>

                      {/* Manager Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveVendorId(vendor.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/80 hover:border-indigo-600 transition-all flex items-center gap-1 shadow-2xs group"
                          >
                            Workspace 360
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Comparison Modal (ServiceNow Feature) */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Vendor Benchmark & Side-by-Side Comparison"
        subtitle="Compare KPI scores, SLA performance, 3-way match rates, and contract terms across selected partners."
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {selectedForCompare.length < 2 ? (
            <div className="p-8 text-center text-slate-500">
              <Scale className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Select at least 2 vendors to compare</p>
              <p className="text-xs text-slate-500 mt-1">Use the checkboxes on the workspace table to select vendors.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-3 text-left font-semibold w-40 border-r border-slate-200">Evaluation Criteria</th>
                    {selectedForCompare.map(vid => {
                      const v = vendors.find(x => x.id === vid);
                      return (
                        <th key={vid} className="p-3 text-left font-bold border-r border-slate-200 last:border-r-0">
                          <div className="font-bold text-sm text-slate-900">{v?.name}</div>
                          <div className="text-[11px] font-normal text-slate-500">{v?.category} • {v?.country}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {/* Row 1: Composite Health Score */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 bg-slate-50 border-r border-slate-200">
                      Composite Performance Score
                    </td>
                    {selectedForCompare.map(vid => {
                      const sc = scorecards[vid];
                      return (
                        <td key={vid} className="p-3 border-r border-slate-200 last:border-r-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-slate-900">{sc?.compositeScore || 85}%</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-blue-100 text-blue-800">
                              {sc?.tier || 'STANDARD'}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 2: SLA Fulfillment */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 bg-slate-50 border-r border-slate-200">
                      SLA Fulfillment Rate
                    </td>
                    {selectedForCompare.map(vid => {
                      const sc = scorecards[vid];
                      const rate = sc?.slaAchievementRate || 98.0;
                      return (
                        <td key={vid} className="p-3 border-r border-slate-200 last:border-r-0">
                          <span className={`font-semibold ${rate >= 98 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {rate}% (Target 98.0%)
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 3: AP 3-Way Match Accuracy */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 bg-slate-50 border-r border-slate-200">
                      AP Invoice Match Accuracy
                    </td>
                    {selectedForCompare.map(vid => {
                      const sc = scorecards[vid];
                      return (
                        <td key={vid} className="p-3 border-r border-slate-200 last:border-r-0">
                          <span className="font-semibold text-slate-800">
                            {sc?.invoiceAccuracyRate || 99}% Clean
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 4: On-Time In-Full Delivery */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 bg-slate-50 border-r border-slate-200">
                      On-Time Delivery (OTIF)
                    </td>
                    {selectedForCompare.map(vid => {
                      const sc = scorecards[vid];
                      return (
                        <td key={vid} className="p-3 border-r border-slate-200 last:border-r-0">
                          <span className="font-medium text-slate-800">{sc?.onTimeDeliveryRate || 95}%</span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 5: Payment Terms & Early Discounts */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 bg-slate-50 border-r border-slate-200">
                      Payment Terms & Discounts
                    </td>
                    {selectedForCompare.map(vid => {
                      const v = vendors.find(x => x.id === vid);
                      return (
                        <td key={vid} className="p-3 border-r border-slate-200 last:border-r-0">
                          <span className="font-mono text-slate-800">{v?.paymentTerms}</span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 6: Active Breaches & Penalties */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 bg-slate-50 border-r border-slate-200">
                      SLA Breaches & Penalties
                    </td>
                    {selectedForCompare.map(vid => {
                      const vBreaches = breaches.filter(b => b.vendorId === vid && b.status === 'OPEN');
                      return (
                        <td key={vid} className="p-3 border-r border-slate-200 last:border-r-0">
                          {vBreaches.length > 0 ? (
                            <span className="text-rose-600 font-bold">
                              {vBreaches.length} Breach (${vBreaches.reduce((a,b)=>a+b.serviceCreditPenalty,0).toLocaleString()})
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">0 Active Breaches</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 7: Contract Total & Expiry */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 bg-slate-50 border-r border-slate-200">
                      Contract & Term Expiry
                    </td>
                    {selectedForCompare.map(vid => {
                      const vContract = contracts.find(c => c.vendorId === vid);
                      return (
                        <td key={vid} className="p-3 border-r border-slate-200 last:border-r-0">
                          {vContract ? (
                            <div>
                              <div className="font-medium text-slate-900">${(vContract.totalValue / 1000).toFixed(0)}k/yr</div>
                              <div className="text-[10px] text-slate-500">Expires: {vContract.endDate}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Open PO arrangement</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 8: Manager Recommendation */}
                  <tr className="bg-blue-50/40">
                    <td className="p-3 font-semibold text-blue-900 bg-blue-100/50 border-r border-slate-200">
                      Procurement Recommendation
                    </td>
                    {selectedForCompare.map(vid => {
                      const sc = scorecards[vid];
                      const vBreaches = breaches.filter(b => b.vendorId === vid && b.status === 'OPEN');
                      const score = sc?.compositeScore || 85;
                      return (
                        <td key={vid} className="p-3 border-r border-slate-200 last:border-r-0">
                          {vBreaches.length > 0 ? (
                            <span className="text-amber-800 font-medium">
                              ⚠️ Hold expansion. Demand SLA penalty credit deduction and review CIM plan before renewal.
                            </span>
                          ) : score >= 95 ? (
                            <span className="text-emerald-800 font-medium">
                              ⭐ Recommended for contract renewal and volume allocation. Top-tier reliability.
                            </span>
                          ) : (
                            <span className="text-slate-700 font-medium">
                              ✓ Reliable for non-critical purchase orders with standard terms.
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </Modal>

      {/* Vendor 360 Workspace Drawer/Modal (ServiceNow Xanadu Deep-Dive) */}
      <Modal
        isOpen={Boolean(activeVendorId)}
        onClose={() => setActiveVendorId(null)}
        title={activeVendor ? `${activeVendor.name} — Workspace 360` : 'Vendor 360 Workspace'}
        subtitle={`Category: ${activeVendor?.category} | Country: ${activeVendor?.country} | Status: ${activeVendor?.status}`}
        maxWidth="max-w-4xl"
      >
        {activeVendor && (
          <div className="space-y-6">
            {/* Top Scorecard & KPI Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Composite Score</span>
                <span className="text-2xl font-bold text-slate-900">{activeScorecard?.compositeScore || 90}%</span>
                <span className="text-[10px] text-blue-600 font-semibold block">{activeScorecard?.tier || 'PREFERRED'} TIER</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">SLA Compliance</span>
                <span className="text-2xl font-bold text-slate-900">{activeScorecard?.slaAchievementRate || 98.5}%</span>
                <span className="text-[10px] text-slate-500 block">Target: 98.0%</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">AP 3-Way Match</span>
                <span className="text-2xl font-bold text-slate-900">{activeScorecard?.invoiceAccuracyRate || 99}%</span>
                <span className="text-[10px] text-slate-500 block">Clean Invoicing Rate</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Active Breaches</span>
                <span className={`text-2xl font-bold ${activeVendorBreaches.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {activeVendorBreaches.length}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {activeVendorBreaches.length > 0 ? `$${activeVendorBreaches.reduce((a,b)=>a+b.serviceCreditPenalty,0).toLocaleString()} Credit Owed` : 'All Terms Met'}
                </span>
              </div>
            </div>

            {/* Section 1: Contracts & SLA Terms */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Active Contracts & Agreed SLA Commitments
                </h3>
                <span className="text-xs text-slate-500 font-medium">{activeVendorContracts.length} Contract(s) Active</span>
              </div>

              {activeVendorContracts.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                  No dedicated master contract on file. Vendor operating under standard purchase order terms.
                </div>
              ) : (
                activeVendorContracts.map(ctr => (
                  <div key={ctr.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{ctr.title}</span>
                          <span className="font-mono text-xs text-slate-500">({ctr.contractNumber})</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Committed: ${ctr.totalValue.toLocaleString()} {ctr.currency} | Term: {ctr.startDate} to {ctr.endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {ctr.status}
                        </span>
                        <button
                          onClick={() => {
                            const res = storage.renewContract(ctr.id, 12);
                            setClaimSuccessToast(res.message);
                            setTimeout(() => setClaimSuccessToast(null), 4000);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          Extend +12 Mo
                        </button>
                      </div>
                    </div>

                    {/* SLAs table inside contract */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-700">Contractual SLA Thresholds:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {ctr.slas.map(sla => (
                          <div key={sla.id} className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800">{sla.name}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                sla.status === 'MET' ? 'bg-emerald-100 text-emerald-800' :
                                sla.status === 'AT_RISK' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {sla.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600 text-[11px]">
                              <span>Target: <strong>{sla.target}{sla.unit}</strong></span>
                              <span>Current: <strong className={sla.status === 'BREACHED' ? 'text-rose-600' : 'text-slate-900'}>{sla.currentMetric}{sla.unit}</strong></span>
                            </div>
                            <p className="text-[10px] text-slate-500 italic">{sla.penaltyClause}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Section 2: SLA Breaches & Financial Service Credit Recovery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  SLA Breaches & Contractual Service Credits
                </h3>
                <span className="text-xs text-slate-500">{activeVendorBreaches.length} Recorded Breach(es)</span>
              </div>

              {activeVendorBreaches.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No active SLA breaches. Vendor is meeting contractual fulfillment commitments cleanly.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeVendorBreaches.map(breach => (
                    <div key={breach.id} className="p-3.5 border border-rose-200 bg-rose-50/50 rounded-lg space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-900">{breach.slaName}</span>
                            <span className="font-mono text-[10px] text-slate-500">({breach.id})</span>
                          </div>
                          <span className="text-slate-600 text-[11px] block mt-0.5">
                            Breached on {breach.breachDate} against contract {breach.contractNumber}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-rose-600 block">
                            ${breach.serviceCreditPenalty.toLocaleString()} {breach.currency}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">Service Credit Penalty</span>
                        </div>
                      </div>

                      <div className="p-2 bg-white/80 rounded border border-rose-100 text-[11px] text-slate-700 space-y-0.5">
                        <div><strong>Target:</strong> {breach.targetThreshold}</div>
                        <div><strong>Actual Measured:</strong> <span className="text-rose-600 font-semibold">{breach.actualMetric}</span></div>
                        <div><strong>Business Impact:</strong> {breach.businessImpact}</div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500">
                          Status: <strong className="text-rose-700">{breach.status}</strong>
                        </span>
                        {breach.status === 'OPEN' ? (
                          <button
                            onClick={() => handleClaimCredit(breach.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Claim Credit Memo into AP (${breach.serviceCreditPenalty.toLocaleString()})
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Credit Memo #{breach.apCreditMemoId} Deducted in AP
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Continual Improvement Management (CIM) Action Plans */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-600" />
                  Continual Improvement Remediation (CIM / SCAR)
                </h3>
                <button
                  onClick={() => setIsNewCimOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                >
                  + Add Action Plan
                </button>
              </div>

              {activeVendorCim.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                  No active corrective action requests. Vendor quality is within acceptable control limits.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeVendorCim.map(plan => (
                    <div key={plan.id} className="p-3.5 border border-slate-200 rounded-lg bg-white space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{plan.title}</span>
                            <span className="font-mono text-[10px] text-slate-500">({plan.id})</span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Assigned to: {plan.assignedTo} | Vendor Contact: {plan.vendorContact}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          plan.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {plan.status}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded text-[11px] text-slate-700 space-y-1">
                        <div><strong>Performance Gap:</strong> {plan.issueDescription}</div>
                        <div><strong>Remediation Steps:</strong> {plan.requiredAction}</div>
                        <div><strong>Target Due Date:</strong> <span className="font-semibold text-blue-700">{plan.dueDate}</span></div>
                      </div>

                      {plan.status !== 'RESOLVED' && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              storage.resolveCimPlan(plan.id, 'Root cause addressed, verified in subsequent audit run.');
                              setClaimSuccessToast(`Remediation plan ${plan.id} verified & closed.`);
                              setTimeout(() => setClaimSuccessToast(null), 4000);
                            }}
                            className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Verify & Close Plan
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: AP Automation Link */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-slate-700" />
                  Accounts Payable Invoicing Reconciliation
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeVendorInvoices.length} invoices logged. 3-Way matched against contracted POs and receipt slips.
                </p>
              </div>
              {onNavigateToAp && (
                <button
                  onClick={() => {
                    setActiveVendorId(null);
                    onNavigateToAp();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                >
                  Open AP Hub
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setActiveVendorId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                Close Drawer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Create Contract & SLA */}
      <Modal
        isOpen={isNewContractOpen}
        onClose={() => setIsNewContractOpen(false)}
        title="Record New Vendor Contract & SLA Targets"
        subtitle="Establish contractual SLAs, delivery thresholds, and automatic service credit liquidated damages."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateContract} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Vendor</label>
            <select
              value={newContractForm.vendorId}
              onChange={e => setNewContractForm({ ...newContractForm, vendorId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contract Title & Scope</label>
            <input
              type="text"
              required
              value={newContractForm.title}
              onChange={e => setNewContractForm({ ...newContractForm, title: e.target.value })}
              placeholder="e.g. Master Services Agreement (MSA) - Cloud Logistics"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Annual Value ($)</label>
              <input
                type="number"
                required
                value={newContractForm.totalValue}
                onChange={e => setNewContractForm({ ...newContractForm, totalValue: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contract End Date</label>
              <input
                type="date"
                required
                value={newContractForm.endDate}
                onChange={e => setNewContractForm({ ...newContractForm, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <span className="font-bold text-slate-800 block">Primary SLA Commitment:</span>
            <div>
              <label className="block text-slate-600 mb-1">SLA Metric Name</label>
              <input
                type="text"
                required
                value={newContractForm.slaName}
                onChange={e => setNewContractForm({ ...newContractForm, slaName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Target Threshold (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newContractForm.slaTarget}
                  onChange={e => setNewContractForm({ ...newContractForm, slaTarget: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Breach Penalty ($/Credit)</label>
                <input
                  type="number"
                  required
                  value={newContractForm.slaPenalty}
                  onChange={e => setNewContractForm({ ...newContractForm, slaPenalty: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewContractOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Contract & SLAs
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create CIM Action Plan */}
      <Modal
        isOpen={isNewCimOpen}
        onClose={() => setIsNewCimOpen(false)}
        title="Open Continual Improvement Remediation (CIM / SCAR)"
        subtitle="Mandate supplier performance corrections, root-cause analyses, or compliance audits."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateCim} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Vendor</label>
            <select
              value={newCimForm.vendorId}
              onChange={e => setNewCimForm({ ...newCimForm, vendorId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Action Plan Title</label>
            <input
              type="text"
              required
              value={newCimForm.title}
              onChange={e => setNewCimForm({ ...newCimForm, title: e.target.value })}
              placeholder="e.g. Price Catalog EDI Alignment & Freight Lead Time SLA"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Performance Gap / Root Cause</label>
            <textarea
              required
              rows={2}
              value={newCimForm.issueDescription}
              onChange={e => setNewCimForm({ ...newCimForm, issueDescription: e.target.value })}
              placeholder="Describe recurring delivery delay or invoicing discrepancy..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mandatory Remediation Actions</label>
            <textarea
              required
              rows={2}
              value={newCimForm.requiredAction}
              onChange={e => setNewCimForm({ ...newCimForm, requiredAction: e.target.value })}
              placeholder="Provide synchronized ERP catalog, recalibrate temperature sensors..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity</label>
              <select
                value={newCimForm.severity}
                onChange={e => setNewCimForm({ ...newCimForm, severity: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Resolution Date</label>
              <input
                type="date"
                required
                value={newCimForm.dueDate}
                onChange={e => setNewCimForm({ ...newCimForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewCimOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Issue Action Plan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
