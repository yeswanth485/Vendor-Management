import React, { useState } from 'react';
import { CountryConfiguration } from '../../types';
import { AppStorage } from '../../lib/storage';
import { Settings, Sliders, Globe, ShieldCheck, RefreshCw, CheckCircle2, RotateCcw, Play } from 'lucide-react';
import { CountryFlag } from '../common/Badge';

interface RulesAndSettingsProps {
  onOpenTestSuite: () => void;
}

export function RulesAndSettings({ onOpenTestSuite }: RulesAndSettingsProps) {
  const storage = AppStorage.getInstance();
  const [configs, setConfigs] = useState(storage.getCountryConfigs());
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [isSaved, setIsSaved] = useState(false);

  const activeConfig = configs[selectedCountry];

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetData = () => {
    storage.resetToDemo();
    setConfigs(storage.getCountryConfigs());
    setShowResetConfirm(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleUpdateConfig = (field: keyof CountryConfiguration, val: any) => {
    setConfigs(prev => ({
      ...prev,
      [selectedCountry]: {
        ...prev[selectedCountry],
        [field]: val,
      }
    }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Governance, Rules & Country Configuration
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure jurisdiction-specific tax and banking formats, mandatory compliance certificates, and system risk thresholds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTestSuite}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              Run Automated In-App Test Suite
            </button>

            <button
              onClick={handleResetData}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
              title="Reset state to initial synthetic seed data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset Demo Dataset
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Country Config & Policy Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country Selector (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Jurisdiction Select
          </h3>
          <div className="space-y-1">
            {Object.keys(configs).map((cCode) => {
              const cfg = configs[cCode];
              const isSelected = selectedCountry === cCode;
              return (
                <button
                  key={cCode}
                  onClick={() => setSelectedCountry(cCode)}
                  className={`w-full p-2.5 rounded text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CountryFlag code={cCode} />
                    <span>{cfg.countryName}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">{cCode}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Country Settings (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CountryFlag code={selectedCountry} />
              <h3 className="text-sm font-bold text-slate-900">
                {activeConfig.countryName} Validation Parameters
              </h3>
            </div>
            {isSaved && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Changes Persisted
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">
                National Tax Identifier Name
              </label>
              <input
                type="text"
                value={activeConfig.taxIdentifierName}
                onChange={(e) => handleUpdateConfig('taxIdentifierName', e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Tax Identifier Format Regex Pattern
              </label>
              <input
                type="text"
                value={activeConfig.taxRegex}
                onChange={(e) => handleUpdateConfig('taxRegex', e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Tax Pattern Example
              </label>
              <input
                type="text"
                value={activeConfig.taxExample}
                onChange={(e) => handleUpdateConfig('taxExample', e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Business Registration Regex Pattern
              </label>
              <input
                type="text"
                value={activeConfig.businessRegRegex}
                onChange={(e) => handleUpdateConfig('businessRegRegex', e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">
                National Banking Identifier (Routing / Sort Code / BSB / IFSC)
              </label>
              <input
                type="text"
                value={activeConfig.bankingIdentifierName}
                onChange={(e) => handleUpdateConfig('bankingIdentifierName', e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Banking Identifier Format Regex
              </label>
              <input
                type="text"
                value={activeConfig.bankingIdentifierRegex}
                onChange={(e) => handleUpdateConfig('bankingIdentifierRegex', e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <span className="font-bold text-slate-900 block">
              Mandatory Statutory Document Checklist:
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked disabled className="rounded text-blue-600" />
                <span>Certificate of Incorporation (Mandatory)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked disabled className="rounded text-blue-600" />
                <span>Tax Registration Certificate / W-9 / W-8BEN</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked disabled className="rounded text-blue-600" />
                <span>Bank Verification Letter / Voided Check</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={activeConfig.requireTaxExpiry} 
                  onChange={(e) => handleUpdateConfig('requireTaxExpiry', e.target.checked)} 
                  className="rounded text-blue-600" 
                />
                <span>Require Explicit Tax Certificate Expiry Date</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Thresholds Info */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          Deterministic Risk Scoring Calibration Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
            <span className="font-bold text-emerald-900 block">Low Risk (0 - 24)</span>
            <p className="text-[11px] text-emerald-800 mt-1">Zero material discrepancies. Eligible for single-officer direct procurement approval.</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded">
            <span className="font-bold text-amber-900 block">Medium Risk (25 - 49)</span>
            <p className="text-[11px] text-amber-800 mt-1">Minor entity name alias or missing secondary licenses. Requires documented resolution.</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded">
            <span className="font-bold text-orange-900 block">High Risk (50 - 74)</span>
            <p className="text-[11px] text-orange-800 mt-1">Potential duplicate registration number or bank account reuse. Auto-approval blocked.</p>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded">
            <span className="font-bold text-rose-900 block">Critical Risk (75 - 100)</span>
            <p className="text-[11px] text-rose-800 mt-1">Dual-use export control scrutiny or sanctions match. Requires Director-level approval.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
