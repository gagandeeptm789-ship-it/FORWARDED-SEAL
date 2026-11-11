import { VerificationCheck, ModuleFailureDetails } from '../db/database.ts';

export type DecisionClassification =
  | 'GENUINE'
  | 'SUSPICIOUS'
  | 'UNVERIFIED'
  | 'IRRELEVANT'
  | 'ERROR';

export interface DecisionResult {
  classification: DecisionClassification;
  headline: string;
  statusBadge: 'VERIFIED' | 'FAILED' | 'UNVERIFIED' | 'IRRELEVANT' | 'ERROR';
  reasons: string[];
  failedModules: VerificationCheck[];
  passedModules: VerificationCheck[];
  incompleteModules: VerificationCheck[];
  failureDetailsList: ModuleFailureDetails[];
}

export class StrictDecisionEngine {
  /**
   * Centralized decision engine enforcing the 7-module verification rules:
   * Rule A: If ANY of the 7 modules is FAIL -> NOT GENUINE / SUSPICIOUS (Zero tolerance for failures)
   * Rule B: If ALL 7 modules are PASS -> VERIFIED AGAINST ALL SEVEN CHECKS
   * Rule C: If no FAIL, but 1+ are SKIPPED or INCONCLUSIVE -> UNVERIFIED (Never genuine)
   * Rule D: If file is irrelevant -> IRRELEVANT DOCUMENT
   * Rule E: If analysis error -> ANALYSIS ERROR
   */
  public static evaluate(args: {
    modules: {
      cryptographic: VerificationCheck;
      fileIntegrity: VerificationCheck;
      qrVerification: VerificationCheck;
      watermarkVerification: VerificationCheck;
      ocrComparison: VerificationCheck;
      imageForensics: VerificationCheck;
      revocationStatus: VerificationCheck;
    };
    isIrrelevant?: boolean;
    isProcessingError?: boolean;
    errorMessage?: string;
  }): DecisionResult {
    // Rule E: Processing / Analysis Error
    if (args.isProcessingError) {
      return {
        classification: 'ERROR',
        headline: 'ANALYSIS ERROR',
        statusBadge: 'ERROR',
        reasons: [
          'Document analysis could not be completed due to a processing error.',
          args.errorMessage || 'Invalid or unreadable document stream.'
        ],
        failedModules: [],
        passedModules: [],
        incompleteModules: [],
        failureDetailsList: []
      };
    }

    // Rule D: Irrelevant Document (Personal photo, meme, unrelated graphic)
    if (args.isIrrelevant) {
      return {
        classification: 'IRRELEVANT',
        headline: 'IRRELEVANT DOCUMENT',
        statusBadge: 'IRRELEVANT',
        reasons: [
          'The uploaded file is not recognized as an official institutional circular, academic notice, or certificate.',
          'Document verification checks require an official institutional circular with standard headers, reference numbers, or security seals.',
          'Please upload a supported institutional circular, notice, or certificate.'
        ],
        failedModules: [],
        passedModules: [],
        incompleteModules: [],
        failureDetailsList: []
      };
    }

    const {
      cryptographic,
      fileIntegrity,
      qrVerification,
      watermarkVerification,
      ocrComparison,
      imageForensics,
      revocationStatus
    } = args.modules;

    const moduleList: VerificationCheck[] = [
      cryptographic,
      fileIntegrity,
      qrVerification,
      watermarkVerification,
      ocrComparison,
      imageForensics,
      revocationStatus
    ];

    const failedModules = moduleList.filter(m => m.status === 'FAIL');
    const passedModules = moduleList.filter(m => m.status === 'PASS');
    const incompleteModules = moduleList.filter(
      m => m.status === 'SKIPPED' || m.status === 'INCONCLUSIVE'
    );

    // Rule A: Confirmed Failure (If even ONE module fails, NEVER GENUINE)
    if (failedModules.length > 0) {
      const failureDetailsList: ModuleFailureDetails[] = failedModules.map(m => {
        if (m.failureDetails) {
          return m.failureDetails;
        }
        return {
          moduleName: m.moduleName || m.title,
          expected: 'Integrity and authenticity baseline compliance.',
          detected: m.details,
          whySuspicious: `Integrity check failed: ${m.details}`,
          evidence: m.evidence,
          recommendedAction: 'Do not trust or act on this notice without direct registrar confirmation.'
        };
      });

      const reasons: string[] = [
        `Confirmed integrity or authenticity failure detected in ${failedModules.length} forensic module(s):`,
        ...failedModules.map(
          m => `• [FAIL] ${m.moduleName || m.title}: ${m.explanation || m.details}`
        )
      ];

      return {
        classification: 'SUSPICIOUS',
        headline: 'NOT GENUINE / SUSPICIOUS',
        statusBadge: 'FAILED',
        reasons,
        failedModules,
        passedModules,
        incompleteModules,
        failureDetailsList
      };
    }

    // Rule B: All 7 Checks Pass
    if (passedModules.length === 7) {
      return {
        classification: 'GENUINE',
        headline: 'VERIFIED AGAINST ALL SEVEN CHECKS',
        statusBadge: 'VERIFIED',
        reasons: [
          'All seven forensic modules completed and verified against official institutional records.',
          'Cryptographic Ed25519 asymmetric signature confirmed with registered university public key.',
          'Exact SHA-256 canonical baseline confirmed byte-for-byte.',
          'QR authentication seal bound to canonical document identifier.',
          'Digital watermark carrier and carrier metadata verified.',
          'Semantic OCR text, key examination dates, and reference numbers match canonical filing.',
          'Structural image forensics confirmed margins, typography, and seal alignment.',
          'Official university validity confirmed (Active & in good standing; no revocation or replacement).'
        ],
        failedModules: [],
        passedModules,
        incompleteModules: [],
        failureDetailsList: []
      };
    }

    // Rule C: Incomplete Verification (No failure, but 1+ are SKIPPED or INCONCLUSIVE)
    // Never call such a document genuine!
    const reasons: string[] = [
      'Document authenticity cannot be established with complete cryptographic certainty.',
      ...incompleteModules.map(
        m => `• [${m.status}] ${m.moduleName || m.title}: ${m.explanation || m.details}`
      )
    ];

    if (passedModules.length > 0) {
      reasons.push(
        `Note: ${passedModules.length} of 7 checks passed, but full authenticity verification requires all seven modules to pass against trusted reference records.`
      );
    }

    return {
      classification: 'UNVERIFIED',
      headline: 'UNVERIFIED',
      statusBadge: 'UNVERIFIED',
      reasons,
      failedModules: [],
      passedModules,
      incompleteModules,
      failureDetailsList: []
    };
  }
}
