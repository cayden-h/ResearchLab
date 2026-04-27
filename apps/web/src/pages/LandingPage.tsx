import { Link } from 'react-router-dom';
import { PageHeading } from '../components/PageHeading';
import { usePageReveal } from '../hooks/usePageReveal';

const stats = [
  {
    value: '8-15 hours',
    label: 'of fragmented prep collapsed into one guided workflow',
  },
  {
    value: 'Under 3 min',
    label: 'to assemble a complete research application kit',
  },
  {
    value: '5 outputs',
    label: 'matched labs, emails, statement, grants, and onboarding plan',
  },
];

const deliverables = [
  'Faculty matches ranked by research overlap and student fit.',
  'Cold email drafts with recent-paper personalization already included.',
  'A research statement grounded in the student profile and lab direction.',
  'Grant and fellowship matches filtered for eligibility and urgency.',
  'A 12-week onboarding plan that makes joining a lab feel concrete.',
];

const workflow = [
  {
    title: 'Structured intake',
    detail: 'Students enter their context once, with every field tied to a downstream output.',
  },
  {
    title: 'Visible pipeline',
    detail: 'The system replays each backend step so the process feels legible instead of magical.',
  },
  {
    title: 'Usable kit',
    detail: 'Results are grouped into actions a student can review, export, and use immediately.',
  },
];

export function LandingPage() {
  const scopeRef = usePageReveal<HTMLDivElement>([]);

  return (
    <div ref={scopeRef}>
      <section className="section-band pt-6 lg:pt-10">
        <div className="page-frame">
          <div className="overflow-hidden rounded-[2.4rem] bg-hero text-white shadow-ambient">
            <div className="grid gap-10 px-6 py-10 lg:grid-cols-[1.25fr_0.75fr] lg:px-10 lg:py-14">
              <div data-reveal>
                <PageHeading
                  eyebrow="Research access for undergraduates"
                  title="A polished research kit, not a maze of unwritten rules."
                  description="ResearchBridge turns one intake form into matched faculty, personalized outreach, a research statement, grant opportunities, and a first-semester plan that students can actually act on."
                  tone="light"
                  actions={
                    <>
                      <Link to="/intake" className="secondary-button bg-white text-primary">
                        Build My Kit
                      </Link>
                      <Link to="/history" className="ghost-button border-0 bg-white/10 text-white shadow-none">
                        View Past Kits
                      </Link>
                    </>
                  }
                />
              </div>

              <div className="grid content-end gap-4" data-reveal>
                {stats.map((stat) => (
                  <article key={stat.value} className="rounded-[1.8rem] bg-white/10 p-6 backdrop-blur-sm">
                    <p className="font-display text-4xl text-white md:text-5xl">{stat.value}</p>
                    <p className="mt-2 max-w-xs font-body text-sm leading-7 text-slate-200">{stat.label}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="page-frame grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div data-reveal>
            <p className="eyebrow">What ships in the kit</p>
            <h2 className="section-title mt-4">Every output is designed to reduce hesitation, not add more reading.</h2>
            <p className="body-copy mt-5 text-muted">
              The interface stays calm and editorial, but the product itself stays practical. Each section is built for the
              next real action a student needs to take.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2" data-reveal>
            {deliverables.map((item, index) => (
              <article key={item} className="metric-card min-h-[180px]">
                <p className="eyebrow text-accent">Output 0{index + 1}</p>
                <p className="mt-4 font-body text-lg leading-8 text-ink">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="page-frame">
          <div className="section-panel bg-[rgba(255,253,249,0.82)] px-6 py-8 lg:px-10 lg:py-10">
            <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
              <div data-reveal>
                <p className="eyebrow">Workflow design</p>
                <h2 className="section-title mt-4">Transparent, paced, and built to feel trustworthy.</h2>
                <p className="body-copy mt-5 text-muted">
                  The product references the research process without imitating a generic dashboard. Wide spacing, quieter
                  surfaces, and clear transitions keep the experience modern without losing seriousness.
                </p>
              </div>

              <div className="grid gap-4" data-reveal>
                {workflow.map((item, index) => (
                  <article key={item.title} className="editorial-panel bg-white px-6 py-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="eyebrow text-accent">Stage 0{index + 1}</p>
                        <h3 className="mt-3 font-display text-3xl text-primary">{item.title}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-surface-low" />
                    </div>
                    <p className="body-copy mt-4 text-muted">{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
