import React, { useState } from 'react';
import { EarlyWarningPrediction } from '../../types';
import {
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  PhoneCall,
  Activity,
  Sparkles,
} from 'lucide-react';

interface EarlyWarningAlertProps {
  earlyWarning: EarlyWarningPrediction;
  survivorId: string;
  onTriggerOutreach?: () => void;
}

export const EarlyWarningAlert: React.FC<EarlyWarningAlertProps> = ({
  earlyWarning,
  survivorId,
  onTriggerOutreach,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const {
    isTriggered,
    spikeProbability,
    warningLevel,
    timeframe,
    baselineDivergenceZScore,
    precursorFactors,
    recommendedIntervention,
    confidenceScore,
    consecutiveEscalationDays,
  } = earlyWarning;

  // Determine color scheme based on warning level
  const isHigh = warningLevel === 'High';
  const isModerate = warningLevel === 'Moderate';
  const isLow = warningLevel === 'Low';

  const theme = isHigh
    ? {
        bg: 'bg-rose-50/80',
        border: 'border-rose-300',
        textTitle: 'text-rose-950',
        badge: 'bg-rose-600 text-white',
        bar: 'bg-rose-600',
        lightBar: 'bg-rose-100',
        iconColor: 'text-rose-600',
        pill: 'bg-rose-100 text-rose-900 border-rose-200',
      }
    : isModerate
    ? {
        bg: 'bg-amber-50/80',
        border: 'border-amber-300',
        textTitle: 'text-amber-950',
        badge: 'bg-amber-600 text-white',
        bar: 'bg-amber-500',
        lightBar: 'bg-amber-100',
        iconColor: 'text-amber-600',
        pill: 'bg-amber-100 text-amber-900 border-amber-200',
      }
    : {
        bg: 'bg-emerald-50/70',
        border: 'border-emerald-200',
        textTitle: 'text-emerald-950',
        badge: 'bg-emerald-600 text-white',
        bar: 'bg-emerald-500',
        lightBar: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        pill: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      };

  return (
    <div
      className={`rounded-2xl border ${theme.border} ${theme.bg} p-4 sm:p-5 shadow-xs transition-all`}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isTriggered
                ? 'bg-white shadow-xs text-rose-600 animate-pulse'
                : 'bg-white/80 text-emerald-600'
            }`}
          >
            {isTriggered ? (
              <Zap className="w-5 h-5 text-rose-600 fill-rose-600/20" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-serif text-base font-bold ${theme.textTitle}`}>
                Early Warning Engine · Distress Spike Probability
              </h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.badge}`}
              >
                {warningLevel} Early Warning ({spikeProbability}%)
              </span>
            </div>
            <p className="text-xs text-[#5a7580] mt-0.5">
              Calculates probability of acute distress decompensation in the {timeframe} compared to survivor's long-term historical baseline
            </p>
          </div>
        </div>

        {/* Probability Gauge & Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="font-mono text-xl font-extrabold text-[#15303a]">
              {spikeProbability}%
            </span>
            <span className="text-[10px] text-[#5a7580] block font-medium">
              Spike Likelihood
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-[#d9e6e4] text-[#5a7580] transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse early warning details' : 'Expand early warning details'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Probability Progress Bar */}
      <div className="mt-3 w-full bg-white/70 h-2.5 rounded-full overflow-hidden border border-[#d9e6e4]/60 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
          style={{ width: `${spikeProbability}%` }}
        />
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-[#d9e6e4]/60 space-y-3 text-xs animate-in fade-in duration-200">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-[#d9e6e4] space-y-0.5">
              <span className="text-[10px] text-[#5a7580] uppercase tracking-wider font-semibold block">
                Historical Divergence
              </span>
              <span className="font-mono text-sm font-bold text-[#15303a]">
                {baselineDivergenceZScore > 0 ? `+${baselineDivergenceZScore}σ` : `${baselineDivergenceZScore}σ`}
              </span>
              <span className="text-[10px] text-[#5a7580] block">vs 28-day baseline</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#d9e6e4] space-y-0.5">
              <span className="text-[10px] text-[#5a7580] uppercase tracking-wider font-semibold block">
                Spike Horizon
              </span>
              <span className="font-mono text-sm font-bold text-[#15303a]">
                {timeframe}
              </span>
              <span className="text-[10px] text-[#5a7580] block">Predicted window</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#d9e6e4] space-y-0.5">
              <span className="text-[10px] text-[#5a7580] uppercase tracking-wider font-semibold block">
                Escalation Streak
              </span>
              <span className="font-mono text-sm font-bold text-[#15303a]">
                {consecutiveEscalationDays} days
              </span>
              <span className="text-[10px] text-[#5a7580] block">Unbroken climb</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#d9e6e4] space-y-0.5">
              <span className="text-[10px] text-[#5a7580] uppercase tracking-wider font-semibold block">
                Model Confidence
              </span>
              <span className="font-mono text-sm font-bold text-[#15303a]">
                {confidenceScore}%
              </span>
              <span className="text-[10px] text-[#5a7580] block">Trajectory certainty</span>
            </div>
          </div>

          {/* Precursor Physiological & Negative Pattern Factors */}
          {precursorFactors.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#15303a] block">
                Detected Precursor Escalation Drivers:
              </span>
              <div className="space-y-1.5">
                {precursorFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-[#d9e6e4] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            factor.impact === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {factor.impact.toUpperCase()} PRECURSOR
                        </span>
                        <span className="font-semibold text-xs text-[#15303a]">
                          {factor.factor}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5a7580] leading-relaxed">
                        {factor.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-rose-600 block">
                        +{factor.divergenceZScore}σ
                      </span>
                      <span className="text-[9px] text-[#5a7580]">above base</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Preemptive Clinical Action */}
          <div className="p-3 rounded-xl bg-white border-2 border-[#2a7f8f]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a7f8f] block">
                Recommended Preemptive Intervention:
              </span>
              <p className="text-xs text-[#15303a] leading-relaxed font-medium">
                {recommendedIntervention}
              </p>
            </div>

            {onTriggerOutreach && isTriggered && (
              <button
                type="button"
                onClick={onTriggerOutreach}
                className="px-3.5 py-2 rounded-xl bg-[#2a7f8f] hover:bg-[#236b79] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Preemptive Outreach</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
