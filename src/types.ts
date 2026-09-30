export type RiskTier = 'Low' | 'Moderate' | 'High';

export interface CheckInEntry {
  day: number; // 1 to 28
  date: string; // ISO date string or formatted like "Day 1", "Sep 1"
  mood: number; // 0 (Peaceful/Grounded) to 4 (Severe Distress)
  sleep: number; // 0 (Deep/Restful) to 4 (Severe Insomnia / Nightmares)
  tension: number; // 0 (Relaxed/Safe) to 4 (High Hypervigilance / Panic)
  withdrawal: number; // 0 (Connected/Social) to 4 (Complete Isolation)
  intrusions: number; // 0 (None) to 4 (Intense Flashbacks / Reliving)
  note?: string; // Optional private reflection
}

export interface FeatureContribution {
  feature: 'sleep' | 'intrusions' | 'withdrawal' | 'tension' | 'mood';
  label: string;
  direction: 'up' | 'down' | 'neutral';
  contributionPct: number; // e.g. 38%
  deltaVsBaseline: number; // difference from individual baseline
  clinicalInsight: string;
}

export interface DomainMetricComparison {
  feature: 'sleep' | 'intrusions' | 'withdrawal' | 'tension' | 'mood';
  label: string;
  baselineVal: number; // First 7-day average (0-4 scale)
  currentVal: number; // Recent window average (0-4 scale)
  delta: number; // current - baseline (positive = worsened/higher distress, negative = improved)
  deltaPct: number; // percentage change relative to baseline or scale
  status: 'deteriorated' | 'improved' | 'stable';
}

export interface MetricInsights {
  mostDeteriorated: DomainMetricComparison | null;
  mostImproved: DomainMetricComparison | null;
  stableMetricsCount: number;
  overallNarrative: string;
}

export interface EarlyWarningFactor {
  factor: string;
  impact: 'critical' | 'moderate' | 'mild';
  description: string;
  divergenceZScore: number;
}

export interface EarlyWarningPrediction {
  isTriggered: boolean;
  spikeProbability: number; // 0 to 100%
  warningLevel: 'High' | 'Moderate' | 'Low' | 'Nominal';
  timeframe: string; // e.g. "Next 24–48 hours" or "Next 48–72 hours"
  baselineDivergenceZScore: number; // Standard deviations from long-term baseline
  precursorFactors: EarlyWarningFactor[];
  recommendedIntervention: string;
  confidenceScore: number; // Model estimation confidence (0–100%)
  consecutiveEscalationDays: number;
}

export interface RiskAnalysis {
  riskScore: number; // 0 to 100
  tier: RiskTier;
  reasonTag: string; // e.g. "Rapid deterioration · 4d"
  whyFlaggedSummary: string; // Clinician explanation
  gentleSurvivorStatus: string; // Non-diagnostic warm status for survivor
  currentSeverityScore: number; // Normalized 0-100
  rateOfChange: number; // Positive = worsening slope
  persistenceDays: number; // Days in last 7 above baseline + 1.2 std
  baselineMean: number; // Baseline daily sum average (Days 1-7)
  baselineStd: number;
  recentAvgScore: number; // Recent 3-day average
  contributions: FeatureContribution[];
  domainComparisons: DomainMetricComparison[];
  insights: MetricInsights;
  isRapidDeterioration: boolean;
  earlyWarning: EarlyWarningPrediction;
}

export interface ClinicalNote {
  id: string;
  timestamp: string;
  author: string;
  content: string;
  category: 'observation' | 'outreach' | 'escalation' | 'session';
  day?: number; // Corresponding longitudinal day (e.g. 24)
  eventTitle?: string; // e.g. "Somatic Grounding Session", "Telephone Outreach"
  metricImpact?: {
    type: 'dip' | 'spike' | 'stabilized';
    metric: string; // e.g. "Composite", "Tension", "Withdrawal"
    delta: string; // e.g. "-2 pts dip", "+3 pts spike"
    description: string; // Clinical explanation of visual shift
  };
}

export interface SurvivorProfile {
  id: string; // Synthetic ID e.g. "S-104"
  pseudonym: string; // E.g. "Case 104"
  intakeDate: string;
  contextTag: string; // Synthetic non-identifying context e.g. "Displacement survivor · Month 3"
  isReviewed: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  isEscalated: boolean;
  history: CheckInEntry[];
  clinicalNotes: ClinicalNote[];
  assignedCounsellor: string;
}
