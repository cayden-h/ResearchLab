import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FeedbackBlock } from '../components/FeedbackBlock';
import { PageHeading } from '../components/PageHeading';
import { StatusBadge } from '../components/StatusBadge';
import { usePageReveal } from '../hooks/usePageReveal';
import { fetchPipeline, getApiBase } from '../lib/api';
import { formatDate, formatDateTime, toTitleCase } from '../lib/format';
import type { PipelineRun } from '../lib/types';

const tabs = ['professors', 'emails', 'statement', 'grants', 'plan'] as const;
type Tab = (typeof tabs)[number];

export function ResultsPage() {
  const { runId } = useParams();
  const scopeRef = usePageReveal<HTMLElement>([]);
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [tab, setTab] = useState<Tab>('professors');
  const [selectedEmail, setSelectedEmail] = useState(0);
  const [error, setError] = useState('');
  const [copyState, setCopyState] = useState('');

  useEffect(() => {
    if (!runId) {
      return;
    }

    fetchPipeline(runId)
      .then((response) => {
        setRun(response);
        setError('');
      })
      .catch(() => {
        setError('These results could not be loaded. Please reopen them from history.');
      });
  }, [runId]);

  const result = run?.result;
  const wordCount = useMemo(() => result?.research_statement.split(/\s+/).filter(Boolean).length ?? 0, [result?.research_statement]);

  async function handleCopyEmail() {
    if (!result) {
      return;
    }

    try {
      const draft = result.email_drafts[selectedEmail];
      await navigator.clipboard.writeText(`To: ${draft.to_email}\nSubject: ${draft.subject}\n\n${draft.body}`);
      setCopyState('Copied email draft');
      window.setTimeout(() => setCopyState(''), 1400);
    } catch {
      setCopyState('Copy unavailable in this browser');
      window.setTimeout(() => setCopyState(''), 1400);
    }
  }

  if (error && !run) {
    return (
      <section className="section-band">
        <div className="page-frame">
          <FeedbackBlock title="Results unavailable" description={error} tone="danger" />
        </div>
      </section>
    );
  }

  if (!run || !result) {
    return (
      <section className="section-band">
        <div className="page-frame">
          <div className="section-panel px-6 py-10">
            <p className="eyebrow">Loading results</p>
            <h1 className="section-title mt-4">Preparing the finished research kit.</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={scopeRef} className="section-band">
      <div className="page-frame space-y-8">
        <div className="section-panel overflow-hidden bg-hero px-6 py-8 text-white lg:px-10 lg:py-10" data-reveal>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <PageHeading
              eyebrow="Research kit ready"
              title={`Outputs for ${result.profile.full_name}`}
              description={`${result.matched_professors.length} professor matches, ${result.email_drafts.length} email drafts, ${result.grant_matches.length} grant matches, and a full onboarding plan are ready to review.`}
              tone="light"
              actions={
                <>
                  <a href={`${getApiBase()}${result.export_url}`} target="_blank" rel="noreferrer" className="secondary-button bg-white text-primary">
                    Open Export
                  </a>
                  <Link to="/history" className="ghost-button border-0 bg-white/10 text-white shadow-none">
                    Back to History
                  </Link>
                </>
              }
            />

            <div className="grid gap-4">
              <article className="rounded-[1.7rem] bg-white/10 p-5 backdrop-blur-sm">
                <p className="font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-200">Profile snapshot</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-100">
                  <div className="flex items-center justify-between gap-4">
                    <span>Major</span>
                    <strong>{result.profile.major}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Goal</span>
                    <strong>{toTitleCase(result.profile.goal)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Generated</span>
                    <strong>{formatDateTime(result.generated_at)}</strong>
                  </div>
                </div>
              </article>

              <article className="rounded-[1.7rem] bg-white/10 p-5 backdrop-blur-sm">
                <p className="font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-200">Kit composition</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[1.15rem] bg-black/15 px-4 py-4">
                    <p className="font-display text-3xl text-white">{result.matched_professors.length}</p>
                    <p className="mt-1 font-body text-sm text-slate-200">Faculty matches</p>
                  </div>
                  <div className="rounded-[1.15rem] bg-black/15 px-4 py-4">
                    <p className="font-display text-3xl text-white">{result.grant_matches.length}</p>
                    <p className="mt-1 font-body text-sm text-slate-200">Grant matches</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr]" data-reveal>
          <div className="space-y-6">
            <nav className="section-panel flex flex-wrap gap-3 px-5 py-4">
              {tabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`chip-button ${tab === item ? 'chip-button-active' : 'text-muted'}`}
                  onClick={() => setTab(item)}
                >
                  {item === 'statement' ? 'Research statement' : item === 'plan' ? 'Onboarding plan' : item}
                </button>
              ))}
            </nav>

            {tab === 'professors' ? (
              <div className="grid gap-5 md:grid-cols-2">
                {result.matched_professors.map((entry) => (
                  <article key={entry.professor.name} className="editorial-panel bg-white px-6 py-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow text-accent">{entry.professor.department}</p>
                        <h3 className="mt-3 font-display text-3xl text-primary">{entry.professor.name}</h3>
                        <p className="mt-2 font-body text-sm text-muted">{entry.professor.title}</p>
                        <p className="mt-2 font-body text-sm text-muted">{entry.professor.institution}</p>
                      </div>
                      <StatusBadge tone="complete">{entry.professor.match_score}% match</StatusBadge>
                    </div>

                    <p className="body-copy mt-5 text-muted">{entry.professor.research_summary}</p>

                    <div className="mt-5 rounded-[1.3rem] bg-surface-low px-4 py-4">
                      <p className="eyebrow text-primary">Why you matched</p>
                      <ul className="mt-3 space-y-2 font-body text-sm leading-7 text-muted">
                        {entry.professor.overlap_rationale.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {entry.recent_papers.map((paper) => (
                        <div key={paper.title} className="rounded-[1.15rem] bg-[rgba(2,36,72,0.04)] px-4 py-4">
                          <p className="font-body text-sm font-semibold leading-7 text-ink">{paper.title}</p>
                          <p className="mt-1 font-body text-xs uppercase tracking-[0.14em] text-muted">{paper.year}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a className="ghost-button" href={entry.professor.public_lab_url} target="_blank" rel="noreferrer">
                        Visit Lab
                      </a>
                      <StatusBadge tone={entry.has_openings ? 'low' : 'medium'}>
                        {entry.has_openings ? 'Open to students' : 'Conversation first'}
                      </StatusBadge>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {tab === 'emails' ? (
              <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <aside className="section-panel grid gap-3 px-4 py-4">
                  {result.email_drafts.map((draft, index) => (
                    <button
                      key={draft.professor_name}
                      type="button"
                      className={`rounded-[1.4rem] px-4 py-4 text-left transition ${
                        selectedEmail === index ? 'bg-white shadow-ambient' : 'bg-surface-low hover:bg-white/80'
                      }`}
                      onClick={() => setSelectedEmail(index)}
                    >
                      <p className="font-display text-2xl text-primary">{draft.professor_name}</p>
                      <p className="mt-2 font-body text-sm leading-7 text-muted">{draft.subject}</p>
                    </button>
                  ))}
                </aside>

                <article className="section-panel bg-[rgba(255,253,249,0.9)] px-6 py-7 lg:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="eyebrow">Email draft</p>
                      <p className="mt-3 font-body text-sm text-muted">{result.email_drafts[selectedEmail].to_email}</p>
                    </div>
                    <button type="button" className="ghost-button" onClick={handleCopyEmail}>
                      Copy Draft
                    </button>
                  </div>

                  <h2 className="mt-6 font-display text-4xl text-primary">{result.email_drafts[selectedEmail].subject}</h2>
                  <pre className="mt-6 whitespace-pre-wrap font-body text-base leading-8 text-ink">{result.email_drafts[selectedEmail].body}</pre>

                  <div className="mt-6 rounded-[1.4rem] bg-surface-low px-5 py-5">
                    <p className="eyebrow text-primary">Personalization notes</p>
                    <ul className="mt-3 space-y-2 font-body text-sm leading-7 text-muted">
                      {result.email_drafts[selectedEmail].personalization_notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>

                  {copyState ? <p className="mt-4 font-body text-sm text-muted">{copyState}</p> : null}
                </article>
              </div>
            ) : null}

            {tab === 'statement' ? (
              <article className="section-panel bg-[rgba(255,253,249,0.9)] px-6 py-7 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Research statement</p>
                    <h2 className="mt-3 font-display text-4xl text-primary">Grounded in the student profile and matched labs.</h2>
                  </div>
                  <StatusBadge tone="complete">{wordCount} words</StatusBadge>
                </div>

                <div className="mt-8 space-y-5 font-body text-base leading-8 text-ink">
                  {result.research_statement.split('\n\n').map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ) : null}

            {tab === 'grants' ? (
              <div className="grid gap-5">
                {result.grant_matches.map((grant) => (
                  <article key={grant.name} className="section-panel bg-[rgba(255,253,249,0.9)] px-6 py-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow text-accent">{grant.funder}</p>
                        <h2 className="mt-3 font-display text-4xl text-primary">{grant.name}</h2>
                        <p className="mt-3 font-body text-base text-muted">{grant.amount}</p>
                      </div>
                      <StatusBadge tone={grant.urgency}>
                        {grant.urgency === 'high' ? 'Urgent deadline' : grant.urgency === 'medium' ? 'Upcoming deadline' : 'Longer runway'}
                      </StatusBadge>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-[1fr_auto]">
                      <div className="rounded-[1.35rem] bg-surface-low px-5 py-5">
                        <p className="eyebrow text-primary">Why it fits</p>
                        <ul className="mt-3 space-y-2 font-body text-sm leading-7 text-muted">
                          {grant.eligibility_reasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-[1.35rem] bg-white px-5 py-5 shadow-ambient">
                        <p className="eyebrow text-primary">Deadline</p>
                        <p className="mt-3 font-body text-base text-ink">{formatDate(grant.deadline)}</p>
                        <a className="mt-5 inline-flex font-sans text-sm font-extrabold uppercase tracking-[0.16em] text-secondary" href={grant.link} target="_blank" rel="noreferrer">
                          View Program
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {tab === 'plan' ? (
              <div className="grid gap-5">
                {result.onboarding_plan.map((week) => (
                  <article key={week.week} className="section-panel bg-[rgba(255,253,249,0.9)] px-6 py-7">
                    <div className="flex flex-wrap items-center gap-4">
                      <StatusBadge tone="complete">Week {week.week}</StatusBadge>
                      <p className="eyebrow text-accent">{week.phase}</p>
                    </div>
                    <h2 className="mt-4 font-display text-4xl text-primary">{week.theme}</h2>
                    <ul className="mt-5 space-y-2 font-body text-sm leading-7 text-muted">
                      {week.tasks.map((task) => (
                        <li key={task}>{task}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="grid gap-5">
            <div className="section-panel bg-[rgba(255,253,249,0.88)] px-6 py-6">
              <p className="eyebrow">Kit summary</p>
              <div className="mt-5 grid gap-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-body text-sm text-muted">Professor matches</span>
                  <strong className="font-display text-3xl text-primary">{result.matched_professors.length}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-body text-sm text-muted">Email drafts</span>
                  <strong className="font-display text-3xl text-primary">{result.email_drafts.length}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-body text-sm text-muted">Grant matches</span>
                  <strong className="font-display text-3xl text-primary">{result.grant_matches.length}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-body text-sm text-muted">Onboarding weeks</span>
                  <strong className="font-display text-3xl text-primary">{result.onboarding_plan.length}</strong>
                </div>
              </div>
            </div>

            <div className="section-panel overflow-hidden bg-hero px-6 py-6 text-white">
              <p className="font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-200">Profile keywords</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {run.profile.keywords.slice(0, 10).map((keyword) => (
                  <span key={keyword} className="rounded-full bg-white/10 px-3 py-2 font-sans text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-100">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="section-panel bg-[rgba(255,253,249,0.88)] px-6 py-6">
              <p className="eyebrow">Next move</p>
              <p className="mt-4 font-body text-sm leading-7 text-muted">
                Review the top two faculty matches first, then tailor one email draft before opening the export view.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
