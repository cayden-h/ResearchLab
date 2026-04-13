import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPipeline, getApiBase } from '../lib/api';
import type { PipelineRun } from '../lib/types';
import { StatusBadge } from '../components/StatusBadge';

const tabs = ['professors', 'emails', 'statement', 'grants', 'plan'] as const;
type Tab = (typeof tabs)[number];

export function ResultsPage() {
  const { runId } = useParams();
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [tab, setTab] = useState<Tab>('professors');
  const [selectedEmail, setSelectedEmail] = useState(0);

  useEffect(() => {
    if (!runId) {
      return;
    }
    fetchPipeline(runId).then(setRun);
  }, [runId]);

  const result = run?.result;
  const wordCount = useMemo(() => result?.research_statement.split(/\s+/).filter(Boolean).length ?? 0, [result?.research_statement]);

  if (!run || !result) {
    return <div className="px-6 py-16 lg:px-8">Loading results...</div>;
  }

  return (
    <section className="px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] bg-surface-low p-6 shadow-ambient">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-secondary">Research kit ready</p>
              <h1 className="mt-2 font-display text-5xl text-primary">Outputs for {result.profile.full_name}</h1>
              <p className="mt-3 font-body text-base leading-8 text-muted">
                {result.matched_professors.length} professor matches, {result.email_drafts.length} email drafts, {result.grant_matches.length} grant matches,
                and a 12-week onboarding plan.
              </p>
            </div>
            <a
              href={`${getApiBase()}${result.export_url}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-primary px-8 py-3 font-sans text-sm font-extrabold uppercase tracking-[0.18em] text-white"
            >
              Open export
            </a>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <nav className="flex flex-wrap gap-3">
              {tabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-full px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] ${tab === item ? 'bg-primary text-white' : 'bg-surface-low text-muted'}`}
                  onClick={() => setTab(item)}
                >
                  {item === 'statement' ? 'Research statement' : item === 'plan' ? 'Onboarding plan' : item}
                </button>
              ))}
            </nav>

            {tab === 'professors' && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {result.matched_professors.map((entry) => (
                  <article key={entry.professor.name} className="flex h-full flex-col rounded-[1.6rem] bg-white p-6 shadow-ambient">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-secondary">{entry.professor.department}</p>
                        <h3 className="mt-2 font-display text-3xl text-primary">{entry.professor.name}</h3>
                        <p className="mt-2 font-body text-sm text-muted">{entry.professor.title}</p>
                      </div>
                      <StatusBadge tone="complete">{entry.professor.match_score}% match</StatusBadge>
                    </div>
                    <p className="mt-5 font-body text-sm leading-7 text-muted">{entry.professor.research_summary}</p>
                    <div className="mt-5 rounded-3xl bg-surface-low p-4">
                      <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-primary">Why you matched</p>
                      <ul className="mt-3 space-y-2 font-body text-sm text-muted">
                        {entry.professor.overlap_rationale.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-5">
                      <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-primary">Recent papers</p>
                      <div className="mt-3 space-y-3">
                        {entry.recent_papers.map((paper) => (
                          <div key={paper.title} className="rounded-2xl border border-outline/50 p-3">
                            <p className="font-body text-sm font-semibold text-ink">{paper.title}</p>
                            <p className="mt-1 text-xs text-muted">{paper.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {tab === 'emails' && (
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <aside className="space-y-3">
                  {result.email_drafts.map((draft, index) => (
                    <button
                      key={draft.professor_name}
                      type="button"
                      className={`w-full rounded-[1.5rem] p-4 text-left ${selectedEmail === index ? 'bg-white shadow-ambient' : 'bg-surface-low'}`}
                      onClick={() => setSelectedEmail(index)}
                    >
                      <p className="font-display text-2xl text-primary">{draft.professor_name}</p>
                      <p className="mt-2 text-sm text-muted">{draft.subject}</p>
                    </button>
                  ))}
                </aside>
                <article className="rounded-[1.8rem] bg-white p-8 shadow-ambient">
                  <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-secondary">To</p>
                  <p className="mt-2 font-body text-sm text-muted">{result.email_drafts[selectedEmail].to_email}</p>
                  <p className="mt-6 font-sans text-xs font-bold uppercase tracking-[0.18em] text-secondary">Subject</p>
                  <p className="mt-2 font-body text-lg font-semibold text-primary">{result.email_drafts[selectedEmail].subject}</p>
                  <pre className="mt-8 whitespace-pre-wrap font-body text-base leading-8 text-ink">{result.email_drafts[selectedEmail].body}</pre>
                  <div className="mt-8 rounded-3xl bg-surface-low p-5">
                    <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-primary">Personalization notes</p>
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                      {result.email_drafts[selectedEmail].personalization_notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </div>
            )}

            {tab === 'statement' && (
              <article className="rounded-[1.8rem] bg-white p-8 shadow-ambient">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-secondary">Research statement</p>
                    <h2 className="mt-2 font-display text-4xl text-primary">Grounded in the student profile and matched labs</h2>
                  </div>
                  <StatusBadge tone="complete">{wordCount} words</StatusBadge>
                </div>
                <div className="mt-8 space-y-5 font-body text-base leading-8 text-ink">
                  {result.research_statement.split('\n\n').map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            )}

            {tab === 'grants' && (
              <div className="space-y-5">
                {result.grant_matches.map((grant) => (
                  <article key={grant.name} className="rounded-[1.8rem] bg-white p-8 shadow-ambient">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-secondary">{grant.funder}</p>
                        <h2 className="mt-2 font-display text-4xl text-primary">{grant.name}</h2>
                        <p className="mt-3 font-body text-base text-muted">{grant.amount}</p>
                      </div>
                      <StatusBadge tone={grant.urgency}>
                        {grant.urgency === 'high' ? 'Urgent deadline' : grant.urgency === 'medium' ? 'Upcoming deadline' : 'Longer runway'}
                      </StatusBadge>
                    </div>
                    <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto]">
                      <div>
                        <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-primary">Why it fits</p>
                        <ul className="mt-3 space-y-2 font-body text-sm text-muted">
                          {grant.eligibility_reasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-3xl bg-surface-low px-5 py-4">
                        <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-primary">Deadline</p>
                        <p className="mt-2 font-body text-base text-ink">{new Date(grant.deadline).toLocaleDateString()}</p>
                        <a className="mt-4 inline-block text-sm font-bold text-secondary" href={grant.link} target="_blank" rel="noreferrer">
                          View program
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {tab === 'plan' && (
              <div className="space-y-5">
                {result.onboarding_plan.map((week) => (
                  <article key={week.week} className="rounded-[1.8rem] bg-white p-8 shadow-ambient">
                    <div className="flex flex-wrap items-center gap-4">
                      <StatusBadge tone="complete">Week {week.week}</StatusBadge>
                      <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-secondary">{week.phase}</p>
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
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[1.8rem] bg-surface-low p-6">
              <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-secondary">Kit summary</p>
              <div className="mt-5 space-y-4 text-sm text-muted">
                <div className="flex items-center justify-between">
                  <span>Professor matches</span>
                  <strong className="text-primary">{result.matched_professors.length}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email drafts</span>
                  <strong className="text-primary">{result.email_drafts.length}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Grant matches</span>
                  <strong className="text-primary">{result.grant_matches.length}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Onboarding weeks</span>
                  <strong className="text-primary">{result.onboarding_plan.length}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] bg-primary p-6 text-white">
              <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-sky-200">Profile keywords</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {run.profile.keywords.slice(0, 10).map((keyword) => (
                  <span key={keyword} className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

