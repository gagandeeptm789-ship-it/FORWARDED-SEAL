import React, { useState } from 'react';
import { ShieldCheck, LogOut, ArrowUpRight, Menu, X, Shield } from 'lucide-react';
import { Administrator } from '../types/index.ts';

interface NavbarProps {
  currentView: 'home' | 'verify' | 'admin' | 'test-lab';
  setCurrentView: (view: 'home' | 'verify' | 'admin' | 'test-lab') => void;
  adminUser: Administrator | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  adminUser,
  onOpenLogin,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#090810]/85 backdrop-blur-md border-b border-[#302440] px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        
        {/* Brand Wordmark & Emblem */}
        <button
          onClick={() => {
            setCurrentView('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 text-left group whitespace-nowrap shrink-0 transition-opacity hover:opacity-90 cursor-pointer"
        >
          {/* Violet Forensic Emblem */}
          <div className="relative w-9 h-9 rounded-lg bg-[#171321] border border-[#302440] flex items-center justify-center shadow-xs overflow-hidden group-hover:border-[#A66BFF]/60 transition-colors">
            <Shield className="w-4 h-4 text-[#A66BFF] stroke-[2.2] transition-transform group-hover:scale-110 duration-300" />
            <div className="absolute inset-0 bg-radial from-[#A66BFF]/20 to-transparent pointer-events-none" />
          </div>

          <div>
            <div className="font-display text-sm sm:text-base font-bold tracking-tight text-[#F7F3FF] flex items-center gap-1.5">
              <span>THE FORWARDED SEAL</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-[#A66BFF] block -mt-0.5">
              DIGITAL TRUST INFRASTRUCTURE
            </span>
          </div>
        </button>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#AAA1B8]">
          <button
            onClick={() => setCurrentView('home')}
            className={`transition-colors whitespace-nowrap hover:text-[#F7F3FF] cursor-pointer py-1 relative ${
              currentView === 'home' ? 'text-[#F7F3FF] font-semibold' : ''
            }`}
          >
            <span>Platform</span>
            {currentView === 'home' && (
              <span className="absolute -bottom-3.5 left-0 right-0 h-[2px] bg-[#A66BFF] rounded-full shadow-[0_0_8px_#A66BFF]" />
            )}
          </button>
          
          <a
            href="#how-it-works"
            onClick={e => {
              if (currentView !== 'home') setCurrentView('home');
            }}
            className="hover:text-[#F7F3FF] transition-colors whitespace-nowrap cursor-pointer py-1"
          >
            How It Works
          </a>

          <a
            href="#technology"
            onClick={e => {
              if (currentView !== 'home') setCurrentView('home');
            }}
            className="hover:text-[#F7F3FF] transition-colors whitespace-nowrap cursor-pointer py-1"
          >
            Technology
          </a>

          <button
            onClick={() => setCurrentView('verify')}
            className={`transition-colors whitespace-nowrap hover:text-[#F7F3FF] cursor-pointer py-1 relative ${
              currentView === 'verify' ? 'text-[#F7F3FF] font-semibold' : ''
            }`}
          >
            <span>Verify Notice</span>
            {currentView === 'verify' && (
              <span className="absolute -bottom-3.5 left-0 right-0 h-[2px] bg-[#A66BFF] rounded-full shadow-[0_0_8px_#A66BFF]" />
            )}
          </button>

          <button
            onClick={() => setCurrentView('test-lab')}
            className={`transition-colors whitespace-nowrap hover:text-[#F7F3FF] cursor-pointer py-1 flex items-center gap-1.5 relative ${
              currentView === 'test-lab' ? 'text-[#F7F3FF] font-semibold' : ''
            }`}
          >
            <span>Security Lab</span>
            <span className="font-mono text-[10px] text-[#A66BFF] px-1.5 py-0.5 rounded bg-[#21182F] border border-[#302440]">
              27
            </span>
            {currentView === 'test-lab' && (
              <span className="absolute -bottom-3.5 left-0 right-0 h-[2px] bg-[#A66BFF] rounded-full shadow-[0_0_8px_#A66BFF]" />
            )}
          </button>
        </nav>

        {/* Action Controls & Admin Portal */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {adminUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-[#21182F] text-[#D5B8FF] border-[#A66BFF]/50 shadow-[0_0_12px_rgba(166,107,255,0.25)]'
                    : 'bg-[#171321] border-[#302440] text-[#F7F3FF] hover:border-[#A66BFF]/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#A66BFF]" />
                <span>Admin Portal</span>
              </button>
              <button
                onClick={onLogout}
                title="Sign out of administrator session"
                className="p-2 text-[#AAA1B8] hover:text-[#EF4444] rounded-lg hover:bg-[#171321] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs font-semibold text-[#F7F3FF] bg-[#21182F] hover:bg-[#A66BFF] hover:text-[#090810] border border-[#302440] hover:border-[#A66BFF] rounded-lg transition-all shadow-xs whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer group"
            >
              <span>Admin Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A66BFF] group-hover:text-[#090810] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#AAA1B8] hover:text-[#F7F3FF] rounded-lg hover:bg-[#171321]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-[#302440] mt-3 space-y-2 text-xs font-medium text-[#AAA1B8]">
          <button
            onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded hover:bg-[#171321] text-[#F7F3FF]"
          >
            Platform
          </button>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 rounded hover:bg-[#171321] text-[#F7F3FF]"
          >
            How It Works
          </a>
          <a
            href="#technology"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 rounded hover:bg-[#171321] text-[#F7F3FF]"
          >
            Technology
          </a>
          <button
            onClick={() => { setCurrentView('verify'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded hover:bg-[#171321] text-[#F7F3FF]"
          >
            Verify Notice
          </button>
          <button
            onClick={() => { setCurrentView('test-lab'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded hover:bg-[#171321] text-[#A66BFF] flex items-center justify-between"
          >
            <span>Security Lab</span>
            <span className="font-mono text-[10px] bg-[#21182F] px-1.5 py-0.5 rounded">27 Tests</span>
          </button>
          <div className="pt-2 border-t border-[#302440]">
            <button
              onClick={() => {
                if (adminUser) setCurrentView('admin');
                else onOpenLogin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-lg bg-[#A66BFF] text-[#090810] font-bold text-center font-mono uppercase"
            >
              {adminUser ? 'Open Admin Portal' : 'Institutional Admin Portal'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
