"""
AI Recruitment & Employee Management Platform -- ML Service

Wraps all 7 AI/ML modules from the project report as REST endpoints:
  5.  Resume Parsing (NER)          -> POST /parse-resume
  6.  AI Resume Screening           -> POST /screen-resume
  7.  Candidate Matching            -> POST /match-score
  17. Skill Gap Analysis            -> POST /skill-gap
  18. Candidate Ranking             -> POST /rank-candidates
  19. Interview Question Generation -> POST /generate-interview-questions
  34. Attrition Prediction          -> POST /predict-attrition
  35. Salary Prediction             -> POST /predict-salary
  --  Candidate Decision Recommendation -> POST /recommend-candidate-decision

Run with: uvicorn app.main:app --port 8000   (do NOT use --reload in production/demo --
see the note in the "why imports are at the top" comment below)
Docs available at http://localhost:8000/docs once running.

PERFORMANCE NOTE: every `from app.X import Y` below is at the TOP of this file,
not inside each endpoint function. This is deliberate and matters a lot for
latency: importing a module runs its top-level code exactly once, the first
time it's imported. app.resume_parsing's spaCy model alone takes ~12 SECONDS
to load from disk. If these imports were inside the endpoint functions instead
(as an earlier version of this file had them), that 12s load would happen on
the very FIRST request to whichever endpoint touches resume parsing --
appearing as one random, extremely slow request -- rather than once, predictably,
at server startup before any real traffic arrives. Importing everything here
means all models (spaCy NER, XGBoost matching/attrition/salary, TF-IDF
vectorizer) finish loading during `uvicorn` startup, so even the very first
real request is fast.
"""
import time
import logging

from fastapi import FastAPI, HTTPException

from app.schemas import (
    JobInput, ResumeInput, MatchScoreRequest, MatchScoreResponse,
    ScreeningRequest, ScreeningResponse,
    SkillGapRequest, SkillGapResponse, RankCandidatesRequest, RankedCandidate,
    InterviewQuestionsRequest, InterviewQuestionsResponse,
    ResumeParseRequest, ResumeParseResponse,
    EmployeeInput, AttritionResponse,
    JobPostingInput, SalaryResponse,
    CandidateDecisionRequest, CandidateDecisionResponse,
)

logger = logging.getLogger("uvicorn")

# --- All model loading happens HERE, once, at import time (= server startup) ---
_t0 = time.time()

from app.resume_parsing import parse_resume, build_resume_dict_from_text
from app.screening import (
    extract_job_requirements, extract_resume_profile,
    extract_resume_profile_from_text, screen_resume_against_job,
)
from app.matching import score_candidate
from app.skill_gap import skill_gap_analysis, rank_candidates_for_job
from app.interview import generate_interview_questions
from app.attrition import predict_attrition_risk
from app.salary import predict_salary_range
from app.decision import recommend_candidate_decision

logger.info(f"All models loaded in {time.time() - _t0:.2f}s")
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI Recruitment Platform -- ML Service",
    description="AI/ML endpoints for resume parsing, candidate matching, skill gap analysis, "
                 "candidate ranking, interview question generation, attrition prediction, "
                 "and salary prediction.",
    version="1.0.1",
)


@app.get("/health", tags=["health"])
def health_check():
    """Confirms the service is up and all models loaded successfully at startup."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Module 5 -- Resume Parsing
# ---------------------------------------------------------------------------

@app.post("/parse-resume", response_model=ResumeParseResponse, tags=["resume-parsing"])
def parse_resume_endpoint(payload: ResumeParseRequest):
    profile = parse_resume(payload.resume_text)
    return profile


# ---------------------------------------------------------------------------
# Module 6 -- AI Resume Screening (standalone from Module 7 matching)
# ---------------------------------------------------------------------------

@app.post("/screen-resume", response_model=ScreeningResponse, tags=["screening"])
def screen_resume_endpoint(payload: ScreeningRequest):
    if (payload.resume is None) == (payload.resume_text is None):
        raise HTTPException(status_code=400, detail="Provide exactly one of 'resume' or 'resume_text'.")

    job_req = extract_job_requirements(payload.job.dict())
    job_text = f"{payload.job.description} {payload.job.responsibilities} {payload.job.requirements}"

    if payload.resume is not None:
        resume_profile = extract_resume_profile(payload.resume.dict())
        resume_text = f"{payload.resume.summary} {payload.resume.experience_bullets}"
    else:
        resume_profile = extract_resume_profile_from_text(payload.resume_text)
        resume_text = None  # raw-text path has no separate summary/bullets fields to combine

    report = screen_resume_against_job(resume_profile, job_req, resume_text=resume_text, job_text=job_text)
    return report


# ---------------------------------------------------------------------------
# Modules 6/7 -- Candidate Matching
# ---------------------------------------------------------------------------

@app.post("/match-score", response_model=MatchScoreResponse, tags=["matching"])
def match_score_endpoint(payload: MatchScoreRequest, explain: bool = False):
    if (payload.resume is None) == (payload.resume_text is None):
        raise HTTPException(status_code=400, detail="Provide exactly one of 'resume' or 'resume_text'.")

    if payload.resume is not None:
        resume_dict = payload.resume.dict()
    else:
        resume_dict = build_resume_dict_from_text(
            payload.resume_text, seniority=payload.resume_seniority, industry=payload.resume_industry
        )

    result = score_candidate(payload.job.dict(), resume_dict, explain=explain)
    return {
        "job_id": payload.job.job_id,
        "resume_id": resume_dict["resume_id"],
        "result": result["result"],
        "match_probability_pct": result["match_probability_pct"],
        "features": result["features"],
        "explanation": result.get("explanation"),
    }


# ---------------------------------------------------------------------------
# Module 17 -- Skill Gap Analysis
# ---------------------------------------------------------------------------

@app.post("/skill-gap", response_model=SkillGapResponse, tags=["skill-gap"])
def skill_gap_endpoint(payload: SkillGapRequest):
    if (payload.resume is None) == (payload.resume_text is None):
        raise HTTPException(status_code=400, detail="Provide exactly one of 'resume' or 'resume_text'.")

    if payload.resume is not None:
        resume_dict = payload.resume.dict()
    else:
        resume_dict = build_resume_dict_from_text(payload.resume_text)

    return skill_gap_analysis(payload.job.dict(), resume_dict)


# ---------------------------------------------------------------------------
# Module 18 -- Candidate Ranking
# ---------------------------------------------------------------------------

@app.post("/rank-candidates", response_model=list[RankedCandidate], tags=["ranking"])
def rank_candidates_endpoint(payload: RankCandidatesRequest):
    candidates_dicts = [c.dict() for c in payload.candidates]
    for i, text in enumerate(payload.candidate_texts):
        candidates_dicts.append(build_resume_dict_from_text(text, resume_id=f"TEXT_{i}"))

    if not candidates_dicts:
        raise HTTPException(status_code=400, detail="Provide at least one candidate via 'candidates' or 'candidate_texts'.")

    job_dict = payload.job.dict()
    return rank_candidates_for_job(job_dict, candidates_dicts, top_n=payload.top_n)


# ---------------------------------------------------------------------------
# Module 19 -- Interview Question Generation
# ---------------------------------------------------------------------------

@app.post("/generate-interview-questions", response_model=InterviewQuestionsResponse, tags=["interview-questions"])
def generate_interview_questions_endpoint(payload: InterviewQuestionsRequest):
    result = generate_interview_questions(
        payload.job.dict(), payload.resume.dict(),
        num_questions=payload.num_questions, provider=payload.provider,
    )
    return {
        "job_id": payload.job.job_id,
        "resume_id": payload.resume.resume_id,
        "source": result["source"],
        "questions": result["questions"],
    }


# ---------------------------------------------------------------------------
# Module 34 -- Attrition Prediction
# ---------------------------------------------------------------------------

@app.post("/predict-attrition", response_model=AttritionResponse, tags=["attrition"])
def predict_attrition_endpoint(employee: EmployeeInput):
    return predict_attrition_risk(employee.dict())


# ---------------------------------------------------------------------------
# Module 35 -- Salary Prediction
# ---------------------------------------------------------------------------

@app.post("/predict-salary", response_model=SalaryResponse, tags=["salary"])
def predict_salary_endpoint(job_posting: JobPostingInput):
    return predict_salary_range(job_posting.dict())


# ---------------------------------------------------------------------------
# Candidate Decision Recommendation -- supports Hiring Manager's
# "Approve/Reject Candidates" permission. Returns a SUGGESTED recommendation
# only; the actual approve/reject decision is made and stored by the backend.
# ---------------------------------------------------------------------------

@app.post("/recommend-candidate-decision", response_model=CandidateDecisionResponse, tags=["decision"])
def recommend_candidate_decision_endpoint(payload: CandidateDecisionRequest):
    if payload.match_probability_pct is None and (payload.job is None or payload.resume is None):
        raise HTTPException(
            status_code=400,
            detail="Provide either 'match_probability_pct' directly, or both 'job' and 'resume' to compute it fresh."
        )
    if payload.match_probability_pct is not None and (payload.job is not None or payload.resume is not None):
        raise HTTPException(
            status_code=400,
            detail="Provide either 'match_probability_pct' OR 'job'+'resume', not both."
        )

    job_id = payload.job.job_id if payload.job else None
    resume_id = payload.resume.resume_id if payload.resume else None

    if payload.match_probability_pct is not None:
        match_pct = payload.match_probability_pct
    else:
        result = score_candidate(payload.job.dict(), payload.resume.dict())
        match_pct = result["match_probability_pct"]

    feedback_dict = {k: v for k, v in payload.interview_feedback.dict().items() if v is not None}
    result = recommend_candidate_decision(match_pct, feedback_dict)
    result["job_id"] = job_id
    result["resume_id"] = resume_id
    return result
