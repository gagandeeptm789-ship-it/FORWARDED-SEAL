import React, { useState } from 'react';
import {
  Lock,
  Hash,
  Layers,
  QrCode,
  Eye,
  Search,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  Cpu
} from 'lucide-react';

export const SecurityTech: React.FC = () => {
  const [selectedTech, setSelectedTech] = useState<number>(0);

  const technologies = [
    {
      id: 'ed25519',
      title: 'Ed25519 Asymmetric Signatures',
      icon: Lock,
      badge: 'RFC 8032 Core',
      summary: 'High-speed Edwards-curve digital signatures guaranteeing institutional non-repudiation.',
      details:
        'Every published circular is mathematically signed using a server-isolated Ed25519 private key. The public verification key is published in the institutional registry, enabling instant verification while keeping keys impervious to client-side extraction.',
      threatsMitigated: ['Signature forgery', 'Unauthorized circular release', 'Repudiation by authorities']
    },
    {
      id: 'sha256',
      title: 'SHA-256 Binary Integrity',
      icon: Hash,
      badge: 'Canonical Digest',
      summary: 'Cryptographic hash functions verifying bit-for-bit exact document identity.',
      details:
        'Calculates 256-bit secure cryptographic digests of original and protected documents. Provides instantaneous bit-level verification for downloaded master copies and original institutional PDFs.',
      threatsMitigated: ['File byte modification', 'Trojan document injection', 'Silent payload alteration']
    },
    {
      id: 'watermarking',
      title: 'Robust Digital Watermark Carrier',
      icon: Layers,
      badge: 'Spatial Carrier Signal',
      summary: 'Spread-spectrum discrete frequency modulation resilient to compression and screenshots.',
      details:
        'Embeds compact redundancy-coded authentication tokens directly into document carriers. Even when images undergo JPEG compression or format conversion, the carrier signal can be detected and checked against server manifests.',
      threatsMitigated: ['Social media recompression', 'Screen photographs', 'Format shifts (PNG to JPEG)']
    },
    {
      id: 'qr-auth',
      title: 'Signed QR Authentication Seal',
      icon: QrCode,
      badge: 'Cryptographic Seal',
      summary: 'High-density QR matrix binding document ID directly to institutional verification ledger.',
      details:
        'Carries the document identifier, issue date, and direct portal link. The verification engine tests whether the embedded QR points to a genuine registered manifest, preventing attacker QR transplantation.',
      threatsMitigated: ['Fake institutional stamps', 'QR transplantation onto forged notices', 'Link phishing']
    },
    {
      id: 'ocr-diff',
      title: 'Semantic OCR Text Comparison',
      icon: Search,
      badge: 'Semantic Integrity',
      summary: 'Deep character-level and semantic field extraction with side-by-side discrepancy highlighting.',
      details:
        'Extracts dates, circular titles, reference numbers, and body text. Runs semantic diff algorithms to detect unauthorized changes (such as shifting exam dates from May 15 to June 25) even if the visual layout looks convincing.',
      threatsMitigated: ['Viral WhatsApp date hoaxes', 'Schedule confusion', 'Altered administrative directives']
    },
    {
      id: 'forensics',
      title: 'Structural Image Forensics',
      icon: Eye,
      badge: 'Raster Differencing',
      summary: 'Pixel-level structural differencing, alignment verification, and localized tampering heatmaps.',
      details:
        'Compares uploaded documents against canonical registered raster baselines. Generates visual difference heatmaps to pinpoint exact regions where attackers have spliced text boxes, altered dates, or pasted fraudulent signatures.',
      threatsMitigated: ['Date splicing', 'Altered fee amounts', 'Cut-and-paste typography manipulation']
    },
    {
      id: 'revocation',
      title: 'Institutional Revocation Status',
      icon: ShieldCheck,
      badge: 'Live Status Check',
      summary: 'Real-time query checking whether an issued circular has been superseded, cancelled, or revoked.',
      details:
        'Prevents obsolete circulars from misleading students. If the university controller cancels an exam notice or issues an updated schedule, older copies are immediately flagged as revoked during verification.',
      threatsMitigated: ['Stale circular reliance', 'Superseded exam directives', 'Expired administrative policies']
    }
  ];

  return (
    <section id="technology" className="py-20 px-6 border-b border-[#302440] bg-[#100D19] relative">
      <div className="absolute inset-0 bg-grid-forensic pointer-events-none opacity-25" />
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171321] text-[#A66BFF] font-mono text-[11px] font-semibold tracking-wider uppercase border border-[#302440] mb-4">
            <Cpu className="w-3.5 h-3.5 text-[#A66BFF]" />
            <span>THE FORENSIC SOLUTION</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F7F3FF] tracking-tight text-balance">
            Seven layers. One informed verification decision.
          </h2>

          <p className="text-sm sm:text-base text-[#AAA1B8] mt-3 leading-relaxed">
            By aggregating independent cryptographic, optical, carrier, and semantic signals, The Forwarded Seal delivers definitive authenticity verdicts even after severe document transformations.
          </p>
        </div>

        {/* Interactive View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Selectable List (7 Modules) */}
          <div className="lg:col-span-5 space-y-2.5">
            {technologies.map((tech, idx) => {
              const Icon = tech.icon;
              const isSelected = selectedTech === idx;
              return (
                <button
                  key={tech.id}
                  onClick={() => setSelectedTech(idx)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all border flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#171321] border-[#A66BFF] shadow-[0_0_15px_rgba(166,107,255,0.2)] ring-1 ring-[#A66BFF]/40'
                      : 'bg-[#171321]/60 border-[#302440] hover:border-[#A66BFF]/40 hover:bg-[#171321]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-[#21182F] text-[#A66BFF] border border-[#A66BFF]/50'
                        : 'bg-[#100D19] text-[#AAA1B8] border border-[#302440]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-display text-xs sm:text-sm font-bold text-[#F7F3FF]">
                        {tech.title}
                      </div>
                      <div className="text-[10px] text-[#AAA1B8] line-clamp-1">
                        {tech.summary}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono shrink-0 px-2 py-0.5 rounded border ${
                    isSelected
                      ? 'bg-[#21182F] text-[#D5B8FF] border-[#A66BFF]/40'
                      : 'bg-[#100D19] text-[#AAA1B8] border-[#302440]'
                  }`}>
                    {tech.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Deep-Dive Panel */}
          <div className="lg:col-span-7 bg-[#171321] text-[#F7F3FF] border border-[#302440] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
            
            {(() => {
              const active = technologies[selectedTech];
              const Icon = active.icon;
              return (
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between gap-4 border-b border-[#302440] pb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[#21182F] text-[#A66BFF] border border-[#302440]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-[#A66BFF] font-mono uppercase tracking-wider">
                          Module 0{selectedTech + 1} Specification
                        </div>
                        <h3 className="font-display text-xl font-bold text-white mt-0.5">
                          {active.title}
                        </h3>
                      </div>
                    </div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#21182F] text-[#D5B8FF] border border-[#302440]">
                      {active.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#AAA1B8] mb-2">
                      Technical Architecture & Execution
                    </h4>
                    <p className="text-sm text-[#F7F3FF]/90 leading-relaxed font-normal">
                      {active.details}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#100D19] border border-[#302440] space-y-3">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#D5B8FF]">
                      Threat Vectors Mitigated
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {active.threatsMitigated.map((threat, i) => (
                        <div key={i} className="flex items-center gap-2 text-white">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                          <span>{threat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#302440] flex items-center justify-between text-[11px] font-mono text-[#AAA1B8]">
                    <span>Module Index: {selectedTech + 1} of 7 in Pipeline</span>
                    <span className="text-[#A66BFF] font-semibold">Strict Authenticity Engine</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};
