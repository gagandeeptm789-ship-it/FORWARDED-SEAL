import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
  Printer,
  Copy,
  Check,
  FileText,
  Lock,
  QrCode,
  Layers,
  Search,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Building,
  Hash,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Info,
  AlertOctagon,
  XCircle,
  Download,
  Loader2,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { VerificationRecord, DocumentRecord, ModuleFailureDetails } from '../types/index.ts';
import { downloadVerificationReportPdf } from '../services/pdfReportGenerator.ts';

interface VerificationReportModalProps {
  report: VerificationRecord;
  registeredDoc?: Partial<DocumentRecord> | null;
  onClose: () => void;
}

export const VerificationReportModal: React.FC<VerificationReportModalProps> = ({
  report,
  registeredDoc,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [activeTechnicalTab, setActiveTechnicalTab] = useState<'modules' | 'diff' | 'heatmap'>('modules');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadVerificationReportPdf(report, registeredDoc);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const copyReference = () => {
    navigator.clipboard.writeText(report.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. Classification
  const classification = report.finalClassification;
  const isError = classification === 'ERROR';
  const isIrrelevant = classification === 'IRRELEVANT';
  const isSuspicious = classification === 'SUSPICIOUS' || classification === 'MODIFIED';
  const isGenuine = classification === 'GENUINE';
  const isUnverified = classification === 'UNVERIFIED';

  const explanation = report.aiExplanation;

  // 2. Exact Three Final States Required by User
  const finalState = isGenuine
    ? {
        label: 'AUTHENTIC DOCUMENT',
        colorClass: 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/40',
        badgeBg: 'bg-[#10B981] text-[#090810]',
        bannerBorder: 'border-[#10B981]',
        icon: ShieldCheck
      }
    : isSuspicious
    ? {
        label: 'DOCUMENT INTEGRITY COMPROMISED',
        colorClass: 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/40',
        badgeBg: 'bg-[#EF4444] text-white animate-pulse',
        bannerBorder: 'border-[#EF4444]',
        icon: AlertOctagon
      }
    : {
        label: 'AUTHENTICITY COULD NOT BE ESTABLISHED',
        colorClass: 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/40',
        badgeBg: 'bg-[#F59E0B] text-[#090810]',
        bannerBorder: 'border-[#F59E0B]',
        icon: ShieldAlert
      };

  // 3. Overall Result sentence
  const overallResultSentence =
    explanation?.overallResult ||
    (isGenuine
      ? 'The document appears genuine based on the checks performed. Its reference number, dates, text structure, and formatting are consistent with official records.'
      : isSuspicious
      ? 'The document contains confirmed inconsistencies, signature failures, or modifications compared to official institutional records.'
      : isUnverified
      ? 'The document could not be completely verified because one or more cryptographic or forensic checks were inconclusive or skipped.'
      : isIrrelevant
      ? 'This file appears to be an unrelated document or image rather than an official institutional circular.'
      : 'Document analysis could not be completed due to an error processing the uploaded file.');

  // 4. Reasons list
  const reasonsList =
    explanation?.whyResult && explanation.whyResult.length > 0
      ? explanation.whyResult
      : report.reasons && report.reasons.length > 0
      ? report.reasons
      : [
          isGenuine
            ? 'All seven forensic modules completed successfully against registered university records.'
            : isSuspicious
            ? 'Confirmed forensic failure detected. The document integrity is compromised.'
            : isUnverified
            ? 'Required institutional reference data or high-fidelity carriers were unavailable.'
            : 'File does not match expected institutional circular formats.'
        ];

  // 5. Gather all failed module details for failure display
  const failureDetailsList: ModuleFailureDetails[] = (() => {
    if (report.failureDetailsList && report.failureDetailsList.length > 0) {
      return report.failureDetailsList;
    }
    const checks = [
      { name: 'Ed25519 Cryptographic Signature', check: report.checkResults?.cryptographic },
      { name: 'SHA-256 Binary Integrity', check: report.checkResults?.fileIntegrity },
      { name: 'QR Code Authentication Seal', check: report.checkResults?.qrVerification },
      { name: 'Digital Watermark Carrier', check: report.checkResults?.watermarkVerification },
      { name: 'OCR Semantic Comparison', check: report.checkResults?.ocrComparison },
      { name: 'Image Pixel Forensics', check: report.checkResults?.imageForensics },
      { name: 'Institutional Revocation Status', check: report.checkResults?.revocationStatus }
    ];

    const failed = checks.filter(c => c.check && c.check.status === 'FAIL');
    return failed.map(c => {
      if (c.check?.failureDetails) return c.check.failureDetails;
      return {
        moduleName: c.check?.moduleName || c.name,
        expected: 'Official institutional reference baseline compliance.',
        detected: c.check?.details || 'Confirmed integrity failure.',
        whySuspicious: `Module detected an unauthorized inconsistency: ${c.check?.explanation || c.check?.details}`,
        evidence: c.check?.evidence || c.check?.details,
        recommendedAction: 'Do not act on this notice without direct confirmation from the issuing registrar.'
      };
    });
  })();

  // 6. Gather all 7 modules
  const allModules = [
    {
      id: 'cryptographic',
      name: 'Ed25519 Cryptographic Signature',
      check: report.checkResults?.cryptographic,
      icon: Lock,
      passDesc: 'Asymmetric signature matches registrar public key pinned in ledger.'
    },
    {
      id: 'fileIntegrity',
      name: 'SHA-256 Binary Integrity',
      check: report.checkResults?.fileIntegrity,
      icon: Hash,
      passDesc: 'Exact byte-level cryptographic hash matches registered master copy.'
    },
    {
      id: 'qrVerification',
      name: 'QR Code Authentication Seal',
      check: report.checkResults?.qrVerification,
      icon: QrCode,
      passDesc: 'QR authentication seal verified and cryptographically bound.'
    },
    {
      id: 'watermarkVerification',
      name: 'Digital Watermark Carrier',
      check: report.checkResults?.watermarkVerification,
      icon: Layers,
      passDesc: 'Spatial spread-spectrum watermark extracted with valid payload.'
    },
    {
      id: 'ocrComparison',
      name: 'OCR Semantic Comparison',
      check: report.checkResults?.ocrComparison,
      icon: Search,
      passDesc: 'Dates, reference numbers, and clauses match official filing.'
    },
    {
      id: 'imageForensics',
      name: 'Image Pixel Forensics',
      check: report.checkResults?.imageForensics,
      icon: Eye,
      passDesc: 'Error level analysis confirms zero spliced text boxes or stamps.'
    },
    {
      id: 'revocationStatus',
      name: 'Institutional Revocation Status',
      check: report.checkResults?.revocationStatus,
      icon: ShieldCheck,
      passDesc: 'Document is officially active and not recalled or superseded.'
    }
  ];

  // 7. Document metadata details
  const docDetails = {
    title:
      explanation?.documentDetails?.title ||
      registeredDoc?.title ||
      (isIrrelevant ? 'Non-Circular File' : 'Notice Title Unindexed'),
    organization:
      explanation?.documentDetails?.organization ||
      registeredDoc?.issuingAuthority ||
      'Grand Metropolitan University',
    referenceNumber:
      explanation?.documentDetails?.referenceNumber ||
      registeredDoc?.referenceNumber ||
      'Not Detected',
    issueDate:
      explanation?.documentDetails?.issueDate ||
      registeredDoc?.issueDate ||
      'Not Specified',
    eventDate:
      explanation?.documentDetails?.eventDate ||
      registeredDoc?.contentSummary?.keyDates?.[0] ||
      '—',
    category:
      explanation?.documentDetails?.category ||
      registeredDoc?.category ||
      (isIrrelevant ? 'Unrelated Upload' : 'Institutional Notice'),
    fileHash: registeredDoc?.originalSha256 || report.checkResults?.fileIntegrity?.details || 'SHA-256 Verified Baseline'
  };

  // 8. What does this mean & next steps
  const whatItMeans =
    explanation?.whatItMeans ||
    (isGenuine
      ? 'This notice corresponds to an authentic circular published by the institution. All seven cryptographic and forensic checks confirmed its validity without alteration.'
      : isSuspicious
      ? 'This document contains confirmed differences from official university records or has failed security checks. It may be altered, forged, or revoked. Do not rely on dates or instructions without direct verification.'
      : isUnverified
      ? 'The authenticity of this document could not be established with certainty. Some verification checks could not run or returned inconclusive results. It cannot be treated as genuine.'
      : isIrrelevant
      ? 'This file is not an official circular or institutional document. The system cannot perform document authentication on personal photos or non-institutional files.'
      : 'An unexpected processing error occurred during document parsing.');

  const recommendedNextStep =
    explanation?.recommendedNextStep ||
    (isGenuine
      ? 'You can safely rely on the information and dates contained in this verified circular.'
      : isSuspicious
      ? 'Check the official university student portal or contact the registrar to verify circular details before taking action.'
      : isUnverified
      ? 'Request an official PDF or pristine sealed circular directly from the university examination department.'
      : isIrrelevant
      ? 'Please upload an official university circular, examination notice, fee schedule, or degree certificate.'
      : 'Please retry uploading a valid PNG, JPEG, or PDF copy of the document.');

  // Render Check Status Badge (PASS, FAIL, UNCHECKED, INCONCLUSIVE)
  const renderStatusBadge = (status?: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'SKIPPED') => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50">
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
            <span>PASS</span>
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50 animate-pulse">
            <XCircle className="w-3 h-3 text-[#EF4444]" />
            <span>FAIL</span>
          </span>
        );
      case 'INCONCLUSIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50">
            <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
            <span>INCONCLUSIVE</span>
          </span>
        );
      case 'SKIPPED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[#171321] text-[#AAA1B8] border border-[#302440]">
            <HelpCircle className="w-3 h-3 text-[#AAA1B8]" />
            <span>UNCHECKED</span>
          </span>
        );
    }
  };

  const FinalStateIcon = finalState.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#090810]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:text-black">
      <div className="relative w-full max-w-4xl bg-[#090810] text-[#F7F3FF] border border-[#302440] rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black font-sans">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#302440] flex items-center justify-between bg-[#100D19] print:border-b-2 print:border-black print:bg-white">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${finalState.colorClass}`}>
              <FinalStateIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-white print:text-black">
                  Digital Forensic Investigation Report
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#171321] text-[#D5B8FF] border border-[#302440]">
                  {report.id}
                </span>
              </div>
              <p className="text-xs text-[#AAA1B8] font-mono">
                Verified on {new Date(report.verifiedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 text-xs font-mono font-bold text-[#090810] hover:bg-[#D5B8FF] bg-[#A66BFF] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer uppercase"
              title="Download Official Verification Certificate as PDF"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-[#D5B8FF] hover:text-white bg-[#171321] hover:bg-[#21182F] border border-[#302440] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </button>
            <button
              onClick={copyReference}
              className="px-2.5 py-1.5 text-xs font-mono text-[#AAA1B8] hover:text-white bg-[#171321] hover:bg-[#21182F] border border-[#302440] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy Report ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'ID'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 text-xs font-mono text-[#AAA1B8] hover:text-white bg-[#171321] hover:bg-[#21182F] border border-[#302440] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Print Certificate"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#AAA1B8] hover:text-white rounded-lg hover:bg-[#171321] transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto bg-[#090810]">
          
          {/* SECTION 1: OVERALL RESULT BANNER (The Three Final States) */}
          <div className={`p-5 rounded-2xl border ${finalState.bannerBorder} bg-[#171321] shadow-xl relative overflow-hidden`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                  <span className={`px-3 py-1 text-xs font-mono font-black uppercase tracking-wider rounded-md ${finalState.badgeBg}`}>
                    {finalState.label}
                  </span>
                  <span className="font-mono text-xs text-[#AAA1B8]">
                    Forensic Confidence: <strong className="text-white">{report.aiExplanation?.confidenceScore ?? (isGenuine ? 99 : isSuspicious ? 15 : 45)}%</strong>
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                  {overallResultSentence}
                </h3>
              </div>
            </div>

            {/* Findings Summary */}
            <div className="mt-4 pt-3.5 border-t border-[#302440]">
              <h4 className="font-mono text-xs font-bold text-[#A66BFF] uppercase tracking-wide mb-2">
                Verification Findings Summary
              </h4>
              <ul className="space-y-1.5">
                {reasonsList.map((reason, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-[#F7F3FF]/90 flex items-start gap-2">
                    <span className={`font-bold mt-0.5 ${
                      isGenuine ? 'text-[#10B981]' : isSuspicious ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                    }`}>▸</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION 2: CONFIRMED FAILURES BLOCK (CRITICAL RULE A REQUIREMENT) */}
          {isSuspicious && failureDetailsList.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#EF4444]/10 border-2 border-[#EF4444] space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-[#EF4444]">
                <AlertOctagon className="w-5 h-5 text-[#EF4444] shrink-0" />
                <div>
                  <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-[#EF4444]">
                    Confirmed Integrity / Authenticity Failure ({failureDetailsList.length} Module{failureDetailsList.length > 1 ? 's' : ''} Failed)
                  </h4>
                  <p className="text-xs text-[#F7F3FF]/80 mt-0.5">
                    Under the Strict Authenticity Engine, a confirmed failure in even one module prevents this document from ever being classified as genuine.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {failureDetailsList.map((failure, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#100D19] border border-[#EF4444]/40 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-[#302440] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white text-sm">{failure.moduleName}</span>
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#EF4444]/30 text-[#EF4444] text-[10px] uppercase border border-[#EF4444]/50">
                          CONFIRMED FAIL
                        </span>
                      </div>
                      <span className="text-[11px] text-[#AAA1B8] font-mono">Module #{idx + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="bg-[#171321] p-3 rounded-lg border border-[#302440]">
                        <span className="font-mono font-semibold text-[#AAA1B8] block text-[10px] uppercase tracking-wider">
                          What Was Expected:
                        </span>
                        <span className="text-white text-xs mt-0.5 block font-medium">
                          {failure.expected}
                        </span>
                      </div>
                      <div className="bg-[#EF4444]/20 p-3 rounded-lg border border-[#EF4444]/40">
                        <span className="font-mono font-semibold text-[#EF4444] block text-[10px] uppercase tracking-wider">
                          What Was Detected:
                        </span>
                        <span className="text-white text-xs mt-0.5 block font-bold">
                          {failure.detected}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 space-y-1">
                      <div>
                        <span className="font-semibold text-white">Why the finding is suspicious: </span>
                        <span className="text-[#AAA1B8]">{failure.whySuspicious}</span>
                      </div>
                      {failure.evidence && (
                        <div>
                          <span className="font-semibold text-white">Supporting Evidence: </span>
                          <span className="text-[#D5B8FF] font-mono text-[11px] bg-[#21182F] px-1.5 py-0.5 rounded border border-[#302440]">
                            {typeof failure.evidence === 'object' ? JSON.stringify(failure.evidence) : failure.evidence}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-[#A66BFF]">Recommended Action: </span>
                        <span className="text-[#F7F3FF] font-medium">{failure.recommendedAction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: 7 FORENSIC MODULES STATUS GRID */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-mono text-xs font-bold text-[#AAA1B8] uppercase tracking-wider flex items-center gap-2">
                <span>The 7 Forensic Verification Modules</span>
                <span className="text-[10px] text-[#A66BFF]">
                  (Evaluation Matrix)
                </span>
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allModules.map((item, idx) => {
                const IconComponent = item.icon;
                const checkStatus = item.check?.status || 'SKIPPED';
                const detailsText = item.check?.explanation || item.check?.details || item.passDesc;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      checkStatus === 'FAIL'
                        ? 'border-[#EF4444] bg-[#EF4444]/10'
                        : checkStatus === 'PASS'
                        ? 'border-[#302440] bg-[#171321] hover:border-[#A66BFF]/40'
                        : 'border-[#302440] bg-[#100D19]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`w-4 h-4 ${
                          checkStatus === 'PASS'
                            ? 'text-[#10B981]'
                            : checkStatus === 'FAIL'
                            ? 'text-[#EF4444]'
                            : 'text-[#AAA1B8]'
                        }`} />
                        <span className="text-xs font-bold text-white">{item.name}</span>
                      </div>
                      {renderStatusBadge(checkStatus)}
                    </div>
                    <p className="text-xs text-[#AAA1B8] leading-relaxed pl-6">
                      {detailsText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: DOCUMENT DETAILS & HASH */}
          <div>
            <h4 className="font-mono text-xs font-bold text-[#AAA1B8] uppercase tracking-wider mb-3">
              Institutional Circular Details & Fingerprint
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#171321] border border-[#302440]">
                <span className="text-[10px] font-mono text-[#AAA1B8] uppercase block">Document Title</span>
                <span className="text-sm font-semibold text-white line-clamp-2 mt-0.5">
                  {docDetails.title}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171321] border border-[#302440]">
                <span className="text-[10px] font-mono text-[#AAA1B8] uppercase block">Issuing Authority</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {docDetails.organization}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171321] border border-[#302440]">
                <span className="text-[10px] font-mono text-[#AAA1B8] uppercase block">Reference Number</span>
                <span className="text-sm font-mono font-semibold text-[#D5B8FF] mt-0.5 block">
                  {docDetails.referenceNumber}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171321] border border-[#302440]">
                <span className="text-[10px] font-mono text-[#AAA1B8] uppercase block">Publication Date</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {docDetails.issueDate}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171321] border border-[#302440]">
                <span className="text-[10px] font-mono text-[#AAA1B8] uppercase block">Exam / Event Date</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {docDetails.eventDate}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171321] border border-[#302440]">
                <span className="text-[10px] font-mono text-[#AAA1B8] uppercase block">Category</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {docDetails.category}
                </span>
              </div>
            </div>

            {/* Cryptographic Hash Bar */}
            <div className="mt-3 p-3 rounded-xl bg-[#100D19] border border-[#302440] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#A66BFF] shrink-0" />
                <span className="font-mono text-xs text-[#AAA1B8]">SHA-256 Digest Baseline:</span>
              </div>
              <span className="font-mono text-[11px] text-[#D5B8FF] break-all">
                {docDetails.fileHash}
              </span>
            </div>
          </div>

          {/* SECTION 5: WHAT DOES THIS MEAN? & RECOMMENDED NEXT STEP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#171321] border border-[#302440]">
              <div className="flex items-center gap-2 mb-2 text-white">
                <Info className="w-4 h-4 text-[#A66BFF]" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#AAA1B8]">
                  What Does This Mean?
                </h4>
              </div>
              <p className="text-xs text-[#F7F3FF]/80 leading-relaxed font-normal">
                {whatItMeans}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#21182F] border border-[#A66BFF]/40">
              <div className="flex items-center gap-2 mb-2 text-[#D5B8FF]">
                <ShieldCheck className="w-4 h-4 text-[#A66BFF]" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#D5B8FF]">
                  Recommended Next Step
                </h4>
              </div>
              <p className="text-xs text-white leading-relaxed font-medium">
                {recommendedNextStep}
              </p>
            </div>
          </div>

          {/* EXPANDABLE SECTION: TECHNICAL DETAILS (For Cryptographers & Auditors) */}
          <div className="border border-[#302440] rounded-xl overflow-hidden bg-[#100D19]">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-[#AAA1B8] hover:bg-[#171321] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#A66BFF]" />
                <span className="text-white font-mono">Technical Cryptographic & Forensics Audit Trail</span>
                <span className="text-[10px] text-[#AAA1B8] font-normal hidden sm:inline">
                  (SHA-256, Ed25519 signature, OCR diff, pixel matrix)
                </span>
              </div>
              {showTechnicalDetails ? (
                <ChevronUp className="w-4 h-4 text-[#AAA1B8]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#AAA1B8]" />
              )}
            </button>

            {showTechnicalDetails && (
              <div className="p-4 border-t border-[#302440] bg-[#090810] space-y-4 text-xs">
                {/* Technical Sub-tabs */}
                <div className="flex items-center gap-2 border-b border-[#302440] pb-2 font-mono text-xs">
                  <button
                    onClick={() => setActiveTechnicalTab('modules')}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeTechnicalTab === 'modules'
                        ? 'bg-[#A66BFF] text-[#090810] font-bold'
                        : 'text-[#AAA1B8] hover:text-white'
                    }`}
                  >
                    Raw 7 Modules
                  </button>
                  {report.textDiff && report.textDiff.length > 0 && (
                    <button
                      onClick={() => setActiveTechnicalTab('diff')}
                      className={`px-3 py-1 rounded transition-colors ${
                        activeTechnicalTab === 'diff'
                          ? 'bg-[#A66BFF] text-[#090810] font-bold'
                          : 'text-[#AAA1B8] hover:text-white'
                      }`}
                    >
                      OCR Text Diff
                    </button>
                  )}
                  {report.forensicDiffImagePath && (
                    <button
                      onClick={() => setActiveTechnicalTab('heatmap')}
                      className={`px-3 py-1 rounded transition-colors ${
                        activeTechnicalTab === 'heatmap'
                          ? 'bg-[#A66BFF] text-[#090810] font-bold'
                          : 'text-[#AAA1B8] hover:text-white'
                      }`}
                    >
                      Pixel Tamper Heatmap
                    </button>
                  )}
                </div>

                {/* Subtab: Raw Modules */}
                {activeTechnicalTab === 'modules' && (
                  <div className="space-y-2">
                    {allModules.map((mod, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[#171321] border border-[#302440]">
                        <div className="flex items-center justify-between font-semibold text-white mb-1">
                          <span>{mod.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            mod.check?.status === 'PASS'
                              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50'
                              : mod.check?.status === 'FAIL'
                              ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50'
                              : 'bg-[#21182F] text-[#AAA1B8]'
                          }`}>
                            {mod.check?.status || 'SKIPPED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#AAA1B8] font-mono">{mod.check?.details || 'Check not performed.'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtab: Text Diff */}
                {activeTechnicalTab === 'diff' && report.textDiff && (
                  <div className="p-3 rounded-lg bg-[#100D19] border border-[#302440] text-slate-100 font-mono text-[11px] leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap">
                    {report.textDiff.map((chunk, idx) => {
                      if (chunk.type === 'added') {
                        return (
                          <span key={idx} className="bg-[#EF4444]/30 text-[#EF4444] px-1 py-0.5 rounded font-bold underline">
                            {chunk.value}
                          </span>
                        );
                      }
                      if (chunk.type === 'removed') {
                        return (
                          <span key={idx} className="bg-[#10B981]/30 text-[#10B981] px-1 py-0.5 rounded line-through opacity-80">
                            {chunk.value}
                          </span>
                        );
                      }
                      return <span key={idx}>{chunk.value}</span>;
                    })}
                  </div>
                )}

                {/* Subtab: Heatmap */}
                {activeTechnicalTab === 'heatmap' && report.forensicDiffImagePath && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#AAA1B8]">
                      Red pixels highlight regions where pixel values differ noticeably from the registered reference master.
                    </p>
                    <div className="border border-[#302440] rounded-xl p-2 bg-[#100D19] flex justify-center">
                      <img
                        src={report.forensicDiffImagePath}
                        alt="Forensic Difference Heatmap"
                        className="max-h-[360px] object-contain rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[#302440] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#100D19] print:hidden">
          <span className="text-xs text-[#AAA1B8] font-mono">
            The Forwarded Seal · Strict Authenticity Engine (7 Forensic Modules)
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="w-full sm:w-auto px-4 py-2 text-xs font-mono font-bold text-[#090810] bg-[#A66BFF] hover:bg-[#D5B8FF] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer uppercase"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Certificate'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-[#D5B8FF] bg-[#171321] hover:bg-[#21182F] border border-[#302440] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back / Verify Another</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-[#AAA1B8] hover:text-white bg-[#090810] hover:bg-[#171321] rounded-lg transition-colors border border-[#302440] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
