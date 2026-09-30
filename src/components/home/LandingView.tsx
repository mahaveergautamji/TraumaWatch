import React from 'react';
import { ParticleWave } from './ParticleWave';
import { TrajectoryChart } from '../common/TrajectoryChart';
import { SurvivorProfile, RiskAnalysis } from '../../types';
import {
  Shield,
  Activity,
  Heart,
  BarChart3,
  Smartphone,
  Eye,
  ChevronDown,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface LandingViewProps {
  survivorCases: { profile: SurvivorProfile; analysis: RiskAnalysis }[];
  onOpenSurvivorApp: () => void;
  onOpenCounsellorDashboard: () => void;
  onOpenLogin: (role?: 'survivor' | 'counsellor') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  survivorCases,
  onOpenSurvivorApp,
  onOpenCounsellorDashboard,
  onOpenLogin,
}) => {
  const previewCase = survivorCases[0];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-16 px-4 text-center bg-gradient-to-b from-[#d7ebe6] to-[#f2f7f6]">
        <ParticleWave />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#d9e6e4] text-xs font-semibold text-[#15303a] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#3f9d78] animate-pulse" />
            <span>Early-warning for human clinical review</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-[#15303a] tracking-tight leading-[1.12]">
            Notice the change, early.
          </h1>

          <p className="text-base sm:text-lg text-[#5a7580] max-w-xl mx-auto leading-relaxed">
            TraumaWatch follows each person's own trajectory — never a population average — and flags priority for a trained human. It never diagnoses.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenSurvivorApp}
              className="px-6 py-3 rounded-xl bg-[#2a7f8f] hover:bg-[#236b79] text-white font-medium text-sm transition-all shadow-sm hover:-translate-y-0.5"
            >
              Try a 30-second check-in
            </button>
            <button
              onClick={onOpenCounsellorDashboard}
              className="px-6 py-3 rounded-xl bg-white hover:bg-[#f2f7f6] text-[#15303a] border border-[#d9e6e4] font-medium text-sm transition-all hover:-translate-y-0.5 shadow-xs"
            >
              Open counsellor queue
            </button>
          </div>

          {/* Stats Bar */}
          <div className="pt-6 flex flex-wrap justify-center items-center gap-8 sm:gap-12 text-xs text-[#5a7580]">
            <div>
              <b className="block font-serif text-2xl font-semibold text-[#15303a]">28 days</b>
              <span>personal trend</span>
            </div>
            <div>
              <b className="block font-serif text-2xl font-semibold text-[#15303a]">Own baseline</b>
              <span>days 1–8 calibration</span>
            </div>
            <div>
              <b className="block font-serif text-2xl font-semibold text-[#15303a]">0</b>
              <span>diagnoses made</span>
            </div>
            <div>
              <b className="block font-serif text-2xl font-semibold text-[#15303a]">100%</b>
              <span>synthetic demo data</span>
            </div>
          </div>

          {/* Floating Hero Card Preview */}
          <div className="max-w-md mx-auto mt-8 p-5 text-left bg-white rounded-2xl border border-[#d9e6e4] shadow-xl transform perspective-1000">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-[#15303a]">
                  {previewCase.profile.id}
                </span>
                <span className="text-xs text-[#5a7580] truncate max-w-[170px]">
                  · {previewCase.profile.contextTag}
                </span>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  previewCase.analysis.tier === 'High'
                    ? 'bg-[#cf4b4b] text-white'
                    : previewCase.analysis.tier === 'Moderate'
                    ? 'bg-[#d9a934] text-[#3a2d00]'
                    : 'bg-[#3f9d78] text-white'
                }`}
              >
                {previewCase.analysis.tier} · {previewCase.analysis.riskScore}
              </span>
            </div>

            <TrajectoryChart
              history={previewCase.profile.history}
              baselineMean={previewCase.analysis.baselineMean}
              showColorBands={true}
              height={180}
            />

            <div className="mt-3 text-xs text-[#5a7580] flex items-center justify-between border-t border-[#d9e6e4] pt-2">
              <span className="font-medium text-[#15303a]">
                {previewCase.analysis.reasonTag}
              </span>
              <button
                onClick={onOpenCounsellorDashboard}
                className="text-[#2a7f8f] font-semibold hover:underline inline-flex items-center gap-1"
              >
                Inspect case <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how" className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-serif font-semibold text-center text-[#15303a] mb-2">
          How it works
        </h2>
        <p className="text-center text-sm text-[#5a7580] max-w-lg mx-auto mb-10">
          Three quiet steps from a daily check-in to a human conversation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs">
            <b className="block font-serif text-lg text-[#15303a] mb-2">
              1 · Check in
            </b>
            <p className="text-sm text-[#5a7580] leading-relaxed">
              Five gentle questions on a 0–4 scale. No accounts, no real names, minimal mental burden.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs">
            <b className="block font-serif text-lg text-[#15303a] mb-2">
              2 · Compare with yourself
            </b>
            <p className="text-sm text-[#5a7580] leading-relaxed">
              Severity, speed of change, and persistence are measured against your own first week.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs">
            <b className="block font-serif text-lg text-[#15303a] mb-2">
              3 · Human review
            </b>
            <p className="text-sm text-[#5a7580] leading-relaxed">
              Counsellors see why a case is prioritized and decide what gentle outreach happens next.
            </p>
          </div>
        </div>
      </section>

      {/* Why Early Signals Matter */}
      <section id="about" className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-serif font-semibold text-center text-[#15303a] mb-2">
          Why early signals matter
        </h2>
        <p className="text-center text-sm text-[#5a7580] max-w-lg mx-auto mb-10">
          Distress often changes quietly, days before someone asks for help.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs">
            <h3 className="text-lg font-serif font-semibold text-[#15303a] mb-2">
              The gap
            </h3>
            <p className="text-sm text-[#5a7580] leading-relaxed">
              Survivors tend to go quiet before they reach out. Counsellors with large caseloads usually see people only after things have already become hard.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs">
            <h3 className="text-lg font-serif font-semibold text-[#15303a] mb-2">
              Our approach
            </h3>
            <p className="text-sm text-[#5a7580] leading-relaxed">
              A private daily check-in becomes a personal trajectory. Meaningful changes surface earlier, with transparent reasons, and a human reviews every flag.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-serif font-semibold text-center text-[#15303a] mb-2">
          Built for care, not surveillance
        </h2>
        <p className="text-center text-sm text-[#5a7580] max-w-lg mx-auto mb-10">
          Every feature exists to help a counsellor reach the right person sooner.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a7f8f] to-[#6fb59a] text-white flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-semibold text-base text-[#15303a] mb-1">
              Personal baselines
            </h3>
            <p className="text-xs text-[#5a7580] leading-relaxed">
              Each person is compared only with their own first week. No population averages, ever.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a7f8f] to-[#6fb59a] text-white flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-semibold text-base text-[#15303a] mb-1">
              Rate-of-change alerts
            </h3>
            <p className="text-xs text-[#5a7580] leading-relaxed">
              Fast shifts over a few days are surfaced above slow drifts, so urgent cases are seen first.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a7f8f] to-[#6fb59a] text-white flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-semibold text-base text-[#15303a] mb-1">
              Explainable flags
            </h3>
            <p className="text-xs text-[#5a7580] leading-relaxed">
              SHAP-style bars show which signals drove a score, so nothing is a black box.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a7f8f] to-[#6fb59a] text-white flex items-center justify-center mb-4">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-semibold text-base text-[#15303a] mb-1">
              Prioritized queue
            </h3>
            <p className="text-xs text-[#5a7580] leading-relaxed">
              Tier badges, one-line reasons and filters keep a busy caseload manageable for clinicians.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a7f8f] to-[#6fb59a] text-white flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-semibold text-base text-[#15303a] mb-1">
              Low-end phone friendly
            </h3>
            <p className="text-xs text-[#5a7580] leading-relaxed">
              Mobile-first, tap-to-answer, about 30 seconds. Runs fully in the browser offline or online.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-6 shadow-xs hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a7f8f] to-[#6fb59a] text-white flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-semibold text-base text-[#15303a] mb-1">
              Privacy by design
            </h3>
            <p className="text-xs text-[#5a7580] leading-relaxed">
              Synthetic IDs only, minimal personal data, and consent at every step of care.
            </p>
          </div>
        </div>
      </section>

      {/* Model Transparency Band */}
      <section id="model" className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-[#0f3540] via-[#1f6b73] to-[#3f9d78] text-[#eaf6f3] rounded-3xl p-8 sm:p-12 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-center mb-2">
            A transparent risk model
          </h2>
          <p className="text-center text-sm text-[#b9d8d3] max-w-md mx-auto mb-8">
            Computed on-device against each person's own baseline. No hidden weights.
          </p>

          <div className="max-w-lg mx-auto space-y-4 text-sm">
            <div className="grid grid-cols-12 items-center gap-3">
              <span className="col-span-5 sm:col-span-4 text-xs font-medium">Severity above baseline</span>
              <div className="col-span-5 sm:col-span-7 bg-white/20 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#9fe0c8] to-white h-full w-[45%]" />
              </div>
              <b className="col-span-2 sm:col-span-1 text-right text-sm font-mono font-bold">45%</b>
            </div>

            <div className="grid grid-cols-12 items-center gap-3">
              <span className="col-span-5 sm:col-span-4 text-xs font-medium">Rate of change</span>
              <div className="col-span-5 sm:col-span-7 bg-white/20 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#9fe0c8] to-white h-full w-[30%]" />
              </div>
              <b className="col-span-2 sm:col-span-1 text-right text-sm font-mono font-bold">30%</b>
            </div>

            <div className="grid grid-cols-12 items-center gap-3">
              <span className="col-span-5 sm:col-span-4 text-xs font-medium">Persistence</span>
              <div className="col-span-5 sm:col-span-7 bg-white/20 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#9fe0c8] to-white h-full w-[25%]" />
              </div>
              <b className="col-span-2 sm:col-span-1 text-right text-sm font-mono font-bold">25%</b>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-[#3f9d78] text-white">Low · under 30</span>
            <span className="px-3 py-1 rounded-full bg-[#d9a934] text-[#3a2d00]">Moderate · 30–59</span>
            <span className="px-3 py-1 rounded-full bg-[#cf4b4b] text-white">High · 60+</span>
          </div>
        </div>
      </section>

      {/* Trust & Privacy Section */}
      <section id="privacy" className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-serif font-semibold text-center text-[#15303a] mb-2">
          Trust is the product
        </h2>
        <p className="text-center text-sm text-[#5a7580] max-w-lg mx-auto mb-10">
          Safeguards that keep people in control.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-5">
            <h3 className="font-serif font-semibold text-sm text-[#15303a] mb-1">Consent first</h3>
            <p className="text-xs text-[#5a7580]">Nothing is shared with a counsellor unless the person chooses to.</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-5">
            <h3 className="font-serif font-semibold text-sm text-[#15303a] mb-1">Minimal PII</h3>
            <p className="text-xs text-[#5a7580]">Only synthetic IDs like S-104. No names, no home locations.</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-5">
            <h3 className="font-serif font-semibold text-sm text-[#15303a] mb-1">Human decides</h3>
            <p className="text-xs text-[#5a7580]">The tool ranks priority. A trained counsellor makes every decision.</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-5">
            <h3 className="font-serif font-semibold text-sm text-[#15303a] mb-1">Never a diagnosis</h3>
            <p className="text-xs text-[#5a7580]">Messages describe patterns in check-ins, not medical conditions.</p>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-serif font-semibold text-center text-[#15303a] mb-2">
          Roadmap
        </h2>
        <p className="text-center text-sm text-[#5a7580] max-w-lg mx-auto mb-10">
          From hackathon prototype to something responsibly deployable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-5">
            <span className="text-[11px] font-bold text-[#2a7f8f] block mb-1">Phase 1</span>
            <h3 className="font-serif font-semibold text-sm text-[#15303a] mb-1">Prototype</h3>
            <p className="text-xs text-[#5a7580]">This demo, with fully synthetic data and a transparent risk model.</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-5">
            <span className="text-[11px] font-bold text-[#2a7f8f] block mb-1">Phase 2</span>
            <h3 className="font-serif font-semibold text-sm text-[#15303a] mb-1">Consent-based pilot</h3>
            <p className="text-xs text-[#5a7580]">Small pilot with partner support organisations under clear informed consent.</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-5">
            <span className="text-[11px] font-bold text-[#2a7f8f] block mb-1">Phase 3</span>
            <h3 className="font-serif font-semibold text-sm text-[#15303a] mb-1">Regional languages</h3>
            <p className="text-xs text-[#5a7580]">Multilingual check-ins (Hindi, Tamil, Bengali) including voice prompt guidance.</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#d9e6e4] p-5">
            <span className="text-[11px] font-bold text-[#2a7f8f] block mb-1">Phase 4</span>
            <h3 className="font-serif font-semibold text-sm text-[#15303a] mb-1">Clinical validation</h3>
            <p className="text-xs text-[#5a7580]">Institutional ethics review and longitudinal clinician evaluation.</p>
          </div>
        </div>
      </section>

      {/* FAQ & CTA */}
      <section id="faq" className="max-w-3xl mx-auto px-4 pb-20 space-y-4">
        <h2 className="text-3xl font-serif font-semibold text-center text-[#15303a] mb-2">
          Questions, answered
        </h2>
        <p className="text-center text-sm text-[#5a7580] mb-8">
          Clear answers to core ethical and operational questions.
        </p>

        <details className="bg-white rounded-2xl border border-[#d9e6e4] p-4 text-sm group">
          <summary className="font-semibold text-[#15303a] cursor-pointer">
            Does TraumaWatch diagnose anyone?
          </summary>
          <p className="mt-2 text-xs text-[#5a7580] leading-relaxed">
            No. It only highlights changing patterns so a trained counsellor can decide what to do. It never assigns clinical diagnosis codes or replaces psychometric evaluations.
          </p>
        </details>

        <details className="bg-white rounded-2xl border border-[#d9e6e4] p-4 text-sm group">
          <summary className="font-semibold text-[#15303a] cursor-pointer">
            Why compare people only with themselves?
          </summary>
          <p className="mt-2 text-xs text-[#5a7580] leading-relaxed">
            Everyone's normal is different. Trauma survivors often experience elevated chronic tension; comparing against an arbitrary population norm causes constant false alerts. An individual baseline respects their baseline reality.
          </p>
        </details>

        <details className="bg-white rounded-2xl border border-[#d9e6e4] p-4 text-sm group">
          <summary className="font-semibold text-[#15303a] cursor-pointer">
            Is the data real?
          </summary>
          <p className="mt-2 text-xs text-[#5a7580] leading-relaxed">
            No. Every single profile and check-in score in this prototype is fully synthetic and fictional, engineered for demonstrative accuracy.
          </p>
        </details>

        <details className="bg-white rounded-2xl border border-[#d9e6e4] p-4 text-sm group">
          <summary className="font-semibold text-[#15303a] cursor-pointer">
            What happens when someone is flagged?
          </summary>
          <p className="mt-2 text-xs text-[#5a7580] leading-relaxed">
            The case moves up a counsellor's queue with a plain-language reason. A human clinician reviews the 28-day trend and SHAP-style breakdown, then chooses the next step.
          </p>
        </details>

        {/* Call to Action Box */}
        <div className="mt-12 text-center p-8 bg-[#e8f2f0] rounded-3xl border border-[#d9e6e4] space-y-4">
          <h2 className="text-2xl font-serif font-semibold text-[#15303a]">
            See it in action
          </h2>
          <p className="text-sm text-[#5a7580] max-w-sm mx-auto">
            Try the check-in flow, then open the counsellor triage queue.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenSurvivorApp}
              className="px-6 py-2.5 rounded-xl bg-[#2a7f8f] hover:bg-[#236b79] text-white text-sm font-medium transition-all"
            >
              Survivor App
            </button>
            <button
              onClick={onOpenCounsellorDashboard}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-[#f2f7f6] text-[#15303a] border border-[#d9e6e4] text-sm font-medium transition-all"
            >
              Counsellor Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
