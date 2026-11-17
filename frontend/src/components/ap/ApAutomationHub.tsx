import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppStorage } from '../../lib/storage';
import { VendorInvoice, VendorScorecard } from '../../types';
import { UserMfaProfile } from '../../lib/firebase';
import { Modal } from '../common/Modal';
import { MfaChallengeModal } from '../auth/MfaChallengeModal';
import { 
  Receipt, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  FileCheck2, 
  ShieldAlert, 
  ArrowRight, 
  TrendingUp, 
  Send, 
  Sparkles, 
  Filter, 
  Search, 
  Building2, 
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface ApAutomationHubProps {
  userProfile: UserMfaProfile;
  onNavigateToRiskExceptions: () => void;
  onNavigateToVendor: (vendorId: string) => void;
}

export function ApAutomationHub({
  userProfile,
  onNavigateToRiskExceptions,
  onNavigateToVendor
}: ApAutomationHubProps) {
  const storage = AppStorage.getInstance();
  const invoices = storage.getInvoices();
  const scorecards = storage.getScorecards();
  const bankChanges = storage.getBankChangeRequests();

  const [activeTab, setActiveTab] = useState<'ALL' | 'READY' | 'VARIANCE' | 'PAID'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  
  // Modals
  const [inspectingInvoice, setInspectingInvoice] = useState<VendorInvoice | null>(null);
  const [varianceResolutionModal, setVarianceResolutionModal] = useState<VendorInvoice | null>(null);
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isMfaBatchDisburseOpen, setIsMfaBatchDisburseOpen] = useState(false);
  const [batchActionFeedback, setBatchActionFeedback] = useState<string | null>(null);

  // New Invoice Modal
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [newInvVendor, setNewInvVendor] = useState('vnd-nordic-1002');
  const [newInvAmount, setNewInvAmount] = useState('8500');
  const [newInvScenario, setNewInvScenario] = useState<'MATCH' | 'PRICE_DISCREPANCY' | 'QTY_DISCREPANCY'>('MATCH');

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.poNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'READY') return inv.status === 'READY_FOR_PAYMENT';
    if (activeTab === 'VARIANCE') return inv.status === 'VARIANCE_FLAGGED';
    if (activeTab === 'PAID') return inv.status === 'PAID';
    return true;
  });

  // KPI Calculations
  const readyInvoices = invoices.filter(i => i.status === 'READY_FOR_PAYMENT');
  const readyTotal = readyInvoices.reduce((sum, i) => sum + i.amount, 0);
  const varianceInvoices = invoices.filter(i => i.status === 'VARIANCE_FLAGGED');
  const varianceTotal = varianceInvoices.reduce((sum, i) => sum + i.amount, 0);
  const paidInvoices = invoices.filter(i => i.status === 'PAID');
  const paidTotal = paidInvoices.reduce((sum, i) => sum + i.amount, 0);

  // Early discount potential (e.g., $368 on inv-8801)
  const discountEligible = invoices.filter(i => i.status === 'READY_FOR_PAYMENT' && i.earlyDiscountTerms);
  const discountSavingsAvailable = 368.0;

  // Toggle selection for batch payment
  const handleToggleSelect = (id: string) => {
    setSelectedInvoiceIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllReady = () => {
    const readyIds = readyInvoices.map(i => i.id);
    if (selectedInvoiceIds.length === readyIds.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(readyIds);
    }
  };

  const selectedTotal = invoices
    .filter(i => selectedInvoiceIds.includes(i.id))
    .reduce((sum, i) => sum + i.amount, 0);

  // Execute Batch Payment
  const handleConfirmDisbursement = () => {
    const res = storage.disbursePaymentBatch(selectedInvoiceIds, true);
    setIsMfaBatchDisburseOpen(false);
    setSelectedInvoiceIds([]);
    if (res.success) {
      setBatchActionFeedback(`Payment Run Confirmed: ${res.message}`);
      setTimeout(() => setBatchActionFeedback(null), 5000);
    } else {
      setBatchActionFeedback(`Error: ${res.message}`);
    }
  };

  // Resolve variance
  const handleResolveVariance = (resolution: 'ACCEPT_PRICE_OVERRIDE' | 'REQUEST_CREDIT_MEMO') => {
    if (!varianceResolutionModal) return;
    storage.resolveInvoiceVariance(
      varianceResolutionModal.id, 
      resolution, 
      overrideNotes || (resolution === 'ACCEPT_PRICE_OVERRIDE' ? 'Manager approved pricing exception within 10% tolerance' : 'Requested credit memo for billing error')
    );
    setVarianceResolutionModal(null);
    setOverrideNotes('');
    setBatchActionFeedback(`Variance resolved: ${resolution === 'ACCEPT_PRICE_OVERRIDE' ? 'Accepted & Moved to Ready for Payment' : 'Rejected & Dispute notice generated'}`);
    setTimeout(() => setBatchActionFeedback(null), 5000);
  };

  // Submit test invoice
  const handleCreateTestInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newInvAmount) || 5000;
    let matchStatus: VendorInvoice['matchingStatus'] = '3_WAY_MATCH_PASS';
    let status: VendorInvoice['status'] = 'READY_FOR_PAYMENT';
    let poAmt = amt;
    let recAmt = amt;
    let varianceMsg: string | undefined = undefined;

    if (newInvScenario === 'PRICE_DISCREPANCY') {
      matchStatus = 'PRICE_DISCREPANCY';
      status = 'VARIANCE_FLAGGED';
      poAmt = Math.round(amt * 0.9);
      recAmt = poAmt;
      varianceMsg = `Unit price billed higher than contracted purchase order (+11.1% price variance).`;
    } else if (newInvScenario === 'QTY_DISCREPANCY') {
      matchStatus = 'QUANTITY_DISCREPANCY';
      status = 'VARIANCE_FLAGGED';
      recAmt = Math.round(amt * 0.75);
      varianceMsg = `Invoiced for full order quantity, but receiving dock logged only 75% items received.`;
    }

    storage.createInvoice({
      vendorId: newInvVendor,
      vendorName: newInvVendor === 'vnd-nordic-1002' ? 'Nordic Logistics OY' : 'Apex Industrial Supplies Private Limited',
      amount: amt,
      poAmount: poAmt,
      receivedAmount: recAmt,
      matchingStatus: matchStatus,
      status: status,
      varianceReason: varianceMsg,
      earlyDiscountTerms: '2% 10 Net 30',
    });

    setIsNewInvoiceModalOpen(false);
    setBatchActionFeedback(`New electronic invoice ingested and evaluated against Purchase Order.`);
    setTimeout(() => setBatchActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {batchActionFeedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{batchActionFeedback}</span>
          </div>
          <button 
            onClick={() => setBatchActionFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Value Proposition */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FINANCE & TREASURY</span>
              <span>·</span>
              <span className="text-slate-500 font-normal">3-Way Matching & Automated AP Engine</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Accounts Payable (AP) & Invoice Matching
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              Automated reconciliation across Purchase Orders (PO), Goods Received Notes (GRN), and Vendor Invoices with early discount capture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsNewInvoiceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 border border-indigo-200/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-500" />
              Ingest Invoice
            </motion.button>

            {selectedInvoiceIds.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsMfaBatchDisburseOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-emerald-600/25"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Release Batch Run (${selectedTotal.toLocaleString()})
              </motion.button>
            )}
          </div>
        </div>

        {/* 4 Manager KPI Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100">
          <motion.div 
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="relative bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500 absolute top-0 left-0" />
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Ready for Payment</span>
              <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
              ${readyTotal.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
              <span>{readyInvoices.length} invoices verified</span>
              {selectedInvoiceIds.length > 0 && (
                <span className="font-semibold text-indigo-600">{selectedInvoiceIds.length} selected</span>
              )}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="relative bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-500 absolute top-0 left-0" />
            <div className="flex items-center justify-between text-amber-800 text-xs font-medium mb-1.5">
              <span>Variances / Discrepancies</span>
              <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">
              ${varianceTotal.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5 font-medium">
              {varianceInvoices.length} require manager sign-off
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="relative bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-blue-600 absolute top-0 left-0" />
            <div className="flex items-center justify-between text-indigo-800 text-xs font-medium mb-1.5">
              <span>Early Discounts Active</span>
              <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-indigo-900 mt-1 font-mono">
              ${discountSavingsAvailable.toLocaleString()}
            </div>
            <div className="text-[11px] text-indigo-600 mt-0.5 font-medium">
              Available savings if paid this week
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="relative bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-slate-600 to-slate-800 absolute top-0 left-0" />
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Disbursed YTD</span>
              <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
              ${paidTotal.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {paidInvoices.length} settled with verified audit logs
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Table and Control Bar */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        {/* Controls */}
        <div className="p-3.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          {/* Quick Filters */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              All Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('READY')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'READY'
                  ? 'bg-slate-900 text-white'
                  : 'bg-transparent text-emerald-800 hover:bg-emerald-50/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready for Payment ({readyInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab('VARIANCE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'VARIANCE'
                  ? 'bg-slate-900 text-white'
                  : 'bg-transparent text-amber-800 hover:bg-amber-50/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Variance Flagged ({varianceInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab('PAID')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'PAID'
                  ? 'bg-slate-900 text-white'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              Settled / Paid ({paidInvoices.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search invoice #, PO #, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600 text-slate-800"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedInvoiceIds.length > 0 && selectedInvoiceIds.length === readyInvoices.length}
                    onChange={handleSelectAllReady}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title="Select all ready for payment"
                  />
                </th>
                <th className="py-3 px-3">Invoice & PO #</th>
                <th className="py-3 px-3">Vendor Legal Name</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3 text-right">Invoiced Amount</th>
                <th className="py-3 px-3">3-Way Match Status</th>
                <th className="py-3 px-3">Early Terms</th>
                <th className="py-3 px-3">Invoice State</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const isSelected = selectedInvoiceIds.includes(inv.id);
                const isReady = inv.status === 'READY_FOR_PAYMENT';
                const isVariance = inv.status === 'VARIANCE_FLAGGED';
                const isPaid = inv.status === 'PAID';
                const isScheduled = inv.status === 'SCHEDULED';
                const scorecard = scorecards[inv.vendorId];
                const hasHold = bankChanges.some(b => b.vendorId === inv.vendorId && (b.status === 'PENDING_HOLD' || b.status === 'PHONE_VERIFIED'));

                return (
                  <tr 
                    key={inv.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        disabled={!isReady}
                        checked={isSelected}
                        onChange={() => handleToggleSelect(inv.id)}
                        className={`rounded border-slate-300 text-blue-600 focus:ring-blue-500 ${
                          isReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'
                        }`}
                      />
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-400">PO: {inv.poNumber}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{inv.vendorName}</span>
                        {scorecard && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            scorecard.tier === 'STRATEGIC' ? 'bg-purple-100 text-purple-800' :
                            scorecard.tier === 'PREFERRED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            ★ {scorecard.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Via {inv.paymentMethod}</span>
                        {hasHold && (
                          <span className="text-rose-600 font-bold flex items-center gap-0.5">
                            <ShieldAlert className="w-3 h-3" /> Bank Hold Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{inv.dueDate}</div>
                      <div className="text-[10px] text-slate-400">Issued {inv.invoiceDate}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                      ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      {inv.matchingStatus === '3_WAY_MATCH_PASS' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          3-Way Verified
                        </span>
                      )}
                      {inv.matchingStatus === 'PRICE_DISCREPANCY' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Price Variance (+5.2%)
                        </span>
                      )}
                      {inv.matchingStatus === 'QUANTITY_DISCREPANCY' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Qty Shortage (40/50 rec'd)
                        </span>
                      )}
                      {inv.matchingStatus === 'RECEIPT_PENDING' && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-blue-600" />
                          Receipt Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {inv.earlyDiscountTerms ? (
                        <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {inv.earlyDiscountTerms}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isReady && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                          Ready for Payment
                        </span>
                      )}
                      {isVariance && (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-bold">
                          Variance Review
                        </span>
                      )}
                      {isScheduled && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[11px] font-bold">
                          Hold Locked
                        </span>
                      )}
                      {isPaid && (
                        <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                          Paid & Settled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingInvoice(inv)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                        >
                          Inspect Match
                        </button>

                        {isVariance && (
                          <button
                            onClick={() => {
                              setVarianceResolutionModal(inv);
                              setOverrideNotes('');
                            }}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold transition-colors"
                          >
                            Resolve
                          </button>
                        )}

                        {isScheduled && hasHold && (
                          <button
                            onClick={onNavigateToRiskExceptions}
                            className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold transition-colors"
                          >
                            View Hold
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Way Match Visual Inspector Modal */}
      {inspectingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingInvoice(null)}
          title={`3-Way Match Inspector — ${inspectingInvoice.invoiceNumber}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Vendor:</span>{' '}
                <span className="font-bold text-slate-900">{inspectingInvoice.vendorName}</span>
              </div>
              <div>
                <span className="text-slate-500">Purchase Order:</span>{' '}
                <span className="font-mono font-bold text-slate-900">{inspectingInvoice.poNumber}</span>
              </div>
              <div>
                <span className="text-slate-500">Payment Due:</span>{' '}
                <span className="font-bold text-slate-900">{inspectingInvoice.dueDate}</span>
              </div>
            </div>

            {/* 3-Way Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Pillar 1: Contracted PO */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    1. Purchase Order (PO)
                  </span>
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">PO Number:</span>
                    <span className="font-mono font-medium">{inspectingInvoice.poNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contract Total:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${inspectingInvoice.poAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Buyer:</span>
                    <span>Terybi Procurement</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Receiving Slip (GRN) */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    2. Receiving Slip (GRN)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">GRN Ref:</span>
                    <span className="font-mono font-medium">GRN-{inspectingInvoice.poNumber.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accepted Value:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${inspectingInvoice.receivedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dock Inspection:</span>
                    <span className="text-emerald-700 font-semibold">Accepted in Full</span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Vendor Invoice */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    3. Vendor Invoice
                  </span>
                  <Receipt className="w-4 h-4 text-slate-700" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice Ref:</span>
                    <span className="font-mono font-medium">{inspectingInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billed Amount:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${inspectingInvoice.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Match Tolerance:</span>
                    <span className={inspectingInvoice.poAmount === inspectingInvoice.amount ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                      {inspectingInvoice.poAmount === inspectingInvoice.amount ? "0% Variance (Exact)" : "Variance Flagged"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items breakdown */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                Invoiced Line Items
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspectingInvoice.lineItems.map((li, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 font-medium text-slate-800">{li.item}</td>
                      <td className="py-2 px-3 text-center font-mono">{li.qty}</td>
                      <td className="py-2 px-3 text-right font-mono">${li.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">${li.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Variance Note if any */}
            {inspectingInvoice.varianceReason && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Variance Audit Detail:
                </div>
                <div>{inspectingInvoice.varianceReason}</div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectingInvoice(null)}
                className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close Inspector
              </button>
              {inspectingInvoice.status === 'VARIANCE_FLAGGED' && (
                <button
                  onClick={() => {
                    setVarianceResolutionModal(inspectingInvoice);
                    setInspectingInvoice(null);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded text-xs font-bold text-white"
                >
                  Resolve Discrepancy
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Variance Resolution Modal */}
      {varianceResolutionModal && (
        <Modal
          isOpen={true}
          onClose={() => setVarianceResolutionModal(null)}
          title={`Manager Variance Review — ${varianceResolutionModal.invoiceNumber}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-950">
              <div className="font-bold">Detected Variance:</div>
              <p className="mt-1">{varianceResolutionModal.varianceReason}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Manager Justification or Dispute Notes (Mandatory for Audit Trail)
              </label>
              <textarea
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="E.g., Approved price fluctuation within contracted raw materials adjustment clause; or Vendor notified to issue $700 credit memo."
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleResolveVariance('REQUEST_CREDIT_MEMO')}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition-colors"
              >
                Reject & Request Credit Memo
              </button>
              <button
                onClick={() => handleResolveVariance('ACCEPT_PRICE_OVERRIDE')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors"
              >
                Accept Variance & Approve
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MFA Step-Up Challenge for Batch Payment Release */}
      <MfaChallengeModal
        isOpen={isMfaBatchDisburseOpen}
        onClose={() => setIsMfaBatchDisburseOpen(false)}
        actionTitle="Payment Run Disbursement Release"
        actionDescription={`Disburse $${selectedTotal.toLocaleString()} across ${selectedInvoiceIds.length} approved vendor invoices via NACHA Direct ACH / SEPA Wire Transfer.`}
        onSuccess={handleConfirmDisbursement}
        userProfile={userProfile}
      />

      {/* Manual / Electronic Ingestion Modal */}
      {isNewInvoiceModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsNewInvoiceModalOpen(false)}
          title="Ingest Electronic Vendor Invoice"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateTestInvoice} className="space-y-4">
            <p className="text-xs text-slate-500">
              Simulates automated ingestion via EDI 810 or OCR scanning. The engine will match against active PO records in real time.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Vendor Entity</label>
              <select
                value={newInvVendor}
                onChange={(e) => setNewInvVendor(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs text-slate-800"
              >
                <option value="vnd-nordic-1002">Nordic Logistics OY (Active Preferred Vendor)</option>
                <option value="vnd-apex-1001">Apex Industrial Supplies Private Limited</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Invoice Billed Amount ($ USD)</label>
              <input
                type="number"
                value={newInvAmount}
                onChange={(e) => setNewInvAmount(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs text-slate-800 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">3-Way Match Test Scenario</label>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 text-xs">
                  <input
                    type="radio"
                    name="scenario"
                    checked={newInvScenario === 'MATCH'}
                    onChange={() => setNewInvScenario('MATCH')}
                    className="text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Clean 3-Way Match:</span>
                    <span className="text-slate-500 ml-1">PO and goods received match invoice 100%.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 text-xs">
                  <input
                    type="radio"
                    name="scenario"
                    checked={newInvScenario === 'PRICE_DISCREPANCY'}
                    onChange={() => setNewInvScenario('PRICE_DISCREPANCY')}
                    className="text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Price Variance Discrepancy:</span>
                    <span className="text-slate-500 ml-1">Billed at +11.1% over contracted purchase order.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 text-xs">
                  <input
                    type="radio"
                    name="scenario"
                    checked={newInvScenario === 'QTY_DISCREPANCY'}
                    onChange={() => setNewInvScenario('QTY_DISCREPANCY')}
                    className="text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Quantity Shortage Discrepancy:</span>
                    <span className="text-slate-500 ml-1">Invoiced for full order, dock received only 75%.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-bold text-white shadow-xs"
              >
                Ingest & Reconcile
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
