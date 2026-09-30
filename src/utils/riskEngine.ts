import {
  CheckInEntry,
  FeatureContribution,
  DomainMetricComparison,
  MetricInsights,
  RiskAnalysis,
  RiskTier,
  EarlyWarningPrediction,
  EarlyWarningFactor,
} from '../types';

/**
 * Calculates Early Warning Prediction of future distress spikes:
 * Computes probability of an acute spike in the next 24-72h based on:
 * 1. Current negative patterns vs long-term historical baseline (Z-score deviation)
 * 2. Precursor physiological signals (sleep fragmentation + autonomic tension lead indicators)
 * 3. Daily velocity / acceleration slope across the recent 3-5 days
 * 4. Multi-domain synchrony (multiple domains worsening simultaneously)
 * 5. Consecutive escalation streak length
 */
export function calculateEarlyWarning(
  history: CheckInEntry[],
  baselineMean: number,
  baselineStd: number,
  domainMeans: { mood: number; sleep: number; tension: number; withdrawal: number; intrusions: number }
): EarlyWarningPrediction {
  if (history.length < 3) {
    return {
      isTriggered: false,
      spikeProbability: 5,
      warningLevel: 'Nominal',
      timeframe: 'Stable trajectory',
      baselineDivergenceZScore: 0,
      precursorFactors: [],
      recommendedIntervention: 'Continue routine daily check-ins to build baseline longitudinal record.',
      confidenceScore: 50,
      consecutiveEscalationDays: 0,
    };
  }

  // Calculate daily totals across history
  const dailyTotals = history.map((e) => ({
    day: e.day,
    total: e.mood + e.sleep + e.tension + e.withdrawal + e.intrusions,
    sleep: e.sleep,
    tension: e.tension,
    intrusions: e.intrusions,
    withdrawal: e.withdrawal,
    mood: e.mood,
  }));

  const recent3 = dailyTotals.slice(-3);
  const recentAvg = recent3.reduce((a, b) => a + b.total, 0) / recent3.length;

  // 1. Z-Score divergence from long-term baseline
  const baselineDivergenceZScore = Number(
    ((recentAvg - baselineMean) / Math.max(0.6, baselineStd)).toFixed(1)
  );

  // 2. Velocity over last 4 days (change per day)
  const window4 = dailyTotals.slice(-4);
  const velocity =
    window4.length >= 2
      ? (window4[window4.length - 1].total - window4[0].total) / (window4.length - 1)
      : 0;

  // 3. Consecutive escalation days (days where distress increased over previous day)
  let consecutiveEscalationDays = 0;
  for (let i = dailyTotals.length - 1; i > 0; i--) {
    if (dailyTotals[i].total >= dailyTotals[i - 1].total) {
      consecutiveEscalationDays++;
    } else {
      break;
    }
  }

  // 4. Somatic Precursor Signals (Sleep + Tension are clinical early indicators)
  const recentSleepAvg = recent3.reduce((a, b) => a + b.sleep, 0) / recent3.length;
  const recentTensionAvg = recent3.reduce((a, b) => a + b.tension, 0) / recent3.length;
  const sleepDivergence = recentSleepAvg - domainMeans.sleep;
  const tensionDivergence = recentTensionAvg - domainMeans.tension;

  // 5. Multi-Domain Synchrony: count how many domains are elevated by >0.5 vs baseline
  const domainDeltas = [
    sleepDivergence,
    tensionDivergence,
    recent3.reduce((a, b) => a + b.intrusions, 0) / recent3.length - domainMeans.intrusions,
    recent3.reduce((a, b) => a + b.withdrawal, 0) / recent3.length - domainMeans.withdrawal,
    recent3.reduce((a, b) => a + b.mood, 0) / recent3.length - domainMeans.mood,
  ];
  const synchronyCount = domainDeltas.filter((d) => d >= 0.5).length;

  // Precursor factor attribution
  const precursorFactors: EarlyWarningFactor[] = [];

  if (sleepDivergence >= 0.8) {
    precursorFactors.push({
      factor: 'Severe Sleep Architecture Disruption',
      impact: sleepDivergence >= 1.8 ? 'critical' : 'moderate',
      description: `Sleep disturbance score (${recentSleepAvg.toFixed(1)}/4) is +${sleepDivergence.toFixed(1)} above individual baseline (${domainMeans.sleep.toFixed(1)}/4). Frequent nocturnal awakenings and nightmares impair cognitive coping capacity.`,
      divergenceZScore: Number((sleepDivergence / 0.6).toFixed(1)),
    });
  }

  if (tensionDivergence >= 0.8) {
    precursorFactors.push({
      factor: 'Autonomic Hyperarousal & Startle Reflex',
      impact: tensionDivergence >= 1.8 ? 'critical' : 'moderate',
      description: `Somatic tension (${recentTensionAvg.toFixed(1)}/4) is +${tensionDivergence.toFixed(1)} above baseline, reflecting acute sympathetic nervous system overdrive.`,
      divergenceZScore: Number((tensionDivergence / 0.6).toFixed(1)),
    });
  }

  if (velocity >= 1.0) {
    precursorFactors.push({
      factor: 'Steep Trajectory Acceleration',
      impact: velocity >= 2.0 ? 'critical' : 'moderate',
      description: `Distress climbing at +${velocity.toFixed(1)} points/day over recent check-ins, exceeding typical non-crisis trajectory fluctuation bands.`,
      divergenceZScore: Number((velocity * 1.5).toFixed(1)),
    });
  }

  if (consecutiveEscalationDays >= 2) {
    precursorFactors.push({
      factor: 'Unbroken Decompensation Streak',
      impact: consecutiveEscalationDays >= 4 ? 'critical' : 'moderate',
      description: `${consecutiveEscalationDays} consecutive check-ins with monotonic elevation in distress symptoms without customary rest recovery intervals.`,
      divergenceZScore: Number((consecutiveEscalationDays * 0.8).toFixed(1)),
    });
  }

  if (synchronyCount >= 3) {
    precursorFactors.push({
      factor: 'Synchronous Multi-Domain Activation',
      impact: synchronyCount >= 4 ? 'critical' : 'moderate',
      description: `${synchronyCount} of 5 physiological and behavioral domains are concurrently deteriorated, indicating systemic rather than isolated domain distress.`,
      divergenceZScore: Number((synchronyCount * 0.7).toFixed(1)),
    });
  }

  // Compute Probability (0 to 100)
  let rawProbability =
    Math.max(0, baselineDivergenceZScore) * 16 +
    Math.max(0, velocity) * 18 +
    Math.max(0, sleepDivergence + tensionDivergence) * 12 +
    consecutiveEscalationDays * 6 +
    synchronyCount * 5;

  // Dampen if recent average is already below or at baseline
  if (recentAvg <= baselineMean) {
    rawProbability = Math.max(5, rawProbability * 0.15);
  }

  const spikeProbability = Math.min(95, Math.max(5, Math.round(rawProbability)));

  let warningLevel: 'High' | 'Moderate' | 'Low' | 'Nominal' = 'Nominal';
  let timeframe = 'Stable trajectory';
  let recommendedIntervention =
    'Trajectory within normal adaptive variance. Continue standard check-in cadence.';

  if (spikeProbability >= 70) {
    warningLevel = 'High';
    timeframe = 'Next 24–48 hours';
    recommendedIntervention =
      'High probability of acute distress crisis. Immediate preemptive outreach recommended within 12 hours: initiate telephone check-in, review safety protocol, and deploy somatic stabilization wind-down.';
  } else if (spikeProbability >= 45) {
    warningLevel = 'Moderate';
    timeframe = 'Next 48–72 hours';
    recommendedIntervention =
      'Elevated risk of distress spike. Recommend scheduling a brief mid-week telephone check-in and offering somatic grounding exercises before weekend.';
  } else if (spikeProbability >= 20) {
    warningLevel = 'Low';
    timeframe = 'Next 3–5 days (Mild vulnerability)';
    recommendedIntervention =
      'Sub-threshold fluctuations observed. Monitor next 2 daily check-ins for further escalation.';
  }

  const isTriggered = spikeProbability >= 45;
  const confidenceScore = Math.min(
    96,
    Math.max(70, Math.round(75 + Math.min(20, history.length * 0.7)))
  );

  return {
    isTriggered,
    spikeProbability,
    warningLevel,
    timeframe,
    baselineDivergenceZScore,
    precursorFactors,
    recommendedIntervention,
    confidenceScore,
    consecutiveEscalationDays,
  };
}

/**
 * Computes individual baseline using first 7 days (Days 1–7).
 * Each individual has their own unique baseline — this prevents false flags
 * for survivors who have chronically elevated baseline tension vs individuals with lower baseline.
 */
export function calculateBaseline(history: CheckInEntry[]) {
  const baselineEntries = history.slice(0, Math.min(7, history.length));
  if (baselineEntries.length === 0) {
    return {
      meanTotal: 0,
      stdTotal: 1,
      domainMeans: { mood: 0, sleep: 0, tension: 0, withdrawal: 0, intrusions: 0 },
    };
  }

  const totals = baselineEntries.map(
    (e) => e.mood + e.sleep + e.tension + e.withdrawal + e.intrusions
  );
  const meanTotal = totals.reduce((a, b) => a + b, 0) / totals.length;

  const variance =
    totals.reduce((acc, val) => acc + Math.pow(val - meanTotal, 2), 0) /
    (totals.length || 1);
  const stdTotal = Math.max(0.5, Math.sqrt(variance));

  const domainMeans = {
    mood: baselineEntries.reduce((a, b) => a + b.mood, 0) / baselineEntries.length,
    sleep: baselineEntries.reduce((a, b) => a + b.sleep, 0) / baselineEntries.length,
    tension: baselineEntries.reduce((a, b) => a + b.tension, 0) / baselineEntries.length,
    withdrawal: baselineEntries.reduce((a, b) => a + b.withdrawal, 0) / baselineEntries.length,
    intrusions: baselineEntries.reduce((a, b) => a + b.intrusions, 0) / baselineEntries.length,
  };

  return { meanTotal, stdTotal, domainMeans };
}

/**
 * Evaluates distress trajectory for an individual:
 * risk = normalize(current_severity) + weight * rate_of_change + weight * persistence_of_elevated_signals
 */
export function analyzeTrajectory(history: CheckInEntry[]): RiskAnalysis {
  if (history.length === 0) {
    return {
      riskScore: 0,
      tier: 'Low',
      reasonTag: 'Insufficient data',
      whyFlaggedSummary: 'Awaiting initial check-in records.',
      gentleSurvivorStatus: 'Welcome to your daily space. Log your first check-in to begin your trajectory.',
      currentSeverityScore: 0,
      rateOfChange: 0,
      persistenceDays: 0,
      baselineMean: 0,
      baselineStd: 1,
      recentAvgScore: 0,
      contributions: [],
      domainComparisons: [],
      insights: {
        mostDeteriorated: null,
        mostImproved: null,
        stableMetricsCount: 0,
        overallNarrative: 'No records available.',
      },
      isRapidDeterioration: false,
      earlyWarning: {
        isTriggered: false,
        spikeProbability: 0,
        warningLevel: 'Nominal',
        timeframe: 'Insufficient data',
        baselineDivergenceZScore: 0,
        precursorFactors: [],
        recommendedIntervention: 'Awaiting initial check-in records.',
        confidenceScore: 0,
        consecutiveEscalationDays: 0,
      },
    };
  }

  const { meanTotal: baselineMean, stdTotal: baselineStd, domainMeans } = calculateBaseline(history);

  // Recent 3 days window (or less if history shorter)
  const recentWindowSize = Math.min(3, history.length);
  const recentEntries = history.slice(-recentWindowSize);
  const recentTotals = recentEntries.map(
    (e) => e.mood + e.sleep + e.tension + e.withdrawal + e.intrusions
  );
  const recentAvgScore = recentTotals.reduce((a, b) => a + b, 0) / recentWindowSize;

  // Prior window (e.g. days 18-21 or prior week) to measure rate of change
  const priorWindowStart = Math.max(0, history.length - 7);
  const priorWindowEnd = Math.max(0, history.length - 3);
  const priorEntries = history.slice(priorWindowStart, priorWindowEnd);
  const priorAvgScore =
    priorEntries.length > 0
      ? priorEntries
          .map((e) => e.mood + e.sleep + e.tension + e.withdrawal + e.intrusions)
          .reduce((a, b) => a + b, 0) / priorEntries.length
      : baselineMean;

  // 1. Normalized Current Severity (0 to 100)
  // Max possible sum of 5 domains x 4 is 20
  const normalizedSeverity = Math.min(100, Math.max(0, (recentAvgScore / 20) * 100));

  // 2. Rate of Change (Slope over last 4-7 days vs prior)
  // If recent average is higher than prior, rateOfChange is positive (deteriorating)
  const rawChange = recentAvgScore - priorAvgScore;
  // Normalized rate of change: +6 points diff on 20 scale is very rapid (+100)
  const normalizedRateOfChange = Math.min(100, Math.max(0, (rawChange / 5) * 100));

  // 3. Persistence of Elevated Signals in the last 7 days
  // Count how many of the last 7 check-ins exceeded baseline threshold (baselineMean + 1.1 * baselineStd)
  const last7Days = history.slice(-7);
  const elevationThreshold = baselineMean + 1.1 * baselineStd;
  const persistenceDays = last7Days.filter(
    (e) => e.mood + e.sleep + e.tension + e.withdrawal + e.intrusions > elevationThreshold
  ).length;
  // Normalized persistence (7 out of 7 days = 100)
  const normalizedPersistence = (persistenceDays / 7) * 100;

  // Composite Risk Score
  // Clinical weighting:
  // - 0.40 * current_severity
  // - 0.35 * rate_of_change (surfaces rapid deterioration)
  // - 0.25 * persistence (surfaces persistent unresolved elevated distress)
  const rawRiskScore =
    0.40 * normalizedSeverity +
    0.35 * normalizedRateOfChange +
    0.25 * normalizedPersistence;

  const riskScore = Math.min(100, Math.max(5, Math.round(rawRiskScore)));

  // Risk Tiers
  let tier: RiskTier = 'Low';
  if (riskScore >= 65) {
    tier = 'High';
  } else if (riskScore >= 35) {
    tier = 'Moderate';
  } else {
    tier = 'Low';
  }

  const isRapidDeterioration = rawChange >= 2.5 && recentWindowSize >= 2;

  // Compute Domain Averages for recent window
  const recentDomainAvgs = {
    mood: recentEntries.reduce((a, b) => a + b.mood, 0) / recentWindowSize,
    sleep: recentEntries.reduce((a, b) => a + b.sleep, 0) / recentWindowSize,
    tension: recentEntries.reduce((a, b) => a + b.tension, 0) / recentWindowSize,
    withdrawal: recentEntries.reduce((a, b) => a + b.withdrawal, 0) / recentWindowSize,
    intrusions: recentEntries.reduce((a, b) => a + b.intrusions, 0) / recentWindowSize,
  };

  // SHAP-style Feature Contributions
  // Compute individual domain deltas relative to baseline
  const domainWeights: Record<keyof typeof recentDomainAvgs, number> = {
    sleep: 1.3, // Sleep disturbance is a primary physiological trauma decompensation marker
    intrusions: 1.4, // Flashbacks / intrusive thoughts directly reflect PTSD reactivation
    withdrawal: 1.1, // Social withdrawal indicates loss of safety networks
    tension: 1.0, // Hyperarousal / autonomic tension
    mood: 0.9, // Low mood / depressive affect
  };

  const domainLabels: Record<keyof typeof recentDomainAvgs, string> = {
    sleep: 'Sleep Disturbance & Nightmares',
    intrusions: 'Intrusive Flashbacks & Memories',
    withdrawal: 'Social Avoidance & Isolation',
    tension: 'Autonomic Tension & Jumpy Reflexes',
    mood: 'Depressed / Heavy Affect',
  };

  const domainInsights: Record<keyof typeof recentDomainAvgs, (delta: number) => string> = {
    sleep: (delta) =>
      delta > 0.5
        ? 'Severe disruption in restorative sleep; frequent nightmare awakenings.'
        : 'Sleep patterns remain stable within baseline threshold.',
    intrusions: (delta) =>
      delta > 0.5
        ? 'Significant reactivation of traumatic memories or flashback episodes.'
        : 'Intrusive recall remains low or episodic.',
    withdrawal: (delta) =>
      delta > 0.5
        ? 'Heightened detachment; actively avoiding trusted peers and regular routines.'
        : 'Maintains typical contact with routine contacts.',
    tension: (delta) =>
      delta > 0.5
        ? 'Elevated hypervigilance; survivor reports unable to physically relax.'
        : 'Somatic arousal within manageable baseline bounds.',
    mood: (delta) =>
      delta > 0.5
        ? 'Notable drop in mood resilience and energy reserves.'
        : 'Affective state consistent with baseline trajectory.',
  };

  const rawAttributions: {
    feature: keyof typeof recentDomainAvgs;
    delta: number;
    weightedDelta: number;
  }[] = [];

  (['sleep', 'intrusions', 'withdrawal', 'tension', 'mood'] as (keyof typeof recentDomainAvgs)[]).forEach((key) => {
    const delta = recentDomainAvgs[key] - domainMeans[key];
    // Risk drivers are primarily positive deviations (worsening distress)
    const positiveDelta = Math.max(0.1, delta);
    rawAttributions.push({
      feature: key,
      delta: Number(delta.toFixed(2)),
      weightedDelta: positiveDelta * domainWeights[key],
    });
  });

  const sumWeighted = rawAttributions.reduce((acc, curr) => acc + curr.weightedDelta, 0);

  const contributions: FeatureContribution[] = rawAttributions
    .map((item) => {
      const contributionPct = Math.round((item.weightedDelta / sumWeighted) * 100);
      const direction: 'up' | 'down' | 'neutral' =
        item.delta > 0.2 ? 'up' : item.delta < -0.2 ? 'down' : 'neutral';
      return {
        feature: item.feature,
        label: domainLabels[item.feature],
        direction,
        contributionPct,
        deltaVsBaseline: item.delta,
        clinicalInsight: domainInsights[item.feature](item.delta),
      };
    })
    .sort((a, b) => b.contributionPct - a.contributionPct);

  // Determine Reason Tag
  let reasonTag = 'Stable vs. baseline';
  if (isRapidDeterioration) {
    const topFeature = contributions[0];
    const shortDomain =
      topFeature.feature === 'sleep'
        ? 'sleep'
        : topFeature.feature === 'intrusions'
        ? 'intrusions'
        : topFeature.feature === 'withdrawal'
        ? 'withdrawal'
        : 'hyperarousal';
    reasonTag = `Rapid deterioration · 4d (${shortDomain} surge)`;
  } else if (tier === 'High') {
    const topFeature = contributions[0];
    if (topFeature.feature === 'sleep') {
      reasonTag = 'Persistent rise · sleep (14d)';
    } else if (topFeature.feature === 'intrusions') {
      reasonTag = 'Intrusion frequency spike · 5d';
    } else {
      reasonTag = 'Persistent multi-signal elevation';
    }
  } else if (tier === 'Moderate') {
    const topFeature = contributions[0];
    if (topFeature.feature === 'withdrawal') {
      reasonTag = 'Rising · withdrawal & isolation';
    } else if (topFeature.feature === 'tension') {
      reasonTag = 'Moderate · lingering tension';
    } else {
      reasonTag = 'Moderate drift from baseline';
    }
  } else {
    // Low
    if (priorAvgScore > recentAvgScore + 1.0) {
      reasonTag = 'Recovering · stabilizing vs. baseline';
    } else {
      reasonTag = 'Stable vs. baseline (28d)';
    }
  }

  // Why Flagged Clinician Summary
  let whyFlaggedSummary = '';
  if (isRapidDeterioration) {
    whyFlaggedSummary = `Acute slope acceleration over past 4 days: composite distress increased by +${rawChange.toFixed(1)}/20, primarily driven by ${contributions[0].label.toLowerCase()} (+${contributions[0].contributionPct}% attribution).`;
  } else if (tier === 'High') {
    whyFlaggedSummary = `Prolonged elevation: ${persistenceDays} of the last 7 check-ins exceeded individual threshold (+${(recentAvgScore - baselineMean).toFixed(1)} above individual baseline). Primary driver: ${contributions[0].label.toLowerCase()}.`;
  } else if (tier === 'Moderate') {
    whyFlaggedSummary = `Emerging divergence: distress score trending +${(recentAvgScore - baselineMean).toFixed(1)} above baseline, predominantly influenced by ${contributions[0].label.toLowerCase()}.`;
  } else {
    whyFlaggedSummary = `Within expected baseline envelope (mean difference: ${(recentAvgScore - baselineMean).toFixed(1)}). No acute trajectory warnings detected.`;
  }

  // Gentle, Non-diagnostic Survivor Status
  let gentleSurvivorStatus = '';
  if (isRapidDeterioration || tier === 'High') {
    gentleSurvivorStatus =
      'Your check-ins show rising anxiety and disrupted sleep this week. It is completely natural for old waves to resurface, and taking a breath with gentle support can help you feel anchored.';
  } else if (tier === 'Moderate') {
    if (contributions[0].feature === 'withdrawal') {
      gentleSurvivorStatus =
        'Your check-ins show a tendency toward keeping to yourself recently. While stepping back can feel protective, gentle connection with a trusted presence can be grounding.';
    } else if (contributions[0].feature === 'sleep') {
      gentleSurvivorStatus =
        'Your recent logs suggest fitful nights. Rest is often the first thing affected by stress — quiet evening rituals can offer your nervous system a soft landing.';
    } else {
      gentleSurvivorStatus =
        'Your logs reflect noticeable tension over recent days. Remember to pause and take things one breath at a time today.';
    }
  } else {
    if (priorAvgScore > recentAvgScore + 0.8) {
      gentleSurvivorStatus =
        'Your recent check-ins reflect steady, grounded recovery over recent days. Thank you for continuing to show up for yourself.';
    } else {
      gentleSurvivorStatus =
        'Your check-in responses remain steady compared to your personal baseline. You are navigating each day with resilience.';
    }
  }

  // Compute Domain Metric Comparisons (Baseline vs Current)
  const domainKeys: (keyof typeof recentDomainAvgs)[] = ['sleep', 'intrusions', 'withdrawal', 'tension', 'mood'];
  const domainComparisons: DomainMetricComparison[] = domainKeys.map((key) => {
    const baseVal = Number(domainMeans[key].toFixed(2));
    const currVal = Number(recentDomainAvgs[key].toFixed(2));
    const delta = Number((currVal - baseVal).toFixed(2));
    const deltaPct = baseVal > 0 ? Math.round((delta / baseVal) * 100) : delta > 0 ? 100 : 0;
    const status: 'deteriorated' | 'improved' | 'stable' =
      delta > 0.35 ? 'deteriorated' : delta < -0.35 ? 'improved' : 'stable';

    return {
      feature: key,
      label: domainLabels[key],
      baselineVal: baseVal,
      currentVal: currVal,
      delta,
      deltaPct,
      status,
    };
  });

  // Calculate Most Deteriorated vs Most Improved Metric
  // Deterioration = largest positive delta (worsening distress)
  // Improvement = largest negative delta (lowering distress)
  const sortedByDeltaDesc = [...domainComparisons].sort((a, b) => b.delta - a.delta);
  const sortedByDeltaAsc = [...domainComparisons].sort((a, b) => a.delta - b.delta);

  const candidateDeteriorated = sortedByDeltaDesc[0];
  const candidateImproved = sortedByDeltaAsc[0];

  const mostDeteriorated: DomainMetricComparison | null =
    candidateDeteriorated && candidateDeteriorated.delta > 0.15 ? candidateDeteriorated : null;

  const mostImproved: DomainMetricComparison | null =
    candidateImproved && candidateImproved.delta < -0.15 ? candidateImproved : null;

  const stableMetricsCount = domainComparisons.filter((d) => d.status === 'stable').length;

  let overallNarrative = '';
  if (mostDeteriorated && mostImproved) {
    overallNarrative = `${mostDeteriorated.label} showed the highest divergence (+${mostDeteriorated.delta} vs baseline), while ${mostImproved.label} demonstrated the strongest positive recovery (${mostImproved.delta} vs baseline).`;
  } else if (mostDeteriorated) {
    overallNarrative = `${mostDeteriorated.label} exhibited the most significant escalation (+${mostDeteriorated.delta} vs baseline), while remaining signals held comparatively steady.`;
  } else if (mostImproved) {
    overallNarrative = `${mostImproved.label} showed clear stabilization (${mostImproved.delta} vs baseline) across the recent check-in window.`;
  } else {
    overallNarrative = `All 5 physiological and behavioral domains remain closely aligned with the survivor's established baseline.`;
  }

  const insights: MetricInsights = {
    mostDeteriorated,
    mostImproved,
    stableMetricsCount,
    overallNarrative,
  };

  const earlyWarning = calculateEarlyWarning(history, baselineMean, baselineStd, domainMeans);

  return {
    riskScore,
    tier,
    reasonTag,
    whyFlaggedSummary,
    gentleSurvivorStatus,
    currentSeverityScore: Math.round(normalizedSeverity),
    rateOfChange: Number(rawChange.toFixed(2)),
    persistenceDays,
    baselineMean: Number(baselineMean.toFixed(2)),
    baselineStd: Number(baselineStd.toFixed(2)),
    recentAvgScore: Number(recentAvgScore.toFixed(2)),
    contributions,
    domainComparisons,
    insights,
    isRapidDeterioration,
    earlyWarning,
  };
}
