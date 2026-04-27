import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { FeedbackBlock } from '../components/FeedbackBlock';
import { usePageReveal } from '../hooks/usePageReveal';
import { fetchPipeline, getApiBase } from '../lib/api';
import { formatDateTime } from '../lib/format';
import type { PipelineEvent, PipelineRun, PipelineStep } from '../lib/types';

function updateSteps(steps: PipelineStep[], event: PipelineEvent): PipelineStep[] {
  return steps.map((step) => {
    if (step.id !== event.step_id) {
      return step;
    }

    return {
      ...step,
      status: event.event === 'step_started' ? 'running' : 'completed',
    } satisfies PipelineStep;
  });
}

export function PipelinePage() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const scopeRef = usePageReveal<HTMLElement>([]);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const startedStreamRef = useRef(false);
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [streamState, setStreamState] = useState<'loading' | 'live' | 'complete' | 'error'>('loading');

  useEffect(() => {
    if (!runId) {
      return;
    }

    fetchPipeline(runId)
      .then((response) => {
        setRun(response);
        setProgress(response.status === 'completed' ? 100 : 5);
        setStreamState(response.status === 'completed' ? 'complete' : 'live');
      })
      .catch(() => {
        setError('This pipeline could not be loaded. Please return to history and try again.');
        setStreamState('error');
      });
  }, [runId]);

  useEffect(() => {
    if (!runId || startedStreamRef.current) {
      return;
    }

    startedStreamRef.current = true;
    const source = new EventSource(`${getApiBase()}/api/pipeline/${runId}/events`);

    source.onmessage = (message) => {
      const event = JSON.parse(message.data) as PipelineEvent;
      setEvents((current) => [event, ...current].slice(0, 6));
      setProgress(event.progress);
      setStreamState(event.event === 'complete' ? 'complete' : 'live');
      setRun((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          status: event.run_status,
          steps: event.step_id ? updateSteps(current.steps, event) : current.steps,
        };
      });

      if (event.event === 'complete') {
        window.setTimeout(() => {
          navigate(`/results/${runId}`);
        }, 900);
      }
    };

    source.onerror = () => {
      source.close();
      setStreamState((current) => (current === 'complete' ? current : 'error'));
      setError('The live progress connection dropped before completion.');
    };

    return () => {
      source.close();
      startedStreamRef.current = false;
    };
  }, [navigate, runId]);

  useEffect(() => {
    if (!progressBarRef.current) {
      return;
    }

    gsap.to(progressBarRef.current, {
      width: `${progress}%`,
      duration: 0.7,
      ease: 'power3.out',
    });
  }, [progress]);

  const currentStep = useMemo(
    () => run?.steps.find((step) => step.status === 'running') ?? run?.steps.find((step) => step.status === 'pending'),
    [run],
  );

  if (error && !run) {
    return (
      <section className="section-band">
        <div className="page-frame">
          <FeedbackBlock title="Pipeline unavailable" description={error} tone="danger" />
        </div>
      </section>
    );
  }

  if (!run) {
    return (
      <section className="section-band">
        <div className="page-frame">
          <div className="section-panel px-6 py-10">
            <p className="eyebrow">Loading pipeline</p>
            <h1 className="section-title mt-4">Preparing your run timeline.</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={scopeRef} className="section-band">
      <div className="page-frame grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="section-panel overflow-hidden bg-hero px-6 py-7 text-white lg:px-8" data-reveal>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/10 px-4 py-2 font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-200">
              {streamState === 'complete' ? 'Ready' : streamState === 'error' ? 'Interrupted' : 'Active pipeline'}
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2 font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-200">
              Run {run.id.slice(0, 8)}
            </span>
          </div>

          <h1 className="mt-5 font-display text-5xl leading-[0.96]">Building the research kit step by step.</h1>
          <p className="mt-5 font-body text-base leading-8 text-slate-200">
            The backend work is already prepared. This screen turns the system timeline into something the student can
            follow without guessing.
          </p>

          <div className="mt-8 rounded-[1.6rem] bg-black/20 p-5">
            <p className="font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-200">Current focus</p>
            <p className="mt-3 font-display text-3xl text-white">{currentStep?.label ?? 'Packaging results'}</p>
            <p className="mt-3 font-body text-sm leading-7 text-slate-200">{currentStep?.detail ?? 'Preparing the final workspace.'}</p>
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-200">Overall progress</p>
                <p className="mt-2 font-display text-4xl text-white">{progress}%</p>
              </div>
              <p className="font-body text-sm text-slate-200">{formatDateTime(run.created_at)}</p>
            </div>
            <div className="mt-4 h-3 rounded-full bg-white/10">
              <div ref={progressBarRef} className="h-full rounded-full bg-[linear-gradient(90deg,#adc8f5,#81d0f8)]" style={{ width: 0 }} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/history" className="secondary-button bg-white text-primary">
              View History
            </Link>
            <Link to={`/results/${run.id}`} className="ghost-button border-0 bg-white/10 text-white shadow-none">
              Open Results
            </Link>
          </div>

          {error ? <div className="mt-6"><FeedbackBlock title="Connection note" description={error} tone="danger" /></div> : null}
        </aside>

        <div className="grid gap-6" data-reveal>
          <div className="section-panel bg-[rgba(255,253,249,0.88)] px-6 py-7 lg:px-8">
            <p className="eyebrow">Pipeline timeline</p>
            <div className="mt-6 grid gap-4">
              {run.steps.map((step) => (
                <article key={step.id} className={`editorial-panel px-5 py-5 ${step.status === 'running' ? 'bg-[rgba(135,214,254,0.14)]' : 'bg-white'}`}>
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-sans text-sm font-extrabold ${
                        step.status === 'completed'
                          ? 'bg-secondary text-white'
                          : step.status === 'running'
                            ? 'bg-secondary-soft text-primary'
                            : 'bg-surface-low text-muted'
                      }`}
                    >
                      {step.status === 'completed' ? 'OK' : step.status === 'running' ? '...' : '0'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-sans text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{step.label}</p>
                        <span className="font-body text-sm text-muted">{step.progress}%</span>
                      </div>
                      <p className="mt-2 font-body text-base leading-7 text-ink">{step.description}</p>
                      {step.detail ? <p className="mt-2 font-body text-sm leading-7 text-muted">{step.detail}</p> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="section-panel bg-[rgba(255,253,249,0.78)] px-6 py-7 lg:px-8">
            <p className="eyebrow">Live activity</p>
            <div className="mt-5 grid gap-3">
              {events.length === 0 ? (
                <FeedbackBlock
                  title="Waiting for activity"
                  description="The stream will begin replaying backend steps as soon as the server sends the first event."
                />
              ) : (
                events.map((event, index) => (
                  <article key={`${event.generated_at}-${index}`} className="editorial-panel bg-white px-4 py-4">
                    <p className="font-body text-sm leading-7 text-ink">{event.message}</p>
                    <p className="mt-2 font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-muted">
                      {formatDateTime(event.generated_at)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
