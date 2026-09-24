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
    "express.js": "express",
}


def parse_skills(text):
    """Extracts skills from the CSV's Python-list-repr string format,
    e.g. "['Python' 'Django' 'REST APIs']" -> ['Python', 'Django', 'REST APIs']
    """
    return re.findall(r"'([^']+)'", str(text))


def normalize_skill(skill):
    """Lowercases, collapses whitespace, and maps known spelling variants to a
    canonical form so 'ReactJS' and 'React' compare equal."""
    cleaned = re.sub(r"\s+", " ", str(skill).lower().strip())
    return SKILL_ALIASES.get(cleaned, cleaned)


def get_tokens(text):
    """Splits text into a set of lowercase alphanumeric tokens, used for
    simple job-title / candidate-role overlap comparisons."""
    return set(re.findall(r"[a-z0-9]+", str(text).lower()))
