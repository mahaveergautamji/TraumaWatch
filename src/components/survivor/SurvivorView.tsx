import React, { useState } from 'react';
import {
  Heart,
  Moon,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  Wind,
  PhoneCall,
  Calendar,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { CheckInEntry, SurvivorProfile } from '../../types';
import { analyzeTrajectory } from '../../utils/riskEngine';
import { TrajectoryChart } from '../common/TrajectoryChart';
import { PeerSupportSection } from './PeerSupportSection';

interface SurvivorViewProps {
  profile: SurvivorProfile;
  onUpdateCheckIn: (survivorId: string, entry: CheckInEntry) => void;
  onOpenGrounding: (tab?: 'breathing' | 'sensory' | 'sleep') => void;
  onOpenCounsellorContact: () => void;
  phoneFrameMode?: boolean;
}

export const SurvivorView: React.FC<SurvivorViewProps> = ({
  profile,
  onUpdateCheckIn,
  onOpenGrounding,
  onOpenCounsellorContact,
}) => {
  const [tab, setTab] = useState<'ci' | 'tr' | 'peer'>('ci');
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [optionalNote, setOptionalNote] = useState<string>('');
  const [hasFinishedToday, setHasFinishedToday] = useState<boolean>(false);

  // Analyze longitudinal trend
  const analysis = analyzeTrajectory(profile.history);

  const questions = [
    {
      q: 'How low or heavy has your mood felt today?',
      labels: ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much'],
    },
    {
      q: 'How poor was your sleep last night?',
      labels: ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much'],
    },
    {
      q: 'How on edge or unable to relax have you felt?',
      labels: ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much'],
    },
    {
      q: 'Did you avoid people you would normally see?',
      labels: ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much'],
    },
    {
      q: 'Have unwanted memories come back today?',
      labels: ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much'],
    },
  ];

  const handlePick = (score: number) => {
    const updated = [...answers];
    updated[step] = score;
    setAnswers(updated);
    setStep(step + 1);
  };

  const handleFinish = () => {
    const updatedEntry: CheckInEntry = {
      day: 28,
      date: 'Today',
      mood: answers[0] ?? 1,
      sleep: answers[1] ?? 1,
      tension: answers[2] ?? 1,
      withdrawal: answers[3] ?? 0,
      intrusions: answers[4] ?? 0,
      note: optionalNote.trim() || undefined,
    };
    onUpdateCheckIn(profile.id, updatedEntry);
    setHasFinishedToday(true);
    setTab('tr');
  };

  const currentDominant = analysis.contributions[0]?.label.toLowerCase() || 'distress';
  const statusMessage =
    analysis.tier === 'Low'
      ? 'Your check-ins are steady compared with your own usual. Keep doing what helps.'
      : analysis.tier === 'Moderate'
      ? `Your check-ins show rising ${currentDominant} this week. It might help to slow down and look after yourself.`
      : 'The last few days have felt heavier than your usual. You do not have to carry this alone.';

  return (
    <div className={`${tab === 'peer' ? 'max-w-[560px]' : 'max-w-[440px]'} mx-auto py-4 px-3 sm:px-0 transition-all duration-200`}>
      {/* Top Segmented Sub-Nav: Daily check-in vs My Trend vs Peer Support */}
      <div className="flex gap-1.5 p-1 bg-[#e8f2f0] rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setTab('ci')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            tab === 'ci'
              ? 'bg-[#2a7f8f] text-white shadow-xs'
              : 'text-[#5a7580] hover:text-[#15303a]'
          }`}
        >
          Daily check-in
        </button>
        <button
          type="button"
          onClick={() => setTab('tr')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            tab === 'tr'
              ? 'bg-[#2a7f8f] text-white shadow-xs'
              : 'text-[#5a7580] hover:text-[#15303a]'
          }`}
        >
          My Trend
        </button>
        <button
          type="button"
          onClick={() => setTab('peer')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            tab === 'peer'
              ? 'bg-[#2a7f8f] text-white shadow-xs'
              : 'text-[#5a7580] hover:text-[#15303a]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Peer Support</span>
        </button>
      </div>

      {/* Card Content */}
      <div className="bg-white rounded-2xl border border-[#d9e6e4] p-5 sm:p-6 shadow-md shadow-[#1a4a55]/5">
        {tab === 'ci' ? (
          <div>
            {step < 5 ? (
              <div>
                {/* 5-dot Progress Bar */}
                <div className="flex gap-1.5 mb-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <i
                      key={i}
                      className={`flex-1 h-1.5 rounded-full transition-colors ${
                        i <= step ? 'bg-[#6fb59a]' : 'bg-[#d9e6e4]'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#5a7580] mb-2">
                  <span>Question {step + 1} of 5</span>
                  <span>takes ~30 seconds</span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#15303a] leading-snug mb-5">
                  {questions[step].q}
                </h3>

                {/* 5 Vertical Options */}
                <div className="space-y-2">
                  {questions[step].labels.map((label, score) => (
                    <button
                      key={score}
                      onClick={() => handlePick(score)}
                      className="w-full text-left p-3.5 rounded-xl bg-[#e8f2f0] hover:bg-[#dbece9] border border-transparent hover:border-[#6fb59a] text-[#15303a] text-sm font-medium flex items-center justify-between transition-all group"
                    >
                      <span>{label}</span>
                      <small className="text-[#5a7580] font-mono text-xs group-hover:text-[#15303a]">
                        {score}
                      </small>
                    </button>
                  ))}
                </div>

                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="mt-4 inline-flex items-center gap-1 text-xs text-[#5a7580] hover:text-[#15303a]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to previous
                  </button>
                )}
              </div>
            ) : !hasFinishedToday ? (
              <div>
                <div className="flex gap-1.5 mb-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <i key={i} className="flex-1 h-1.5 rounded-full bg-[#6fb59a]" />
                  ))}
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#15303a] mb-2">
                  Anything else on your mind today?
                </h3>
                <p className="text-xs text-[#5a7580] mb-3">
                  Optional. Stays encrypted on this device unless you choose to share.
                </p>

                <textarea
                  value={optionalNote}
                  onChange={(e) => setOptionalNote(e.target.value)}
                  placeholder="e.g. Felt a bit jumpy around the roadworks this morning..."
                  rows={3}
                  className="w-full text-sm p-3 rounded-xl border border-[#d9e6e4] bg-[#f2f7f6] focus:outline-none focus:ring-2 focus:ring-[#2a7f8f] text-[#15303a] placeholder:text-[#5a7580]/60 resize-none"
                />

                <div className="space-y-2 mt-4">
                  <button
                    onClick={handleFinish}
                    className="w-full py-3 bg-[#2a7f8f] hover:bg-[#236b79] text-white font-medium text-sm rounded-xl transition-all shadow-sm"
                  >
                    Finish check-in
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="w-full py-2.5 text-xs text-[#5a7580] hover:text-[#15303a] rounded-xl"
                  >
                    Back to questions
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#3f9d78]/15 text-[#3f9d78] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#15303a]">
                  Thank you for checking in.
                </h3>
                <p className="text-xs text-[#5a7580] max-w-xs mx-auto leading-relaxed">
                  Your entry is securely registered against your private 28-day baseline.
                </p>
                <button
                  onClick={() => setTab('tr')}
                  className="px-6 py-2.5 bg-[#2a7f8f] hover:bg-[#236b79] text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  See My Trend
                </button>
              </div>
            )}
          </div>
        ) : tab === 'tr' ? (
          /* MY TREND TAB */
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#15303a]">
                My Trend
              </h3>
              <p className="text-xs text-[#5a7580] mt-0.5">
                Last 28 days · compared only with your own first week
                {hasFinishedToday ? ' (updated today)' : ''}
              </p>
            </div>

            {/* SVG Trajectory Chart */}
            <div className="py-2">
              <TrajectoryChart
                history={profile.history}
                baselineMean={analysis.baselineMean}
                showColorBands={false}
                height={210}
              />
            </div>

            {/* Warm Status Notice (Non-diagnostic) */}
            <div
              className={`p-3.5 rounded-xl text-xs leading-relaxed border-l-4 ${
                analysis.tier === 'High'
                  ? 'bg-[#e8f2f0] border-[#cf4b4b] text-[#15303a]'
                  : analysis.tier === 'Moderate'
                  ? 'bg-[#e8f2f0] border-[#e07a3f] text-[#15303a]'
                  : 'bg-[#e8f2f0] border-[#6fb59a] text-[#15303a]'
              }`}
            >
              <p className="font-medium">{statusMessage}</p>
              <div className="text-[11px] text-[#5a7580] mt-1.5">
                This is an early-warning pattern, not a clinical diagnosis.
              </div>
            </div>

            {/* Suggested Calm Actions */}
            <div className="grid gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenGrounding('breathing')}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#f2f7f6] border border-[#d9e6e4] text-[#15303a] text-xs font-medium transition-colors text-center cursor-pointer"
              >
                Try a grounding exercise
              </button>
              <button
                type="button"
                onClick={() => onOpenGrounding('sleep')}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#f2f7f6] border border-[#d9e6e4] text-[#15303a] text-xs font-medium transition-colors text-center cursor-pointer"
              >
                Sleep wind-down tips
              </button>
              <button
                type="button"
                onClick={() => setTab('peer')}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#f2f7f6] border border-[#d9e6e4] text-[#15303a] text-xs font-medium transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-[#2a7f8f]" />
                <span>Join anonymous peer support circles</span>
              </button>
              <button
                type="button"
                onClick={onOpenCounsellorContact}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2a7f8f] hover:bg-[#236b79] text-white text-xs font-medium transition-colors text-center shadow-xs cursor-pointer"
              >
                Talk to a counsellor
              </button>
            </div>

            {/* Retake Callout */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep(0);
                  setHasFinishedToday(false);
                  setTab('ci');
                }}
                className="text-xs text-[#5a7580] hover:text-[#2a7f8f] underline underline-offset-2 cursor-pointer"
              >
                Retake daily check-in
              </button>
            </div>
          </div>
        ) : (
          <PeerSupportSection
            onOpenGrounding={onOpenGrounding}
            onOpenCounsellorContact={onOpenCounsellorContact}
          />
        )}
      </div>
    </div>
  );
};
