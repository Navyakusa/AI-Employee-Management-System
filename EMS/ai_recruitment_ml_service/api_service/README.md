# AI Recruitment Platform -- ML Service

FastAPI service wrapping all 7 AI/ML modules from the project report. Built and tested
end-to-end against the models trained in the accompanying notebooks.

## Setup

```bash
pip install -r requirements.txt
```

The trained models are already bundled inside `app/models/` -- no retraining needed to run
this service. If you retrain any model, drop the new `.pkl` file / `resume_ner_model/` folder
in `app/models/` with the same filename and restart the service.

## Running

```bash
uvicorn app.main:app --reload --port 8000
```

Then open **http://localhost:8000/docs** for interactive API documentation (Swagger UI) --
you can try every endpoint directly from the browser there.

## Testing

```bash
python3 test_api.py
```

This runs realistic sample requests against every endpoint and prints PASS/FAIL for each.
All 9 checks (8 endpoints + 1 error-handling case) pass as of this build.

## Backward compatibility

Every endpoint that previously required a structured `resume` object still works with
**exactly the same request body** as before -- nothing your team has already integrated
will need to change. What's new is *optional*:

- `/match-score`, `/skill-gap` now also accept `resume_text` instead of `resume` (raw text
  gets parsed via the Module 5 NER model internally). Provide exactly one of the two.
- `/rank-candidates` now also accepts an optional `candidate_texts` list of raw resume texts,
  which can be combined with the existing `candidates` list -- both pools get merged before
  ranking.

Example -- old style (still works, unchanged):
```json
{"job": {...}, "resume": {"resume_id": "R1", "role": "...", "skills": "['Python']", ...}}
```

Example -- new style (raw text instead):
```json
{
  "job": {...},
  "resume_text": "Priya Sharma\nSenior Backend Engineer\n...",
  "resume_seniority": "Senior",
  "resume_industry": "IT"
}
```

`resume_seniority` / `resume_industry` are optional hints -- the NER model's label set
doesn't include these fields, so they can't be reliably extracted from raw text. Pass them
if you know them; otherwise they're treated as unknown rather than guessed.

## Endpoints

| Endpoint | Module | Description |
|---|---|---|
| `GET /health` | -- | Service health check |
| `POST /parse-resume` | 5 | Raw resume text -> structured profile (Name, Skills, Companies, etc.) |
| `POST /screen-resume` | 6 | Job + resume -> dimension-by-dimension screening report (Skills, Seniority, Industry, Role Alignment, Content Relevance) -- accepts either a structured resume or raw resume text |
| `POST /match-score` | 7 | Job + resume -> single weighted match probability, with optional SHAP explanation |
| `POST /skill-gap` | 17 | Job + resume -> missing must-have/nice-to-have skills |
| `POST /rank-candidates` | 18 | Job + list of candidates -> ranked shortlist |
| `POST /generate-interview-questions` | 19 | Job + resume -> tailored interview questions |
| `POST /predict-attrition` | 34 | Employee record -> attrition risk (LOW/MEDIUM/HIGH) |
| `POST /predict-salary` | 35 | Job posting -> estimated salary range |

Full request/response schemas (with example values) are visible at `/docs`.

### Module 6 vs Module 7 -- what's the difference?

`/screen-resume` (Module 6) and `/match-score` (Module 7) look at the same underlying signals
but serve different purposes:
- **`/screen-resume`** returns a *report*: each dimension (skills, seniority, industry, role,
  content relevance) shown separately, for a human recruiter to read and understand *why*.
- **`/match-score`** returns a *single number*: all of that combined by a trained XGBoost model
  into one weighted match probability, for ranking/sorting candidates at scale.

Run one after the other in the demo to show the full pipeline: parse -> screen -> score.

## Environment variables (optional)

`/generate-interview-questions` uses a real LLM if a key is available, and falls back to a
template-based generator otherwise (still returns a valid response either way):

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
# or
export OPENAI_API_KEY="sk-..."
```

Then pass `"provider": "anthropic"` or `"provider": "openai"` in the request body.

## Field name conventions

Request field names match the original training CSVs **exactly**, so the backend team can
pass database records straight through without renaming fields:

- `/match-score`, `/skill-gap`, `/rank-candidates`, `/generate-interview-questions` -- fields
  match `jobs.csv` and `resume.csv` (e.g. skills are Python-list-repr strings like
  `"['Python' 'Django']"`, matching the original dataset format).
- `/predict-attrition` -- fields match the IBM HR Attrition dataset columns.
- `/predict-salary` -- fields match the India job market dataset columns.

## Project structure

```
app/
  main.py            - FastAPI app and route definitions
  schemas.py         - Pydantic request/response models
  ml_utils.py        - shared text-processing helpers (skill parsing, normalization)
  matching.py        - candidate-job matching (Modules 6/7)
  skill_gap.py       - skill gap analysis + ranking (Modules 17/18)
  attrition.py       - attrition prediction (Module 34)
  salary.py          - salary prediction (Module 35)
  interview.py       - interview question generation (Module 19)
  resume_parsing.py  - resume NER (Module 5)
  models/            - trained model files:
    match_model.ubj          - matching XGBoost model, native format
    match_engine_meta.pkl    - vectorizer + feature list + threshold (no XGBoost objects)
    salary_point_model.ubj   - salary XGBoost model (point estimate), native format
    salary_lower_model.ubj   - salary XGBoost model (25th percentile), native format
    salary_upper_model.ubj   - salary XGBoost model (75th percentile), native format
    salary_meta.pkl          - feature list + category columns (no XGBoost objects)
    attrition_bundle.pkl     - scikit-learn GradientBoostingClassifier (plain pickle is fine here)
    resume_ner_model/        - spaCy NER model directory
test_api.py          - end-to-end endpoint tests
requirements.txt
```

**Why the XGBoost models are `.ubj` files instead of pickled inside a bundle:** a pickled
XGBoost booster can fail to load on a different machine even when both machines report the
same xgboost version -- we hit this directly during testing (an `XGBoostError: input stream
corrupted` on Windows/Python 3.14, despite an identical, checksum-verified `.pkl` file and
matching xgboost version). XGBoost's own `save_model()`/`load_model()` format is explicitly
designed to be portable across platforms, OS, and versions, so the two XGBoost-backed modules
(matching, salary) use that instead. The attrition model uses scikit-learn's
`GradientBoostingClassifier`, which isn't affected by this particular issue, so it stays as a
plain pickle.

## Notes for the backend integration

- All models are loaded once at import time (not per-request), so the first request after
  startup is fast -- there's no lazy-loading delay per call.
- `/match-score` accepts an optional `explain=true` query parameter to include a SHAP-based
  breakdown of why a score was produced (useful for the "explainable match score" requirement
  in the project report). It's off by default since it's noticeably slower than a plain score.
- `/rank-candidates` expects the full candidate pool in the request body (no database lookup
  built in) -- the backend is expected to fetch candidates and pass them in.
