import {
  DocumentRecord,
  VerificationRecord,
  SignedManifest,
  AuditLog,
  DemoFileItem,
  TestSuiteSummary
} from '../types/index.ts';

const TOKEN_KEY = 'forwarded_seal_admin_token';

export const apiClient = {
  // Token management
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Auth
  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    this.setToken(data.token);
    return data;
  },

  async logout() {
    const token = this.getToken();
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    this.removeToken();
  },

  async getMe() {
    const token = this.getToken();
    if (!token) return null;
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      this.removeToken();
      return null;
    }
    return (await res.json()).admin;
  },

  // Public Verification
  async verifyUpload(file: File, manualDocId?: string): Promise<{
    verification: VerificationRecord;
    registeredDocument: Partial<DocumentRecord> | null;
    manifest: any;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (manualDocId) {
      formData.append('manualDocId', manualDocId);
    }

    const res = await fetch('/api/verify/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Verification processing failed');
    }
    return await res.json();
  },

  async verifyById(documentId: string): Promise<any> {
    const res = await fetch('/api/verify/id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || 'Verification lookup failed');
    }
    return await res.json();
  },

  async getVerificationRecord(id: string): Promise<{
    verification: VerificationRecord;
    registeredDocument?: DocumentRecord;
  }> {
    const res = await fetch(`/api/verify/${id}`);
    if (!res.ok) throw new Error('Verification record not found');
    return await res.json();
  },

  // Demo Files
  async getDemoFiles(): Promise<DemoFileItem[]> {
    const res = await fetch('/api/demo/files');
    if (!res.ok) throw new Error('Failed to load demo files');
    return (await res.json()).demoFiles;
  },

  // Test Runner
  async runAllTests(): Promise<TestSuiteSummary> {
    const res = await fetch('/api/test/run-all', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Test suite run failed');
    }
    return await res.json();
  },

  // Admin Dashboard
  async getDashboardStats() {
    const token = this.getToken();
    const res = await fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return await res.json();
  },

  async getDocuments(params?: { search?: string; department?: string; category?: string; status?: string }) {
    const token = this.getToken();
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/admin/documents?${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return (await res.json()).documents as DocumentRecord[];
  },

  async getDocumentDetail(id: string): Promise<{
    document: DocumentRecord;
    manifest: SignedManifest;
    versions: any[];
    signingKeyInfo: any;
  }> {
    const token = this.getToken();
    const res = await fetch(`/api/admin/documents/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Document not found');
    return await res.json();
  },

  async issueDocument(formData: FormData) {
    const token = this.getToken();
    const res = await fetch('/api/admin/documents/issue', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to issue document');
    }
    return await res.json();
  },

  async revokeDocument(id: string, reason: string) {
    const token = this.getToken();
    const res = await fetch(`/api/admin/documents/${id}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to revoke document');
    return await res.json();
  },

  async replaceDocument(id: string, formData: FormData) {
    const token = this.getToken();
    const res = await fetch(`/api/admin/documents/${id}/replace`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to publish replacement version');
    }
    return await res.json();
  },

  async getInstitutionProfile() {
    const res = await fetch('/api/institution/profile');
    if (!res.ok) throw new Error('Failed to load institution profile');
    return await res.json();
  },

  async updateInstitutionProfile(data: any) {
    const token = this.getToken();
    const res = await fetch('/api/institution/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update institution settings');
    return await res.json();
  },

  async rotateSigningKey() {
    const token = this.getToken();
    const res = await fetch('/api/institution/rotate-key', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Key rotation failed');
    return await res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const token = this.getToken();
    const res = await fetch('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load audit logs');
    return (await res.json()).auditLogs;
  }
};
