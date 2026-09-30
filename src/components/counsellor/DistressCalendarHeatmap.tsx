import React, { useState, useMemo } from 'react';
import { CheckInEntry, ClinicalNote } from '../../types';
import {
  Calendar,
  Layers,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Info,
  Clock,
  Pin,
  ArrowRight,
  ExternalLink,
  Moon,
  Flame,
  Users,
  AlertCircle,
  Heart,
} from 'lucide-react';

interface DistressCalendarHeatmapProps {
  history: CheckInEntry[];
  baselineMean: number;
  clinicalNotes?: ClinicalNote[];
  onSelectNote?: (noteId: string) => void;
}

type HeatmapMetric = 'composite' | 'sleep' | 'intrusions' | 'tension' | 'withdrawal' | 'mood';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DistressCalendarHeatmap: React.FC<DistressCalendarHeatmapProps> = ({
  history,
  baselineMean,
  clinicalNotes = [],
  onSelectNote,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<HeatmapMetric>('composite');
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(28); // Default to latest day

  // Map history by day (1 to 28)
  const historyMap = useMemo(() => {
    const map = new Map<number, CheckInEntry>();
    history.forEach((h) => map.set(h.day, h));
    return map;
  }, [history]);

  // Map clinical notes by day
  const notesByDay = useMemo(() => {
    const map = new Map<number, ClinicalNote[]>();
    clinicalNotes.forEach((n) => {
      const d = n.day ?? 28;
      const existing = map.get(d) || [];
      existing.push(n);
      map.set(d, existing);
    });
    return map;
  }, [clinicalNotes]);

  // Organize into 4 calendar weeks (7 days each)
  const weeks = useMemo(() => {
    const result: {
      weekNum: number;
      weekLabel: string;
      days: CheckInEntry[];
      avgScore: number;
    }[] = [];

    for (let w = 0; w < 4; w++) {
      const daysInWeek: CheckInEntry[] = [];
      let sum = 0;
      let count = 0;

      for (let d = 0; d < 7; d++) {
        const dayNumber = w * 7 + d + 1;
        const entry = historyMap.get(dayNumber) || {
          day: dayNumber,
          date: `Day ${dayNumber}`,
          mood: 0,
          sleep: 0,
          tension: 0,
          withdrawal: 0,
          intrusions: 0,
        };
        daysInWeek.push(entry);

        const val =
          selectedMetric === 'composite'
            ? entry.mood + entry.sleep + entry.tension + entry.withdrawal + entry.intrusions
            : entry[selectedMetric];
        sum += val;
        count++;
      }

      const avgScore = count > 0 ? Number((sum / count).toFixed(1)) : 0;
      const weekLabel =
        w === 0
          ? 'W1 · Baseline'
          : w === 1
          ? 'W2 · Early Monitoring'
          : w === 2
          ? 'W3 · Mid-Month'
          : 'W4 · Recent Trajectory';

      result.push({
        weekNum: w + 1,
        weekLabel,
        days: daysInWeek,
        avgScore,
      });
    }

    return result;
  }, [historyMap, selectedMetric]);

  // Compute Day-of-Week averages (Mondays avg, Tuesdays avg, etc.)
  const dayOfWeekAverages = useMemo(() => {
    const sums = Array(7).fill(0);
    const counts = Array(7).fill(0);

    weeks.forEach((w) => {
      w.days.forEach((dayEntry, dIdx) => {
        const val =
          selectedMetric === 'composite'
            ? dayEntry.mood + dayEntry.sleep + dayEntry.tension + dayEntry.withdrawal + dayEntry.intrusions
            : dayEntry[selectedMetric];
        sums[dIdx] += val;
        counts[dIdx] += 1;
      });
    });

    const avgs = sums.map((s, idx) => ({
      name: DAY_NAMES[idx],
      avg: counts[idx] > 0 ? Number((s / counts[idx]).toFixed(1)) : 0,
      isWeekend: idx >= 5,
    }));

    // Find highest and lowest days
    let maxDay = avgs[0];
    let minDay = avgs[0];
    avgs.forEach((a) => {
      if (a.avg > maxDay.avg) maxDay = a;
      if (a.avg < minDay.avg) minDay = a;
    });

    // Weekday vs Weekend average
    const weekdaySum = sums.slice(0, 5).reduce((a, b) => a + b, 0);
    const weekdayCount = counts.slice(0, 5).reduce((a, b) => a + b, 0);
    const weekdayAvg = weekdayCount > 0 ? Number((weekdaySum / weekdayCount).toFixed(1)) : 0;

    const weekendSum = sums.slice(5).reduce((a, b) => a + b, 0);
    const weekendCount = counts.slice(5).reduce((a, b) => a + b, 0);
    const weekendAvg = weekendCount > 0 ? Number((weekendSum / weekendCount).toFixed(1)) : 0;

    return {
      dayAverages: avgs,
      maxDay,
      minDay,
      weekdayAvg,
      weekendAvg,
      weekendVariancePct:
        weekdayAvg > 0 ? Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100) : 0,
    };
  }, [weeks, selectedMetric]);

  // Helper to get color intensity based on score
  const getCellColor = (entry: CheckInEntry) => {
    const val =
      selectedMetric === 'composite'
        ? entry.mood + entry.sleep + entry.tension + entry.withdrawal + entry.intrusions
        : entry[selectedMetric];

    if (selectedMetric === 'composite') {
      // 0 to 20 scale
      if (val <= 3) return 'bg-[#e6f4f1] text-[#134e4a] border-[#bbf7d0] hover:border-[#2a7f8f]'; // Grounded / Restful
      if (val <= 6) return 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1] hover:border-[#2a7f8f]'; // Low / Baseline
      if (val <= 9) return 'bg-[#fef9c3] text-[#854d0e] border-[#fde047] hover:border-[#ca8a04]'; // Mild elevation
      if (val <= 13) return 'bg-[#fed7aa] text-[#9a3412] border-[#fb923c] hover:border-[#ea580c]'; // Moderate / High
      return 'bg-[#fecdd3] text-[#881337] border-[#f43f5e] font-bold hover:border-[#be123c]'; // Severe / Crisis
    } else {
      // 0 to 4 scale
      if (val === 0) return 'bg-[#e6f4f1] text-[#134e4a] border-[#bbf7d0]';
      if (val === 1) return 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]';
      if (val === 2) return 'bg-[#fef9c3] text-[#854d0e] border-[#fde047]';
      if (val === 3) return 'bg-[#fed7aa] text-[#9a3412] border-[#fb923c]';
      return 'bg-[#fecdd3] text-[#881337] border-[#f43f5e] font-bold';
    }
  };

  // Selected Day Details
  const selectedDayEntry = selectedDayNum ? historyMap.get(selectedDayNum) : null;
  const selectedDayNotes = selectedDayNum ? notesByDay.get(selectedDayNum) || [] : [];
  const selectedDayComposite = selectedDayEntry
    ? selectedDayEntry.mood +
      selectedDayEntry.sleep +
      selectedDayEntry.tension +
      selectedDayEntry.withdrawal +
      selectedDayEntry.intrusions
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#d9e6e4] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Title & Metric Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#d9e6e4]/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2a7f8f]/10 text-[#2a7f8f] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-[#15303a]">
              Distress Calendar Heatmap · 28-Day Pattern Matrix
            </h3>
            <p className="text-xs text-[#5a7580]">
              Detect weekly cyclical vulnerabilities, weekend symptom shifts, and sustained escalation streaks
            </p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-[#f2f7f6] p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setSelectedMetric('composite')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedMetric === 'composite'
                ? 'bg-white text-[#15303a] font-bold shadow-xs'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            Composite (0–20)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('sleep')}
            className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              selectedMetric === 'sleep'
                ? 'bg-white text-[#6366f1] font-bold shadow-xs'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>Sleep</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('intrusions')}
            className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              selectedMetric === 'intrusions'
                ? 'bg-white text-[#e11d48] font-bold shadow-xs'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>Intrusions</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('tension')}
            className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              selectedMetric === 'tension'
                ? 'bg-white text-[#d97706] font-bold shadow-xs'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Tension</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('withdrawal')}
            className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              selectedMetric === 'withdrawal'
                ? 'bg-white text-[#ea580c] font-bold shadow-xs'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Withdrawal</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('mood')}
            className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              selectedMetric === 'mood'
                ? 'bg-white text-[#0d9488] font-bold shadow-xs'
                : 'text-[#5a7580] hover:text-[#15303a]'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>Mood</span>
          </button>
        </div>
      </div>

      {/* Main Heatmap Grid with Week Summary Column */}
      <div className="overflow-x-auto">
        <div className="min-w-[580px] space-y-2">
          {/* Day of Week Column Headers */}
          <div className="grid grid-cols-12 gap-1.5 text-center text-xs font-semibold text-[#5a7580]">
            <div className="col-span-3 text-left pl-2">Timeline Phase</div>
            {DAY_NAMES.map((name, i) => (
              <div
                key={name}
                className={`col-span-1 py-1 rounded-md ${
                  i >= 5 ? 'text-[#2a7f8f] bg-[#e8f2f0]/60 font-bold' : ''
                }`}
              >
                {name}
              </div>
            ))}
            <div className="col-span-2 text-right pr-2">Week Avg</div>
          </div>

          {/* 4 Weekly Rows */}
          <div className="space-y-1.5">
            {weeks.map((week) => (
              <div key={week.weekNum} className="grid grid-cols-12 gap-1.5 items-center">
                {/* Week Label */}
                <div className="col-span-3 pl-2">
                  <span className="font-serif text-xs font-bold text-[#15303a] block">
                    {week.weekLabel.split('·')[0]}
                  </span>
                  <span className="text-[10px] text-[#5a7580]">
                    {week.weekLabel.split('·')[1]}
                  </span>
                </div>

                {/* 7 Days in Week */}
                {week.days.map((entry) => {
                  const val =
                    selectedMetric === 'composite'
                      ? entry.mood + entry.sleep + entry.tension + entry.withdrawal + entry.intrusions
                      : entry[selectedMetric];

                  const isSelected = selectedDayNum === entry.day;
                  const dayNotes = notesByDay.get(entry.day) || [];
                  const hasClinicalEvent = dayNotes.length > 0;
                  const hasJournalNote = Boolean(entry.note);

                  return (
                    <div
                      key={entry.day}
                      onClick={() => setSelectedDayNum(entry.day)}
                      title={`Day ${entry.day} (${entry.date}): ${val} pts ${
                        hasClinicalEvent ? '· Clinical event logged' : ''
                      }`}
                      className={`col-span-1 h-14 rounded-xl border p-1 flex flex-col justify-between cursor-pointer transition-all ${getCellColor(
                        entry
                      )} ${
                        isSelected
                          ? 'ring-2 ring-[#2a7f8f] shadow-md scale-105 z-10'
                          : 'hover:scale-102 hover:shadow-xs'
                      }`}
                    >
                      {/* Top row: Day label & indicator dots */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-[9px] opacity-75">D{entry.day}</span>
                        <div className="flex items-center gap-0.5">
                          {hasClinicalEvent && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-[#2a7f8f] ring-1 ring-white"
                              title="Clinical note on this day"
                            />
                          )}
                          {hasJournalNote && (
                            <span
                              className="w-1 h-1 rounded-full bg-slate-400"
                              title="Survivor reflection logged"
                            />
                          )}
                        </div>
                      </div>

                      {/* Main Score Value */}
                      <div className="text-center font-mono text-sm leading-none my-auto font-bold">
                        {val}
                      </div>

                      {/* Bottom Date */}
                      <div className="text-[8px] text-center opacity-65 truncate leading-tight">
                        {entry.date.split(',')[0]}
                      </div>
                    </div>
                  );
                })}

                {/* Week Average Pill */}
                <div className="col-span-2 text-right pr-2">
                  <div className="inline-flex flex-col items-end">
                    <span className="font-mono text-xs font-bold text-[#15303a]">
                      {week.avgScore} <span className="text-[10px] text-[#5a7580] font-normal">pts</span>
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        week.avgScore > baselineMean + 1
                          ? 'text-rose-600'
                          : week.avgScore < baselineMean - 1
                          ? 'text-emerald-600'
                          : 'text-[#5a7580]'
                      }`}
                    >
                      {week.avgScore > baselineMean
                        ? `+${(week.avgScore - baselineMean).toFixed(1)} vs base`
                        : `${(week.avgScore - baselineMean).toFixed(1)} vs base`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Day-of-Week Aggregates Row */}
          <div className="pt-2 border-t border-[#d9e6e4] grid grid-cols-12 gap-1.5 items-center text-center text-xs">
            <div className="col-span-3 text-left pl-2 font-semibold text-[#5a7580] text-[11px]">
              Day-of-Week Mean:
            </div>
            {dayOfWeekAverages.dayAverages.map((d) => {
              const isPeak = d.name === dayOfWeekAverages.maxDay.name;
              const isLowest = d.name === dayOfWeekAverages.minDay.name;

              return (
                <div
                  key={d.name}
                  className={`col-span-1 p-1 rounded-lg text-[11px] font-mono ${
                    isPeak
                      ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200'
                      : isLowest
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-[#15303a] bg-[#f8fafc]'
                  }`}
                  title={`${d.name} 4-week average: ${d.avg} pts ${isPeak ? '(Highest Day)' : ''}`}
                >
                  <span>{d.avg}</span>
                  {isPeak && <span className="block text-[8px] text-rose-600 font-sans">Peak</span>}
                </div>
              );
            })}
            <div className="col-span-2 text-right pr-2 text-[10px] text-[#5a7580]">
              4-Week Aggregates
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#d9e6e4]/60 text-xs">
        <div className="flex items-center gap-1.5 text-[#5a7580]">
          <span className="font-semibold text-[#15303a]">Distress Intensity Scale:</span>
          <div className="flex items-center gap-1">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#e6f4f1] text-[#134e4a] border border-[#bbf7d0]">
              0–3 Grounded
            </span>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#f1f5f9] text-[#334155] border border-[#cbd5e1]">
              4–6 Baseline
            </span>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#fef9c3] text-[#854d0e] border border-[#fde047]">
              7–10 Moderate
            </span>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#fed7aa] text-[#9a3412] border border-[#fb923c]">
              11–14 Elevated
            </span>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#fecdd3] text-[#881337] border border-[#f43f5e] font-bold">
              15–20 Severe
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#5a7580]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2a7f8f]" />
            <span>Clinical Event</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Survivor Note</span>
          </span>
        </div>
      </div>

      {/* Cyclical Pattern Analytical Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Weekend vs Weekday Analytics */}
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d9e6e4] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#15303a]">Weekend vs Weekday</span>
            <span
              className={`font-mono text-[11px] font-bold ${
                dayOfWeekAverages.weekendVariancePct > 10
                  ? 'text-rose-600'
                  : dayOfWeekAverages.weekendVariancePct < -10
                  ? 'text-emerald-600'
                  : 'text-[#5a7580]'
              }`}
            >
              {dayOfWeekAverages.weekendVariancePct > 0 ? '+' : ''}
              {dayOfWeekAverages.weekendVariancePct}%
            </span>
          </div>
          <div className="text-xs text-[#5a7580] flex justify-between">
            <span>Sat–Sun Mean: <b>{dayOfWeekAverages.weekendAvg}</b></span>
            <span>Mon–Fri Mean: <b>{dayOfWeekAverages.weekdayAvg}</b></span>
          </div>
          <p className="text-[11px] text-[#5a7580] pt-1">
            {dayOfWeekAverages.weekendAvg > dayOfWeekAverages.weekdayAvg + 1.5
              ? 'Weekend vulnerability detected. Isolation and absence of structured weekday routines correlate with higher distress.'
              : dayOfWeekAverages.weekdayAvg > dayOfWeekAverages.weekendAvg + 1.5
              ? 'Weekday stress dominant. Community interactions or daily logistics appear to elevate hyperarousal.'
              : 'Consistent distribution between weekdays and weekends; symptoms follow non-calendar triggers.'}
          </p>
        </div>

        {/* Peak Vulnerability Day */}
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d9e6e4] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#15303a]">Peak Vulnerability Day</span>
            <span className="font-mono text-[11px] font-bold text-rose-600">
              {dayOfWeekAverages.maxDay.name} ({dayOfWeekAverages.maxDay.avg} pts)
            </span>
          </div>
          <div className="text-xs text-[#5a7580] flex justify-between">
            <span>Lowest Day: <b>{dayOfWeekAverages.minDay.name} ({dayOfWeekAverages.minDay.avg} pts)</b></span>
            <span>Delta: <b>+{(dayOfWeekAverages.maxDay.avg - dayOfWeekAverages.minDay.avg).toFixed(1)}</b></span>
          </div>
          <p className="text-[11px] text-[#5a7580] pt-1">
            Schedule proactive check-ins or self-grounding reminders on <b>{dayOfWeekAverages.maxDay.name} mornings</b> to preempt cyclic escalation.
          </p>
        </div>

        {/* Longitudinal Trajectory Progression */}
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d9e6e4] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#15303a]">Monthly Velocity (W4 vs W1)</span>
            {weeks[3] && weeks[0] && (
              <span
                className={`font-mono text-[11px] font-bold ${
                  weeks[3].avgScore > weeks[0].avgScore + 2
                    ? 'text-rose-600'
                    : weeks[3].avgScore < weeks[0].avgScore - 2
                    ? 'text-emerald-600'
                    : 'text-[#5a7580]'
                }`}
              >
                {weeks[3].avgScore > weeks[0].avgScore
                  ? `+${Math.round(((weeks[3].avgScore - weeks[0].avgScore) / Math.max(1, weeks[0].avgScore)) * 100)}%`
                  : `${Math.round(((weeks[3].avgScore - weeks[0].avgScore) / Math.max(1, weeks[0].avgScore)) * 100)}%`}
              </span>
            )}
          </div>
          <div className="text-xs text-[#5a7580] flex justify-between">
            <span>W1: <b>{weeks[0]?.avgScore} pts</b></span>
            <ArrowRight className="w-3 h-3 text-[#5a7580] my-auto" />
            <span>W4: <b>{weeks[3]?.avgScore} pts</b></span>
          </div>
          <p className="text-[11px] text-[#5a7580] pt-1">
            {weeks[3].avgScore > weeks[0].avgScore + 3
              ? 'Marked steep escalation between baseline and final week confirms acute clinical priority.'
              : weeks[3].avgScore < weeks[0].avgScore - 1
              ? 'Progressive recovery trajectory observed across the 4-week observation period.'
              : 'Stable longitudinal trajectory maintaining consistent equilibrium with intake baseline.'}
          </p>
        </div>
      </div>

      {/* Selected Day Inspector Card */}
      {selectedDayEntry && (
        <div className="p-3.5 rounded-xl bg-[#f2f7f6] border border-[#d9e6e4] space-y-2 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d9e6e4]/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#15303a]">
                Day {selectedDayEntry.day} · {selectedDayEntry.date}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  selectedDayComposite >= 14
                    ? 'bg-rose-100 text-rose-800'
                    : selectedDayComposite >= 9
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {selectedDayComposite}/20 Composite
              </span>
              <span className="text-xs text-[#5a7580]">
                (Intake Baseline: {baselineMean.toFixed(1)})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#5a7580]">Variance vs Base:</span>
              <b
                className={`font-mono ${
                  selectedDayComposite > baselineMean + 1
                    ? 'text-rose-600'
                    : selectedDayComposite < baselineMean - 1
                    ? 'text-emerald-600'
                    : 'text-[#15303a]'
                }`}
              >
                {selectedDayComposite > baselineMean
                  ? `+${(selectedDayComposite - baselineMean).toFixed(1)}`
                  : (selectedDayComposite - baselineMean).toFixed(1)}{' '}
                pts
              </b>
            </div>
          </div>

          {/* Metric Breakdown Badges for Selected Day */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white border border-[#d9e6e4]/80 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#5a7580]">
                <Moon className="w-3.5 h-3.5 text-[#6366f1]" />
                <span>Sleep:</span>
              </span>
              <span className="font-mono font-bold text-[#15303a]">{selectedDayEntry.sleep}/4</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#d9e6e4]/80 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#5a7580]">
                <AlertCircle className="w-3.5 h-3.5 text-[#e11d48]" />
                <span>Intrusions:</span>
              </span>
              <span className="font-mono font-bold text-[#15303a]">{selectedDayEntry.intrusions}/4</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#d9e6e4]/80 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#5a7580]">
                <Flame className="w-3.5 h-3.5 text-[#d97706]" />
                <span>Tension:</span>
              </span>
              <span className="font-mono font-bold text-[#15303a]">{selectedDayEntry.tension}/4</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#d9e6e4]/80 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#5a7580]">
                <Users className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>Withdrawal:</span>
              </span>
              <span className="font-mono font-bold text-[#15303a]">{selectedDayEntry.withdrawal}/4</span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-white border border-[#d9e6e4]/80 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#5a7580]">
                <Heart className="w-3.5 h-3.5 text-[#0d9488]" />
                <span>Mood:</span>
              </span>
              <span className="font-mono font-bold text-[#15303a]">{selectedDayEntry.mood}/4</span>
            </div>
          </div>

          {/* Survivor's note on this day */}
          {selectedDayEntry.note && (
            <div className="text-xs text-[#15303a] bg-white p-2.5 rounded-lg border border-[#d9e6e4]/80 italic">
              <span className="font-semibold not-italic text-[#5a7580] mr-1.5">
                Survivor's Check-in Reflection:
              </span>
              "{selectedDayEntry.note}"
            </div>
          )}

          {/* Clinical note on this day if any */}
          {selectedDayNotes.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2a7f8f] block">
                Clinical Actions on Day {selectedDayEntry.day}:
              </span>
              {selectedDayNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-2.5 rounded-lg bg-white border border-[#2a7f8f]/40 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#15303a]">
                      {note.eventTitle || `${note.author} · ${note.category.toUpperCase()}`}
                    </span>
                    {onSelectNote && (
                      <button
                        type="button"
                        onClick={() => onSelectNote(note.id)}
                        className="text-[#2a7f8f] font-semibold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>View in timeline</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-[#334155] leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
