import { FormEvent, useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedbackBlock } from '../components/FeedbackBlock';
import { usePageReveal } from '../hooks/usePageReveal';
import { fetchUniversities, startPipeline } from '../lib/api';
import type { StudentProfileInput, UniversityOption } from '../lib/types';

const skillOptions = ['Python', 'R', 'MATLAB', 'Wet lab', 'Microscopy', 'Statistics', 'Scientific writing', 'Data visualization'];
const toolOptions = ['Jupyter', 'Excel', 'SPSS', 'MATLAB', 'Git', 'ImageJ', 'RStudio'];

const steps = [
  {
    title: 'Academic profile',
    helper: 'Basic context anchors matching and makes the kit read like it was built for one student, not a template.',
  },
  {
    title: 'Research interests',
    helper: 'Interest language becomes match keywords, outreach tone, and the center of the research statement.',
  },
  {
    title: 'Skills and context',
    helper: 'Current skills and student background shape fit, eligibility, and how ambitious the plan should be.',
  },
  {
    title: 'Goals and resume notes',
    helper: 'Career direction and highlights keep every output pointed toward a real next step.',
  },
] as const;

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
  const scopeRef = usePageReveal<HTMLElement>([]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<StudentProfileInput>(initialForm);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [universitiesError, setUniversitiesError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const progress = useMemo(() => `${step * 25}%`, [step]);

  useEffect(() => {
    let cancelled = false;

    fetchUniversities(deferredQuery)
      .then((items) => {
        if (!cancelled) {
          setUniversities(items);
          setUniversitiesError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUniversities([]);
          setUniversitiesError('University suggestions are unavailable right now, but you can still type your school manually.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deferredQuery]);

  const canAdvance =
    (step === 1 && form.full_name.trim() && form.university.trim() && form.major.trim()) ||
    (step === 2 && form.research_interests.trim().length >= 20) ||
    step === 3 ||
    step === 4;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError('');

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
    } catch {
      setSubmitError('The kit could not be started. Please review the form and try again.');
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
    <section ref={scopeRef} className="section-band">
      <div className="page-frame grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="section-panel sticky top-28 h-fit overflow-hidden bg-hero px-6 py-7 text-white lg:px-8" data-reveal>
          <p className="font-sans text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-sky-200">Guided intake</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.96]">Build the entire research kit in one calm pass.</h1>
          <p className="mt-5 max-w-md font-body text-base leading-8 text-slate-200">
            The intake stays structured, with every question tied to an output students will see later in the kit.
          </p>

          <div className="mt-8 rounded-[1.6rem] bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-200">Current step</p>
                <p className="mt-2 font-display text-3xl text-white">{steps[step - 1].title}</p>
              </div>
              <p className="font-display text-3xl text-sky-200">{progress}</p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#adc8f5,#81d0f8)] transition-all duration-500" style={{ width: progress }} />
            </div>
            <p className="mt-4 font-body text-sm leading-7 text-slate-200">{steps[step - 1].helper}</p>
          </div>

          <div className="mt-8 grid gap-3">
            {steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={`rounded-[1.3rem] px-4 py-4 text-left transition ${
                  step === index + 1 ? 'bg-white/16 text-white' : 'bg-white/6 text-slate-300 hover:bg-white/10'
                }`}
                onClick={() => setStep(index + 1)}
              >
                <p className="font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-200">Step 0{index + 1}</p>
                <p className="mt-2 font-body text-sm leading-7">{item.title}</p>
              </button>
            ))}
          </div>
        </aside>

        <form className="section-panel bg-[rgba(255,253,249,0.88)] px-6 py-7 lg:px-8" onSubmit={handleSubmit} data-reveal>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Step {step} of 4</p>
              <h2 className="section-title mt-4">
                {step === 1 && 'Academic profile'}
                {step === 2 && 'Research interests'}
                {step === 3 && 'Skills and support context'}
                {step === 4 && 'Goals and final notes'}
              </h2>
            </div>
            <p className="font-sans text-xs font-extrabold uppercase tracking-[0.2em] text-muted">{progress} complete</p>
          </div>

          <div className="soft-divider my-8" />

          {step === 1 ? (
            <div className="grid gap-6">
              <label className="field">
                <span>Full name</span>
                <input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="Maria Gonzalez" />
              </label>

              <label className="field">
                <span>University</span>
                <input
                  value={form.university}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setForm({ ...form, university: event.target.value });
                  }}
                  placeholder="The University of Texas at San Antonio"
                />
                <div className="flex flex-wrap gap-2">
                  {universities.slice(0, 4).map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      className="chip-button text-primary"
                      onClick={() => {
                        setForm({ ...form, university: option.name });
                        setQuery(option.name);
                      }}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
                {universitiesError ? <p className="font-body text-sm text-muted">{universitiesError}</p> : null}
              </label>

              <div className="grid gap-6 md:grid-cols-3">
                <label className="field">
                  <span>Major</span>
                  <input value={form.major} onChange={(event) => setForm({ ...form, major: event.target.value })} placeholder="Biology" />
                </label>
                <label className="field">
                  <span>Year</span>
                  <select value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })}>
                    <option>Freshman</option>
                    <option>Sophomore</option>
                    <option>Junior</option>
                    <option>Senior</option>
                  </select>
                </label>
                <label className="field">
                  <span>GPA</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    value={form.gpa}
                    onChange={(event) => setForm({ ...form, gpa: Number(event.target.value) })}
                  />
                </label>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-8">
              <label className="field">
                <span>What topics fascinate you?</span>
                <textarea
                  value={form.research_interests}
                  onChange={(event) => setForm({ ...form, research_interests: event.target.value })}
                  placeholder="I am interested in using machine learning to improve cancer imaging workflows and more equitable diagnostics."
                  rows={7}
                />
                <p className="font-body text-sm text-muted">Aim for at least 20 characters so the matching logic has enough signal.</p>
              </label>

              <div>
                <p className="eyebrow text-primary">Prior experience</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {[
                    ['none', 'No research experience'],
                    ['coursework', 'Relevant coursework'],
                    ['volunteer', 'Volunteer or club research'],
                    ['independent', 'Independent project'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`chip-button ${form.experience_level === value ? 'chip-button-active' : 'text-muted'}`}
                      onClick={() => setForm({ ...form, experience_level: value as StudentProfileInput['experience_level'] })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="editorial-panel flex items-center justify-between gap-4 bg-white px-5 py-5">
                <div>
                  <p className="eyebrow text-primary">Interdisciplinary exploration</p>
                  <p className="mt-2 font-body text-sm leading-7 text-muted">
                    Include strong-fit labs outside the exact major if they still support the student’s goals.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.interdisciplinary}
                  onChange={(event) => setForm({ ...form, interdisciplinary: event.target.checked })}
                  className="h-5 w-5 accent-secondary"
                />
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-8">
              <div>
                <p className="eyebrow text-primary">Skills</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {skillOptions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className={`chip-button ${form.skills.includes(skill) ? 'chip-button-active' : 'text-muted'}`}
                      onClick={() => toggleValue('skills', skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow text-primary">Software tools</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {toolOptions.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      className={`chip-button ${form.software_tools.includes(tool) ? 'chip-button-active' : 'text-muted'}`}
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
                  <select value={form.citizenship} onChange={(event) => setForm({ ...form, citizenship: event.target.value as StudentProfileInput['citizenship'] })}>
                    <option value="us_citizen">US citizen</option>
                    <option value="permanent_resident">Permanent resident</option>
                    <option value="international">International student</option>
                  </select>
                </label>

                <label className="editorial-panel flex items-center gap-3 bg-white px-5 py-4">
                  <input
                    type="checkbox"
                    checked={form.first_generation}
                    onChange={(event) => setForm({ ...form, first_generation: event.target.checked })}
                    className="h-5 w-5 accent-secondary"
                  />
                  <span className="font-body text-sm text-muted">First-generation student</span>
                </label>

                <label className="editorial-panel flex items-center gap-3 bg-white px-5 py-4">
                  <input
                    type="checkbox"
                    checked={form.pell_eligible}
                    onChange={(event) => setForm({ ...form, pell_eligible: event.target.checked })}
                    className="h-5 w-5 accent-secondary"
                  />
                  <span className="font-body text-sm text-muted">Pell-eligible</span>
                </label>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-6">
              <label className="field">
                <span>Primary goal</span>
                <select value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value as StudentProfileInput['goal'] })}>
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
                  onChange={(event) => setForm({ ...form, resume_highlights: event.target.value })}
                  placeholder="Add notable coursework, leadership, volunteer work, or constraints that should shape writing tone."
                  rows={6}
                />
              </label>

              <FeedbackBlock
                title="Ready to run"
                description="The pipeline will search for faculty matches, read lab context, draft outreach, write the statement, match grants, and build a 12-week onboarding plan."
              />
            </div>
          ) : null}

          {submitError ? (
            <div className="mt-8">
              <FeedbackBlock title="Submission issue" description={submitError} tone="danger" />
            </div>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              className="ghost-button"
              disabled={step === 1 || submitting || isPending}
              onClick={() => setStep((current) => Math.max(current - 1, 1))}
            >
              Back
            </button>
            <button type="submit" className="primary-button" disabled={!canAdvance || submitting || isPending}>
              {step === 4 ? (submitting ? 'Starting pipeline' : 'Generate my kit') : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
