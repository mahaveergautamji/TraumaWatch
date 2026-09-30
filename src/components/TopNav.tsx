import React from 'react';
import { ShieldCheck, LogIn, LogOut, HeartHandshake, UserCheck } from 'lucide-react';
import { SurvivorProfile } from '../types';

interface TopNavProps {
  currentView: 'home' | 'survivor' | 'counsellor';
  onViewChange: (view: 'home' | 'survivor' | 'counsellor') => void;
  currentUser: string | null;
  onOpenLogin: (role?: 'survivor' | 'counsellor') => void;
  onLogout: () => void;
  survivors: SurvivorProfile[];
  activeSurvivorId: string;
  onSelectSurvivor: (id: string) => void;
  onOpenEthicsModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onViewChange,
  currentUser,
  onOpenLogin,
  onLogout,
  survivors,
  activeSurvivorId,
  onSelectSurvivor,
  onOpenEthicsModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#f2f7f6]/85 backdrop-blur-md border-b border-[#d9e6e4] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onViewChange('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-5 h-5 rounded-full rounded-br-sm bg-gradient-to-br from-[#2a7f8f] to-[#6fb59a] shadow-xs group-hover:scale-105 transition-transform" />
          <span className="font-serif text-lg font-bold text-[#15303a] tracking-tight group-hover:text-[#2a7f8f] transition-colors">
            TraumaWatch
          </span>
        </div>

        {/* Home Navigation Anchor Links (when on home) */}
        {currentView === 'home' && (
          <nav className="hidden md:flex items-center gap-6 text-xs text-[#5a7580]">
            <a href="#how" className="hover:text-[#2a7f8f] transition-colors">How it works</a>
            <a href="#about" className="hover:text-[#2a7f8f] transition-colors">Why early signals</a>
            <a href="#features" className="hover:text-[#2a7f8f] transition-colors">Features</a>
            <a href="#model" className="hover:text-[#2a7f8f] transition-colors">Risk model</a>
            <a href="#privacy" className="hover:text-[#2a7f8f] transition-colors">Privacy</a>
            <a href="#faq" className="hover:text-[#2a7f8f] transition-colors">FAQ</a>
          </nav>
        )}

        {/* App Switcher when inside App Views */}
        {currentView !== 'home' && (
          <div className="flex items-center gap-3">
            <div className="flex p-0.5 bg-[#e8f2f0] rounded-full border border-[#d9e6e4]/60">
              <button
                onClick={() => onViewChange('survivor')}
                className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
                  currentView === 'survivor'
                    ? 'bg-white text-[#15303a] shadow-xs'
                    : 'text-[#5a7580] hover:text-[#15303a]'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-[#2a7f8f]" />
                <span>Survivor App</span>
              </button>
              <button
                onClick={() => onViewChange('counsellor')}
                className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
                  currentView === 'counsellor'
                    ? 'bg-white text-[#15303a] shadow-xs'
                    : 'text-[#5a7580] hover:text-[#15303a]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#15303a]" />
                <span>Counsellor Dashboard</span>
              </button>
            </div>

            {/* Case Picker for demoing */}
            <div className="hidden lg:flex items-center gap-1 text-xs text-[#5a7580] bg-white border border-[#d9e6e4] rounded-full px-2.5 py-1">
              <span className="text-[#5a7580]/70">Case:</span>
              <select
                value={activeSurvivorId}
                onChange={(e) => onSelectSurvivor(e.target.value)}
                className="bg-transparent font-semibold text-[#15303a] focus:outline-none cursor-pointer pr-1"
              >
                {survivors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} {s.id === 'S-104' ? '· Rapid Spike' : s.id === 'S-087' ? '· Sleep Rise' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-mono text-[#5a7580] bg-[#e8f2f0] px-2 py-0.5 rounded-md">
                {currentUser}
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-medium text-[#15303a] bg-white border border-[#d9e6e4] hover:bg-[#e8f2f0] rounded-xl transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-[#5a7580]" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenLogin('survivor')}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#2a7f8f] hover:bg-[#236b79] rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log in</span>
            </button>
          )}

          {/* Ethics / Safeguards Trigger */}
          <button
            onClick={onOpenEthicsModal}
            title="Read clinical safeguards"
            className="p-1.5 text-[#5a7580] hover:text-[#2a7f8f] hover:bg-[#e8f2f0] rounded-xl transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
