export interface Institution {
  id: string;
  name: string;
  shortCode: string;
  emailDomain: string;
  logoUrl?: string;
  contactEmail: string;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface Administrator {
  id: string;
  institutionId: string;
  email: string;
  fullName: string;
  role: string;
  institution?: {
    id: string;
    name: string;
  };
}

export interface DocumentRecord {
  id: string;
  institutionId: string;
  title: string;
  referenceNumber: string;
  department: string;
  category: 'Examination' | 'Academic' | 'Administrative' | 'Financial' | 'General';
  issueDate: string;
  expiryDate?: string;
  description: string;
  issuingAuthority: string;
  originalFilename: string;
  originalFilePath: string;
  protectedFilePath: string;
  qrCodeFilePath?: string;
  originalSha256: string;
  protectedSha256: string;
  status: 'active' | 'revoked' | 'superseded';
  version: number;
  replacedByDocId?: string;
  replacementOfDocId?: string;
  revocationReason?: string;
  revokedAt?: string;
  created_at: string;
  contentSummary: {
    ocrText: string;
    keyDates?: string[];
    importantKeywords?: string[];
  };
}

export interface SignedManifest {
  documentId: string;
  manifestPayload: {
    documentId: string;
    title: string;
    institutionId: string;
    referenceNumber: string;
    issueDate: string;
    originalSha256: string;
    version: number;
    issuingAuthority: string;
    signingTimestamp: string;
  };
  signature: string;
  algorithm: 'Ed25519';
  publicKeyPem: string;
  signingKeyId: string;
  created_at: string;
}

export interface ModuleFailureDetails {
  moduleName: string;
  expected: string;
  detected: string;
  whySuspicious: string;
  evidence?: any;
  recommendedAction: string;
}

export interface VerificationCheck {
  moduleName?: string;
  title: string;
  status: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'SKIPPED';
  details: string;
  explanation?: string;
  reason?: string;
  evidence?: any;
  performed?: boolean;
  failureDetails?: ModuleFailureDetails;
}

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

export interface VerificationRecord {
  id: string;
  documentId?: string;
  uploadedFilename: string;
  uploadedFileSize: number;
  uploadedFilePath: string;
  finalClassification: 'GENUINE' | 'MODIFIED' | 'SUSPICIOUS' | 'UNVERIFIED' | 'IRRELEVANT' | 'ERROR';
  aiExplanation?: AiVerificationAnalysis;
  headline: string;
  reasons: string[];
  failureDetailsList?: ModuleFailureDetails[];
  checkResults: {
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
    severity: 'critical' | 'warning' | 'info';
  }>;
  textDiff?: Array<{
    type: 'same' | 'added' | 'removed';
    value: string;
  }>;
  forensicDiffImagePath?: string;
  verifiedAt: string;
  ipAddress?: string;
}

export interface AuditLog {
  id: string;
  eventType: string;
  actorEmail: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface DemoFileItem {
  id: string;
  name: string;
  docId?: string;
  category: string;
  expectedResult: 'GENUINE' | 'MODIFIED' | 'UNVERIFIED';
  description: string;
  filePath: string;
  downloadUrl: string;
}

export interface TestResultItem {
  id: string;
  name: string;
  scenario: string;
  expectedOutcome: string;
  actualOutcome: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  executionTimestamp: string;
  results: TestResultItem[];
}
