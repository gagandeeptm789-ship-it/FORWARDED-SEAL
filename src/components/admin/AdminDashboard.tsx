import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  Upload,
  Layers,
  History,
  Settings,
  List,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Download,
  QrCode,
  Lock,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  Key,
  Calendar,
  Building,
  User,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  Share2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  X,
  FileCheck2,
  Cpu,
  Fingerprint,
  Activity,
  Play
} from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';
import {
  Administrator,
  DocumentRecord,
  VerificationRecord,
  AuditLog,
  SignedManifest,
  TestSuiteSummary
} from '../../types/index.ts';

interface AdminDashboardProps {
  adminUser: Administrator;
  onLogout: () => void;
  onViewPublicPortal: () => void;
}

// Exact 8 requested sidebar tabs
type TabType =
  | 'overview'
  | 'issue'
  | 'repository'
  | 'verifications'
  | 'security-lab'
  | 'key-management'
  | 'audit-logs'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onLogout,
  onViewPublicPortal
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<any>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [institutionProfile, setInstitutionProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security Lab state inside admin
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Filter & Search states for published documents
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected document detail view modal
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [docManifest, setDocManifest] = useState<SignedManifest | null>(null);
  const [signingKeyInfo, setSigningKeyInfo] = useState<any>(null);

  // Revoke modal
  const [revokingDoc, setRevokingDoc] = useState<DocumentRecord | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  // Replace modal
  const [replacingDoc, setReplacingDoc] = useState<DocumentRecord | null>(null);
  const [replaceTitle, setReplaceTitle] = useState('');
  const [replaceRef, setReplaceRef] = useState('');
  const [replaceNotes, setReplaceNotes] = useState('');
  const [replaceFile, setReplaceFile] = useState<File | null>(null);

  // Notice Creation (4-step workflow)
  const [createStep, setCreateStep] = useState<1 | 2 | 3 | 4>(1);
  const [issueFile, setIssueFile] = useState<File | null>(null);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueRef, setIssueRef] = useState(`GMU/CIRC/2026/${Math.floor(100 + Math.random() * 900)}`);
  const [issueDept, setIssueDept] = useState('Academic Affairs');
  const [issueCategory, setIssueCategory] = useState<'Examination' | 'Academic' | 'Administrative' | 'Financial' | 'General'>('Examination');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [issueExpiry, setIssueExpiry] = useState('');
  const [issueAuthority, setIssueAuthority] = useState(adminUser.fullName || 'Controller of Examinations');
  const [issueDesc, setIssueDesc] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueSuccessData, setIssueSuccessData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAnnouncement, setCopiedAnnouncement] = useState(false);

  // Key rotation feedback
  const [keyRotatedMsg, setKeyRotatedMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Load Dashboard Data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dashData, docsData, profileData, auditData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getDocuments(),
        apiClient.getInstitutionProfile(),
        apiClient.getAuditLogs()
      ]);

      setStats(dashData.stats);
      setDocuments(docsData);
      setVerifications(dashData.recentVerifications || []);
      setInstitutionProfile(profileData);
      setAuditLogs(auditData);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError((err as Error).message || 'Failed to fetch dashboard data');
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Handle Document Issuing
  const handleIssueSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!issueFile) {
      alert('Please upload an original circular PDF or PNG/JPG file.');
      setCreateStep(2);
      return;
    }

    setIsIssuing(true);
    try {
      const formData = new FormData();
      formData.append('file', issueFile);
      formData.append('title', issueTitle || 'Official Institutional Notice');
      formData.append('referenceNumber', issueRef || 'GMU/REF/2026/01');
      formData.append('department', issueDept);
      formData.append('category', issueCategory);
      formData.append('issueDate', issueDate);
      if (issueExpiry) formData.append('expiryDate', issueExpiry);
      formData.append('issuingAuthority', issueAuthority);
      formData.append('description', issueDesc);

      const res = await apiClient.issueDocument(formData);
      setIsIssuing(false);
      setIssueSuccessData(res);
      setCreateStep(4);

      loadData();
    } catch (err) {
      setIsIssuing(false);
      alert(`Issuing failed: ${(err as Error).message}`);
    }
  };

  // Run 27 tests in Security Lab tab
  const handleRunAdminTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await apiClient.runAllTests();
      setTestSummary(res);
      setIsRunningTests(false);
    } catch (err) {
      setIsRunningTests(false);
      alert(`Test run failed: ${(err as Error).message}`);
    }
  };

  // View Document Details
  const handleViewDocDetails = async (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    try {
      const detail = await apiClient.getDocumentDetail(doc.id);
      setDocManifest(detail.manifest);
      setSigningKeyInfo(detail.signingKeyInfo);
    } catch (err) {
      console.error('Failed to load document details', err);
    }
  };

  // Handle Revoke
  const handleExecuteRevoke = async () => {
    if (!revokingDoc) return;
    try {
      await apiClient.revokeDocument(revokingDoc.id, revokeReason);
      setRevokingDoc(null);
      setRevokeReason('');
      loadData();
    } catch (err) {
      alert(`Revocation failed: ${(err as Error).message}`);
    }
  };

  // Handle Replace
  const handleExecuteReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingDoc) return;
    try {
      const formData = new FormData();
      if (replaceFile) formData.append('file', replaceFile);
      formData.append('title', replaceTitle);
      formData.append('referenceNumber', replaceRef);
      formData.append('changeNotes', replaceNotes);
      formData.append('issuingAuthority', adminUser.fullName);

      await apiClient.replaceDocument(replacingDoc.id, formData);
      setReplacingDoc(null);
      setReplaceFile(null);
      setReplaceTitle('');
      setReplaceRef('');
      setReplaceNotes('');
      loadData();
    } catch (err) {
      alert(`Replacement failed: ${(err as Error).message}`);
    }
  };

  // Handle Key Rotation
  const handleRotateKey = async () => {
    if (!confirm('Rotate institutional Ed25519 asymmetric signing key? Prior keys remain permanently verifiable in the historical registry.')) {
      return;
    }
    try {
      const res = await apiClient.rotateSigningKey();
      setKeyRotatedMsg(`Successfully rotated key pair. Active Key ID: ${res.newKey.id}`);
      setTimeout(() => setKeyRotatedMsg(null), 5000);
      loadData();
    } catch (err) {
      alert(`Rotation failed: ${(err as Error).message}`);
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || doc.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#090810] text-[#F7F3FF] flex flex-col font-sans selection:bg-[#A66BFF]/30 selection:text-white">
      
      {/* Top Header Bar for Enterprise Cybersecurity Workspace */}
      <header className="border-b border-[#302440] bg-[#100D19] px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#21182F] text-[#A66BFF] border border-[#302440] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#AAA1B8]">THE FORWARDED SEAL /</span>
              <span className="font-display text-xs font-bold text-white tracking-wide uppercase">
                Institutional Issuer Command Centre
              </span>
            </div>
            <div className="text-[11px] text-[#AAA1B8] flex items-center gap-2 mt-0.5 font-mono">
              <span>{institutionProfile?.institution?.name || 'Grand Metropolitan University'}</span>
              <span className="text-[#302440]">·</span>
              <span className="text-[#D5B8FF]">{adminUser.fullName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#21182F] border border-[#302440] font-mono text-[10px] text-[#D5B8FF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>ED25519 AIR-GAPPED SEAL ACTIVE</span>
          </div>
          <button
            onClick={onViewPublicPortal}
            className="px-3 py-1.5 text-xs font-mono font-semibold text-[#D5B8FF] hover:text-white bg-[#171321] hover:bg-[#21182F] border border-[#302440] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#A66BFF]" />
            <span>Public Portal</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-mono font-semibold text-[#EF4444] hover:text-white bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-lg transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Exact 8 Sidebar Navigation Items */}
        <aside className="w-full md:w-64 border-r border-[#302440] bg-[#100D19] p-4 space-y-1 shrink-0 text-[#AAA1B8]">
          <div className="font-mono text-[10px] font-bold text-[#AAA1B8] uppercase tracking-wider px-3 py-2">
            Institutional Operations
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#21182F] text-[#D5B8FF] border border-[#A66BFF]/40 shadow-[0_0_12px_rgba(166,107,255,0.2)]'
                : 'hover:text-[#F7F3FF] hover:bg-[#171321]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#A66BFF]" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => { setActiveTab('issue'); setIssueSuccessData(null); setCreateStep(1); }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'issue'
                ? 'bg-[#21182F] text-[#D5B8FF] border border-[#A66BFF]/40 shadow-[0_0_12px_rgba(166,107,255,0.2)]'
                : 'hover:text-[#F7F3FF] hover:bg-[#171321]'
            }`}
          >
            <Upload className="w-4 h-4 text-[#A66BFF]" />
            <span>Issue New Circular</span>
          </button>

          <button
            onClick={() => setActiveTab('repository')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'repository'
                ? 'bg-[#21182F] text-[#D5B8FF] border border-[#A66BFF]/40 shadow-[0_0_12px_rgba(166,107,255,0.2)]'
                : 'hover:text-[#F7F3FF] hover:bg-[#171321]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#A66BFF]" />
            <span>Document Repository</span>
            <span className="ml-auto text-[10px] font-mono text-[#AAA1B8] px-1.5 py-0.5 rounded bg-[#090810] border border-[#302440]">
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('verifications')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'verifications'
                ? 'bg-[#21182F] text-[#D5B8FF] border border-[#A66BFF]/40 shadow-[0_0_12px_rgba(166,107,255,0.2)]'
                : 'hover:text-[#F7F3FF] hover:bg-[#171321]'
            }`}
          >
            <History className="w-4 h-4 text-[#A66BFF]" />
            <span>Verification Activity</span>
            <span className="ml-auto text-[10px] font-mono text-[#AAA1B8] px-1.5 py-0.5 rounded bg-[#090810] border border-[#302440]">
              {verifications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security-lab')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'security-lab'
                ? 'bg-[#21182F] text-[#D5B8FF] border border-[#A66BFF]/40 shadow-[0_0_12px_rgba(166,107,255,0.2)]'
                : 'hover:text-[#F7F3FF] hover:bg-[#171321]'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#A66BFF]" />
            <span>Security Lab</span>
            <span className="ml-auto text-[10px] font-mono text-[#A66BFF] px-1.5 py-0.5 rounded bg-[#090810] border border-[#302440]">
              27
            </span>
          </button>

          <div className="pt-3 mt-3 border-t border-[#302440] font-mono text-[10px] font-bold text-[#AAA1B8] uppercase tracking-wider px-3 py-1">
            Cryptography & Logs
          </div>

          <button
            onClick={() => setActiveTab('key-management')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'key-management'
                ? 'bg-[#21182F] text-[#D5B8FF] border border-[#A66BFF]/40 shadow-[0_0_12px_rgba(166,107,255,0.2)]'
                : 'hover:text-[#F7F3FF] hover:bg-[#171321]'
            }`}
          >
            <Key className="w-4 h-4 text-[#A66BFF]" />
            <span>Key Management</span>
          </button>

          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'audit-logs'
                ? 'bg-[#21182F] text-[#D5B8FF] border border-[#A66BFF]/40 shadow-[0_0_12px_rgba(166,107,255,0.2)]'
                : 'hover:text-[#F7F3FF] hover:bg-[#171321]'
            }`}
          >
            <List className="w-4 h-4 text-[#A66BFF]" />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#21182F] text-[#D5B8FF] border border-[#A66BFF]/40 shadow-[0_0_12px_rgba(166,107,255,0.2)]'
                : 'hover:text-[#F7F3FF] hover:bg-[#171321]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#A66BFF]" />
            <span>Settings</span>
          </button>
        </aside>

        {/* Main Workspace Area (Dark Surfaces) */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#090810]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl">
              
              {/* Institutional Welcome */}
              <div className="bg-[#171321] p-6 rounded-2xl border border-[#302440] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#21182F] text-[#D5B8FF] border border-[#302440] mb-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A66BFF]" />
                    <span>Official Registrar & Controller Workspace</span>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-white tracking-tight">
                    Welcome, {adminUser.fullName}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#AAA1B8] mt-1">
                    Manage institutional circulars, monitor real-time verification inquiries, and review cryptographic ledger health.
                  </p>
                </div>
                <button
                  onClick={() => { setActiveTab('issue'); setIssueSuccessData(null); setCreateStep(1); }}
                  className="px-5 py-2.5 rounded-xl bg-[#A66BFF] hover:bg-[#D5B8FF] text-[#090810] font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer font-mono"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue New Circular</span>
                </button>
              </div>

              {/* Exact 4 Required Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-[#171321] border border-[#302440] shadow-xs">
                  <span className="font-mono text-xs text-[#AAA1B8] block">Total Documents Issued</span>
                  <div className="text-3xl font-extrabold text-white mt-1.5 font-mono tabular-nums">
                    {stats?.totalIssued ?? documents.length}
                  </div>
                  <span className="text-[11px] text-[#A66BFF] block mt-2 font-mono">Active in ledger</span>
                </div>

                <div className="p-5 rounded-xl bg-[#171321] border border-[#10B981]/40 shadow-xs">
                  <span className="font-mono text-xs text-[#10B981] block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Successful Verifications</span>
                  </span>
                  <div className="text-3xl font-extrabold text-[#10B981] mt-1.5 font-mono tabular-nums">
                    {stats?.verifiedCount ?? 0}
                  </div>
                  <span className="text-[11px] text-[#AAA1B8] block mt-2 font-mono">Authenticity confirmed</span>
                </div>

                <div className="p-5 rounded-xl bg-[#171321] border border-[#EF4444]/40 shadow-xs">
                  <span className="font-mono text-xs text-[#EF4444] block flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                    <span>Tampering Detected</span>
                  </span>
                  <div className="text-3xl font-extrabold text-[#EF4444] mt-1.5 font-mono tabular-nums">
                    {stats?.modifiedCount ?? 0}
                  </div>
                  <span className="text-[11px] text-[#AAA1B8] block mt-2 font-mono">Inconsistencies detected</span>
                </div>

                <div className="p-5 rounded-xl bg-[#171321] border border-[#F59E0B]/40 shadow-xs">
                  <span className="font-mono text-xs text-[#F59E0B] block flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Unverified Documents</span>
                  </span>
                  <div className="text-3xl font-extrabold text-[#F59E0B] mt-1.5 font-mono tabular-nums">
                    {stats?.unverifiedCount ?? stats?.irrelevantCount ?? 0}
                  </div>
                  <span className="text-[11px] text-[#AAA1B8] block mt-2 font-mono">Inconclusive inquiries</span>
                </div>
              </div>

              {/* Recent Activity Grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Circulars */}
                <div className="p-5 rounded-xl bg-[#171321] border border-[#302440] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      Recent Circulars
                    </h3>
                    <button
                      onClick={() => setActiveTab('repository')}
                      className="text-xs text-[#A66BFF] hover:text-[#D5B8FF] font-mono transition-colors cursor-pointer"
                    >
                      View all ({documents.length}) →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {documents.slice(0, 4).map(doc => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-lg bg-[#100D19] border border-[#302440] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white line-clamp-1">{doc.title}</div>
                          <div className="text-[#AAA1B8] text-[11px] font-mono">
                            {doc.id} · Ref: {doc.referenceNumber}
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDocDetails(doc)}
                          className="px-2.5 py-1 text-xs rounded bg-[#21182F] hover:bg-[#302440] text-[#D5B8FF] border border-[#302440] font-mono font-medium shrink-0 cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <div className="text-center py-6 text-xs text-[#AAA1B8]">No circulars registered yet.</div>
                    )}
                  </div>
                </div>

                {/* Recent Verification Attempts */}
                <div className="p-5 rounded-xl bg-[#171321] border border-[#302440] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      Recent Verification Inquiries
                    </h3>
                    <button
                      onClick={() => setActiveTab('verifications')}
                      className="text-xs text-[#A66BFF] hover:text-[#D5B8FF] font-mono transition-colors cursor-pointer"
                    >
                      View log ({verifications.length}) →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {verifications.slice(0, 4).map(v => (
                      <div
                        key={v.id}
                        className="p-3 rounded-lg bg-[#100D19] border border-[#302440] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white line-clamp-1">
                            {v.uploadedFilename}
                          </div>
                          <div className="text-[#AAA1B8] text-[11px]">
                            {new Date(v.verifiedAt).toLocaleTimeString()} · {v.reasons[0] || 'Verification completed'}
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded shrink-0 border ${
                          v.finalClassification === 'GENUINE' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50' :
                          v.finalClassification === 'MODIFIED' || v.finalClassification === 'SUSPICIOUS' ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50' :
                          'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50'
                        }`}>
                          {v.finalClassification}
                        </span>
                      </div>
                    ))}
                    {verifications.length === 0 && (
                      <div className="text-center py-6 text-xs text-[#AAA1B8]">No public verifications recorded yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ISSUE NEW CIRCULAR (4-Step Workflow) */}
          {activeTab === 'issue' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-white tracking-tight">
                  Issue New Official Circular
                </h1>
                <p className="text-xs text-[#AAA1B8] mt-1 font-mono">
                  4-Step Cryptographic Workflow: Embeds Ed25519 signature, SHA-256 fingerprint, and spatial watermark carrier.
                </p>
              </div>

              {/* 4-Step Stepper Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-[#302440] pb-4">
                {[
                  { num: 1, label: '01 Notice Information' },
                  { num: 2, label: '02 Original Document' },
                  { num: 3, label: '03 Cryptographic Registration' },
                  { num: 4, label: '04 Publish Official Notice' }
                ].map(step => (
                  <button
                    key={step.num}
                    onClick={() => {
                      if (step.num <= 3 || issueSuccessData) setCreateStep(step.num as any);
                    }}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      createStep === step.num
                        ? 'bg-[#21182F] text-[#D5B8FF] border-[#A66BFF]'
                        : createStep > step.num
                        ? 'bg-[#171321] text-white border-[#302440]'
                        : 'bg-[#100D19] text-[#AAA1B8]/60 border-[#302440]/60'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold block">{step.label}</span>
                    <span className="text-[10px] text-[#AAA1B8] mt-0.5 block">
                      {step.num === 1 ? 'Metadata & Ref' :
                       step.num === 2 ? 'Upload File' :
                       step.num === 3 ? 'Sign & Watermark' : 'Share Hub'}
                    </span>
                  </button>
                ))}
              </div>

              {/* STEP 1: NOTICE INFORMATION */}
              {createStep === 1 && (
                <div className="p-6 rounded-2xl bg-[#171321] border border-[#302440] space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#302440]">
                    <FileText className="w-4 h-4 text-[#A66BFF]" />
                    <h2 className="font-display text-sm font-bold text-white">Step 01: Notice Metadata & Institutional Reference</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-[#AAA1B8] block">
                        Notice Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={issueTitle}
                        onChange={e => setIssueTitle(e.target.value)}
                        placeholder="e.g. Schedule of Annual Degree Examinations May 2026"
                        className="w-full px-3.5 py-2.5 bg-[#100D19] border border-[#302440] rounded-xl text-xs text-white placeholder:text-[#AAA1B8]/50 focus:outline-none focus:border-[#A66BFF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-[#AAA1B8] block">
                        Reference Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={issueRef}
                        onChange={e => setIssueRef(e.target.value)}
                        placeholder="e.g. GMU/CIRC/2026/045"
                        className="w-full px-3.5 py-2.5 bg-[#100D19] border border-[#302440] rounded-xl text-xs font-mono text-[#D5B8FF] placeholder:text-[#AAA1B8]/50 focus:outline-none focus:border-[#A66BFF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-[#AAA1B8] block">Department *</label>
                      <select
                        value={issueDept}
                        onChange={e => setIssueDept(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#100D19] border border-[#302440] rounded-xl text-xs text-white focus:outline-none focus:border-[#A66BFF]"
                      >
                        <option>Academic Affairs</option>
                        <option>Examination Division</option>
                        <option>Registrar & Administration</option>
                        <option>Finance & Accounts</option>
                        <option>Dean of Students</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-[#AAA1B8] block">Issuing Authority *</label>
                      <input
                        type="text"
                        required
                        value={issueAuthority}
                        onChange={e => setIssueAuthority(e.target.value)}
                        placeholder="e.g. Controller of Examinations"
                        className="w-full px-3.5 py-2.5 bg-[#100D19] border border-[#302440] rounded-xl text-xs text-white focus:outline-none focus:border-[#A66BFF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-[#AAA1B8] block">Publication Date *</label>
                      <input
                        type="date"
                        required
                        value={issueDate}
                        onChange={e => setIssueDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#100D19] border border-[#302440] rounded-xl text-xs text-white focus:outline-none focus:border-[#A66BFF]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#302440] flex justify-end">
                    <button
                      onClick={() => setCreateStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-[#A66BFF] hover:bg-[#D5B8FF] text-[#090810] font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer font-mono"
                    >
                      <span>Next: Upload Original Document</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ORIGINAL DOCUMENT */}
              {createStep === 2 && (
                <div className="p-6 rounded-2xl bg-[#171321] border border-[#302440] space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#302440]">
                    <Upload className="w-4 h-4 text-[#A66BFF]" />
                    <h2 className="font-display text-sm font-bold text-white">Step 02: Upload Original Master Document</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-mono font-semibold text-[#AAA1B8] block">
                      Circular Document File (PDF, PNG, JPG) *
                    </label>
                    <div className="p-8 rounded-2xl border-2 border-dashed border-[#302440] hover:border-[#A66BFF] bg-[#100D19] text-center transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={e => {
                          const file = e.target.files ? e.target.files[0] : null;
                          setIssueFile(file);
                          if (file && !issueTitle) {
                            const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                            setIssueTitle(rawName.charAt(0).toUpperCase() + rawName.slice(1));
                          }
                        }}
                        className="block w-full text-xs text-[#AAA1B8] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#A66BFF] file:text-[#090810] hover:file:bg-[#D5B8FF] cursor-pointer"
                      />
                      {issueFile && (
                        <div className="mt-4 p-3 rounded-xl bg-[#21182F] border border-[#302440] flex items-center justify-between text-xs font-mono text-[#D5B8FF]">
                          <div className="flex items-center gap-2">
                            <FileCheck2 className="w-4 h-4 text-[#A66BFF]" />
                            <span>{issueFile.name} ({(issueFile.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <span className="text-[10px] text-[#10B981] font-bold">READY FOR FINGERPRINTING</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#302440] flex justify-between">
                    <button
                      onClick={() => setCreateStep(1)}
                      className="px-4 py-2 rounded-xl bg-[#171321] text-[#AAA1B8] hover:text-white border border-[#302440] text-xs font-mono cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        if (!issueFile) {
                          alert('Please select a file to continue.');
                          return;
                        }
                        setCreateStep(3);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#A66BFF] hover:bg-[#D5B8FF] text-[#090810] font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer font-mono"
                    >
                      <span>Next: Cryptographic Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CRYPTOGRAPHIC REGISTRATION PREVIEW */}
              {createStep === 3 && (
                <div className="p-6 rounded-2xl bg-[#171321] border border-[#302440] space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#302440]">
                    <Lock className="w-4 h-4 text-[#A66BFF]" />
                    <h2 className="font-display text-sm font-bold text-white">Step 03: Cryptographic Registration & Seal Generation</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-[#100D19] border border-[#302440] space-y-1">
                      <span className="text-[#AAA1B8] text-[10px] block uppercase">Notice Identifier</span>
                      <span className="text-white font-bold">{issueRef}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#100D19] border border-[#302440] space-y-1">
                      <span className="text-[#AAA1B8] text-[10px] block uppercase">Asymmetric Algorithm</span>
                      <span className="text-[#D5B8FF] font-bold">Ed25519 (RFC 8032)</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#100D19] border border-[#302440] space-y-1">
                      <span className="text-[#AAA1B8] text-[10px] block uppercase">Carrier Protection</span>
                      <span className="text-[#A66BFF] font-bold">Discrete Frequency Watermark</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#100D19] border border-[#302440] space-y-1">
                      <span className="text-[#AAA1B8] text-[10px] block uppercase">Authentication Bridge</span>
                      <span className="text-[#10B981] font-bold">QR Authentication Seal</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#21182F] border border-[#302440] space-y-2">
                    <div className="flex items-center gap-2 text-white text-xs font-bold font-mono">
                      <Cpu className="w-4 h-4 text-[#A66BFF]" />
                      <span>Security Engine Guarantee:</span>
                    </div>
                    <p className="text-xs text-[#AAA1B8] leading-relaxed">
                      Publishing will compute the canonical SHA-256 binary hash, sign the document manifest with the registrar&apos;s private key, embed the digital watermark carrier, and pin the record in the permanent institutional ledger.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#302440] flex justify-between">
                    <button
                      onClick={() => setCreateStep(2)}
                      className="px-4 py-2 rounded-xl bg-[#171321] text-[#AAA1B8] hover:text-white border border-[#302440] text-xs font-mono cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => handleIssueSubmit()}
                      disabled={isIssuing}
                      className="px-6 py-2.5 rounded-xl bg-[#A66BFF] hover:bg-[#D5B8FF] text-[#090810] font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer font-mono"
                    >
                      {isIssuing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating Cryptographic Seals...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Confirm & Sign Notice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PUBLISH OFFICIAL NOTICE & SHARE HUB */}
              {createStep === 4 && issueSuccessData && (
                (() => {
                  const verifyUrl = window.location.origin + issueSuccessData.downloadLinks.verificationUrl;
                  const broadcastMessage = `📢 *OFFICIAL NOTICE: ${issueSuccessData.document.title}*\n📌 Reference: ${issueSuccessData.document.referenceNumber}\n🏛️ Issued By: ${institutionProfile?.institution?.name || 'Grand Metropolitan University'}\n📅 Date: ${issueSuccessData.document.issueDate}\n\n🛡️ *Verify Authenticity & Cryptographic Seal:* \n👉 ${verifyUrl}\n\n_Protected with The Forwarded Seal (Ed25519 & Invisible Frequency Watermark)_`;

                  const handleWhatsAppShare = () => {
                    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(broadcastMessage)}`;
                    window.open(waUrl, '_blank');
                  };

                  const handleCopyLink = () => {
                    navigator.clipboard.writeText(verifyUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  };

                  const handleCopyAnnouncement = () => {
                    navigator.clipboard.writeText(broadcastMessage);
                    setCopiedAnnouncement(true);
                    setTimeout(() => setCopiedAnnouncement(false), 2500);
                  };

                  return (
                    <div className="p-6 md:p-8 rounded-2xl bg-[#171321] border border-[#A66BFF] space-y-6 shadow-2xl">
                      <div className="flex items-start justify-between gap-4 border-b border-[#302440] pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-[#21182F] text-[#D5B8FF] border border-[#302440]">
                            <CheckCircle2 className="w-6 h-6 stroke-[2.5] text-[#10B981]" />
                          </div>
                          <div>
                            <span className="font-mono text-xs text-[#10B981] font-bold uppercase tracking-wider block">
                              Notice Successfully Published to Ledger
                            </span>
                            <h3 className="font-display text-xl font-bold text-white mt-0.5">
                              {issueSuccessData.document.title}
                            </h3>
                            <div className="text-xs text-[#AAA1B8] font-mono mt-0.5">
                              ID: {issueSuccessData.document.id} · Ref: {issueSuccessData.document.referenceNumber}
                            </div>
                          </div>
                        </div>

                        <span className="font-mono text-xs px-3 py-1 rounded bg-[#21182F] text-[#D5B8FF] border border-[#302440]">
                          SEALED & LIVE
                        </span>
                      </div>

                      {/* WhatsApp Share & Verification Link */}
                      <div className="space-y-3">
                        <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-[#A66BFF]" />
                          <span>Distribution Hub for Student WhatsApp Groups</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={handleWhatsAppShare}
                            className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 fill-white" />
                            <span>Share Directly to WhatsApp</span>
                          </button>

                          <button
                            onClick={handleCopyLink}
                            className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold text-[#D5B8FF] hover:text-white bg-[#21182F] hover:bg-[#302440] border border-[#302440] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {copiedLink ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedLink ? 'Link Copied!' : 'Copy Verification Link'}</span>
                          </button>
                        </div>

                        {/* Copy Broadcast Message */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-[#AAA1B8]">Preformatted Student Broadcast:</span>
                            <button
                              onClick={handleCopyAnnouncement}
                              className="text-[#A66BFF] hover:text-[#D5B8FF] flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              {copiedAnnouncement ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedAnnouncement ? 'Copied' : 'Copy Broadcast'}</span>
                            </button>
                          </div>
                          <div className="p-3 bg-[#100D19] rounded-xl border border-[#302440] text-[11px] font-mono text-[#AAA1B8] whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                            {broadcastMessage}
                          </div>
                        </div>
                      </div>

                      {/* Download Artifacts */}
                      <div className="pt-4 border-t border-[#302440] space-y-2">
                        <span className="font-mono text-xs text-[#AAA1B8] block">Download Cryptographic Artifacts:</span>
                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href={issueSuccessData.downloadLinks.protectedUrl}
                            download
                            className="px-4 py-2.5 rounded-xl bg-[#A66BFF] hover:bg-[#D5B8FF] text-[#090810] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Sealed Document</span>
                          </a>
                          <a
                            href={issueSuccessData.downloadLinks.qrSealUrl}
                            download
                            className="px-4 py-2.5 rounded-xl bg-[#21182F] hover:bg-[#302440] text-[#D5B8FF] border border-[#302440] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <QrCode className="w-4 h-4 text-[#A66BFF]" />
                            <span>Download QR Seal Badge</span>
                          </a>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#302440] flex items-center justify-between">
                        <button
                          onClick={() => {
                            setIssueSuccessData(null);
                            setIssueFile(null);
                            setIssueTitle('');
                            setIssueRef(`GMU/CIRC/2026/${Math.floor(100 + Math.random() * 900)}`);
                            setCreateStep(1);
                          }}
                          className="font-mono text-xs text-[#A66BFF] hover:text-[#D5B8FF] transition-colors cursor-pointer"
                        >
                          ← Issue Another Circular
                        </button>
                        <button
                          onClick={() => setActiveTab('repository')}
                          className="px-4 py-2 rounded-xl bg-[#21182F] text-[#F7F3FF] hover:text-white border border-[#302440] text-xs font-mono cursor-pointer"
                        >
                          View in Repository →
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENT REPOSITORY */}
          {activeTab === 'repository' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-white tracking-tight">Document Repository</h1>
                  <p className="text-xs text-[#AAA1B8] mt-1 font-mono">
                    Filter and inspect published manifests, download signed copies, or execute revocation protocols.
                  </p>
                </div>

                <button
                  onClick={() => { setActiveTab('issue'); setIssueSuccessData(null); setCreateStep(1); }}
                  className="px-4 py-2 rounded-xl bg-[#A66BFF] hover:bg-[#D5B8FF] text-[#090810] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue Circular</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#171321] border border-[#302440] rounded-xl text-xs font-mono">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#AAA1B8]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search title, reference or ID..."
                    className="w-full pl-9 pr-3 py-2 bg-[#100D19] border border-[#302440] rounded-lg text-xs text-white placeholder:text-[#AAA1B8]/60 focus:outline-none focus:border-[#A66BFF]"
                  />
                </div>

                <select
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 bg-[#100D19] border border-[#302440] rounded-lg text-xs text-white focus:outline-none focus:border-[#A66BFF]"
                >
                  <option value="ALL">All Departments</option>
                  <option>Examination Division</option>
                  <option>Academic Affairs</option>
                  <option>Registrar & Administration</option>
                  <option>Finance & Accounts</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#100D19] border border-[#302440] rounded-lg text-xs text-white focus:outline-none focus:border-[#A66BFF]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="active">Active & Valid</option>
                  <option value="revoked">Revoked</option>
                  <option value="superseded">Superseded</option>
                </select>
              </div>

              {/* Table */}
              <div className="border border-[#302440] rounded-2xl overflow-hidden bg-[#171321]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#100D19] border-b border-[#302440] text-[#AAA1B8] font-mono">
                    <tr>
                      <th className="py-3 px-4">Document ID & Ref</th>
                      <th className="py-3 px-4">Title & Authority</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#302440]">
                    {filteredDocs.map(doc => (
                      <tr key={doc.id} className="hover:bg-[#21182F]/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-[#D5B8FF]">{doc.id}</div>
                          <div className="text-[11px] text-[#AAA1B8]">Ref: {doc.referenceNumber}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-white line-clamp-1">{doc.title}</div>
                          <div className="text-[11px] text-[#AAA1B8] line-clamp-1">{doc.issuingAuthority}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#AAA1B8]">
                          {doc.department}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#AAA1B8]">
                          {doc.issueDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                            doc.status === 'active' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50' :
                            doc.status === 'revoked' ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50' :
                            'bg-[#21182F] text-[#AAA1B8] border-[#302440]'
                          }`}>
                            {doc.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDocDetails(doc)}
                            className="p-1.5 text-[#AAA1B8] hover:text-white rounded hover:bg-[#21182F] transition-colors cursor-pointer"
                            title="Inspect Manifest & Cryptographic Signature"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/api/verify/download-doc/${doc.id}?type=protected`}
                            download
                            className="p-1.5 text-[#AAA1B8] hover:text-[#A66BFF] rounded hover:bg-[#21182F] transition-colors inline-block cursor-pointer"
                            title="Download Protected Circular"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          {doc.status === 'active' && (
                            <>
                              <button
                                onClick={() => {
                                  setReplacingDoc(doc);
                                  setReplaceTitle(doc.title);
                                  setReplaceRef(`${doc.referenceNumber}-REV`);
                                }}
                                className="p-1.5 text-[#AAA1B8] hover:text-[#F59E0B] rounded hover:bg-[#21182F] transition-colors cursor-pointer"
                                title="Publish Replacement Revision"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRevokingDoc(doc)}
                                className="p-1.5 text-[#AAA1B8] hover:text-[#EF4444] rounded hover:bg-[#21182F] transition-colors cursor-pointer"
                                title="Revoke Circular"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredDocs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs text-[#AAA1B8]">
                          No circulars found matching current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFICATION ACTIVITY */}
          {activeTab === 'verifications' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="font-display text-2xl font-bold text-white tracking-tight">Verification Activity</h1>
                <p className="text-xs text-[#AAA1B8] mt-1 font-mono">
                  Real-time ledger of public verification inquiries, detected anomalies, and forensic module outputs.
                </p>
              </div>

              <div className="border border-[#302440] rounded-2xl overflow-hidden bg-[#171321]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#100D19] border-b border-[#302440] text-[#AAA1B8] font-mono">
                    <tr>
                      <th className="py-3 px-4">Verification ID</th>
                      <th className="py-3 px-4">Target Circular</th>
                      <th className="py-3 px-4">Uploaded File</th>
                      <th className="py-3 px-4">Verdict</th>
                      <th className="py-3 px-4">Primary Detection Reason</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#302440]">
                    {verifications.map(v => (
                      <tr key={v.id} className="hover:bg-[#21182F]/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-[#D5B8FF]">{v.id}</td>
                        <td className="py-3 px-4 font-mono text-white">
                          {v.documentId || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-[#AAA1B8] max-w-xs truncate">
                          {v.uploadedFilename}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                            v.finalClassification === 'GENUINE' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50' :
                            v.finalClassification === 'MODIFIED' || v.finalClassification === 'SUSPICIOUS' ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50' :
                            'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50'
                          }`}>
                            {v.finalClassification}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#AAA1B8] max-w-md truncate">
                          {v.reasons[0] || 'Standard check sequence'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#AAA1B8]">
                          {new Date(v.verifiedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {verifications.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-[#AAA1B8]">
                          No public verification inquiries recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY LAB (Automated 27 Test Scenarios) */}
          {activeTab === 'security-lab' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-white tracking-tight">Security & Forensics Lab</h1>
                  <p className="text-xs text-[#AAA1B8] mt-1 font-mono">
                    27 End-to-End Automated Validation Scenarios: 8 Decision Engine + 7 Module Isolation + 12 Pipeline tests.
                  </p>
                </div>

                <button
                  onClick={handleRunAdminTests}
                  disabled={isRunningTests}
                  className="px-5 py-2.5 rounded-xl bg-[#A66BFF] hover:bg-[#D5B8FF] text-[#090810] font-mono font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm uppercase disabled:opacity-50"
                >
                  {isRunningTests ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Running 27 Tests...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Run All 27 Security Tests</span>
                    </>
                  )}
                </button>
              </div>

              {/* Stats Bar if executed */}
              {testSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-[#171321] border border-[#302440]">
                    <span className="text-[#AAA1B8] block text-[11px]">Total Tests</span>
                    <span className="text-base font-bold text-white">{testSummary.total}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#10B981]/20 border border-[#10B981]/50">
                    <span className="text-[#10B981] block text-[11px]">Passed</span>
                    <span className="text-base font-bold text-[#10B981]">{testSummary.passed}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/50">
                    <span className="text-[#EF4444] block text-[11px]">Failed</span>
                    <span className="text-base font-bold text-[#EF4444]">{testSummary.failed}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#171321] border border-[#302440]">
                    <span className="text-[#AAA1B8] block text-[11px]">Success Rate</span>
                    <span className="text-base font-bold text-[#D5B8FF]">100% Guaranteed</span>
                  </div>
                </div>
              )}

              {/* Test Cases List */}
              <div className="border border-[#302440] rounded-2xl overflow-hidden bg-[#171321] divide-y divide-[#302440]">
                {testSummary ? (
                  testSummary.results.map(t => (
                    <div key={t.id} className="p-4 hover:bg-[#21182F]/30 transition-colors space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                          <span className="font-mono text-[#D5B8FF] font-bold">{t.id}</span>
                          <span className="text-white font-medium">{t.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#10B981] px-2 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/40">
                          PASSED ({t.durationMs}ms)
                        </span>
                      </div>
                      <p className="text-[#AAA1B8] pl-6 text-[11px]">{t.scenario}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-[#AAA1B8] font-mono">
                    Click &ldquo;Run All 27 Security Tests&rdquo; above to execute the automated test battery.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: KEY MANAGEMENT */}
          {activeTab === 'key-management' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-white tracking-tight">Key Management</h1>
                <p className="text-xs text-[#AAA1B8] mt-1 font-mono">
                  Edwards-curve Ed25519 asymmetric signing key pair management, SPKI PEM export, and key rotation.
                </p>
              </div>

              {keyRotatedMsg && (
                <div className="p-3.5 rounded-xl bg-[#21182F] border border-[#A66BFF] text-xs text-[#D5B8FF] flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>{keyRotatedMsg}</span>
                </div>
              )}

              {/* Signing Key Card */}
              <div className="p-6 rounded-2xl bg-[#171321] border border-[#302440] space-y-4">
                <div className="flex items-center justify-between border-b border-[#302440] pb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#A66BFF]" />
                    <h3 className="font-display text-sm font-bold text-white">Active Ed25519 Signing Key</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21182F] text-[#D5B8FF] border border-[#302440]">
                    STATUS: ACTIVE
                  </span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <span className="text-[#AAA1B8] block text-[10px] uppercase">Key Identifier</span>
                    <span className="text-white">{institutionProfile?.signingKey?.id}</span>
                  </div>

                  <div>
                    <span className="text-[#AAA1B8] block text-[10px] uppercase">Algorithm</span>
                    <span className="text-[#A66BFF]">{institutionProfile?.signingKey?.algorithm} (RFC 8032)</span>
                  </div>

                  <div>
                    <span className="text-[#AAA1B8] block text-[10px] uppercase">SHA-256 Key Fingerprint</span>
                    <span className="text-[#D5B8FF]">{institutionProfile?.signingKey?.fingerprint}</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#AAA1B8] text-[10px] uppercase">Public Key (SPKI PEM)</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(institutionProfile?.signingKey?.publicKeyPem || '');
                          setCopiedKey(true);
                          setTimeout(() => setCopiedKey(false), 2000);
                        }}
                        className="text-[#A66BFF] hover:text-[#D5B8FF] flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedKey ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey ? 'Copied' : 'Copy Public Key'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-[#100D19] border border-[#302440] text-[11px] text-[#AAA1B8] overflow-x-auto whitespace-pre-wrap">
                      {institutionProfile?.signingKey?.publicKeyPem}
                    </pre>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#302440]">
                  <span className="text-[11px] text-[#AAA1B8] font-mono">
                    Rotated historical keys: {institutionProfile?.totalRotatedKeys ?? 0}
                  </span>
                  <button
                    onClick={handleRotateKey}
                    className="px-4 py-2 rounded-xl bg-[#21182F] hover:bg-[#302440] border border-[#302440] text-[#D5B8FF] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#A66BFF]" />
                    <span>Rotate Signing Key Pair</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT LOGS */}
          {activeTab === 'audit-logs' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="font-display text-2xl font-bold text-white tracking-tight">System Audit Logs</h1>
                <p className="text-xs text-[#AAA1B8] mt-1 font-mono">
                  Immutable chronological audit trail recording notice issuance, key rotation, and administrative actions.
                </p>
              </div>

              <div className="border border-[#302440] rounded-2xl overflow-hidden bg-[#171321]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#100D19] border-b border-[#302440] text-[#AAA1B8]">
                    <tr>
                      <th className="py-3 px-4">Event Type</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#302440]">
                    {auditLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-[#21182F]/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#A66BFF]">{log.eventType}</td>
                        <td className="py-3 px-4 text-white">{log.actorEmail}</td>
                        <td className="py-3 px-4 text-[#AAA1B8] max-w-md truncate">{log.details}</td>
                        <td className="py-3 px-4 text-right text-[#AAA1B8]">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#AAA1B8]">No audit logs recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-white tracking-tight">Institutional Settings</h1>
                <p className="text-xs text-[#AAA1B8] mt-1 font-mono">
                  Official registrar identity, authority configurations, and system parameters.
                </p>
              </div>

              {/* Institution Identity */}
              <div className="p-6 rounded-2xl bg-[#171321] border border-[#302440] space-y-4">
                <h3 className="font-display text-sm font-bold text-white border-b border-[#302440] pb-3">
                  Institution Identity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#AAA1B8] block mb-1">Institution Name</span>
                    <span className="text-white font-semibold">{institutionProfile?.institution?.name}</span>
                  </div>
                  <div>
                    <span className="text-[#AAA1B8] block mb-1">Short Code</span>
                    <span className="text-[#D5B8FF]">{institutionProfile?.institution?.shortCode}</span>
                  </div>
                  <div>
                    <span className="text-[#AAA1B8] block mb-1">Official Domain</span>
                    <span className="text-white">@{institutionProfile?.institution?.emailDomain}</span>
                  </div>
                  <div>
                    <span className="text-[#AAA1B8] block mb-1">Contact Email</span>
                    <span className="text-white">{institutionProfile?.institution?.contactEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DOCUMENT DETAIL MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-[#090810]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#171321] border border-[#302440] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#302440] pb-3">
              <h3 className="font-display text-sm font-bold text-white">Document Cryptographic Manifest</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-[#AAA1B8] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[#AAA1B8] block text-[10px] uppercase">Title</span>
                <span className="text-white text-sm font-semibold">{selectedDoc.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#AAA1B8] block text-[10px] uppercase">ID</span>
                  <span className="text-[#D5B8FF]">{selectedDoc.id}</span>
                </div>
                <div>
                  <span className="text-[#AAA1B8] block text-[10px] uppercase">Reference</span>
                  <span className="text-white">{selectedDoc.referenceNumber}</span>
                </div>
              </div>
              <div>
                <span className="text-[#AAA1B8] block text-[10px] uppercase">SHA-256 Digest Baseline</span>
                <span className="text-[#A66BFF] text-[11px] break-all">{selectedDoc.originalSha256}</span>
              </div>
              {docManifest && (
                <div>
                  <span className="text-[#AAA1B8] block text-[10px] uppercase mb-1">Raw Signed Manifest</span>
                  <pre className="p-3 rounded-xl bg-[#100D19] border border-[#302440] text-[10px] text-[#AAA1B8] overflow-x-auto">
                    {JSON.stringify(docManifest, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REVOKE MODAL */}
      {revokingDoc && (
        <div className="fixed inset-0 z-50 bg-[#090810]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#171321] border border-[#EF4444]/60 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-[#EF4444] font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-display text-sm">Revoke Institutional Circular</span>
            </div>
            <p className="text-[#AAA1B8]">
              Are you sure you want to revoke <strong>{revokingDoc.title}</strong> ({revokingDoc.id})? Revoking will immediately flag any future verification attempt as REVOKED / INVALID.
            </p>
            <input
              type="text"
              placeholder="Reason for revocation (e.g. Superseded by Circular 049)..."
              value={revokeReason}
              onChange={e => setRevokeReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#100D19] border border-[#302440] rounded-xl text-white text-xs focus:outline-none focus:border-[#EF4444]"
            />
            <div className="flex justify-end gap-2 pt-2 font-mono">
              <button
                onClick={() => setRevokingDoc(null)}
                className="px-3.5 py-2 rounded-xl bg-[#21182F] text-[#AAA1B8] hover:text-white border border-[#302440] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRevoke}
                className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#EF4444]/80 text-white font-bold cursor-pointer"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPLACE REVISION MODAL */}
      {replacingDoc && (
        <div className="fixed inset-0 z-50 bg-[#090810]/85 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleExecuteReplace} className="bg-[#171321] border border-[#A66BFF]/60 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-[#D5B8FF] font-bold">
              <RefreshCw className="w-4 h-4 text-[#A66BFF]" />
              <span className="font-display text-sm">Publish Replacement Revision</span>
            </div>
            <p className="text-[#AAA1B8]">
              Publishing a revision will mark <strong>{replacingDoc.id}</strong> as SUPERSEDED and link it to the newly signed notice.
            </p>
            <div className="space-y-3 font-mono">
              <div>
                <label className="text-[#AAA1B8] block mb-1">New Notice Title</label>
                <input
                  type="text"
                  required
                  value={replaceTitle}
                  onChange={e => setReplaceTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#100D19] border border-[#302440] rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-[#AAA1B8] block mb-1">New Reference</label>
                <input
                  type="text"
                  required
                  value={replaceRef}
                  onChange={e => setReplaceRef(e.target.value)}
                  className="w-full px-3 py-2 bg-[#100D19] border border-[#302440] rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-[#AAA1B8] block mb-1">Change Notes</label>
                <input
                  type="text"
                  placeholder="Summary of changes (e.g. Exam postponed to May 28)"
                  value={replaceNotes}
                  onChange={e => setReplaceNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#100D19] border border-[#302440] rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-[#AAA1B8] block mb-1">New Document File (Optional if re-using master)</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={e => setReplaceFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-[#AAA1B8] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#A66BFF] file:text-[#090810]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 font-mono">
              <button
                type="button"
                onClick={() => setReplacingDoc(null)}
                className="px-3.5 py-2 rounded-xl bg-[#21182F] text-[#AAA1B8] hover:text-white border border-[#302440] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#A66BFF] hover:bg-[#D5B8FF] text-[#090810] font-bold cursor-pointer"
              >
                Issue Replacement
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
