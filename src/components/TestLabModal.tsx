import React, { useState } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  ShieldCheck,
  Clock,
  RotateCw,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { TestSuiteSummary } from '../types/index.ts';

interface TestLabModalProps {
  onClose: () => void;
}

export const TestLabModal: React.FC<TestLabModalProps> = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<TestSuiteSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await apiClient.runAllTests();
      setSummary(res);
      setIsRunning(false);
    } catch (err) {
      setIsRunning(false);
      setError((err as Error).message || 'Failed to execute test suite');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101713]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl bg-[#101713] text-[#F5F4ED] border border-[#303D35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#303D35] flex items-center justify-between bg-[#19382C]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#19382C] text-[#C5F36B] border border-[#303D35]">
              <Cpu className="w-5 h-5 text-[#00A878]" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                <span>Security & Forensics Test Lab</span>
                <span className="text-xs font-mono text-[#C5F36B] px-2 py-0.5 rounded bg-[#19382C] border border-[#303D35]">
                  27 Test Scenarios
                </span>
              </h2>
              <p className="text-xs text-[#9BA79F] font-mono mt-0.5">
                Full-spectrum verification: 8 Decision Matrix + 7 Module Isolation + 12 E2E Pipeline tests.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#9BA79F] hover:text-white rounded-lg hover:bg-[#19382C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Summary Banner */}
        <div className="p-6 border-b border-[#303D35] bg-[#0d1410]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-semibold text-white">
                Execute Backend Cryptographic, Decision Engine & Forensics Validation
              </div>
              <p className="text-xs text-[#9BA79F] mt-1">
                Evaluates strict Rule A-E decision engine, individual module failure isolation, Ed25519 signatures, and date tampering.
              </p>
            </div>

            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#00A878] hover:bg-[#16865D] disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0 font-mono tracking-wider uppercase"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing 27 Test Scenarios...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run All 27 Security Tests</span>
                </>
              )}
            </button>
          </div>

          {/* Stats Bar if summary available */}
          {summary && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#101713] border border-[#303D35]">
                <span className="text-[#9BA79F] block text-[11px]">Total Scenarios</span>
                <span className="text-base font-bold text-white">{summary.total}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#16865D]/20 border border-[#16865D]/50">
                <span className="text-[#C5F36B] block text-[11px]">Passed</span>
                <span className="text-base font-bold text-[#C5F36B]">{summary.passed}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#CF4848]/20 border border-[#CF4848]/50">
                <span className="text-[#CF4848] block text-[11px]">Failed</span>
                <span className="text-base font-bold text-[#CF4848]">{summary.failed}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#101713] border border-[#303D35]">
                <span className="text-[#9BA79F] block text-[11px]">Last Run</span>
                <span className="text-xs text-white block mt-1">
                  {new Date(summary.executionTimestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-[#CF4848]/20 border border-[#CF4848]/50 text-xs text-[#CF4848] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#CF4848] shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Test Results Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-[#101713]">
          {summary ? (
            summary.results.map(test => (
              <div
                key={test.id}
                className="p-4 rounded-lg bg-[#0d1410] border border-[#303D35] hover:border-[#00A878]/50 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00A878] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#CF4848] shrink-0" />
                    )}
                    <span className="font-mono text-[#C5F36B] font-bold">{test.id}</span>
                    <span className="font-semibold text-white">{test.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#9BA79F] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{test.durationMs}ms</span>
                    </span>
                    <span
                      className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                        test.passed
                          ? 'bg-[#16865D]/20 text-[#C5F36B] border-[#16865D]/50'
                          : 'bg-[#CF4848]/20 text-[#CF4848] border-[#CF4848]/50'
                      }`}
                    >
                      {test.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>

                <div className="text-[#9BA79F] pl-6 leading-relaxed">
                  <span className="text-white font-medium">Scenario:</span> {test.scenario}
                </div>

                <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div className="p-2 rounded bg-[#101713] border border-[#303D35]">
                    <span className="text-[#9BA79F] block text-[10px] uppercase">Expected Outcome</span>
                    <span className="text-white">{test.expectedOutcome}</span>
                  </div>
                  <div className="p-2 rounded bg-[#101713] border border-[#303D35]">
                    <span className="text-[#9BA79F] block text-[10px] uppercase">Actual Engine Result</span>
                    <span className={test.passed ? 'text-[#C5F36B]' : 'text-[#CF4848]'}>
                      {test.actualOutcome}
                    </span>
                  </div>
                </div>

                {test.details && (
                  <div className="pl-6 text-[11px] text-[#9BA79F] font-mono">
                    {test.details}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-[#9BA79F] text-xs font-mono">
              Click &quot;Run All 27 Security Tests&quot; above to trigger synchronous automated testing across all cryptographic and forensic scenarios.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#303D35] bg-[#0d1410] flex items-center justify-between">
          <span className="text-xs text-[#9BA79F] font-mono">
            Automated Rigor: 27 Scenarios · Strict Authenticity Standard
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white hover:text-white bg-[#19382C] hover:bg-[#19382C]/80 border border-[#303D35] rounded-lg transition-colors font-mono"
          >
            Close Lab
          </button>
        </div>
      </div>
    </div>
  );
};
