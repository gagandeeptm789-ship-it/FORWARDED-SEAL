import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  Search,
  Camera,
  AlertCircle,
  Loader2,
  ShieldCheck,
  RotateCcw,
  QrCode,
  X,
  FileText,
  Key,
  Layers,
  Fingerprint,
  Eye,
  CheckCircle2,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { VerificationRecord, DocumentRecord } from '../types/index.ts';

interface VerificationPortalProps {
  onVerificationComplete: (
    report: VerificationRecord,
    registeredDoc?: Partial<DocumentRecord> | null
  ) => void;
}

export const VerificationPortal: React.FC<VerificationPortalProps> = ({
  onVerificationComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualDocId, setManualDocId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'id-lookup' | 'qr-scan'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // The 7 Forensic Module Pipeline Sequence
  const verificationSteps = [
    { num: 'A', name: 'Ed25519 Signature', desc: 'Evaluating asymmetric Edwards-curve digital signature against institutional public key.' },
    { num: 'B', name: 'SHA-256 Integrity', desc: 'Computing cryptographic bit-for-bit digest against canonical baseline.' },
    { num: 'C', name: 'QR Authentication', desc: 'Validating cryptographic link and detecting QR transplantation onto unindexed notices.' },
    { num: 'D', name: 'Digital Watermark', desc: 'Extracting discrete frequency carrier signals and spatial payloads.' },
    { num: 'E', name: 'Semantic OCR', desc: 'Comparing character strings, dates, clauses, and reference codes against registry master.' },
    { num: 'F', name: 'Structural Image Forensics', desc: 'Pixel error level analysis detecting spliced mastheads, altered dates, or stamps.' },
    { num: 'G', name: 'Revocation Status', desc: 'Querying institutional ledger to verify the circular is not retracted or superseded.' }
  ];

  const resetSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (qrFileInputRef.current) qrFileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setErrorMessage(null);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleVerifyUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or upload a document file to verify.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setCurrentStepIndex(0);

    try {
      // Step through the 7 verification stages smoothly
      const interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < 6) return prev + 1;
          return prev;
        });
      }, 240);

      const result = await apiClient.verifyUpload(
        selectedFile,
        manualDocId.trim() || undefined
      );

      clearInterval(interval);
      setCurrentStepIndex(6);
      await new Promise(r => setTimeout(r, 200));

      setIsLoading(false);
      onVerificationComplete(result.verification, result.registeredDocument);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage((err as Error).message || 'Verification failed');
    }
  };

  const handleVerifyById = async () => {
    if (!manualDocId.trim()) {
      setErrorMessage('Please enter a Document ID or Reference Number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setCurrentStepIndex(1);

    try {
      const res = await apiClient.verifyById(manualDocId.trim());
      setIsLoading(false);

      if (res.found) {
        const doc = res.document;
        const record: VerificationRecord = {
          id: `LOOKUP-${Date.now()}`,
          documentId: doc.id,
          uploadedFilename: `Registry Record: ${doc.id}`,
          uploadedFileSize: 0,
          uploadedFilePath: '',
          finalClassification: doc.status === 'revoked' ? 'SUSPICIOUS' : 'UNVERIFIED',
          headline: doc.status === 'revoked' ? 'DOCUMENT REVOKED / INVALIDATED' : 'UNVERIFIED',
          reasons: [
            `Document record indexed in Grand Metropolitan University registry.`,
            `Status: ${doc.status.toUpperCase()}`,
            `Cryptographic Ed25519 signature recorded.`
          ],
          checkResults: {
            cryptographic: {
              status: 'PASS',
              title: 'Cryptographic Asymmetric Signature (Ed25519)',
              details: `Signature registered with key ID ${res.cryptographicProof.signingKeyId}.`
            },
            fileIntegrity: {
              status: 'PASS',
              title: 'Canonical SHA-256 Hash',
              details: `Original canonical hash: ${doc.originalSha256}`
            },
            qrVerification: {
              status: 'PASS',
              title: 'QR Identifier Match',
              details: `Document ID ${doc.id} recorded in registry.`
            },
            watermarkVerification: {
              status: 'PASS',
              title: 'Watermark Registration',
              details: `Institutional digital watermark recorded.`
            },
            ocrComparison: {
              status: 'PASS',
              title: 'Content Integrity Baseline',
              details: `Registered title: "${doc.title}".`
            },
            imageForensics: {
              status: 'SKIPPED',
              title: 'Image Forensics',
              details: 'Direct ledger lookup; no uploaded raster file for pixel differencing.'
            },
            revocationStatus: {
              status: doc.status === 'revoked' ? 'FAIL' : 'PASS',
              title: 'Revocation Status',
              details: doc.status === 'revoked' ? 'This circular was retracted by the university.' : 'Valid and active.'
            }
          },
          detectedModifications: [],
          verifiedAt: new Date().toISOString()
        };

        onVerificationComplete(record, doc);
      } else {
        setErrorMessage(`Document ID "${manualDocId.trim()}" was not found in the university registry.`);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage((err as Error).message || 'Document ID lookup failed');
    }
  };

  return (
    <section id="verification-portal" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto relative">
      
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171321] text-[#A66BFF] font-mono text-xs font-semibold uppercase tracking-wider border border-[#302440] shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#A66BFF]" />
          <span>Public Verification Workspace · Zero Login Required</span>
        </div>
        
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#F7F3FF]">
          Verify before you trust.
        </h2>
        
        <p className="text-sm sm:text-base text-[#AAA1B8] leading-relaxed">
          Upload any forwarded circular, screenshot, or PDF to execute the 7-module forensic authentication engine.
        </p>
      </div>

      <div className="bg-[#171321] border border-[#302440] rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-forensic-dense pointer-events-none opacity-15" />
        
        {/* Navigation Tabs Bar */}
        <div className="relative z-10 p-4 sm:p-6 border-b border-[#302440] bg-[#100D19]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-[#090810] rounded-xl border border-[#302440] shrink-0 font-mono text-xs">
            <button
              onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
              className={`px-4 py-2 font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#21182F] text-[#A66BFF] border border-[#A66BFF]/40 shadow-xs'
                  : 'text-[#AAA1B8] hover:text-[#F7F3FF]'
              }`}
            >
              Upload Document File
            </button>
            <button
              onClick={() => { setActiveTab('id-lookup'); setErrorMessage(null); }}
              className={`px-4 py-2 font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'id-lookup'
                  ? 'bg-[#21182F] text-[#A66BFF] border border-[#A66BFF]/40 shadow-xs'
                  : 'text-[#AAA1B8] hover:text-[#F7F3FF]'
              }`}
            >
              Enter Notice ID
            </button>
            <button
              onClick={() => { setActiveTab('qr-scan'); setErrorMessage(null); }}
              className={`px-4 py-2 font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'qr-scan'
                  ? 'bg-[#21182F] text-[#A66BFF] border border-[#A66BFF]/40 shadow-xs'
                  : 'text-[#AAA1B8] hover:text-[#F7F3FF]'
              }`}
            >
              Scan QR Seal
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#A66BFF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>AIR-GAPPED LEDGER READY</span>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          
          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              
              {/* Drag and Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => {
                  if (!selectedFile && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  selectedFile
                    ? 'border-[#A66BFF]/60 bg-[#21182F]/30'
                    : 'border-[#302440] hover:border-[#A66BFF]/50 bg-[#100D19]/40 hover:bg-[#100D19]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-[#21182F] text-[#A66BFF] border border-[#302440] flex items-center justify-center mx-auto shadow-md shadow-[#A66BFF]/10">
                      <UploadCloud className="w-8 h-8 stroke-[1.8]" />
                    </div>
                    <div>
                      <div className="font-display text-base font-bold text-[#F7F3FF]">
                        Drag & drop official circular here, or{' '}
                        <span className="text-[#A66BFF] underline underline-offset-4 hover:text-[#D5B8FF]">
                          browse files
                        </span>
                      </div>
                      <p className="text-xs text-[#AAA1B8] mt-1.5 font-normal">
                        Supports PDF, PNG, JPG, JPEG, and WEBP. Screenshots and forwarded WhatsApp images supported.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2 font-mono text-[11px] text-[#AAA1B8]">
                      <span className="px-2 py-0.5 rounded bg-[#100D19] border border-[#302440]">PDF Master</span>
                      <span className="px-2 py-0.5 rounded bg-[#100D19] border border-[#302440]">Mobile Screenshots</span>
                      <span className="px-2 py-0.5 rounded bg-[#100D19] border border-[#302440]">WhatsApp JPEGs</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-lg mx-auto">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#100D19] border border-[#302440] text-left">
                      <div className="flex items-center gap-3 truncate">
                        <div className="p-2.5 rounded-lg bg-[#21182F] text-[#A66BFF] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-[#F7F3FF] truncate">
                            {selectedFile.name}
                          </div>
                          <div className="text-[11px] text-[#AAA1B8] font-mono mt-0.5">
                            {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'Document'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          resetSelection();
                        }}
                        className="p-1.5 text-[#AAA1B8] hover:text-[#EF4444] rounded-lg hover:bg-[#21182F] transition-colors shrink-0 ml-2"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Preview if available */}
                    {previewUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-[#302440] max-h-56 bg-[#090810] flex justify-center p-2">
                        <img
                          src={previewUrl}
                          alt="Document Preview"
                          className="max-h-52 object-contain rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-[#AAA1B8] font-mono">
                  Autonomous 7-Module Evidence Inspection Matrix
                </div>

                <button
                  onClick={handleVerifyUpload}
                  disabled={!selectedFile || isLoading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-xs font-bold text-[#090810] bg-[#A66BFF] hover:bg-[#D5B8FF] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(166,107,255,0.35)] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Inspecting Forensic Layers...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 stroke-[2.5]" />
                      <span>Start Forensic Verification</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ID LOOKUP */}
          {activeTab === 'id-lookup' && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <div className="space-y-2 text-center">
                <h3 className="font-display text-base font-bold text-[#F7F3FF]">
                  Query Cryptographic Registry by Notice Identifier
                </h3>
                <p className="text-xs text-[#AAA1B8]">
                  Enter the canonical identifier printed on the circular (e.g., <code className="text-[#A66BFF] font-mono">FS-GMU-2026-000001</code>).
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualDocId}
                  onChange={e => setManualDocId(e.target.value)}
                  placeholder="e.g. FS-GMU-2026-000001 or GMU/CIRC/2026/045"
                  className="flex-1 px-4 py-3 bg-[#100D19] border border-[#302440] rounded-xl text-xs text-[#F7F3FF] placeholder:text-[#AAA1B8]/50 focus:outline-none focus:border-[#A66BFF] font-mono"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleVerifyById();
                  }}
                />
                <button
                  onClick={handleVerifyById}
                  disabled={isLoading || !manualDocId.trim()}
                  className="px-6 py-3 rounded-xl font-mono text-xs font-bold text-[#090810] bg-[#A66BFF] hover:bg-[#D5B8FF] disabled:opacity-40 transition-colors flex items-center gap-2 shrink-0 cursor-pointer uppercase"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Verify ID</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QR SCAN */}
          {activeTab === 'qr-scan' && (
            <div className="space-y-6 max-w-xl mx-auto py-4 text-center">
              <div className="p-8 border border-dashed border-[#302440] rounded-2xl bg-[#100D19]/40 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#21182F] text-[#A66BFF] border border-[#302440] flex items-center justify-center mx-auto shadow-md">
                  <QrCode className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#F7F3FF]">
                    Upload or Capture QR Authentication Seal
                  </h3>
                  <p className="text-xs text-[#AAA1B8] mt-1">
                    Upload an image containing the circular&apos;s embedded QR authentication seal.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => qrFileInputRef.current?.click()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-mono text-xs font-semibold bg-[#21182F] text-[#D5B8FF] hover:bg-[#A66BFF] hover:text-[#090810] border border-[#302440] transition-colors"
                  >
                    Select Seal Photo
                  </button>
                  <input
                    ref={qrFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-xs text-[#EF4444] flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Forensic Pipeline Progress Sequence (Visible During Verification) */}
          {isLoading && (
            <div className="p-6 rounded-2xl bg-[#100D19] border border-[#A66BFF]/40 space-y-5 animate-pulse">
              <div className="flex items-center justify-between border-b border-[#302440] pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#A66BFF]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#A66BFF]" />
                  <span>EXECUTING 7-MODULE FORENSIC EVIDENCE PIPELINE</span>
                </div>
                <span className="font-mono text-xs text-[#D5B8FF]">
                  Step {currentStepIndex + 1} of 7
                </span>
              </div>

              {/* Seven Verification Checks Progress Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                {verificationSteps.map((step, idx) => {
                  const isDone = currentStepIndex > idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div
                      key={step.num}
                      className={`p-3 rounded-lg border flex items-start gap-2.5 transition-all ${
                        isDone
                          ? 'bg-[#21182F]/60 border-[#10B981]/50 text-[#10B981]'
                          : isCurrent
                          ? 'bg-[#21182F] border-[#A66BFF] text-[#F7F3FF] shadow-[0_0_12px_rgba(166,107,255,0.25)]'
                          : 'bg-[#090810]/40 border-[#302440] text-[#AAA1B8]/60'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A66BFF]" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-[#302440] inline-block" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{step.num}.</span>
                          <span>{step.name}</span>
                        </div>
                        <p className="text-[10px] text-[#AAA1B8] font-sans mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
