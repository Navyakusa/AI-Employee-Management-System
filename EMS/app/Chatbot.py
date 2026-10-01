"""
Chatbot service for the AI Recruitment & Employee Management Platform.

This module is called by the FastAPI /chat endpoint in main.py.
"""

import os
from typing import Optional

from groq import Groq


# ============================================================
# CONFIGURATION
# ============================================================

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b"
)

# ============================================================
# SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are the AI assistant for an AI Recruitment and Employee
Management Platform.

Help users with questions about:

- Jobs
- Candidates
- Resume uploads
- Resume parsing
- AI resume screening
- Candidate matching
- Candidate ranking
- Skill gap analysis
- Shortlisted candidates
- Interviews
- Interview feedback
- Hiring manager activities
- Recruiter activities
- HR activities
- Employee management
- Notifications
- Dashboard features
- Recruitment workflows

Rules:

1. Give clear and professional answers.
2. Keep answers relevant to the recruitment and employee
   management platform.
3. Do not invent candidate, employee, job, interview, or
   database information.
4. Do not claim that a candidate has been selected,
   rejected, shortlisted, or approved unless that information
   is explicitly provided.
5. Do not expose API keys, passwords, JWT tokens, database
   credentials, or other secrets.
6. If the user asks about a specific record and the required
   information is not available, clearly say that the record
   information is not available to you.
7. If the question is unrelated to the platform, politely
   explain that you primarily assist with this platform.
8. Keep normal answers concise and useful.
9. Use numbered steps when explaining a process.
"""


# ============================================================
# GROQ CLIENT
# ============================================================

def _get_groq_client() -> Groq:

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY environment variable is not configured."
        )

    return Groq(
        api_key=api_key
    )


# ============================================================
# CHATBOT RESPONSE
# ============================================================

def get_chatbot_response(
    message: str,
    conversation_history: Optional[list] = None
) -> str:
    """
    Generate a chatbot response using Groq.

    Parameters
    ----------
    message:
        Current user message.

    conversation_history:
        Optional list containing previous conversation messages.

    Returns
    -------
    str
        AI-generated chatbot response.
    """

    # --------------------------------------------------------
    # Validate message
    # --------------------------------------------------------

    if not message or not message.strip():
        raise ValueError(
            "Message cannot be empty."
        )

    # --------------------------------------------------------
    # Create Groq client
    # --------------------------------------------------------

    client = _get_groq_client()

    # --------------------------------------------------------
    # Build messages
    # --------------------------------------------------------

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    # --------------------------------------------------------
    # Add previous conversation
    # --------------------------------------------------------

    if conversation_history:

        for item in conversation_history:

            if not isinstance(item, dict):
                continue

            role = item.get("role")
            content = item.get("content")

            if role not in {
                "user",
                "assistant"
            }:
                continue

            if not content:
                continue

            messages.append(
                {
                    "role": role,
                    "content": str(content)
                }
            )

    # --------------------------------------------------------
    # Add current message
    # --------------------------------------------------------

    messages.append(
        {
            "role": "user",
            "content": message.strip()
        }
    )

    # --------------------------------------------------------
    # Call Groq
    # --------------------------------------------------------

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        temperature=0.3,
        max_tokens=700
    )

    # --------------------------------------------------------
    # Extract response
    # --------------------------------------------------------

    if not completion.choices:
        raise RuntimeError(
            "Groq returned no response."
        )

    response = completion.choices[0].message.content

    if not response:
        raise RuntimeError(
            "Groq returned an empty chatbot response."
        )

    return response.strip()