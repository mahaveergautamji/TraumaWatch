import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { CheckInEntry, RiskAnalysis, DomainMetricComparison, ClinicalNote } from '../../types';
import {
  Activity,
  Layers,
  Moon,
  AlertCircle,
  Users,
  Flame,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Info,
  Calendar,
  Tag,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  Pin,
} from 'lucide-react';

interface DistressTrendProps {
  history: CheckInEntry[];
  analysis: RiskAnalysis;
  survivorId: string;
  clinicalNotes?: ClinicalNote[];
  selectedNoteId?: string | null;
  onSelectNote?: (noteId: string) => void;
}

type MetricMode = 'all' | 'composite' | 'sleep' | 'intrusions' | 'withdrawal' | 'tension' | 'mood';

interface MetricMeta {
  key: keyof Pick<CheckInEntry, 'sleep' | 'intrusions' | 'withdrawal' | 'tension' | 'mood'>;
  label: string;
  color: string;
  baselineKey: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const METRICS: Record<string, MetricMeta> = {
  sleep: {
    key: 'sleep',
    label: 'Sleep Disturbance',
    color: '#6366f1', // Indigo
    baselineKey: 'sleep',
    icon: Moon,
    description: 'Insomnia, nocturnal panic & nightmare frequency',
  },
  intrusions: {
    key: 'intrusions',
    label: 'Intrusive Memories',
    color: '#e11d48', // Rose-red
    baselineKey: 'intrusions',
    icon: AlertCircle,
    description: 'Reliving trauma, flashbacks & somatic triggers',
  },
  withdrawal: {
    key: 'withdrawal',
    label: 'Social Withdrawal',
    color: '#ea580c', // Orange
    baselineKey: 'withdrawal',
    icon: Users,
    description: 'Isolation from support network & emotional detachment',
  },
  tension: {
    key: 'tension',
    label: 'Hyperarousal / Tension',
    color: '#d97706', // Amber
    baselineKey: 'tension',
    icon: Flame,
    description: 'Inability to relax, startle reflex & hypervigilance',
  },
  mood: {
    key: 'mood',
    label: 'Emotional Heaviness',
    color: '#0d9488', // Teal
    baselineKey: 'mood',
    icon: Heart,
    description: 'Depressive affect, numbness & persistent low mood',
  },
};

export interface TimelineEventItem {
  noteId: string;
  day: number;
  shortDay: string;
  dayLabel: string;
  date: string;
  category: ClinicalNote['category'];
  title: string;
  impactType: 'dip' | 'spike' | 'stabilized' | 'neutral';
  impactMetric: string;
  deltaStr: string;
  impactDescription: string;
  noteContent: string;
  author: string;
  timestamp: string;
  color: string;
}

export const DistressTrend: React.FC<DistressTrendProps> = ({
  history,
  analysis,
  survivorId,
  clinicalNotes = [],
  selectedNoteId = null,
  onSelectNote,
}) => {
  const [activeMode, setActiveMode] = useState<MetricMode>('all');
  const [showBaselineRef, setShowBaselineRef] = useState<boolean>(true);
  const [showEventAnnotations, setShowEventAnnotations] = useState<boolean>(true);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  // Sync external selected note if changed
  useEffect(() => {
    if (selectedNoteId) {
      setActiveEventId(selectedNoteId);
    }
  }, [selectedNoteId]);

  // Extract the last 7 recorded days
  const last7Days = useMemo(() => {
    const slice = history.slice(-7);
    return slice.map((entry, idx) => {
      const composite =
        entry.mood + entry.sleep + entry.tension + entry.withdrawal + entry.intrusions;
      return {
        ...entry,
        index: idx,
        dayLabel: `Day ${entry.day}`,
        shortDay: `D${entry.day}`,
        composite,
      };
    });
  }, [history]);

  // Baseline metric map
  const baselineByDomain = useMemo(() => {
    const map: Record<string, DomainMetricComparison> = {};
    analysis.domainComparisons.forEach((comp) => {
      map[comp.feature] = comp;
    });
    return map;
  }, [analysis.domainComparisons]);

  // Compute 7-day stats
  const stats7d = useMemo(() => {
    if (last7Days.length === 0) return null;
    const first = last7Days[0];
    const last = last7Days[last7Days.length - 1];

    const compositeDelta = last.composite - first.composite;
    const avgComposite7d =
      last7Days.reduce((acc, curr) => acc + curr.composite, 0) / last7Days.length;

    return {
      startDay: first.day,
      endDay: last.day,
      compositeDelta,
      avgComposite7d: Number(avgComposite7d.toFixed(1)),
      baselineComposite: Number(analysis.baselineMean.toFixed(1)),
      netChangePct:
        analysis.baselineMean > 0
          ? Math.round(((avgComposite7d - analysis.baselineMean) / analysis.baselineMean) * 100)
          : 0,
    };
  }, [last7Days, analysis.baselineMean]);

  // Filter clinical notes that correspond to the last 7 days window (Days 22–28)
  const eventsInWindow = useMemo<TimelineEventItem[]>(() => {
    if (!clinicalNotes || clinicalNotes.length === 0) return [];
    const minDay = last7Days[0]?.day ?? 22;
    const maxDay = last7Days[last7Days.length - 1]?.day ?? 28;

    return clinicalNotes
      .filter((n) => {
        const d = n.day ?? 28;
        return d >= minDay && d <= maxDay;
      })
      .map((n) => {
        const day = n.day ?? 28;
        const entry = last7Days.find((e) => e.day === day) || last7Days[last7Days.length - 1];
        const isDip = n.metricImpact?.type === 'dip';
        const isSpike = n.metricImpact?.type === 'spike';
        const color = isDip
          ? '#0d9488' // Teal/Emerald for metric dip / recovery
          : isSpike
          ? '#e11d48' // Rose for acute escalation / trauma trigger
          : n.category === 'session'
          ? '#6366f1' // Indigo for clinical sessions
          : '#d97706'; // Amber for routine outreach

        const impactType: 'dip' | 'spike' | 'stabilized' | 'neutral' =
          n.metricImpact?.type ?? (n.category === 'escalation' ? 'spike' : 'neutral');

        return {
          noteId: n.id,
          day,
          shortDay: entry?.shortDay ?? `D${day}`,
          dayLabel: entry?.dayLabel ?? `Day ${day}`,
          date: n.timestamp.split('·')[0]?.trim() || entry?.date || `Day ${day}`,
          category: n.category,
          title:
            n.eventTitle ||
            (n.category === 'escalation'
              ? 'Clinical Escalation'
              : n.category === 'session'
              ? 'Counsellor Session'
              : n.category === 'outreach'
              ? 'Clinical Outreach'
              : 'Clinical Observation'),
          impactType,
          impactMetric: n.metricImpact?.metric ?? 'Trajectory',
          deltaStr: n.metricImpact?.delta ?? '',
          impactDescription:
            n.metricImpact?.description ?? `${n.content.slice(0, 95)}...`,
          noteContent: n.content,
          author: n.author,
          timestamp: n.timestamp,
          color,
        };
      })
      .sort((a, b) => a.day - b.day);
  }, [clinicalNotes, last7Days]);

  // Selected event object
  const selectedEvent = useMemo(() => {
    return eventsInWindow.find((e) => e.noteId === activeEventId) || null;
  }, [eventsInWindow, activeEventId]);

  // Specific single metric stats if selected
  const singleMetricMeta =
    activeMode !== 'all' && activeMode !== 'composite' ? METRICS[activeMode] : null;
  const singleMetricBaseline = singleMetricMeta ? baselineByDomain[singleMetricMeta.key] : null;

  // Handle Event selection
  const handleToggleEvent = (noteId: string) => {
    if (activeEventId === noteId) {
      setActiveEventId(null);
    } else {
      setActiveEventId(noteId);
    }
  };

  const handleJumpToNote = (noteId: string) => {
    if (onSelectNote) {
      onSelectNote(noteId);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#d9e6e4] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Title & Stats Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#d9e6e4]/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2a7f8f]/10 text-[#2a7f8f] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#15303a]">
                Distress Trend · Last 7 Days vs. Baseline
              </h3>
              <p className="text-xs text-[#5a7580]">
                Days {stats7d?.startDay}–{stats7d?.endDay} trajectory with vertical event annotations linking metric dips to clinical notes
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Net Trajectory Summary Pill */}
        {stats7d && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#f2f7f6] border border-[#d9e6e4] px-3 py-1.5 rounded-xl text-xs">
            <span className="text-[#5a7580] font-medium">7d Trajectory:</span>
            {stats7d.compositeDelta > 1 ? (
              <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                <TrendingUp className="w-3.5 h-3.5" />
                +{stats7d.compositeDelta} pts escalation
              </span>
            ) : stats7d.compositeDelta < -1 ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <TrendingDown className="w-3.5 h-3.5" />
                {stats7d.compositeDelta} pts recovery
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                <Minus className="w-3.5 h-3.5" />
                Stable (±{Math.abs(stats7d.compositeDelta)} pts)
              </span>
            )}
            <span className="text-[#5a7580]/60">|</span>
            <span className="font-mono text-[11px] text-[#15303a]">
              Mean: {stats7d.avgComposite7d} <span className="text-[#5a7580]">(base: {stats7d.baselineComposite})</span>
            </span>
          </div>
        )}
      </div>

      {/* Metric Mode Filter Tabs & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1 bg-[#e8f2f0] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMode('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMode === 'all'
                ? 'bg-white text-[#15303a] shadow-xs font-semibold'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            All 5 Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('composite')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMode === 'composite'
                ? 'bg-white text-[#15303a] shadow-xs font-semibold'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            Composite Score (0–20)
          </button>

          <span className="text-slate-300 mx-1">|</span>

          {Object.entries(METRICS).map(([key, meta]) => {
            const isActive = activeMode === key;
            const domain = baselineByDomain[key];
            const isEscalated = domain && domain.delta > 0.4;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMode(key as MetricMode)}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-white text-[#15303a] shadow-xs font-semibold'
                    : 'text-[#5a7580] hover:text-[#15303a]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="capitalize">{key}</span>
                {isEscalated && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Chart View Options Toggles */}
        <div className="flex items-center gap-3">
          {/* Clinical Events Annotation Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-[#5a7580] cursor-pointer hover:text-[#15303a]">
            <input
              type="checkbox"
              checked={showEventAnnotations}
              onChange={(e) => setShowEventAnnotations(e.target.checked)}
              className="rounded border-[#d9e6e4] text-[#2a7f8f] focus:ring-[#2a7f8f] cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Pin className="w-3 h-3 text-[#2a7f8f]" />
              <span>Event Annotations ({eventsInWindow.length})</span>
            </span>
          </label>

          {/* Baseline reference lines toggle */}
          <label className="flex items-center gap-1.5 text-xs text-[#5a7580] cursor-pointer hover:text-[#15303a]">
            <input
              type="checkbox"
              checked={showBaselineRef}
              onChange={(e) => setShowBaselineRef(e.target.checked)}
              className="rounded border-[#d9e6e4] text-[#2a7f8f] focus:ring-[#2a7f8f] cursor-pointer"
            />
            <span>Baseline Ref</span>
          </label>
        </div>
      </div>

      {/* Main Recharts Container with Vertical Clinical Annotations */}
      <div className="w-full h-[290px] pt-1 relative">
        {activeMode === 'composite' ? (
          /* Composite Distress Area Chart (0 to 20 scale) */
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days} margin={{ top: 18, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="distressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2a7f8f" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2a7f8f" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="shortDay"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 20]}
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickLine={false}
                ticks={[0, 5, 10, 15, 20]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as (typeof last7Days)[0];
                    const diff = data.composite - analysis.baselineMean;
                    const dayEvents = eventsInWindow.filter((e) => e.day === data.day);

                    return (
                      <div className="bg-[#15303a] text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 max-w-xs border border-white/10">
                        <div className="flex items-center justify-between font-bold border-b border-white/15 pb-1">
                          <span>{data.dayLabel} ({data.date})</span>
                          <span className="font-mono text-emerald-300">
                            {data.composite}/20
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                          <span>Intake Baseline:</span>
                          <span className="font-mono">{analysis.baselineMean.toFixed(1)}/20</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Delta vs. Baseline:</span>
                          <span
                            className={`font-mono font-bold ${
                              diff > 0.5 ? 'text-rose-400' : diff < -0.5 ? 'text-emerald-400' : 'text-slate-300'
                            }`}
                          >
                            {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} pts
                          </span>
                        </div>

                        {/* Linked Clinical Events on this date */}
                        {dayEvents.length > 0 && (
                          <div className="pt-1.5 border-t border-white/15 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-amber-300 block">
                              Clinical Event on this Date:
                            </span>
                            {dayEvents.map((evt) => (
                              <div key={evt.noteId} className="bg-white/10 p-1.5 rounded text-[11px]">
                                <div className="font-semibold text-emerald-200">
                                  {evt.title}
                                </div>
                                <div className="text-[10px] text-slate-300">
                                  {evt.impactDescription}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-1.5 border-t border-white/10 grid grid-cols-2 gap-x-2 text-[10px] text-slate-300">
                          <div>Sleep: {data.sleep}/4</div>
                          <div>Intrusions: {data.intrusions}/4</div>
                          <div>Tension: {data.tension}/4</div>
                          <div>Withdrawal: {data.withdrawal}/4</div>
                          <div className="col-span-2">Mood heaviness: {data.mood}/4</div>
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
              {showBaselineRef && (
                <ReferenceLine
                  y={analysis.baselineMean}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Baseline: ${analysis.baselineMean.toFixed(1)}`,
                    position: 'insideTopLeft',
                    fill: '#475569',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              )}
              {/* Moderate risk threshold line at 10 */}
              <ReferenceLine
                y={10}
                stroke="#eab308"
                strokeDasharray="2 2"
                strokeOpacity={0.6}
                label={{
                  value: 'Elevated Threshold (10)',
                  position: 'insideTopRight',
                  fill: '#ca8a04',
                  fontSize: 9,
                }}
              />

              {/* Vertical Annotations for Clinical Events and Metric Dips */}
              {showEventAnnotations &&
                eventsInWindow.map((evt) => {
                  const isSelected = activeEventId === evt.noteId;
                  const labelPrefix =
                    evt.impactType === 'dip'
                      ? '▼ Dip'
                      : evt.impactType === 'spike'
                      ? '▲ Alert'
                      : '● Event';

                  return (
                    <ReferenceLine
                      key={`comp-evt-${evt.noteId}`}
                      x={evt.shortDay}
                      stroke={evt.color}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeDasharray={isSelected ? undefined : '3 3'}
                      label={{
                        value: `${labelPrefix}: ${evt.title.length > 14 ? evt.title.slice(0, 14) + '…' : evt.title}`,
                        position: 'top',
                        fill: evt.color,
                        fontSize: 9,
                        fontWeight: 700,
                        dy: -2,
                      }}
                    />
                  );
                })}

              <Area
                type="monotone"
                dataKey="composite"
                name="Total Daily Distress"
                stroke="#2a7f8f"
                strokeWidth={2.5}
                fill="url(#distressGradient)"
                dot={{ r: 3.5, fill: '#2a7f8f', strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 5.5, fill: '#15303a', stroke: '#2a7f8f', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : activeMode === 'all' ? (
          /* Multi-Metric Line Chart comparing all 5 signals (0 to 4 scale) */
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7Days} margin={{ top: 18, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="shortDay"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 4]}
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickLine={false}
                ticks={[0, 1, 2, 3, 4]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as (typeof last7Days)[0];
                    const dayEvents = eventsInWindow.filter((e) => e.day === data.day);

                    return (
                      <div className="bg-[#15303a] text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px] border border-white/10">
                        <div className="font-bold border-b border-white/15 pb-1 flex justify-between items-center">
                          <span>{data.dayLabel} ({data.date})</span>
                          <span className="text-[10px] text-slate-300">Scale 0–4</span>
                        </div>

                        {/* Event Callout in Tooltip */}
                        {dayEvents.length > 0 && (
                          <div className="py-1 border-b border-white/15 space-y-1">
                            {dayEvents.map((evt) => (
                              <div
                                key={evt.noteId}
                                className="bg-white/10 p-1.5 rounded text-[11px] border border-emerald-300/30"
                              >
                                <span className="font-semibold text-emerald-300">
                                  {evt.title}
                                </span>
                                <div className="text-[10px] text-slate-300">
                                  {evt.impactDescription}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-1 pt-0.5">
                          {Object.entries(METRICS).map(([k, meta]) => {
                            const val = data[meta.key];
                            const base = baselineByDomain[k]?.baselineVal ?? 0;
                            const diff = val - base;
                            return (
                              <div
                                key={k}
                                className="flex items-center justify-between text-[11px]"
                              >
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: meta.color }}
                                  />
                                  <span>{meta.label.split(' ')[0]}:</span>
                                </span>
                                <span className="font-mono">
                                  <b>{val}</b>{' '}
                                  <span
                                    className={`text-[10px] ${
                                      diff > 0.3
                                        ? 'text-rose-400 font-semibold'
                                        : diff < -0.3
                                        ? 'text-emerald-400'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    (base: {base})
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {data.note && (
                          <div className="pt-1.5 text-[11px] italic text-[#d4ede6] border-t border-white/10">
                            "{data.note}"
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                iconType="circle"
                formatter={(value) => <span className="text-[#15303a] font-medium">{value}</span>}
              />

              {/* Vertical Annotations */}
              {showEventAnnotations &&
                eventsInWindow.map((evt) => {
                  const isSelected = activeEventId === evt.noteId;
                  const labelPrefix =
                    evt.impactType === 'dip'
                      ? '▼ Dip'
                      : evt.impactType === 'spike'
                      ? '▲ Alert'
                      : '● Event';

                  return (
                    <ReferenceLine
                      key={`all-evt-${evt.noteId}`}
                      x={evt.shortDay}
                      stroke={evt.color}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeDasharray={isSelected ? undefined : '3 3'}
                      label={{
                        value: `${labelPrefix}: ${evt.title.length > 14 ? evt.title.slice(0, 14) + '…' : evt.title}`,
                        position: 'top',
                        fill: evt.color,
                        fontSize: 9,
                        fontWeight: 700,
                        dy: -2,
                      }}
                    />
                  );
                })}

              {Object.entries(METRICS).map(([key, meta]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={meta.key}
                  name={meta.label.split(' ')[0]}
                  stroke={meta.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: meta.color, strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          /* Focused Single Metric with its specific Baseline Reference (0 to 4 scale) */
          singleMetricMeta && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days} margin={{ top: 18, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="shortDay"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 4]}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  ticks={[0, 1, 2, 3, 4]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as (typeof last7Days)[0];
                      const val = data[singleMetricMeta.key];
                      const base = singleMetricBaseline?.baselineVal ?? 0;
                      const diff = Number((val - base).toFixed(1));
                      const dayEvents = eventsInWindow.filter((e) => e.day === data.day);

                      return (
                        <div className="bg-[#15303a] text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-white/10">
                          <div className="font-bold border-b border-white/15 pb-1 flex justify-between gap-4">
                            <span>{data.dayLabel} ({data.date})</span>
                            <span className="font-mono text-emerald-300">{val}/4</span>
                          </div>

                          {dayEvents.length > 0 && (
                            <div className="py-1 border-b border-white/15 space-y-1">
                              {dayEvents.map((evt) => (
                                <div key={evt.noteId} className="bg-white/10 p-1.5 rounded text-[11px]">
                                  <span className="font-semibold text-emerald-300">
                                    {evt.title}
                                  </span>
                                  <div className="text-[10px] text-slate-300">
                                    {evt.impactDescription}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="text-[11px] text-slate-300 flex justify-between gap-4">
                            <span>Survivor Baseline:</span>
                            <span className="font-mono">{base} / 4</span>
                          </div>
                          <div className="text-[11px] flex justify-between gap-4">
                            <span>Variance:</span>
                            <span
                              className={`font-mono font-bold ${
                                diff > 0.3
                                  ? 'text-rose-400'
                                  : diff < -0.3
                                  ? 'text-emerald-400'
                                  : 'text-slate-300'
                              }`}
                            >
                              {diff > 0 ? `+${diff}` : `${diff}`} vs baseline
                            </span>
                          </div>
                          {data.note && (
                            <div className="pt-1.5 text-[11px] italic text-[#d4ede6] border-t border-white/10">
                              "{data.note}"
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {showBaselineRef && singleMetricBaseline && (
                  <ReferenceLine
                    y={singleMetricBaseline.baselineVal}
                    stroke="#64748b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Baseline: ${singleMetricBaseline.baselineVal}`,
                      position: 'insideTopLeft',
                      fill: '#475569',
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                )}

                {/* Vertical Annotations */}
                {showEventAnnotations &&
                  eventsInWindow.map((evt) => {
                    const isSelected = activeEventId === evt.noteId;
                    const labelPrefix =
                      evt.impactType === 'dip'
                        ? '▼ Dip'
                        : evt.impactType === 'spike'
                        ? '▲ Alert'
                        : '● Event';

                    return (
                      <ReferenceLine
                        key={`single-evt-${evt.noteId}`}
                        x={evt.shortDay}
                        stroke={evt.color}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        strokeDasharray={isSelected ? undefined : '3 3'}
                        label={{
                          value: `${labelPrefix}: ${evt.title.length > 14 ? evt.title.slice(0, 14) + '…' : evt.title}`,
                          position: 'top',
                          fill: evt.color,
                          fontSize: 9,
                          fontWeight: 700,
                          dy: -2,
                        }}
                      />
                    );
                  })}

                <Line
                  type="monotone"
                  dataKey={singleMetricMeta.key}
                  name={singleMetricMeta.label}
                  stroke={singleMetricMeta.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: singleMetricMeta.color, strokeWidth: 1.5, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )
        )}
      </div>

      {/* Vertical Annotations Timeline Strip (Links Visual Dips Directly to Clinical Notes) */}
      {showEventAnnotations && eventsInWindow.length > 0 && (
        <div className="bg-[#f8fafc] rounded-xl border border-[#d9e6e4] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#15303a]">
              <Pin className="w-3.5 h-3.5 text-[#2a7f8f]" />
              <span>Clinical Event Annotations & Metric Dips ({eventsInWindow.length})</span>
            </div>
            <span className="text-[11px] text-[#5a7580]">
              Click any event marker to inspect metric shifts or jump to clinical note
            </span>
          </div>

          {/* Interactive Event Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {eventsInWindow.map((evt) => {
              const isSelected = activeEventId === evt.noteId;
              const isDip = evt.impactType === 'dip';
              const isSpike = evt.impactType === 'spike';

              return (
                <div
                  key={evt.noteId}
                  onClick={() => handleToggleEvent(evt.noteId)}
                  className={`p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'border-[#2a7f8f] bg-white shadow-sm ring-2 ring-[#2a7f8f]/20'
                      : 'border-[#d9e6e4] bg-white/70 hover:bg-white hover:border-[#2a7f8f]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-[#15303a]">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: evt.color }}
                      />
                      <span>Day {evt.day}</span>
                      <span className="text-[11px] font-normal text-[#5a7580]">({evt.date})</span>
                    </span>

                    {/* Impact badge */}
                    {isDip ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200">
                        <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                        <span>Dip {evt.deltaStr}</span>
                      </span>
                    ) : isSpike ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-[10px] text-rose-800 bg-rose-50 border border-rose-200">
                        <ArrowUpRight className="w-3 h-3 text-rose-600" />
                        <span>Spike {evt.deltaStr}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-semibold text-[10px] text-amber-800 bg-amber-50 border border-amber-200">
                        <Minus className="w-3 h-3 text-amber-600" />
                        <span>Stabilized</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-[#15303a] text-xs line-clamp-1 mb-1">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-[#5a7580] line-clamp-2 leading-relaxed">
                    {evt.impactDescription}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#d9e6e4]/60 flex items-center justify-between text-[11px]">
                    <span className="text-[#5a7580] truncate max-w-[130px]">
                      {evt.author}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJumpToNote(evt.noteId);
                      }}
                      className="text-[#2a7f8f] hover:underline font-semibold flex items-center gap-1 shrink-0"
                    >
                      <span>Jump to note</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Event Detail Card when selected */}
          {selectedEvent && (
            <div className="bg-white rounded-xl border-2 border-[#2a7f8f] p-3.5 space-y-2 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-[#2a7f8f]/10 text-[#2a7f8f]">
                      Day {selectedEvent.day} Annotation
                    </span>
                    <span className="text-xs text-[#5a7580]">
                      {selectedEvent.timestamp} · {selectedEvent.author}
                    </span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-[#15303a] mt-1">
                    {selectedEvent.title}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => handleJumpToNote(selectedEvent.noteId)}
                  className="px-3 py-1.5 rounded-lg bg-[#2a7f8f] hover:bg-[#236b79] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Highlight Note in Timeline</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Metric Impact Narrative */}
              <div className="p-2.5 rounded-lg bg-[#e8f2f0]/60 border border-[#d9e6e4] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#15303a]">
                  <Activity className="w-3.5 h-3.5 text-[#2a7f8f]" />
                  <span>Metric Trajectory Correlation ({selectedEvent.impactMetric}):</span>
                  <span
                    className={`font-mono ${
                      selectedEvent.impactType === 'dip'
                        ? 'text-emerald-700'
                        : selectedEvent.impactType === 'spike'
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {selectedEvent.deltaStr}
                  </span>
                </div>
                <p className="text-[#5a7580] leading-relaxed">
                  {selectedEvent.impactDescription}
                </p>
              </div>

              {/* Clinician Note Quote */}
              <div className="text-xs text-[#15303a] pl-3 border-l-2 border-[#2a7f8f] italic bg-[#f8fafc] py-2 pr-2 rounded-r-lg">
                "{selectedEvent.noteContent}"
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contextual Metric Explanation & Clinical Trajectory Note */}
      <div className="bg-[#f2f7f6] rounded-xl p-3 border border-[#d9e6e4]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-start gap-2 text-[#5a7580]">
          <Info className="w-4 h-4 text-[#2a7f8f] shrink-0 mt-0.5" />
          <div>
            {activeMode === 'all' && (
              <span>
                <b>Multi-Metric View:</b> Vertical reference dashed lines indicate clinical contacts, peer visits, or crisis escalations. Visual dips following outreach indicate positive treatment response or stabilization.
              </span>
            )}
            {activeMode === 'composite' && (
              <span>
                <b>Composite Distress:</b> Cumulative sum (0–20). Vertical flags mark days where clinical actions coincided with downward dips or steep upward spikes.
              </span>
            )}
            {singleMetricMeta && (
              <span>
                <b>{singleMetricMeta.label}:</b> {singleMetricMeta.description}. Intake baseline: <b>{singleMetricBaseline?.baselineVal ?? 'N/A'}/4</b>. Current 7-day average: <b>{singleMetricBaseline?.currentVal ?? 'N/A'}/4</b>.
              </span>
            )}
          </div>
        </div>

        {/* Quick Focus Button */}
        {activeMode !== 'all' && (
          <button
            type="button"
            onClick={() => setActiveMode('all')}
            className="self-end sm:self-auto text-[11px] font-semibold text-[#2a7f8f] hover:underline shrink-0 cursor-pointer"
          >
            Reset to all metrics
          </button>
        )}
      </div>
    </div>
  );
};
