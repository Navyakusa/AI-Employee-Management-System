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

Run with: uvicorn app.main:app --reload --port 8000
Docs available at http://localhost:8000/docs once running.
"""
from fastapi import FastAPI, HTTPException

from app.schemas import (
    JobInput, ResumeInput, MatchScoreResponse,
    ScreeningRequest, ScreeningResponse,
    SkillGapResponse, RankCandidatesRequest, RankedCandidate,
    InterviewQuestionsRequest, InterviewQuestionsResponse,
    ResumeParseRequest, ResumeParseResponse,
    EmployeeInput, AttritionResponse,
    JobPostingInput, SalaryResponse,
)

app = FastAPI(
    title="AI Recruitment Platform -- ML Service",
    description="AI/ML endpoints for resume parsing, candidate matching, skill gap analysis, "
                 "candidate ranking, interview question generation, attrition prediction, "
                 "and salary prediction.",
    version="1.0.0",
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
    from app.resume_parsing import parse_resume
    profile = parse_resume(payload.resume_text)
    return profile


# ---------------------------------------------------------------------------
# Module 6 -- AI Resume Screening (standalone from Module 7 matching)
# ---------------------------------------------------------------------------

@app.post("/screen-resume", response_model=ScreeningResponse, tags=["screening"])
def screen_resume_endpoint(payload: ScreeningRequest):
    from app.screening import (
        extract_job_requirements, extract_resume_profile,
        extract_resume_profile_from_text, screen_resume_against_job,
    )

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
def match_score_endpoint(job: JobInput, resume: ResumeInput, explain: bool = False):
    from app.matching import score_candidate
    result = score_candidate(job.dict(), resume.dict(), explain=explain)
    return {
        "job_id": job.job_id,
        "resume_id": resume.resume_id,
        "result": result["result"],
        "match_probability_pct": result["match_probability_pct"],
        "features": result["features"],
        "explanation": result.get("explanation"),
    }


# ---------------------------------------------------------------------------
# Module 17 -- Skill Gap Analysis
# ---------------------------------------------------------------------------

@app.post("/skill-gap", response_model=SkillGapResponse, tags=["skill-gap"])
def skill_gap_endpoint(job: JobInput, resume: ResumeInput):
    from app.skill_gap import skill_gap_analysis
    return skill_gap_analysis(job.dict(), resume.dict())


# ---------------------------------------------------------------------------
# Module 18 -- Candidate Ranking
# ---------------------------------------------------------------------------

@app.post("/rank-candidates", response_model=list[RankedCandidate], tags=["ranking"])
def rank_candidates_endpoint(payload: RankCandidatesRequest):
    from app.skill_gap import rank_candidates_for_job
    if not payload.candidates:
        raise HTTPException(status_code=400, detail="candidates list must not be empty")
    job_dict = payload.job.dict()
    candidates_dicts = [c.dict() for c in payload.candidates]
    return rank_candidates_for_job(job_dict, candidates_dicts, top_n=payload.top_n)


# ---------------------------------------------------------------------------
# Module 19 -- Interview Question Generation
# ---------------------------------------------------------------------------

@app.post("/generate-interview-questions", response_model=InterviewQuestionsResponse, tags=["interview-questions"])
def generate_interview_questions_endpoint(payload: InterviewQuestionsRequest):
    from app.interview import generate_interview_questions
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
    from app.attrition import predict_attrition_risk
    return predict_attrition_risk(employee.dict())


# ---------------------------------------------------------------------------
# Module 35 -- Salary Prediction
# ---------------------------------------------------------------------------

@app.post("/predict-salary", response_model=SalaryResponse, tags=["salary"])
def predict_salary_endpoint(job_posting: JobPostingInput):
    from app.salary import predict_salary_range
    return predict_salary_range(job_posting.dict())
