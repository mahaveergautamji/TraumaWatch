import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Heart,
  Sparkles,
  Moon,
  Flame,
  Feather,
  Send,
  RefreshCw,
  AlertCircle,
  MessageCircle,
  CheckCircle2,
  Wind,
  PhoneCall,
  Lock,
  Compass,
  Smile,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface PeerSupportSectionProps {
  onOpenGrounding: (tab?: 'breathing' | 'sensory' | 'sleep') => void;
  onOpenCounsellorContact: () => void;
}

interface PeerMessage {
  id: string;
  authorAlias: string;
  avatarSeed: number;
  timeAgo: string;
  content: string;
  isClinicianNote?: boolean;
  reactions: {
    warmth: number;
    holdingSpace: number;
    breath: number;
    hearYou: number;
  };
  userReacted?: string | null;
}

interface DiscussionCircle {
  id: string;
  title: string;
  themeTag: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  moderator: string;
  activePeersCount: number;
  pinnedPrompt: string;
  messages: PeerMessage[];
}

const PSEUDONYMS = [
  'GentleRiver',
  'QuietCreek',
  'CedarBreeze',
  'CalmAnchor',
  'WarmHarbor',
  'MorningMist',
  'SilverPine',
  'SafeMeadow',
  'PatientOak',
  'QuietDawn',
];

const INITIAL_CIRCLES: DiscussionCircle[] = [
  {
    id: 'circle-sleep',
    title: 'Restoring Sleep & Calming Night Terrors',
    themeTag: 'Sleep & Night Terrors',
    description: 'A quiet circle to share evening wind-down rituals, nightmare rescripting, and reclaiming sleep after nocturnal panic.',
    icon: Moon,
    color: '#6366f1',
    moderator: 'Dr. Ananya Rao, Clinical Psychologist',
    activePeersCount: 28,
    pinnedPrompt:
      'What gentle physical sensation or bedtime anchor helps your body feel safe enough to close your eyes tonight?',
    messages: [
      {
        id: 'msg-sleep-1',
        authorAlias: 'CedarBreeze',
        avatarSeed: 1,
        timeAgo: '2 hours ago',
        content:
          'Woke up with my chest tight at 3:15 AM. Instead of spiraling, I got out of bed, drank cold water, and wrapped myself in the heavy wool blanket. Guided breathing took about 15 minutes, but the trembling stopped.',
        reactions: { warmth: 12, holdingSpace: 8, breath: 15, hearYou: 9 },
      },
      {
        id: 'msg-sleep-2',
        authorAlias: 'Dr. Ananya Rao',
        avatarSeed: 99,
        timeAgo: '1 hour ago',
        content:
          'Clinician Moderator Note: Wonderful somatic grounding, CedarBreeze. Leaving bed when hyperarousal strikes prevents the bed from becoming associated with anxiety. Deep pressure from the blanket signals autonomic safety.',
        isClinicianNote: true,
        reactions: { warmth: 18, holdingSpace: 4, breath: 10, hearYou: 14 },
      },
      {
        id: 'msg-sleep-3',
        authorAlias: 'QuietHarbor',
        avatarSeed: 3,
        timeAgo: '42 mins ago',
        content:
          'I kept lavender oil on my nightstand this week. Whenever the nightmare dread starts creeping in, smelling it brings me straight back to the present room. It really does help interrupt the loop.',
        reactions: { warmth: 14, holdingSpace: 5, breath: 11, hearYou: 12 },
      },
    ],
  },
  {
    id: 'circle-grounding',
    title: 'Grounding through Sensory Overwhelm & Tension',
    themeTag: 'Sensory Overwhelm & Startle',
    description: 'Techniques for surviving sudden loud noises, crowded corridors, startle reflexes, and physical muscle clenching.',
    icon: Flame,
    color: '#d97706',
    moderator: 'K. Varma, Social Worker',
    activePeersCount: 34,
    pinnedPrompt:
      'What 5-4-3-2-1 anchor or tactile texture helps interrupt sudden adrenaline spikes in daytime public spaces?',
    messages: [
      {
        id: 'msg-ground-1',
        authorAlias: 'SafeMeadow',
        avatarSeed: 4,
        timeAgo: '4 hours ago',
        content:
          'I carry a smooth river stone in my right pocket now. Whenever footsteps behind me trigger the urge to bolt, I press my thumb firmly into the stone until I feel its coolness. Grounded in 30 seconds.',
        reactions: { warmth: 21, holdingSpace: 6, breath: 19, hearYou: 16 },
      },
      {
        id: 'msg-ground-2',
        authorAlias: 'MorningMist',
        avatarSeed: 5,
        timeAgo: '2 hours ago',
        content:
          'Workplace noise gave me a bad startle reflex at lunch. Stepped into the courtyard, touched the bark of an acacia tree, and did bilateral tapping on my collarbones. Felt my shoulders drop 2 inches.',
        reactions: { warmth: 16, holdingSpace: 7, breath: 14, hearYou: 11 },
      },
    ],
  },
  {
    id: 'circle-anniversaries',
    title: 'Navigating Difficult Anniversaries & Calendar Triggers',
    themeTag: 'Anniversaries & Memory Days',
    description: 'Supportive space for processing approaching trauma anniversaries, grief waves, and unexpected calendar dread.',
    icon: Compass,
    color: '#e11d48',
    moderator: 'Dr. Ananya Rao, Clinical Psychologist',
    activePeersCount: 22,
    pinnedPrompt:
      'How are you offering yourself extra softness and boundary protection as tough calendar dates approach?',
    messages: [
      {
        id: 'msg-anniv-1',
        authorAlias: 'SilverPine',
        avatarSeed: 7,
        timeAgo: '5 hours ago',
        content:
          'Next Monday marks exactly one year since we lost our home. My body felt it before my calendar reminded me—headaches and low mood all week. I told my support group and gave myself permission to cancel all extra chores.',
        reactions: { warmth: 25, holdingSpace: 28, breath: 12, hearYou: 20 },
      },
      {
        id: 'msg-anniv-2',
        authorAlias: 'GentleRiver',
        avatarSeed: 8,
        timeAgo: '3 hours ago',
        content:
          'Holding you in heart, SilverPine. The body truly remembers the date. Lighting a candle and drinking warm tea with you in spirit tonight.',
        reactions: { warmth: 19, holdingSpace: 16, breath: 9, hearYou: 15 },
      },
    ],
  },
  {
    id: 'circle-reconnection',
    title: 'Gentle Reconnection & Overcoming Avoidance',
    themeTag: 'Social Safety & Connection',
    description: 'Safe strategies for easing out of withdrawal cocooning, reopening curtains, and talking to trusted community without pressure.',
    icon: Users,
    color: '#0d9488',
    moderator: 'M. Sen, Psychiatric Social Worker',
    activePeersCount: 19,
    pinnedPrompt:
      'What was one small step you took this week to reconnect with someone safe, even if it was just a 2-minute text?',
    messages: [
      {
        id: 'msg-recon-1',
        authorAlias: 'QuietDawn',
        avatarSeed: 9,
        timeAgo: '6 hours ago',
        content:
          'I had not answered my sister’s calls for 10 days because answering felt like climbing a mountain. Today I texted her: "I am safe, just resting quietly, will call Sunday." She replied with a heart. The guilt lifted immediately.',
        reactions: { warmth: 30, holdingSpace: 5, breath: 12, hearYou: 24 },
      },
    ],
  },
  {
    id: 'circle-craft',
    title: 'Tactile Craft, Nature & Somatic Healing',
    themeTag: 'Somatic Healing & Mindfulness',
    description: 'Celebrating pottery, textile weaving, gardening, baking, and mindful handcrafts that ground the nervous system.',
    icon: Feather,
    color: '#2a7f8f',
    moderator: 'K. Varma, Social Worker',
    activePeersCount: 26,
    pinnedPrompt:
      'What physical craft or nature element gave your hands something soothing to focus on this week?',
    messages: [
      {
        id: 'msg-craft-1',
        authorAlias: 'CalmAnchor',
        avatarSeed: 10,
        timeAgo: '1 day ago',
        content:
          'Attended the community clay studio. Just kneading the cold, damp clay for an hour quieted my buzzing thoughts better than anything else. Recommending it to anyone struggling with runaway worry.',
        reactions: { warmth: 22, holdingSpace: 4, breath: 16, hearYou: 18 },
      },
    ],
  },
];

const PEER_OPT_IN_STORAGE = 'traumawatch_peer_opt_in_v1';
const PEER_ALIAS_STORAGE = 'traumawatch_peer_alias_v1';
const PEER_CIRCLES_STORAGE = 'traumawatch_peer_circles_v1';

export const PeerSupportSection: React.FC<PeerSupportSectionProps> = ({
  onOpenGrounding,
  onOpenCounsellorContact,
}) => {
  // Opt-in state
  const [hasOptedIn, setHasOptedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PEER_OPT_IN_STORAGE) === 'true';
    } catch {
      return false;
    }
  });

  // User's anonymous pseudonym
  const [userAlias, setUserAlias] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(PEER_ALIAS_STORAGE);
      if (saved) return saved;
    } catch {}
    return PSEUDONYMS[Math.floor(Math.random() * PSEUDONYMS.length)];
  });

  // Circles and messages state
  const [circles, setCircles] = useState<DiscussionCircle[]>(() => {
    try {
      const saved = localStorage.getItem(PEER_CIRCLES_STORAGE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CIRCLES;
  });

  // Currently open discussion circle
  const [selectedCircleId, setSelectedCircleId] = useState<string>('circle-sleep');

  // New message compose box
  const [newShareContent, setNewShareContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  // Community guidelines acceptance during opt-in
  const [acceptedGuidelines, setAcceptedGuidelines] = useState<boolean>(false);

  // Save circles on change
  useEffect(() => {
    try {
      localStorage.setItem(PEER_CIRCLES_STORAGE, JSON.stringify(circles));
    } catch {}
  }, [circles]);

  // Handle Opt-In
  const handleOptIn = () => {
    setHasOptedIn(true);
    try {
      localStorage.setItem(PEER_OPT_IN_STORAGE, 'true');
      localStorage.setItem(PEER_ALIAS_STORAGE, userAlias);
    } catch {}
  };

  // Regenerate random anonymous handle
  const handleRegenerateAlias = () => {
    const nextAlias = PSEUDONYMS[Math.floor(Math.random() * PSEUDONYMS.length)];
    setUserAlias(nextAlias);
    try {
      localStorage.setItem(PEER_ALIAS_STORAGE, nextAlias);
    } catch {}
  };

  // Selected Circle
  const activeCircle = circles.find((c) => c.id === selectedCircleId) || circles[0];

  // Post new anonymous message
  const handlePostShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShareContent.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const newMsg: PeerMessage = {
      id: `msg-${Date.now()}`,
      authorAlias: userAlias,
      avatarSeed: Math.floor(Math.random() * 8) + 1,
      timeAgo: 'Just now',
      content: newShareContent.trim(),
      reactions: { warmth: 1, holdingSpace: 1, breath: 1, hearYou: 1 },
    };

    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== activeCircle.id) return c;
        return {
          ...c,
          messages: [...c.messages, newMsg],
        };
      })
    );

    setNewShareContent('');
    setIsSubmitting(false);
    setSubmitFeedback('Your share has been posted to the circle.');
    setTimeout(() => setSubmitFeedback(null), 3000);
  };

  // Handle reaction click
  const handleReaction = (
    circleId: string,
    messageId: string,
    reactionType: keyof PeerMessage['reactions']
  ) => {
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== circleId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== messageId) return m;
            const hasReacted = m.userReacted === reactionType;
            return {
              ...m,
              userReacted: hasReacted ? null : reactionType,
              reactions: {
                ...m.reactions,
                [reactionType]: hasReacted
                  ? Math.max(0, m.reactions[reactionType] - 1)
                  : m.reactions[reactionType] + 1,
              },
            };
          }),
        };
      })
    );
  };

  // SCREEN 1: Privacy-First Opt-In Screen
  if (!hasOptedIn) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2 py-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2a7f8f]/10 text-[#2a7f8f] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#15303a]">
            Anonymous Peer Support Circles
          </h2>
          <p className="text-xs text-[#5a7580] max-w-sm mx-auto leading-relaxed">
            A safe, gently moderated space to connect with other survivors navigating recovery, sleep challenges, and somatic healing.
          </p>
        </div>

        {/* 4 Core Pillars of Safety */}
        <div className="space-y-2.5">
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#d9e6e4] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-[#15303a] block">Complete Privacy & Anonymity</span>
              <p className="text-[#5a7580] leading-relaxed">
                No names, locations, or personal profiles are ever shown. You participate under a gentle nature pseudonym like{' '}
                <span className="font-mono font-semibold text-[#2a7f8f]">"{userAlias}"</span>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#d9e6e4] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800 shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-[#15303a] block">Trauma-Informed Clinical Moderation</span>
              <p className="text-[#5a7580] leading-relaxed">
                Discussions are actively moderated by clinical psychologists. Conversations focus on coping tools, shared warmth, and grounding without graphic event descriptions.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#d9e6e4] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800 shrink-0 mt-0.5">
              <Wind className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-[#15303a] block">Grounding Is Always 1-Click Away</span>
              <p className="text-[#5a7580] leading-relaxed">
                If reading experiences ever brings up physical heaviness, you can step out instantly with one click into somatic breathing.
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Anonymous Pseudonym Preview */}
        <div className="p-3.5 rounded-xl bg-[#f2f7f6] border border-[#d9e6e4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2a7f8f] text-white flex items-center justify-center font-serif font-bold text-xs">
              {userAlias[0]}
            </div>
            <div>
              <span className="text-[10px] text-[#5a7580] uppercase tracking-wider font-semibold block">
                Your Anonymous Circle Alias
              </span>
              <span className="font-mono text-sm font-bold text-[#15303a]">
                {userAlias}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRegenerateAlias}
            title="Generate a different anonymous alias"
            className="px-2.5 py-1.5 rounded-lg border border-[#d9e6e4] bg-white hover:bg-slate-50 text-xs text-[#5a7580] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Randomize</span>
          </button>
        </div>

        {/* Opt-In Agreement Checkbox */}
        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={acceptedGuidelines}
            onChange={(e) => setAcceptedGuidelines(e.target.checked)}
            className="mt-0.5 rounded text-[#2a7f8f] focus:ring-[#2a7f8f]"
          />
          <span className="text-[#334155] leading-relaxed">
            I agree to uphold community safety, refrain from posting graphic details, and hold gentle space for fellow survivors.
          </span>
        </label>

        {/* Opt-In CTA Button */}
        <button
          type="button"
          disabled={!acceptedGuidelines}
          onClick={handleOptIn}
          className="w-full py-3 px-4 rounded-xl bg-[#2a7f8f] hover:bg-[#236b79] text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>Enter Anonymous Peer Circles</span>
        </button>

        <p className="text-[11px] text-center text-[#5a7580]">
          You can opt out or change your anonymous alias at any time.
        </p>
      </div>
    );
  }

  // SCREEN 2: Themed Circles & Active Discussion
  return (
    <div className="space-y-4">
      {/* Top Identity & Safe Exit Strip */}
      <div className="flex items-center justify-between pb-3 border-b border-[#d9e6e4]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2a7f8f] text-white flex items-center justify-center font-serif font-bold text-xs">
            {userAlias[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-[#15303a]">
                {userAlias}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] text-[#5a7580]">Anonymous Peer Member</span>
          </div>
        </div>

        {/* Quick Grounding Safety Escape */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenGrounding('breathing')}
            title="Step into guided 4-7-8 breathing"
            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Wind className="w-3 h-3 text-teal-600" />
            <span>Need a Pause?</span>
          </button>
        </div>
      </div>

      {/* Themed Discussion Circle Selector Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-[#5a7580] block">
          Recovery Themes ({circles.length}):
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {circles.map((circle) => {
            const Icon = circle.icon;
            const isSelected = circle.id === activeCircle.id;

            return (
              <button
                key={circle.id}
                type="button"
                onClick={() => setSelectedCircleId(circle.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#f2f7f6] border-[#2a7f8f] ring-1 ring-[#2a7f8f] shadow-xs'
                    : 'bg-white border-[#d9e6e4] hover:border-[#6fb59a]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${circle.color}15`, color: circle.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-xs text-[#15303a] truncate">
                      {circle.themeTag}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-[#5a7580] flex items-center gap-0.5">
                    <Users className="w-3 h-3" />
                    <span>{circle.activePeersCount}</span>
                  </span>
                </div>

                <p className="text-[11px] text-[#5a7580] line-clamp-1">
                  {circle.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Circle Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#d9e6e4] shadow-xs space-y-3.5">
        {/* Circle Header */}
        <div className="pb-3 border-b border-[#d9e6e4]/70 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#2a7f8f]">
              Active Moderated Circle
            </span>
            <span className="text-[10px] text-[#5a7580] flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#2a7f8f]" />
              <span>Moderated by {activeCircle.moderator}</span>
            </span>
          </div>

          <h3 className="font-serif text-base font-bold text-[#15303a]">
            {activeCircle.title}
          </h3>
          <p className="text-xs text-[#5a7580] leading-relaxed">
            {activeCircle.description}
          </p>
        </div>

        {/* Pinned Clinician Facilitator Prompt */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Today's Facilitator Prompt:</span>
          </div>
          <p className="text-amber-950 italic leading-relaxed">
            "{activeCircle.pinnedPrompt}"
          </p>
        </div>

        {/* Messages Feed */}
        <div className="space-y-3 pt-1">
          <span className="text-[11px] font-semibold text-[#5a7580] block">
            Community Reflections ({activeCircle.messages.length}):
          </span>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {activeCircle.messages.map((msg) => {
              const isOwnMessage = msg.authorAlias === userAlias;

              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl text-xs space-y-2 border transition-all ${
                    msg.isClinicianNote
                      ? 'bg-indigo-50/50 border-indigo-200 text-[#1e1b4b]'
                      : isOwnMessage
                      ? 'bg-[#f2f7f6] border-[#2a7f8f]/40'
                      : 'bg-white border-[#d9e6e4]'
                  }`}
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          msg.isClinicianNote
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {msg.authorAlias[0]}
                      </div>
                      <span className="font-semibold text-[#15303a]">
                        {msg.authorAlias}
                        {isOwnMessage && (
                          <span className="ml-1 text-[10px] text-[#2a7f8f] font-normal">
                            (You)
                          </span>
                        )}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#5a7580]">{msg.timeAgo}</span>
                  </div>

                  {/* Message Body */}
                  <p className="text-[#334155] leading-relaxed text-xs">
                    {msg.content}
                  </p>

                  {/* Reaction Buttons Strip */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleReaction(activeCircle.id, msg.id, 'warmth')}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                        msg.userReacted === 'warmth'
                          ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                          : 'bg-white hover:bg-slate-50 text-[#5a7580] border-slate-200'
                      }`}
                    >
                      <span>🤍</span>
                      <span>{msg.reactions.warmth}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReaction(activeCircle.id, msg.id, 'holdingSpace')}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                        msg.userReacted === 'holdingSpace'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                          : 'bg-white hover:bg-slate-50 text-[#5a7580] border-slate-200'
                      }`}
                    >
                      <span>🕯️ Space</span>
                      <span>{msg.reactions.holdingSpace}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReaction(activeCircle.id, msg.id, 'breath')}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                        msg.userReacted === 'breath'
                          ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold'
                          : 'bg-white hover:bg-slate-50 text-[#5a7580] border-slate-200'
                      }`}
                    >
                      <span>🌿 Breath</span>
                      <span>{msg.reactions.breath}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReaction(activeCircle.id, msg.id, 'hearYou')}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                        msg.userReacted === 'hearYou'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold'
                          : 'bg-white hover:bg-slate-50 text-[#5a7580] border-slate-200'
                      }`}
                    >
                      <span>🤝 I Hear You</span>
                      <span>{msg.reactions.hearYou}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Post New Reflection Box */}
        <form onSubmit={handlePostShare} className="pt-2 border-t border-[#d9e6e4] space-y-2">
          {submitFeedback && (
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{submitFeedback}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#5a7580]">
            <span>
              Sharing anonymously as <b className="text-[#15303a] font-mono">{userAlias}</b>
            </span>
            <span className="flex items-center gap-1 text-[10px]">
              <Shield className="w-3 h-3 text-[#2a7f8f]" />
              <span>Moderated & Safe</span>
            </span>
          </div>

          <textarea
            rows={2}
            value={newShareContent}
            onChange={(e) => setNewShareContent(e.target.value)}
            placeholder={`Share a gentle thought or coping tool on "${activeCircle.themeTag}"...`}
            className="w-full text-xs p-2.5 rounded-xl border border-[#d9e6e4] focus:outline-hidden focus:ring-2 focus:ring-[#2a7f8f]"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#5a7580]">
              Gentle reminder: No graphic event descriptions.
            </span>

            <button
              type="submit"
              disabled={!newShareContent.trim() || isSubmitting}
              className="px-3.5 py-1.5 rounded-xl bg-[#2a7f8f] hover:bg-[#236b79] text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Share in Circle</span>
            </button>
          </div>
        </form>
      </div>

      {/* Immediate Clinical & Emergency Access Footnote */}
      <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d9e6e4] flex items-center justify-between text-xs">
        <span className="text-[#5a7580]">
          Peer discussions complement, but do not replace, professional clinical care.
        </span>

        <button
          type="button"
          onClick={onOpenCounsellorContact}
          className="text-xs font-semibold text-[#2a7f8f] hover:underline shrink-0"
        >
          Contact Counsellor →
        </button>
      </div>
    </div>
  );
};
