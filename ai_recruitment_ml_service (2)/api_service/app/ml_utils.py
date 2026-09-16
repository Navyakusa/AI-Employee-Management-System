"""
Shared helper functions used by multiple modules.

IMPORTANT: these must stay byte-for-byte identical to the versions used when the
models were trained (in the original notebooks). Changing how skills are parsed
or normalized here would silently make live predictions inconsistent with what
the model actually learned during training.
"""
import re


def parse_skills(text):
    """Extracts skills from the CSV's Python-list-repr string format,
    e.g. "['Python' 'Django' 'REST APIs']" -> ['Python', 'Django', 'REST APIs']
    """
    return re.findall(r"'([^']+)'", str(text))


def normalize_skill(skill):
    """Lowercases and collapses whitespace so 'Java ' and 'java' compare equal."""
    return re.sub(r"\s+", " ", str(skill).lower().strip())


def get_tokens(text):
    """Splits text into a set of lowercase alphanumeric tokens, used for
    simple job-title / candidate-role overlap comparisons."""
    return set(re.findall(r"[a-z0-9]+", str(text).lower()))
