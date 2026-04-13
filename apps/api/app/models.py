from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class ExperienceLevel(str, Enum):
    NONE = "none"
    COURSEWORK = "coursework"
    VOLUNTEER = "volunteer"
    INDEPENDENT = "independent"


class StudentGoal(str, Enum):
    PHD = "phd"
    MED_SCHOOL = "med_school"
    INDUSTRY = "industry"
    EXPLORE = "explore"


class Citizenship(str, Enum):
    US_CITIZEN = "us_citizen"
    PERMANENT_RESIDENT = "permanent_resident"
    INTERNATIONAL = "international"


class PipelineStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"


class StepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"


class StudentProfileInput(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    university: str = Field(min_length=2, max_length=120)
    major: str = Field(min_length=2, max_length=100)
    year: str = Field(min_length=2, max_length=40)
    gpa: float = Field(ge=0.0, le=4.0)
    research_interests: str = Field(min_length=20, max_length=500)
    experience_level: ExperienceLevel
    interdisciplinary: bool = True
    skills: list[str] = Field(default_factory=list)
    software_tools: list[str] = Field(default_factory=list)
    goal: StudentGoal
    citizenship: Citizenship
    first_generation: bool = True
    pell_eligible: bool = False
    resume_highlights: str | None = Field(default=None, max_length=600)


class StudentProfile(StudentProfileInput):
    keywords: list[str]


class RecentPaper(BaseModel):
    title: str
    year: int
    abstract: str
    key_finding: str


class ProfessorMatch(BaseModel):
    name: str
    title: str
    institution: str
    department: str
    lab_name: str
    lab_type: str
    match_score: int
    research_summary: str
    overlap_rationale: list[str]
    public_lab_url: str
    tags: list[str]


class ProfessorProfile(BaseModel):
    professor: ProfessorMatch
    recent_papers: list[RecentPaper]
    has_openings: bool
    student_opportunities: str
    personalization_anchor: str


class EmailDraft(BaseModel):
    professor_name: str
    to_email: str
    subject: str
    body: str
    personalization_notes: list[str]
    meeting_request: str


class GrantMatch(BaseModel):
    name: str
    funder: str
    amount: str
    deadline: date
    urgency: Literal["high", "medium", "low"]
    eligibility_reasons: list[str]
    link: str


class OnboardingWeek(BaseModel):
    week: int
    phase: str
    theme: str
    tasks: list[str]
    resources: list[str] = Field(default_factory=list)


class PipelineStep(BaseModel):
    id: str
    label: str
    description: str
    status: StepStatus
    detail: str | None = None
    progress: int


class PipelineEvent(BaseModel):
    event: str
    step_id: str | None = None
    progress: int
    message: str
    run_status: PipelineStatus
    generated_at: datetime


class KitResult(BaseModel):
    profile: StudentProfile
    matched_professors: list[ProfessorProfile]
    email_drafts: list[EmailDraft]
    research_statement: str
    grant_matches: list[GrantMatch]
    onboarding_plan: list[OnboardingWeek]
    export_url: str
    generated_at: datetime


class PipelineRun(BaseModel):
    id: UUID
    status: PipelineStatus
    created_at: datetime
    profile: StudentProfile
    steps: list[PipelineStep]
    result: KitResult | None = None


class UniversityOption(BaseModel):
    name: str
    state: str
    system: str


class GlossaryItem(BaseModel):
    term: str
    definition: str


class HistoryItem(BaseModel):
    run_id: UUID
    student_name: str
    university: str
    goal: StudentGoal
    created_at: datetime
    professor_count: int
    grant_count: int

