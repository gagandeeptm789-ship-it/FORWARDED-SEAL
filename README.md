# THE FORWARDED SEAL
> **"Trust Every Document. Verify Every Forward."**

A complete, production-grade digital document authentication and forensic verification platform designed to solve the viral manipulation of official institutional circulars distributed across messaging platforms (WhatsApp, Telegram, email, social media).

---

## 1. Problem Solved
Official university circulars, exam notifications, and institutional announcements undergo multiple transformations:
- Severe lossy JPEG compression across messaging forwards
- Mobile screenshots and screen re-photographing
- Cropping and border omission
- Format shifts (PNG to JPEG / PDF to raster)

**Traditional file-hash verification (SHA-256 alone) fails completely** because even a 1-bit compression artifact alters the hash. Attackers exploit this blind spot to forge circulars by changing exam dates, altering fee notices, and transplanting genuine university seals onto fake documents.

**The Forwarded Seal provides a multi-layer defense**: combining Ed25519 asymmetric cryptographic signing, canonical SHA-256 digests, spatial & frequency spread-spectrum digital watermarking, signed QR authentication seals, deep semantic OCR text comparison, and localized structural pixel forensics.

---

## 2. Core Architecture

The platform comprises two separate portals powered by a unified full-stack engine:

### A. Institutional Issuer Portal (Authorized Access)
- Secure administrator authentication (bcrypt-hashed passwords, JWT sessions).
- Default Controller of Examinations credentials:
  - **Email**: `admin@gmu.edu`
  - **Password**: `Gmu@12345!`
- **Overview Dashboard**: Real-time persistent metrics from database (total circulars issued, verified count, tampering detected, unverified count).
- **Issue New Circular**: Full 12-step pipeline:
  1. Upload master PDF / PNG / JPG.
  2. Compute canonical SHA-256.
  3. Generate unique Document ID (`FS-GMU-2026-000001`).
  4. Digitally sign manifest using **Ed25519** asymmetric key pair.
  5. Generate high-density signed verification QR code.
  6. Embed visible security header banner and official seal.
  7. Embed robust invisible spread-spectrum frequency watermark.
  8. Store original master, protected copy, and manifest in atomic persistent storage.
- **Document Management**: Search, filter, view signed manifests, download master/protected copies, revoke circulars with reasons, or publish official superseding replacements.
- **Key Management**: Ed25519 key pair status, fingerprint verification, and one-click key rotation.
- **Audit Logs**: Chronological immutable tracking of all administrative actions.

### B. Public Verification Portal (Zero Registration Required)
- Open to students, parents, staff, and journalists.
- Multiple input methods:
  - File upload (PDF, PNG, JPG, screenshots).
  - Mobile camera capture.
  - Manual Document ID / Reference Number query.
  - **One-click Demonstration Fixture Loader** (instantly test authentic vs manipulated circulars).
- Evaluates 7 independent verification modules:
  - **Module A**: Ed25519 Asymmetric Signature Verification.
  - **Module B**: SHA-256 Binary Integrity Match.
  - **Module C**: QR Authentication Seal & Transplantation Detection.
  - **Module D**: Digital Watermark & Frequency Carrier Recovery.
  - **Module E**: Semantic OCR & Word-Level Discrepancy Highlighting.
  - **Module F**: Structural Image Forensics & Pixel Difference Heatmap.
  - **Module G**: Revocation & Institutional Validity Status.

---

## 3. The 3 Explicit Outcomes

1. **`AUTHENTIC DOCUMENT` (GENUINE)**: All signatures, manifests, and content align with canonical university records.
2. **`DOCUMENT INTEGRITY COMPROMISED` (MODIFIED / SUSPICIOUS)**: Spliced text, altered dates, transplanted QR codes, or revoked status detected.
3. **`AUTHENTICITY COULD NOT BE ESTABLISHED` (UNVERIFIED)**: Unregistered documents or severely degraded images where proof cannot be recovered.

---

## 4. Automated 12-Scenario Test Suite

The platform includes a built-in automated test runner executing the 12 required scenarios from Section 17:
- **TEST 1**: Issue document and verify original master (Expected: Genuine).
- **TEST 2**: Upload unchanged protected document (Expected: Genuine).
- **TEST 3**: Manipulate examination date (Expected: Modified / Tampered).
- **TEST 4**: Alter document body text (Expected: Modified / Tampered).
- **TEST 5**: Upload unregistered circular (Expected: Unverified).
- **TEST 6**: Upload WhatsApp-compressed JPEG (30% quality) (Expected: Genuine via multi-signal recovery).
- **TEST 7**: Upload mobile screenshot (Expected: Genuine / Honest Unverified).
- **TEST 8**: Upload cropped document (Expected: Handled with honest limitations report).
- **TEST 9**: QR transplantation attack (transplanting genuine QR onto altered document) (Expected: Modified - Never trust QR alone).
- **TEST 10**: Verify revoked circular (Expected: Revoked / Not valid).
- **TEST 11**: Unauthorized admin access attempt (Expected: 401 Unauthorized).
- **TEST 12**: Database persistence across restarts (Expected: All documents and credentials preserved).

---

## 5. Technology Stack & Security Standards
- **Backend**: Node.js, Express, TypeScript, Sharp (image forensics), PDF-Lib, jsQR, bcryptjs, jsonwebtoken, Node crypto (native Ed25519 & SHA-256).
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons, Motion.
- **Storage**: ACID atomic JSON/file database in `./data/` ensuring 100% persistence across restarts.
