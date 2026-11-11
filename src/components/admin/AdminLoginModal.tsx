import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, X, KeyRound } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';
import { Administrator } from '../../types/index.ts';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: Administrator) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('admin@gmu.edu');
  const [password, setPassword] = useState('Gmu@12345!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiClient.login(email.trim(), password);
      setIsLoading(false);
      onLoginSuccess(data.admin);
      onClose();
    } catch (err) {
      setIsLoading(false);
      setErrorMessage((err as Error).message || 'Authentication failed');
    }
  };

  const fillDevCredentials = () => {
    setEmail('admin@gmu.edu');
    setPassword('Gmu@12345!');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101713]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#101713] text-[#F5F4ED] border border-[#303D35] rounded-2xl shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#303D35] flex items-center justify-between bg-[#19382C]/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#19382C] text-[#C5F36B] border border-[#303D35]">
              <ShieldCheck className="w-5 h-5 text-[#00A878]" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white">Institutional Issuer Login</h2>
              <div className="text-xs text-[#9BA79F] font-mono">Grand Metropolitan University Portal</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#9BA79F] hover:text-white rounded-lg hover:bg-[#19382C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Development Credential Helper Banner */}
        <div className="px-6 py-2.5 bg-[#19382C]/40 border-b border-[#303D35] flex items-center justify-between gap-3 text-xs font-mono">
          <div className="text-[#9BA79F]">
            <span className="text-[#C5F36B] font-semibold">Dev Account:</span> admin@gmu.edu / Gmu@12345!
          </div>
          <button
            type="button"
            onClick={fillDevCredentials}
            className="px-2 py-0.5 rounded bg-[#00A878] hover:bg-[#16865D] text-white font-semibold transition-colors text-[10px] uppercase tracking-wider"
          >
            Auto-Fill
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#CF4848]/20 border border-[#CF4848]/50 text-xs text-[#CF4848] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#CF4848] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-[#9BA79F] block">
              Institutional Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9BA79F]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="controller@gmu.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d1410] border border-[#303D35] rounded-lg text-xs text-white placeholder:text-[#9BA79F]/50 focus:outline-none focus:border-[#00A878]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-[#9BA79F] block">
                Administrative Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-[#00A878] hover:text-[#C5F36B] font-mono"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9BA79F]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#0d1410] border border-[#303D35] rounded-lg text-xs text-white placeholder:text-[#9BA79F]/50 focus:outline-none focus:border-[#00A878] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9BA79F] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#9BA79F] select-none font-mono text-[11px]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-[#303D35] bg-[#0d1410] text-[#00A878] focus:ring-0"
              />
              <span>Remember administrator session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#00A878] hover:bg-[#16865D] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm tracking-wider uppercase font-mono"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Backend...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In to Institutional Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Forgot password dialog overlay */}
        {showForgotModal && (
          <div className="absolute inset-0 bg-[#101713]/98 p-6 flex flex-col justify-between z-20">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#303D35] pb-3">
                <h3 className="font-display text-sm font-bold text-white">Administrator Credentials</h3>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="text-[#9BA79F] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#9BA79F] leading-relaxed mb-4">
                Institutional credential recovery is managed under role-based security governance. For development testing, use the pre-seeded account:
              </p>
              <div className="p-3.5 rounded-lg bg-[#0d1410] border border-[#303D35] text-xs font-mono space-y-1.5">
                <div>Email: <span className="text-[#C5F36B] font-semibold">admin@gmu.edu</span></div>
                <div>Password: <span className="text-white font-semibold">Gmu@12345!</span></div>
              </div>
            </div>
            <button
              onClick={() => {
                fillDevCredentials();
                setShowForgotModal(false);
              }}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-[#00A878] text-white hover:bg-[#16865D] transition-colors shadow-sm font-mono tracking-wider uppercase"
            >
              Apply Development Credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
