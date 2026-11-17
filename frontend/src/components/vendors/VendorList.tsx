import React, { useState } from 'react';
import { Vendor, VendorScorecard } from '../../types';
import { AppStorage } from '../../lib/storage';
import { RiskBadge, CountryFlag } from '../common/Badge';
import { Modal } from '../common/Modal';
import { 
  Search, 
  Building, 
  ShieldAlert, 
  ArrowUpRight, 
  Lock, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  FileText, 
  Calendar, 
  Clock, 
  Award,
  ChevronRight,
  CreditCard
} from 'lucide-react';

interface VendorListProps {
  vendors: Vendor[];
  onSelectApplication: (appId: string) => void;
  onNavigateToRiskExceptions: () => void;
  onNavigateToAp?: () => void;
}

export function VendorList({ 
  vendors, 
  onSelectApplication, 
  onNavigateToRiskExceptions,
  onNavigateToAp
}: VendorListProps) {
  const storage = AppStorage.getInstance();
  const scorecards = storage.getScorecards();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [inspectingVendor, setInspectingVendor] = useState<Vendor | null>(null);

  const filtered = vendors.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    
    const sc = scorecards[v.id];
    const matchesTier = tierFilter === 'ALL' || (sc && sc.tier === tierFilter);

    return matchesSearch && matchesStatus && matchesTier;
  });

  const selectedScorecard: VendorScorecard | undefined = inspectingVendor ? scorecards[inspectingVendor.id] : undefined;

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span className="font-semibold text-slate-900 tracking-tight">DIRECTORY</span>
              <span>·</span>
              <span>Vendor 360 Scorecards</span>
            </div>
            <h2 className="text-base font-semibold text-slate-950 tracking-tight">Vendor Master Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Corporate vendor directory with certified payment instructions, performance ratings, and 3-way match accuracy rates.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            {vendors.length} Total Master Entities
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search vendor by name, ID, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2 border border-slate-200 rounded text-xs text-slate-700"
            >
              <option value="ALL">All Vendor States</option>
              <option value="ACTIVE">Active (Disbursement Eligible)</option>
              <option value="PENDING_ONBOARDING">Pending Onboarding</option>
              <option value="BLOCKED">Blocked / Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full py-1.5 px-2 border border-slate-200 rounded text-xs text-slate-700"
            >
              <option value="ALL">All Performance Tiers</option>
              <option value="STRATEGIC">Strategic Tier</option>
              <option value="PREFERRED">Preferred Tier</option>
              <option value="STANDARD">Standard Tier</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Vendor ID</th>
                <th className="py-3 px-4">Entity Legal Name</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">360 Rating</th>
                <th className="py-3 px-4">Master Status</th>
                <th className="py-3 px-4">Risk Profile</th>
                <th className="py-3 px-4">YTD Disbursements</th>
                <th className="py-3 px-4">Payment Controls</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((vendor) => {
                const isActive = vendor.status === 'ACTIVE';
                const isBlocked = vendor.status === 'BLOCKED';
                const sc = scorecards[vendor.id];

                return (
                  <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-500">
                      {vendor.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{vendor.name}</div>
                      {sc && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                            sc.tier === 'STRATEGIC' ? 'bg-purple-100 text-purple-800' :
                            sc.tier === 'PREFERRED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {sc.tier}
                          </span>
                          <span>• {sc.onTimeDeliveryRate}% On-Time</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <CountryFlag code={vendor.country} />
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {vendor.category}
                    </td>
                    <td className="py-3 px-4">
                      {sc ? (
                        <button
                          onClick={() => setInspectingVendor(vendor)}
                          className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 text-xs transition-colors"
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{sc.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-amber-600 underline ml-0.5">360 View</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending eval</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Master
                        </span>
                      ) : isBlocked ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          Onboarding
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={vendor.riskLevel} />
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {vendor.totalSpendYTD ? `$${vendor.totalSpendYTD.toLocaleString()}` : '$0'}
                    </td>
                    <td className="py-3 px-4">
                      {vendor.hasActiveBankChangeHold ? (
                        <button
                          onClick={onNavigateToRiskExceptions}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 hover:bg-amber-200"
                          title="Click to inspect security hold"
                        >
                          <Lock className="w-3 h-3 text-amber-700" />
                          Bank Change on Hold
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">Standard Net 30</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sc && (
                          <button
                            onClick={() => setInspectingVendor(vendor)}
                            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition-colors"
                          >
                            Scorecard
                          </button>
                        )}
                        <button
                          onClick={() => onSelectApplication(vendor.activeApplicationId)}
                          className="px-2 py-1 text-xs border border-slate-200 text-blue-600 hover:text-blue-800 hover:bg-slate-50 rounded font-medium inline-flex items-center gap-0.5"
                        >
                          Filing <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor 360 Scorecard Modal (Zoho Compete) */}
      {inspectingVendor && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingVendor(null)}
          title={`Vendor 360 Performance Scorecard — ${inspectingVendor.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {/* Header summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">{inspectingVendor.name}</span>
                  <CountryFlag code={inspectingVendor.country} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  ID: {inspectingVendor.id} | Category: {inspectingVendor.category}
                </div>
              </div>

              {selectedScorecard && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Performance Tier</div>
                    <span className="inline-block bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded text-xs">
                      {selectedScorecard.tier} VENDOR
                    </span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-center">
                    <div className="text-xs text-amber-700 font-medium">Overall Rating</div>
                    <div className="text-lg font-extrabold text-amber-900 flex items-center gap-1 justify-center">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      {selectedScorecard.rating.toFixed(1)} / 5.0
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scorecard Metrics */}
            {selectedScorecard ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                    <span>On-Time Delivery</span>
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-lg font-bold font-mono text-emerald-700 mt-1">
                    {selectedScorecard.onTimeDeliveryRate}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">SLA target: &gt;95%</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                    <span>Invoice Accuracy</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold font-mono text-blue-700 mt-1">
                    {selectedScorecard.invoiceAccuracyRate}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">3-way match pass rate</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                    <span>Active POs</span>
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-800 mt-1">
                    {selectedScorecard.activePurchaseOrders} Orders
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Open commitments</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                    <span>Renewal Date</span>
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-1">
                    {selectedScorecard.contractRenewalDate}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Contract in good standing</div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                Scorecard benchmarks are computed after first 3 completed billing cycles.
              </div>
            )}

            {/* Commercial terms & AP status */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>Certified AP & Commercial Terms</span>
                <span className="text-slate-500 font-mono">Terms: {selectedScorecard?.paymentTerms || 'Net 30 Days'}</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Vendor bank account is certified for automated NACHA ACH disbursements. Invoices matching purchase orders within 0% tolerance are automatically approved for the weekly payment run.
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onSelectApplication(inspectingVendor.activeApplicationId);
                  setInspectingVendor(null);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
              >
                View Full Onboarding Filing <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setInspectingVendor(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
