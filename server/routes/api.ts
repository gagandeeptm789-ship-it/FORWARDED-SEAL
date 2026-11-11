import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.ts';
import { CryptoEngine } from '../services/cryptoEngine.ts';
import { WatermarkEngine } from '../services/watermarkEngine.ts';
import { VerificationEngine } from '../services/verificationEngine.ts';
import { TestRunner } from '../services/testRunner.ts';
import { DemoDataManager } from '../demo/seedDemoData.ts';
import { generateVerificationReportPdf } from '../services/pdfReportGenerator.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'forwarded-seal-jwt-secret-key-2026';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Middleware for Admin Authentication
export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    email: string;
    institutionId: string;
    role: string;
  };
}

function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

// ==========================================
// AUTHENTICATION APIS
// ==========================================

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const admin = db.getAdministratorByEmail(email);
  if (!admin || !admin.active) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isPasswordValid = bcrypt.compareSync(password, admin.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const institution = db.getInstitution(admin.institutionId);
  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      institutionId: admin.institutionId,
      role: admin.role
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  db.addAuditLog({
    eventType: 'ADMIN_LOGIN',
    actorEmail: admin.email,
    details: `Admin ${admin.fullName} logged in successfully`,
    ipAddress: req.ip
  });

  return res.json({
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      institution: institution ? { id: institution.id, name: institution.name } : null
    }
  });
});

router.post('/auth/logout', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  db.addAuditLog({
    eventType: 'ADMIN_LOGIN',
    actorEmail: req.admin?.email || 'admin',
    details: 'Administrator logged out',
    ipAddress: req.ip
  });
  return res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/auth/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const admin = db.getAdministratorById(req.admin!.id);
  if (!admin) {
    return res.status(404).json({ error: 'Admin user not found' });
  }
  const institution = db.getInstitution(admin.institutionId);
  return res.json({
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      institution: institution ? { id: institution.id, name: institution.name } : null
    }
  });
});

// ==========================================
// ADMIN DASHBOARD & ISSUING APIS
// ==========================================

router.get('/admin/dashboard', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const documents = db.getDocuments();
  const verifications = db.getVerificationRecords();

  const totalIssued = documents.length;
  const verifiedCount = verifications.filter(v => v.finalClassification === 'GENUINE').length;
  const modifiedCount = verifications.filter(v => v.finalClassification === 'MODIFIED').length;
  const irrelevantCount = verifications.filter(v => v.finalClassification === 'IRRELEVANT').length;
  const unverifiedCount = verifications.filter(v => v.finalClassification === 'UNVERIFIED').length;

  const recentDocuments = documents.slice(0, 5);
  const recentVerifications = verifications.slice(0, 5);

  return res.json({
    stats: {
      totalIssued,
      verifiedCount,
      modifiedCount,
      irrelevantCount,
      unverifiedCount,
      totalVerifications: verifications.length
    },
    recentDocuments,
    recentVerifications
  });
});

router.get('/admin/documents', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { search, department, category, status } = req.query;
  let docs = db.getDocuments();

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    docs = docs.filter(
      d =>
        d.title.toLowerCase().includes(q) ||
        d.referenceNumber.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
    );
  }

  if (department && typeof department === 'string' && department !== 'ALL') {
    docs = docs.filter(d => d.department.toLowerCase() === department.toLowerCase());
  }

  if (category && typeof category === 'string' && category !== 'ALL') {
    docs = docs.filter(d => d.category.toLowerCase() === category.toLowerCase());
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    docs = docs.filter(d => d.status === status);
  }

  return res.json({ documents: docs });
});

router.get('/admin/documents/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const manifest = db.getSignedManifest(doc.id);
  const versions = db.getDocumentVersions(doc.id);
  const signingKey = db.getSigningKeys(doc.institutionId).find(k => k.id === manifest?.signingKeyId);

  return res.json({
    document: doc,
    manifest,
    versions,
    signingKeyInfo: signingKey
      ? {
          id: signingKey.id,
          algorithm: signingKey.algorithm,
          fingerprint: signingKey.fingerprint,
          publicKeyPem: signingKey.publicKeyPem,
          status: signingKey.status
        }
      : null
  });
});

// STEP 1-12 COMPLETE DOCUMENT ISSUING WORKFLOW
router.post(
  '/admin/documents/issue',
  requireAdminAuth,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Document file (PDF, PNG, or JPG) is required' });
      }

      const {
        title,
        referenceNumber,
        department,
        category,
        issueDate,
        expiryDate,
        description,
        issuingAuthority
      } = req.body;

      if (!title || !referenceNumber || !department || !issueDate || !issuingAuthority) {
        return res.status(400).json({ error: 'Missing required metadata fields' });
      }

      // Check if reference number already exists
      const existingRef = db.getDocuments().find(d => d.referenceNumber === referenceNumber);
      if (existingRef) {
        return res.status(409).json({ error: `Reference number ${referenceNumber} already exists in registry` });
      }

      const inst = db.getInstitution(req.admin!.institutionId) || db.getInstitutions()[0];
      const activeKey = db.getActiveSigningKey(inst.id);
      if (!activeKey) {
        return res.status(500).json({ error: 'No active Ed25519 signing key found for institution' });
      }

      const uploadsDir = db.getUploadsDir();

      // Step 4: Unique Document Identifier
      const docId = db.generateNextDocumentId(inst.shortCode);

      // Step 5: Original SHA-256
      const originalSha256 = CryptoEngine.calculateSha256(file.buffer);

      // Step 6: Create Signed Authentication Manifest
      const signingTimestamp = new Date().toISOString();
      const manifestPayload = {
        documentId: docId,
        title,
        institutionId: inst.id,
        referenceNumber,
        issueDate,
        originalSha256,
        version: 1,
        issuingAuthority,
        signingTimestamp
      };

      // Step 7: Digitally sign manifest using Ed25519
      const signature = CryptoEngine.signManifest(manifestPayload, activeKey.privateKeyPem);

      // Step 8-10: Apply visible & invisible watermark and generate QR
      const isPdf = file.mimetype === 'application/pdf';
      let protectedBuffer: Buffer;
      let qrBuffer: Buffer;

      const watermarkPayload = {
        documentId: docId,
        referenceNumber,
        institutionName: inst.name,
        originalSha256,
        verificationUrl: `/verify?id=${docId}`
      };

      if (isPdf) {
        const protectedResult = await WatermarkEngine.protectPdfDocument(
          file.buffer,
          watermarkPayload,
          issueDate
        );
        protectedBuffer = protectedResult.protectedBuffer;
        qrBuffer = protectedResult.qrBuffer;
      } else {
        const protectedResult = await WatermarkEngine.protectImageDocument(
          file.buffer,
          watermarkPayload,
          issueDate
        );
        protectedBuffer = protectedResult.protectedBuffer;
        qrBuffer = protectedResult.qrBuffer;
      }

      const protectedSha256 = CryptoEngine.calculateSha256(protectedBuffer);

      // Save files to disk (Step 11)
      const ext = isPdf ? '.pdf' : '.png';
      const origFilename = `orig_${docId}_${Date.now()}${ext}`;
      const protFilename = `protected_${docId}_${Date.now()}${ext}`;
      const qrFilename = `qr_${docId}_${Date.now()}.png`;

      const origPath = path.resolve(uploadsDir, origFilename);
      const protPath = path.resolve(uploadsDir, protFilename);
      const qrPath = path.resolve(uploadsDir, qrFilename);

      fs.writeFileSync(origPath, file.buffer);
      fs.writeFileSync(protPath, protectedBuffer);
      fs.writeFileSync(qrPath, qrBuffer);

      // Save Signed Manifest to DB
      db.addSignedManifest({
        documentId: docId,
        manifestPayload,
        signature,
        algorithm: 'Ed25519',
        publicKeyPem: activeKey.publicKeyPem,
        signingKeyId: activeKey.id,
        created_at: signingTimestamp
      });

      // Extract plain content summary
      const textSample = file.buffer.toString('utf-8', 0, 100000);
      const dates = textSample.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi) || [];

      // Save Document Record
      const newDoc = {
        id: docId,
        institutionId: inst.id,
        title,
        referenceNumber,
        department,
        category: category || 'General',
        issueDate,
        expiryDate: expiryDate || undefined,
        description: description || '',
        issuingAuthority,
        originalFilename: file.originalname,
        originalFilePath: origPath,
        protectedFilePath: protPath,
        qrCodeFilePath: qrPath,
        originalSha256,
        protectedSha256,
        status: 'active' as const,
        version: 1,
        created_at: signingTimestamp,
        contentSummary: {
          ocrText: textSample,
          keyDates: Array.from(new Set(dates)),
          importantKeywords: [title, referenceNumber, department, issuingAuthority]
        }
      };

      db.addDocument(newDoc);

      // Version record
      db.addDocumentVersion({
        id: `ver-${docId}-1`,
        documentId: docId,
        versionNumber: 1,
        title,
        referenceNumber,
        sha256: protectedSha256,
        protectedFilePath: protPath,
        changeNotes: 'Initial authenticated publication',
        created_at: signingTimestamp
      });

      // Audit Log
      db.addAuditLog({
        eventType: 'DOCUMENT_ISSUED',
        actorEmail: req.admin!.email,
        details: `Issued circular ${docId} (Ref: ${referenceNumber}) - Ed25519 signed with ${activeKey.id}`
      });

      // Step 12: Success Response
      return res.status(201).json({
        success: true,
        document: newDoc,
        manifest: {
          documentId: docId,
          signature,
          algorithm: 'Ed25519',
          signingKeyId: activeKey.id
        },
        downloadLinks: {
          originalUrl: `/api/verify/download-doc/${docId}?type=original`,
          protectedUrl: `/api/verify/download-doc/${docId}?type=protected`,
          qrCodeUrl: `/api/verify/download-doc/${docId}?type=qr`,
          verificationUrl: `/verify?id=${docId}`
        }
      });
    } catch (err) {
      console.error('[Issue] Error in document issuing workflow:', err);
      return res.status(500).json({ error: `Issuing failed: ${(err as Error).message}` });
    }
  }
);

// Revoke a document
router.post('/admin/documents/:id/revoke', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { reason } = req.body;
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const updated = db.updateDocument(doc.id, {
    status: 'revoked',
    revocationReason: reason || 'Officially revoked by issuing institution',
    revokedAt: new Date().toISOString()
  });

  db.addAuditLog({
    eventType: 'DOCUMENT_REVOKED',
    actorEmail: req.admin!.email,
    details: `Revoked circular ${doc.id} (Ref: ${doc.referenceNumber}). Reason: ${reason || 'N/A'}`
  });

  return res.json({ success: true, document: updated });
});

// Replace / Publish replacement version
router.post(
  '/admin/documents/:id/replace',
  requireAdminAuth,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const prevDoc = db.getDocument(req.params.id);
      if (!prevDoc) {
        return res.status(404).json({ error: 'Target document not found' });
      }

      const file = req.file;
      const { title, referenceNumber, changeNotes, issuingAuthority } = req.body;

      const inst = db.getInstitution(req.admin!.institutionId) || db.getInstitutions()[0];
      const activeKey = db.getActiveSigningKey(inst.id);
      if (!activeKey) {
        return res.status(500).json({ error: 'No active signing key' });
      }

      const docId = db.generateNextDocumentId(inst.shortCode);
      const isPdf = file ? file.mimetype === 'application/pdf' : false;
      const buffer = file ? file.buffer : fs.readFileSync(prevDoc.originalFilePath);
      const originalSha256 = CryptoEngine.calculateSha256(buffer);
      const issueDate = new Date().toISOString().split('T')[0];
      const signingTimestamp = new Date().toISOString();

      const manifestPayload = {
        documentId: docId,
        title: title || prevDoc.title,
        institutionId: inst.id,
        referenceNumber: referenceNumber || `${prevDoc.referenceNumber}-REV`,
        issueDate,
        originalSha256,
        version: prevDoc.version + 1,
        issuingAuthority: issuingAuthority || prevDoc.issuingAuthority,
        signingTimestamp
      };

      const signature = CryptoEngine.signManifest(manifestPayload, activeKey.privateKeyPem);

      // Protection
      const protection = isPdf
        ? await WatermarkEngine.protectPdfDocument(buffer, {
            documentId: docId,
            referenceNumber: manifestPayload.referenceNumber,
            institutionName: inst.name,
            originalSha256,
            verificationUrl: `/verify?id=${docId}`
          }, issueDate)
        : await WatermarkEngine.protectImageDocument(buffer, {
            documentId: docId,
            referenceNumber: manifestPayload.referenceNumber,
            institutionName: inst.name,
            originalSha256,
            verificationUrl: `/verify?id=${docId}`
          }, issueDate);

      const uploadsDir = db.getUploadsDir();
      const ext = isPdf ? '.pdf' : '.png';
      const origPath = path.resolve(uploadsDir, `orig_${docId}_${Date.now()}${ext}`);
      const protPath = path.resolve(uploadsDir, `protected_${docId}_${Date.now()}${ext}`);
      const qrPath = path.resolve(uploadsDir, `qr_${docId}_${Date.now()}.png`);

      fs.writeFileSync(origPath, buffer);
      fs.writeFileSync(protPath, protection.protectedBuffer);
      fs.writeFileSync(qrPath, protection.qrBuffer);

      // Mark old doc as superseded
      db.updateDocument(prevDoc.id, {
        status: 'superseded',
        replacedByDocId: docId
      });

      // Add new replacement doc
      const newDoc: any = {
        ...prevDoc,
        id: docId,
        title: title || prevDoc.title,
        referenceNumber: referenceNumber || `${prevDoc.referenceNumber}-REV`,
        version: prevDoc.version + 1,
        status: 'active',
        replacementOfDocId: prevDoc.id,
        issueDate,
        originalFilePath: origPath,
        protectedFilePath: protPath,
        qrCodeFilePath: qrPath,
        originalSha256,
        protectedSha256: CryptoEngine.calculateSha256(protection.protectedBuffer),
        created_at: signingTimestamp
      };

      db.addDocument(newDoc);

      db.addSignedManifest({
        documentId: docId,
        manifestPayload,
        signature,
        algorithm: 'Ed25519',
        publicKeyPem: activeKey.publicKeyPem,
        signingKeyId: activeKey.id,
        created_at: signingTimestamp
      });

      db.addDocumentVersion({
        id: `ver-${docId}-${newDoc.version}`,
        documentId: docId,
        versionNumber: newDoc.version,
        title: newDoc.title,
        referenceNumber: newDoc.referenceNumber,
        sha256: newDoc.protectedSha256,
        protectedFilePath: protPath,
        changeNotes: changeNotes || `Supercedes ${prevDoc.id}`,
        created_at: signingTimestamp
      });

      db.addAuditLog({
        eventType: 'DOCUMENT_REPLACED',
        actorEmail: req.admin!.email,
        details: `Published replacement ${docId} (v${newDoc.version}) for superseded circular ${prevDoc.id}`
      });

      return res.json({ success: true, document: newDoc });
    } catch (err) {
      return res.status(500).json({ error: `Replacement failed: ${(err as Error).message}` });
    }
  }
);

// ==========================================
// PUBLIC VERIFICATION APIS (NO AUTH REQUIRED)
// ==========================================

router.post('/verify/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No document file provided for verification' });
    }

    const { manualDocId } = req.body;

    const record = await VerificationEngine.verifyDocument({
      buffer: file.buffer,
      originalFilename: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      manualDocId: manualDocId ? String(manualDocId).trim() : undefined,
      ipAddress: req.ip
    });

    const registeredDoc = record.documentId ? db.getDocument(record.documentId) : undefined;
    const manifest = record.documentId ? db.getSignedManifest(record.documentId) : undefined;

    return res.json({
      verification: record,
      registeredDocument: registeredDoc
        ? {
            id: registeredDoc.id,
            title: registeredDoc.title,
            referenceNumber: registeredDoc.referenceNumber,
            department: registeredDoc.department,
            issueDate: registeredDoc.issueDate,
            issuingAuthority: registeredDoc.issuingAuthority,
            status: registeredDoc.status,
            originalSha256: registeredDoc.originalSha256
          }
        : null,
      manifest: manifest
        ? {
            documentId: manifest.documentId,
            algorithm: manifest.algorithm,
            signingTimestamp: manifest.manifestPayload.signingTimestamp,
            signingKeyId: manifest.signingKeyId
          }
        : null
    });
  } catch (err) {
    console.error('[Verify] Upload verification error:', err);
    return res.status(500).json({ error: `Verification failed: ${(err as Error).message}` });
  }
});

router.post('/verify/id', async (req: Request, res: Response) => {
  const { documentId } = req.body;
  if (!documentId) {
    return res.status(400).json({ error: 'Document ID or Reference Number is required' });
  }

  const doc = db.getDocument(documentId.trim());
  if (!doc) {
    return res.status(404).json({
      found: false,
      message: `Document identifier "${documentId}" is not registered in the institutional ledger.`
    });
  }

  const manifest = db.getSignedManifest(doc.id);
  const isValidSig = manifest
    ? CryptoEngine.verifyManifestSignature(
        manifest.manifestPayload,
        manifest.signature,
        manifest.publicKeyPem
      )
    : false;

  return res.json({
    found: true,
    document: {
      id: doc.id,
      title: doc.title,
      referenceNumber: doc.referenceNumber,
      department: doc.department,
      category: doc.category,
      issueDate: doc.issueDate,
      issuingAuthority: doc.issuingAuthority,
      status: doc.status,
      originalSha256: doc.originalSha256,
      protectedSha256: doc.protectedSha256,
      created_at: doc.created_at
    },
    cryptographicProof: {
      algorithm: manifest?.algorithm || 'Ed25519',
      signingKeyId: manifest?.signingKeyId,
      signatureVerified: isValidSig,
      signedTimestamp: manifest?.manifestPayload.signingTimestamp
    }
  });
});

router.get('/verify/:id', (req: Request, res: Response) => {
  const record = db.getVerificationRecord(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Verification report not found' });
  }
  const registeredDoc = record.documentId ? db.getDocument(record.documentId) : undefined;
  return res.json({ verification: record, registeredDocument: registeredDoc });
});

// Download verification diff image
router.get('/verify/diff-image/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  const uploadsDir = db.getUploadsDir();
  const filePath = path.resolve(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  return res.status(404).send('Not found');
});

// Download issued document
router.get('/verify/download-doc/:id', (req: Request, res: Response) => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).send('Document not found');
  }

  const type = req.query.type as string;
  let filePath = doc.protectedFilePath;
  let filename = `${doc.id}_protected`;

  if (type === 'original') {
    filePath = doc.originalFilePath;
    filename = `${doc.id}_original`;
  } else if (type === 'qr' && doc.qrCodeFilePath) {
    filePath = doc.qrCodeFilePath;
    filename = `${doc.id}_qr.png`;
  }

  if (fs.existsSync(filePath)) {
    return res.download(filePath, filename);
  }
  return res.status(404).send('File asset not found on server');
});

// Download verification report as PDF
router.get('/verify/report-pdf/:id', async (req: Request, res: Response) => {
  try {
    const report = db.getVerificationRecord(req.params.id);
    if (!report) {
      return res.status(404).send('Verification report not found');
    }

    const registeredDoc = report.documentId ? db.getDocument(report.documentId) : null;
    const pdfBytes = await generateVerificationReportPdf(report, registeredDoc);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Verification-Report-${report.id}.pdf"`);
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

// ==========================================
// INSTITUTION & SETTINGS APIS
// ==========================================

router.get('/institution/profile', (req: Request, res: Response) => {
  const inst = db.getInstitutions()[0];
  const keys = db.getSigningKeys(inst.id);
  const activeKey = keys.find(k => k.status === 'active');

  return res.json({
    institution: {
      id: inst.id,
      name: inst.name,
      shortCode: inst.shortCode,
      emailDomain: inst.emailDomain,
      logoUrl: inst.logoUrl,
      contactEmail: inst.contactEmail,
      status: inst.status,
      created_at: inst.created_at
    },
    signingKey: activeKey
      ? {
          id: activeKey.id,
          algorithm: activeKey.algorithm,
          fingerprint: activeKey.fingerprint,
          publicKeyPem: activeKey.publicKeyPem,
          status: activeKey.status,
          created_at: activeKey.created_at
        }
      : null,
    totalRotatedKeys: keys.filter(k => k.status === 'rotated').length
  });
});

router.put('/institution/profile', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, shortCode, emailDomain, contactEmail } = req.body;
  const inst = db.getInstitutions()[0];
  const updated = db.updateInstitution(inst.id, {
    name: name || inst.name,
    shortCode: shortCode || inst.shortCode,
    emailDomain: emailDomain || inst.emailDomain,
    contactEmail: contactEmail || inst.contactEmail
  });

  db.addAuditLog({
    eventType: 'SETTINGS_UPDATED',
    actorEmail: req.admin!.email,
    details: 'Updated institutional profile settings'
  });

  return res.json({ success: true, institution: updated });
});

router.post('/institution/rotate-key', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const inst = db.getInstitutions()[0];
  const newKey = db.rotateSigningKey(inst.id);

  db.addAuditLog({
    eventType: 'KEY_ROTATED',
    actorEmail: req.admin!.email,
    details: `Rotated Ed25519 signing key. New active key: ${newKey.id} (Fingerprint: ${newKey.fingerprint})`
  });

  return res.json({
    success: true,
    newKey: {
      id: newKey.id,
      algorithm: newKey.algorithm,
      fingerprint: newKey.fingerprint,
      publicKeyPem: newKey.publicKeyPem,
      status: newKey.status,
      created_at: newKey.created_at
    }
  });
});

// ==========================================
// AUDIT LOGS
// ==========================================

router.get('/admin/audit-logs', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAuditLogs();
  return res.json({ auditLogs: logs });
});

// ==========================================
// DEMO FIXTURES & TEST RUNNER APIS
// ==========================================

router.get('/demo/files', async (req: Request, res: Response) => {
  await DemoDataManager.initDemoData();
  const files = DemoDataManager.getDemoFiles();
  return res.json({ demoFiles: files });
});

router.get('/demo/file/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  const uploadsDir = db.getUploadsDir();
  const filePath = path.resolve(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  return res.status(404).send('Demo file not found');
});

// Test Suite Runner API
router.post('/test/run-all', async (req: Request, res: Response) => {
  try {
    const summary = await TestRunner.runAllTests();
    return res.json(summary);
  } catch (err) {
    return res.status(500).json({ error: `Test suite execution failed: ${(err as Error).message}` });
  }
});

export default router;
