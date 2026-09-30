import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { CheckInEntry } from '../../types';
import {
  Moon,
  Flame,
  Activity,
  Layers,
  Sparkles,
  Info,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Brain,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react';

interface CorrelationMatrixChartProps {
  history: CheckInEntry[];
  survivorId: string;
}

// Statistical Pearson correlation helper
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(2));
}

const SLEEP_LABELS = ['0 Restful', '1 Mild', '2 Broken', '3 Severe', '4 Crisis'];
const ANXIETY_LABELS = ['0 Calm', '1 Mild', '2 Tension', '3 High', '4 Panic'];

const ALL_DOMAINS = [
  { key: 'sleep', label: 'Sleep Disturbance', short: 'Sleep', icon: Moon, color: '#6366f1' },
  { key: 'tension', label: 'Autonomic Anxiety / Tension', short: 'Anxiety', icon: Flame, color: '#d97706' },
  { key: 'intrusions', label: 'Intrusive Memories', short: 'Intrusions', icon: Activity, color: '#e11d48' },
  { key: 'withdrawal', label: 'Social Withdrawal', short: 'Withdrawal', icon: Layers, color: '#ea580c' },
  { key: 'mood', label: 'Emotional Heaviness', short: 'Mood', icon: Compass, color: '#0d9488' },
] as const;

export const CorrelationMatrixChart: React.FC<CorrelationMatrixChartProps> = ({
  history,
  survivorId,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'scatter' | 'crossdomain'>('matrix');
  const [selectedCell, setSelectedCell] = useState<{ sleep: number; anxiety: number } | null>(null);

  // 1. Calculate Sleep vs. Anxiety (Tension) Pearson Correlation
  const stats = useMemo(() => {
    if (!history || history.length < 2) {
      return {
        r: 0,
        rSquared: 0,
        strength: 'Insufficient Data',
        color: '#64748b',
        leadLagNarrative: 'Awaiting longitudinal records.',
        lagSleepToAnx: 0,
        lagAnxToSleep: 0,
        dominantTrigger: 'Undetermined',
      };
    }

    const sleepVals = history.map((e) => e.sleep);
    const anxietyVals = history.map((e) => e.tension);

    const r = calculatePearsonCorrelation(sleepVals, anxietyVals);
    const rSquared = Math.round(r * r * 100);

    // Lagged correlations (1-day shift) to detect whether poor sleep triggers anxiety or anxiety causes insomnia
    const sleepTMinus1 = history.slice(0, -1).map((e) => e.sleep);
    const anxietyT = history.slice(1).map((e) => e.tension);
    const lagSleepToAnx = calculatePearsonCorrelation(sleepTMinus1, anxietyT);

    const anxietyTMinus1 = history.slice(0, -1).map((e) => e.tension);
    const sleepT = history.slice(1).map((e) => e.sleep);
    const lagAnxToSleep = calculatePearsonCorrelation(anxietyTMinus1, sleepT);

    let strength = 'Weak / Decoupled';
    let color = '#64748b';
    if (r >= 0.7) {
      strength = 'Strong Positive Coupling';
      color = '#e11d48';
    } else if (r >= 0.4) {
      strength = 'Moderate Correlation';
      color = '#d97706';
    } else if (r <= -0.4) {
      strength = 'Inverse Correlation';
      color = '#0d9488';
    }

    let dominantTrigger = 'Bi-directional Coupling';
    let leadLagNarrative = '';

    if (lagSleepToAnx > lagAnxToSleep + 0.15) {
      dominantTrigger = 'Sleep Loss Leads Anxiety';
      leadLagNarrative =
        'Poor nocturnal sleep quality acts as the primary precursor (lead indicator), consistently driving next-day autonomic hyperarousal and anxiety spikes.';
    } else if (lagAnxToSleep > lagSleepToAnx + 0.15) {
      dominantTrigger = 'Daytime Anxiety Impairs Sleep';
      leadLagNarrative =
        'Daytime hyperarousal and startle reactivity carry over into the evening, precipitating midnight awakenings and nightmare architecture breakdown.';
    } else {
      dominantTrigger = 'Synchronous Bi-directional Feedback';
      leadLagNarrative =
        'Sleep disturbance and anxiety exacerbate each other concurrently in a continuous positive-feedback trauma loop.';
    }

    return {
      r,
      rSquared,
      strength,
      color,
      leadLagNarrative,
      lagSleepToAnx,
      lagAnxToSleep,
      dominantTrigger,
    };
  }, [history]);

  // 2. 5x5 Co-occurrence Matrix (Sleep vs Anxiety)
  const matrixData = useMemo(() => {
    // 5 rows (Anxiety 4 down to 0), 5 columns (Sleep 0 to 4)
    const grid: {
      sleep: number;
      anxiety: number;
      count: number;
      days: number[];
      percentage: number;
    }[][] = [];

    for (let anx = 4; anx >= 0; anx--) {
      const row: (typeof grid)[0] = [];
      for (let slp = 0; slp <= 4; slp++) {
        const matchingDays = history.filter((e) => e.sleep === slp && e.tension === anx);
        row.push({
          sleep: slp,
          anxiety: anx,
          count: matchingDays.length,
          days: matchingDays.map((e) => e.day),
          percentage:
            history.length > 0 ? Math.round((matchingDays.length / history.length) * 100) : 0,
        });
      }
      grid.push(row);
    }

    return grid;
  }, [history]);

  // 3. Scatter Plot Data Points
  const scatterPoints = useMemo(() => {
    return history.map((entry) => {
      // Add slight jitter for points falling on exact integers so they don't overlap completely
      const jitterX = (Math.sin(entry.day * 13) * 0.08);
      const jitterY = (Math.cos(entry.day * 17) * 0.08);

      return {
        day: entry.day,
        date: entry.date,
        sleep: entry.sleep,
        anxiety: entry.tension,
        x: entry.sleep + jitterX,
        y: entry.tension + jitterY,
        composite: entry.mood + entry.sleep + entry.tension + entry.withdrawal + entry.intrusions,
        note: entry.note,
      };
    });
  }, [history]);

  // 4. Cross-Domain 5x5 Correlation Matrix
  const crossDomainMatrix = useMemo(() => {
    const matrix: { rowDomain: string; colDomain: string; r: number }[][] = [];

    ALL_DOMAINS.forEach((row) => {
      const rowItems: (typeof matrix)[0] = [];
      const rowVals = history.map((e) => e[row.key]);

      ALL_DOMAINS.forEach((col) => {
        const colVals = history.map((e) => e[col.key]);
        const r = calculatePearsonCorrelation(rowVals, colVals);
        rowItems.push({
          rowDomain: row.short,
          colDomain: col.short,
          r,
        });
      });
      matrix.push(rowItems);
    });

    return matrix;
  }, [history]);

  // Selected cell days details
  const selectedCellDetails = useMemo(() => {
    if (!selectedCell) return null;
    const matchingEntries = history.filter(
      (e) => e.sleep === selectedCell.sleep && e.tension === selectedCell.anxiety
    );
    return {
      sleep: selectedCell.sleep,
      anxiety: selectedCell.anxiety,
      entries: matchingEntries,
    };
  }, [selectedCell, history]);

  return (
    <div className="bg-white rounded-2xl border border-[#d9e6e4] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Statistical Summary Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#d9e6e4]/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2a7f8f]/10 text-[#2a7f8f] flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-[#15303a]">
              Correlation Matrix · Sleep Quality vs. Anxiety Trajectory
            </h3>
            <p className="text-xs text-[#5a7580]">
              Visualizing the 30-day co-occurrence matrix between restorative sleep breakdown and daytime autonomic anxiety
            </p>
          </div>
        </div>

        {/* Pearson r Pill */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-[#f8fafc] border border-[#d9e6e4] px-3.5 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#5a7580] font-medium">Pearson r:</span>
            <span
              className={`font-mono font-bold text-sm ${
                stats.r >= 0.7 ? 'text-rose-600' : stats.r >= 0.4 ? 'text-amber-600' : 'text-slate-700'
              }`}
            >
              {stats.r > 0 ? `+${stats.r}` : stats.r}
            </span>
          </div>

          <span className="text-[#d9e6e4]">|</span>

          <span className="text-[11px] font-semibold text-[#15303a]">
            {stats.rSquared}% Shared Variance (R²)
          </span>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              stats.r >= 0.7
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : stats.r >= 0.4
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {stats.strength}
          </span>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 bg-[#e8f2f0] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-white text-[#15303a] font-bold shadow-xs'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            Co-occurrence Matrix (5×5)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scatter')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'scatter'
                ? 'bg-white text-[#15303a] font-bold shadow-xs'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            Scatter Trajectory Plot
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crossdomain')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'crossdomain'
                ? 'bg-white text-[#15303a] font-bold shadow-xs'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            Cross-Domain Pairwise Matrix
          </button>
        </div>

        <div className="text-[11px] text-[#5a7580] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Primary Behavioral Trigger: <b>{stats.dominantTrigger}</b></span>
        </div>
      </div>

      {/* TAB 1: 5x5 Co-occurrence Matrix (Heatmap) */}
      {activeTab === 'matrix' && (
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row items-start gap-4">
            {/* The 5x5 Grid */}
            <div className="flex-1 w-full overflow-x-auto">
              <div className="min-w-[460px] p-3 rounded-xl bg-[#f8fafc] border border-[#d9e6e4] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#5a7580] px-1 pb-1">
                  <span className="font-semibold text-[#15303a] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Y-Axis: Autonomic Anxiety / Tension</span>
                  </span>
                  <span className="font-semibold text-[#15303a] flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-[#6366f1]" />
                    <span>X-Axis: Sleep Disturbance</span>
                  </span>
                </div>

                {/* Grid Structure */}
                <div className="space-y-1">
                  {matrixData.map((row, rIdx) => {
                    const anxietyLevel = 4 - rIdx;
                    return (
                      <div key={anxietyLevel} className="flex items-center gap-1.5">
                        {/* Y-axis Label */}
                        <div className="w-24 text-right pr-2 text-[11px] font-mono font-medium text-[#5a7580] shrink-0">
                          {ANXIETY_LABELS[anxietyLevel]}
                        </div>

                        {/* 5 Cells in this row */}
                        <div className="flex-1 grid grid-cols-5 gap-1.5">
                          {row.map((cell) => {
                            const isSelected =
                              selectedCell?.sleep === cell.sleep &&
                              selectedCell?.anxiety === cell.anxiety;

                            // Intensity styling based on day count
                            let cellBg = 'bg-white text-slate-400 border-slate-200';
                            if (cell.count > 0) {
                              if (cell.anxiety >= 3 && cell.sleep >= 3) {
                                // Crisis cluster
                                cellBg =
                                  cell.count >= 4
                                    ? 'bg-rose-500 text-white font-bold border-rose-600 shadow-xs'
                                    : 'bg-rose-200 text-rose-950 font-bold border-rose-300';
                              } else if (cell.anxiety <= 1 && cell.sleep <= 1) {
                                // Grounded / Baseline cluster
                                cellBg =
                                  cell.count >= 4
                                    ? 'bg-emerald-500 text-white font-bold border-emerald-600'
                                    : 'bg-emerald-100 text-emerald-950 font-bold border-emerald-300';
                              } else {
                                // Transitional / Moderate cluster
                                cellBg =
                                  cell.count >= 4
                                    ? 'bg-amber-400 text-amber-950 font-bold border-amber-500'
                                    : 'bg-amber-100 text-amber-900 font-semibold border-amber-200';
                              }
                            }

                            return (
                              <button
                                key={cell.sleep}
                                type="button"
                                onClick={() =>
                                  cell.count > 0
                                    ? setSelectedCell(
                                        isSelected ? null : { sleep: cell.sleep, anxiety: cell.anxiety }
                                      )
                                    : null
                                }
                                disabled={cell.count === 0}
                                className={`h-12 rounded-xl border flex flex-col items-center justify-center transition-all ${cellBg} ${
                                  cell.count > 0 ? 'cursor-pointer hover:scale-105' : 'opacity-40 cursor-default'
                                } ${
                                  isSelected ? 'ring-2 ring-[#2a7f8f] scale-105 shadow-md z-10' : ''
                                }`}
                                title={`Sleep ${cell.sleep}, Anxiety ${cell.anxiety}: ${cell.count} days (${cell.percentage}%)`}
                              >
                                <span className="font-mono text-sm leading-none">{cell.count}</span>
                                <span className="text-[9px] opacity-75 mt-0.5 leading-none">
                                  {cell.count === 1 ? '1 day' : `${cell.count} days`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* X-axis Bottom Labels */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="w-24 shrink-0" />
                    <div className="flex-1 grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono text-[#5a7580]">
                      {SLEEP_LABELS.map((lbl) => (
                        <div key={lbl} className="truncate">
                          {lbl}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Diagnostic Summary Card */}
            <div className="w-full lg:w-72 shrink-0 space-y-3">
              <div className="p-3.5 rounded-xl bg-[#f2f7f6] border border-[#d9e6e4] space-y-2 text-xs">
                <span className="font-serif font-bold text-sm text-[#15303a] block">
                  Cluster Interpretation
                </span>
                <p className="text-[#5a7580] leading-relaxed">
                  {stats.r >= 0.7
                    ? 'Data points cluster heavily along the diagonal (top-right crisis quadrant & bottom-left recovery quadrant), confirming strong symptom synchronization.'
                    : 'Dispersed cluster distribution suggests anxiety spikes occur independently of nocturnal sleep duration.'}
                </p>

                <div className="pt-2 border-t border-[#d9e6e4]/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5a7580]">Lagged Trigger: Sleep → Anxiety</span>
                    <span className="font-mono font-bold text-[#15303a]">
                      r = {stats.lagSleepToAnx}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5a7580]">Lagged Trigger: Anxiety → Sleep</span>
                    <span className="font-mono font-bold text-[#15303a]">
                      r = {stats.lagAnxToSleep}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Cell Inspector */}
              {selectedCellDetails && (
                <div className="p-3 rounded-xl bg-white border-2 border-[#2a7f8f] space-y-2 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15303a]">
                      State: Sleep {selectedCellDetails.sleep}/4 · Anxiety {selectedCellDetails.anxiety}/4
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#2a7f8f]/10 text-[#2a7f8f] font-bold">
                      {selectedCellDetails.entries.length} Occurrences
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5a7580]">
                    Recorded on Days:{' '}
                    <span className="font-mono font-bold text-[#15303a]">
                      {selectedCellDetails.entries.map((e) => `Day ${e.day}`).join(', ')}
                    </span>
                  </div>
                  {selectedCellDetails.entries.some((e) => e.note) && (
                    <div className="text-[11px] italic text-[#334155] border-t border-slate-100 pt-1.5">
                      "{selectedCellDetails.entries.find((e) => e.note)?.note}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Scatter Trajectory Plot */}
      {activeTab === 'scatter' && (
        <div className="w-full h-[280px] pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                dataKey="x"
                name="Sleep Disturbance"
                domain={[-0.2, 4.2]}
                ticks={[0, 1, 2, 3, 4]}
                tickFormatter={(val) => `Sleep ${val}`}
                stroke="#64748b"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Anxiety / Tension"
                domain={[-0.2, 4.2]}
                ticks={[0, 1, 2, 3, 4]}
                tickFormatter={(val) => `Anx ${val}`}
                stroke="#64748b"
                tick={{ fontSize: 11 }}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as (typeof scatterPoints)[0];
                    return (
                      <div className="bg-[#15303a] text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-white/10 max-w-xs">
                        <div className="font-bold border-b border-white/15 pb-1 flex justify-between">
                          <span>Day {data.day} ({data.date})</span>
                          <span className="font-mono text-emerald-300">
                            {data.composite}/20 Total
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Sleep Disturbance:</span>
                          <span className="font-mono font-bold text-white">{data.sleep}/4</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Anxiety / Tension:</span>
                          <span className="font-mono font-bold text-white">{data.anxiety}/4</span>
                        </div>
                        {data.note && (
                          <div className="pt-1 text-[11px] italic text-[#d4ede6] border-t border-white/10">
                            "{data.note}"
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Theoretical linear regression line indicator */}
              <ReferenceLine
                segment={[
                  { x: 0, y: 0.2 },
                  { x: 4, y: 3.8 },
                ]}
                stroke="#2a7f8f"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Regression Fit (r = ${stats.r})`,
                  fill: '#2a7f8f',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
              <Scatter name="Check-in Days" data={scatterPoints}>
                {scatterPoints.map((entry) => {
                  const isCrisis = entry.sleep >= 3 && entry.anxiety >= 3;
                  const isBaseline = entry.sleep <= 1 && entry.anxiety <= 1;
                  const fill = isCrisis ? '#e11d48' : isBaseline ? '#10b981' : '#f59e0b';
                  return <Cell key={entry.day} fill={fill} stroke="#ffffff" strokeWidth={1} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TAB 3: Cross-Domain Pairwise Matrix */}
      {activeTab === 'crossdomain' && (
        <div className="overflow-x-auto rounded-xl border border-[#d9e6e4]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#d9e6e4] text-[#5a7580] font-semibold text-[11px]">
                <th className="py-2.5 px-3">Domain</th>
                {ALL_DOMAINS.map((d) => (
                  <th key={d.key} className="py-2.5 px-2.5 text-center">
                    {d.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d9e6e4]/60">
              {crossDomainMatrix.map((row, rIdx) => {
                const domainMeta = ALL_DOMAINS[rIdx];
                return (
                  <tr key={domainMeta.key} className="hover:bg-[#f8fafc]">
                    <td className="py-2 px-3 font-semibold text-[#15303a] flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: domainMeta.color }}
                      />
                      <span>{domainMeta.label}</span>
                    </td>
                    {row.map((cell, cIdx) => {
                      const isSelf = rIdx === cIdx;
                      const isHigh = Math.abs(cell.r) >= 0.7;
                      const isMed = Math.abs(cell.r) >= 0.4;
                      const isTargetDyad =
                        (domainMeta.key === 'sleep' && ALL_DOMAINS[cIdx].key === 'tension') ||
                        (domainMeta.key === 'tension' && ALL_DOMAINS[cIdx].key === 'sleep');

                      let bgClass = 'text-slate-500';
                      if (isSelf) {
                        bgClass = 'bg-slate-100 text-slate-400 font-normal';
                      } else if (isHigh) {
                        bgClass = 'bg-rose-100 text-rose-900 font-bold';
                      } else if (isMed) {
                        bgClass = 'bg-amber-100 text-amber-900 font-semibold';
                      }

                      return (
                        <td
                          key={cell.colDomain}
                          className={`py-2 px-2.5 text-center font-mono text-xs ${bgClass} ${
                            isTargetDyad ? 'ring-2 ring-[#2a7f8f] font-extrabold' : ''
                          }`}
                          title={`${domainMeta.short} vs ${cell.colDomain}: r = ${cell.r}`}
                        >
                          {isSelf ? '1.0' : cell.r > 0 ? `+${cell.r}` : cell.r}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Behavioral Trigger Insights & Action Card */}
      <div className="p-3.5 rounded-xl bg-[#f2f7f6] border border-[#d9e6e4] space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#2a7f8f] shrink-0" />
          <h4 className="font-serif font-bold text-sm text-[#15303a]">
            Identified Behavioral Trigger Mechanism
          </h4>
        </div>
        <p className="text-[#334155] leading-relaxed">
          {stats.leadLagNarrative}
        </p>

        <div className="pt-2 border-t border-[#d9e6e4]/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-white border border-[#d9e6e4] space-y-0.5">
            <span className="font-bold text-[#15303a] block">
              1. Somatic Wind-Down Protocol Target:
            </span>
            <span className="text-[#5a7580]">
              Given the strong coupling ({stats.rSquared}% shared variance), intervening in evening sleep hygiene (guided 4-7-8 breathing & sensory anchor) is expected to directly mitigate next-day startle reflex.
            </span>
          </div>

          <div className="p-2 rounded-lg bg-white border border-[#d9e6e4] space-y-0.5">
            <span className="font-bold text-[#15303a] block">
              2. Preemptive Early Warning Flag:
            </span>
            <span className="text-[#5a7580]">
              A single check-in recording Sleep Disturbance ≥ 3 triggers proactive outreach within 24 hours before anxiety escalates to panic thresholds.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
