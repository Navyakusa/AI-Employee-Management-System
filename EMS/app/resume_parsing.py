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

    for block in raw_skill_blocks:
        pieces = re.split(r"[,;\n•]", block)
        for piece in pieces:
            piece = piece.strip()
            piece = re.sub(r"^[A-Za-z /&]+:\s*", "", piece)          # strip "Languages:" etc.
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
