import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { runFullTestSuite, TestResult } from '../../lib/tests';
import { Play, CheckCircle2, XCircle, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestSuiteModal({ isOpen, onClose }: TestSuiteModalProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runFullTestSuite();
      setResults(res);
      setIsRunning(false);
      setHasRun(true);
    }, 450);
  };

  const passCount = results.filter(r => r.passed).length;
  const failCount = results.filter(r => !r.passed).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automated Rule & Integration Test Suite"
      description="Verifies business rules, edge cases (A, B, C, D), RBAC permissions, and multi-tenant isolation."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Run Controls */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <span className="font-bold text-xs text-slate-900 block">
              VendorIQ Decision Engine & Workflow Harness
            </span>
            <span className="text-[11px] text-slate-500">
              10 comprehensive test suites with live programmatic assertions
            </span>
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Executing Assertions...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                {hasRun ? 'Re-Run Test Suite' : 'Execute Test Suite'}
              </>
            )}
          </button>
        </div>

        {/* Summary Card */}
        {hasRun && (
          <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200 rounded text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-900">
                {passCount} of {results.length} Tests Passed
              </span>
            </div>
            <span className="font-mono text-emerald-800 text-[11px]">
              Success Rate: {((passCount / results.length) * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {!hasRun && !isRunning ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
              Click "Execute Test Suite" above to run live automated verification tests.
            </div>
          ) : (
            results.map((t, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                  t.passed ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900">{t.name}</span>
                    <span className="text-[10px] uppercase font-mono text-slate-400 px-1.5 py-0.2 bg-slate-100 rounded">
                      {t.category}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t.durationMs.toFixed(1)}ms
                  </span>
                </div>

                <p className="font-mono text-[11px] text-slate-600 pl-6">
                  {t.message}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
