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
from datetime import date


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