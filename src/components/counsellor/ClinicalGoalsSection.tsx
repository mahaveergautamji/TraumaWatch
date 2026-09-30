import React, { useState } from 'react';
import { ClinicalGoal } from '../../types';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  Moon,
  Flame,
  AlertCircle,
  Users,
  Brain,
  ShieldCheck,
  Award,
  Check,
  X,
} from 'lucide-react';

interface ClinicalGoalsSectionProps {
  survivorId: string;
  goals: ClinicalGoal[];
  onAddGoal: (survivorId: string, goal: Omit<ClinicalGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (survivorId: string, goalId: string, updates: Partial<ClinicalGoal>) => void;
  onDeleteGoal: (survivorId: string, goalId: string) => void;
}

const CATEGORY_CONFIG: Record<
  ClinicalGoal['category'],
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; badge: string }
> = {
  sleep: {
    label: 'Sleep Restitution',
    icon: Moon,
    color: '#6366f1',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  tension: {
    label: 'Tension De-escalation',
    icon: Flame,
    color: '#d97706',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  intrusions: {
    label: 'Intrusion Management',
    icon: AlertCircle,
    color: '#e11d48',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  connection: {
    label: 'Social Reconnection',
    icon: Users,
    color: '#0d9488',
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  grounding: {
    label: 'Somatic Grounding',
    icon: Brain,
    color: '#2a7f8f',
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  },
  routine: {
    label: 'Stabilizing Routine',
    icon: ShieldCheck,
    color: '#475569',
    badge: 'bg-slate-50 text-slate-800 border-slate-200',
  },
};

const SMART_PRESETS: {
  title: string;
  category: ClinicalGoal['category'];
  description: string;
  targetValue: number;
  unit: string;
  clinicianNotes: string;
}[] = [
  {
    title: 'Restore Circadian Sleep Continuity',
    category: 'sleep',
    description: 'Achieve ≥ 5 continuous hours of restful sleep without nocturnal panic awakenings.',
    targetValue: 5,
    unit: 'nights',
    clinicianNotes: 'Focus on progressive muscle relaxation and dark, cool sleeping space.',
  },
  {
    title: 'Bedtime 4-7-8 Somatic Wind-Down',
    category: 'grounding',
    description: 'Complete 10 minutes of guided 4-7-8 breathing and sensory anchor before lights out.',
    targetValue: 7,
    unit: 'sessions',
    clinicianNotes: 'Encourage survivor to log check-in feeling post-exercise.',
  },
  {
    title: 'Peer Support Outreach Call',
    category: 'connection',
    description: 'Initiate 1 supportive telephone or in-person contact with community worker or trusted peer.',
    targetValue: 2,
    unit: 'contacts',
    clinicianNotes: 'Mitigates withdrawal tendency during triggered anniversary periods.',
  },
  {
    title: 'Autonomic Tension Reduction below 2.0',
    category: 'tension',
    description: 'Maintain daytime somatic tension score at or below personal baseline for 5 consecutive days.',
    targetValue: 5,
    unit: 'days',
    clinicianNotes: 'Twice daily sensory orientation (5-4-3-2-1 technique) to dampen hypervigilance.',
  },
  {
    title: 'Dream Rescripting Imagery Practice',
    category: 'intrusions',
    description: 'Practice safe-ending visualization protocol following intrusive flashback episode.',
    targetValue: 4,
    unit: 'sessions',
    clinicianNotes: 'Rescripts trauma memories into neutral or empowering narrative closures.',
  },
];

export const ClinicalGoalsSection: React.FC<ClinicalGoalsSectionProps> = ({
  survivorId,
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // New goal form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ClinicalGoal['category']>('sleep');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetValue, setNewTargetValue] = useState<number>(5);
  const [newUnit, setNewUnit] = useState('days');
  const [newDeadline, setNewDeadline] = useState('Oct 6, 2026');
  const [newNotes, setNewNotes] = useState('');

  // Summary statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;
  const inProgressGoals = goals.filter((g) => g.status === 'in_progress').length;
  const averageProgress =
    totalGoals > 0
      ? Math.round(
          goals.reduce((acc, g) => acc + Math.min(100, (g.currentValue / Math.max(1, g.targetValue)) * 100), 0) /
            totalGoals
        )
      : 0;

  const filteredGoals =
    filterCategory === 'all'
      ? goals
      : goals.filter((g) => g.category === filterCategory);

  const handleApplyPreset = (preset: (typeof SMART_PRESETS)[0]) => {
    setNewTitle(preset.title);
    setNewCategory(preset.category);
    setNewDescription(preset.description);
    setNewTargetValue(preset.targetValue);
    setNewUnit(preset.unit);
    setNewNotes(preset.clinicianNotes);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddGoal(survivorId, {
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || 'Track daily therapeutic milestone.',
      targetValue: Math.max(1, Number(newTargetValue)),
      currentValue: 0,
      unit: newUnit.trim() || 'days',
      deadline: newDeadline.trim() || 'Next 7 days',
      status: 'in_progress',
      clinicianNotes: newNotes.trim() || undefined,
    });

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewNotes('');
    setIsModalOpen(false);
  };

  const handleIncrement = (goal: ClinicalGoal) => {
    const nextVal = Math.min(goal.targetValue, goal.currentValue + 1);
    const isNowComplete = nextVal >= goal.targetValue;
    onUpdateGoal(survivorId, goal.id, {
      currentValue: nextVal,
      status: isNowComplete ? 'completed' : goal.status,
    });
  };

  const handleDecrement = (goal: ClinicalGoal) => {
    const nextVal = Math.max(0, goal.currentValue - 1);
    onUpdateGoal(survivorId, goal.id, {
      currentValue: nextVal,
      status: goal.status === 'completed' && nextVal < goal.targetValue ? 'in_progress' : goal.status,
    });
  };

  const handleToggleComplete = (goal: ClinicalGoal) => {
    if (goal.status === 'completed') {
      onUpdateGoal(survivorId, goal.id, {
        status: 'in_progress',
        currentValue: Math.max(0, goal.targetValue - 1),
      });
    } else {
      onUpdateGoal(survivorId, goal.id, {
        status: 'completed',
        currentValue: goal.targetValue,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#d9e6e4] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#d9e6e4]/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2a7f8f]/10 text-[#2a7f8f] flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-[#15303a]">
              Clinical Goals & Short-Term Wellness Objectives
            </h3>
            <p className="text-xs text-[#5a7580]">
              Track individualized therapeutic milestones, somatic targets, and restorative recovery protocols
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#2a7f8f] hover:bg-[#236b79] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Set Clinical Goal</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d9e6e4]">
          <span className="text-[10px] text-[#5a7580] uppercase tracking-wider font-semibold block">
            Active Objectives
          </span>
          <span className="font-mono text-lg font-bold text-[#15303a]">
            {inProgressGoals} <span className="text-xs text-[#5a7580] font-normal">in progress</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d9e6e4]">
          <span className="text-[10px] text-[#5a7580] uppercase tracking-wider font-semibold block">
            Completed Goals
          </span>
          <span className="font-mono text-lg font-bold text-emerald-600">
            {completedGoals} <span className="text-xs text-[#5a7580] font-normal">achieved</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d9e6e4]">
          <span className="text-[10px] text-[#5a7580] uppercase tracking-wider font-semibold block">
            Overall Progress
          </span>
          <span className="font-mono text-lg font-bold text-[#2a7f8f]">
            {averageProgress}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d9e6e4]">
          <span className="text-[10px] text-[#5a7580] uppercase tracking-wider font-semibold block">
            Intervention Focus
          </span>
          <span className="text-xs font-semibold text-[#15303a] truncate block">
            {goals[0]?.title || 'Baseline Stabilization'}
          </span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`px-2.5 py-1 rounded-full font-medium transition-all ${
            filterCategory === 'all'
              ? 'bg-[#15303a] text-white font-semibold'
              : 'bg-[#f2f7f6] text-[#5a7580] hover:text-[#15303a]'
          }`}
        >
          All Goals ({goals.length})
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([catKey, catMeta]) => {
          const count = goals.filter((g) => g.category === catKey).length;
          if (count === 0) return null;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setFilterCategory(catKey)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                filterCategory === catKey
                  ? 'bg-[#15303a] text-white font-semibold'
                  : 'bg-[#f2f7f6] text-[#5a7580] hover:text-[#15303a]'
              }`}
            >
              <span>{catMeta.label}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Goals List with Progress Bars */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5a7580] bg-[#f8fafc] rounded-xl border border-dashed border-[#d9e6e4]">
            <Target className="w-8 h-8 text-[#5a7580]/40 mx-auto mb-2" />
            <p className="font-semibold text-[#15303a]">No clinical goals in this category.</p>
            <p className="mt-0.5">Click "+ Set Clinical Goal" to create an individualized milestone.</p>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const cat = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.routine;
            const Icon = cat.icon;
            const pct = Math.min(100, Math.round((goal.currentValue / Math.max(1, goal.targetValue)) * 100));
            const isComplete = goal.status === 'completed' || pct >= 100;

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-xl border transition-all ${
                  isComplete
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-[#d9e6e4] hover:border-[#2a7f8f]'
                }`}
              >
                {/* Top Row: Category, Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.badge}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{cat.label}</span>
                      </span>

                      <span className="text-[11px] text-[#5a7580] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Target: {goal.deadline}</span>
                      </span>

                      {isComplete && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Goal Achieved</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-sm text-[#15303a]">
                      {goal.title}
                    </h4>
                    <p className="text-xs text-[#5a7580] leading-relaxed">
                      {goal.description}
                    </p>
                  </div>

                  {/* Actions: +1 / -1 / Complete / Delete */}
                  <div className="flex items-center gap-1 self-end sm:self-start shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDecrement(goal)}
                      disabled={goal.currentValue <= 0}
                      title="Decrement progress by 1"
                      className="w-7 h-7 rounded-lg border border-[#d9e6e4] bg-white hover:bg-slate-50 text-[#5a7580] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    >
                      -1
                    </button>

                    <button
                      type="button"
                      onClick={() => handleIncrement(goal)}
                      disabled={isComplete}
                      title="Increment progress by 1"
                      className="w-7 h-7 rounded-lg border border-[#d9e6e4] bg-white hover:bg-slate-50 text-[#15303a] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    >
                      +1
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleComplete(goal)}
                      title={isComplete ? 'Mark In Progress' : 'Mark Complete'}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        isComplete
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white hover:bg-[#e8f2f0] text-[#2a7f8f] border-[#2a7f8f]/40'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isComplete ? 'Completed' : 'Complete'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteGoal(survivorId, goal.id)}
                      title="Delete goal"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Numerical Metrics */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#15303a]">Progress:</span>
                      <span className="font-mono font-bold text-[#15303a]">
                        {goal.currentValue} of {goal.targetValue} {goal.unit}
                      </span>
                    </div>

                    <span
                      className={`font-mono text-xs font-bold ${
                        isComplete ? 'text-emerald-700' : 'text-[#2a7f8f]'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* The Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete
                          ? 'bg-emerald-500'
                          : pct >= 50
                          ? 'bg-[#2a7f8f]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Clinician Rationale Note */}
                {goal.clinicianNotes && (
                  <div className="mt-2.5 pt-2 border-t border-[#d9e6e4]/60 text-[11px] text-[#334155] bg-white/70 p-2 rounded-lg border border-[#d9e6e4]/40">
                    <span className="font-semibold text-[#5a7580] mr-1">
                      Clinician Rationale:
                    </span>
                    {goal.clinicianNotes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Set New Clinical Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#d9e6e4] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#d9e6e4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#2a7f8f]" />
                <h3 className="font-serif font-bold text-base text-[#15303a]">
                  Set Short-Term Clinical Goal · Case {survivorId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateGoal} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Presets Strip */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#15303a] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Evidence-Based Presets (click to fill):</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SMART_PRESETS.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#f2f7f6] hover:bg-[#2a7f8f]/10 text-[#2a7f8f] border border-[#2a7f8f]/20 font-medium transition-colors text-left"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#15303a]">
                  Objective Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Restore Sleep Continuity"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d9e6e4] focus:outline-hidden focus:ring-2 focus:ring-[#2a7f8f]"
                />
              </div>

              {/* Category & Deadline in 2 cols */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#15303a]">Domain Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#d9e6e4] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2a7f8f]"
                  >
                    <option value="sleep">Sleep Restitution</option>
                    <option value="tension">Tension De-escalation</option>
                    <option value="intrusions">Intrusion Management</option>
                    <option value="connection">Social Reconnection</option>
                    <option value="grounding">Somatic Grounding</option>
                    <option value="routine">Stabilizing Routine</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#15303a]">Target Date / Horizon</label>
                  <input
                    type="text"
                    placeholder="e.g. Oct 6, 2026"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#d9e6e4] focus:outline-hidden focus:ring-2 focus:ring-[#2a7f8f]"
                  />
                </div>
              </div>

              {/* Target Value & Unit in 2 cols */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#15303a]">Target Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#d9e6e4] focus:outline-hidden focus:ring-2 focus:ring-[#2a7f8f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#15303a]">Unit of Measurement</label>
                  <input
                    type="text"
                    placeholder="e.g. nights, sessions, days"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#d9e6e4] focus:outline-hidden focus:ring-2 focus:ring-[#2a7f8f]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#15303a]">Milestone Criteria / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Describe the clinical target and instructions for the survivor..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d9e6e4] focus:outline-hidden focus:ring-2 focus:ring-[#2a7f8f]"
                />
              </div>

              {/* Clinician Rationale */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#15303a]">Clinician Rationale (Internal)</label>
                <input
                  type="text"
                  placeholder="Why this objective matters for this survivor's trajectory..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#d9e6e4] focus:outline-hidden focus:ring-2 focus:ring-[#2a7f8f]"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#d9e6e4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5a7580] hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2a7f8f] hover:bg-[#236b79] text-white shadow-xs"
                >
                  Save Clinical Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
