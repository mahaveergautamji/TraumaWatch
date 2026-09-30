import React, { useState, useMemo } from 'react';
import { CheckInEntry, MovingAverageComparisonRow } from '../../types';
import {
  Activity,
  Layers,
  Moon,
  AlertCircle,
  Flame,
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

interface DistressComparisonTableProps {
  history: CheckInEntry[];
  survivorId: string;
}

const DOMAIN_CONFIG: Record<
  string,
  {
    label: string;
    sublabel: string;
    scaleMax: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    criticalThreshold: number;
    elevatedThreshold: number;
  }
> = {
  composite: {
    label: 'Overall Composite Distress',
    sublabel: 'Cumulative symptom severity across all 5 domains',
    scaleMax: 20,
    icon: Activity,
    color: '#2a7f8f',
    criticalThreshold: 4.0,
    elevatedThreshold: 1.5,
  },
  sleep: {
    label: 'Sleep Disturbance & Nightmares',
    sublabel: 'Insomnia, midnight gasping, restorative rest deficit',
    scaleMax: 4,
    icon: Moon,
    color: '#6366f1',
    criticalThreshold: 1.0,
    elevatedThreshold: 0.35,
  },
  intrusions: {
    label: 'Intrusive Flashbacks & Reliving',
    sublabel: 'Trauma memories, vivid sensory flashbacks',
    scaleMax: 4,
    icon: AlertCircle,
    color: '#e11d48',
    criticalThreshold: 1.0,
    elevatedThreshold: 0.35,
  },
  tension: {
    label: 'Autonomic Tension & Hyperarousal',
    sublabel: 'Startle reflex, inability to physically wind down',
    scaleMax: 4,
    icon: Flame,
    color: '#d97706',
    criticalThreshold: 1.0,
    elevatedThreshold: 0.35,
  },
  withdrawal: {
    label: 'Social Withdrawal & Avoidance',
    sublabel: 'Isolation from peers, detachment from community',
    scaleMax: 4,
    icon: Users,
    color: '#ea580c',
    criticalThreshold: 1.0,
    elevatedThreshold: 0.35,
  },
  mood: {
    label: 'Emotional Heaviness & Low Affect',
    sublabel: 'Numbness, sadness, reduced emotional resilience',
    scaleMax: 4,
    icon: Heart,
    color: '#0d9488',
    criticalThreshold: 1.0,
    elevatedThreshold: 0.35,
  },
};

export const DistressComparisonTable: React.FC<DistressComparisonTableProps> = ({
  history,
  survivorId,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'spikes' | 'stable'>('all');
  const [sortField, setSortField] = useState<'deltaDesc' | 'currentDesc' | 'domain'>('deltaDesc');

  // Compute 7-day recent window and 30-day historical window
  const comparisonData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const recent7Days = history.slice(-7);
    const historical30Days = history; // 28-30 days available in history

    type DomainKey = 'composite' | 'sleep' | 'intrusions' | 'tension' | 'withdrawal' | 'mood';

    const keys: DomainKey[] = [
      'composite',
      'sleep',
      'intrusions',
      'tension',
      'withdrawal',
      'mood',
    ];

    const getVal = (entry: CheckInEntry, key: DomainKey): number => {
      if (key === 'composite') {
        return entry.mood + entry.sleep + entry.tension + entry.withdrawal + entry.intrusions;
      }
      return entry[key];
    };

    return keys.map((key: DomainKey): MovingAverageComparisonRow => {
      const cfg = DOMAIN_CONFIG[key];

      // Recent 7-day average
      const currentSum = recent7Days.reduce((acc, curr) => acc + getVal(curr, key), 0);
      const current7DayAvg = Number((currentSum / Math.max(1, recent7Days.length)).toFixed(1));

      // 30-day moving average
      const historicalSum = historical30Days.reduce((acc, curr) => acc + getVal(curr, key), 0);
      const historical30DayAvg = Number(
        (historicalSum / Math.max(1, historical30Days.length)).toFixed(1)
      );

      const delta = Number((current7DayAvg - historical30DayAvg).toFixed(1));
      const deltaPct =
        historical30DayAvg > 0
          ? Math.round(((current7DayAvg - historical30DayAvg) / historical30DayAvg) * 100)
          : delta > 0
          ? 100
          : 0;

      let status: MovingAverageComparisonRow['status'] = 'stable';
      let badgeLabel = 'Stable Equilibrium';
      let clinicalImplication = '';

      if (delta >= cfg.criticalThreshold) {
        status = 'critical_spike';
        badgeLabel = `▲ Critical Spike (+${delta})`;
      } else if (delta >= cfg.elevatedThreshold) {
        status = 'elevated';
        badgeLabel = `▲ Elevated (+${delta})`;
      } else if (delta <= -cfg.elevatedThreshold) {
        status = 'improved';
        badgeLabel = `▼ Recovery (${delta})`;
      } else {
        status = 'stable';
        badgeLabel = `● Stable (±${Math.abs(delta)})`;
      }

      // Domain-specific clinical narratives
      if (key === 'composite') {
        clinicalImplication =
          status === 'critical_spike'
            ? 'Acute multi-system escalation. Systemic deterioration across both somatic and cognitive domains requires clinical intervention.'
            : status === 'elevated'
            ? 'Moderate upward drift above historical average. Recommend reviewing sleep and trigger exposure.'
            : status === 'improved'
            ? 'Positive recovery trend. Overall symptom burden has fallen comfortably below the 30-day benchmark.'
            : 'Longitudinal stability preserved. Distress levels tracking closely along historical moving average.';
      } else if (key === 'sleep') {
        clinicalImplication =
          status === 'critical_spike'
            ? 'Severe circadian breakdown (+100%+ above 30d baseline). Nightmare awakenings impairing daytime coping capacity.'
            : status === 'elevated'
            ? 'Moderate sleep disruption. Recommend bedtime somatic wind-down protocol and sleep hygiene review.'
            : status === 'improved'
            ? 'Restorative sleep regaining consistency. Reduction in nocturnal panic frequency.'
            : 'Sleep patterns tracking consistently within habitual baseline bounds.';
      } else if (key === 'intrusions') {
        clinicalImplication =
          status === 'critical_spike'
            ? 'Severe PTSD reactivation. Vivid flashbacks and somatic reliving triggered by recent environmental stimuli.'
            : status === 'elevated'
            ? 'Increased frequency of involuntary trauma recall during unstructured daytime periods.'
            : status === 'improved'
            ? 'Intrusive episodes diminishing in intensity and duration.'
            : 'Intrusion frequency remains low and manageable.';
      } else if (key === 'tension') {
        clinicalImplication =
          status === 'critical_spike'
            ? 'Pronounced autonomic hyperarousal and elevated startle reflex. Sympathetic nervous system overdrive.'
            : status === 'elevated'
            ? 'Noticeable somatic restlessness and difficulty unwinding in safe environments.'
            : status === 'improved'
            ? 'Somatic relaxation restored; survivor reporting grounded physical state.'
            : 'Autonomic arousal aligned with historical equilibrium.';
      } else if (key === 'withdrawal') {
        clinicalImplication =
          status === 'critical_spike'
            ? 'Pronounced social detachment and cocooning. High risk of losing informal support network.'
            : status === 'elevated'
            ? 'Decreased attendance in group circles or communication with trusted peers.'
            : status === 'improved'
            ? 'Reconnecting with family/support networks; social openness rebounding.'
            : 'Healthy social connectedness consistent with 30-day norms.';
      } else {
        clinicalImplication =
          status === 'critical_spike'
            ? 'Acute emotional heaviness and affective exhaustion. Resilience reserves depleted.'
            : status === 'elevated'
            ? 'Persistent low mood and emotional numbness across recent days.'
            : status === 'improved'
            ? 'Affective resilience strengthening; positive daily reflections recorded.'
            : 'Emotional state tracking stable with established personal baseline.';
      }

      return {
        domainKey: key,
        label: cfg.label,
        sublabel: cfg.sublabel,
        current7DayAvg,
        historical30DayAvg,
        delta,
        deltaPct,
        scaleMax: cfg.scaleMax,
        status,
        badgeLabel,
        clinicalImplication,
      };
    });
  }, [history]);

  // Filtered & Sorted list
  const filteredRows = useMemo(() => {
    let rows = [...comparisonData];

    if (filterMode === 'spikes') {
      rows = rows.filter((r) => r.status === 'critical_spike' || r.status === 'elevated');
    } else if (filterMode === 'stable') {
      rows = rows.filter((r) => r.status === 'stable' || r.status === 'improved');
    }

    // Sort
    rows.sort((a, b) => {
      if (sortField === 'deltaDesc') {
        return b.delta - a.delta;
      } else if (sortField === 'currentDesc') {
        return b.current7DayAvg - a.current7DayAvg;
      } else {
        return a.label.localeCompare(b.label);
      }
    });

    return rows;
  }, [comparisonData, filterMode, sortField]);

  // Aggregate summary counts
  const summaryCounts = useMemo(() => {
    const criticalCount = comparisonData.filter(
      (r) => r.domainKey !== 'composite' && r.status === 'critical_spike'
    ).length;
    const elevatedCount = comparisonData.filter(
      (r) => r.domainKey !== 'composite' && r.status === 'elevated'
    ).length;
    const improvedCount = comparisonData.filter(
      (r) => r.domainKey !== 'composite' && r.status === 'improved'
    ).length;
    const stableCount = comparisonData.filter(
      (r) => r.domainKey !== 'composite' && r.status === 'stable'
    ).length;

    const compositeRow = comparisonData.find((r) => r.domainKey === 'composite');

    return {
      criticalCount,
      elevatedCount,
      improvedCount,
      stableCount,
      compositeDelta: compositeRow?.delta ?? 0,
      compositePct: compositeRow?.deltaPct ?? 0,
    };
  }, [comparisonData]);

  return (
    <div className="bg-white rounded-2xl border border-[#d9e6e4] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Title & Summary Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#d9e6e4]/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2a7f8f]/10 text-[#2a7f8f] flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-[#15303a]">
              Metric Divergence · 7-Day vs. 30-Day Moving Average
            </h3>
            <p className="text-xs text-[#5a7580]">
              Contrasting recent 7-day distress trajectory against survivor's 30-day baseline equilibrium
            </p>
          </div>
        </div>

        {/* Aggregate Divergence Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#f2f7f6] border border-[#d9e6e4] px-3 py-1.5 rounded-xl text-xs">
          <span className="text-[#5a7580] font-medium">Composite Variance:</span>
          {summaryCounts.compositeDelta > 1 ? (
            <span className="inline-flex items-center gap-1 font-bold text-rose-600 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              +{summaryCounts.compositeDelta} pts ({summaryCounts.compositePct > 0 ? `+${summaryCounts.compositePct}%` : '0%'})
            </span>
          ) : summaryCounts.compositeDelta < -1 ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 font-mono">
              <TrendingDown className="w-3.5 h-3.5" />
              {summaryCounts.compositeDelta} pts ({summaryCounts.compositePct}%)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-600 font-mono">
              <Minus className="w-3.5 h-3.5" />
              ±{Math.abs(summaryCounts.compositeDelta)} pts (Equilibrium)
            </span>
          )}
        </div>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 bg-[#e8f2f0] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-white text-[#15303a] shadow-xs font-semibold'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            All 6 Metrics
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('spikes')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              filterMode === 'spikes'
                ? 'bg-white text-rose-700 shadow-xs font-bold'
                : 'text-[#5a7580] hover:text-rose-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Spikes & Elevated ({summaryCounts.criticalCount + summaryCounts.elevatedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('stable')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              filterMode === 'stable'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-[#5a7580] hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Stable / Recovery ({summaryCounts.stableCount + summaryCounts.improvedCount})</span>
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 text-xs text-[#5a7580]">
          <span>Sort by:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="text-xs p-1 rounded-lg border border-[#d9e6e4] bg-white text-[#15303a] cursor-pointer"
          >
            <option value="deltaDesc">Largest Deviation (+Δ)</option>
            <option value="currentDesc">Highest Current Value</option>
            <option value="domain">Domain Name</option>
          </select>
        </div>
      </div>

      {/* Main Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-[#d9e6e4]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#d9e6e4] text-[#5a7580] font-semibold text-[11px]">
              <th className="py-2.5 px-3.5">Clinical Domain</th>
              <th className="py-2.5 px-3 text-center">Recent 7-Day Mean</th>
              <th className="py-2.5 px-3 text-center">30-Day Moving Avg</th>
              <th className="py-2.5 px-3 text-center">Net Deviation (Δ)</th>
              <th className="py-2.5 px-3 text-center">Status Badge</th>
              <th className="py-2.5 px-3.5">Clinical Implication & Focus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d9e6e4]/60">
            {filteredRows.map((row) => {
              const cfg = DOMAIN_CONFIG[row.domainKey];
              const Icon = cfg.icon;
              const isComposite = row.domainKey === 'composite';

              // Visual bar progress
              const currentPct = Math.min(100, (row.current7DayAvg / row.scaleMax) * 100);
              const historicalPct = Math.min(100, (row.historical30DayAvg / row.scaleMax) * 100);

              // Badge styling
              const badgeStyle =
                row.status === 'critical_spike'
                  ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                  : row.status === 'elevated'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                  : row.status === 'improved'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <tr
                  key={row.domainKey}
                  className={`hover:bg-[#f8fafc] transition-colors ${
                    isComposite ? 'bg-[#f2f7f6]/40 font-medium' : ''
                  }`}
                >
                  {/* Domain column */}
                  <td className="py-3 px-3.5">
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-[#15303a] block leading-tight">
                          {row.label}
                        </span>
                        <span className="text-[10px] text-[#5a7580] block mt-0.5">
                          {row.sublabel} (0–{row.scaleMax})
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Current 7-Day Mean */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-mono text-sm font-bold text-[#15303a]">
                        {row.current7DayAvg}
                        <span className="text-[10px] text-[#5a7580] font-normal">
                          /{row.scaleMax}
                        </span>
                      </span>
                      {/* Mini Bar */}
                      <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            row.status === 'critical_spike'
                              ? 'bg-rose-500'
                              : row.status === 'elevated'
                              ? 'bg-amber-500'
                              : row.status === 'improved'
                              ? 'bg-emerald-500'
                              : 'bg-[#2a7f8f]'
                          }`}
                          style={{ width: `${currentPct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Historical 30-Day Moving Average */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-mono text-xs font-semibold text-[#5a7580]">
                        {row.historical30DayAvg}
                        <span className="text-[10px] opacity-75 font-normal">/{row.scaleMax}</span>
                      </span>
                      {/* Mini Bar Benchmark */}
                      <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-200">
                        <div
                          className="h-full rounded-full bg-slate-400"
                          style={{ width: `${historicalPct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Net Deviation Column */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className={`font-mono text-xs font-bold flex items-center gap-0.5 ${
                          row.delta > 0.35
                            ? 'text-rose-600'
                            : row.delta < -0.35
                            ? 'text-emerald-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {row.delta > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                        ) : row.delta < 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Minus className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{row.delta > 0 ? `+${row.delta}` : `${row.delta}`}</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#5a7580]">
                        {row.deltaPct > 0 ? `+${row.deltaPct}%` : `${row.deltaPct}%`}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] border whitespace-nowrap ${badgeStyle}`}
                    >
                      {row.badgeLabel}
                    </span>
                  </td>

                  {/* Clinical Implication */}
                  <td className="py-3 px-3.5 max-w-xs sm:max-w-sm">
                    <p className="text-[11px] text-[#334155] leading-relaxed">
                      {row.clinicalImplication}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend & Analytical Footnote */}
      <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#d9e6e4]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#5a7580]">
          <Info className="w-4 h-4 text-[#2a7f8f] shrink-0" />
          <span>
            <b>Clinical Interpretation:</b> Deviations contrast the most recent 7 recorded days against the entire 30-day longitudinal trajectory. Spikes ≥ +1.0 pt (+4.0 for composite) signify acute decompensation requiring intervention.
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-[#5a7580] shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Spike (≥+1.0)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Elevated (≥+0.4)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Recovery (≤-0.4)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
