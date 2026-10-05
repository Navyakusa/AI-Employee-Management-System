"""
Resume Parsing / NER (Module 5)

Takes raw resume text and returns a structured profile.

Main responsibilities:
    - spaCy NER extraction
    - Technical Skills section extraction
    - Education section extraction
    - Degree extraction
    - College extraction
    - Graduation year extraction
    - Experience extraction
    - Email/name fallback extraction
    - Skill normalization and cleanup

Important:
    The trained NER model is still used.
    Deterministic section parsing is used as a reliable complement
    so that Technical Skills does not get swallowed by Education/Degree.
"""

import os
import re
import spacy


# ============================================================================
# MODEL
# ============================================================================

_MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "models",
    "resume_ner_model"
)

nlp = spacy.load(_MODEL_PATH)


# ============================================================================
# NER LABEL -> API FIELD
# ============================================================================

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


# ============================================================================
# BASIC REGEX / TOKEN CONFIGURATION
# ============================================================================

_COLON_LABEL_PATTERN = re.compile(
    r"^[A-Za-z /&]+:\s*"
)

_CATEGORY_LABELS = (
    r"languages?|frameworks?|tools?|databases?|technologies|technology|"
    r"libraries|library|skills?|platforms?|proficiencies|proficient in|"
    r"frontend|backend|front[- ]end|back[- ]end"
)


_HYPHEN_LABEL_PATTERN = re.compile(
    rf"^(?:{_CATEGORY_LABELS})\s*-\s*",
    re.IGNORECASE
)

_BULLET_PATTERN = re.compile(
    r"^[\s\-_*•●○▪◦·‣–—]+"
)

_PAREN_SUFFIX_PATTERN = re.compile(
    r"\s*\([^)]*\)\s*$"
)

_SPLIT_PATTERN = re.compile(
    r"[,;\n\u2022]"
)


# ============================================================================
# FALSE POSITIVE FILTERS
# ============================================================================

_BULLET_PATTERN = re.compile(r"^[-*]\s*")
_PAREN_SUFFIX_PATTERN = re.compile(r"\s*\([^)]*\)\s*$")
# Separators between skills: commas, semicolons, pipes, new lines and the
# bullet characters PDF/DOCX extraction commonly produces (including the
# private-use "\uf0b7"/"\uf0a7" bullets from Word symbol fonts).
_SPLIT_PATTERN = re.compile(
    r"[,;|\n\u2022\u00b7\u25aa\u25ab\u25cf\u25cb\u25e6\u25a0\u25ba\u25b6\u27a2\u27a4\u2713\u2714\u2023\uf0b7\uf0a7\uf076\uf0d8\uf0fc]"
)


_LEADING_REJECT_WORDS = frozenset({
    "and",
    "the",
    "a",
    "an",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
    "as",
    "is",
    "are",
    "using",
    "based",
    "this",
    "that",
    "from",
    "by",
    "at",
    "implementing",
    "implemented",
    "integrating",
    "integrated",
    "viewing",
    "editing",
    "deleting",
    "building",
    "developed",
    "designed",
    "created",
    "added",
    "built",
    "mark",
    "marking",
    "pause",
    "paused",
    "scroll",
    "scrolling",
    "missing",
    "allows",
    "allowing",
    "enables",
    "enabling",
    "fostering",
    "impactful",
    "proficient",
    "and", "the", "a", "an", "of", "to", "in", "on", "for", "with", "as",
    "is", "are", "using", "based", "this", "that", "from", "by", "at",
    "implementing", "implemented", "integrating", "integrated", "viewing",
    "editing", "deleting", "building", "developed", "designed", "created",
    "added", "built", "mark", "marking", "pause", "paused", "scroll",
    "scrolling", "missing", "allows", "allowing", "enables", "enabling",
})

_NONSKILL_WHOLE_WORDS = frozenset({
    "delete",
    "deleting",
    "edit",
    "editing",
    "pause",
    "paused",
    "mark",
    "marking",
    "missing",
    "scroll",
    "scrolling",
    "view",
    "viewing",
    "implement",
    "implementing",
    "implemented",
    "integrate",
    "integrating",
    "integrated",
    "and",
    "the",
    "with",
    "using",
    "declaration",
    "declare",
    "signature",
    "reference",
    "references",
})

_MAX_WORDS = 4


# ============================================================================
# INDIA LOCATION HELPERS
# ============================================================================

_INDIAN_STATES_AND_UTS = (
    "andhra pradesh",
    "arunachal pradesh",
    "assam",
    "bihar",
    "chhattisgarh",
    "goa",
    "gujarat",
    "haryana",
    "himachal pradesh",
    "jharkhand",
    "karnataka",
    "kerala",
    "madhya pradesh",
    "maharashtra",
    "manipur",
    "meghalaya",
    "mizoram",
    "nagaland",
    "odisha",
    "punjab",
    "rajasthan",
    "sikkim",
    "tamil nadu",
    "telangana",
    "tripura",
    "uttar pradesh",
    "uttarakhand",
    "west bengal",
    "delhi",
    "puducherry",
    "chandigarh",
    "jammu",
    "kashmir",
    "ladakh",
)

_STATE_WORDS = frozenset(
    word
    for state in _INDIAN_STATES_AND_UTS
    for word in state.split()
)


# ============================================================================
# SPOKEN LANGUAGE FILTER
# ============================================================================

_SPOKEN_LANGUAGE_WORDS = frozenset({
    "english",
    "hindi",
    "telugu",
    "tamil",
    "kannada",
    "malayalam",
    "marathi",
    "bengali",
    "gujarati",
    "punjabi",
    "urdu",
    "odia",
    "assamese",
    "sanskrit",
    "french",
    "german",
    "spanish",
    "chinese",
    "japanese",
    "korean",
    "arabic",
    "russian",
    "portuguese",
    "italian",
    "mandarin",
    "konkani",
    "sindhi",
})


# ============================================================================
# CATEGORY LABELS
# ============================================================================

_BARE_CATEGORY_LABELS = frozenset({
    "languages",
    "language",
    "skills",
    "skill",
    "tools",
    "tool",
    "frameworks",
    "framework",
    "databases",
    "database",
    "technologies",
    "technology",
    "libraries",
    "library",
    "platforms",
    "platform",
    "proficiencies",
})


# ============================================================================
# KNOWN SKILLS
# ============================================================================
#
# This vocabulary is NOT replacing the trained NER model.
# It is used to recover explicit skills from the Technical Skills
# section and to prevent technical skill lists from being mistaken
# for section headings.
#
# Added/ensured:
#   DSA
#   ReactJS
#   NodeJS
#   ExpressJS
#   Figma
#   VS Code
# ============================================================================

_KNOWN_SKILL_TERMS = frozenset({

    # ------------------------------------------------------------------------
    # Programming languages / Web
    # ------------------------------------------------------------------------

    "python",
    "java",
    "c",
    "c++",
    "c#",
    "go",
    "golang",
    "ruby",
    "php",

    "javascript",
    "java script",
    "typescript",
    "kotlin",
    "swift",

    "html",
    "html5",
    "css",
    "css3",

    "sql",
    "r",
    "bash",
    "shell scripting",

    # ------------------------------------------------------------------------
    # Computer Science / Data / Databases
    # ------------------------------------------------------------------------

    "dsa",
    "oops",
    "object oriented programming",
    "object-oriented programming",
    "data structures",
    "data structures and algorithms",
    "algorithms",
    "dbms",
    "computer networks",
    "operating systems",

    "mysql",
    "postgresql",
    "oracle",
    "mongodb",
    "sqlite",
    "redis",
    "nosql",

    "pandas",
    "numpy",
    "matplotlib",
    "seaborn",

    "scikit-learn",
    "sklearn",
    "tensorflow",
    "keras",
    "pytorch",
    "opencv",

    "nlp",
    "natural language processing",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "generative ai",

    "bert",
    "roberta",
    "cnn",
    "rnn",
    "llm",

    "power bi",
    "tableau",
    "excel",

    # ------------------------------------------------------------------------
    # Frameworks / Libraries / Development
    # ------------------------------------------------------------------------

    "react",
    "react.js",
    "reactjs",

    "angular",

    "vue",
    "vue.js",

    "node",
    "node.js",
    "nodejs",

    "express",
    "express.js",
    "expressjs",

    "flask",
    "fastapi",
    "django",

    "spring",
    "spring boot",

    "bootstrap",
    "tailwind",
    "tailwind css",

    "rest api",
    "rest apis",
    "restful api",

    "jwt",

    # ------------------------------------------------------------------------
    # Tools
    # ------------------------------------------------------------------------

    "git",
    "github",
    "gitlab",
    "bitbucket",

    "docker",
    "kubernetes",

    "linux",
    "windows",

    "vs code",
    "visual studio code",

    "jupyter",
    "jupyter notebooks",
    "google colab",
    "postman",

    "android studio",
    "sublime",
    "figma",

    "microsoft office",

    # ------------------------------------------------------------------------
    # Cloud
    # ------------------------------------------------------------------------

    "aws",
    "azure",
    "gcp",
    "vercel",
    "firebase",

    # ------------------------------------------------------------------------
    # Software / Engineering
    # ------------------------------------------------------------------------

    "api integration",
    "frontend development",
    "front-end development",
    "backend development",
    "back-end development",
    "web development",

    "ui/ux",
    "responsive design",
    "version control",

    "debugging",
    "testing",
    "test automation",

    "data analysis",
    "data analytics",
    "data visualization",
    "reporting",
    "forecasting",

    # ------------------------------------------------------------------------
    # Soft skills
    # ------------------------------------------------------------------------

    "communication",
    "communicator",
    "interpersonal skills",
    "teamwork",
    "leadership",
    "adaptability",
    "problem solving",
    "problem-solving",
    "collaboration",
    "time management",
    "critical thinking",
    "quick learning",
    "learning agility",
    "decision making",
    "decision-making",
    "presentation skills",
    "organizational skills",
})


_SOFT_SKILL_PHRASES = (
    "interpersonal skills",
    "problem-solving",
    "problem solving",
    "time management",
    "critical thinking",
    "quick learning",
    "learning agility",
    "decision-making",
    "decision making",
    "presentation skills",
    "organizational skills",
    "communication",
    "teamwork",
    "leadership",
    "adaptability",
    "collaboration",
    "debugging",
)


# ============================================================================
# SKILLS SECTION HEADERS
# ============================================================================
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

# One list of section names, used by every part of this module (header
# detection, the stop check, and _restore_section_breaks), so adding a new
# heading here makes it work everywhere at once.
#
# Headings under which the content is a list of technical skills. Includes
# the many ways real resumes title this section ("Tech Stack", "Programming
# Skills", "Relevant Coursework" -- the last is where freshers usually list
# DBMS / OOPS / Computer Networks / Operating Systems).
_SKILL_SECTION_NAMES = (
    "technical skills", "technical skill set", "key skills", "core skills",
    "professional skills", "relevant skills", "soft skills", "programming skills",
    "computer skills", "it skills", "software skills", "skills and tools",
    "skills & tools", "skills and technologies", "skills & technologies",
    "tools and technologies", "tools & technologies", "technical proficiency",
    "technical proficiencies", "technical expertise", "technical knowledge",
    "technical summary", "tech stack", "technology stack", "skill set", "skillset",
    "skills", "areas of expertise", "core competencies", "competencies",
    "expertise", "relevant coursework", "coursework", "core subjects",
    "relevant courses", "areas of interest",
)

# Headings that START A DIFFERENT section (the skills scan stops at these).
# "Languages" is listed here as a standalone heading (spoken languages), but
# _restore_section_breaks never splits it out of a line, because inside a
# skills section "Languages: Python, Java" is a sub-label.
_OTHER_SECTION_NAMES = (
    "work experience", "professional experience", "employment history",
    "experience", "academic details", "academic background",
    "academic qualifications", "educational qualifications",
    "educational background", "education", "qualifications",
    "academic projects", "personal projects", "key projects", "major projects",
    "mini projects", "projects", "certifications", "certification",
    "certificates", "courses and certifications", "achievements",
    "accomplishments", "awards", "internships", "internship", "declaration",
    "hobbies", "interests", "extra-curricular activities",
    "extracurricular activities", "co-curricular activities", "activities",
    "personal details", "personal information", "personal profile",
    "career objective", "objective", "professional summary", "profile summary",
    "summary", "profile", "about me", "publications", "strengths", "references",
    "workshops", "trainings", "training", "languages known",
    "positions of responsibility", "volunteer experience", "volunteering",
    "contact details", "contact information",
)


def _names_alternation(names) -> str:
    """Regex alternation for a list of section names, longest first, with
    any run of whitespace allowed between words."""
    return "|".join(
        r"\s+".join(re.escape(w) for w in name.split())
        for name in sorted(set(names), key=len, reverse=True)
    )


_SKILLS_HEADER_PATTERN = re.compile(
    r"^\s*(?:" + _names_alternation(_SKILL_SECTION_NAMES) + r")(?![A-Za-z])\s*:?\s*",
    re.IGNORECASE,
)



_INLINE_SKILLS_HEADER_PATTERN = re.compile(
    r"\b(?:"
    r"technical\s+skills?"
    r"|key\s+skills?"
    r"|core\s+skills?"
    r"|professional\s+skills?"
    r"|relevant\s+skills?"
    r"|skills?\s+set"
    r"|skill\s+set"
    r"|skills?\s*&\s*(?:expertise|competencies|technologies)"
    r"|skills?\s+and\s+(?:expertise|competencies|technologies)"
    r"|areas?\s+of\s+expertise"
    r"|technical\s+competenc(?:y|ies)"
    r"|technical\s+proficienc(?:y|ies)"
    r"|technical\s+expertise"
    r"|tools?\s*&\s*technologies"
    r"|core\s+competenc(?:y|ies)"
    r"|core\s+proficienc(?:y|ies)"
    r")\b\s*:?",
    re.IGNORECASE,
)


# ============================================================================
# GENERAL RESUME SECTION STOP PATTERN
# ============================================================================

_SECTION_STOP_PATTERN = re.compile(
    r"^\s*(?:"
    r"declaration"
    r"|projects?"
    r"|experience"
    r"|work\s+experience"
    r"|education"
    r"|certifications?"
    r"|references?"
    r"|achievements?"
    r"|hobbies"
    r"|interests?"
    r"|extra[\s-]?curricular"
    r"|personal\s+(?:details|information)"
    r"|objective"
    r"|career\s+objective"
    r"|summary"
    r"|profile"
    r"|publications?"
    r"|awards?"
    r"|internships?"
    r"|academic\s+(?:details|background)"
    r"|languages?"
    r"|date\s+of\s+birth"
    r"|dob"
    r"|father'?s\s+name"
    r"|mother'?s\s+name"
    r"|marital\s+status"
    r"|nationality"
    r"|gender"
    r")\s*:?\s*$",
    re.IGNORECASE,
)


_NON_SKILL_SECTION_LINE_PATTERN = re.compile(
    r"^\s*(?:"
    r"academic\s+coursework"
    r"|coursework"
    r"|participation(?:\s*&|\s+and)?\s+certifications?"
    r"|certifications?"
    r"|certificates?"
    r"|achievements?"
    r"|experience(?:\s*&|\s+and)?\s+internships?"
    r"|professional\s+experience"
    r"|work\s+experience"
    r"|projects?"
    r"|education"
    r"|declaration"
    r"|references?"
    r"|objective"
    r"|career\s+objective"
    r"|summary"
    r"|profile"
    r"|personal\s+(?:details|information)"
    r"|contact(?:\s+details?)?"
    r")\s*:?.*$",
    re.IGNORECASE,
)


# ============================================================================
# CATEGORY BASED SKILLS
# ============================================================================

_CATEGORY_BOUNDARY_PATTERN = re.compile(
    r"\b(?:"
    r"programming\s+languages?"
    r"|languages?"
    r"|frameworks?\s*(?:&|and)\s*libraries?"
    r"|frameworks?"
    r"|libraries?"
    r"|databases?"
    r"|tools?"
    r"|ui\s+development"
    r"|web\s+technologies?"
    r"|computer\s+science\s+fundamentals?"
    r"|data\s+analytics"
    r"|ai\s*(?:&|and)\s*machine\s+learning"
    r"|machine\s+learning"
    r"|deep\s+learning"
    r"|operating\s+systems?"
    r"|version\s+control"
    r"|cloud"
    r"|platforms?"
    r"|soft\s+skills?"
    r"|technical\s+skills?"
    r")\s*[:\-]\s*",
    re.IGNORECASE,
)


_STANDALONE_SKILL_CATEGORY_PATTERN = re.compile(
    r"^\s*(?:"
    r"programming\s+languages?"
    r"|languages?"
    r"|frameworks?\s*(?:&|and)\s*libraries?"
    r"|frameworks?"
    r"|libraries?"
    r"|databases?"
    r"|tools?"
    r"|ui\s+development"
    r"|web\s+technologies?"
    r"|computer\s+science\s+fundamentals?"
    r"|data\s+analytics"
    r"|ai\s*(?:&|and)\s*machine\s+learning"
    r"|machine\s+learning"
    r"|deep\s+learning"
    r"|operating\s+systems?"
    r"|version\s+control"
    r"|cloud"
    r"|platforms?"
    r"|soft\s+skills?"
    r"|technical\s+skills?"
    r")\s*:?\s*$",
    re.IGNORECASE,
)


# ============================================================================
# EXPERIENCE / DATE
# ============================================================================

_EXPLICIT_EXPERIENCE_PATTERN = re.compile(
    r"(?<!\w)(\d+(?:\.\d+)?)\s*\+?\s*"
    r"(?:years?|yrs?)"
    r"(?:\s+of\s+(?:professional\s+)?experience)?\b",
    re.IGNORECASE,
)

_EXPLICIT_MONTH_PATTERN = re.compile(
    r"(?<!\w)(\d+(?:\.\d+)?)\s*"
    r"(?:months?|mos?)"
    r"(?:\s+of\s+experience)?\b",
    re.IGNORECASE,
)

_DATE_RANGE_PATTERN = re.compile(
    r"(?P<start>"
    r"(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|"
    r"jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|"
    r"oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s,\-./]*\d{4}"
    r"|\b\d{4})"
    r"\s*(?:-|–|—|to|until)\s*"
    r"(?P<end>"
    r"(?:present|current|now)"
    r"|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|"
    r"jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|"
    r"oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s,\-./]*\d{4}"
    r"|\b\d{4})",
    re.IGNORECASE,
)

_MONTHS = {
    m.lower(): i
    for i, m in enumerate(
        "January February March April May June July August September October November December".split(),
        1,
    )
}

_MONTH_ALIASES = {
    **_MONTHS,
    **{m[:3]: n for m, n in _MONTHS.items()},
}

_MAX_SECTION_LINES = 40


# ============================================================================
# SECTION HEADING DETECTION
# ============================================================================

def _looks_like_section_heading(line: str) -> bool:
    """
    Detect genuine resume section headings.

    IMPORTANT FIX:

    A line such as:

        PYTHON JAVA DSA HTML CSS

    must NOT be interpreted as a section heading.

    A line such as:

        PROFESSIONAL EXPERIENCE

    or:

        PROJECTS

    SHOULD be interpreted as a section heading.
    """

    line = line.strip().strip(" :|-")

    if not line:
        return False

    if len(line) > 70:
        return False

    if any(ch in line for ch in ".,;!?"):
        return False

    normalized = re.sub(
        r"\s+",
        " ",
        line,
    ).strip()

    lower = normalized.lower()

    # ------------------------------------------------------------------------
    # Explicit known section headings
    # ------------------------------------------------------------------------

    known_headings = {
        "profile",
        "summary",
        "objective",
        "career objective",

        "education",
        "academic details",
        "academic background",
        "qualifications",

        "experience",
        "work experience",
        "professional experience",
        "professional work experience",
        "employment history",
        "employment experience",

        "internship",
        "internships",

        "projects",
        "project",

        "certifications",
        "certification",
        "certificates",

        "achievements",
        "achievement",

        "participation",

        "references",
        "declaration",

        "skills",
        "skill",
        "skill set",

        "technical skills",
        "professional skills",
        "key skills",
        "core skills",
        "relevant skills",

        "personal details",
        "personal information",

        "extra curricular",
        "extracurricular",

        "publications",
        "awards",

        "hobbies",
        "interests",
        "languages",

        "soft skills",

        "technical competencies",
        "professional competencies",

        "technical proficiency",
        "professional proficiency",

        "areas of expertise",
    }

    if lower in known_headings:
        return True

    # ------------------------------------------------------------------------
    # ALL-CAPS handling
    # ------------------------------------------------------------------------

    words = normalized.split()

    letters = [
        c
        for c in normalized
        if c.isalpha()
    ]

    if words and letters and all(
        len(word) == 1 or word.isupper()
        for word in words
    ):

        # Example:
        #
        # PYTHON JAVA DSA HTML CSS
        #
        # Every token is a known skill, therefore this is SKILL CONTENT,
        # not a section heading.

        normalized_skill_words = [
            word.strip(
                "()[]{}|/:;-"
            ).lower()
            for word in words
        ]

        if (
            normalized_skill_words
            and all(
                word in _KNOWN_SKILL_TERMS
                for word in normalized_skill_words
            )
        ):
            return False

        # Multi-word ALL-CAPS phrases are normally section headings.
        if len(words) >= 2:
            return True

        # Single ALL-CAPS word:
        #
        # PROJECTS -> heading
        # EDUCATION -> heading
        # PYTHON -> skill
        # JAVA -> skill
        #
        if len(letters) >= 6:
            if normalized.lower() not in _KNOWN_SKILL_TERMS:
                return True

    return lower in known_headings


# ============================================================================
# SKILL TEXT AFTER INLINE HEADER
# ============================================================================

# Lines matching any of these mark the START of a DIFFERENT section -- the
# skills-section scan stops as soon as one of these appears, so it doesn't
# run on into unrelated content (education, a declaration statement, personal
# details like date of birth, etc.). The line must contain ONLY the heading.
_SECTION_STOP_PATTERN = re.compile(
    r"^\s*(?:" + _names_alternation(_OTHER_SECTION_NAMES) + r"|"
    r"languages?|date\s+of\s+birth|dob|father'?s\s+name|mother'?s\s+name|"
    r"marital\s+status|nationality|gender)\s*:?\s*$",
    re.IGNORECASE,
)

_MAX_SECTION_LINES = 20  # safety cap so a missing stop-header can't run away

def _capture_skill_text_after_match(
    text: str,
    match_end: int,
) -> str:

    remainder = text[match_end:]
    stop = re.search(
        r"\b(?:"
        r"participation\s*(?:&|and)\s*certifications?"
        r"|certifications?"
        r"|achievements?"
        r"|experience\s*(?:&|and)\s*internships?"
        r"|work\s+experience"
        r"|projects?"
        r"|education"
        r"|academic\s+(?:details|background)"
        r"|declaration"
        r"|references?"
        r"|personal\s+(?:details|information)"
        r"|career\s+objective"
        r"|objective"
        r"|summary"
        r"|profile"
        r"|publications?"
        r"|awards?"
        r"|hobbies"
        r"|interests?"
        r")\b\s*:?(?=\s|$)",
        remainder,
        re.IGNORECASE,
    )

    if stop:
        remainder = remainder[
            :stop.start()
        ]

    return remainder.strip(
        " \n\r|:-"
    )


# ============================================================================
# FIND TECHNICAL SKILLS SECTION
# ============================================================================

def _find_skills_sections_by_header(full_text: str) -> list:
    """
    Find Technical Skills independently from NER.

    This is the critical fix for the reported problem.

    Example:

        EDUCATION

        B.Tech...
        College...

        TECHNICAL SKILLS

        Python
        Java
        DSA
        HTML
        CSS
        Bootstrap
        JavaScript
        ReactJS
        NodeJS
        ExpressJS
        Flask
        SQL
        MongoDB
        GitHub
        Figma
        VS Code

        PROJECTS

    Education stops at TECHNICAL SKILLS.
    Skills stop at PROJECTS.
    """

    sections = []

    lines = full_text.split("\n")

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

        match = _SKILLS_HEADER_PATTERN.match(
            stripped
        )

        if not match:
            i += 1
            continue

        captured = []

        # --------------------------------------------------------------------
        # Same-line skills
        #
        # TECHNICAL SKILLS: Python, Java, SQL
        # --------------------------------------------------------------------

        trailing = stripped[
            match.end():
        ].strip()

        if trailing:
            captured.append(trailing)

        j = i + 1

        while (
            j < len(lines)
            and len(captured) < _MAX_SECTION_LINES
        ):

            line = lines[j].strip()

            if not line:
                j += 1
                continue

            # ----------------------------------------------------------------
            # Hard stop at another major section
            # ----------------------------------------------------------------

            if _SECTION_STOP_PATTERN.match(line):
                break

            if _NON_SKILL_SECTION_LINE_PATTERN.match(line):
                break

            # ----------------------------------------------------------------
            # If the line looks like a heading, determine whether it is
            # actually a list of known skills.
            # ----------------------------------------------------------------

            if _looks_like_section_heading(line):

                words = re.sub(
                    r"\s+",
                    " ",
                    line,
                ).split()

                normalized_words = [
                    word.strip(
                        "()[]{}|/:;-"
                    ).lower()
                    for word in words
                ]

                all_known_skills = (
                    bool(normalized_words)
                    and all(
                        word in _KNOWN_SKILL_TERMS
                        for word in normalized_words
                    )
                )

                # If it isn't a skill list, this is a real section heading.
                if not all_known_skills:
                    break

            # ----------------------------------------------------------------
            # Never consume contact details
            # ----------------------------------------------------------------

            if _EMAIL_PATTERN.search(line):
                break

            captured.append(line)

            j += 1

        if captured:
            sections.append(
                "\n".join(captured)
            )

        i = max(
            j,
            i + 1,
        )

    # =========================================================================
    # INLINE FALLBACK
    # =========================================================================

    if not sections:

        for match in _INLINE_SKILLS_HEADER_PATTERN.finditer(
            full_text
        ):

            block = _capture_skill_text_after_match(
                full_text,
                match.end(),
            )

            if block:
                sections.append(block)

    # =========================================================================
    # CATEGORY-BASED FALLBACK
    # =========================================================================

    if not sections:

        lines = full_text.split("\n")

        category_indexes = [
            index
            for index, line in enumerate(lines)
            if _STANDALONE_SKILL_CATEGORY_PATTERN.match(
                line.strip()
            )
        ]

        if category_indexes:

            captured_blocks = []

            for position, start_index in enumerate(
                category_indexes
            ):

                if position + 1 < len(category_indexes):
                    end_index = category_indexes[
                        position + 1
                    ]
                else:
                    end_index = len(lines)

                captured = []

                for line in lines[
                    start_index + 1:end_index
                ]:

                    stripped = line.strip()

                    if not stripped:
                        continue

                    if _NON_SKILL_SECTION_LINE_PATTERN.match(
                        stripped
                    ):
                        break

                    if _SECTION_STOP_PATTERN.match(
                        stripped
                    ):
                        break

                    if _looks_like_section_heading(
                        stripped
                    ):

                        words = stripped.split()

                        normalized_words = [
                            word.strip(
                                "()[]{}|/:;-"
                            ).lower()
                            for word in words
                        ]

                        all_known_skills = (
                            bool(normalized_words)
                            and all(
                                word in _KNOWN_SKILL_TERMS
                                for word in normalized_words
                            )
                        )

                        if not all_known_skills:
                            break

                    if _EMAIL_PATTERN.search(
                        stripped
                    ):
                        break

                    captured.append(
                        stripped
                    )

                if captured:
                    captured_blocks.append(
                        "\n".join(captured)
                    )

            if captured_blocks:
                sections.extend(
                    captured_blocks
                )

    # =========================================================================
    # INLINE CATEGORY FALLBACK
    # =========================================================================

    if not sections:

        matches = list(
            _CATEGORY_BOUNDARY_PATTERN.finditer(
                full_text
            )
        )

        if matches:

            chunks = []

            for index, match in enumerate(
                matches
            ):

                start = match.end()

                if index + 1 < len(matches):
                    end = matches[
                        index + 1
                    ].start()
                else:
                    end = len(full_text)

                chunk = full_text[
                    start:end
                ]

                stop = re.search(
                    r"(?:"
                    r"participation\s*(?:&|and)\s*certifications?"
                    r"|certifications?"
                    r"|experience\s*(?:&|and)\s*internships?"
                    r"|professional\s+experience"
                    r"|work\s+experience"
                    r"|projects?"
                    r"|education"
                    r"|declaration"
                    r"|references?"
                    r"|career\s+objective"
                    r"|objective"
                    r"|summary"
                    r"|profile"
                    r")\b",
                    chunk,
                    re.IGNORECASE,
                )

                if stop:
                    chunk = chunk[
                        :stop.start()
                    ]

                email_match = _EMAIL_PATTERN.search(
                    chunk
                )

                if email_match:
                    chunk = chunk[
                        :email_match.start()
                    ]

                if chunk.strip():
                    chunks.append(
                        chunk.strip()
                    )

            if chunks:
                sections.extend(
                    chunks
                )

    # =========================================================================
    # REMOVE DUPLICATES
    # =========================================================================

    unique_sections = []

    seen = set()

    for section in sections:

        key = re.sub(
            r"\s+",
            " ",
            section,
        ).strip().lower()

        if key and key not in seen:

            seen.add(key)

            unique_sections.append(
                section
            )

    return unique_sections


# ============================================================================
# EMAIL
# ============================================================================

_EMAIL_PATTERN = re.compile(
    r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
)


# ============================================================================
# EDUCATION
# ============================================================================

_EDUCATION_HEADER_PATTERN = re.compile(
    r"^\s*(?:"
    r"academic\s+(?:details|background|qualifications?)\b"
    r"|educational\s+qualifications?\b"
    r"|education\b"
    r"|qualifications?\b"
    r")\s*:?\s*",
    re.IGNORECASE,
)

_COLLEGE_LINE_PATTERN = re.compile(
    r"[^,\n]*\b(?:university|college|institute|polytechnic|vidyalaya|school)\b[^,\n]*",
    re.IGNORECASE,
)


_YEAR_PATTERN = re.compile(
    r"\b(19|20)\d{2}\b"
)


_PRE_UNIVERSITY_INDICATORS = (
    "intermediate",
    "secondary school certificate",
    "matriculation",
    "higher secondary",
    "10th",
    "12th",
    "ssc",
    "hsc",
)


_DEGREE_PATTERN = re.compile(
    r"[^,\n]*\b(?:"
    r"bachelor"
    r"|master"
    r"|b\.?\s?tech"
    r"|m\.?\s?tech"
    r"|b\.?\s?e\b"
    r"|m\.?\s?e\b"
    r"|b\.?\s?sc\b"
    r"|m\.?\s?sc\b"
    r"|b\.?\s?a\b"
    r"|m\.?\s?a\b"
    r"|b\.?\s?com\b"
    r"|m\.?\s?com\b"
    r"|mba"
    r"|mca"
    r"|bca"
    r"|ph\.?d"
    r"|diploma"
    r"|intermediate"
    r"|secondary school certificate"
    r"|higher secondary"
    r"|matriculation"
    r")\b[^,\n]*",
    re.IGNORECASE,
)


# ============================================================================
# NAME FALLBACK
# ============================================================================

_NON_NAME_FIRST_LINES = frozenset({
    "resume",
    "curriculum vitae",
    "cv",
    "bio-data",
    "biodata",
    "profile",
})


# ============================================================================
# EDUCATION SECTION
# ============================================================================

def _find_education_section(
    full_text: str,
) -> str:
    """
    Extract ONLY the Education section.

    CRITICAL FIX:

    Education stops when any of these begins:

        TECHNICAL SKILLS
        SKILLS
        EXPERIENCE
        PROJECTS
        CERTIFICATIONS
        ACHIEVEMENTS
        etc.

    This prevents Technical Skills from entering the degree value.
    """

    lines = full_text.split("\n")

    for i, line in enumerate(lines):

        header_line = line.strip()

        match = _EDUCATION_HEADER_PATTERN.match(
            header_line
        )

        if not match:
            continue

        captured = []

        # --------------------------------------------------------------------
        # Handle:
        #
        # EDUCATION: B.Tech ...
        # --------------------------------------------------------------------

        trailing = header_line[
            match.end():
        ].strip()

        if trailing:

            inline_skill = _SKILLS_HEADER_PATTERN.search(
                trailing
            )

            if inline_skill:

                trailing = trailing[
                    :inline_skill.start()
                ].strip()

            if trailing:
                captured.append(
                    trailing
                )

        j = i + 1

        while (
            j < len(lines)
            and len(captured) < _MAX_SECTION_LINES
        ):

            current = lines[j].strip()

            if not current:
                j += 1
                continue

            # ----------------------------------------------------------------
            # Hard stop
            # ----------------------------------------------------------------

            if _SECTION_STOP_PATTERN.match(
                current
            ):
                break

            if _SKILLS_HEADER_PATTERN.match(
                current
            ):
                break

            if _INLINE_SKILLS_HEADER_PATTERN.match(
                current
            ):
                break

            # ----------------------------------------------------------------
            # Other section heading
            # ----------------------------------------------------------------

            if _looks_like_section_heading(
                current
            ):

                normalized = current.lower().strip(
                    " :|-"
                )

                education_like = {
                    "education",
                    "academic details",
                    "academic background",
                    "qualifications",
                }

                if normalized not in education_like:
                    break

            captured.append(
                current
            )

            j += 1

        return "\n".join(
            captured
        ).strip()

    return ""


# ============================================================================
# PROJECTS
# ============================================================================

_PROJECTS_HEADER_PATTERN = re.compile(
    r"^\s*projects?\s*:?\s*$",
    re.IGNORECASE,
)


def _find_projects_section(
    full_text: str,
) -> str:

    lines = full_text.split("\n")

    for i, line in enumerate(lines):

        if _PROJECTS_HEADER_PATTERN.match(
            line.strip()
        ):

            captured = []

            j = i + 1

            while (
                j < len(lines)
                and len(captured) < 60
            ):

                stripped = lines[j].strip()

                if (
                    _SECTION_STOP_PATTERN.match(
                        stripped
                    )
                    and not _PROJECTS_HEADER_PATTERN.match(
                        stripped
                    )
                ):
                    break

                if stripped:
                    captured.append(
                        stripped
                    )

                j += 1

            return "\n".join(
                captured
            )

    return ""


# ============================================================================
# EMAIL FALLBACK
# ============================================================================

def extract_email_fallback(
    full_text: str,
) -> list:

    return sorted(
        set(
            _EMAIL_PATTERN.findall(
                full_text
            )
        )
    )


# ============================================================================
# COLLEGE FALLBACK
# ============================================================================

def extract_college_names_fallback(
    full_text: str,
) -> list:

    education_text = _find_education_section(
        full_text
    )

    if not education_text:
        return []

    lines = education_text.split("\n")

    college_names = []

    for idx, line in enumerate(lines):

        matches = _COLLEGE_LINE_PATTERN.findall(
            line
        )

        if not matches:
            continue

        context = line.lower()

        if idx + 1 < len(lines):
            context += " " + lines[
                idx + 1
            ].lower()

        exclude_phrases = (
            "certificate",
            "junior college",
            "high school",
            "secondary school",
        )

        if (
            any(
                phrase in context
                for phrase in exclude_phrases
            )
            or any(
                indicator in context
                for indicator in _PRE_UNIVERSITY_INDICATORS
            )
        ):
            continue

        for match in matches:

            cleaned = match.strip(
                " .-"
            )

            year_match = _YEAR_PATTERN.search(
                cleaned
            )

            if year_match:

                cleaned = cleaned[
                    :year_match.start()
                ].strip(
                    " ,.-–—"
                )

            if cleaned:
                college_names.append(
                    cleaned
                )

    return sorted(
        set(college_names)
    )


# ============================================================================
# GRADUATION YEAR FALLBACK
# ============================================================================

def extract_graduation_years_fallback(
    full_text: str,
) -> list:

    education_text = _find_education_section(
        full_text
    )

    if not education_text:
        return []

    return sorted(
        set(
            match.group(0)
            for match in _YEAR_PATTERN.finditer(
                education_text
            )
        )
    )


# ============================================================================
# DEGREE FALLBACK
# ============================================================================

def extract_degree_fallback(
    full_text: str,
) -> list:

    education_text = _find_education_section(
        full_text
    )

    if not education_text:
        return []


    matches = [
        match.strip(
            " .-"
        )
        for match in _DEGREE_PATTERN.findall(
            education_text
        )
    ]

    return sorted(
        set(
            match
            for match in matches
            if match
        )
    )
    matches = []
    for m in _DEGREE_PATTERN.findall(education_text):
        cleaned = m.strip(" .-")
        # A degree line often carries the institution's years on the same
        # line ("B.Tech CSE Malla Reddy University 2022 - 2026") -- keep only
        # the part before the first year so the value stays a degree name.
        year_match = _YEAR_PATTERN.search(cleaned)
        if year_match and year_match.start() > 0:
            cleaned = cleaned[:year_match.start()].strip(" ,.-|\u2013\u2014")
        # Safety cap: a real degree name is never paragraph-length; anything
        # longer means a section boundary was missed upstream.
        if cleaned and len(cleaned) <= 120:
            matches.append(cleaned)
    return sorted(set(matches))


# ============================================================================
# DESIGNATION FILTERS
# ============================================================================

def filter_out_project_titles(
    designations: list,
    full_text: str,
) -> list:

    projects_text = _find_projects_section(
        full_text
    )

    if not projects_text:
        return designations

    projects_lower = projects_text.lower()

    return [
        designation
        for designation in designations
        if designation.lower()
        not in projects_lower
    ]


def filter_out_language_lists(
    designations: list,
) -> list:

    result = []

    for designation in designations:

        words = designation.split()

        if (
            words
            and all(
                word.lower()
                in _SPOKEN_LANGUAGE_WORDS
                for word in words
            )
        ):
            continue

        result.append(
            designation
        )

    return result


# ============================================================================
# NAME FALLBACK
# ============================================================================

def extract_name_fallback(
    full_text: str,
) -> str:

    for line in full_text.split("\n"):

        line = line.strip()

        if not line:
            continue

        if line.lower() in _NON_NAME_FIRST_LINES:
            return None

        if "@" in line or any(
            char.isdigit()
            for char in line
        ):
            return None

        words = line.split()

        if (
            1 <= len(words) <= 5
            and len(line) < 60
        ):
            return line

        return None

    return None


# ============================================================================
# DATE HELPERS
# ============================================================================

def _parse_date_token(
    token: str,
    is_end: bool = False,
):

    token = token.strip().lower()

    if token in {
        "present",
        "current",
        "now",
    }:

        today = date.today()

        return (
            today.year,
            today.month,
        )

    match = re.search(
        r"(19|20)\d{2}",
        token
    )

    if not match:
        return None

    year = int(
        match.group(0)
    )

    month = 12 if is_end else 1

    for name, number in _MONTH_ALIASES.items():

        if re.search(
            rf"\b{name}\b",
            token
        ):
            month = number
            break

    return (
        year,
        month,
    )


def _months_between(
    start,
    end,
):

    if not start or not end:
        return 0

    return max(
        0,
        (
            end[0] - start[0]
        ) * 12
        + (
            end[1] - start[1]
        )
        + 1,
    )


# ============================================================================
# EXPERIENCE FALLBACK
# ============================================================================

def extract_experience_fallback(
    full_text: str,
) -> list:

    lines = full_text.split("\n")

    explicit = []

    for match in re.finditer(
        r"(?<!\w)(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b",
        full_text,
        re.I,
    ):

        window = full_text[
            max(
                0,
                match.start() - 80,
            ):
            min(
                len(full_text),
                match.end() + 80,
            )
        ]

        if re.search(
            r"\b(?:professional|work|employment)\s+"
            r"(?:experience|history)\b|"
            r"\b(?:years?|yrs?)\s+of\s+"
            r"professional\s+experience\b",
            window,
            re.I,
        ):

            explicit.append(
                float(
                    match.group(1)
                )
            )

    for match in re.finditer(
        r"(?<!\w)(\d+(?:\.\d+)?)\s*(?:months?|mos?)\b",
        full_text,
        re.I,
    ):

        window = full_text[
            max(
                0,
                match.start() - 80,
            ):
            min(
                len(full_text),
                match.end() + 80,
            )
        ]

        if re.search(
            r"\b(?:professional|work|employment)\s+"
            r"(?:experience|history)\b|"
            r"\b(?:months?|mos?)\s+of\s+"
            r"professional\s+experience\b",
            window,
            re.I,
        ):

            explicit.append(
                float(
                    match.group(1)
                ) / 12
            )

    if explicit:

        total = max(
            explicit
        )

        return [
            (
                f"{total:.1f} years"
                if total % 1
                else f"{int(total)} years"
            )
        ]

    professional_header = re.compile(
        r"^\s*(?:"
        r"professional\s+experience"
        r"|work\s+experience"
        r"|professional\s+work\s+experience"
        r"|employment\s+(?:history|experience)"
        r"|work\s+history"
        r")\s*:?\s*[\s-]*$",
        re.I,
    )

    blocks = []

    for i, line in enumerate(lines):

        if not professional_header.match(
            line.strip()
        ):
            continue

        block_lines = []

        j = i + 1

        while (
            j < len(lines)
            and len(block_lines) < 80
        ):

            current = lines[j].strip()

            if (
                _looks_like_section_heading(
                    current
                )
                or _SECTION_STOP_PATTERN.match(
                    current
                )
            ):
                break

            if current:
                block_lines.append(
                    current
                )

            j += 1

        if block_lines:
            blocks.append(
                "\n".join(block_lines)
            )

    if not blocks:
        return []

    intervals = []

    for block in blocks:

        for match in _DATE_RANGE_PATTERN.finditer(
            block
        ):

            start = _parse_date_token(
                match.group("start")
            )

            end = _parse_date_token(
                match.group("end"),
                True,
            )

            if (
                start
                and end
                and end >= start
            ):
                intervals.append(
                    (
                        start,
                        end,
                    )
                )

    if not intervals:
        return []

    intervals.sort()

    merged = []

    for start, end in intervals:

        if not merged:
            merged.append(
                [
                    start,
                    end,
                ]
            )
            continue

        previous_start, previous_end = merged[-1]

        previous_end_month = (
            previous_end[0] * 12
            + previous_end[1]
        )

        current_start_month = (
            start[0] * 12
            + start[1]
        )

        if current_start_month <= (
            previous_end_month + 1
        ):

            if end > previous_end:
                merged[-1][1] = end

        else:

            merged.append(
                [
                    start,
                    end,
                ]
            )

    months = sum(
        _months_between(
            start,
            end,
        )
        for start, end in merged
    )

    years = months / 12

    return [
        (
            f"{years:.1f} years"
            if years % 1
            else f"{int(years)} years"
        )
    ]


# ============================================================================
# SKILL NORMALIZATION
# ============================================================================

def _normalize_skill_token(
    value: str,
) -> str:

    value = re.sub(
        r"\s+",
        " ",
        str(value),
    ).strip(
        " .:-–—"
    )

    value = value.replace(
        "problem -solving",
        "problem-solving",
    )

    canonical = {

        "bootstrap": "Bootstrap",

        "cnn": "CNN",

        "css": "CSS",

        "css3": "CSS3",

        "dsa": "DSA",

        "django": "Django",

        "express": "Express.js",

        "express.js": "Express.js",

        "expressjs": "Express.js",

        "figma": "Figma",

        "flask": "Flask",

        "fastapi": "FastAPI",

        "github": "GitHub",

        "google colab": "Google Colab",

        "html": "HTML",

        "html5": "HTML5",

        "java": "Java",

        "javascript": "JavaScript",

        "java script": "JavaScript",

        "jupyter": "Jupyter",

        "jupyter notebooks": "Jupyter Notebooks",

        "keras": "Keras",

        "linux": "Linux",

        "matplotlib": "Matplotlib",

        "mongodb": "MongoDB",

        "mysql": "MySQL",

        "node": "Node.js",

        "node.js": "Node.js",

        "nodejs": "Node.js",

        "numpy": "NumPy",

        "opencv": "OpenCV",

        "operating systems": "Operating Systems",

        "pandas": "Pandas",

        "python": "Python",

        "react": "React",

        "react.js": "React.js",

        "reactjs": "React.js",

        "scikit-learn": "scikit-learn",

        "sql": "SQL",

        "sublime": "Sublime",

        "tensorflow": "TensorFlow",

        "vs code": "VS Code",

        "visual studio code": "VS Code",

        "windows": "Windows",

        "machine learning": "Machine Learning",

        "deep learning": "Deep Learning",

        "natural language processing":
            "Natural Language Processing",

        "nlp": "NLP",

        "aws": "AWS",

        "azure": "Azure",

        "gcp": "GCP",

        "git": "Git",

        "docker": "Docker",

        "kubernetes": "Kubernetes",

        "communication": "Communication",

        "teamwork": "Teamwork",

        "leadership": "Leadership",

        "adaptability": "Adaptability",

        "collaboration": "Collaboration",

        "debugging": "Debugging",

        "testing": "Testing",

        "test automation":
            "Test Automation",

        "rest api": "REST API",

        "rest apis": "REST APIs",

        "restful api": "REST API",

        "problem solving":
            "problem-solving",

        "object-oriented programming":
            "Object-Oriented Programming",

        "object oriented programming":
            "Object-Oriented Programming",

    }

    return canonical.get(
        value.lower(),
        value,
    )


# ============================================================================
# RECOVER KNOWN SKILLS
# ============================================================================

def _recover_known_skills_from_text(
    text: str,
) -> set:

    found = set()

    normalized = re.sub(
        r"\s+",
        " ",
        text,
    ).strip()

    lower = normalized.lower()

    # ------------------------------------------------------------------------
    # Longest first
    # ------------------------------------------------------------------------

    for term in sorted(
        _KNOWN_SKILL_TERMS,
        key=len,
        reverse=True,
    ):

        pattern = (
            rf"(?<![A-Za-z0-9+#.])"
            rf"{re.escape(term)}"
            rf"(?![A-Za-z0-9+#.])"
        )

        if re.search(
            pattern,
            lower,
            re.I,
        ):

            canonical = term

            aliases = {

                "java script":
                    "JavaScript",

                "reactjs":
                    "React.js",

                "react":
                    "React",

                "nodejs":
                    "Node.js",

                "express":
                    "Express.js",

                "expressjs":
                    "Express.js",

                "html5":
                    "HTML5",

                "css3":
                    "CSS3",

                "sklearn":
                    "scikit-learn",

                "jupyter":
                    "Jupyter",

                "visual studio code":
                    "VS Code",

                "rest api":
                    "REST API",

                "rest apis":
                    "REST APIs",

                "restful api":
                    "REST API",

                "problem solving":
                    "problem-solving",

                "object-oriented programming":
                    "Object-Oriented Programming",

                "object oriented programming":
                    "Object-Oriented Programming",
            }

            canonical = aliases.get(
                canonical,
                canonical,
            )

            casing = {

                "python":
                    "Python",

                "java":
                    "Java",

                "javascript":
                    "JavaScript",

                "c":
                    "C",

                "c++":
                    "C++",

                "c#":
                    "C#",

                "html":
                    "HTML",

                "css":
                    "CSS",

                "sql":
                    "SQL",

                "git":
                    "Git",

                "github":
                    "GitHub",

                "mysql":
                    "MySQL",

                "mongodb":
                    "MongoDB",

                "pandas":
                    "Pandas",

                "numpy":
                    "NumPy",

                "matplotlib":
                    "Matplotlib",

                "tensorflow":
                    "TensorFlow",

                "keras":
                    "Keras",

                "pytorch":
                    "PyTorch",

                "flask":
                    "Flask",

                "fastapi":
                    "FastAPI",

                "django":
                    "Django",

                "angular":
                    "Angular",

                "typescript":
                    "TypeScript",

                "power bi":
                    "Power BI",

                "microsoft office":
                    "Microsoft Office",

                "linux":
                    "Linux",

                "windows":
                    "Windows",

                "docker":
                    "Docker",

                "kubernetes":
                    "Kubernetes",

                "communication":
                    "Communication",

                "communicator":
                    "Communicator",

                "teamwork":
                    "Teamwork",

                "leadership":
                    "Leadership",

                "adaptability":
                    "Adaptability",

                "collaboration":
                    "Collaboration",

                "debugging":
                    "Debugging",

                "testing":
                    "Testing",

                "test automation":
                    "Test Automation",

                "dsa":
                    "DSA",

                "figma":
                    "Figma",

                "vs code":
                    "VS Code",

            }

            found.add(
                casing.get(
                    canonical.lower(),
                    canonical,
                )
            )

    # ------------------------------------------------------------------------
    # .js / .py / .net technical names
    # ------------------------------------------------------------------------

    for match in re.finditer(
        r"\b[A-Za-z][A-Za-z0-9]*(?:\.js|\.py|\.net)\b",
        normalized,
    ):

        token = match.group(0)

        if len(token) <= 35:
            found.add(token)

    # ------------------------------------------------------------------------
    # Strong uppercase technical tokens
    # ------------------------------------------------------------------------

    for match in re.finditer(
        r"\b[A-Z]{2,}(?:\d+)?\b",
        normalized,
    ):

        token = match.group(0)

        if token.lower() in {
            "and",
            "the",
            "with",
            "from",
            "this",
            "that",
            "skills",
        }:
            continue

        if token in {
            "DBMS",
            "SQL",
            "OOPS",
            "HTML",
            "CSS",
            "API",
            "AWS",
            "GCP",
            "DSA",
        }:
            found.add(token)

    return found


# ============================================================================
# INDIVIDUAL SKILLS
# ============================================================================

def extract_individual_skills(
    raw_skill_blocks: list,
    known_locations: list = None,
) -> list:

    individual_skills = set()

    location_words = set(
        _STATE_WORDS
    )

    for location in (
        known_locations or []
    ):

        location_words.update(
            word.lower()
            for word in re.findall(
                r"[A-Za-z]+",
                location,
            )
        )

    for block in raw_skill_blocks:

        if not block:
            continue

        block_lines = block.split(
            "\n"
        )

def extract_individual_skills(raw_skill_blocks: list, known_locations: list = None,
                              allow_runon_lists: bool = False) -> list:
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
        block = _split_sublabels(block)
        block_lines = block.split("\n")

        truncated_lines = []

        for line in block_lines:


            stripped = line.strip()

            if (
                _SECTION_STOP_PATTERN.match(
                    stripped
                )
                or _NON_SKILL_SECTION_LINE_PATTERN.match(
                    stripped
                )
            ):
                break

            if _EMAIL_PATTERN.search(
                stripped
            ):

                stripped = _EMAIL_PATTERN.sub(
                    " ",
                    stripped,
                )

            truncated_lines.append(
                stripped
            )

        block = "\n".join(
            truncated_lines
        )

        # --------------------------------------------------------------------
        # Recover known skills from entire block
        # --------------------------------------------------------------------

        individual_skills.update(
            _recover_known_skills_from_text(
                block
            )
        )

        # --------------------------------------------------------------------
        # Process list-shaped content
        # --------------------------------------------------------------------

        block = _CATEGORY_BOUNDARY_PATTERN.sub(
            lambda match:
                "\n" + match.group(0),
            block,
        )

        pieces = _SPLIT_PATTERN.split(
            block
        )

        for piece in pieces:

            piece = _normalize_skill_token(
                piece
            )

            piece = _BULLET_PATTERN.sub(
                "",
                piece,
            )

            piece = _COLON_LABEL_PATTERN.sub(
                "",
                piece,
            )

            piece = _HYPHEN_LABEL_PATTERN.sub(
                "",
                piece,
            )

            piece = _PAREN_SUFFIX_PATTERN.sub(
                "",
                piece,
            )

            piece = _normalize_skill_token(
                piece
            )

            if not piece:
                continue

            if len(piece) >= 40:
                continue

            if _EMAIL_PATTERN.search(
                piece
            ):
                continue

            words = piece.split()

            if (
                len(words) >= 2
                and all(
                    len(word) == 1
                    for word in words
                )
            ):

                piece = "".join(
                    words
                )

                words = [
                    piece
                ]

            if len(words) > _MAX_WORDS:
                continue
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

            if not piece:
                continue

            words = piece.split()

            # A long, separator-less run under a skills header is almost
            # always a list whose line breaks were lost -- recover the known
            # skills from it instead of discarding the whole thing.
            if allow_runon_lists and (len(piece) >= 40 or len(words) > _MAX_WORDS):
                for skill in _split_runon_skill_list(piece):
                    if not any(w.lower() in location_words for w in skill.split()):
                        individual_skills.add(skill)
                continue

            if len(piece) >= 40:
                continue

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
            if piece.lower() in _ALL_SECTION_NAMES:
                continue  # a section heading ("Relevant Coursework") is not itself a skill
            if piece.lower() in _BARE_CATEGORY_LABELS:
                continue  # a section header leaked through as its own piece (no colon/hyphen to strip)
            if words and all(w.lower() in _SPOKEN_LANGUAGE_WORDS for w in words):
                continue  # a spoken-language list (e.g. "Telugu English Hindi"), not technical skills
            if words and any(w.lower() in location_words for w in words):
                continue  # contains a word the model itself tagged as a Location elsewhere

            individual_skills.add(piece)

            if (
                words
                and words[0].lower()
                in _LEADING_REJECT_WORDS
            ):
                continue

            if (
                piece.lower()
                in _NONSKILL_WHOLE_WORDS
                or piece.lower()
                in _BARE_CATEGORY_LABELS
            ):
                continue

            if (
                words
                and all(
                    word.lower()
                    in _SPOKEN_LANGUAGE_WORDS
                    for word in words
                )
            ):
                continue

            if (
                words
                and any(
                    word.lower()
                    in location_words
                    for word in words
                )
            ):
                continue

            if re.search(
                r"\b(?:"
                r"and|the|with|using|to|for|from|"
                r"that|which|this|achieved|developed|"
                r"deployed|implemented|passionate|"
                r"experience|responsibilities|responsibility|"
                r"candidate|applicants?|tasks?|project|"
                r"screen(?:ing)?|matching|collaboration|"
                r"integration|completion|fostering|"
                r"impactful|efficiency|results?"
                r")\b",
                piece,
                re.I,
            ):
                continue

            if (
                re.search(
                    r"\b(?:by|in|on)\s+(?:20\d{2}|19\d{2})\b",
                    piece,
                    re.I,
                )
                or re.search(
                    r"\d+%",
                    piece,
                )
            ):
                continue

            if (
                re.search(
                    r"(?:\.js|\.py|\.net)$",
                    piece,
                    re.I,
                )
                or re.fullmatch(
                    r"[A-Z]{2,}(?:\d+)?",
                    piece,
                )
            ):
                individual_skills.add(
                    piece
                )

    return sorted(
        individual_skills
    )

# ============================================================================
# WHITESPACE
# ============================================================================

def _normalize_whitespace(
    text: str,
) -> str:

    return "\n".join(
        re.sub(
            r"[ \t]+",
            " ",
            line,
        )
        for line in text.split("\n")
    )


# ============================================================================
# NAME FILTER
# ============================================================================

def filter_false_name_values(
    names: list,
) -> list:

    result = []

    bad = (
        set(
            _BARE_CATEGORY_LABELS
        )
        | {
            "academic coursework",
            "coursework",
            "salesforce certified",
            "certifications",
            "experience",
            "projects",
            "education",
            "languages",
            "soft skills",
            "skill set",
            "technical skills",
            "professional skills",
            "key skills",
            "core skills",
            "technical competencies",
            "professional competencies",
            "technical proficiency",
            "professional proficiency",
            "areas of expertise",
        }
    )

    for name in names:

        normalized = re.sub(
            r"\s+",
            " ",
            str(name),
        ).strip()

        if not normalized:
            continue

        if normalized.lower() in bad:
            continue

        if _EMAIL_PATTERN.search(
            normalized
        ):
            continue

        if len(normalized) > 60:
            continue

        if len(normalized.split()) > 6:
            continue

        result.append(
            normalized
        )

    return sorted(
        set(result)
    )


# ============================================================================
# DESIGNATION FILTER
# ============================================================================

def filter_false_designations(
    designations: list,
) -> list:

    result = []

    bad_words = (
        _BARE_CATEGORY_LABELS
        | {
            "academic coursework",
            "coursework",
            "salesforce certified",
        }
    )

    for value in designations:

        designation = re.sub(
            r"\s+",
            " ",
            str(value),
        ).strip()

        designation_lower = (
            designation.lower()
        )

        if not designation:
            continue

        if _EMAIL_PATTERN.search(
            designation
        ):
            continue

        if designation_lower in bad_words:
            continue

        if len(
            designation.split()
        ) > 8:
            continue

        if any(
            word in designation_lower
            for word in (
                "technical skills",
                "soft skills",
                "programming languages",
                "academic coursework",
            )
        ):
            continue

        residue = designation_lower

        for term in sorted(
            _KNOWN_SKILL_TERMS,
            key=len,
            reverse=True,
        ):

            residue = re.sub(
                rf"(?<![a-z0-9+#.])"
                rf"{re.escape(term.lower())}"
                rf"(?![a-z0-9+#.])",
                " ",
                residue,
            )

        residue = re.sub(
            r"[ ,/|&+.-]+",
            " ",
            residue,
        ).strip()

        if not residue:
            continue

        result.append(
            designation
        )

    return sorted(
        set(result)
    )


# ============================================================================
# SANITIZE RAW SKILLS
# ============================================================================

def sanitize_skill_raw_blocks(
    raw_blocks: list,
    known_locations: list = None,
) -> list:

    clean_blocks = []

    for block in (
        raw_blocks or []
    ):

        skills = extract_individual_skills(
            [block],
            known_locations=known_locations,
        )

        if skills:

            clean_blocks.append(
                "\n".join(
                    skills
                )
            )

    result = []

    seen = set()

    for block in clean_blocks:

        key = block.lower()

        if key not in seen:

            seen.add(key)

            result.append(
                block
            )

    return result


# ============================================================================
# MAIN RESUME PARSER
# ============================================================================

def parse_resume(
    text: str,
) -> dict:

    # ------------------------------------------------------------------------
    # Normalize PDF whitespace while preserving line boundaries.
    # ------------------------------------------------------------------------

    text = _normalize_whitespace(
        text
    )

    # ------------------------------------------------------------------------
    # Run trained spaCy model.
    # ------------------------------------------------------------------------

    doc = nlp(
        text
    )

    raw_profile = {
        field: []
        for field in _LABEL_TO_FIELD.values()
    }
# ---------------------------------------------------------------------------
# Section-break restoration. EVERY section scanner in this module (skills,
# education, projects, the stop-header check) works LINE BY LINE: a header is
# only recognised when it sits on its own line. That assumption breaks when
# the line breaks are gone -- either because an upstream caller collapsed all
# whitespace to single spaces (the Spring backend's text-cleaning step did
# exactly this, turning the whole resume into ONE line), or because PDF
# extraction glued a header onto the previous line ("... 2022 - 2026 TECHNICAL
# SKILLS Python, Java ..."). When that happens the skills scanner finds
# nothing, and the Education scan / degree regex runs straight through the
# Technical Skills content -- producing "skills": [] and an education value
# that contains the skills list.
#
# _restore_section_breaks() puts each recognisable section header back on its
# own line BEFORE any scanning happens. To avoid splitting ordinary sentences
# ("improved my communication skills", "Experience with React"), a phrase is
# only treated as a header when it is written the way headers are written:
#   * ALL CAPS ("TECHNICAL SKILLS", "EDUCATION"), or
#   * followed by a colon ("Skills:", "Education:"), or
#   * Title Case, when the surrounding words show it is a section boundary
#     (see _looks_like_header for the exact rule).
# Spoken/programming "Languages" is deliberately NOT included: inside a skills
# section "Languages: Python, Java" is a sub-label, not a new section.
# ---------------------------------------------------------------------------

_SECTION_HEADER_PHRASES = _SKILL_SECTION_NAMES + _OTHER_SECTION_NAMES
_ALL_SECTION_NAMES = frozenset(n.lower() for n in _SECTION_HEADER_PHRASES)

# Words that, placed directly before "Skills", make it part of a phrase in a
# sentence or soft-skills list ("Communication Skills") rather than a heading.
_SKILLS_MODIFIER_WORDS = frozenset({
    "communication", "interpersonal", "leadership", "analytical",
    "problem-solving", "presentation", "management", "organizational",
    "organisational", "writing", "people", "language", "social",
    "negotiation", "listening", "time", "team", "teamwork", "my", "our", "his",
    "her", "their", "strong", "good", "excellent", "great",
})

_SECTION_HEADER_FINDER = re.compile(
    r"(?<![A-Za-z])(" + _names_alternation(_SECTION_HEADER_PHRASES) + r")(?![A-Za-z])(\s*:)?",
    re.IGNORECASE,
)


def _neighbour_tokens(text: str, start: int, end: int):
    """The whitespace-separated token just before `start` and just after
    `end` (empty string when there is none)."""
    before = text[:start].rstrip().rsplit(None, 1)
    after = text[end:].lstrip().split(None, 1)
    return (before[-1] if before else ""), (after[0] if after else "")


def _looks_like_header(phrase: str, has_colon: bool, prev_tok: str, next_tok: str) -> bool:
    """Decides whether a section-name phrase found in running text is really
    a heading. Headings are written differently from sentence text:
      * ALL CAPS                      -> heading ("TECHNICAL SKILLS")
      * followed by a colon           -> heading ("Skills:")
      * lowercase                     -> sentence ("good communication skills")
      * Title Case, several words     -> heading ("Key Skills", "Work Experience")
      * Title Case, one word          -> heading only when the words around
        it look like a section boundary: the previous word does not start
        with a lowercase letter (not mid-sentence) and the next word starts
        with a capital, digit or bullet ("... 2020-2024 Skills • Python").
        "Experience with React" or "Communication Skills" are left alone."""
    words = phrase.split()
    letters = [c for c in phrase if c.isalpha()]
    if letters and all(c.isupper() for c in letters):
        return True
    if has_colon:
        return True
    if not all(w[0].isupper() for w in words):
        return False
    if len(words) > 1:
        return True

    if prev_tok and prev_tok[0].islower():
        return False
    if words[0].lower() == "skills" and prev_tok.lower().strip(",.;:") in _SKILLS_MODIFIER_WORDS:
        return False
    if not next_tok:
        return True
    first = next_tok[0]
    return first.isupper() or first.isdigit() or not first.isalnum()


def _restore_section_breaks(text: str) -> str:
    """Puts recognisable section headings back on their own line, so the
    line-based scanners below work even when the caller sent the resume as
    ONE line (the Spring backend currently collapses all line breaks) or
    when PDF extraction glued a heading onto the previous line. Text whose
    headings are already on their own lines is effectively unchanged."""
    def _replace(m):
        phrase, colon = m.group(1), m.group(2)
        prev_tok, next_tok = _neighbour_tokens(m.string, m.start(), m.end())
        if not _looks_like_header(phrase, bool(colon), prev_tok, next_tok):
            return m.group(0)
        return "\n" + re.sub(r"\s+", " ", phrase) + (":" if colon else "") + "\n"

    return _SECTION_HEADER_FINDER.sub(_replace, text)


# Skills sub-labels ("Languages:", "Web:", "Core Subjects:") end up in the
# middle of a line when line breaks are lost, glued to the LAST item of the
# previous list: "Python, Java, C Web: HTML". Stripping the label would then
# also strip "C". _split_sublabels() finds the text between the previous
# separator and each colon ("C Web"), and splits off the longest trailing run
# made only of label words ("Web") -- leaving "C" as its own item. A segment
# made entirely of label words ("Web Technologies") is left as it is.
_LABEL_WORDS = frozenset({
    "programming", "languages", "language", "web", "technologies", "technology",
    "development", "frontend", "front-end", "front", "end", "backend", "back-end",
    "back", "database", "databases", "db", "dbs", "tools", "tool", "frameworks",
    "framework", "libraries", "library", "core", "subjects", "subject",
    "coursework", "courses", "cloud", "devops", "others", "other", "concepts",
    "ide", "ides", "platforms", "platform", "version", "control", "operating",
    "systems", "data", "visualization", "visualisation", "analytics", "testing",
    "mobile", "scripting", "markup", "styling", "os", "soft", "skills", "skill",
    "technical", "software", "packages", "utilities", "deployment", "servers",
    "methodologies", "design", "&", "and", "query", "misc", "miscellaneous",
    "office", "interests", "areas", "relevant", "hardware", "networking",
    "editors", "vcs", "environment", "environments", "stack", "tech",
    "applications", "familiar", "with", "known", "proficient", "in",
    "intermediate", "beginner", "advanced", "basic", "basics",
})

_SUBLABEL_SEGMENT = re.compile(r"([^,;|\n\u2022:]+?)(\s*:)")


def _split_sublabels(block: str) -> str:
    def _fix(m):
        segment, colon = m.group(1), m.group(2)
        tokens = segment.split()
        if len(tokens) < 2:
            return m.group(0)
        for k in range(len(tokens)):
            if all(t.lower() in _LABEL_WORDS for t in tokens[k:]):
                if k == 0:
                    return m.group(0)            # whole segment is a label
                lead = segment[:len(segment) - len(segment.lstrip())]
                return lead + " ".join(tokens[:k]) + "\n" + " ".join(tokens[k:]) + colon
        return m.group(0)
    return _SUBLABEL_SEGMENT.sub(_fix, block)


# ---------------------------------------------------------------------------
# Run-on skill lists. When a skills section was written one-skill-per-line or
# as bullets, and the line breaks were then lost, the section arrives as ONE
# space-separated run with no commas ("Python Java DSA HTML CSS ... VS Code").
# The normal comma/bullet splitter sees that as a single 70-character "skill"
# and (correctly) rejects it as too long -- so every skill was dropped. For
# that case only, the run is matched greedily against a curated vocabulary of
# common technical skills (longest phrase first, so "VS Code" and "Spring
# Boot" stay whole). Unknown words are simply skipped rather than guessed.
# This is only applied to text found under a skills HEADER, never to free
# text, so it cannot pull skills out of project descriptions or sentences.
# ---------------------------------------------------------------------------

_KNOWN_SKILL_PHRASES = frozenset({
    # languages
    "python", "java", "c", "c++", "c#", "javascript", "typescript", "go", "golang",
    "rust", "kotlin", "swift", "php", "ruby", "r", "scala", "dart", "matlab",
    "sql", "pl/sql", "html", "html5", "css", "css3", "bash", "shell scripting",
    # web / frameworks / libraries
    "react", "reactjs", "react.js", "react js", "react native", "redux",
    "angular", "angularjs", "vue", "vuejs", "vue.js", "next.js", "nextjs",
    "node", "nodejs", "node.js", "node js", "express", "expressjs", "express.js",
    "django", "flask", "fastapi", "spring", "spring boot", "springboot",
    "hibernate", "jpa", "bootstrap", "tailwind", "tailwind css", "tailwindcss",
    "jquery", "flutter", "laravel", ".net", "asp.net", "material ui",
    # data / ml
    "pandas", "numpy", "scikit-learn", "sklearn", "tensorflow", "pytorch",
    "keras", "opencv", "matplotlib", "seaborn", "nltk", "spacy",
    "machine learning", "deep learning", "nlp", "computer vision",
    "artificial intelligence", "data analysis", "data science", "power bi",
    "tableau", "excel", "ms excel",
    # databases
    "mysql", "postgresql", "postgres", "mongodb", "sqlite", "oracle", "redis",
    "firebase", "dynamodb", "cassandra", "supabase",
    # tools / cloud / platforms
    "git", "github", "gitlab", "bitbucket", "docker", "kubernetes", "jenkins",
    "aws", "azure", "gcp", "linux", "jira", "postman", "figma", "canva",
    "vs code", "vscode", "visual studio code", "intellij", "eclipse",
    "jupyter", "jupyter notebook", "google colab", "netlify", "vercel", "heroku",
    # concepts
    "dsa", "data structures", "algorithms", "data structures and algorithms",
    "oop", "oops", "dbms", "operating systems", "computer networks",
    "rest api", "rest apis", "restful apis", "graphql", "microservices",
    "ci/cd", "agile", "scrum", "computer networks", "cn", "software engineering",
    "cloud computing", "data visualization", "data visualisation", "ms office",
    "microsoft excel", "advanced excel", "ms word", "powerpoint", "selenium",
    "junit", "maven", "android", "android studio", "unix", "windows",
    "html/css", "rest", "json", "xml", "ajax", "sass", "webpack", "vite",
    "spring mvc", "servlets", "jsp", "jdbc", "thymeleaf", "streamlit",
    "huggingface", "langchain", "openai", "llm", "llms", "generative ai",
    "big data", "hadoop", "spark", "pyspark", "kafka", "airflow", "snowflake",
    "terraform", "ansible", "nginx", "apache", "tomcat", "graphql",
})
_MAX_SKILL_PHRASE_WORDS = max(len(p.split()) for p in _KNOWN_SKILL_PHRASES)


def _split_runon_skill_list(piece: str) -> list:
    """Greedy longest-match of a separator-less skills run against
    _KNOWN_SKILL_PHRASES. Returns the matched skills in their original
    casing; words that aren't known skills are skipped."""
    tokens = [t.strip(".:;|()[]") for t in piece.split()]
    tokens = [t for t in tokens if t]
    found, i = [], 0
    while i < len(tokens):
        for size in range(min(_MAX_SKILL_PHRASE_WORDS, len(tokens) - i), 0, -1):
            phrase = " ".join(tokens[i:i + size])
            if phrase.lower() in _KNOWN_SKILL_PHRASES:
                found.append(phrase)
                i += size
                break
        else:
            # "HTML/CSS"-style combined token -> check each part
            if "/" in tokens[i] and tokens[i].lower() not in _KNOWN_SKILL_PHRASES:
                found.extend(part for part in tokens[i].split("/")
                             if part.lower() in _KNOWN_SKILL_PHRASES)
            i += 1
    return found


# Words in the vocabulary that are also ordinary English / non-skill words
# ("C" grade, "Go", "Spring 2024", "Express delivery", "R" as an initial).
# The whole-resume fallback scan below never uses these -- they are only
# trusted when they appear inside an actual skills section.
_AMBIGUOUS_SKILL_WORDS = frozenset({
    "c", "r", "go", "spring", "express", "swift", "dart", "rust", "rest",
    "node", "react", "excel", "oracle", "windows", "android", "apache",
    "agile", "scrum", "cn", "ms word", "powerpoint", "json", "xml", "unix",
    "algorithms", "vite", "spark", "openai",
})

_SAFE_DOC_SCAN_PATTERN = re.compile(
    r"(?<![\w+#.])(" + "|".join(
        re.escape(p).replace(r"\ ", r"\s+")
        for p in sorted(_KNOWN_SKILL_PHRASES - _AMBIGUOUS_SKILL_WORDS, key=len, reverse=True)
    ) + r")(?![\w+#])",
    re.IGNORECASE,
)


def _scan_known_skills_in_text(text: str) -> list:
    """Last-resort fallback for resumes with NO recognisable skills heading
    at all: finds unambiguous known skill names anywhere in the text (e.g.
    in project descriptions). Only used when the heading scan found nothing,
    so normal resumes are unaffected."""
    return sorted({re.sub(r"\s+", " ", m.group(1)) for m in _SAFE_DOC_SCAN_PATTERN.finditer(text)})


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
    text = _restore_section_breaks(text)
    doc = nlp(text)
    raw_profile = {
        field: []
        for field in _LABEL_TO_FIELD.values()
    }

    raw_profile.setdefault("skills_raw", [])
    raw_profile.setdefault("skills_cleaned", [])

    for label, field in _LABEL_TO_FIELD.items():

        values = sorted(
            {
                entity.text.strip()
                for entity in doc.ents
                if entity.label_ == label
            }
        )

        raw_profile[field] = values

    # =========================================================================
    # SKILLS
    # =========================================================================
    #
    # Source 1:
    #   NER Skills
    #
    # Source 2:
    #   Direct Technical Skills section scan
    #
    # Source 2 takes priority when a real skills heading exists.
    # =========================================================================

    header_scanned_sections = (
        _find_skills_sections_by_header(
            text
        )
    )

    if header_scanned_sections:

        raw_profile[
            "skills_raw"
        ] = header_scanned_sections

        cleaned_from_headers = (
            extract_individual_skills(
                header_scanned_sections,
                known_locations=raw_profile[
                    "location"
                ],
            )
        )

        raw_profile[
            "skills_cleaned"
        ] = sorted(
            set(
                cleaned_from_headers
            )
        )

    else:

        cleaned_from_ner = (
            extract_individual_skills(
                raw_profile[
                    "skills_raw"
                ],
                known_locations=raw_profile[
                    "location"
                ],
            )
        )

        raw_profile[
            "skills_cleaned"
        ] = sorted(
            set(
                cleaned_from_ner
            )
        )

    # =========================================================================
    # FINAL SKILLS
    # =========================================================================

    if header_scanned_sections:

        final_skills = (
            extract_individual_skills(
                header_scanned_sections,
                known_locations=raw_profile[
                    "location"
                ],
            )
        )

    else:

        final_skills = (
            extract_individual_skills(
                raw_profile[
                    "skills_raw"
                ],
                known_locations=raw_profile[
                    "location"
                ],
            )
        )

    # ------------------------------------------------------------------------
    # Canonicalize and deduplicate
    # ------------------------------------------------------------------------

    skill_map = {}

    for skill in final_skills:

        skill = _normalize_skill_token(
            skill
        )

        if not skill:
            continue

        key = skill.lower()

        if key not in skill_map:
            skill_map[key] = skill

    # ------------------------------------------------------------------------
    # Explicit CNN recovery
    # ------------------------------------------------------------------------

    if re.search(
        r"(?<![A-Za-z0-9])cnn(?![A-Za-z0-9])",
        text,
        re.I,
    ):

        skill_map.setdefault(
            "cnn",
            "CNN",
        )

    # ------------------------------------------------------------------------
    # IMPORTANT:
    # Recover explicit known skills from the Technical Skills section again.
    #
    # This makes sure a line such as:
    #
    # Python Java DSA HTML CSS Bootstrap
    #
    # is not lost because of NER or line-level parsing.
    # ------------------------------------------------------------------------

    if header_scanned_sections:

        header_text = "\n".join(
            header_scanned_sections
        )

        recovered_header_skills = (
            _recover_known_skills_from_text(
                header_text
            )
        )

        for skill in recovered_header_skills:

            normalized_skill = (
                _normalize_skill_token(
                    skill
                )
            )

            if normalized_skill:

                skill_map.setdefault(
                    normalized_skill.lower(),
                    normalized_skill,
                )

    # ------------------------------------------------------------------------
    # FINAL FALLBACK: recover explicit technical skills from the original resume
    # text when the NER/header parser returned only a very small subset.
    #
    # This is important for resumes whose PDF extraction or NER boundaries are
    # imperfect. For example, a Technical Skills section may be present in the
    # raw resume but the NER span may contain only one item such as
    # "Machine Learning". The known-skill vocabulary is deterministic and is
    # therefore safe to use as a fallback for explicit skill names.
    # ------------------------------------------------------------------------
    if len(skill_map) < 3:

        fallback_skills = _scan_known_skills_in_text(text)

        # Ambiguous one-word technologies (especially C) are recovered only
        # when the resume itself contains a recognizable skills/coursework
        # section. This avoids treating ordinary words such as "go" or
        # "spring" in normal sentences as skills.
        has_skill_context = bool(
            re.search(
                r"\b(?:technical\s+skills?|skills?|skill\s+set|"
                r"programming\s+skills?|relevant\s+coursework|"
                r"core\s+subjects?|computer\s+science\s+fundamentals?)\b",
                text,
                re.IGNORECASE,
            )
        )

        if has_skill_context:
            context_terms = (
                "c", "c++", "c#", "r", "go", "golang", "spring",
                "express", "swift", "dart", "rust", "rest", "node",
                "react", "excel", "oracle", "windows", "android",
                "apache", "agile", "scrum", "cn", "algorithms",
                "vite", "spark", "openai", "json", "xml", "unix",
            )

            for term in context_terms:
                if re.search(
                    rf"(?<![A-Za-z0-9+#.]){re.escape(term)}(?![A-Za-z0-9+#.])",
                    text,
                    re.IGNORECASE,
                ):
                    fallback_skills.append(term)

        for skill in fallback_skills:
            normalized_skill = _normalize_skill_token(skill)
            if normalized_skill:
                skill_map.setdefault(
                    normalized_skill.lower(),
                    normalized_skill,
                )

    final_skills = sorted(
        skill_map.values(),
        key=str.lower,
    )

    raw_profile[
        "skills_raw"
    ] = final_skills

    raw_profile[
        "skills_cleaned"
    ] = final_skills

    # =========================================================================
    # EXPERIENCE
    # =========================================================================

    experience_fallback = (
        extract_experience_fallback(
            text
        )
    )

    if experience_fallback:
        raw_profile[
            "years_of_experience"
        ] = experience_fallback

    # =========================================================================
    # EMAIL FALLBACK
    # =========================================================================

    if not raw_profile[
        "email_address"
    ]:

        raw_profile[
            "email_address"
        ] = extract_email_fallback(
            text
        )

    # =========================================================================
    # COLLEGE FALLBACK
    # =========================================================================

    college_fallback = (
        extract_college_names_fallback(
            text
        )
    )

    raw_profile[
        "college_name"
    ] = sorted(
        set(
            raw_profile[
                "college_name"
            ]
        )
        | set(
            college_fallback
        )
    )

    # =========================================================================
    # GRADUATION YEAR FALLBACK
    # =========================================================================

    year_fallback = (
        extract_graduation_years_fallback(
            text
        )
    )

    raw_profile[
        "graduation_year"
    ] = sorted(
        set(
            raw_profile[
                "graduation_year"
            ]
        )
        | set(
            year_fallback
        )
    )

    # =========================================================================
    # NAME FALLBACK
    # =========================================================================

    if not raw_profile[
        "name"
    ]:

        name_fallback = (
            extract_name_fallback(
                text
            )
        )

        if name_fallback:

            raw_profile[
                "name"
            ] = [
                name_fallback
            ]

    # =========================================================================
    # DEGREE
    # =========================================================================
    #
    # IMPORTANT:
    #
    # Do NOT use the raw NER Degree span directly.
    #
    # The NER model may produce:
    #
    # B.Tech...
    # TECHNICAL SKILLS
    # Python
    # Java
    # ReactJS
    #
    # as one Degree entity.
    #
    # We therefore replace it completely with the education-bounded
    # deterministic extractor.
    # =========================================================================

    raw_profile[
        "degree"
    ] = extract_degree_fallback(
        text
    )

    # =========================================================================
    # DESIGNATION CLEANUP
    # =========================================================================

    raw_profile[
        "designation"
    ] = filter_out_project_titles(
        raw_profile[
            "designation"
        ],
        text,
    )

    raw_profile[
        "designation"
    ] = filter_out_language_lists(
        raw_profile[
            "designation"
        ]
    )

    raw_profile[
        "designation"
    ] = filter_false_designations(
        raw_profile[
            "designation"
        ]
    )

    # =========================================================================
    # NAME CLEANUP
    # =========================================================================

    raw_profile[
        "name"
    ] = filter_false_name_values(
        raw_profile[
            "name"
        ]
    )

    # Designation: drop anything that's actually a project title (see
    # filter_out_project_titles for why this cross-check exists).
    raw_profile["designation"] = filter_out_project_titles(raw_profile["designation"], text)
    raw_profile["designation"] = filter_out_language_lists(raw_profile["designation"])


    return raw_profile


# ============================================================================
# BUILD MATCHING ENGINE RESUME DICT
# ============================================================================

def build_resume_dict_from_text(
    resume_text: str,
    resume_id: str = None,
    seniority: str = None,
    industry: str = None,
) -> dict:
    """
    Bridges raw resume text into the shape expected by:

        /match-score
        /skill-gap
        /rank-candidates

    The current NER model does not directly provide seniority/industry,
    so those values remain None unless supplied by the caller.
    """

    profile = parse_resume(
        resume_text
    )

    skills = profile[
        "skills_cleaned"
    ]

    skills_str = (
        "["
        + " ".join(
            f"'{skill}'"
            for skill in skills
        )
        + "]"
    )

    role = (
        profile[
            "designation"
        ][0]
        if profile[
            "designation"
        ]
        else ""
    )


    years_experience = None

    if profile.get(
        "years_of_experience"
    ):

        match = re.search(
            r"(\d+(?:\.\d+)?)",
            profile[
                "years_of_experience"
            ][0],
        )

        if match:

            years_experience = float(
                match.group(1)
            )

            if years_experience.is_integer():
                years_experience = int(
                    years_experience
                )

    return {
        "resume_id":
            resume_id
            or "PARSED_FROM_TEXT",

        "role":
            role,

        "seniority":
            seniority,

        "industry":
            industry,

        "skills":
            skills_str,

        # Keep raw resume text so the matching engine's
        # text similarity feature has meaningful input.
        "summary":
            resume_text,

        "experience_bullets":
            "",

        "years_experience":
            years_experience,
    }