import React from 'react';
import { Shield, Lock, FileCheck2, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenVerify: () => void;
  onOpenTestLab: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenVerify,
  onOpenTestLab
}) => {
  return (
    <footer className="bg-[#090810] border-t border-[#302440] text-[#AAA1B8] relative overflow-hidden font-sans">
      {/* Background Subtle Grid & Ambient Violet Glow */}
      <div className="absolute inset-0 bg-grid-forensic pointer-events-none opacity-20" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Statement Banner */}
      <div className="border-b border-[#302440] px-6 py-12 md:py-16 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="font-mono text-xs font-semibold text-[#A66BFF] tracking-wider uppercase block mb-3">
              DIGITAL TRUST INFRASTRUCTURE
            </span>
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#F7F3FF] tracking-tight leading-tight">
              &ldquo;THE DOCUMENT MAY TRAVEL.<br />THE TRUST MUST REMAIN.&rdquo;
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenVerify}
              className="px-5 py-2.5 rounded-xl bg-[#A66BFF] hover:bg-[#D5B8FF] text-[#090810] font-mono font-bold text-xs tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
            >
              Verify Notice
            </button>
            <button
              onClick={onOpenAdmin}
              className="px-5 py-2.5 rounded-xl bg-[#171321] hover:bg-[#21182F] text-[#D5B8FF] border border-[#302440] hover:border-[#A66BFF]/40 font-mono font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#171321] border border-[#302440] flex items-center justify-center text-[#A66BFF]">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                THE FORWARDED SEAL
              </span>
            </div>
            <p className="text-xs text-[#AAA1B8] leading-relaxed max-w-sm">
              Cryptographic document integrity and forensic provenance for universities, examination boards, and public institutions. Built to survive JPEG compression, cropping, and messaging forwards.
            </p>
            <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-[#A66BFF]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>STRICT AUTHENTICITY ENGINE · 7 FORENSIC MODULES</span>
            </div>
          </div>

          {/* Portals */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider block">
              Portals
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenVerify}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Public Verification
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Institutional Issuer
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTestLab}
                  className="hover:text-[#A66BFF] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Security Lab</span>
                  <span className="font-mono text-[10px] text-[#A66BFF] px-1 py-0.2 rounded bg-[#171321] border border-[#302440]">
                    27
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Cryptographic Standards */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider block">
              Standards & Ciphers
            </span>
            <ul className="space-y-2 text-xs font-mono text-[#AAA1B8]">
              <li className="flex items-center gap-1.5">
                <span className="text-[#A66BFF]">▸</span>
                <span>Ed25519 (RFC 8032 Asymmetric)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#A66BFF]">▸</span>
                <span>SHA-256 Digest Baseline</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#A66BFF]">▸</span>
                <span>Spatial Carrier Watermarking</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#A66BFF]">▸</span>
                <span>Tamper Heatmap & OCR Diff</span>
              </li>
            </ul>
          </div>

          {/* Compliance & Verification */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider block">
              Decision Rule
            </span>
            <p className="text-xs text-[#AAA1B8] leading-relaxed">
              Zero false-genuine tolerance. If any single module fails, the document is definitively classified as <span className="text-[#EF4444] font-bold">INTEGRITY COMPROMISED</span>.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#302440] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#AAA1B8]/80 font-mono">
          <div>
            © 2026 The Forwarded Seal. Digital Trust Infrastructure for Public Institutions.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>NON-REPUDIATION</span>
            <span aria-hidden="true" className="text-[#302440]">|</span>
            <span>AIR-GAPPED LEDGER</span>
            <span aria-hidden="true" className="text-[#302440]">|</span>
            <span className="text-[#A66BFF]">RFC 8032</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
