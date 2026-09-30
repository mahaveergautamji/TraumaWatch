import React, { useState } from 'react';
import { SurvivorProfile, RiskAnalysis } from '../../types';
import { TrajectoryChart } from '../common/TrajectoryChart';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'survivor' | 'counsellor';
  onLoginSuccess: (role: 'survivor' | 'counsellor', username: string) => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'survivor',
  onLoginSuccess,
  onShowToast,
}) => {
  const [role, setRole] = useState<'survivor' | 'counsellor'>(initialRole);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const demoCreds = {
    survivor: { user: 'anon-7731', pass: 'demo123' },
    counsellor: { user: 'counsellor@ngo.demo', pass: 'demo123' },
  };

  const handleFillDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    setUsername(demoCreds[role].user);
    setPassword(demoCreds[role].pass);
    setConsent(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Please accept the consent note to continue.');
      return;
    }
    const expected = demoCreds[role];
    if (username.trim() !== expected.user || password !== expected.pass) {
      setError('Invalid demo credentials. Tap "use demo credentials".');
      return;
    }

    setError('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(role, username.trim());
      onShowToast(`Welcome, ${username.trim()}`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-[840px] bg-white rounded-3xl shadow-2xl border border-[#d9e6e4] overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-in fade-in duration-200">
        {/* Left Editorial Branding Panel */}
        <div className="bg-gradient-to-br from-[#0f3540] via-[#2a7f8f] to-[#6fb59a] text-[#eaf6f3] p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-200 mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Smart India Hackathon Prototype</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-white leading-tight mb-4">
              Welcome back to a calmer check-in
            </h2>
            <ul className="space-y-3 text-sm text-[#d4ede6] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6fb59a] mt-2 shrink-0" />
                <span><strong className="text-white">Private by design:</strong> synthetic IDs only, zero real names.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6fb59a] mt-2 shrink-0" />
                <span><strong className="text-white">Personal baseline:</strong> compared only against your own first week.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6fb59a] mt-2 shrink-0" />
                <span><strong className="text-white">Human review:</strong> a trained counsellor always makes final decisions.</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-white/15 text-xs text-[#a8d3ca]">
            TraumaWatch never diagnoses. AI flags priority for human care.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 md:p-10 bg-white flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-serif font-bold text-[#15303a]">
                Log in
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-[#5a7580] hover:text-[#15303a]"
              >
                Close ✕
              </button>
            </div>

            {/* Role Switcher Tabs */}
            <div className="flex p-1 bg-[#e8f2f0] rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setRole('survivor');
                  setError('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  role === 'survivor'
                    ? 'bg-[#2a7f8f] text-white shadow-xs'
                    : 'text-[#5a7580] hover:text-[#15303a]'
                }`}
              >
                Survivor
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('counsellor');
                  setError('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  role === 'counsellor'
                    ? 'bg-[#2a7f8f] text-white shadow-xs'
                    : 'text-[#5a7580] hover:text-[#15303a]'
                }`}
              >
                Counsellor
              </button>
            </div>

            {/* Inputs */}
            <div>
              <label className="block text-xs font-semibold text-[#5a7580] mb-1">
                Anonymous ID / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === 'survivor' ? 'e.g. anon-7731' : 'e.g. counsellor@ngo.demo'}
                className="w-full text-sm p-3 rounded-xl border border-[#d9e6e4] bg-[#f2f7f6] focus:outline-none focus:ring-2 focus:ring-[#2a7f8f] text-[#15303a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5a7580] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm p-3 rounded-xl border border-[#d9e6e4] bg-[#f2f7f6] focus:outline-none focus:ring-2 focus:ring-[#2a7f8f] text-[#15303a]"
              />
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2 text-xs text-[#5a7580] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded text-[#2a7f8f] focus:ring-[#2a7f8f]"
              />
              <span>
                I consent to share my trend with a trained counsellor only when I choose to.
              </span>
            </label>

            {/* Error Message */}
            {error && (
              <p className="text-xs font-semibold text-[#cf4b4b] animate-shake">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#2a7f8f] hover:bg-[#236b79] text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Verifying securely...' : 'Log in securely'}
            </button>
          </form>

          {/* Demo helper */}
          <div className="pt-4 border-t border-[#d9e6e4] text-center text-xs text-[#5a7580]">
            Prototype login ·{' '}
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[#2a7f8f] font-semibold hover:underline"
            >
              use demo credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
