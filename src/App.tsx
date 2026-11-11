import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { TheProblem } from './components/TheProblem.tsx';
import { SecurityTech } from './components/SecurityTech.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { VerificationPortal } from './components/VerificationPortal.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { Footer } from './components/Footer.tsx';
import { VerificationReportModal } from './components/VerificationReportModal.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { TestLabModal } from './components/TestLabModal.tsx';
import { apiClient } from './services/apiClient.ts';
import { Administrator, VerificationRecord, DocumentRecord } from './types/index.ts';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'verify' | 'admin' | 'test-lab'>('home');
  const [adminUser, setAdminUser] = useState<Administrator | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<VerificationRecord | null>(null);
  const [activeRegisteredDoc, setActiveRegisteredDoc] = useState<Partial<DocumentRecord> | null>(null);
  const [isTestLabOpen, setIsTestLabOpen] = useState(false);

  // Initialize auth state
  useEffect(() => {
    apiClient
      .getMe()
      .then(admin => {
        if (admin) setAdminUser(admin);
      })
      .catch(() => {});
  }, []);

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = async () => {
    await apiClient.logout();
    setAdminUser(null);
    setCurrentView('home');
  };

  const handleLoginSuccess = (admin: Administrator) => {
    setAdminUser(admin);
    setCurrentView('admin');
  };

  const handleVerificationComplete = (
    report: VerificationRecord,
    registeredDoc?: Partial<DocumentRecord> | null
  ) => {
    setActiveReport(report);
    setActiveRegisteredDoc(registeredDoc || null);
  };

  const scrollToVerification = () => {
    const el = document.getElementById('verification-portal');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentView('verify');
    }
  };

  return (
    <div className="min-h-screen bg-[#090810] text-[#F7F3FF] flex flex-col font-sans selection:bg-[#A66BFF]/30 selection:text-white">
      {/* Institutional Admin Dashboard Full View */}
      {currentView === 'admin' && adminUser ? (
        <AdminDashboard
          adminUser={adminUser}
          onLogout={handleLogout}
          onViewPublicPortal={() => setCurrentView('verify')}
        />
      ) : (
        <>
          {/* Main Public Website Layout */}
          <Navbar
            currentView={currentView}
            setCurrentView={view => {
              if (view === 'test-lab') {
                setIsTestLabOpen(true);
              } else if (view === 'admin' && !adminUser) {
                setIsLoginModalOpen(true);
              } else {
                setCurrentView(view);
              }
            }}
            adminUser={adminUser}
            onOpenLogin={handleOpenLogin}
            onLogout={handleLogout}
          />

          <main className="flex-1">
            {currentView === 'home' && (
              <>
                <Hero
                  onVerifyClick={scrollToVerification}
                  onAdminClick={() => {
                    if (adminUser) setCurrentView('admin');
                    else setIsLoginModalOpen(true);
                  }}
                  onTestLabClick={() => setIsTestLabOpen(true)}
                />

                <TheProblem />

                <SecurityTech />

                <HowItWorks />

                <VerificationPortal
                  onVerificationComplete={handleVerificationComplete}
                />

                <FaqSection />
              </>
            )}

            {currentView === 'verify' && (
              <div className="py-8">
                <VerificationPortal
                  onVerificationComplete={handleVerificationComplete}
                />
                <SecurityTech />
              </div>
            )}
          </main>

          <Footer
            onOpenAdmin={() => {
              if (adminUser) setCurrentView('admin');
              else setIsLoginModalOpen(true);
            }}
            onOpenVerify={() => {
              setCurrentView('verify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenTestLab={() => setIsTestLabOpen(true)}
          />
        </>
      )}

      {/* Verification Report Modal */}
      {activeReport && (
        <VerificationReportModal
          report={activeReport}
          registeredDoc={activeRegisteredDoc}
          onClose={() => setActiveReport(null)}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Automated 27-Scenario Security Test Lab Modal */}
      {isTestLabOpen && (
        <TestLabModal onClose={() => setIsTestLabOpen(false)} />
      )}
    </div>
  );
}
