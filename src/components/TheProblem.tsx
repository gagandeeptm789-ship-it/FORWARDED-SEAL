import React from 'react';
import {
  AlertTriangle,
  Smartphone,
  Crop,
  Calendar,
  Stamp,
  QrCode,
  Layers,
  ArrowRight,
  FileX2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const TheProblem: React.FC = () => {
  const attackVectors = [
    {
      icon: Smartphone,
      title: 'Messaging Compression',
      tag: 'JPEG / WEBP Artifacts',
      desc: 'Platforms like WhatsApp, Telegram, and Discord recompress PDFs into low-quality JPEGs. Standard bit-for-bit file hash verification breaks immediately even if the circular is 100% authentic.'
    },
    {
      icon: Smartphone,
      title: 'Screenshots & Photos',
      tag: 'Screen Photographing',
      desc: 'Students photograph physical computer monitors or forward screenshots across group chats. Perspective skew and pixel resynthesis eliminate file-level metadata completely.'
    },
    {
      icon: Crop,
      title: 'Selective Cropping',
      tag: 'Boundary Truncation',
      desc: 'Removing disclaimers, condition clauses, fee payment schedules, or validity dates while preserving official institutional mastheads.'
    },
    {
      icon: Calendar,
      title: 'Modified Exam Dates',
      tag: 'Spliced Typography',
      desc: 'Splicing new dates (e.g., postponing a national exam from May 15 to June 25) using matching typography and subtle Gaussian blurring to fool students and faculty.'
    },
    {
      icon: Stamp,
      title: 'Copied Institutional Seals',
      tag: 'Logo & Signature Splicing',
      desc: 'Pasting authentic high-resolution college emblems and registrar signatures onto fraudulent circulars or forged fee hike cancellation notices.'
    },
    {
      icon: QrCode,
      title: 'QR Code Transplantation',
      tag: 'Carrier Misdirection',
      desc: 'Copying a genuine QR code from last year’s authentic notice onto a forged document. Naive scanners report the QR as "valid" even though the underlying circular is fake.'
    }
  ];

  return (
    <section id="the-problem" className="py-20 px-6 border-b border-[#302440] bg-[#090810] relative">
      <div className="absolute inset-0 bg-grid-forensic pointer-events-none opacity-25" />
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171321] text-[#EF4444] font-mono text-[11px] font-semibold tracking-wider uppercase border border-[#302440] mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>THE CHALLENGE OF DIGITAL FORWARDING</span>
          </div>
          
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F7F3FF] tracking-tight text-balance">
            A forwarded document can look genuine and still be manipulated.
          </h2>
          
          <p className="text-sm sm:text-base text-[#AAA1B8] mt-3 leading-relaxed">
            Traditional file-hash verification fails because compression, forwarding, and screenshots alter the underlying bytes. Attackers exploit this gap to forge dates, transplant seals, and spread viral circular hoaxes.
          </p>
        </div>

        {/* 6-Grid Attack Vectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attackVectors.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#171321] border border-[#302440] hover:border-[#A66BFF]/50 transition-all flex flex-col justify-between group shadow-xs hover:shadow-[0_0_20px_rgba(166,107,255,0.15)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#21182F] text-[#A66BFF] border border-[#302440] group-hover:border-[#A66BFF]/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] text-[#EF4444] px-2 py-0.5 rounded bg-[#EF4444]/10 border border-[#EF4444]/20">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-white mb-2 group-hover:text-[#D5B8FF] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#AAA1B8] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#302440] flex items-center justify-between text-[10px] font-mono text-[#AAA1B8]">
                  <span>Vulnerability Vector #{idx + 1}</span>
                  <span className="text-[#A66BFF]">Neutralized by The Seal</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contrast Comparison Banner */}
        <div className="mt-12 p-6 md:p-8 rounded-2xl bg-[#100D19] border border-[#302440] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <span className="font-mono text-xs text-[#EF4444] uppercase tracking-wider block">
              Conventional Verification Limitation
            </span>
            <h4 className="font-display text-lg font-bold text-white">
              Why single-hash (SHA-256 alone) fails on mobile forwards:
            </h4>
            <p className="text-xs text-[#AAA1B8] leading-relaxed">
              When a student screenshots a circular or forwards it via WhatsApp, the byte stream changes completely. A single altered bit breaks the hash. Without carrier watermarking and semantic verification, authentic circulars appear &ldquo;unverified,&rdquo; while forged documents slip through undetected.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#171321] border border-[#302440] space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-[#090810] border border-[#302440]">
              <span className="text-[#AAA1B8]">Original PDF Hash:</span>
              <span className="text-[#10B981] font-bold">e3b0c442... [MATCH]</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#090810] border border-[#302440]">
              <span className="text-[#AAA1B8]">WhatsApp Forward Hash:</span>
              <span className="text-[#EF4444] font-bold">7a91bf02... [HASH MISMATCH]</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#21182F] border border-[#A66BFF]/40 text-[#D5B8FF]">
              <span>The Forwarded Seal Forensic Result:</span>
              <span className="text-[#10B981] font-bold">7/7 CHECKS PASSED</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
