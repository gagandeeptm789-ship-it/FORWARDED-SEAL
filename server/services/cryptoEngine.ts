import crypto from 'crypto';

export interface ManifestData {
  documentId: string;
  title: string;
  institutionId: string;
  referenceNumber: string;
  issueDate: string;
  originalSha256: string;
  version: number;
  issuingAuthority: string;
  signingTimestamp: string;
}

export class CryptoEngine {
  /**
   * Computes SHA-256 hash of a Buffer or string.
   */
  public static calculateSha256(buffer: Buffer | string): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Deterministic canonical serialization of a manifest object.
   */
  public static canonicalizeManifest(manifest: ManifestData): string {
    const keys = Object.keys(manifest).sort() as (keyof ManifestData)[];
    const sortedObj: Record<string, any> = {};
    for (const key of keys) {
      sortedObj[key] = manifest[key];
    }
    return JSON.stringify(sortedObj);
  }

  /**
   * Digitally signs canonical manifest data using an Ed25519 private key.
   * Returns base64 signature.
   */
  public static signManifest(manifest: ManifestData, privateKeyPem: string): string {
    const canonical = this.canonicalizeManifest(manifest);
    const dataBuffer = Buffer.from(canonical, 'utf-8');
    const signature = crypto.sign(null, dataBuffer, privateKeyPem);
    return signature.toString('base64');
  }

  /**
   * Verifies an Ed25519 signature of canonical manifest data.
   */
  public static verifyManifestSignature(
    manifest: ManifestData,
    signatureBase64: string,
    publicKeyPem: string
  ): boolean {
    try {
      const canonical = this.canonicalizeManifest(manifest);
      const dataBuffer = Buffer.from(canonical, 'utf-8');
      const sigBuffer = Buffer.from(signatureBase64, 'base64');
      return crypto.verify(null, dataBuffer, publicKeyPem, sigBuffer);
    } catch (err) {
      console.error('[CryptoEngine] Signature verification failed with error:', err);
      return false;
    }
  }

  /**
   * Generates a new Ed25519 key pair in PEM format.
   */
  public static generateEd25519KeyPair(): { publicKeyPem: string; privateKeyPem: string; fingerprint: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    const fingerprint = crypto.createHash('sha256').update(publicKeyPem).digest('hex').substring(0, 16);
    return { publicKeyPem, privateKeyPem, fingerprint };
  }
}
