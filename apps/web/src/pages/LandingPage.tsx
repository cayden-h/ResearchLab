import { Link } from 'react-router-dom';

const stats = [
  {
    value: '8-15 hours',
    label: 'of hidden prep condensed into one guided workflow',
  },
  {
    value: '< 3 min',
    label: 'target time to generate a complete application kit',
  },
  {
    value: '5 outputs',
    label: 'professors, emails, statement, grants, and onboarding plan',
  },
];

const pillars = [
  'Enter your profile once with clear explanations for every field.',
  'Watch the pipeline work step by step instead of staring at a spinner.',
  'Review grounded professor matches, personalized emails, grants, and your first 12 weeks in a lab.',
];

export function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-hero text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(135,214,254,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_36%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-28">
          <div>
            <p className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.28em] text-sky-200">
              AI-Powered Research Lab Entry Kit
            </p>
            <h1 className="max-w-4xl font-display text-6xl leading-[0.95] text-white md:text-8xl">
              Research access should not depend on inherited academic capital.
            </h1>
            <p className="mt-8 max-w-2xl font-body text-lg leading-8 text-slate-200">
              ResearchBridge builds a full undergraduate research application kit: matched professors, personalized
              cold emails, a research statement, curated grants, and a 12-week onboarding plan.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/intake"
                className="rounded-md bg-secondary-soft px-8 py-4 font-sans text-sm font-extrabold uppercase tracking-[0.22em] text-[#003548] transition hover:-translate-y-0.5"
              >
                Build My Kit
              </Link>
              <Link
                to="/glossary"
                className="rounded-md border border-white/20 px-8 py-4 font-sans text-sm font-bold uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
              >
                See the glossary
              </Link>
            </div>
          </div>
          <div className="grid gap-5 self-end">
            {stats.map((stat) => (
              <article key={stat.value} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="font-display text-4xl text-white">{stat.value}</p>
                <p className="mt-2 max-w-xs font-body text-sm leading-6 text-slate-200">{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-low px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-secondary">How it works</p>
            <h2 className="mt-3 font-display text-5xl text-primary">A transparent research pipeline, not a black box.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, index) => (
              <div key={pillar} className="rounded-3xl bg-white p-8 shadow-ambient">
                <p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-secondary">Step 0{index + 1}</p>
                <p className="mt-4 font-body text-lg leading-8 text-muted">{pillar}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

