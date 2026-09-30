import { CheckInEntry, SurvivorProfile } from '../types';

// Helper to generate a sequence of 28 dates ending today
export function generateDates(count: number = 28): string[] {
  const dates: string[] = [];
  const today = new Date(2026, 8, 27); // Sep 27, 2026 as per local context
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(
      d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    );
  }
  return dates;
}

const dates = generateDates(28);

export const INITIAL_SURVIVORS: SurvivorProfile[] = [
  {
    id: 'S-104',
    pseudonym: 'Case S-104',
    intakeDate: '2026-08-30',
    contextTag: 'Post-conflict displacement · Community Housing Cohort',
    isReviewed: false,
    isEscalated: true,
    assignedCounsellor: 'Dr. Ananya Rao, Clinical Psychologist',
    clinicalNotes: [
      {
        id: 'cn-104-1',
        day: 26,
        timestamp: 'Sep 26, 2026 · 16:30',
        author: 'Dr. Ananya Rao',
        category: 'escalation',
        eventTitle: '1-Year Anniversary Trigger · Escalation',
        metricImpact: {
          type: 'spike',
          metric: 'Composite',
          delta: '+6 pts spike',
          description: 'Anniversary trauma recurrence drove severe intrusive flashbacks and sleep disturbance.',
        },
        content:
          'Automated alert triggered: Rapid deterioration detected over past 4 days (+72% above individual baseline). Trigger coincides with the 1-year anniversary of the displacement event. Scheduled immediate telephone check-in.',
      },
      {
        id: 'cn-104-3',
        day: 24,
        timestamp: 'Sep 24, 2026 · 14:00',
        author: 'Dr. Ananya Rao',
        category: 'outreach',
        eventTitle: 'Somatic Breathing Session',
        metricImpact: {
          type: 'dip',
          metric: 'Daytime Tension',
          delta: '-1 pt dip',
          description: 'Guided 4-7-8 breathing produced temporary daytime stabilization after night terrors.',
        },
        content:
          'Conducted urgent 25-minute remote somatic regulation call after survivor reported gasping awake at 3 AM. Guided 4-7-8 breathing and sensory anchor. Survivor noted brief grounding.',
      },
      {
        id: 'cn-104-4',
        day: 27,
        timestamp: 'Sep 27, 2026 · 10:30',
        author: 'Dr. Ananya Rao',
        category: 'session',
        eventTitle: 'Peer Companion Visit & Safety Plan',
        metricImpact: {
          type: 'dip',
          metric: 'Isolation / Withdrawal',
          delta: '-1 pt dip',
          description: 'Curtains reopened and willingness to speak returned following companion visit.',
        },
        content:
          'Peer support worker visited home following total withdrawal. Curtains opened by midday. Safety plan reinforced; psychiatric consult arranged.',
      },
      {
        id: 'cn-104-2',
        day: 20,
        timestamp: 'Sep 20, 2026 · 11:15',
        author: 'K. Varma, Social Worker',
        category: 'observation',
        eventTitle: 'Bi-Weekly Home Check',
        metricImpact: {
          type: 'stabilized',
          metric: 'Baseline Status',
          delta: '0 pts (stable)',
          description: 'Prior to anniversary window, survivor maintained baseline daily function.',
        },
        content:
          'Routine bi-weekly check. Survivor was feeling settled in temporary housing. Baseline stable.',
      },
    ],
    history: [
      // Days 1 to 7: Stable baseline (low distress ~4/20)
      { day: 1, date: dates[0], mood: 1, sleep: 1, tension: 1, withdrawal: 0, intrusions: 1, note: 'Quiet day, felt calm.' },
      { day: 2, date: dates[1], mood: 1, sleep: 0, tension: 1, withdrawal: 1, intrusions: 0 },
      { day: 3, date: dates[2], mood: 0, sleep: 1, tension: 1, withdrawal: 0, intrusions: 1 },
      { day: 4, date: dates[3], mood: 1, sleep: 1, tension: 0, withdrawal: 1, intrusions: 0, note: 'Cooked lentils with neighbour.' },
      { day: 5, date: dates[4], mood: 1, sleep: 0, tension: 1, withdrawal: 0, intrusions: 1 },
      { day: 6, date: dates[5], mood: 0, sleep: 1, tension: 1, withdrawal: 0, intrusions: 0 },
      { day: 7, date: dates[6], mood: 1, sleep: 1, tension: 1, withdrawal: 0, intrusions: 0 },
      // Days 8 to 18: Mild manageable fluctuations (~4-6/20)
      { day: 8, date: dates[7], mood: 1, sleep: 1, tension: 2, withdrawal: 1, intrusions: 1 },
      { day: 9, date: dates[8], mood: 2, sleep: 1, tension: 1, withdrawal: 0, intrusions: 0 },
      { day: 10, date: dates[9], mood: 1, sleep: 2, tension: 1, withdrawal: 1, intrusions: 1, note: 'Loud fireworks nearby gave a brief startle.' },
      { day: 11, date: dates[10], mood: 1, sleep: 1, tension: 1, withdrawal: 0, intrusions: 1 },
      { day: 12, date: dates[11], mood: 0, sleep: 1, tension: 1, withdrawal: 1, intrusions: 0 },
      { day: 13, date: dates[12], mood: 1, sleep: 1, tension: 1, withdrawal: 0, intrusions: 1 },
      { day: 14, date: dates[13], mood: 1, sleep: 2, tension: 2, withdrawal: 1, intrusions: 0 },
      { day: 15, date: dates[14], mood: 1, sleep: 1, tension: 1, withdrawal: 0, intrusions: 1 },
      { day: 16, date: dates[15], mood: 1, sleep: 1, tension: 1, withdrawal: 1, intrusions: 0 },
      { day: 17, date: dates[16], mood: 2, sleep: 1, tension: 1, withdrawal: 0, intrusions: 1 },
      { day: 18, date: dates[17], mood: 1, sleep: 1, tension: 2, withdrawal: 1, intrusions: 1 },
      // Days 19 to 24: Emerging steep climb (trigger period begins)
      { day: 19, date: dates[18], mood: 2, sleep: 2, tension: 2, withdrawal: 1, intrusions: 2, note: 'Saw a photo on someone’s phone that brought things back.' },
      { day: 20, date: dates[19], mood: 2, sleep: 3, tension: 3, withdrawal: 2, intrusions: 2 },
      { day: 21, date: dates[20], mood: 3, sleep: 2, tension: 3, withdrawal: 2, intrusions: 3 },
      { day: 22, date: dates[21], mood: 2, sleep: 3, tension: 3, withdrawal: 2, intrusions: 3, note: 'Woke up gasping at 3 AM. Couldn’t go back to sleep.' },
      { day: 23, date: dates[22], mood: 3, sleep: 3, tension: 3, withdrawal: 3, intrusions: 3 },
      { day: 24, date: dates[23], mood: 3, sleep: 4, tension: 4, withdrawal: 3, intrusions: 3 },
      // Days 25 to 28: Acute Deterioration (Rapid surge in intrusions & sleeplessness)
      { day: 25, date: dates[24], mood: 3, sleep: 4, tension: 4, withdrawal: 3, intrusions: 4, note: 'Felt like I was right back there in the middle of the noise.' },
      { day: 26, date: dates[25], mood: 4, sleep: 4, tension: 3, withdrawal: 4, intrusions: 4 },
      { day: 27, date: dates[26], mood: 3, sleep: 4, tension: 4, withdrawal: 3, intrusions: 4, note: 'Kept my curtains closed all day. Didn’t want anyone to see me.' },
      { day: 28, date: dates[27], mood: 4, sleep: 4, tension: 4, withdrawal: 4, intrusions: 4, note: 'Exhausted but terrified to close my eyes.' },
    ],
  },
  {
    id: 'S-087',
    pseudonym: 'Case S-087',
    intakeDate: '2026-08-30',
    contextTag: 'Civil strife survivor · Transitional Shelter Unit 4',
    isReviewed: false,
    isEscalated: false,
    assignedCounsellor: 'M. Sen, Psychiatric Social Worker',
    clinicalNotes: [
      {
        id: 'cn-087-1',
        timestamp: 'Sep 25, 2026 · 14:00',
        author: 'M. Sen',
        category: 'observation',
        content:
          'Longitudinal rise in sleep fragmentation over the last 14 days. Recommending sleep hygiene kit and somatic wind-down protocol.',
      },
    ],
    history: [
      // Baseline Days 1-7: moderate tension (baseline ~5/20)
      { day: 1, date: dates[0], mood: 1, sleep: 1, tension: 2, withdrawal: 1, intrusions: 0 },
      { day: 2, date: dates[1], mood: 1, sleep: 1, tension: 1, withdrawal: 1, intrusions: 1 },
      { day: 3, date: dates[2], mood: 1, sleep: 2, tension: 1, withdrawal: 0, intrusions: 1 },
      { day: 4, date: dates[3], mood: 1, sleep: 1, tension: 2, withdrawal: 1, intrusions: 0 },
      { day: 5, date: dates[4], mood: 1, sleep: 1, tension: 1, withdrawal: 1, intrusions: 1 },
      { day: 6, date: dates[5], mood: 2, sleep: 1, tension: 2, withdrawal: 0, intrusions: 0 },
      { day: 7, date: dates[6], mood: 1, sleep: 1, tension: 1, withdrawal: 1, intrusions: 1 },
      // Days 8 to 14: Gradual upward slope in sleep disturbances
      { day: 8, date: dates[7], mood: 1, sleep: 2, tension: 2, withdrawal: 1, intrusions: 1 },
      { day: 9, date: dates[8], mood: 2, sleep: 2, tension: 2, withdrawal: 1, intrusions: 1 },
      { day: 10, date: dates[9], mood: 2, sleep: 2, tension: 2, withdrawal: 1, intrusions: 1 },
      { day: 11, date: dates[10], mood: 2, sleep: 3, tension: 2, withdrawal: 1, intrusions: 1, note: 'Trouble resting my mind.' },
      { day: 12, date: dates[11], mood: 2, sleep: 2, tension: 3, withdrawal: 2, intrusions: 1 },
      { day: 13, date: dates[12], mood: 2, sleep: 3, tension: 2, withdrawal: 1, intrusions: 2 },
      { day: 14, date: dates[13], mood: 2, sleep: 3, tension: 3, withdrawal: 2, intrusions: 1 },
      // Days 15 to 28: Persistent elevated sleep deficit & tension
      { day: 15, date: dates[14], mood: 2, sleep: 3, tension: 3, withdrawal: 2, intrusions: 2 },
      { day: 16, date: dates[15], mood: 3, sleep: 3, tension: 3, withdrawal: 2, intrusions: 2 },
      { day: 17, date: dates[16], mood: 2, sleep: 4, tension: 3, withdrawal: 2, intrusions: 2, note: 'Body aches from constant clenching.' },
      { day: 18, date: dates[17], mood: 3, sleep: 3, tension: 3, withdrawal: 2, intrusions: 2 },
      { day: 19, date: dates[18], mood: 2, sleep: 4, tension: 3, withdrawal: 2, intrusions: 2 },
      { day: 20, date: dates[19], mood: 3, sleep: 4, tension: 3, withdrawal: 2, intrusions: 2 },
      { day: 21, date: dates[20], mood: 2, sleep: 3, tension: 4, withdrawal: 2, intrusions: 3 },
      { day: 22, date: dates[21], mood: 3, sleep: 4, tension: 3, withdrawal: 3, intrusions: 2 },
      { day: 23, date: dates[22], mood: 3, sleep: 4, tension: 4, withdrawal: 2, intrusions: 3 },
      { day: 24, date: dates[23], mood: 3, sleep: 4, tension: 3, withdrawal: 3, intrusions: 2, note: 'Could only sleep 2 broken hours.' },
      { day: 25, date: dates[24], mood: 3, sleep: 4, tension: 4, withdrawal: 3, intrusions: 3 },
      { day: 26, date: dates[25], mood: 3, sleep: 4, tension: 4, withdrawal: 3, intrusions: 3 },
      { day: 27, date: dates[26], mood: 3, sleep: 4, tension: 3, withdrawal: 3, intrusions: 3 },
      { day: 28, date: dates[27], mood: 3, sleep: 4, tension: 4, withdrawal: 3, intrusions: 3, note: 'Physical fatigue is intense.' },
    ],
  },
  {
    id: 'S-042',
    pseudonym: 'Case S-042',
    intakeDate: '2026-08-30',
    contextTag: 'Gender-based trauma survivor · Reintegration Program',
    isReviewed: false,
    isEscalated: true,
    assignedCounsellor: 'Dr. Ananya Rao, Clinical Psychologist',
    clinicalNotes: [
      {
        id: 'cn-042-1',
        timestamp: 'Sep 27, 2026 · 08:20',
        author: 'Dr. Ananya Rao',
        category: 'escalation',
        content:
          'Sharp 3-day cliff deterioration after 22 days of calm stabilization. High intrusion and hyperarousal scores. Reached out for immediate safety check.',
      },
    ],
    history: [
      // Days 1 to 22: Very calm baseline (~3-4/20)
      ...Array.from({ length: 22 }, (_, idx) => ({
        day: idx + 1,
        date: dates[idx],
        mood: idx % 3 === 0 ? 1 : 0,
        sleep: idx % 2 === 0 ? 1 : 0,
        tension: 1,
        withdrawal: 0,
        intrusions: idx % 5 === 0 ? 1 : 0,
        note: idx === 12 ? 'Attended the community weaving circle.' : undefined,
      })),
      // Days 23 to 25: Mild uptick
      { day: 23, date: dates[22], mood: 1, sleep: 2, tension: 2, withdrawal: 1, intrusions: 1 },
      { day: 24, date: dates[23], mood: 2, sleep: 2, tension: 2, withdrawal: 2, intrusions: 2 },
      { day: 25, date: dates[24], mood: 3, sleep: 3, tension: 3, withdrawal: 3, intrusions: 3, note: 'Encountered someone from my old town.' },
      // Days 26 to 28: Rapid spike
      { day: 26, date: dates[25], mood: 4, sleep: 4, tension: 4, withdrawal: 3, intrusions: 4 },
      { day: 27, date: dates[26], mood: 4, sleep: 4, tension: 4, withdrawal: 4, intrusions: 4, note: 'Severe shaking spells in the afternoon.' },
      { day: 28, date: dates[27], mood: 4, sleep: 4, tension: 4, withdrawal: 4, intrusions: 4, note: 'Could not leave my bed today.' },
    ],
  },
  {
    id: 'S-231',
    pseudonym: 'Case S-231',
    intakeDate: '2026-08-30',
    contextTag: 'Grief & displacement · Youth Support Group',
    isReviewed: true,
    reviewedAt: 'Sep 26, 2026 · 10:45',
    reviewedBy: 'M. Sen, Psychiatric Social Worker',
    isEscalated: false,
    assignedCounsellor: 'M. Sen, Psychiatric Social Worker',
    clinicalNotes: [
      {
        id: 'cn-231-1',
        timestamp: 'Sep 26, 2026 · 10:45',
        author: 'M. Sen',
        category: 'outreach',
        content:
          'Reviewed 10-day withdrawal curve. Spoke with local youth volunteer coordinator to encourage gentle peer inclusion without overwhelming survivor.',
      },
    ],
    history: [
      // Baseline 1-7: low scores (~3/20)
      { day: 1, date: dates[0], mood: 1, sleep: 1, tension: 0, withdrawal: 0, intrusions: 0 },
      { day: 2, date: dates[1], mood: 0, sleep: 0, tension: 1, withdrawal: 0, intrusions: 0 },
      { day: 3, date: dates[2], mood: 1, sleep: 1, tension: 1, withdrawal: 1, intrusions: 0 },
      { day: 4, date: dates[3], mood: 0, sleep: 1, tension: 0, withdrawal: 0, intrusions: 0 },
      { day: 5, date: dates[4], mood: 1, sleep: 0, tension: 1, withdrawal: 0, intrusions: 1 },
      { day: 6, date: dates[5], mood: 1, sleep: 1, tension: 0, withdrawal: 0, intrusions: 0 },
      { day: 7, date: dates[6], mood: 0, sleep: 0, tension: 1, withdrawal: 0, intrusions: 0 },
      // Days 8 to 17: Stable
      ...Array.from({ length: 10 }, (_, i) => ({
        day: i + 8,
        date: dates[i + 7],
        mood: 1,
        sleep: 1,
        tension: 1,
        withdrawal: i >= 6 ? 2 : 1,
        intrusions: 0,
      })),
      // Days 18 to 28: Gradual progressive social withdrawal
      { day: 18, date: dates[17], mood: 2, sleep: 1, tension: 1, withdrawal: 2, intrusions: 0 },
      { day: 19, date: dates[18], mood: 2, sleep: 2, tension: 1, withdrawal: 3, intrusions: 1, note: 'Skipped the group tea session.' },
      { day: 20, date: dates[19], mood: 2, sleep: 1, tension: 2, withdrawal: 3, intrusions: 1 },
      { day: 21, date: dates[20], mood: 2, sleep: 2, tension: 1, withdrawal: 3, intrusions: 1 },
      { day: 22, date: dates[21], mood: 2, sleep: 1, tension: 2, withdrawal: 4, intrusions: 0 },
      { day: 23, date: dates[22], mood: 2, sleep: 2, tension: 2, withdrawal: 4, intrusions: 1, note: 'Turned off phone notifications.' },
      { day: 24, date: dates[23], mood: 2, sleep: 2, tension: 2, withdrawal: 4, intrusions: 1 },
      { day: 25, date: dates[24], mood: 3, sleep: 2, tension: 2, withdrawal: 4, intrusions: 1 },
      { day: 26, date: dates[25], mood: 2, sleep: 2, tension: 2, withdrawal: 4, intrusions: 1 },
      { day: 27, date: dates[26], mood: 3, sleep: 2, tension: 2, withdrawal: 4, intrusions: 1, note: 'Don’t feel like speaking with anyone.' },
      { day: 28, date: dates[27], mood: 2, sleep: 2, tension: 2, withdrawal: 4, intrusions: 1 },
    ],
  },
  {
    id: 'S-312',
    pseudonym: 'Case S-312',
    intakeDate: '2026-08-30',
    contextTag: 'Physical injury survivor · Vocational Rehab',
    isReviewed: false,
    isEscalated: false,
    assignedCounsellor: 'Dr. Ananya Rao, Clinical Psychologist',
    clinicalNotes: [
      {
        id: 'cn-312-1',
        timestamp: 'Sep 22, 2026 · 15:30',
        author: 'Dr. Ananya Rao',
        category: 'observation',
        content:
          'Survivor exhibits persistent hyperarousal around sensory triggers (machinery noise). Sleep and mood remain preserved. Recommended bilateral tapping grounding.',
      },
    ],
    history: [
      // 28 days of moderate lingering hypervigilance (tension ~2-3, sleep ~1, mood ~1)
      ...Array.from({ length: 28 }, (_, i) => ({
        day: i + 1,
        date: dates[i],
        mood: i % 4 === 0 ? 2 : 1,
        sleep: i % 3 === 0 ? 2 : 1,
        tension: i >= 18 ? 3 : 2,
        withdrawal: 1,
        intrusions: i % 5 === 0 ? 2 : 1,
        note: i === 24 ? 'Workplace noise triggered some jaw tension.' : undefined,
      })),
    ],
  },
  {
    id: 'S-019',
    pseudonym: 'Case S-019',
    intakeDate: '2026-08-30',
    contextTag: 'Flood / climate disaster survivor · Family Unit',
    isReviewed: true,
    reviewedAt: 'Sep 24, 2026 · 17:00',
    reviewedBy: 'K. Varma, Social Worker',
    isEscalated: false,
    assignedCounsellor: 'K. Varma, Social Worker',
    clinicalNotes: [
      {
        id: 'cn-019-1',
        day: 24,
        timestamp: 'Sep 24, 2026 · 17:00',
        author: 'K. Varma',
        category: 'session',
        eventTitle: 'Post-Spike Stabilization Review',
        metricImpact: {
          type: 'dip',
          metric: 'Composite Distress',
          delta: '-5 pts dip',
          description: 'Sustained recovery following sibling reunion; full normalization back to baseline.',
        },
        content:
          'Follow-up after Day 10-15 acute stress spike. Survivor has reconnected with sibling and resumed daily walks. Trajectory has stabilized back to baseline.',
      },
      {
        id: 'cn-019-2',
        day: 22,
        timestamp: 'Sep 22, 2026 · 15:30',
        author: 'K. Varma',
        category: 'outreach',
        eventTitle: 'Family Reconciliation Call',
        metricImpact: {
          type: 'dip',
          metric: 'Withdrawal & Mood',
          delta: '-3 pts dip',
          description: 'Immediate sharp dip in social isolation and sadness following call with brother.',
        },
        content:
          'Telephone check. Survivor spoke with brother for the first time in 4 months. Marked reduction in emotional numbness and renewed social openness.',
      },
    ],
    history: [
      // Baseline 1-7: moderate (total ~6)
      { day: 1, date: dates[0], mood: 2, sleep: 1, tension: 2, withdrawal: 1, intrusions: 1 },
      { day: 2, date: dates[1], mood: 1, sleep: 2, tension: 2, withdrawal: 1, intrusions: 1 },
      { day: 3, date: dates[2], mood: 2, sleep: 2, tension: 1, withdrawal: 1, intrusions: 1 },
      { day: 4, date: dates[3], mood: 1, sleep: 1, tension: 2, withdrawal: 0, intrusions: 1 },
      { day: 5, date: dates[4], mood: 2, sleep: 1, tension: 2, withdrawal: 1, intrusions: 1 },
      { day: 6, date: dates[5], mood: 1, sleep: 2, tension: 1, withdrawal: 1, intrusions: 0 },
      { day: 7, date: dates[6], mood: 1, sleep: 1, tension: 2, withdrawal: 1, intrusions: 1 },
      // Days 8-14: Temporary acute spike
      { day: 8, date: dates[7], mood: 3, sleep: 3, tension: 3, withdrawal: 2, intrusions: 2 },
      { day: 9, date: dates[8], mood: 3, sleep: 3, tension: 3, withdrawal: 2, intrusions: 2 },
      { day: 10, date: dates[9], mood: 3, sleep: 3, tension: 4, withdrawal: 3, intrusions: 3 },
      { day: 11, date: dates[10], mood: 4, sleep: 4, tension: 3, withdrawal: 3, intrusions: 3 },
      { day: 12, date: dates[11], mood: 3, sleep: 3, tension: 3, withdrawal: 2, intrusions: 2 },
      { day: 13, date: dates[12], mood: 3, sleep: 2, tension: 3, withdrawal: 2, intrusions: 2 },
      { day: 14, date: dates[13], mood: 2, sleep: 2, tension: 2, withdrawal: 1, intrusions: 1 },
      // Days 15-28: Steady recovery & stabilization back to baseline
      { day: 15, date: dates[14], mood: 2, sleep: 2, tension: 2, withdrawal: 1, intrusions: 1 },
      { day: 16, date: dates[15], mood: 1, sleep: 1, tension: 2, withdrawal: 1, intrusions: 1 },
      { day: 17, date: dates[16], mood: 1, sleep: 2, tension: 1, withdrawal: 0, intrusions: 1 },
      { day: 18, date: dates[17], mood: 1, sleep: 1, tension: 1, withdrawal: 1, intrusions: 0 },
      { day: 19, date: dates[18], mood: 1, sleep: 1, tension: 1, withdrawal: 0, intrusions: 0 },
      { day: 20, date: dates[19], mood: 1, sleep: 1, tension: 1, withdrawal: 0, intrusions: 0 },
      { day: 21, date: dates[20], mood: 0, sleep: 1, tension: 1, withdrawal: 0, intrusions: 0 },
      { day: 22, date: dates[21], mood: 1, sleep: 1, tension: 1, withdrawal: 0, intrusions: 0, note: 'Felt lighter after talking to my brother.' },
      { day: 23, date: dates[22], mood: 1, sleep: 0, tension: 1, withdrawal: 0, intrusions: 0 },
      { day: 24, date: dates[23], mood: 0, sleep: 1, tension: 0, withdrawal: 0, intrusions: 0 },
      { day: 25, date: dates[24], mood: 1, sleep: 1, tension: 1, withdrawal: 0, intrusions: 0 },
      { day: 26, date: dates[25], mood: 1, sleep: 0, tension: 1, withdrawal: 0, intrusions: 0 },
      { day: 27, date: dates[26], mood: 0, sleep: 1, tension: 0, withdrawal: 0, intrusions: 0 },
      { day: 28, date: dates[27], mood: 1, sleep: 0, tension: 1, withdrawal: 0, intrusions: 0, note: 'Peaceful night. Grounded morning.' },
    ],
  },
  {
    id: 'S-056',
    pseudonym: 'Case S-056',
    intakeDate: '2026-08-30',
    contextTag: 'Community rehabilitation · Artisan Cooperative',
    isReviewed: true,
    reviewedAt: 'Sep 25, 2026 · 09:00',
    reviewedBy: 'Dr. Ananya Rao, Clinical Psychologist',
    isEscalated: false,
    assignedCounsellor: 'Dr. Ananya Rao, Clinical Psychologist',
    clinicalNotes: [
      {
        id: 'cn-056-1',
        timestamp: 'Sep 25, 2026 · 09:00',
        author: 'Dr. Ananya Rao',
        category: 'observation',
        content:
          'Longitudinal stability verified across all 28 check-ins. Well integrated into daily pottery work; strong natural social scaffolding.',
      },
    ],
    history: Array.from({ length: 28 }, (_, i) => ({
      day: i + 1,
      date: dates[i],
      mood: i % 4 === 0 ? 1 : 0,
      sleep: i % 3 === 0 ? 1 : 0,
      tension: i % 5 === 0 ? 1 : 0,
      withdrawal: 0,
      intrusions: 0,
      note: i === 20 ? 'Good work at the clay workshop today.' : undefined,
    })),
  },
];
