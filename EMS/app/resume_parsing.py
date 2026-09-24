"""
Resume Parsing / NER (Module 5) -- wraps the spaCy model trained in
resume_ner.ipynb. Takes raw resume text and returns a structured profile.
"""
import os
import re
import spacy

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "resume_ner_model")
nlp = spacy.load(_MODEL_PATH)

# Maps this module's entity labels to the ResumeParseResponse field names
_LABEL_TO_FIELD = {
    "Name": "name",
    "Skills": "skills_raw",
    "Companies worked at": "companies_worked_at",
    "Designation": "designation",
    "Degree": "degree",
    "College Name": "college_name",
    "Graduation Year": "graduation_year",
    "Years of Experience": "years_of_experience",
    "Email Address": "email_address",
    "Location": "location",
}


def extract_individual_skills(raw_skill_blocks: list) -> list:
    """This dataset annotates Skills as large multi-line blocks, not individual
    entities -- this splits them into a clean, deduplicated list of individual
    skills, ready to feed into matching/skill-gap."""
    individual_skills = set()

    # Two SEPARATE prefix patterns, deliberately not merged into one:
    #
    # 1. COLON-based labels ("Frontend: React", "Soft Skills: Leadership") -- a
    #    colon essentially never appears inside a real skill name, so this is
    #    safe to strip for ANY label word, not just a curated list.
    colon_label_pattern = re.compile(r"^[A-Za-z /&]+:\s*")
    #
    # 2. HYPHEN-based labels ("Languages-Java") -- a hyphen DOES commonly appear
    #    inside real skill names ("CI-CD", "Node-RED", "Objective-C"), so this
    #    one is deliberately restricted to a curated list of known resume
    #    section words to avoid stripping the first half of a real skill name.
    CATEGORY_LABELS = (
        r"languages?|frameworks?|tools?|databases?|technologies|technology|"
        r"libraries|library|skills?|platforms?|proficiencies|proficient in|"
        r"frontend|backend|front[- ]end|back[- ]end"
    )
    hyphen_label_pattern = re.compile(rf"^(?:{CATEGORY_LABELS})\s*-\s*", re.IGNORECASE)

    for block in raw_skill_blocks:
        pieces = re.split(r"[,;\n•]", block)
        for piece in pieces:
            piece = piece.strip()
            piece = re.sub(r"^[-*]\s*", "", piece)                    # strip "- " / "* " bullet markers
            piece = colon_label_pattern.sub("", piece)                 # strip "Frontend:" / "Languages:" etc. (any label)
            piece = hyphen_label_pattern.sub("", piece)                # strip "Languages-" etc. (curated list only)
            piece = re.sub(r"\s*\([^)]*\)\s*$", "", piece)            # strip "(2 years)" etc.
            piece = piece.strip(" .")
            if piece and len(piece) < 40:
                individual_skills.add(piece)

    return sorted(individual_skills)


def parse_resume(text: str) -> dict:
    doc = nlp(text)

    raw_profile = {field: [] for field in _LABEL_TO_FIELD.values()}
    for label, field in _LABEL_TO_FIELD.items():
        values = sorted({ent.text.strip() for ent in doc.ents if ent.label_ == label})
        raw_profile[field] = values

    raw_profile["skills_cleaned"] = extract_individual_skills(raw_profile["skills_raw"])
    return raw_profile


def build_resume_dict_from_text(resume_text: str, resume_id: str = None,
                                 seniority: str = None, industry: str = None) -> dict:
    """Bridges raw resume text into the shape /match-score, /skill-gap, and
    /rank-candidates expect (the same shape a structured ResumeInput produces).

    seniority/industry can't be reliably extracted by the current NER model (its
    label set doesn't include them) -- pass them in explicitly if known, otherwise
    they're left as None and the matching engine treats them as "unknown" rather
    than guessing (seniority_diff defaults to 2, industry_match defaults to False)."""
    profile = parse_resume(resume_text)
    skills = profile["skills_cleaned"]
    skills_str = "[" + " ".join(f"'{s}'" for s in skills) + "]"
    role = profile["designation"][0] if profile["designation"] else ""

    return {
        "resume_id": resume_id or "PARSED_FROM_TEXT",
        "role": role,
        "seniority": seniority,
        "industry": industry,
        "skills": skills_str,
        # Using the raw resume text itself as the "summary" so the text_similarity
        # feature still has real content to compare against, instead of coming back
        # as 0 the way it would with an empty summary/experience_bullets.
        "summary": resume_text,
        "experience_bullets": "",
        "years_experience": None,
    }
