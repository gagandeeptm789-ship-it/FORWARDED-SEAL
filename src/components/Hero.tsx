import React from 'react';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  Lock,
  Layers,
  Fingerprint,
  Cpu,
  Key,
  QrCode,
  CheckCircle2,
  Sparkles,
  Shield,
  FileCheck2,
  Activity
} from 'lucide-react';

interface HeroProps {
  onVerifyClick: () => void;
  onAdminClick: () => void;
  onTestLabClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onVerifyClick,
  onAdminClick,
  onTestLabClick
}) => {
  return (
    <div className="relative overflow-hidden bg-[#090810] border-b border-[#302440]">
      {/* Background Technical Grid & Atmospheric Violet Lighting */}
      <div className="absolute inset-0 bg-grid-forensic pointer-events-none opacity-40" />
      
      {/* Soft Radial Violet Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#8B5CF6]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#A66BFF]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Authoritative Editorial Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Outlined Label */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#171321] text-[#D5B8FF] font-mono text-xs font-semibold tracking-wider uppercase border border-[#302440] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#A66BFF] animate-pulse" />
                <span>DIGITAL DOCUMENT TRUST PLATFORM</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F7F3FF] leading-[1.08] text-balance">
                Trust Shouldn't Disappear When{' '}
                <span className="bg-gradient-to-r from-[#A66BFF] via-[#D5B8FF] to-[#F7F3FF] bg-clip-text text-transparent">
                  Documents Are Forwarded.
                </span>
              </h1>

              {/* Supporting Headline */}
              <p className="font-display text-xl sm:text-2xl font-semibold text-[#D5B8FF] tracking-tight">
                Verify the source. Protect the information.
              </p>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#AAA1B8] leading-relaxed max-w-2xl font-normal">
                The Forwarded Seal enables institutions to establish document authenticity through cryptographic signatures, secure registration and forensic evidence.
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={onVerifyClick}
                  className="px-7 py-3.5 text-xs font-mono font-bold text-[#090810] bg-[#A66BFF] hover:bg-[#D5B8FF] rounded-xl shadow-[0_0_20px_rgba(166,107,255,0.35)] transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-wider group"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>VERIFY A DOCUMENT</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#the-problem"
                  className="px-6 py-3.5 text-xs font-mono font-bold text-[#F7F3FF] hover:text-white bg-[#171321] hover:bg-[#21182F] border border-[#302440] hover:border-[#A66BFF]/50 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                >
                  <span>EXPLORE THE PLATFORM</span>
                </a>

                <button
                  onClick={onTestLabClick}
                  className="px-4 py-3.5 text-xs font-mono font-medium text-[#AAA1B8] hover:text-[#F7F3FF] border border-[#302440] hover:border-[#A66BFF]/40 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#100D19]/60"
                  title="Run all 27 automated security tests"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#A66BFF]" />
                  <span>Security Lab (27 Tests)</span>
                </button>
              </div>

              {/* Trust Markers Bar */}
              <div className="pt-6 border-t border-[#302440] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#AAA1B8] font-mono">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#A66BFF]" />
                  <span>Ed25519 Signatures</span>
                </div>
                <span className="text-[#302440]">/</span>
                <div className="flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-[#A66BFF]" />
                  <span>SHA-256 Ledger Baseline</span>
                </div>
                <span className="text-[#302440]">/</span>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#A66BFF]" />
                  <span>Carrier Watermarking</span>
                </div>
              </div>
            </div>

            {/* Right Column: Original Document-Security Visualization */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              
              {/* Outer Decorative Glow Halo */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#A66BFF]/20 via-[#8B5CF6]/10 to-transparent blur-xl pointer-events-none" />

              {/* Floating Dark Document Panel */}
              <div className="relative w-full max-w-[440px] p-6 rounded-2xl bg-[#171321] border border-[#302440] shadow-2xl overflow-hidden flex flex-col justify-between text-[#F7F3FF] group hover:border-[#A66BFF]/50 transition-colors">
                
                {/* Internal Fine Technical Grid */}
                <div className="absolute inset-0 bg-grid-forensic-dense opacity-20 pointer-events-none" />

                {/* Animated Forensic Scanning Ray */}
                <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-[#A66BFF]/0 via-[#A66BFF]/25 to-[#D5B8FF]/40 pointer-events-none animate-forensic-scan" />

                {/* Top Bar of Floating Official Document */}
                <div className="relative z-10 flex items-center justify-between border-b border-[#302440] pb-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="font-mono text-[10px] text-[#AAA1B8] ml-2">FS-GMU-2026-000492.PDF</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#A66BFF] px-2 py-0.5 rounded bg-[#21182F] border border-[#302440]">
                    OFFICIAL ISSUED
                  </span>
                </div>

                {/* Document Body Preview */}
                <div className="relative z-10 my-4 space-y-4">
                  
                  {/* University Communique Header */}
                  <div className="text-center border-b border-[#302440] pb-3">
                    <div className="font-display text-xs font-bold tracking-wider uppercase text-white">
                      GRAND METROPOLITAN UNIVERSITY
                    </div>
                    <div className="font-mono text-[9px] text-[#AAA1B8]">
                      OFFICE OF THE REGISTRAR · EXAMINATION COMMUNIQUE
                    </div>
                  </div>

                  {/* Simulated Circular Lines */}
                  <div className="space-y-2">
                    <div className="h-2 w-3/4 bg-[#21182F] rounded" />
                    <div className="h-2 w-full bg-[#21182F]/70 rounded" />
                    <div className="h-2 w-5/6 bg-[#21182F]/50 rounded" />
                    <div className="h-2 w-2/3 bg-[#21182F]/40 rounded" />
                  </div>

                  {/* Central Digital Seal Medallion with Violet Concentric Rings */}
                  <div className="relative mx-auto my-2 w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-dashed border-[#A66BFF]/40 animate-[spin_35s_linear_infinite]" />
                    <div className="absolute inset-1.5 rounded-full border border-[#8B5CF6]/50" />
                    
                    {/* Center Seal Badge */}
                    <div className="w-20 h-20 rounded-full bg-[#21182F] border-2 border-[#A66BFF] flex flex-col items-center justify-center shadow-lg text-center p-1 relative z-10 shadow-[0_0_15px_rgba(166,107,255,0.3)]">
                      <ShieldCheck className="w-6 h-6 text-[#A66BFF] mb-0.5" />
                      <span className="text-[7px] font-display font-bold uppercase tracking-wider text-white block leading-none">
                        THE FORWARDED
                      </span>
                      <span className="text-[6.5px] font-mono font-bold text-[#D5B8FF] block">
                        SEAL · 2026
                      </span>
                    </div>
                  </div>

                  {/* Connected Security Indicators Matrix */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                    <div className="p-2 rounded bg-[#100D19] border border-[#302440] flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-[#A66BFF] shrink-0" />
                      <div className="truncate">
                        <span className="text-[9px] text-[#AAA1B8] block">ED25519 SIG</span>
                        <span className="text-[#10B981] font-bold">RFC_8032_VALID</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-[#100D19] border border-[#302440] flex items-center gap-2">
                      <QrCode className="w-3.5 h-3.5 text-[#A66BFF] shrink-0" />
                      <div className="truncate">
                        <span className="text-[9px] text-[#AAA1B8] block">QR SEAL</span>
                        <span className="text-white">CRYPTOGRAPHIC</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-[#100D19] border border-[#302440] flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#A66BFF] shrink-0" />
                      <div className="truncate">
                        <span className="text-[9px] text-[#AAA1B8] block">WATERMARK</span>
                        <span className="text-[#D5B8FF]">EXTRACTED</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-[#100D19] border border-[#302440] flex items-center gap-2">
                      <Fingerprint className="w-3.5 h-3.5 text-[#A66BFF] shrink-0" />
                      <div className="truncate">
                        <span className="text-[9px] text-[#AAA1B8] block">SHA-256</span>
                        <span className="text-[#10B981] font-bold">MATCHED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Status Bar */}
                <div className="relative z-10 pt-3 border-t border-[#302440] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="font-mono text-[10px] text-[#10B981] font-semibold">ALL 7 FORENSIC MODULES VERIFIED</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#AAA1B8]">SHA: e3b0c442...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Capability Strip */}
      <div className="border-t border-[#302440] bg-[#100D19]/80 py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-[#AAA1B8]">
          <div className="flex items-center gap-2">
            <span className="text-[#A66BFF]">▸</span>
            <span className="text-[#F7F3FF] font-semibold">ED25519 DIGITAL SIGNATURES</span>
          </div>
          <span className="hidden sm:inline text-[#302440]">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[#A66BFF]">▸</span>
            <span className="text-[#F7F3FF] font-semibold">SHA-256 INTEGRITY</span>
          </div>
          <span className="hidden sm:inline text-[#302440]">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[#A66BFF]">▸</span>
            <span className="text-[#F7F3FF] font-semibold">QR AUTHENTICATION</span>
          </div>
          <span className="hidden sm:inline text-[#302440]">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[#A66BFF]">▸</span>
            <span className="text-[#F7F3FF] font-semibold">DIGITAL WATERMARKING</span>
          </div>
          <span className="hidden sm:inline text-[#302440]">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[#A66BFF]">▸</span>
            <span className="text-[#F7F3FF] font-semibold">SEMANTIC OCR</span>
          </div>
          <span className="hidden sm:inline text-[#302440]">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[#A66BFF]">▸</span>
            <span className="text-[#F7F3FF] font-semibold">IMAGE FORENSICS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
