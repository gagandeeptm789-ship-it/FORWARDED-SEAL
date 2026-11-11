import { GoogleGenAI } from '@google/genai';
import { DocumentRecord, VerificationCheck, ModuleFailureDetails } from '../db/database.ts';
import { DecisionResult } from './strictDecisionEngine.ts';

export interface AiVerificationAnalysis {
  classification: 'GENUINE' | 'SUSPICIOUS' | 'UNVERIFIED' | 'IRRELEVANT' | 'ERROR';
  overallResult: string;
  whyResult: string[];
  documentDetails: {
    title?: string;
    organization?: string;
    referenceNumber?: string;
    issueDate?: string;
    eventDate?: string;
    category?: string;
  };
  verificationBreakdown: Array<{
    name: string;
    status: 'Passed' | 'Warning' | 'Failed' | 'Not Checked';
    description: string;
  }>;
  suspiciousFindings: Array<{
    title: string;
    location: string;
    reason: string;
    isConfirmed: boolean;
  }>;
  whatItMeans: string;
  recommendedNextStep: string;
  isIrrelevant: boolean;
  detectedDocType?: string;
  confidenceScore?: number;
}

export class AiExplanationEngine {
  private static geminiClient: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    if (!this.geminiClient && process.env.GEMINI_API_KEY) {
      try {
        this.geminiClient = new GoogleGenAI();
      } catch (err) {
        console.warn('[AI] Could not initialize GoogleGenAI client:', err);
      }
    }
    return this.geminiClient;
  }

  /**
   * Generates student-friendly, plain-language forensic explanations
   * conforming to the 7 required sections and strict decision classification.
   */
  public static async generateExplanation(args: {
    uploadedFilename: string;
    fileSize: number;
    mimeType: string;
    rawExtractedText: string;
    registeredDoc?: DocumentRecord;
    checks: {
      cryptographic: VerificationCheck;
      fileIntegrity: VerificationCheck;
      qrVerification: VerificationCheck;
      watermarkVerification: VerificationCheck;
      ocrComparison: VerificationCheck;
      imageForensics: VerificationCheck;
      revocationStatus: VerificationCheck;
    };
    detectedModifications: Array<{
      field: string;
      expected: string;
      found: string;
      severity: string;
    }>;
    decision: DecisionResult;
  }): Promise<AiVerificationAnalysis> {
    const {
      uploadedFilename,
      mimeType,
      rawExtractedText,
      registeredDoc,
      checks,
      detectedModifications,
      decision
    } = args;

    // Try Gemini-powered explanation if API key is present
    const client = this.getClient();
    if (client) {
      try {
        const aiResult = await this.callGeminiAnalysis({
          client,
          uploadedFilename,
          mimeType,
          rawExtractedText,
          registeredDoc,
          checks,
          detectedModifications,
          decision
        });
        if (aiResult) return aiResult;
      } catch (err) {
        console.warn('[AI] Gemini analysis call failed, falling back to deterministic engine:', err);
      }
    }

    // High-quality deterministic fallback
    return this.generateDeterministicAnalysis({
      uploadedFilename,
      mimeType,
      rawExtractedText,
      registeredDoc,
      checks,
      detectedModifications,
      decision
    });
  }

  /**
   * Identifies whether an upload is completely unrelated to official documents
   */
  public static checkIfIrrelevant(args: {
    mimeType: string;
    rawText: string;
    registeredDoc?: DocumentRecord;
    checks: any;
    uploadedFilename?: string;
  }): boolean {
    const { mimeType, rawText, registeredDoc, checks, uploadedFilename = '' } = args;

    // If it matches an existing registered document or has valid cryptographic signature or watermark, it's not irrelevant
    if (registeredDoc) return false;
    if (checks.fileIntegrity.status === 'PASS') return false;
    if (checks.cryptographic.status === 'PASS') return false;
    if (checks.qrVerification.status === 'PASS') return false;
    if (checks.watermarkVerification.status === 'PASS') return false;

    const lowerFilename = uploadedFilename.toLowerCase();
    const isExplicitIrrelevant =
      lowerFilename.includes('photo') ||
      lowerFilename.includes('selfie') ||
      lowerFilename.includes('wallpaper') ||
      lowerFilename.includes('avatar') ||
      lowerFilename.includes('meme') ||
      lowerFilename.includes('receipt') ||
      lowerFilename.includes('landscape') ||
      lowerFilename.includes('vacation') ||
      lowerFilename.includes('family') ||
      lowerFilename.includes('dog') ||
      lowerFilename.includes('cat') ||
      lowerFilename.includes('irrelevant');

    if (isExplicitIrrelevant) return true;

    // Evaluate text content if text was extracted
    const text = (rawText || '').toLowerCase().trim();
    if (text.length > 50) {
      const institutionalKeywords = [
        'university', 'college', 'school', 'institute', 'department',
        'circular', 'notification', 'notice', 'examination', 'semester',
        'registrar', 'controller', 'rector', 'principal', 'dean',
        'ref no', 'ref:', 'date:', 'office of', 'academic', 'schedule'
      ];

      const matchCount = institutionalKeywords.filter(k => text.includes(k)).length;
      if (matchCount === 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Gemini 3.8 Flash analysis caller
   */
  private static async callGeminiAnalysis(params: {
    client: GoogleGenAI;
    uploadedFilename: string;
    mimeType: string;
    rawExtractedText: string;
    registeredDoc?: DocumentRecord;
    checks: any;
    detectedModifications: any[];
    decision: DecisionResult;
  }): Promise<AiVerificationAnalysis | null> {
    const {
      client,
      uploadedFilename,
      rawExtractedText,
      registeredDoc,
      checks,
      detectedModifications,
      decision
    } = params;

    const prompt = `You are the lead AI Document Forensics Specialist for an institutional document verification platform called "The Forwarded Seal".
Your job is to analyze forensic checks and explain the results in clear, calm, transparent language that an ordinary student or parent can understand.

Uploaded File: "${uploadedFilename}"
Extracted Text Sample: "${rawExtractedText.substring(0, 800)}"
Is Registered in Database: ${registeredDoc ? 'YES' : 'NO'}
Registered Baseline Details: ${registeredDoc ? JSON.stringify({
      title: registeredDoc.title,
      referenceNumber: registeredDoc.referenceNumber,
      issueDate: registeredDoc.issueDate,
      department: registeredDoc.department,
      authority: registeredDoc.issuingAuthority,
      status: registeredDoc.status
    }) : 'None'}
Strict Backend Classification: ${decision.classification} (${decision.headline})
Failed Modules: ${JSON.stringify(decision.failedModules.map(m => m.moduleName || m.title))}
Passed Modules: ${JSON.stringify(decision.passedModules.map(m => m.moduleName || m.title))}
Incomplete Modules: ${JSON.stringify(decision.incompleteModules.map(m => m.moduleName || m.title))}

Automated Forensic Checks:
- Cryptographic Signature: ${checks.cryptographic.status} (${checks.cryptographic.details})
- SHA-256 Binary Integrity: ${checks.fileIntegrity.status} (${checks.fileIntegrity.details})
- QR Code Authentication: ${checks.qrVerification.status} (${checks.qrVerification.details})
- Invisible Watermark Carrier: ${checks.watermarkVerification.status} (${checks.watermarkVerification.details})
- OCR Text Comparison: ${checks.ocrComparison.status} (${checks.ocrComparison.details})
- Image Forensics: ${checks.imageForensics.status} (${checks.imageForensics.details})
- Institutional Revocation: ${checks.revocationStatus.status} (${checks.revocationStatus.details})
Detected Discrepancies: ${JSON.stringify(detectedModifications)}

IMPORTANT: You MUST strictly honor the Strict Backend Classification: "${decision.classification}".
If decision.classification is "SUSPICIOUS", you MUST output classification="SUSPICIOUS".
If decision.classification is "UNVERIFIED", you MUST output classification="UNVERIFIED".
If decision.classification is "GENUINE", you MUST output classification="GENUINE".
If decision.classification is "IRRELEVANT", you MUST output classification="IRRELEVANT".

OUTPUT FORMAT: Return strictly a valid JSON object matching this schema:
{
  "classification": "${decision.classification}",
  "overallResult": "${decision.headline}: One clear sentence explaining the result.",
  "whyResult": ["Clear bullet point 1", "Clear bullet point 2", "Clear bullet point 3"],
  "documentDetails": {
    "title": "Title if extracted, else omit",
    "organization": "Issuing organization if extracted, else omit",
    "referenceNumber": "Reference number if extracted, else omit",
    "issueDate": "Date if extracted, else omit",
    "eventDate": "Event or examination date if applicable",
    "category": "Academic / Examination / Administrative / General"
  },
  "verificationBreakdown": [
    { "name": "Ed25519 Cryptographic Signature", "status": "Passed" | "Warning" | "Failed" | "Not Checked", "description": "Plain description" },
    { "name": "SHA-256 Binary Integrity", "status": "Passed" | "Warning" | "Failed" | "Not Checked", "description": "Plain description" },
    { "name": "QR Code Authentication Seal", "status": "Passed" | "Warning" | "Failed" | "Not Checked", "description": "Plain description" },
    { "name": "Digital Watermark Carrier", "status": "Passed" | "Warning" | "Failed" | "Not Checked", "description": "Plain description" },
    { "name": "OCR Semantic Comparison", "status": "Passed" | "Warning" | "Failed" | "Not Checked", "description": "Plain description" },
    { "name": "Image Pixel Forensics", "status": "Passed" | "Warning" | "Failed" | "Not Checked", "description": "Plain description" },
    { "name": "Institutional Revocation Status", "status": "Passed" | "Warning" | "Failed" | "Not Checked", "description": "Plain description" }
  ],
  "suspiciousFindings": [
    { "title": "Brief title", "location": "Where it is located", "reason": "Why it was flagged", "isConfirmed": true/false }
  ],
  "whatItMeans": "Short explanation in everyday language.",
  "recommendedNextStep": "Specific practical guidance for the user.",
  "isIrrelevant": ${decision.classification === 'IRRELEVANT'},
  "detectedDocType": "e.g. Official Institutional Circular, Unregistered File, etc."
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      try {
        const parsed = JSON.parse(response.text);
        parsed.classification = decision.classification; // Enforce backend decision
        return parsed as AiVerificationAnalysis;
      } catch (e) {
        console.warn('[AI] Failed to parse Gemini JSON output', e);
      }
    }
    return null;
  }

  /**
   * Deterministic high-accuracy rule-based generator
   */
  private static generateDeterministicAnalysis(params: {
    uploadedFilename: string;
    mimeType: string;
    rawExtractedText: string;
    registeredDoc?: DocumentRecord;
    checks: any;
    detectedModifications: any[];
    decision: DecisionResult;
  }): AiVerificationAnalysis {
    const {
      uploadedFilename,
      mimeType,
      registeredDoc,
      checks,
      detectedModifications,
      decision
    } = params;

    const breakdownItems = [
      {
        name: 'Ed25519 Cryptographic Signature',
        status: this.mapStatus(checks.cryptographic.status),
        description: checks.cryptographic.details
      },
      {
        name: 'SHA-256 Binary Integrity',
        status: this.mapStatus(checks.fileIntegrity.status),
        description: checks.fileIntegrity.details
      },
      {
        name: 'QR Code Authentication Seal',
        status: this.mapStatus(checks.qrVerification.status),
        description: checks.qrVerification.details
      },
      {
        name: 'Digital Watermark Carrier',
        status: this.mapStatus(checks.watermarkVerification.status),
        description: checks.watermarkVerification.details
      },
      {
        name: 'OCR Semantic Comparison',
        status: this.mapStatus(checks.ocrComparison.status),
        description: checks.ocrComparison.details
      },
      {
        name: 'Image Pixel Forensics',
        status: this.mapStatus(checks.imageForensics.status),
        description: checks.imageForensics.details
      },
      {
        name: 'Institutional Revocation Status',
        status: this.mapStatus(checks.revocationStatus.status),
        description: checks.revocationStatus.details
      }
    ];

    // --- CASE E: ANALYSIS ERROR ---
    if (decision.classification === 'ERROR') {
      return {
        classification: 'ERROR',
        overallResult: 'ANALYSIS ERROR: The uploaded document could not be analyzed due to corrupted or invalid file data.',
        whyResult: decision.reasons,
        documentDetails: { category: 'Invalid Data' },
        verificationBreakdown: breakdownItems,
        suspiciousFindings: [],
        whatItMeans: 'The system encountered an error while attempting to process this file.',
        recommendedNextStep: 'Please upload a clean, uncorrupted PDF or PNG file.',
        isIrrelevant: false,
        detectedDocType: 'Corrupted File'
      };
    }

    // --- CASE D: IRRELEVANT DOCUMENT ---
    if (decision.classification === 'IRRELEVANT') {
      return {
        classification: 'IRRELEVANT',
        overallResult: 'IRRELEVANT DOCUMENT: This file is not recognized as an official institutional circular or academic notice.',
        whyResult: [
          'The uploaded file does not contain university headers, reference numbers, or circular formatting.',
          'No institutional document structure or verifiable security seals were detected in the image.',
          'Document verification checks require an official circular, certificate, or administrative order.'
        ],
        documentDetails: {
          category: 'Non-Document File'
        },
        verificationBreakdown: breakdownItems,
        suspiciousFindings: [],
        whatItMeans:
          'This upload is not marked as fake or tampered with. It simply is not a supported institutional circular or official notification.',
        recommendedNextStep:
          'Please upload an official university circular, examination schedule, administrative notice, or certificate.',
        isIrrelevant: true,
        detectedDocType: mimeType.startsWith('image/') ? 'Personal Photograph or Graphic' : 'Unrelated File'
      };
    }

    // --- CASE A: CONFIRMED FAILURE (SUSPICIOUS / NOT GENUINE) ---
    if (decision.classification === 'SUSPICIOUS') {
      const findings = decision.failureDetailsList.map(fail => ({
        title: `Failed: ${fail.moduleName}`,
        location: fail.moduleName,
        reason: `${fail.whySuspicious} (Detected: ${fail.detected})`,
        isConfirmed: true
      }));

      // Also append detected modifications
      detectedModifications.forEach(mod => {
        if (!findings.some(f => f.title.includes(mod.field))) {
          findings.push({
            title: `Altered ${mod.field}`,
            location: mod.field,
            reason: `Expected "${mod.expected}", but found "${mod.found}".`,
            isConfirmed: true
          });
        }
      });

      return {
        classification: 'SUSPICIOUS',
        overallResult: 'NOT GENUINE / SUSPICIOUS: Confirmed integrity or authenticity failure detected in one or more forensic modules.',
        whyResult: decision.reasons,
        documentDetails: {
          title: registeredDoc?.title || 'Notice with Discrepancies',
          organization: registeredDoc?.issuingAuthority || 'Grand Metropolitan University',
          referenceNumber: registeredDoc?.referenceNumber,
          issueDate: registeredDoc?.issueDate,
          eventDate: registeredDoc?.contentSummary?.keyDates?.[0],
          category: registeredDoc?.category || 'Examination / Academic'
        },
        verificationBreakdown: breakdownItems,
        suspiciousFindings: findings,
        whatItMeans:
          'This document failed confirmed forensic checks. It may have been circulating with unauthorized changes, or has been revoked by the institution. Do not act on dates or instructions without direct confirmation.',
        recommendedNextStep:
          'Contact the university issuing department or examine the official student portal before acting on any dates or instructions in this notice.',
        isIrrelevant: false,
        detectedDocType: 'Potentially Manipulated or Revoked Notice'
      };
    }

    // --- CASE C: INCOMPLETE VERIFICATION (UNVERIFIED) ---
    if (decision.classification === 'UNVERIFIED') {
      return {
        classification: 'UNVERIFIED',
        overallResult: 'UNVERIFIED: Authenticity could not be established with complete certainty because required reference information was incomplete.',
        whyResult: decision.reasons,
        documentDetails: {
          title: registeredDoc?.title || 'Unverified Upload',
          organization: registeredDoc?.issuingAuthority || 'Issuing Authority Unmatched',
          referenceNumber: registeredDoc?.referenceNumber,
          issueDate: registeredDoc?.issueDate,
          eventDate: registeredDoc?.contentSummary?.keyDates?.[0],
          category: registeredDoc?.category || 'Unclassified'
        },
        verificationBreakdown: breakdownItems,
        suspiciousFindings: [],
        whatItMeans:
          'This document has no confirmed tampering, but it could not be fully verified against trusted university records (e.g. unregistered ID, cropped watermark, or converted format).',
        recommendedNextStep:
          'Check that you uploaded the complete circular including all security banners and QR seals, or enter the Document ID manually.',
        isIrrelevant: false,
        detectedDocType: 'Unverified Document'
      };
    }

    // --- CASE B: ALL 7 CHECKS PASS (GENUINE) ---
    return {
      classification: 'GENUINE',
      overallResult: 'VERIFIED AGAINST ALL SEVEN CHECKS: All independent cryptographic, physical carrier, and semantic checks passed.',
      whyResult: decision.reasons,
      documentDetails: {
        title: registeredDoc?.title || 'Authenticated Institutional Circular',
        organization: registeredDoc?.issuingAuthority || 'Grand Metropolitan University',
        referenceNumber: registeredDoc?.referenceNumber,
        issueDate: registeredDoc?.issueDate,
        eventDate: registeredDoc?.contentSummary?.keyDates?.[0],
        category: registeredDoc?.category || 'Academic'
      },
      verificationBreakdown: breakdownItems,
      suspiciousFindings: [],
      whatItMeans:
        'This notice corresponds to an authentic circular published by the institution. Its contents have not been modified in transit.',
      recommendedNextStep:
        'You can safely follow the schedules and instructions outlined in this verified document.',
      isIrrelevant: false,
      detectedDocType: 'Official Institutional Circular'
    };
  }

  private static mapStatus(status: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'SKIPPED'): 'Passed' | 'Warning' | 'Failed' | 'Not Checked' {
    switch (status) {
      case 'PASS':
        return 'Passed';
      case 'FAIL':
        return 'Failed';
      case 'INCONCLUSIVE':
        return 'Warning';
      case 'SKIPPED':
      default:
        return 'Not Checked';
    }
  }
}
