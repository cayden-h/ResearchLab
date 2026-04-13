import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPipeline, getApiBase } from '../lib/api';
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
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!runId) {
      return;
    }
    fetchPipeline(runId).then((response) => {
      setRun(response);
      setProgress(response.status === 'completed' ? 100 : 5);
    });
  }, [runId]);

  useEffect(() => {
    if (!runId) {
      return;
    }
    const source = new EventSource(`${getApiBase()}/api/pipeline/${runId}/events`);
    source.onmessage = (message) => {
      const event = JSON.parse(message.data) as PipelineEvent;
      setEvents((current) => [event, ...current].slice(0, 6));
      setProgress(event.progress);
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

    return () => {
      source.close();
    };
  }, [navigate, runId]);

  const currentStep = useMemo(() => run?.steps.find((step) => step.status === 'running') ?? run?.steps.find((step) => step.status === 'pending'), [run]);

  if (!run) {
    return <div className="px-6 py-16 lg:px-8">Loading pipeline...</div>;
  }

  return (
    <section className="min-h-[calc(100vh-73px)] bg-midnight px-6 py-12 text-white lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-[2rem] bg-white/5 p-8 backdrop-blur">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-sky-200">Status: Active pipeline</p>
          <h1 className="mt-5 font-display text-5xl">Building your research kit</h1>
          <p className="mt-5 max-w-lg font-body text-base leading-8 text-slate-300">
            This view surfaces every major backend step so the student can see what the system is doing on their behalf.
          </p>
          <div className="mt-10 rounded-3xl bg-black/20 p-5">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Current focus</p>
            <p className="mt-3 font-body text-lg text-white">{currentStep?.description ?? 'Packaging your results'}</p>
            <p className="mt-2 font-body text-sm text-slate-300">{currentStep?.detail ?? 'Preparing the final workspace.'}</p>
          </div>
          <div className="mt-10">
            <div className="mb-3 flex items-end justify-between">
              <span className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-sky-200">Overall progress</span>
              <span className="font-display text-4xl text-secondary-soft">{progress}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#adc8f5,#81d0f8)] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </aside>

        <div className="rounded-[2rem] bg-[#121c2b] p-8 shadow-ambient">
          <div className="space-y-6">
            {run.steps.map((step) => (
              <div key={step.id} className={`flex gap-5 rounded-3xl p-4 ${step.status === 'running' ? 'bg-white/6' : ''}`}>
                <div
                  className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step.status === 'completed'
                      ? 'bg-secondary text-white'
                      : step.status === 'running'
                        ? 'bg-sky-200 text-primary'
                        : 'border border-white/20 text-slate-400'
                  }`}
                >
                  {step.status === 'completed' ? '✓' : step.status === 'running' ? '…' : ''}
                </div>
                <div>
                  <p className={`font-sans text-sm font-extrabold uppercase tracking-[0.18em] ${step.status === 'running' ? 'text-sky-200' : 'text-white'}`}>{step.label}</p>
                  <p className="mt-1 font-body text-base text-slate-200">{step.description}</p>
                  {step.detail && <p className="mt-2 font-body text-sm text-slate-400">{step.detail}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-sky-200">Live activity</p>
            <div className="mt-4 space-y-3">
              {events.map((event, index) => (
                <div key={`${event.generated_at}-${index}`} className="rounded-2xl bg-black/15 px-4 py-3 font-body text-sm text-slate-300">
                  {event.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
