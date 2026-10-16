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

# ---------------------------------------------------------------------------
# Everything below is MODULE-LEVEL (built exactly once, when this file is
# first imported at server startup) rather than inside the function -- these
# used to be rebuilt from scratch on every single call, including once per
# candidate in a /rank-candidates request with hundreds of resumes. Regex
# compilation and set construction are individually cheap, but doing them
# needlessly on every call across hundreds of resumes adds up, and there is
# no reason to redo work whose result never changes.
# ---------------------------------------------------------------------------

_COLON_LABEL_PATTERN = re.compile(r"^[A-Za-z /&]+:\s*")

_CATEGORY_LABELS = (
    r"languages?|frameworks?|tools?|databases?|technologies|technology|"
    r"libraries|library|skills?|platforms?|proficiencies|proficient in|"
    r"frontend|backend|front[- ]end|back[- ]end"
)
_HYPHEN_LABEL_PATTERN = re.compile(rf"^(?:{_CATEGORY_LABELS})\s*-\s*", re.IGNORECASE)

_BULLET_PATTERN = re.compile(r"^[-*]\s*")
_PAREN_SUFFIX_PATTERN = re.compile(r"\s*\([^)]*\)\s*$")
_SPLIT_PATTERN = re.compile(r"[,;\n\u2022]")

# A piece whose FIRST word is one of these almost always means the NER span
# swallowed part of a sentence (a project description, a responsibility, an
# instruction) rather than a genuine skill name.
_LEADING_REJECT_WORDS = frozenset({
    "and", "the", "a", "an", "of", "to", "in", "on", "for", "with", "as",
    "is", "are", "using", "based", "this", "that", "from", "by", "at",
    "implementing", "implemented", "integrating", "integrated", "viewing",
    "editing", "deleting", "building", "developed", "designed", "created",
    "added", "built", "mark", "marking", "pause", "paused", "scroll",
    "scrolling", "missing", "allows", "allowing", "enables", "enabling",
})
# Whole pieces that are themselves clearly a generic action/description word
# rather than a skill, even standing alone.
_NONSKILL_WHOLE_WORDS = frozenset({
    "delete", "deleting", "edit", "editing", "pause", "paused", "mark",
    "marking", "missing", "scroll", "scrolling", "view", "viewing",
    "implement", "implementing", "implemented", "integrate", "integrating",
    "integrated", "and", "the", "with", "using", "declaration", "declare",
    "signature", "reference", "references",
})
_MAX_WORDS = 4

# Cross-checking against the document's own Location entities only helps when
# the model recognizes the location at all -- it doesn't recognize every
# Indian city/town (e.g. "Sangareddy" alone was not tagged at all in testing).
# Since this platform's data (job market dataset, salary ranges in LPA) is
# clearly India-focused, adding the closed, well-known set of Indian state/UT
# names as a supplementary signal catches "State City" patterns even when the
# city itself goes unrecognized. This is a deployment-specific heuristic, not
# a general solution -- a platform used in a different region would need a
# different (or no) supplementary list.
_INDIAN_STATES_AND_UTS = (
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
    "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand",
    "karnataka", "kerala", "madhya pradesh", "maharashtra", "manipur",
    "meghalaya", "mizoram", "nagaland", "odisha", "punjab", "rajasthan",
    "sikkim", "tamil nadu", "telangana", "tripura", "uttar pradesh",
    "uttarakhand", "west bengal", "delhi", "puducherry", "chandigarh",
    "jammu", "kashmir", "ladakh",
)
_STATE_WORDS = frozenset(word for state in _INDIAN_STATES_AND_UTS for word in state.split())

# Common spoken-language names -- a resume's "Languages" section (spoken
# language proficiency) is a completely different thing from technical
# skills, but the NER model sometimes lumps them into the same "Skills" span.
# Rejecting pieces made ENTIRELY of these words filters that out without
# touching real skills (no common tech skill name coincides with a language
# name).
_SPOKEN_LANGUAGE_WORDS = frozenset({
    "english", "hindi", "telugu", "tamil", "kannada", "malayalam", "marathi",
    "bengali", "gujarati", "punjabi", "urdu", "odia", "assamese", "sanskrit",
    "french", "german", "spanish", "chinese", "japanese", "korean", "arabic",
    "russian", "portuguese", "italian", "mandarin", "konkani", "sindhi",
})

# A piece that is EXACTLY one of these bare category-label words (with
# nothing else) means a section header leaked through as its own split piece
# -- this happens when the header and its content sit on separate lines with
# no colon/hyphen joining them (so _COLON_LABEL_PATTERN / _HYPHEN_LABEL_PATTERN
# never get a chance to strip it, since those only strip a prefix ON the same
# piece as its content).
_BARE_CATEGORY_LABELS = frozenset({
    "languages", "language", "skills", "skill", "tools", "tool", "frameworks",
    "framework", "databases", "database", "technologies", "technology",
    "libraries", "library", "platforms", "platform", "proficiencies",
})

# ---------------------------------------------------------------------------
# Header-based skills section scanner. This is a NECESSARY complement to the
# NER model, not just a nice-to-have: real-world testing found the model
# sometimes labels the actual technical-skills content as "Degree" or another
# field entirely (the label assignment itself is unreliable, not just the
# span boundaries), and separately sometimes extends a "Skills" span past the
# real skills into an unrelated "Declaration" section, swallowing the
# candidate's own name and location along with it. Scanning the raw text
# directly for a recognizable skills-section header, independent of whatever
# label the NER model assigns to that text, is far more robust for finding
# the actual skills content, and for correctly stopping before an unrelated
# section begins.
# ---------------------------------------------------------------------------

_SKILLS_HEADER_PATTERN = re.compile(
    r"^\s*(?:technical\s+|key\s+|core\s+|professional\s+|relevant\s+)?"
    r"(?:skills?\b|skill\s*set\b|areas?\s+of\s+expertise\b|expertise\b|competenc(?:y|ies)\b)"
    r"\s*:?\s*",
    re.IGNORECASE,
)

# Lines matching any of these mark the START of a DIFFERENT section -- the
# skills-section scan stops as soon as one of these appears, so it doesn't
# run on into unrelated content (education, a declaration statement, personal
# details like date of birth, etc.).
_SECTION_STOP_PATTERN = re.compile(
    r"^\s*(?:declaration|projects?|experience|work\s+experience|education|"
    r"certifications?|references?|achievements?|hobbies|interests?|"
    r"extra[\s-]?curricular|personal\s+(?:details|information)|objective|"
    r"career\s+objective|summary|profile|publications?|awards?|"
    r"internships?|academic\s+(?:details|background)|languages?|"
    r"date\s+of\s+birth|dob|father'?s\s+name|mother'?s\s+name|"
    r"marital\s+status|nationality|gender)\s*:?\s*$",
    re.IGNORECASE,
)

_MAX_SECTION_LINES = 20  # safety cap so a missing stop-header can't run away


def _find_skills_sections_by_header(full_text: str) -> list:
    """Scans the raw resume text line-by-line for a skills-section header
    (e.g. "SKILLS", "TECHNICAL SKILLS", "Skills:") and captures everything
    after it up to the next recognized section header or a line-count cap.
    Returns a list of captured text blocks (one per header found -- a resume
    could have both a general "Skills" section and a separate "Technical
    Skills" section). Completely independent of the NER model's own entity
    labels, so it works even when the model mislabels the content."""
    lines = full_text.split("\n")
    sections = []

    i = 0
    while i < len(lines):
        stripped = lines[i].strip()
        m = _SKILLS_HEADER_PATTERN.match(stripped)
        if m:
            captured = []
            # A PDF-extraction artifact sometimes merges the header and its
            # first item onto one line ("TECHNICAL SKILLS Programming: Python")
            # instead of a clean line break -- capture whatever follows the
            # header on that SAME line too, rather than requiring the header
            # to be the only thing on the line.
            trailing = stripped[m.end():].strip()
            if trailing:
                captured.append(trailing)

            j = i + 1
            while j < len(lines) and len(captured) < _MAX_SECTION_LINES:
                line = lines[j].strip()
                if _SECTION_STOP_PATTERN.match(line):
                    break
                if line:
                    captured.append(line)
                j += 1
            if captured:
                sections.append("\n".join(captured))
            i = j
        else:
            i += 1

    return sections


# ---------------------------------------------------------------------------
# Regex/heuristic fallbacks for other fields. Real-world testing on an actual
# resume (clean formatting, name in caps at the top, a standard pipe-separated
# contact line, three clearly-named colleges, clear year ranges) found the NER
# model recognized almost NONE of it: on a resume with a name, email, three
# college names, and three graduation years all plainly present, the model
# found only 5 entities total across the entire document, missing all four of
# those fields completely. Some of these (an email address, most obviously)
# don't need a trained model at all -- a plain regex is both simpler and
# strictly more reliable. Others (college names, graduation years) benefit
# from scoping a similar regex to the EDUCATION section, the same way the
# skills header-scanner works.
# ---------------------------------------------------------------------------

_EMAIL_PATTERN = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

_EDUCATION_HEADER_PATTERN = re.compile(
    r"^\s*(?:academic\s+(?:details|background|qualifications?)\b|education\b|qualifications?\b)"
    r"\s*:?\s*",
    re.IGNORECASE,
)

_COLLEGE_LINE_PATTERN = re.compile(
    r"[^,\n]*\b(?:university|college|institute|polytechnic|vidyalaya|school)\b[^,\n]*",
    re.IGNORECASE,
)

_YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")

# Words that, if they appear on the SAME line as a matched institution name OR
# on the line immediately following it, mean that institution is pre-university
# (11th-12th grade / 10th grade), even when the name doesn't literally contain
# "Junior" or "High School" -- real resumes commonly list the institution name
# and years on one line, then the qualification ("Intermediate (MPC)") on the
# very next line, so checking only the same line misses this pattern.
_PRE_UNIVERSITY_INDICATORS = (
    "intermediate", "secondary school certificate", "matriculation",
    "higher secondary", "10th", "12th", "ssc", "hsc",
)

# Degree/qualification-indicating keywords, scoped to the Education section --
# used INSTEAD OF the raw NER "Degree" entity, which real-world testing showed
# is unreliable in the same way "Skills" was: its span can run past the actual
# degree text and swallow an entire unrelated TECHNICAL SKILLS section
# (Programming, Web Technologies, Databases, Tools, Soft Skills all ending up
# inside "degree"). Extracting degree/qualification lines directly by keyword,
# bounded to the Education section, avoids depending on that unreliable span.
_DEGREE_PATTERN = re.compile(
    r"[^,\n]*\b(?:bachelor|master|b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|m\.?\s?e\b|"
    r"b\.?\s?sc\b|m\.?\s?sc\b|b\.?\s?a\b|m\.?\s?a\b|b\.?\s?com\b|m\.?\s?com\b|"
    r"mba|mca|bca|ph\.?d|diploma|intermediate|secondary school certificate|"
    r"higher secondary|matriculation)\b[^,\n]*",
    re.IGNORECASE,
)

# Section-header-like words that must NOT be mistaken for a person's name
# when falling back to "first line of the document" -- a resume that opens
# with "RESUME" or "CURRICULUM VITAE" as a title shouldn't have that treated
# as the candidate's name.
_NON_NAME_FIRST_LINES = frozenset({
    "resume", "curriculum vitae", "cv", "bio-data", "biodata", "profile",
})


def _find_education_section(full_text: str) -> str:
    """Same header-scan approach as skills, scoped to an EDUCATION section --
    used to bound where college-name and graduation-year regexes look, so they
    don't accidentally match a year or institution name mentioned elsewhere
    (e.g. in a certifications or projects section)."""
    lines = full_text.split("\n")

    for i, line in enumerate(lines):
        stripped_header_line = line.strip()
        m = _EDUCATION_HEADER_PATTERN.match(stripped_header_line)
        if m:
            captured = []
            trailing = stripped_header_line[m.end():].strip()
            if trailing:
                captured.append(trailing)

            j = i + 1
            while j < len(lines) and len(captured) < _MAX_SECTION_LINES:
                stripped = lines[j].strip()
                if _SECTION_STOP_PATTERN.match(stripped) or _SKILLS_HEADER_PATTERN.match(stripped):
                    break
                if stripped:
                    captured.append(stripped)
                j += 1
            return "\n".join(captured)

    return ""


_PROJECTS_HEADER_PATTERN = re.compile(r"^\s*projects?\s*:?\s*$", re.IGNORECASE)


def _find_projects_section(full_text: str) -> str:
    """Same header-scan approach, scoped to a PROJECTS section -- used to
    catch cases where the NER model mistakes a project title (e.g. "Online
    Recruitment Fraud Detection") for a job "Designation", since both are
    capitalized multi-word phrases and the model has no other signal to tell
    them apart. A much larger line cap is used here since a projects section
    is often long."""
    lines = full_text.split("\n")

    for i, line in enumerate(lines):
        if _PROJECTS_HEADER_PATTERN.match(line.strip()):
            captured = []
            j = i + 1
            while j < len(lines) and len(captured) < 60:
                stripped = lines[j].strip()
                if _SECTION_STOP_PATTERN.match(stripped) and not _PROJECTS_HEADER_PATTERN.match(stripped):
                    break
                if stripped:
                    captured.append(stripped)
                j += 1
            return "\n".join(captured)

    return ""


def extract_email_fallback(full_text: str) -> list:
    """A plain regex is strictly more reliable than a trained model for this
    -- an email address has a fixed, unambiguous shape."""
    return sorted(set(_EMAIL_PATTERN.findall(full_text)))


def extract_college_names_fallback(full_text: str) -> list:
    education_text = _find_education_section(full_text)
    if not education_text:
        return []

    lines = education_text.split("\n")
    college_names = []

    for idx, line in enumerate(lines):
        matches = _COLLEGE_LINE_PATTERN.findall(line)
        if not matches:
            continue

        # Check THIS line and the NEXT one for pre-university indicators --
        # real resumes commonly put the qualification name ("Intermediate
        # (MPC)") on the line right after the institution name, not the same
        # line, so both need checking.
        context = line.lower()
        if idx + 1 < len(lines):
            context += " " + lines[idx + 1].lower()

        exclude_phrases = ("certificate", "junior college", "high school", "secondary school")
        if any(p in context for p in exclude_phrases) or any(p in context for p in _PRE_UNIVERSITY_INDICATORS):
            continue

        for m in matches:
            cleaned = m.strip(" .-")
            # Strip a trailing year or year-range ("Malla Reddy University
            # 2022 - 2026" -> "Malla Reddy University") -- a genuine
            # institution NAME essentially never contains a bare year
            # immediately after it.
            year_match = _YEAR_PATTERN.search(cleaned)
            if year_match:
                cleaned = cleaned[:year_match.start()].strip(" ,.-\u2013\u2014")
            if cleaned:
                college_names.append(cleaned)

    return sorted(set(college_names))


def extract_graduation_years_fallback(full_text: str) -> list:
    education_text = _find_education_section(full_text)
    if not education_text:
        return []
    return sorted(set(m.group(0) for m in _YEAR_PATTERN.finditer(education_text)))


def extract_degree_fallback(full_text: str) -> list:
    """Extracts clean degree/qualification lines directly by keyword, bounded
    to the Education section -- used instead of trusting the raw NER "Degree"
    entity, whose span has been observed running past the actual degree text
    and swallowing an entire unrelated skills section."""
    education_text = _find_education_section(full_text)
    if not education_text:
        return []
    matches = [m.strip(" .-") for m in _DEGREE_PATTERN.findall(education_text)]
    return sorted(set(m for m in matches if m))


def filter_out_project_titles(designations: list, full_text: str) -> list:
    """Removes any "Designation" the NER model found that is actually a
    project title, not a job title -- both are capitalized multi-word
    phrases with no other distinguishing signal for the model, so this cross-
    checks against a directly-located PROJECTS section instead."""
    projects_text = _find_projects_section(full_text)
    if not projects_text:
        return designations
    projects_lower = projects_text.lower()
    return [d for d in designations if d.lower() not in projects_lower]


def filter_out_language_lists(designations: list) -> list:
    """Removes any "Designation" that is actually a spoken-language list
    (e.g. "Telugu English Hindi Marathi") -- observed in testing where the
    model tagged a resume's Languages section as Designation instead of
    Skills, depending on the exact resume phrasing. Same false-positive
    pattern as the Skills-side language filter, applied here too."""
    result = []
    for d in designations:
        words = d.split()
        if words and all(w.lower() in _SPOKEN_LANGUAGE_WORDS for w in words):
            continue
        result.append(d)
    return result


def extract_name_fallback(full_text: str) -> str:
    """If the NER model found no Name entity at all, fall back to the first
    non-empty line -- true for the overwhelming majority of resumes -- with
    guards against mistaking a document title or contact-info line for a
    name."""
    for line in full_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        if line.lower() in _NON_NAME_FIRST_LINES:
            return None
        if "@" in line or any(ch.isdigit() for ch in line):
            return None  # looks like a contact-info line, not a name
        words = line.split()
        if 1 <= len(words) <= 5 and len(line) < 60:
            return line
        return None  # first non-empty line doesn't look name-shaped -- don't guess
    return None


def extract_individual_skills(raw_skill_blocks: list, known_locations: list = None) -> list:
    """This dataset annotates Skills as large multi-line blocks, not individual
    entities -- this splits them into a clean, deduplicated list of individual
    skills, ready to feed into matching/skill-gap.

    known_locations: location strings the SAME document's NER pass already
    found (e.g. ["Hyderabad"]) -- used to catch cases where the Skills span
    also swallowed an address line ("Telangana Hyderabad"), by cross-checking
    against the model's own location detection rather than a hardcoded list of
    place names (which wouldn't generalize beyond one country/region).

    IMPORTANT: the underlying NER model's "Skills" entity boundary is not always
    reliable -- on many real resumes it bleeds into project-description
    sentences, locations, and even repo names (e.g. "and mark tasks as
    complete", "telangana hyderabad", "github aiml integration-flask" have all
    been observed coming through as "skills"). The filters below are a
    heuristic cleanup layer that catches the most common patterns of this kind
    of noise -- they meaningfully reduce it, but can't guarantee perfect
    precision, since the root cause is the NER model's span boundaries, not
    this splitting logic. A future retrain with more diverse resume formats is
    the real long-term fix.
    """
    individual_skills = set()

    # Only combine the (small, per-call) known_locations with the module-level
    # state-name set -- this is the one piece of per-call work that's
    # unavoidable, since known_locations differs per resume.
    location_words = set(_STATE_WORDS)
    for loc in (known_locations or []):
        location_words.update(w.lower() for w in re.findall(r"[A-Za-z]+", loc))

    for block in raw_skill_blocks:
        # Truncate the block at the first line that looks like an unrelated
        # section header (PROJECTS, CERTIFICATIONS, etc.) BEFORE splitting
        # into individual pieces -- the raw NER "Skills" span has been
        # observed running past the actual skills content into these
        # unrelated sections, and this stops that regardless of source
        # (whether the block came from the NER model directly or from the
        # header-scanner).
        block_lines = block.split("\n")
        truncated_lines = []
        for line in block_lines:
            if _SECTION_STOP_PATTERN.match(line.strip()):
                break
            truncated_lines.append(line)
        block = "\n".join(truncated_lines)

        pieces = _SPLIT_PATTERN.split(block)
        for piece in pieces:
            piece = piece.strip()
            piece = _BULLET_PATTERN.sub("", piece)              # strip "- " / "* " bullet markers
            piece = _COLON_LABEL_PATTERN.sub("", piece)          # strip "Frontend:" / "Languages:" etc. (any label)
            piece = _HYPHEN_LABEL_PATTERN.sub("", piece)         # strip "Languages-" etc. (curated list only)
            piece = _PAREN_SUFFIX_PATTERN.sub("", piece)         # strip "(2 years)" etc.
            piece = piece.strip(" .")

            if not piece or len(piece) >= 40:
                continue

            words = piece.split()

            # A PDF text-extraction artifact: some fonts/PDF generators cause
            # short strings to come out with every letter separated by a
            # space ("G i t" instead of "Git"). Detected as ALL "words" being
            # single characters -- safe to collapse, since a genuine multi-
            # word skill like "VS Code" has real multi-character words and
            # would never trigger this.
            if len(words) >= 2 and all(len(w) == 1 for w in words):
                piece = "".join(words)
                words = [piece]

            if len(words) > _MAX_WORDS:
                continue
            if words and words[0].lower() in _LEADING_REJECT_WORDS:
                continue
            if piece.lower() in _NONSKILL_WHOLE_WORDS:
                continue
            if piece.lower() in _BARE_CATEGORY_LABELS:
                continue  # a section header leaked through as its own piece (no colon/hyphen to strip)
            if words and all(w.lower() in _SPOKEN_LANGUAGE_WORDS for w in words):
                continue  # a spoken-language list (e.g. "Telugu English Hindi"), not technical skills
            if words and any(w.lower() in location_words for w in words):
                continue  # contains a word the model itself tagged as a Location elsewhere

            individual_skills.add(piece)

    return sorted(individual_skills)


def _normalize_whitespace(text: str) -> str:
    """PDF extraction sometimes produces highly irregular spacing -- e.g.
    'Telugu                 English                  Hindi' with a dozen
    spaces between words, a real artifact observed in production. This can
    make exact-pattern matching (section headers, degree keywords, etc.)
    behave unpredictably. Collapses runs of horizontal whitespace into a
    single space while preserving newlines, since the line-based section
    scanning throughout this module depends on them."""
    return "\n".join(re.sub(r"[ \t]+", " ", line) for line in text.split("\n"))


def parse_resume(text: str) -> dict:
    text = _normalize_whitespace(text)
    doc = nlp(text)

    raw_profile = {field: [] for field in _LABEL_TO_FIELD.values()}
    for label, field in _LABEL_TO_FIELD.items():
        values = sorted({ent.text.strip() for ent in doc.ents if ent.label_ == label})
        raw_profile[field] = values

    # Two independent sources of skill text, unioned together:
    # 1. Whatever the NER model itself labeled "Skills" (raw_profile["skills_raw"])
    # 2. A direct scan of the raw text for a skills-section header, regardless
    #    of what label the model assigned to that content -- necessary because
    #    testing showed the model sometimes puts real skills content under a
    #    different label entirely (e.g. "Degree"), which source #1 alone
    #    would completely miss.
    header_scanned_sections = _find_skills_sections_by_header(text)

    cleaned_from_ner = extract_individual_skills(raw_profile["skills_raw"], known_locations=raw_profile["location"])
    cleaned_from_headers = extract_individual_skills(header_scanned_sections, known_locations=raw_profile["location"])

    raw_profile["skills_cleaned"] = sorted(set(cleaned_from_ner) | set(cleaned_from_headers))

    # Same "regex/heuristic fallback alongside the NER model" approach applied
    # to the other fields real-world testing showed the model frequently
    # misses entirely: email (a fixed, unambiguous pattern -- regex is simply
    # the right tool here, not a trained model), college names and graduation
    # years (scoped to a directly-located EDUCATION section), and the
    # candidate's name (falls back to the first line only when the model found
    # nothing, with guards against false positives).
    if not raw_profile["email_address"]:
        raw_profile["email_address"] = extract_email_fallback(text)

    college_fallback = extract_college_names_fallback(text)
    raw_profile["college_name"] = sorted(set(raw_profile["college_name"]) | set(college_fallback))

    year_fallback = extract_graduation_years_fallback(text)
    raw_profile["graduation_year"] = sorted(set(raw_profile["graduation_year"]) | set(year_fallback))

    if not raw_profile["name"]:
        name_fallback = extract_name_fallback(text)
        if name_fallback:
            raw_profile["name"] = [name_fallback]

    # Degree: REPLACE the raw NER span entirely rather than unioning with it --
    # unlike the other fields, the raw NER "Degree" span has been observed
    # actively swallowing an entire unrelated Technical Skills section, so
    # keeping any part of it risks reintroducing exactly that noise.
    raw_profile["degree"] = extract_degree_fallback(text)

    # Designation: drop anything that's actually a project title (see
    # filter_out_project_titles for why this cross-check exists).
    raw_profile["designation"] = filter_out_project_titles(raw_profile["designation"], text)
    raw_profile["designation"] = filter_out_language_lists(raw_profile["designation"])

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
