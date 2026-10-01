"""
Shared helper functions used by multiple modules.

IMPORTANT: these must stay byte-for-byte identical to the versions used when the
models were trained (in the original notebooks) FOR ANY SKILL THAT ACTUALLY
APPEARS IN THE TRAINING DATA. The SKILL_ALIASES map below is safe to extend
because it only maps common real-world spelling variants (e.g. "ReactJS") that
were verified NOT to appear anywhere in the original training vocabulary --
so this only helps messy real resume text match correctly, without changing
any value the model was actually trained on. Before adding a new alias, check
it isn't already a distinct, real skill in jobs.csv/resume.csv.
"""
import re

# Common real-world spelling variants -> the canonical form used in job/resume
# skill lists. Verified against the training data: none of these source terms
# (left side) appear anywhere in jobs.csv or resume.csv, so adding them cannot
# change any prediction the model was trained on -- it only helps normalize
# skill mentions extracted from real, messy resume text (e.g. via the NER
# parser) that the synthetic training data never needed to handle.
SKILL_ALIASES = {
    "reactjs": "react",
    "react.js": "react",
    "nodejs": "node",
    "node.js": "node",
    "vuejs": "vue",
    "vue.js": "vue",
    "postgres": "postgresql",
    "mongo": "mongodb",
    "golang": "go",
    "k8s": "kubernetes",
    "js": "javascript",
    "ts": "typescript",
    "nextjs": "next",
    "next.js": "next",
    "expressjs": "express",
    "express js": "express",
    "react js": "react",
    "node js": "node",
    "vue js": "vue",
    "next js": "next",
    "express.js": "express",
    "aiml": "machine learning",
    "ai/ml": "machine learning",
    "ai ml": "machine learning",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "oops": "oop",
    "html5": "html",
    "css3": "css",
    "vscode": "vs code",
    "visual studio code": "vs code",
}


def parse_skills(text):
    """Extracts individual skills from a job/resume skills field.

    Handles THREE input formats, tried in order:
    1. The original quoted Python-list-repr format from the training data,
       e.g. "['Python' 'Django' 'REST APIs']" -> ['Python', 'Django', 'REST APIs']
    2. Plain comma-separated text, e.g. "Python, Machine Learning, SQL"
    3. Plain space-separated text (fallback, used only when there's no comma
       either), e.g. "python aiml" -> ['python', 'aiml']

    Formats 2 and 3 exist because real job-posting forms enter skills as
    ordinary text, not the artificial quoted format the original training
    data happened to use -- without this, any job posting entered as normal
    text would silently parse to ZERO required skills, and the match score
    would collapse to 0% regardless of how well-qualified the candidate is.
    Verified against the original training data: every existing record uses
    the quoted format, so format 1 always fires first for that data and
    nothing about the trained model's existing behavior changes.

    NOTE: format 3 (space-separated) can't distinguish "machine learning" (one
    two-word skill) from "machine" + "learning" (two skills) -- if a job's
    skills are only ever comma-separated, prefer that on the input side over
    plain space-separated text.
    """
    quoted = re.findall(r"'([^']+)'", str(text))
    if quoted:
        return quoted

    text = str(text).strip()
    if not text:
        return []

    if "," in text:
        return [s.strip() for s in text.split(",") if s.strip()]

    return [s.strip() for s in text.split() if s.strip()]


# Values that mean "no skill" -- e.g. Spring sends the literal string "[]"
# when a job has no preferred skills, which parse_skills() alone turns into a
# skill called "[]" that no candidate can ever have.
_EMPTY_SKILL_VALUES = frozenset({"", "[]", "none", "null", "nil", "n/a", "na", "-", "--"})


def parse_skill_list(text):
    """parse_skills() + normalize_skill() + removal of empty/placeholder
    values. For the screening and skill-gap comparisons only -- the trained
    matching model keeps using parse_skills() unchanged (see the note at the
    top of this file)."""
    result = []
    for s in parse_skills(text):
        if str(s).strip(" []'\"").lower() in _EMPTY_SKILL_VALUES:
            continue
        skill = normalize_skill(s)
        if skill and skill not in result:
            result.append(skill)
    return result


def normalize_skill(skill):
    """Lowercases, collapses whitespace, and maps known spelling variants to a
    canonical form so 'ReactJS' and 'React' compare equal."""
    cleaned = re.sub(r"\s+", " ", str(skill).lower().strip())
    return SKILL_ALIASES.get(cleaned, cleaned)


def get_tokens(text):
    """Splits text into a set of lowercase alphanumeric tokens, used for
    simple job-title / candidate-role overlap comparisons."""
    return set(re.findall(r"[a-z0-9]+", str(text).lower()))
