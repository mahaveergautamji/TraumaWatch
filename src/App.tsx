import React, { useState, useEffect, useMemo } from 'react';
import { TopNav } from './components/TopNav';
import { Footer } from './components/Footer';
import { SurvivorView } from './components/survivor/SurvivorView';
import { CounsellorDashboard } from './components/counsellor/CounsellorDashboard';
import { LandingView } from './components/home/LandingView';
import { EthicsModal } from './components/modals/EthicsModal';
import { GroundingModal } from './components/modals/GroundingModal';
import { CounsellorContactModal } from './components/modals/CounsellorContactModal';
import { AuthModal } from './components/modals/AuthModal';
import { INITIAL_SURVIVORS } from './data/syntheticData';
import { SurvivorProfile, CheckInEntry, ClinicalNote, ClinicalGoal } from './types';
import { analyzeTrajectory } from './utils/riskEngine';
import { CheckCircle2, X } from 'lucide-react';

const STORAGE_KEY = 'traumawatch_survivors_state_v1';

export default function App() {
  // Load state from localStorage or initialize with synthetic data
  const [survivors, setSurvivors] = useState<SurvivorProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_SURVIVORS;
  });

  // Current view: 'home' | 'survivor' | 'counsellor'
  const [currentView, setCurrentView] = useState<'home' | 'survivor' | 'counsellor'>('home');

  // Authentication state
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [, setUserRole] = useState<'survivor' | 'counsellor' | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialRole, setAuthInitialRole] = useState<'survivor' | 'counsellor'>('survivor');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Currently active survivor profile ID (default to S-104 for demonstration of rapid deterioration)
  const [activeSurvivorId, setActiveSurvivorId] = useState<string>('S-104');

  // Phone frame simulation toggle for Survivor App
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(false);

  // Modals state
  const [isEthicsModalOpen, setIsEthicsModalOpen] = useState<boolean>(false);
  const [isGroundingModalOpen, setIsGroundingModalOpen] = useState<boolean>(false);
  const [groundingTab, setGroundingTab] = useState<'breathing' | 'sensory' | 'sleep'>('breathing');
  const [isCounsellorContactOpen, setIsCounsellorContactOpen] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(survivors));
    } catch {
      // Ignore write errors
    }
  }, [survivors]);

  // Toast auto-dismiss timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Precomputed cases for LandingView and Dashboard
  const survivorCases = useMemo(() => {
    return survivors.map((s) => ({
      profile: s,
      analysis: analyzeTrajectory(s.history),
    }));
  }, [survivors]);

  // Active Survivor Profile
  const activeProfile =
    survivors.find((s) => s.id === activeSurvivorId) || survivors[0];

  // Handler: Update Check-In (e.g. Survivor logs or retakes today's entry)
  const handleUpdateCheckIn = (survivorId: string, entry: CheckInEntry) => {
    setSurvivors((prev) =>
      prev.map((s) => {
        if (s.id !== survivorId) return s;

        const updatedHistory = [...s.history];
        const lastIndex = updatedHistory.length - 1;

        if (lastIndex >= 0 && updatedHistory[lastIndex].day === entry.day) {
          // Replace today's entry
          updatedHistory[lastIndex] = entry;
        } else {
          // Append new entry
          updatedHistory.push(entry);
        }

        return {
          ...s,
          history: updatedHistory,
        };
      })
    );
    setToastMessage('Daily check-in logged. Trajectory recalculated.');
  };

  // Handler: Mark Case as Reviewed
  const handleMarkReviewed = (survivorId: string) => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setSurvivors((prev) =>
      prev.map((s) => {
        if (s.id !== survivorId) return s;
        const newStatus = !s.isReviewed;
        return {
          ...s,
          isReviewed: newStatus,
          reviewedAt: newStatus ? formatted : undefined,
          reviewedBy: newStatus ? 'Dr. Ananya Rao' : undefined,
        };
      })
    );
    setToastMessage(`Case ${survivorId} marked as reviewed`);
  };

  // Handler: Toggle Case Escalation
  const handleToggleEscalation = (survivorId: string) => {
    setSurvivors((prev) =>
      prev.map((s) => {
        if (s.id !== survivorId) return s;
        const newEsc = !s.isEscalated;
        return {
          ...s,
          isEscalated: newEsc,
        };
      })
    );
    const target = survivors.find((s) => s.id === survivorId);
    setToastMessage(
      target?.isEscalated
        ? `Case ${survivorId} de-escalated to standard review`
        : `Case ${survivorId} escalated for priority multidisciplinary review`
    );
  };

  // Handler: Add Clinical Note
  const handleAddNote = (
    survivorId: string,
    noteData: Omit<ClinicalNote, 'id' | 'timestamp'>
  ) => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newNote: ClinicalNote = {
      id: `cn-${Date.now()}`,
      timestamp: formatted,
      ...noteData,
    };

    setSurvivors((prev) =>
      prev.map((s) => {
        if (s.id !== survivorId) return s;
        return {
          ...s,
          clinicalNotes: [newNote, ...s.clinicalNotes],
        };
      })
    );
    setToastMessage('Clinical note added to case record');
  };

  // Handler: Add Clinical Goal
  const handleAddGoal = (
    survivorId: string,
    goalData: Omit<ClinicalGoal, 'id' | 'createdAt'>
  ) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newGoal: ClinicalGoal = {
      id: `cg-${Date.now()}`,
      createdAt: formattedDate,
      ...goalData,
    };

    setSurvivors((prev) =>
      prev.map((s) => {
        if (s.id !== survivorId) return s;
        return {
          ...s,
          clinicalGoals: [newGoal, ...(s.clinicalGoals || [])],
        };
      })
    );
    setToastMessage(`New clinical objective set for ${survivorId}`);
  };

  // Handler: Update Clinical Goal
  const handleUpdateGoal = (
    survivorId: string,
    goalId: string,
    updates: Partial<ClinicalGoal>
  ) => {
    setSurvivors((prev) =>
      prev.map((s) => {
        if (s.id !== survivorId) return s;
        return {
          ...s,
          clinicalGoals: (s.clinicalGoals || []).map((g) =>
            g.id === goalId ? { ...g, ...updates } : g
          ),
        };
      })
    );
  };

  // Handler: Delete Clinical Goal
  const handleDeleteGoal = (survivorId: string, goalId: string) => {
    setSurvivors((prev) =>
      prev.map((s) => {
        if (s.id !== survivorId) return s;
        return {
          ...s,
          clinicalGoals: (s.clinicalGoals || []).filter((g) => g.id !== goalId),
        };
      })
    );
    setToastMessage('Clinical goal removed');
  };

  // Handler: Switch directly from Counsellor view into the Survivor App for a specific case
  const handleSwitchToSurvivorApp = (survivorId: string) => {
    setActiveSurvivorId(survivorId);
    setCurrentView('survivor');
  };

  // Handler: Open Login modal
  const handleOpenLogin = (role: 'survivor' | 'counsellor' = 'survivor') => {
    setAuthInitialRole(role);
    setIsAuthModalOpen(true);
  };

  // Handler: Successful Login
  const handleLoginSuccess = (role: 'survivor' | 'counsellor', username: string) => {
    setCurrentUser(username);
    setUserRole(role);
    if (role === 'survivor') {
      setCurrentView('survivor');
    } else {
      setCurrentView('counsellor');
    }
  };

  // Handler: Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
    setToastMessage('Signed out');
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('Reset all demo check-in data and clinical notes to initial state?')) {
      localStorage.removeItem(STORAGE_KEY);
      setSurvivors(INITIAL_SURVIVORS);
      setActiveSurvivorId('S-104');
      setToastMessage('Synthetic cohort reset to initial state');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#15303a]">
      {/* Top Bar Navigation */}
      <TopNav
        currentView={currentView}
        onViewChange={setCurrentView}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        survivors={survivors}
        activeSurvivorId={activeSurvivorId}
        onSelectSurvivor={setActiveSurvivorId}
        onOpenEthicsModal={() => setIsEthicsModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <LandingView
            survivorCases={survivorCases}
            onOpenSurvivorApp={() => setCurrentView('survivor')}
            onOpenCounsellorDashboard={() => setCurrentView('counsellor')}
            onOpenLogin={handleOpenLogin}
          />
        )}

        {currentView === 'survivor' && (
          <SurvivorView
            profile={activeProfile}
            onUpdateCheckIn={handleUpdateCheckIn}
            onOpenGrounding={(tab) => {
              if (tab) setGroundingTab(tab);
              setIsGroundingModalOpen(true);
            }}
            onOpenCounsellorContact={() => setIsCounsellorContactOpen(true)}
            phoneFrameMode={phoneFrameMode}
          />
        )}

        {currentView === 'counsellor' && (
          <CounsellorDashboard
            survivors={survivors}
            selectedSurvivorId={activeSurvivorId}
            onSelectSurvivor={setActiveSurvivorId}
            onMarkReviewed={handleMarkReviewed}
            onToggleEscalation={handleToggleEscalation}
            onAddNote={handleAddNote}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onSwitchToSurvivorApp={handleSwitchToSurvivorApp}
          />
        )}
      </main>

      {/* Footer with Mandated Disclaimers */}
      <Footer onOpenEthicsModal={() => setIsEthicsModalOpen(true)} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-[#15303a] text-white rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#6fb59a] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modals */}
      <EthicsModal
        isOpen={isEthicsModalOpen}
        onClose={() => setIsEthicsModalOpen(false)}
      />

      <GroundingModal
        isOpen={isGroundingModalOpen}
        onClose={() => setIsGroundingModalOpen(false)}
        initialTab={groundingTab}
      />

      <CounsellorContactModal
        isOpen={isCounsellorContactOpen}
        onClose={() => setIsCounsellorContactOpen(false)}
        assignedCounsellor={activeProfile.assignedCounsellor}
        survivorId={activeProfile.id}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authInitialRole}
        onLoginSuccess={handleLoginSuccess}
        onShowToast={(msg) => setToastMessage(msg)}
      />
    </div>
  );
}
