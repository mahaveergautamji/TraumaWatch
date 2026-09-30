import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ArrowUpDown,
  ExternalLink,
  MessageSquarePlus,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
  Calendar,
  Eye,
  Check,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Zap,
} from 'lucide-react';
import { SurvivorProfile, RiskTier, ClinicalNote, CheckInEntry, ClinicalGoal } from '../../types';
import { analyzeTrajectory } from '../../utils/riskEngine';
import { generateSurvivorPdfReport } from '../../utils/pdfExport';
import { TrajectoryChart } from '../common/TrajectoryChart';
import { DistressTrend } from './DistressTrend';
import { DistressCalendarHeatmap } from './DistressCalendarHeatmap';
import { EarlyWarningAlert } from './EarlyWarningAlert';
import { DistressComparisonTable } from './DistressComparisonTable';
import { CorrelationMatrixChart } from './CorrelationMatrixChart';
import { ClinicalGoalsSection } from './ClinicalGoalsSection';

interface CounsellorDashboardProps {
  survivors: SurvivorProfile[];
  selectedSurvivorId: string;
  onSelectSurvivor: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onToggleEscalation: (id: string) => void;
  onAddNote: (id: string, note: Omit<ClinicalNote, 'id' | 'timestamp'>) => void;
  onAddGoal?: (survivorId: string, goal: Omit<ClinicalGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal?: (survivorId: string, goalId: string, updates: Partial<ClinicalGoal>) => void;
  onDeleteGoal?: (survivorId: string, goalId: string) => void;
  onSwitchToSurvivorApp: (id: string) => void;
}

export const CounsellorDashboard: React.FC<CounsellorDashboardProps> = ({
  survivors,
  selectedSurvivorId,
  onSelectSurvivor,
  onMarkReviewed,
  onToggleEscalation,
  onAddNote,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onSwitchToSurvivorApp,
}) => {
  // Filter & Search states
  const [tierFilter, setTierFilter] = useState<'All' | 'EarlyWarning' | RiskTier>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<'early_warning' | 'rapid_first' | 'score_desc' | 'unreviewed'>('early_warning');

  // Chart signal overlay toggle
  const [activeSignalFilter, setActiveSignalFilter] = useState<'all' | 'sleep' | 'intrusions' | 'withdrawal' | 'tension' | 'mood'>('all');

  // New clinical note dialog state
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [noteCategory, setNoteCategory] = useState<ClinicalNote['category']>('observation');
  const [noteText, setNoteText] = useState<string>('');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null);

  // Analyze all survivors
  const analyzedSurvivors = useMemo(() => {
    return survivors.map((s) => ({
      profile: s,
      analysis: analyzeTrajectory(s.history),
    }));
  }, [survivors]);

  // Selected survivor analysis
  const currentCase = useMemo(() => {
    return (
      analyzedSurvivors.find((item) => item.profile.id === selectedSurvivorId) ||
      analyzedSurvivors[0]
    );
  }, [analyzedSurvivors, selectedSurvivorId]);

  // Filtered & Sorted list
  const filteredList = useMemo(() => {
    let list = [...analyzedSurvivors];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.profile.id.toLowerCase().includes(q) ||
          item.profile.contextTag.toLowerCase().includes(q) ||
          item.analysis.reasonTag.toLowerCase().includes(q)
      );
    }

    // Tier filter or Early Warning filter
    if (tierFilter === 'EarlyWarning') {
      list = list.filter((item) => item.analysis.earlyWarning?.isTriggered);
    } else if (tierFilter !== 'All') {
      list = list.filter((item) => item.analysis.tier === tierFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortMode === 'early_warning') {
        const probA = a.analysis.earlyWarning?.spikeProbability ?? 0;
        const probB = b.analysis.earlyWarning?.spikeProbability ?? 0;
        if (probA !== probB) return probB - probA;
        return b.analysis.riskScore - a.analysis.riskScore;
      } else if (sortMode === 'rapid_first') {
        // Rapid deterioration cases surfaced at top
        if (a.analysis.isRapidDeterioration && !b.analysis.isRapidDeterioration) return -1;
        if (!a.analysis.isRapidDeterioration && b.analysis.isRapidDeterioration) return 1;
        // Then by risk score
        return b.analysis.riskScore - a.analysis.riskScore;
      } else if (sortMode === 'score_desc') {
        return b.analysis.riskScore - a.analysis.riskScore;
      } else {
        // Unreviewed first
        if (!a.profile.isReviewed && b.profile.isReviewed) return -1;
        if (a.profile.isReviewed && !b.profile.isReviewed) return 1;
        return b.analysis.riskScore - a.analysis.riskScore;
      }
    });

    return list;
  }, [analyzedSurvivors, searchQuery, tierFilter, sortMode]);

  // Aggregate clinical stats
  const stats = useMemo(() => {
    const total = analyzedSurvivors.length;
    const rapidDeterioration = analyzedSurvivors.filter(
      (s) => s.analysis.isRapidDeterioration
    ).length;
    const earlyWarningCount = analyzedSurvivors.filter(
      (s) => s.analysis.earlyWarning?.isTriggered
    ).length;
    const highRisk = analyzedSurvivors.filter((s) => s.analysis.tier === 'High').length;
    const moderateRisk = analyzedSurvivors.filter((s) => s.analysis.tier === 'Moderate').length;
    const lowRisk = analyzedSurvivors.filter((s) => s.analysis.tier === 'Low').length;
    const pendingReview = analyzedSurvivors.filter((s) => !s.profile.isReviewed).length;
    return {
      total,
      rapidDeterioration,
      earlyWarningCount,
      highRisk,
      moderateRisk,
      lowRisk,
      pendingReview,
    };
  }, [analyzedSurvivors]);

  // Handle Note Submission
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !currentCase) return;

    onAddNote(currentCase.profile.id, {
      author: 'Attending Clinician',
      category: noteCategory,
      content: noteText.trim(),
    });

    setNoteText('');
    setIsAddingNote(false);
  };

  // Handle Export Case PDF
  const handleExportPdf = () => {
    if (!currentCase) return;
    setIsExportingPdf(true);
    try {
      generateSurvivorPdfReport(currentCase.profile, currentCase.analysis);
    } catch (err) {
      console.error('Failed to generate PDF summary report:', err);
    } finally {
      setTimeout(() => {
        setIsExportingPdf(false);
      }, 500);
    }
  };

  // SVG Longitudinal Progression Chart for Selected Case
  const history = currentCase.profile.history;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Triage KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#d9e6e4] shadow-xs">
          <b className="font-serif text-2xl font-semibold text-[#cf4b4b] block">
            {stats.highRisk}
          </b>
          <span className="text-xs text-[#5a7580]">High Priority Cases</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-200/80 bg-rose-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <b className="font-serif text-2xl font-semibold text-rose-600 block">
              {stats.earlyWarningCount}
            </b>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <span className="text-xs text-[#5a7580] flex items-center gap-1 mt-0.5">
            <Zap className="w-3 h-3 text-rose-500" />
            <span>Early Warning Spikes</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d9e6e4] shadow-xs">
          <b className="font-serif text-2xl font-semibold text-[#d9a934] block">
            {stats.moderateRisk}
          </b>
          <span className="text-xs text-[#5a7580]">Moderate / Rising</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#d9e6e4] shadow-xs">
          <b className="font-serif text-2xl font-semibold text-[#3f9d78] block">
            {stats.lowRisk}
          </b>
          <span className="text-xs text-[#5a7580]">Stable vs. Baseline</span>
        </div>
      </div>

      {/* Main Split Layout: Left = Prioritized Triage Queue (340px); Right = Detailed Clinical Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PRIORITIZED QUEUE (md:col-span-5) */}
        <div className="md:col-span-5 space-y-3">
          {/* Chips Filter & Sort */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setTierFilter('All')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  tierFilter === 'All'
                    ? 'bg-[#15303a] text-white font-semibold'
                    : 'bg-[#e8f2f0] text-[#5a7580] hover:text-[#15303a]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTierFilter('EarlyWarning')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  tierFilter === 'EarlyWarning'
                    ? 'bg-rose-700 text-white font-bold shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <Zap className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span>Early Warning ({stats.earlyWarningCount})</span>
              </button>
              {(['High', 'Moderate', 'Low'] as const).map((tier) => (
                <button
                  type="button"
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    tierFilter === tier
                      ? 'bg-[#15303a] text-white font-semibold'
                      : 'bg-[#e8f2f0] text-[#5a7580] hover:text-[#15303a]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Sort selector */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as any)}
              className="text-[11px] p-1 rounded-lg border border-[#d9e6e4] bg-white text-[#15303a] cursor-pointer"
            >
              <option value="early_warning">Sort: Spike Likelihood</option>
              <option value="rapid_first">Sort: Rapid Deterioration</option>
              <option value="score_desc">Sort: Highest Score</option>
              <option value="unreviewed">Sort: Unreviewed First</option>
            </select>
          </div>

          <p className="text-xs text-[#5a7580]">
            Early warning flags calculate spike probability against individual historical baseline.
          </p>

          {/* Cases List */}
          <div className="space-y-2">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5a7580] bg-white rounded-2xl border border-[#d9e6e4]">
                No cases in this filter.
              </div>
            ) : (
              filteredList.map(({ profile, analysis }) => {
                const isSelected = profile.id === currentCase.profile.id;
                const isHigh = analysis.tier === 'High';
                const isModerate = analysis.tier === 'Moderate';

                return (
                  <div
                    key={profile.id}
                    onClick={() => onSelectSurvivor(profile.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left bg-white ${
                      isSelected
                        ? 'border-[#2a7f8f] ring-2 ring-[#2a7f8f]/20 shadow-xs'
                        : 'border-[#d9e6e4] hover:border-[#6fb59a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold text-[#15303a]">
                          {profile.id}
                        </span>
                        {profile.isReviewed && (
                          <span className="text-[11px] text-[#5a7580]">· Reviewed</span>
                        )}
                        {profile.isEscalated && (
                          <span className="text-[11px] text-[#cf4b4b] font-semibold">· Escalated</span>
                        )}
                      </div>

                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-[#cf4b4b] text-white'
                            : isModerate
                            ? 'bg-[#d9a934] text-[#3a2d00]'
                            : 'bg-[#3f9d78] text-white'
                        }`}
                      >
                        {analysis.tier}
                      </span>
                    </div>

                    {/* Early Warning Flag badge if triggered */}
                    {analysis.earlyWarning?.isTriggered && (
                      <div className="my-1.5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-50 text-rose-800 border border-rose-200">
                          <Zap className="w-2.5 h-2.5 text-rose-600 fill-rose-600/30" />
                          <span>Early Warning: {analysis.earlyWarning.spikeProbability}% Spike Risk</span>
                        </span>
                        <span className="text-[10px] text-[#5a7580] font-mono">
                          {analysis.earlyWarning.timeframe.replace('Next ', '')}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-[#5a7580] flex items-center justify-between mt-1">
                      <span>{analysis.reasonTag} · score {analysis.riskScore}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateSurvivorPdfReport(profile, analysis);
                        }}
                        title={`Download PDF for ${profile.id}`}
                        className="p-1 rounded text-[#5a7580] hover:text-[#15303a] hover:bg-[#e8f2f0] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED CASE PANEL (md:col-span-7) */}
        <div className="md:col-span-7 space-y-5">
          {/* Main Case Card */}
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#d9e6e4] pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#15303a]">
                  {currentCase.profile.id}
                </h2>
                <p className="text-xs text-[#5a7580] mt-0.5">
                  {currentCase.profile.contextTag} · {currentCase.profile.assignedCounsellor}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    currentCase.analysis.tier === 'High'
                      ? 'bg-[#cf4b4b] text-white'
                      : currentCase.analysis.tier === 'Moderate'
                      ? 'bg-[#d9a934] text-[#3a2d00]'
                      : 'bg-[#3f9d78] text-white'
                  }`}
                >
                  {currentCase.analysis.tier} · {currentCase.analysis.riskScore}
                </span>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  title="Download clinical summary PDF report of 28-day trajectory, 7-day metrics, and clinical notes"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-[#e8f2f0] border border-[#d9e6e4] text-[#15303a] shadow-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <Download className={`w-3.5 h-3.5 text-[#2a7f8f] ${isExportingPdf ? 'animate-bounce' : ''}`} />
                  <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
                </button>
              </div>
            </div>

            {/* Why Flagged Explanation */}
            <div className="text-xs text-[#15303a] bg-[#e8f2f0] p-3 rounded-xl border border-[#d9e6e4]/60 leading-relaxed">
              <b>Why flagged:</b> {currentCase.analysis.whyFlaggedSummary}
            </div>

            {/* Early Warning Predictive Alert Card */}
            <EarlyWarningAlert
              earlyWarning={currentCase.analysis.earlyWarning}
              survivorId={currentCase.profile.id}
              onTriggerOutreach={() => setIsAddingNote(true)}
            />

            {/* 28-Day Trajectory Trend */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-lg font-semibold text-[#15303a]">
                  28-day trend
                </h3>
                <span className="text-xs text-[#5a7580] font-mono">
                  Baseline: {currentCase.analysis.baselineMean.toFixed(1)}/20
                </span>
              </div>

              <TrajectoryChart
                history={currentCase.profile.history}
                baselineMean={currentCase.analysis.baselineMean}
                showColorBands={true}
                height={220}
              />
            </div>

            {/* Recharts Distress Trend Visualization (7-Day Granular Trajectory vs Baseline) */}
            <DistressTrend
              history={currentCase.profile.history}
              analysis={currentCase.analysis}
              survivorId={currentCase.profile.id}
              clinicalNotes={currentCase.profile.clinicalNotes}
              selectedNoteId={highlightedNoteId}
              onSelectNote={(noteId) => {
                setHighlightedNoteId(noteId);
                setTimeout(() => {
                  const el = document.getElementById(`clinical-note-${noteId}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 60);
              }}
            />

            {/* Calendar Heatmap Component (Summarizes daily distress levels over the past month & spots recurring weekly/cyclical patterns) */}
            <DistressCalendarHeatmap
              history={currentCase.profile.history}
              baselineMean={currentCase.analysis.baselineMean}
              clinicalNotes={currentCase.profile.clinicalNotes}
              onSelectNote={(noteId) => {
                setHighlightedNoteId(noteId);
                setTimeout(() => {
                  const el = document.getElementById(`clinical-note-${noteId}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 60);
              }}
            />

            {/* 7-Day vs. 30-Day Moving Average Comparison Table */}
            <DistressComparisonTable
              history={currentCase.profile.history}
              survivorId={currentCase.profile.id}
            />

            {/* Correlation Matrix Chart: Sleep Quality vs Anxiety Levels */}
            <CorrelationMatrixChart
              history={currentCase.profile.history}
              survivorId={currentCase.profile.id}
            />

            {/* Baseline vs Current & Insights Callout */}
            <div className="pt-2 border-t border-[#d9e6e4] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-semibold text-[#15303a]">
                  Baseline vs. Current Insights
                </h3>
                <span className="text-xs text-[#5a7580]">
                  {currentCase.analysis.insights.stableMetricsCount} of 5 metrics stable
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Most Deteriorated */}
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
                    Most Deteriorated
                  </span>
                  {currentCase.analysis.insights.mostDeteriorated ? (
                    <div>
                      <div className="font-bold text-rose-950">
                        {currentCase.analysis.insights.mostDeteriorated.label}
                      </div>
                      <div className="font-mono text-rose-800 mt-0.5">
                        Base: {currentCase.analysis.insights.mostDeteriorated.baselineVal} → Now:{' '}
                        {currentCase.analysis.insights.mostDeteriorated.currentVal} (+
                        {currentCase.analysis.insights.mostDeteriorated.delta})
                      </div>
                    </div>
                  ) : (
                    <span className="text-rose-700">No severe escalation detected.</span>
                  )}
                </div>

                {/* Most Improved */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    Most Improved / Stabilized
                  </span>
                  {currentCase.analysis.insights.mostImproved ? (
                    <div>
                      <div className="font-bold text-emerald-950">
                        {currentCase.analysis.insights.mostImproved.label}
                      </div>
                      <div className="font-mono text-emerald-800 mt-0.5">
                        Base: {currentCase.analysis.insights.mostImproved.baselineVal} → Now:{' '}
                        {currentCase.analysis.insights.mostImproved.currentVal} (
                        {currentCase.analysis.insights.mostImproved.delta})
                      </div>
                    </div>
                  ) : (
                    <span className="text-emerald-700">Equilibrium consistent with intake.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Explainable Risk - Horizontal Bar Decomposition */}
            <div className="pt-2 border-t border-[#d9e6e4] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-semibold text-[#15303a]">
                  Explainable risk{' '}
                  <small className="text-xs text-[#5a7580] font-sans font-normal">
                    (simulated SHAP-style contributions)
                  </small>
                </h3>
              </div>

              <div className="space-y-2">
                {currentCase.analysis.contributions.map((k) => {
                  const isUp = k.deltaVsBaseline >= 0;
                  const absVal = k.contributionPct;
                  return (
                    <div
                      key={k.feature}
                      className="grid grid-cols-12 items-center gap-2 text-xs"
                    >
                      <span className="col-span-4 text-[#15303a] font-medium truncate">
                        {k.label.split(' ')[0]} {isUp ? '↑' : '↓'}
                      </span>
                      <div className="col-span-6 bg-[#e8f2f0] h-3.5 rounded-md overflow-hidden">
                        <div
                          className={`h-full rounded-md transition-all ${
                            isUp ? 'bg-[#e07a3f]' : 'bg-[#3f9d78]'
                          }`}
                          style={{ width: `${Math.max(6, absVal)}%` }}
                        />
                      </div>
                      <b className="col-span-2 text-right font-mono text-xs">
                        {isUp ? '+' : ''}{k.deltaVsBaseline}
                      </b>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clinical Goals & Wellness Objectives Section */}
            <ClinicalGoalsSection
              survivorId={currentCase.profile.id}
              goals={currentCase.profile.clinicalGoals || []}
              onAddGoal={onAddGoal || (() => {})}
              onUpdateGoal={onUpdateGoal || (() => {})}
              onDeleteGoal={onDeleteGoal || (() => {})}
            />

            {/* Action Buttons */}
            <div className="pt-2 border-t border-[#d9e6e4] grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onMarkReviewed(currentCase.profile.id)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors text-center ${
                  currentCase.profile.isReviewed
                    ? 'bg-[#3f9d78] text-white'
                    : 'bg-[#2a7f8f] hover:bg-[#236b79] text-white'
                }`}
              >
                {currentCase.profile.isReviewed ? 'Reviewed ✓' : 'Mark reviewed'}
              </button>

              <button
                type="button"
                onClick={() => onToggleEscalation(currentCase.profile.id)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors text-center ${
                  currentCase.profile.isEscalated
                    ? 'bg-[#cf4b4b] text-white'
                    : 'bg-[#cf4b4b]/15 text-[#cf4b4b] hover:bg-[#cf4b4b] hover:text-white'
                }`}
              >
                {currentCase.profile.isEscalated ? 'Escalated ✕' : 'Escalate'}
              </button>

              <button
                type="button"
                onClick={() => setIsAddingNote(!isAddingNote)}
                className="py-2 px-3 rounded-xl text-xs font-medium bg-white hover:bg-[#f2f7f6] border border-[#d9e6e4] text-[#15303a] transition-colors text-center"
              >
                {isAddingNote ? 'Cancel note' : 'Add note'}
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                title="Download complete clinical report as PDF for offline case review"
                className="py-2 px-3 rounded-xl text-xs font-medium bg-[#f2f7f6] hover:bg-[#e8f2f0] border border-[#d9e6e4] text-[#15303a] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className={`w-3.5 h-3.5 text-[#2a7f8f] ${isExportingPdf ? 'animate-bounce' : ''}`} />
                <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
              </button>
            </div>

            {/* Add Note Form */}
            {isAddingNote && (
              <form onSubmit={handleSaveNote} className="p-3 bg-[#e8f2f0] rounded-xl space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record counsellor observation or follow-up plan (no identifying details)..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#d9e6e4] bg-white focus:outline-none focus:ring-2 focus:ring-[#2a7f8f]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="text-xs text-[#5a7580]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs bg-[#2a7f8f] text-white rounded-lg font-medium"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            {currentCase.profile.clinicalNotes.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-xs font-semibold text-[#15303a]">
                    Clinical Notes ({currentCase.profile.clinicalNotes.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="text-[11px] font-semibold text-[#2a7f8f] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Notes in PDF</span>
                  </button>
                </div>
                {currentCase.profile.clinicalNotes.map((n) => {
                  const isHighlighted = highlightedNoteId === n.id;
                  return (
                    <div
                      id={`clinical-note-${n.id}`}
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs text-[#15303a] transition-all duration-300 ${
                        isHighlighted
                          ? 'bg-teal-50/80 border-[#2a7f8f] ring-2 ring-[#2a7f8f]/30 shadow-sm'
                          : 'bg-[#f2f7f6] border-[#d9e6e4]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[#5a7580] text-[11px] mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#15303a]">{n.author}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white border border-[#d9e6e4] text-[#2a7f8f]">
                            {n.category}
                          </span>
                          {n.day && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#2a7f8f]/10 text-[#2a7f8f]">
                              Day {n.day} Trajectory Flag
                            </span>
                          )}
                        </div>
                        <span>{n.timestamp}</span>
                      </div>

                      {/* Event title & Metric impact tag if present */}
                      {n.eventTitle && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="font-bold text-xs text-[#15303a]">{n.eventTitle}</span>
                          {n.metricImpact && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                n.metricImpact.type === 'dip'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : n.metricImpact.type === 'spike'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {n.metricImpact.type === 'dip'
                                ? '▼ Metric Dip'
                                : n.metricImpact.type === 'spike'
                                ? '▲ Metric Surge'
                                : '● Stabilized'}{' '}
                              ({n.metricImpact.delta})
                            </span>
                          )}
                        </div>
                      )}

                      <p className="leading-relaxed text-[#334155]">{n.content}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-[11px] text-[#5a7580] border-t border-[#d9e6e4] pt-2 mb-0">
              Flags are priority signals for review, not clinical conclusions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
