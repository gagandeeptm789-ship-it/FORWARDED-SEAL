import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

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
  passwordHash: string;
  fullName: string;
  role: 'superadmin' | 'registrar' | 'controller';
  active: boolean;
  created_at: string;
}

export interface SigningKey {
  id: string;
  institutionId: string;
  algorithm: 'Ed25519';
  publicKeyPem: string;
  privateKeyPem: string;
  fingerprint: string;
  status: 'active' | 'rotated';
  created_at: string;
}

export interface DocumentRecord {
  id: string; // e.g. FS-GMU-2026-000001
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

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  title: string;
  referenceNumber: string;
  sha256: string;
  protectedFilePath: string;
  changeNotes: string;
  created_at: string;
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
  signature: string; // Base64 Ed25519 signature
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

export interface VerificationRecord {
  id: string;
  documentId?: string;
  uploadedFilename: string;
  uploadedFileSize: number;
  uploadedFilePath: string;
  finalClassification: 'GENUINE' | 'MODIFIED' | 'SUSPICIOUS' | 'UNVERIFIED' | 'IRRELEVANT' | 'ERROR';
  aiExplanation?: any;
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
  eventType:
    | 'DOCUMENT_ISSUED'
    | 'DOCUMENT_REVOKED'
    | 'DOCUMENT_REPLACED'
    | 'ADMIN_LOGIN'
    | 'KEY_ROTATED'
    | 'SETTINGS_UPDATED'
    | 'VERIFICATION_EXECUTED'
    | 'TEST_SUITE_EXECUTED';
  actorEmail: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

interface DatabaseSchema {
  institutions: Institution[];
  administrators: Administrator[];
  signing_keys: SigningKey[];
  documents: DocumentRecord[];
  document_versions: DocumentVersion[];
  signed_manifests: SignedManifest[];
  verification_records: VerificationRecord[];
  audit_logs: AuditLog[];
}

class Database {
  private data: DatabaseSchema = {
    institutions: [],
    administrators: [],
    signing_keys: [],
    documents: [],
    document_versions: [],
    signed_manifests: [],
    verification_records: [],
    audit_logs: []
  };

  constructor() {
    this.initDirs();
    this.load();
    this.seedDefaultData();
  }

  private initDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[DB] Error loading database file, initializing clean state', err);
      this.save();
    }
  }

  private save() {
    try {
      // Atomic write using temp file
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Error saving database file', err);
    }
  }

  public getUploadsDir() {
    return UPLOADS_DIR;
  }

  public getDataDir() {
    return DATA_DIR;
  }

  // --- Seeding default institution, keys, admin & test documents ---
  private seedDefaultData() {
    let modified = false;

    // 1. Institution
    if (this.data.institutions.length === 0) {
      this.data.institutions.push({
        id: 'inst-gmu-001',
        name: 'Grand Metropolitan University',
        shortCode: 'GMU',
        emailDomain: 'gmu.edu',
        logoUrl: '/assets/gmu-seal.svg',
        contactEmail: 'registrar@gmu.edu',
        status: 'active',
        created_at: new Date('2026-01-01T00:00:00Z').toISOString()
      });
      modified = true;
    }

    const institution = this.data.institutions[0];

    // 2. Signing Key (Ed25519)
    if (this.data.signing_keys.length === 0) {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
      const pubPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
      const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
      const fingerprint = crypto.createHash('sha256').update(pubPem).digest('hex').substring(0, 16);

      this.data.signing_keys.push({
        id: 'key-gmu-ed25519-01',
        institutionId: institution.id,
        algorithm: 'Ed25519',
        publicKeyPem: pubPem,
        privateKeyPem: privPem,
        fingerprint,
        status: 'active',
        created_at: new Date().toISOString()
      });
      modified = true;
    }

    // 3. Default Admin Account (admin@gmu.edu / Gmu@12345!)
    const adminExists = this.data.administrators.find(a => a.email === 'admin@gmu.edu');
    if (!adminExists) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync('Gmu@12345!', salt);
      this.data.administrators.push({
        id: 'admin-001',
        institutionId: institution.id,
        email: 'admin@gmu.edu',
        passwordHash,
        fullName: 'Dr. Arthur Vance (Registrar & Controller)',
        role: 'superadmin',
        active: true,
        created_at: new Date().toISOString()
      });
      modified = true;
    }

    if (modified) {
      this.save();
    }
  }

  // --- CRUD Getters ---
  public getInstitutions() { return this.data.institutions; }
  public getInstitution(id: string) { return this.data.institutions.find(i => i.id === id); }
  public updateInstitution(id: string, updates: Partial<Institution>) {
    const idx = this.data.institutions.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.data.institutions[idx] = { ...this.data.institutions[idx], ...updates };
      this.save();
      return this.data.institutions[idx];
    }
    return null;
  }

  public getAdministrators() { return this.data.administrators; }
  public getAdministratorByEmail(email: string) {
    return this.data.administrators.find(a => a.email.toLowerCase() === email.toLowerCase());
  }
  public getAdministratorById(id: string) {
    return this.data.administrators.find(a => a.id === id);
  }

  public getSigningKeys(institutionId: string) {
    return this.data.signing_keys.filter(k => k.institutionId === institutionId);
  }
  public getActiveSigningKey(institutionId: string) {
    return this.data.signing_keys.find(k => k.institutionId === institutionId && k.status === 'active');
  }
  public addSigningKey(key: SigningKey) {
    this.data.signing_keys.push(key);
    this.save();
  }
  public rotateSigningKey(institutionId: string) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    const pubPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
    const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    const fingerprint = crypto.createHash('sha256').update(pubPem).digest('hex').substring(0, 16);

    // Set old keys to rotated
    this.data.signing_keys.forEach(k => {
      if (k.institutionId === institutionId) k.status = 'rotated';
    });

    const newKey: SigningKey = {
      id: `key-gmu-${Date.now()}`,
      institutionId,
      algorithm: 'Ed25519',
      publicKeyPem: pubPem,
      privateKeyPem: privPem,
      fingerprint,
      status: 'active',
      created_at: new Date().toISOString()
    };
    this.data.signing_keys.push(newKey);
    this.save();
    return newKey;
  }

  public getDocuments() { return this.data.documents; }
  public getDocument(id: string) {
    return this.data.documents.find(d => d.id === id || d.referenceNumber === id);
  }
  public addDocument(doc: DocumentRecord) {
    this.data.documents.unshift(doc);
    this.save();
  }
  public updateDocument(id: string, updates: Partial<DocumentRecord>) {
    const idx = this.data.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.data.documents[idx] = { ...this.data.documents[idx], ...updates };
      this.save();
      return this.data.documents[idx];
    }
    return null;
  }
  public deleteDocument(id: string) {
    this.data.documents = this.data.documents.filter(d => d.id !== id);
    this.data.signed_manifests = this.data.signed_manifests.filter(m => m.documentId !== id);
    this.save();
  }

  public addDocumentVersion(version: DocumentVersion) {
    this.data.document_versions.push(version);
    this.save();
  }
  public getDocumentVersions(docId: string) {
    return this.data.document_versions.filter(v => v.documentId === docId);
  }

  public getSignedManifest(documentId: string) {
    return this.data.signed_manifests.find(m => m.documentId === documentId);
  }
  public addSignedManifest(manifest: SignedManifest) {
    this.data.signed_manifests.push(manifest);
    this.save();
  }

  public getVerificationRecords() { return this.data.verification_records; }
  public getVerificationRecord(id: string) {
    return this.data.verification_records.find(v => v.id === id);
  }
  public addVerificationRecord(record: VerificationRecord) {
    this.data.verification_records.unshift(record);
    this.save();
  }

  public getAuditLogs() { return this.data.audit_logs; }
  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    this.data.audit_logs.unshift(newLog);
    this.save();
    return newLog;
  }

  public generateNextDocumentId(institutionCode = 'GMU'): string {
    const year = new Date().getFullYear();
    const prefix = `FS-${institutionCode}-${year}-`;
    const matchingDocs = this.data.documents.filter(d => d.id.startsWith(prefix));
    const nextNum = (matchingDocs.length + 1).toString().padStart(6, '0');
    return `${prefix}${nextNum}`;
  }
}

export const db = new Database();
