import React from 'react';
import { X, ShieldAlert, Cpu, HeartHandshake, Lock, Compass, CheckCircle2 } from 'lucide-react';

interface EthicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EthicsModal: React.FC<EthicsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                TraumaWatch: Clinical Framing & Ethical Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Guiding principles for Smart India Hackathon prototype
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Key Principle 1: Trajectory != Diagnosis */}
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                1. Trajectory Detection vs. Clinical Diagnosis
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                TraumaWatch <strong className="text-slate-800">never diagnoses PTSD, depression, or psychiatric disorders</strong>. Following traumatic events or civil atrocities, distress, hypervigilance, and grief are understandable human responses, not automatic pathology. Instead of assigning a diagnostic label, TraumaWatch detects <span className="font-medium text-teal-800">rate-of-change ($\Delta$ slope)</span> in an individual’s self-reported equilibrium. It exists solely to flag when a human counsellor should check in.
              </p>
            </div>
          </div>

          {/* Key Principle 2: Personalized Baseline */}
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                2. Individual Baseline Calibration vs. Population Norms
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard screening tools (e.g. PHQ-9, PCL-5) judge survivors against arbitrary national civilian averages, triggering perpetual false alarms for survivors with elevated baseline tension. TraumaWatch calibrates against <strong className="text-slate-800">the individual survivor's first 7–10 days</strong>. If a person naturally lives with a tension score of 2/4, they are only flagged if their own score climbs to 3.5/4 or exhibits sudden acute volatility.
              </p>
            </div>
          </div>

          {/* Key Principle 3: Explainability / SHAP */}
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                3. Explainable Triage (SHAP-Style Feature Attribution)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Black-box algorithms erode clinical trust. When a survivor case is escalated, the Counsellor Dashboard displays an exact attribution breakdown: e.g. <em className="text-slate-800 font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">Sleep Disturbance (+38%)</em>, <em className="text-slate-800 font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">Intrusive Flashbacks (+29%)</em>. The counsellor instantly grasps the driving physiological or somatic trigger before opening dialogue.
              </p>
            </div>
          </div>

          {/* Key Principle 4: Human-in-the-Loop */}
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mt-0.5">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                4. Absolute Human-in-the-Loop Supremacy
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated triage algorithms must never automate clinical discharge, medication suggestions, or compulsory confinement. The system acts as a prioritisation sieve for overburdened field psychologists and community health workers (ASHAs/ANMs).
              </p>
            </div>
          </div>

          {/* Key Principle 5: Privacy by Design */}
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                5. Privacy-by-Design & Zero Real PII
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All records use synthetic pseudo-identifiers (e.g. <span className="font-mono text-xs font-semibold">S-104</span>, <span className="font-mono text-xs font-semibold">S-087</span>). All computations in this prototype run strictly client-side. Free-text reflections remain private to the survivor’s device unless explicitly released with informed consent.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Smart India Hackathon · HealthTech & Survivor Support Domain
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
