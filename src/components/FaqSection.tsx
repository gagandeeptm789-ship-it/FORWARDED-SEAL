import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Why does traditional file-hash verification fail when circulars are forwarded on WhatsApp?',
      a: 'Cryptographic hash functions like SHA-256 are avalanche-sensitive: even a single modified bit produces a completely different hash string. When an official PDF is screenshotted, saved as a JPEG, or compressed by messaging platforms, pixel compression re-encodes the file bytes. As a result, standard file hashes diverge completely even if the visual circular is genuine. The Forwarded Seal solves this by combining asymmetric digital manifests, frequency-domain watermarks, and OCR semantic comparison that survive visual transformations.'
    },
    {
      q: 'What prevents a bad actor from copying a genuine QR code onto a fake or manipulated circular?',
      a: 'This attack vector is known as QR transplantation. Our verification engine does not treat a valid QR code as proof of authenticity. Instead, the decoded QR identifier is used to look up the institutional manifest and canonical text baseline. The engine then runs OCR and pixel forensics against the uploaded image. If the text (such as exam dates or directives) or visual layout conflicts with the registered baseline, the document is immediately classified as suspicious.'
    },
    {
      q: 'How does the platform distinguish between lossy compression and intentional tampering?',
      a: 'Ordinary compression artifacts (e.g. 8x8 DCT grid blocking from JPEG) are distributed uniformly across the entire image. In contrast, document manipulation typically introduces localized structural variances: spliced text boxes, font antialiasing differences, mismatched resolution in the date or signature field, and character semantic substitutions. Our engine differentiates global compression noise from targeted regional modifications.'
    },
    {
      q: 'What is an Irrelevant Document and how is it different from a fake document?',
      a: 'An irrelevant document is a file that is completely unrelated to institutional notices (such as personal photographs, nature shots, selfies, receipts, or memes). Rather than incorrectly labeling them as fake or tampered circulars, our system specifically categorizes them as "Irrelevant Document" and politely prompts the student to upload an official circular instead.'
    },
    {
      q: 'Does verifying a document require an account or registration?',
      a: 'No. The Public Verification Portal is completely open to students, parents, faculty, journalists, and the general public. No registration, login, or personal information is collected for verification. Only institutional administrators issuing or revoking circulars require authenticated access.'
    },
    {
      q: 'How are the cryptographic signing keys protected?',
      a: 'Ed25519 asymmetric private signing keys remain strictly on the backend secure server environment and are never exposed to client browsers or API responses. Only public verification keys and key fingerprints are published for mathematical validation.'
    }
  ];

  return (
    <section className="py-20 px-6 border-b border-[#302440] bg-[#090810] relative">
      <div className="absolute inset-0 bg-grid-forensic pointer-events-none opacity-20" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171321] text-[#A66BFF] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#302440] mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-[#A66BFF]" />
            Frequently Asked Questions
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#F7F3FF] tracking-tight">
            Understanding Document Forensics & Verification
          </h2>
          <p className="text-sm text-[#AAA1B8] mt-2">
            Answers to common questions regarding cryptographic integrity, compression tolerance, and forensic modules.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#171321] border border-[#302440] overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-display text-sm font-bold text-[#F7F3FF] hover:text-[#D5B8FF] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#AAA1B8] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#A66BFF]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#AAA1B8] leading-relaxed border-t border-[#302440] pt-3 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
