import React, { useState, useEffect } from 'react';
import { X, Wind, Eye, Moon, Play, Pause, RotateCcw, Check } from 'lucide-react';

interface GroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'breathing' | 'sensory' | 'sleep';
}

export const GroundingModal: React.FC<GroundingModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'breathing',
}) => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'sensory' | 'sleep'>(initialTab);

  // Breathing state
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);

  // Sensory checklist state
  const [sensoryChecked, setSensoryChecked] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Breathing timer cycle: 4s inhale -> 7s hold -> 8s exhale
  useEffect(() => {
    if (!isBreathingActive || !isOpen) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        if (phase === 'Inhale') {
          setPhase('Hold');
          return 7;
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          return 8;
        } else {
          setPhase('Inhale');
          setCycleCount((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive, phase, isOpen]);

  const resetBreathing = () => {
    setIsBreathingActive(false);
    setPhase('Inhale');
    setSecondsLeft(4);
    setCycleCount(0);
  };

  const toggleSensoryItem = (key: string) => {
    setSensoryChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-teal-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Grounding & Calming Space
              </h2>
              <p className="text-xs text-slate-500">
                Gentle trauma-informed somatic anchors to restore equilibrium
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetBreathing();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'breathing'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            4-7-8 Calming Breath
          </button>
          <button
            onClick={() => setActiveTab('sensory')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'sensory'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            5-4-3-2-1 Sensory Anchors
          </button>
          <button
            onClick={() => setActiveTab('sleep')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'sleep'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Sleep Wind-Down
          </button>
        </div>

        {/* Tab 1: 4-7-8 Breathing Ring */}
        {activeTab === 'breathing' && (
          <div className="p-6 flex flex-col items-center text-center">
            <p className="text-xs text-slate-600 mb-6 max-w-sm">
              The 4-7-8 cadence activates the parasympathetic vagus nerve, reducing rapid heart rate and physical trembling.
            </p>

            {/* Visual Breathing Ring */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              {/* Animated outer aura */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  phase === 'Inhale'
                    ? 'scale-110 bg-teal-100/70 border-2 border-teal-400'
                    : phase === 'Hold'
                    ? 'scale-110 bg-amber-100/70 border-2 border-amber-400'
                    : 'scale-90 bg-sky-50 border-2 border-sky-300'
                }`}
              />

              {/* Inner Circle */}
              <div className="relative z-10 w-36 h-36 rounded-full bg-white shadow-md flex flex-col items-center justify-center p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {phase}
                </span>
                <span className="text-4xl font-bold font-mono text-slate-800 my-1 tabular-nums">
                  {secondsLeft}
                </span>
                <span className="text-[11px] text-slate-500">
                  {phase === 'Inhale' && 'Breathe gently in'}
                  {phase === 'Hold' && 'Gently hold tension'}
                  {phase === 'Exhale' && 'Slow release out'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm ${
                  isBreathingActive
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                {isBreathingActive ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Rhythm
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Start Paced Breathing
                  </>
                )}
              </button>

              <button
                onClick={resetBreathing}
                title="Reset timer"
                className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Completed cycles: <span className="font-semibold text-slate-700">{cycleCount}</span> · Recommended: 4 cycles
            </p>
          </div>
        )}

        {/* Tab 2: 5-4-3-2-1 Sensory Grounding */}
        {activeTab === 'sensory' && (
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-slate-600">
              When trauma memories flood in, your nervous system confuses the past with the present. Grounding brings your brain back to right now.
            </p>

            <div className="space-y-3">
              {[
                {
                  id: 's5',
                  num: '5',
                  title: '5 Things you can SEE right now',
                  desc: 'Look around and notice small visual details: the texture of the floor, a patch of light, a chair leg.',
                },
                {
                  id: 's4',
                  num: '4',
                  title: '4 Things you can physically TOUCH',
                  desc: 'Feel the fabric of your clothes, the coolness of a tabletop, your feet pressing firmly on the floor.',
                },
                {
                  id: 's3',
                  num: '3',
                  title: '3 Things you can HEAR',
                  desc: 'Listen for distant traffic, a ceiling fan humming, your own steady breath.',
                },
                {
                  id: 's2',
                  num: '2',
                  title: '2 Things you can SMELL',
                  desc: 'Notice morning tea, soap on your hands, fresh outdoor air or rain.',
                },
                {
                  id: 's1',
                  num: '1',
                  title: '1 Thing you can TASTE',
                  desc: 'Take a sip of cool clean water or notice the clean taste in your mouth.',
                },
              ].map((item) => {
                const isChecked = !!sensoryChecked[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSensoryItem(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-teal-50/50 border-teal-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                        isChecked
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5" /> : item.num}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-slate-800">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Sleep Wind-Down */}
        {activeTab === 'sleep' && (
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-slate-600">
              Trauma can make bedtime feel unsafe because vigilance drops. Gentle physical cues teach your body that this room is secure.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  1. The "Physical Anchor" Technique
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Place a heavy blanket or pillow across your chest or lap for 10 minutes before lying down. Proprioceptive deep pressure calms the amygdala.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  2. 20-Minute "No-Judgment" Rule
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  If sleep doesn't come after 20 minutes, don't battle the bed. Gently stand up, wrap yourself in warmth, sit in a dimly lit corner, and drink water until your eyelids naturally soften.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  3. Gentle Night-Light Safety
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Total pitch black can cause disorientation upon sudden waking. A soft amber or warm nightlight allows your eyes to immediately verify your present safe surroundings.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  4. Evening Thought Parking Lot
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Jot down unresolved worries on a scrap of paper and physically fold it away in a drawer. Tell yourself: "These are saved for tomorrow; tonight is for restoration."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Take whatever pace feels safe for you.
          </span>
          <button
            onClick={() => {
              resetBreathing();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
