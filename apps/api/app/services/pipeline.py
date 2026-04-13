from __future__ import annotations

from datetime import datetime
from typing import Iterable
from uuid import UUID, uuid4

from app.data.catalog import FACULTY_CATALOG, GRANTS_CATALOG
from app.models import (
    Citizenship,
    EmailDraft,
    GrantMatch,
    HistoryItem,
    KitResult,
    OnboardingWeek,
    PipelineRun,
    PipelineStatus,
    PipelineStep,
    ProfessorMatch,
    ProfessorProfile,
    RecentPaper,
    StepStatus,
    StudentGoal,
    StudentProfile,
    StudentProfileInput,
)


def normalize_tokens(text: str) -> list[str]:
    cleaned = "".join(ch.lower() if ch.isalnum() or ch.isspace() else " " for ch in text)
    return [token for token in cleaned.split() if len(token) > 2]


def extract_keywords(profile: StudentProfileInput) -> list[str]:
    seed_terms = normalize_tokens(
        " ".join(
            [
                profile.major,
                profile.research_interests,
                " ".join(profile.skills),
                " ".join(profile.software_tools),
            ]
        )
    )
    ordered: list[str] = []
    for token in seed_terms:
        if token not in ordered:
            ordered.append(token)
    return ordered[:18]


def build_student_profile(payload: StudentProfileInput) -> StudentProfile:
    return StudentProfile(**payload.model_dump(), keywords=extract_keywords(payload))


def score_faculty(profile: StudentProfile, faculty: dict) -> int:
    tokens = set(profile.keywords)
    faculty_tags = set(normalize_tokens(" ".join(faculty["tags"])))
    overlap = len(tokens & faculty_tags)
    score = 62 + overlap * 6
    if profile.university == faculty["institution"]:
        score += 8
    if profile.interdisciplinary and len(tokens & faculty_tags) >= 2:
        score += 2
    return min(score, 98)


def build_overlap_reasons(profile: StudentProfile, faculty: dict) -> list[str]:
    reasons: list[str] = []
    shared = set(profile.keywords) & set(normalize_tokens(" ".join(faculty["tags"])))
    for tag in list(shared)[:3]:
        reasons.append(f"Alignment around {tag.replace('_', ' ')}")
    if profile.experience_level.value == "none":
        reasons.append("Lab offers structured onboarding for students early in research")
    elif profile.skills:
        reasons.append(f"Your skills in {', '.join(profile.skills[:2])} transfer directly to the lab workflow")
    return reasons[:3]


def search_faculty(profile: StudentProfile) -> list[ProfessorMatch]:
    scored = sorted(
        FACULTY_CATALOG,
        key=lambda faculty: score_faculty(profile, faculty),
        reverse=True,
    )
    top_matches = scored[:5]
    return [
        ProfessorMatch(
            name=faculty["name"],
            title=faculty["title"],
            institution=faculty["institution"],
            department=faculty["department"],
            lab_name=faculty["lab_name"],
            lab_type=faculty["lab_type"],
            match_score=score_faculty(profile, faculty),
            research_summary=faculty["research_summary"],
            overlap_rationale=build_overlap_reasons(profile, faculty),
            public_lab_url=faculty["lab_url"],
            tags=faculty["tags"],
        )
        for faculty in top_matches
    ]


def profile_professors(matches: Iterable[ProfessorMatch]) -> list[ProfessorProfile]:
    profiles: list[ProfessorProfile] = []
    for match in matches:
        faculty = next(item for item in FACULTY_CATALOG if item["name"] == match.name)
        papers = [RecentPaper(**paper) for paper in faculty["papers"]]
        profiles.append(
            ProfessorProfile(
                professor=match,
                recent_papers=papers,
                has_openings=faculty["openings"],
                student_opportunities=faculty["opportunities"],
                personalization_anchor=papers[0].key_finding,
            )
        )
    return profiles


def major_family(major: str) -> str:
    value = major.lower()
    if "bio" in value or "neuro" in value:
        return "biology"
    if "chem" in value:
        return "chemistry"
    if "psych" in value:
        return "psychology"
    if "data" in value:
        return "data science"
    if "engineer" in value:
        return "engineering"
    if "computer" in value or "software" in value or value == "cs":
        return "computer science"
    if "phys" in value:
        return "physics"
    return "computer science"


def year_key(year: str) -> str:
    lowered = year.lower()
    if "fresh" in lowered:
        return "freshman"
    if "soph" in lowered:
        return "sophomore"
    if "jun" in lowered:
        return "junior"
    return "senior"


def build_subject(profile: StudentProfile, professor: ProfessorProfile) -> str:
    ask = "Research Assistant Inquiry"
    if not professor.has_openings:
        ask = "Informational Meeting Request"
    return f"{ask} - {profile.full_name}, {profile.major}"


def build_email_body(profile: StudentProfile, professor: ProfessorProfile) -> str:
    first_paper = professor.recent_papers[0]
    skill_line = ""
    if profile.skills:
        skill_line = f"I have been building relevant experience through {', '.join(profile.skills[:3])} and coursework connected to {profile.major}. "
    elif profile.experience_level.value == "none":
        skill_line = (
            "I am early in my research journey, so I would bring strong coursework preparation, reliability, and a clear willingness to learn lab systems carefully. "
        )

    ask = "would welcome the chance to ask for a 15-minute conversation about how I could contribute and grow in your lab."
    if not professor.has_openings:
        ask = "would value a brief 15-minute informational conversation about how students can prepare to contribute to work like yours in the future."

    goal_sentence = {
        StudentGoal.PHD: "I am preparing for a long-term path toward doctoral research.",
        StudentGoal.MED_SCHOOL: "I am building the research foundation I will need for medical school and translational work.",
        StudentGoal.INDUSTRY: "I am developing research experience that will strengthen my technical work in industry settings.",
        StudentGoal.EXPLORE: "I am actively exploring which research environment is the right fit for my long-term direction.",
    }[profile.goal]

    return (
        f"Dear {professor.professor.name},\n\n"
        f"My name is {profile.full_name}, and I am a {profile.year.lower()} majoring in {profile.major} at {profile.university}. "
        f"I was especially drawn to your recent paper, \"{first_paper.title},\" and its finding that {professor.personalization_anchor.lower()}.\n\n"
        f"My current interests center on {profile.research_interests.strip()} {skill_line}{goal_sentence} "
        f"Your lab's focus on {professor.professor.research_summary.lower()} feels especially aligned with the kind of questions I hope to work on.\n\n"
        f"If helpful, I can share my resume and a short summary of relevant coursework. I {ask}\n\n"
        f"Thank you for your time and consideration.\n\n"
        f"Sincerely,\n{profile.full_name}"
    )


def generate_emails(profile: StudentProfile, professors: list[ProfessorProfile]) -> list[EmailDraft]:
    drafts: list[EmailDraft] = []
    for professor in professors:
        drafts.append(
            EmailDraft(
                professor_name=professor.professor.name,
                to_email=next(item["email"] for item in FACULTY_CATALOG if item["name"] == professor.professor.name),
                subject=build_subject(profile, professor),
                body=build_email_body(profile, professor),
                personalization_notes=[
                    f"References recent paper: {professor.recent_papers[0].title}",
                    f"Mentions overlap with {', '.join(professor.professor.overlap_rationale[:2]).lower()}",
                    "Asks for a concrete short meeting rather than a vague follow-up",
                ],
                meeting_request="15-minute meeting or informational conversation",
            )
        )
    return drafts


def draft_research_statement(profile: StudentProfile, professors: list[ProfessorProfile]) -> str:
    lab_names = ", ".join(prof.professor.lab_name for prof in professors[:3])
    return (
        f"I am seeking undergraduate research experience because I want to move from classroom understanding into real investigative work. "
        f"As a {profile.year.lower()} studying {profile.major} at {profile.university}, I have become increasingly interested in {profile.research_interests.strip().lower()}. "
        f"My interest is not abstract. I want to understand how careful research design, iterative experimentation, and collaborative problem solving create knowledge that can be applied in meaningful settings.\n\n"
        f"My academic preparation has given me a base I can now build on. Through coursework and independent study, I have developed familiarity with {', '.join(profile.skills[:3] or ['scientific reading', 'structured problem solving'])}. "
        f"{'Because I am still early in research, I am especially motivated to learn foundational lab and literature practices with discipline and humility. ' if profile.experience_level.value == 'none' else 'These experiences have shown me that I work best in environments where technical rigor and mentorship reinforce each other. '}"
        f"I am particularly drawn to research settings that connect technical depth with practical impact for students, patients, or broader communities.\n\n"
        f"My current interests intersect strongly with the work happening in labs such as {lab_names}. "
        f"I am excited by research groups that combine a clear scientific question with methods that are both rigorous and adaptable. "
        f"Whether the work involves computational analysis, experimental validation, or interdisciplinary collaboration, I want to contribute through close reading, dependable execution, and a willingness to improve quickly from feedback.\n\n"
        f"Looking ahead, my goal is {profile.goal.value.replace('_', ' ')}. Research experience matters to me not only as a credential, but as a way to clarify the kinds of questions I want to spend years pursuing. "
        f"I want to learn how experienced researchers frame problems, document uncertainty, and make progress even when answers are incomplete. "
        f"Those habits would strengthen the way I approach future academic and professional opportunities.\n\n"
        f"I would bring curiosity, persistence, and a strong sense of responsibility to an undergraduate research role. "
        f"I am ready to contribute where I can now and to grow into greater responsibility over time. "
        f"ResearchBridge helped me identify paths that feel tangible, but the motivation behind them is deeply personal: I want to be part of serious research communities and earn that place through consistent work."
    )


def urgency_from_deadline(deadline: datetime.date) -> str:
    days = (deadline - datetime.now().date()).days
    if days < 30:
        return "high"
    if days <= 90:
        return "medium"
    return "low"


def match_grants(profile: StudentProfile) -> list[GrantMatch]:
    field = major_family(profile.major)
    school_year = year_key(profile.year)
    citizenship_map = {
        Citizenship.US_CITIZEN: "us_citizen",
        Citizenship.PERMANENT_RESIDENT: "permanent_resident",
        Citizenship.INTERNATIONAL: "international",
    }
    results: list[GrantMatch] = []
    for grant in GRANTS_CATALOG:
        if citizenship_map[profile.citizenship] not in grant["citizenship"]:
            continue
        if school_year not in grant["years"]:
            continue
        if profile.gpa < grant["min_gpa"]:
            continue
        if field not in grant["fields"]:
            continue
        if grant["requires_urm"] and not profile.first_generation:
            continue
        if grant["requires_pell"] and not profile.pell_eligible:
            continue
        reasons = [
            f"Matches your {school_year} standing",
            f"Supports {field} pathways",
            f"Within your current GPA range",
        ]
        if profile.pell_eligible and grant["requires_pell"]:
            reasons.append("Specifically designed for Pell-eligible students")
        results.append(
            GrantMatch(
                name=grant["name"],
                funder=grant["funder"],
                amount=grant["amount"],
                deadline=grant["deadline"],
                urgency=urgency_from_deadline(grant["deadline"]),
                eligibility_reasons=reasons,
                link=grant["link"],
            )
        )
    results.sort(key=lambda grant: grant.deadline)
    return results[:4]


def build_onboarding_plan(profile: StudentProfile, primary_lab: ProfessorProfile) -> list[OnboardingWeek]:
    goal_prompt = {
        StudentGoal.PHD: "Track open questions and methods you may want to study long term.",
        StudentGoal.MED_SCHOOL: "Notice how research questions translate into real health outcomes.",
        StudentGoal.INDUSTRY: "Pay attention to workflows, reproducibility, and communication patterns that transfer to technical teams.",
        StudentGoal.EXPLORE: "Use each week to learn which tasks energize you and which types of questions feel most compelling.",
    }[profile.goal]
    weeks: list[OnboardingWeek] = []
    plans = [
        ("Preparation", "Decode the lab mission", ["Read the lab home page and two recent papers", "Write a one-page summary of what problems the lab tackles", goal_prompt]),
        ("Preparation", "Build vocabulary", ["Define unfamiliar techniques from the papers", "Create a glossary of ten recurring terms", "Ask one clarifying question during your first meeting"]),
        ("Preparation", "Map your contribution path", ["List tasks suitable for a new undergraduate", "Identify which of your current skills transfer immediately", "Set one measurable learning goal with the PI or mentor"]),
        ("Preparation", "Operational readiness", ["Complete safety or software onboarding", "Organize your notes system", "Shadow one workflow from start to finish"]),
        ("Integration", "Join the literature rhythm", ["Summarize one paper in the lab's area", "Present a short verbal takeaway to your mentor", "Track how the paper connects to the lab's current work"]),
        ("Integration", "Own a repeatable task", ["Take responsibility for one small recurring lab task", "Document the process clearly", "Flag one improvement that would help the next student"]),
        ("Integration", "Strengthen technical fluency", ["Practice the core tool or protocol you will use most", "Record errors and fixes in a troubleshooting log", "Ask for feedback on speed and accuracy"]),
        ("Integration", "Translate feedback into action", ["Review mentor feedback from the first month", "Revise your workflow based on that feedback", "Write a short reflection on what is getting easier"]),
        ("Contribution", "Connect your work to the big question", ["Describe how your current task supports the lab's research aims", "Draft one slide explaining your contribution", "Identify one dataset, protocol, or paper you now understand better"]),
        ("Contribution", "Increase independence", ["Complete one task with minimal supervision", "Double-check outputs before sharing them", "Propose a next step rather than waiting to be assigned one"]),
        ("Contribution", "Prepare a professional update", ["Write a concise weekly update for your mentor", "Highlight one result, one challenge, and one question", "Request advice on the next skill to build"]),
        ("Contribution", "Plan the next semester", ["Review what you contributed in 12 weeks", "Identify the strongest evidence of growth", "Outline a plan for deeper involvement in the lab"]),
    ]
    for index, (phase, theme, tasks) in enumerate(plans, start=1):
        weeks.append(
            OnboardingWeek(
                week=index,
                phase=phase,
                theme=theme,
                tasks=tasks,
                resources=[
                    primary_lab.professor.public_lab_url,
                    primary_lab.recent_papers[0].title,
                ],
            )
        )
    return weeks


def build_steps(profile: StudentProfile, professors: list[ProfessorProfile], grants: list[GrantMatch]) -> list[PipelineStep]:
    return [
        PipelineStep(
            id="search_faculty",
            label="Search faculty",
            description="Finding matching labs and faculty mentors",
            status=StepStatus.PENDING,
            detail=f"Searching {profile.university} for research aligned to {profile.major}",
            progress=15,
        ),
        PipelineStep(
            id="profile_professor",
            label="Profile professors",
            description="Reading recent papers and lab context",
            status=StepStatus.PENDING,
            detail=f"Profiling {professors[0].professor.name} and {len(professors) - 1} additional matches",
            progress=32,
        ),
        PipelineStep(
            id="generate_email",
            label="Generate cold emails",
            description="Drafting personalized outreach",
            status=StepStatus.PENDING,
            detail=f"Preparing {len(professors)} faculty-specific drafts",
            progress=52,
        ),
        PipelineStep(
            id="draft_research_statement",
            label="Draft research statement",
            description="Writing your one-page narrative",
            status=StepStatus.PENDING,
            detail="Grounding the statement in your goals and matched labs",
            progress=68,
        ),
        PipelineStep(
            id="match_grants",
            label="Match grants",
            description="Filtering opportunities by your eligibility",
            status=StepStatus.PENDING,
            detail=f"Found {len(grants)} relevant grants and fellowships",
            progress=84,
        ),
        PipelineStep(
            id="build_onboarding_plan",
            label="Build onboarding plan",
            description="Creating a 12-week lab entry roadmap",
            status=StepStatus.PENDING,
            detail="Sequencing practical actions for your first semester in a lab",
            progress=94,
        ),
        PipelineStep(
            id="export_kit",
            label="Package kit",
            description="Preparing your exportable research kit",
            status=StepStatus.PENDING,
            detail="Generating a print-ready version of your materials",
            progress=100,
        ),
    ]


def build_run(payload: StudentProfileInput) -> PipelineRun:
    profile = build_student_profile(payload)
    matches = search_faculty(profile)
    professors = profile_professors(matches)
    grants = match_grants(profile)
    result = KitResult(
        profile=profile,
        matched_professors=professors,
        email_drafts=generate_emails(profile, professors),
        research_statement=draft_research_statement(profile, professors),
        grant_matches=grants,
        onboarding_plan=build_onboarding_plan(profile, professors[0]),
        export_url=f"/api/pipeline/{{run_id}}/export",
        generated_at=datetime.utcnow(),
    )
    run = PipelineRun(
        id=uuid4(),
        status=PipelineStatus.QUEUED,
        created_at=datetime.utcnow(),
        profile=profile,
        steps=build_steps(profile, professors, grants),
        result=result,
    )
    run.result.export_url = f"/api/pipeline/{run.id}/export"
    return run


def build_history_item(run: PipelineRun) -> HistoryItem:
    assert run.result is not None
    return HistoryItem(
        run_id=run.id,
        student_name=run.profile.full_name,
        university=run.profile.university,
        goal=run.profile.goal,
        created_at=run.created_at,
        professor_count=len(run.result.matched_professors),
        grant_count=len(run.result.grant_matches),
    )


RUN_STORE: dict[UUID, PipelineRun] = {}
RUN_HISTORY: list[HistoryItem] = []

