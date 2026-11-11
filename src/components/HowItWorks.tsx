import React from 'react';
import {
  FilePlus,
  ShieldCheck,
  Share2,
  Smartphone,
  Search,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Institution Registers Document',
      icon: FilePlus,
      headline: 'Official Administrative Filing',
      desc: 'Authorized registrars upload the original circular. The system assigns a unique Notice ID and indexes reference metadata in the registry.',
      highlight: 'Notice ID Allocation'
    },
    {
      num: '02',
      title: 'Cryptographic Protection',
      icon: ShieldCheck,
      headline: 'Ed25519 Signing & Multi-Carrier Seal',
      desc: 'The manifest is digitally signed using asymmetric Ed25519 keys, SHA-256 digest is generated, and an invisible spatial watermark is embedded.',
      highlight: 'RFC 8032 Asymmetric'
    },
    {
      num: '03',
      title: 'Secure Publication',
      icon: Share2,
      headline: 'Verified Artifact Distribution',
      desc: 'Protected PDF/PNG copies and authenticated QR badges are generated for university websites, student portals, and press channels.',
      highlight: 'Tamper-Evident Artifacts'
    },
    {
      num: '04',
      title: 'Student Receives Forwarded Copy',
      icon: Smartphone,
      headline: 'WhatsApp & Social Media Sharing',
      desc: 'The notice is forwarded across messaging groups, undergoing JPEG compression, mobile screenshots, and selective cropping.',
      highlight: 'Lossy Transformation'
    },
    {
      num: '05',
      title: 'Multi-Layer Verification',
      icon: Search,
      headline: '7-Module Autonomous Forensics',
      desc: 'The student uploads the forwarded image or enters its Notice ID. The engine evaluates Ed25519 signature, QR seal, watermark, OCR, and pixels.',
      highlight: 'Evidence Extraction'
    },
    {
      num: '06',
      title: 'Final Authenticity Result',
      icon: CheckCircle2,
      headline: 'Clear, Unambiguous Verdict',
      desc: 'The strict decision engine returns Authentic, Integrity Compromised, or Inconclusive with clear human explanations and PDF certificate.',
      highlight: 'Zero False Genuine'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 border-b border-[#302440] bg-[#090810] relative">
      <div className="absolute inset-0 bg-grid-forensic pointer-events-none opacity-20" />
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171321] text-[#A66BFF] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#302440] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A66BFF]" />
              End-to-End Verification Pipeline
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F7F3FF] tracking-tight">
              How The Forwarded Seal Operates
            </h2>
            <p className="text-sm sm:text-base text-[#AAA1B8] mt-3 leading-relaxed">
              From administrative publication to student smartphone verification: a resilient 6-step lifecycle that survives compression, screenshots, and visual tampering.
            </p>
          </div>
          <div className="font-mono text-xs text-[#AAA1B8] shrink-0">
            SEQUENCE <span className="text-[#A66BFF] font-bold">01 → 06</span>
          </div>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group p-6 rounded-2xl bg-[#171321] border border-[#302440] hover:border-[#A66BFF]/60 transition-all flex flex-col justify-between shadow-xs hover:shadow-[0_0_20px_rgba(166,107,255,0.15)] relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-xs font-bold text-[#A66BFF] bg-[#21182F] px-2.5 py-1 rounded border border-[#302440]">
                      STEP {step.num}
                    </span>
                    <div className="p-2.5 rounded-xl bg-[#21182F] text-[#A66BFF] group-hover:bg-[#A66BFF] group-hover:text-[#090810] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-display text-base font-bold text-white mb-1 group-hover:text-[#D5B8FF] transition-colors">
                    {step.title}
                  </h3>
                  <div className="text-xs text-[#A66BFF] font-semibold mb-2.5">
                    {step.headline}
                  </div>
                  <p className="text-xs text-[#AAA1B8] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#302440] flex items-center justify-between text-[11px] font-mono text-[#AAA1B8]">
                  <span>{step.highlight}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A66BFF] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
