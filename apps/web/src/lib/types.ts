export type ExperienceLevel = 'none' | 'coursework' | 'volunteer' | 'independent';
export type StudentGoal = 'phd' | 'med_school' | 'industry' | 'explore';
export type Citizenship = 'us_citizen' | 'permanent_resident' | 'international';

export interface StudentProfileInput {
  full_name: string;
  university: string;
  major: string;
  year: string;
  gpa: number;
  research_interests: string;
  experience_level: ExperienceLevel;
  interdisciplinary: boolean;
  skills: string[];
  software_tools: string[];
  goal: StudentGoal;
  citizenship: Citizenship;
  first_generation: boolean;
  pell_eligible: boolean;
  resume_highlights: string;
}

export interface UniversityOption {
  name: string;
  state: string;
  system: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface PipelineStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'running' | 'completed';
  detail?: string | null;
  progress: number;
}

export interface RecentPaper {
  title: string;
  year: number;
  abstract: string;
  key_finding: string;
}

export interface ProfessorMatch {
  name: string;
  title: string;
  institution: string;
  department: string;
  lab_name: string;
  lab_type: string;
  match_score: number;
  research_summary: string;
  overlap_rationale: string[];
  public_lab_url: string;
  tags: string[];
}

export interface ProfessorProfile {
  professor: ProfessorMatch;
  recent_papers: RecentPaper[];
  has_openings: boolean;
  student_opportunities: string;
  personalization_anchor: string;
}

export interface EmailDraft {
  professor_name: string;
  to_email: string;
  subject: string;
  body: string;
  personalization_notes: string[];
  meeting_request: string;
}

export interface GrantMatch {
  name: string;
  funder: string;
  amount: string;
  deadline: string;
  urgency: 'high' | 'medium' | 'low';
  eligibility_reasons: string[];
  link: string;
}

export interface OnboardingWeek {
  week: number;
  phase: string;
  theme: string;
  tasks: string[];
  resources: string[];
}

export interface PipelineRun {
  id: string;
  status: 'queued' | 'running' | 'completed';
  created_at: string;
  profile: StudentProfileInput & { keywords: string[] };
  steps: PipelineStep[];
  result: {
    profile: StudentProfileInput & { keywords: string[] };
    matched_professors: ProfessorProfile[];
    email_drafts: EmailDraft[];
    research_statement: string;
    grant_matches: GrantMatch[];
    onboarding_plan: OnboardingWeek[];
    export_url: string;
    generated_at: string;
  } | null;
}

export interface HistoryItem {
  run_id: string;
  student_name: string;
  university: string;
  goal: StudentGoal;
  created_at: string;
  professor_count: number;
  grant_count: number;
}

export interface PipelineEvent {
  event: 'step_started' | 'step_completed' | 'complete';
  step_id: string | null;
  progress: number;
  message: string;
  run_status: 'queued' | 'running' | 'completed';
  generated_at: string;
}

