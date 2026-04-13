import { FormEvent, useEffect, useMemo, useState, useTransition, useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUniversities, startPipeline } from '../lib/api';
import type { StudentProfileInput, UniversityOption } from '../lib/types';

const skillOptions = ['Python', 'R', 'MATLAB', 'Wet lab', 'Microscopy', 'Statistics', 'Scientific writing', 'Data visualization'];
const toolOptions = ['Jupyter', 'Excel', 'SPSS', 'MATLAB', 'Git', 'ImageJ', 'RStudio'];

const initialForm: StudentProfileInput = {
  full_name: '',
  university: '',
  major: '',
  year: 'Junior',
  gpa: 3.5,
  research_interests: '',
  experience_level: 'none',
  interdisciplinary: true,
  skills: ['Python'],
  software_tools: ['Jupyter'],
  goal: 'phd',
  citizenship: 'us_citizen',
  first_generation: true,
  pell_eligible: true,
  resume_highlights: '',
};

export function IntakePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<StudentProfileInput>(initialForm);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const progress = useMemo(() => `${step * 25}%`, [step]);

  useEffect(() => {
    let cancelled = false;
    fetchUniversities(deferredQuery)
      .then((items) => {
        if (!cancelled) {
          setUniversities(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUniversities([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deferredQuery]);

  const canAdvance =
    (step === 1 && form.full_name && form.university && form.major) ||
    (step === 2 && form.research_interests.length >= 20) ||
    step === 3 ||
    step === 4;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (step < 4) {
      if (canAdvance) {
        setStep((current) => current + 1);
      }
      return;
    }

    setSubmitting(true);
    try {
      const response = await startPipeline(form);
      startTransition(() => navigate(`/pipeline/${response.run_id}`));
    } finally {
      setSubmitting(false);
    }
  }

  function toggleValue(field: 'skills' | 'software_tools', value: string) {
    setForm((current) => {
      const set = new Set(current[field]);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      return { ...current, [field]: Array.from(set) };
    });
  }

  return (
    <section className="px-6 py-12 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="rounded-[2rem] bg-midnight p-8 text-white shadow-ambient">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-sky-300">Guided intake</p>
          <h1 className="mt-4 font-display text-5xl leading-tight">Build the research kit with one structured pass.</h1>
          <p className="mt-6 font-body text-base leading-8 text-slate-300">
            The form is split into four steps so students do not hit a wall of fields. Every choice feeds a specific part
            of the pipeline: matching labs, filtering grants, or shaping writing tone.
          </p>
          <div className="mt-10 rounded-3xl bg-white/5 p-5">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-sky-200">Step {step} of 4</p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-secondary-soft transition-all" style={{ width: progress }} />
            </div>
            <p className="mt-3 font-body text-sm text-slate-300">Progress updates stay visible during the live Codex-style pipeline run too.</p>
          </div>
        </aside>

        <form className="rounded-[2rem] bg-white p-8 shadow-ambient lg:p-10" onSubmit={handleSubmit}>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-secondary">Step {step} of 4</p>
              <h2 className="mt-3 font-display text-5xl text-primary">
                {step === 1 && 'Academic Profile'}
                {step === 2 && 'Research Interests'}
                {step === 3 && 'Skills and Tools'}
                {step === 4 && 'Goals and Context'}
              </h2>
            </div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-muted">{progress} complete</p>
          </div>

          {step === 1 && (
            <div className="grid gap-6">
              <label className="field">
                <span>Full name</span>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Maria Gonzalez" />
              </label>
              <label className="field">
                <span>University</span>
                <input
                  value={form.university}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setForm({ ...form, university: e.target.value });
                  }}
                  placeholder="The University of Texas at San Antonio"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {universities.slice(0, 4).map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      className="rounded-full bg-surface-low px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"
                      onClick={() => setForm({ ...form, university: option.name })}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </label>
              <div className="grid gap-6 md:grid-cols-3">
                <label className="field md:col-span-1">
                  <span>Major</span>
                  <input value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} placeholder="Biology" />
                </label>
                <label className="field md:col-span-1">
                  <span>Year</span>
                  <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                    <option>Freshman</option>
                    <option>Sophomore</option>
                    <option>Junior</option>
                    <option>Senior</option>
                  </select>
                </label>
                <label className="field md:col-span-1">
                  <span>GPA</span>
                  <input type="number" step="0.1" min="0" max="4" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: Number(e.target.value) })} />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-8">
              <label className="field">
                <span>What topics fascinate you?</span>
                <textarea
                  value={form.research_interests}
                  onChange={(e) => setForm({ ...form, research_interests: e.target.value })}
                  placeholder="I am interested in using machine learning to improve cancer imaging workflows and more equitable diagnostics."
                  rows={7}
                />
              </label>
              <div>
                <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-primary">Prior experience</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    ['none', 'No research experience'],
                    ['coursework', 'Relevant coursework'],
                    ['volunteer', 'Volunteer or club research'],
                    ['independent', 'Independent project'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`rounded-full px-5 py-3 text-sm font-semibold ${form.experience_level === value ? 'bg-primary text-white' : 'bg-surface-low text-muted'}`}
                      onClick={() => setForm({ ...form, experience_level: value as StudentProfileInput['experience_level'] })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center justify-between rounded-3xl bg-surface-low p-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Interdisciplinary exploration</p>
                  <p className="mt-1 font-body text-sm text-muted">Open to labs beyond your exact department if the fit is strong.</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.interdisciplinary}
                  onChange={(e) => setForm({ ...form, interdisciplinary: e.target.checked })}
                  className="h-5 w-5 accent-secondary"
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-8">
              <div>
                <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-primary">Skills</p>
                <div className="flex flex-wrap gap-3">
                  {skillOptions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${form.skills.includes(skill) ? 'bg-secondary text-white' : 'bg-surface-low text-muted'}`}
                      onClick={() => toggleValue('skills', skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-primary">Software tools</p>
                <div className="flex flex-wrap gap-3">
                  {toolOptions.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${form.software_tools.includes(tool) ? 'bg-primary text-white' : 'bg-surface-low text-muted'}`}
                      onClick={() => toggleValue('software_tools', tool)}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <label className="field">
                  <span>Citizenship</span>
                  <select value={form.citizenship} onChange={(e) => setForm({ ...form, citizenship: e.target.value as StudentProfileInput['citizenship'] })}>
                    <option value="us_citizen">US citizen</option>
                    <option value="permanent_resident">Permanent resident</option>
                    <option value="international">International student</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 rounded-3xl bg-surface-low px-5 py-4">
                  <input type="checkbox" checked={form.first_generation} onChange={(e) => setForm({ ...form, first_generation: e.target.checked })} className="h-5 w-5 accent-secondary" />
                  <span className="text-sm font-semibold text-muted">First-generation student</span>
                </label>
                <label className="flex items-center gap-3 rounded-3xl bg-surface-low px-5 py-4">
                  <input type="checkbox" checked={form.pell_eligible} onChange={(e) => setForm({ ...form, pell_eligible: e.target.checked })} className="h-5 w-5 accent-secondary" />
                  <span className="text-sm font-semibold text-muted">Pell-eligible</span>
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-6">
              <label className="field">
                <span>Primary goal</span>
                <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value as StudentProfileInput['goal'] })}>
                  <option value="phd">PhD pathway</option>
                  <option value="med_school">Medical school</option>
                  <option value="industry">Industry pathway</option>
                  <option value="explore">Still exploring</option>
                </select>
              </label>
              <label className="field">
                <span>Resume highlights or context</span>
                <textarea
                  value={form.resume_highlights}
                  onChange={(e) => setForm({ ...form, resume_highlights: e.target.value })}
                  placeholder="Add notable coursework, leadership, volunteer work, or constraints we should factor into writing tone."
                  rows={6}
                />
              </label>
              <div className="rounded-3xl bg-surface-low p-6">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">Ready to run</p>
                <p className="mt-3 font-body text-sm leading-7 text-muted">
                  The product will search for faculty matches, read professor context, draft outreach emails, write your
                  research statement, filter grants, and create a 12-week onboarding plan.
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              className="rounded-full border border-outline px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-primary disabled:opacity-40"
              disabled={step === 1 || submitting || isPending}
              onClick={() => setStep((current) => Math.max(current - 1, 1))}
            >
              Back
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-8 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white disabled:opacity-40"
              disabled={!canAdvance || submitting || isPending}
            >
              {step === 4 ? (submitting ? 'Starting pipeline...' : 'Generate my kit') : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

