"""
Resume Parsing / NER (Module 5) -- wraps the spaCy model trained in
resume_ner.ipynb. Takes raw resume text and returns a structured profile.
"""
import os
import re
import spacy
from datetime import date

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

_BULLET_PATTERN = re.compile(r"^[\s\-_*•●○▪◦·‣–—]+")
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
    "fostering", "impactful", "proficient",
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

# Conservative vocabulary used only as a PRECISION filter after section
# extraction.  It is not a replacement for the trained NER model: the model
# still discovers skill text, while this vocabulary prevents ordinary prose
# ("efficiency", "impactful results", etc.) from becoming a skill.  The list
# intentionally contains common technical, tooling, academic-CS and soft-skill
# terms rather than candidate-specific names.
_KNOWN_SKILL_TERMS = frozenset({
    # Languages / web
    "python", "java", "c", "c++", "c#", "go", "golang", "ruby", "php",
    "javascript", "java script", "typescript", "kotlin", "swift", "html",
    "html5", "css", "css3", "sql", "r", "bash", "shell scripting",
    # CS / data / databases
    "oops", "object oriented programming", "object-oriented programming",
    "data structures", "data structures and algorithms", "algorithms", "dbms",
    "computer networks", "operating systems", "mysql", "postgresql", "oracle",
    "mongodb", "sqlite", "redis", "nosql", "pandas", "numpy", "matplotlib",
    "seaborn", "scikit-learn", "sklearn", "tensorflow", "keras", "pytorch",
    "opencv", "nlp", "natural language processing", "machine learning",
    "deep learning", "artificial intelligence", "generative ai", "bert",
    "roberta", "cnn", "rnn", "llm", "power bi", "tableau", "excel",
    # Frameworks / libraries / dev tools
    "react", "react.js", "reactjs", "angular", "vue", "vue.js", "node.js",
    "nodejs", "express", "express.js", "flask", "fastapi", "django", "spring",
    "spring boot", "bootstrap", "tailwind", "tailwind css", "rest api", "rest apis",
    "restful api", "jwt", "git", "github", "gitlab", "bitbucket", "docker",
    "kubernetes", "linux", "windows", "vs code", "visual studio code", "jupyter",
    "jupyter notebooks", "google colab", "postman", "android studio", "sublime",
    "microsoft office", "aws", "azure", "gcp", "vercel", "firebase",
    # Common software / engineering skills
    "api integration", "frontend development", "front-end development",
    "backend development", "back-end development", "web development", "ui/ux",
    "responsive design", "version control", "debugging", "testing", "test automation",
    "data analysis", "data analytics", "data visualization", "reporting", "forecasting",
    # Soft skills
    "communication", "communicator", "interpersonal skills", "teamwork", "leadership",
    "adaptability", "problem solving", "problem-solving", "collaboration",
    "time management", "critical thinking", "quick learning", "learning agility",
    "decision making", "decision-making", "presentation skills", "organizational skills",
})

# Multi-word/phrase skills that are safe to recover from prose-like soft-skill
# lines.  These are matched case-insensitively and never cause surrounding
# sentence text to be retained.
_SOFT_SKILL_PHRASES = (
    "interpersonal skills", "problem-solving", "problem solving", "time management",
    "critical thinking", "quick learning", "learning agility", "decision-making",
    "decision making", "presentation skills", "organizational skills", "communication",
    "teamwork", "leadership", "adaptability", "collaboration", "debugging",
)


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
    r"^\s*(?:"
    r"(?:technical|key|core|professional|relevant)\s+skills?\b"
    r"|skills?\s*(?:set|&\s*(?:expertise|competencies)|and\s+(?:expertise|competencies))\b"
    r"|skill\s*set\b"
    r"|areas?\s+of\s+expertise\b"
    r"|expertise\b"
    r"|(?:technical|key|core|professional|relevant)\s+competenc(?:y|ies)\b"
    r"|(?:technical|key|core|professional|relevant)\s+proficienc(?:y|ies)\b"
    r")\s*:?\s*",
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


_INLINE_SKILLS_HEADER_PATTERN = re.compile(
    r"\b(?:technical\s+skills?|key\s+skills?|core\s+skills?|professional\s+skills?|"
    r"relevant\s+skills?|skills?\s+set|skill\s+set|skills?\s*&\s*(?:expertise|competencies|technologies)|"
    r"skills?\s+and\s+(?:expertise|competencies|technologies)|areas?\s+of\s+expertise|"
    r"technical\s+competenc(?:y|ies)|technical\s+proficienc(?:y|ies)|technical\s+expertise|tools?\s*&\s*technologies|"
    r"core\s+competenc(?:y|ies)|core\s+proficienc(?:y|ies))\b\s*:?", re.IGNORECASE)

_CATEGORY_BOUNDARY_PATTERN = re.compile(
    r"\b(?:programming\s+languages?|languages?|frameworks?\s*(?:&|and)\s*libraries?|"
    r"frameworks?|libraries?|databases?|tools?|ui\s+development|web\s+technologies?|"
    r"computer\s+science\s+fundamentals?|data\s+analytics|ai\s*(?:&|and)\s*machine\s+learning|"
    r"machine\s+learning|deep\s+learning|operating\s+systems?|version\s+control|"
    r"cloud|platforms?|soft\s+skills?|technical\s+skills?)\s*[:\-]\s*", re.IGNORECASE)

# Category headings are also frequently written as standalone lines, e.g.
# "Languages" followed by Python/Java on the next lines.  The older fallback
# only recognized category labels when they had ':' or '-', so those resumes
# fell through to the NER span and/or captured everything until the end of the
# document.
_STANDALONE_SKILL_CATEGORY_PATTERN = re.compile(
    r"^\s*(?:programming\s+languages?|languages?|frameworks?\s*(?:&|and)\s*libraries?|"
    r"frameworks?|libraries?|databases?|tools?|ui\s+development|web\s+technologies?|"
    r"computer\s+science\s+fundamentals?|data\s+analytics|ai\s*(?:&|and)\s*machine\s+learning|"
    r"machine\s+learning|deep\s+learning|operating\s+systems?|version\s+control|"
    r"cloud|platforms?|soft\s+skills?|technical\s+skills?)\s*:?\s*$", re.IGNORECASE)

_NON_SKILL_SECTION_LINE_PATTERN = re.compile(
    r"^\s*(?:academic\s+coursework|coursework|participation(?:\s*&|\s+and)?\s+certifications?|"
    r"certifications?|certificates?|achievements?|experience(?:\s*&|\s+and)?\s+internships?|"
    r"professional\s+experience|work\s+experience|projects?|education|declaration|references?|"
    r"objective|career\s+objective|summary|profile|personal\s+(?:details|information)|"
    r"contact(?:\s+details?)?)\s*:?.*$", re.IGNORECASE)

_EXPLICIT_EXPERIENCE_PATTERN = re.compile(
    r"(?<!\w)(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)(?:\s+of\s+(?:professional\s+)?experience)?\b", re.IGNORECASE)
_EXPLICIT_MONTH_PATTERN = re.compile(r"(?<!\w)(\d+(?:\.\d+)?)\s*(?:months?|mos?)(?:\s+of\s+experience)?\b", re.IGNORECASE)
_DATE_RANGE_PATTERN = re.compile(
    r"(?P<start>(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
    r"aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s,\-./]*\d{4}|\b\d{4})"
    r"\s*(?:-|–|—|to|until)\s*"
    r"(?P<end>(?:present|current|now)|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|"
    r"jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s,\-./]*\d{4}|\b\d{4})", re.IGNORECASE)
_MONTHS = {m.lower(): i for i, m in enumerate("January February March April May June July August September October November December".split(), 1)}
_MONTH_ALIASES = {**_MONTHS, **{m[:3]: n for m,n in _MONTHS.items()}}

_MAX_SECTION_LINES = 40  # allow long skills sections without making the scan unbounded


def _looks_like_section_heading(line: str) -> bool:
    """Recognize common resume section headings, including headings that
    are not in the fixed stop list (e.g. ``PARTICIPATION & CERTIFICATIONS``).
    This is deliberately conservative: it mainly targets short ALL-CAPS lines
    and title-case section names, not ordinary sentence lines."""
    line = line.strip().strip(" :|-")
    if not line or len(line) > 70 or any(ch in line for ch in ".,;!?"):
        return False
    # ALL-CAPS headings are extremely common in PDF resumes.
    letters = [c for c in line if c.isalpha()]
    # A single short ALL-CAPS token such as "C", "HTML", "SQL" or "JAVA"
    # is usually a skill, not a section heading. Treat single-word ALL-CAPS
    # text as a heading only when it is long enough to look like a real
    # section title (e.g. "PROJECTS", "CERTIFICATIONS"). Multi-word ALL-CAPS
    # lines remain valid headings (e.g. "SALESFORCE CERTIFIED").
    if letters and len(line.split()) <= 7 and all(c.isupper() for c in letters):
        if len(line.split()) >= 2 or len(letters) >= 6:
            return True
    # Common title-case headings with no sentence punctuation.
    heading_words = {
        "profile", "summary", "objective", "education", "experience",
        "internship", "internships", "projects", "certifications",
        "achievements", "participation", "references", "declaration",
        "skills", "skill set", "technical skills", "professional skills",
        "personal details", "extra curricular", "extracurricular",
    }
    return line.lower() in heading_words


def _capture_skill_text_after_match(text: str, match_end: int) -> str:
    remainder = text[match_end:]
    stop = re.search(
        r"\b(?:participation\s*(?:&|and)\s*certifications?|certifications?|achievements?|"
        r"experience\s*(?:&|and)\s*internships?|work\s+experience|projects?|education|"
        r"academic\s+(?:details|background)|declaration|references?|personal\s+(?:details|information)|"
        r"career\s+objective|objective|summary|profile|publications?|awards?|hobbies|interests?)\b\s*:?(?=\s|$)",
        remainder, re.IGNORECASE)
    if stop:
        remainder = remainder[:stop.start()]
    return remainder.strip(" \n\r|:-")


def _find_skills_sections_by_header(full_text: str) -> list:
    sections = []
    lines = full_text.split("\n")
    i = 0
    while i < len(lines):
        stripped = lines[i].strip()
        m = _SKILLS_HEADER_PATTERN.match(stripped)
        if m:
            captured = []
            trailing = stripped[m.end():].strip()
            if trailing:
                captured.append(trailing)
            j = i + 1
            while j < len(lines) and len(captured) < _MAX_SECTION_LINES:
                line = lines[j].strip()
                if _SECTION_STOP_PATTERN.match(line) or _looks_like_section_heading(line):
                    break
                if line:
                    captured.append(line)
                j += 1
            if captured:
                sections.append("\n".join(captured))
            i = j
        else:
            i += 1
    if not sections:
        for m in _INLINE_SKILLS_HEADER_PATTERN.finditer(full_text):
            block = _capture_skill_text_after_match(full_text, m.end())
            if block:
                sections.append(block)

    # Structured fallback for resumes that have NO overall "Skills" heading.
    # Many real resumes use standalone category labels instead:
    #   Languages
    #   Python / Java / C
    #   Tools
    #   GitHub / Power BI
    #   Soft skills
    # This parser collects only those category blocks and stops at the next
    # category or at a clearly unrelated section. It never consumes the rest
    # of the document, so email addresses/certifications/projects cannot leak
    # into skills_raw or skills_cleaned.
    if not sections:
        lines = full_text.split("\n")
        category_indexes = [i for i, line in enumerate(lines)
                            if _STANDALONE_SKILL_CATEGORY_PATTERN.match(line.strip())]
        if category_indexes:
            captured_blocks = []
            for pos, start_idx in enumerate(category_indexes):
                end_idx = category_indexes[pos + 1] if pos + 1 < len(category_indexes) else len(lines)
                captured = []
                for line in lines[start_idx + 1:end_idx]:
                    stripped = line.strip()
                    if not stripped:
                        continue
                    if _NON_SKILL_SECTION_LINE_PATTERN.match(stripped) or _looks_like_section_heading(stripped):
                        break
                    if _EMAIL_PATTERN.search(stripped):
                        break
                    captured.append(stripped)
                if captured:
                    captured_blocks.append("\n".join(captured))
            if captured_blocks:
                sections.extend(captured_blocks)

    # Final category-label fallback for inline forms such as
    # "Programming Languages: Python, Java | Tools: GitHub, VS Code".
    if not sections:
        matches=list(_CATEGORY_BOUNDARY_PATTERN.finditer(full_text))
        if matches:
            chunks=[]
            for idx, match in enumerate(matches):
                start=match.end()
                end=matches[idx+1].start() if idx+1 < len(matches) else len(full_text)
                chunk=full_text[start:end]
                stop=re.search(r"(?:participation\s*(?:&|and)\s*certifications?|certifications?|"
                               r"experience\s*(?:&|and)\s*internships?|professional\s+experience|"
                               r"work\s+experience|projects?|education|declaration|references?|"
                               r"career\s+objective|objective|summary|profile)\b", chunk, re.I)
                if stop:
                    chunk=chunk[:stop.start()]
                if _EMAIL_PATTERN.search(chunk):
                    chunk=chunk[:_EMAIL_PATTERN.search(chunk).start()]
                if chunk.strip():
                    chunks.append(chunk.strip())
            if chunks:
                sections.extend(chunks)

    unique=[]; seen=set()
    for section in sections:
        key=re.sub(r"\s+"," ",section).strip().lower()
        if key and key not in seen:
            seen.add(key); unique.append(section)
    return unique


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


def _parse_date_token(token: str, is_end: bool = False):
    token = token.strip().lower()
    if token in {"present", "current", "now"}:
        today=date.today(); return today.year,today.month
    m=re.search(r"(19|20)\d{2}",token)
    if not m: return None
    year=int(m.group(0)); month=12 if is_end else 1
    for name,num in _MONTH_ALIASES.items():
        if re.search(rf"\b{name}\b",token): month=num; break
    return year,month

def _months_between(start,end):
    return max(0,(end[0]-start[0])*12+(end[1]-start[1])+1) if start and end else 0

def extract_experience_fallback(full_text: str) -> list:
    """Extract only professional/work experience.

    Internship-only sections such as ``Experience & Internship`` are not
    counted as professional experience.  This prevents a short internship
    date range from becoming values such as ``0.2 years``.
    """
    lines = full_text.split("\n")

    # Explicit statements are accepted only when the text clearly refers to
    # professional/work experience, not when the word "experience" appears
    # in an internship, project, or certification description.
    explicit = []
    for m in re.finditer(
        r"(?<!\w)(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b",
        full_text,
        re.I,
    ):
        window = full_text[max(0, m.start() - 80):min(len(full_text), m.end() + 80)]
        if re.search(
            r"\b(?:professional|work|employment)\s+(?:experience|history)\b|"
            r"\b(?:years?|yrs?)\s+of\s+professional\s+experience\b",
            window,
            re.I,
        ):
            explicit.append(float(m.group(1)))

    for m in re.finditer(
        r"(?<!\w)(\d+(?:\.\d+)?)\s*(?:months?|mos?)\b",
        full_text,
        re.I,
    ):
        window = full_text[max(0, m.start() - 80):min(len(full_text), m.end() + 80)]
        if re.search(
            r"\b(?:professional|work|employment)\s+(?:experience|history)\b|"
            r"\b(?:months?|mos?)\s+of\s+professional\s+experience\b",
            window,
            re.I,
        ):
            explicit.append(float(m.group(1)) / 12)

    if explicit:
        total = max(explicit)
        return [f"{total:.1f} years" if total % 1 else f"{int(total)} years"]

    # IMPORTANT: do not treat these as professional experience:
    #   Experience & Internship
    #   Internship
    #   Internships
    # Only dedicated professional/work/employment sections are accepted.
    professional_header = re.compile(
        r"^\s*(?:professional\s+experience|work\s+experience|"
        r"professional\s+work\s+experience|employment\s+(?:history|experience)|"
        r"work\s+history)\s*:?[\s-]*$",
        re.I,
    )

    blocks = []
    for i, line in enumerate(lines):
        if not professional_header.match(line.strip()):
            continue

        block_lines = []
        j = i + 1
        while j < len(lines) and len(block_lines) < 80:
            current = lines[j].strip()
            if _looks_like_section_heading(current) or _SECTION_STOP_PATTERN.match(current):
                break
            if current:
                block_lines.append(current)
            j += 1

        if block_lines:
            blocks.append("\n".join(block_lines))

    # No professional/work experience section means no professional experience.
    if not blocks:
        return []

    intervals = []
    for block in blocks:
        for m in _DATE_RANGE_PATTERN.finditer(block):
            start = _parse_date_token(m.group("start"))
            end = _parse_date_token(m.group("end"), True)
            if start and end and end >= start:
                intervals.append((start, end))

    if not intervals:
        return []

    # Merge overlapping/adjacent employment periods so the same employment
    # period is never counted twice.
    intervals.sort()
    merged = []
    for start, end in intervals:
        if not merged:
            merged.append([start, end])
            continue

        previous_start, previous_end = merged[-1]
        previous_end_month = previous_end[0] * 12 + previous_end[1]
        current_start_month = start[0] * 12 + start[1]

        if current_start_month <= previous_end_month + 1:
            if end > previous_end:
                merged[-1][1] = end
        else:
            merged.append([start, end])

    months = sum(_months_between(start, end) for start, end in merged)
    years = months / 12
    return [f"{years:.1f} years" if years % 1 else f"{int(years)} years"]


def _normalize_skill_token(value: str) -> str:
    value = re.sub(r"\s+", " ", str(value)).strip(" .:-–—")
    value = value.replace("problem -solving", "problem-solving")

    # Canonical display names for skills. This keeps skills_raw and
    # skills_cleaned consistent even when the PDF/NER model returns mixed case.
    canonical = {
        "bootstrap": "Bootstrap",
        "cnn": "CNN",
        "css": "CSS",
        "django": "Django",
        "github": "GitHub",
        "google colab": "Google Colab",
        "html": "HTML",
        "java": "Java",
        "javascript": "JavaScript",
        "jupyter": "Jupyter",
        "jupyter notebooks": "Jupyter Notebooks",
        "keras": "Keras",
        "linux": "Linux",
        "matplotlib": "Matplotlib",
        "mysql": "MySQL",
        "numpy": "NumPy",
        "operating systems": "Operating Systems",
        "pandas": "Pandas",
        "python": "Python",
        "sublime": "Sublime",
        "tensorflow": "TensorFlow",
        "windows": "Windows",
        "opencv": "OpenCV",
        "flask": "Flask",
        "fastapi": "FastAPI",
        "react": "React",
        "react.js": "React.js",
        "node.js": "Node.js",
        "sql": "SQL",
        "git": "Git",
        "vs code": "VS Code",
        "scikit-learn": "scikit-learn",
        "machine learning": "Machine Learning",
        "deep learning": "Deep Learning",
        "natural language processing": "Natural Language Processing",
        "nlp": "NLP",
        "aws": "AWS",
        "azure": "Azure",
        "gcp": "GCP",
    }
    return canonical.get(value.lower(), value)


def _recover_known_skills_from_text(text: str) -> set:
    """Recover only recognized skill terms from a noisy Skills span.

    This is deliberately conservative.  When a model span contains a whole
    sentence, we do NOT treat every noun as a skill.  We only recover terms
    from a general-purpose skill vocabulary and common technical-name patterns.
    """
    found = set()
    normalized = re.sub(r"\s+", " ", text).strip()
    lower = normalized.lower()

    # Longest-first prevents "react" from being selected before "react.js",
    # and "problem solving" from being selected before a longer phrase.
    for term in sorted(_KNOWN_SKILL_TERMS, key=len, reverse=True):
        pattern = rf"(?<![A-Za-z0-9+#.]){re.escape(term)}(?![A-Za-z0-9+#.])"
        if re.search(pattern, lower, re.I):
            canonical = term
            aliases = {
                "java script": "JavaScript", "reactjs": "React.js", "react": "React",
                "nodejs": "Node.js", "express": "Express.js", "html5": "HTML5",
                "css3": "CSS3", "sklearn": "scikit-learn", "jupyter": "Jupyter",
                "visual studio code": "VS Code", "rest api": "REST API", "rest apis": "REST APIs",
                "restful api": "REST API", "problem solving": "problem-solving",
                "object-oriented programming": "Object-Oriented Programming",
                "object oriented programming": "Object-Oriented Programming",
            }
            canonical = aliases.get(canonical, canonical)
            # Normal display casing for common one-word skills.
            casing = {
                "python":"Python", "java":"Java", "javascript":"JavaScript", "c":"C",
                "c++":"C++", "c#":"C#", "html":"HTML", "css":"CSS", "sql":"SQL",
                "git":"Git", "github":"GitHub", "mysql":"MySQL", "mongodb":"MongoDB",
                "pandas":"Pandas", "numpy":"NumPy", "matplotlib":"Matplotlib",
                "tensorflow":"TensorFlow", "keras":"Keras", "pytorch":"PyTorch",
                "flask":"Flask", "fastapi":"FastAPI", "django":"Django", "angular":"Angular",
                "typescript":"TypeScript", "power bi":"Power BI", "microsoft office":"Microsoft Office",
                "linux":"Linux", "windows":"Windows", "docker":"Docker", "kubernetes":"Kubernetes",
                "communication":"Communication", "communicator":"Communicator", "teamwork":"Teamwork",
                "leadership":"Leadership", "adaptability":"Adaptability", "collaboration":"Collaboration",
                "debugging":"Debugging", "testing":"Testing", "test automation":"Test Automation",
            }
            found.add(casing.get(canonical.lower(), canonical))

    # Technical names with strong syntactic signals can be recovered without
    # an exhaustive vocabulary (e.g. an unseen Foo.js library).
    for m in re.finditer(r"\b[A-Za-z][A-Za-z0-9]*(?:\.js|\.py|\.net)\b", normalized):
        token = m.group(0)
        if len(token) <= 35:
            found.add(token)
    for m in re.finditer(r"\b[A-Z]{2,}(?:\d+)?\b", normalized):
        token = m.group(0)
        if token.lower() in {"and", "the", "with", "from", "this", "that", "skills"}:
            continue
        if token in {"DBMS", "SQL", "OOPS", "HTML", "CSS", "API", "AWS", "GCP", "AWS"}:
            found.add(token)

    return found


def extract_individual_skills(raw_skill_blocks: list, known_locations: list = None) -> list:
    """Return a conservative, clean skill list from noisy NER/header spans.

    The key rule is precision over guessing: a sentence inside a Skills span is
    not automatically a list of skills.  Known skill terms are recovered, while
    email addresses, locations, section headings, certifications and ordinary
    prose are discarded.
    """
    individual_skills = set()
    location_words = set(_STATE_WORDS)
    for loc in (known_locations or []):
        location_words.update(w.lower() for w in re.findall(r"[A-Za-z]+", loc))

    for block in raw_skill_blocks:
        if not block:
            continue
        block_lines = block.split("\n")
        truncated_lines = []
        for line in block_lines:
            stripped = line.strip()
            if _SECTION_STOP_PATTERN.match(stripped) or _NON_SKILL_SECTION_LINE_PATTERN.match(stripped):
                break
            if _EMAIL_PATTERN.search(stripped):
                # Never let contact information enter skill processing.
                stripped = _EMAIL_PATTERN.sub(" ", stripped)
            truncated_lines.append(stripped)
        block = "\n".join(truncated_lines)

        # First recover explicit skill terms from the whole block.  This is what
        # makes prose-like soft-skill lines safe and prevents words such as
        # "efficiency" from being invented as skills.
        individual_skills.update(_recover_known_skills_from_text(block))

        # Then process short list-like pieces.  This preserves uncommon but
        # clearly list-shaped skills that the vocabulary may not know.
        block = _CATEGORY_BOUNDARY_PATTERN.sub(lambda m: "\n" + m.group(0), block)
        pieces = _SPLIT_PATTERN.split(block)
        for piece in pieces:
            piece = _normalize_skill_token(piece)
            piece = _BULLET_PATTERN.sub("", piece)
            piece = _COLON_LABEL_PATTERN.sub("", piece)
            piece = _HYPHEN_LABEL_PATTERN.sub("", piece)
            piece = _PAREN_SUFFIX_PATTERN.sub("", piece)
            piece = _normalize_skill_token(piece)
            if not piece or len(piece) >= 40:
                continue
            if _EMAIL_PATTERN.search(piece):
                continue
            words = piece.split()
            if len(words) >= 2 and all(len(w) == 1 for w in words):
                piece = "".join(words); words = [piece]
            if len(words) > _MAX_WORDS:
                continue
            if words and words[0].lower() in _LEADING_REJECT_WORDS:
                continue
            if piece.lower() in _NONSKILL_WHOLE_WORDS or piece.lower() in _BARE_CATEGORY_LABELS:
                continue
            if words and all(w.lower() in _SPOKEN_LANGUAGE_WORDS for w in words):
                continue
            if words and any(w.lower() in location_words for w in words):
                continue
            if re.search(r"\b(?:and|the|with|using|to|for|from|that|which|this|achieved|developed|deployed|implemented|passionate|experience|responsibilities|responsibility|candidate|applicants?|tasks?|project|screen(?:ing)?|matching|collaboration|integration|completion|fostering|impactful|efficiency|results?)\b", piece, re.I):
                # A single known skill is already recovered above; don't accept
                # an entire prose fragment just because it contains a skill.
                continue
            if re.search(r"\b(?:by|in|on)\s+(?:20\d{2}|19\d{2})\b", piece, re.I) or re.search(r"\d+%", piece):
                continue
            # Only accept unknown pieces if they have a strong technical-name
            # signature.  This is what keeps arbitrary English out of the list.
            if re.search(r"(?:\.js|\.py|\.net)$", piece, re.I) or re.fullmatch(r"[A-Z]{2,}(?:\d+)?", piece):
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


def filter_false_name_values(names: list) -> list:
    result = []
    bad = set(_BARE_CATEGORY_LABELS) | {
        "academic coursework", "coursework", "salesforce certified", "certifications",
        "experience", "projects", "education", "languages", "soft skills",
        "skill set", "technical skills", "professional skills", "key skills",
        "core skills", "technical competencies", "professional competencies",
        "technical proficiency", "professional proficiency", "areas of expertise",
    }
    for name in names:
        n = re.sub(r"\s+", " ", str(name)).strip()
        if not n or n.lower() in bad:
            continue
        if _EMAIL_PATTERN.search(n):
            continue
        if len(n) > 60 or len(n.split()) > 6:
            continue
        result.append(n)
    return sorted(set(result))


def filter_false_designations(designations: list) -> list:
    result = []
    bad_words = _BARE_CATEGORY_LABELS | {"academic coursework", "coursework", "salesforce certified"}
    for value in designations:
        d = re.sub(r"\s+", " ", str(value)).strip()
        dl = d.lower()
        if not d or _EMAIL_PATTERN.search(d):
            continue
        if dl in bad_words or len(d.split()) > 8:
            continue
        if any(w in dl for w in ("technical skills", "soft skills", "programming languages", "academic coursework")):
            continue
        # If the NER model labeled a pure skills list as a designation, reject
        # it.  This catches spans such as "Microsoft Office Power BI GitHub".
        # Remove known multi-word skill phrases from the candidate value; if
        # nothing meaningful remains, it was almost certainly a skills span.
        residue = dl
        for term in sorted(_KNOWN_SKILL_TERMS, key=len, reverse=True):
            residue = re.sub(rf"(?<![a-z0-9+#.]){re.escape(term.lower())}(?![a-z0-9+#.])", " ", residue)
        residue = re.sub(r"[ ,/|&+.-]+", " ", residue).strip()
        if not residue:
            continue
        result.append(d)
    return sorted(set(result))


def sanitize_skill_raw_blocks(raw_blocks: list, known_locations: list = None) -> list:
    """Keep the raw field useful to API consumers without leaking prose.

    ``skills_raw`` remains an array of source blocks, but each block is reduced
    to the actual skill terms recoverable from that block.  This prevents a
    model span such as ``"Proficient communicator ... impactful results"``
    from being exposed as if the whole sentence were a skill list.
    """
    clean_blocks = []
    for block in raw_blocks or []:
        skills = extract_individual_skills([block], known_locations=known_locations)
        if skills:
            clean_blocks.append("\n".join(skills))
    # Preserve order while removing duplicate blocks.
    result = []
    seen = set()
    for block in clean_blocks:
        key=block.lower()
        if key not in seen:
            seen.add(key); result.append(block)
    return result


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

    # Prefer the document's explicitly labelled skills section for BOTH raw and
    # cleaned skills. The NER model is useful as a fallback, but its span
    # boundaries are not reliable enough to be authoritative: on some resumes
    # it labels project descriptions, certifications, or entire neighbouring
    # sections as ``Skills``. If a real skills header exists, using it prevents
    # that cross-section contamination by construction.
    if header_scanned_sections:
        raw_profile["skills_raw"] = header_scanned_sections
        cleaned_from_headers = extract_individual_skills(
            header_scanned_sections, known_locations=raw_profile["location"]
        )
        raw_profile["skills_cleaned"] = sorted(set(cleaned_from_headers))
    else:
        cleaned_from_ner = extract_individual_skills(
            raw_profile["skills_raw"], known_locations=raw_profile["location"]
        )
        raw_profile["skills_cleaned"] = sorted(set(cleaned_from_ner))

    # Expose the final validated individual skills in BOTH fields.
    # This prevents raw NER/header blocks such as "CSS Django GitHub ..."
    # from appearing as one giant skill entry.
    if header_scanned_sections:
        final_skills = extract_individual_skills(
            header_scanned_sections, known_locations=raw_profile["location"]
        )
    else:
        final_skills = extract_individual_skills(
            raw_profile["skills_raw"], known_locations=raw_profile["location"]
        )

    # Canonicalize and deduplicate case-insensitively.
    skill_map = {}
    for skill in final_skills:
        skill = _normalize_skill_token(skill)
        if not skill:
            continue
        key = skill.lower()
        if key not in skill_map:
            skill_map[key] = skill

    # Targeted recovery for CNN. Some Navya-style resumes mention CNN in a
    # project/AI skills line that the section scanner can miss, while the
    # actual skill is still explicitly present in the document. Recover only
    # this known ML skill instead of scanning the whole resume for every
    # possible skill (which could incorrectly add project-only technologies).
    if re.search(r"(?<![A-Za-z0-9])cnn(?![A-Za-z0-9])", text, re.I):
        skill_map.setdefault("cnn", "CNN")

    final_skills = sorted(skill_map.values(), key=str.lower)
    raw_profile["skills_raw"] = final_skills
    raw_profile["skills_cleaned"] = final_skills

    experience_fallback = extract_experience_fallback(text)
    if experience_fallback:
        raw_profile["years_of_experience"] = experience_fallback

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
    raw_profile["designation"] = filter_false_designations(raw_profile["designation"])
    raw_profile["name"] = filter_false_name_values(raw_profile["name"])

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
    years_experience = None
    if profile.get("years_of_experience"):
        m = re.search(r"(\d+(?:\.\d+)?)", profile["years_of_experience"][0])
        if m:
            years_experience = float(m.group(1))
            if years_experience.is_integer():
                years_experience = int(years_experience)

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
        "years_experience": years_experience,
    }
