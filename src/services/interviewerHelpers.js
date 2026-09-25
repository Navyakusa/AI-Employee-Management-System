// src/services/interviewerHelpers.js
//
// Field-name mapping for interviewer data. If a backend DTO uses a
// different field name than the UI expects, this is the only file
// to fix — nothing in the page components should need to change.
//
// UPDATED: the backend added a dedicated interviewer-interview-controller
// (GET /interviewer/interviews/my, GET /interviewer/interviews/{id}) and
// the old generic /interviews/my now 403s for the interviewer role. We
// don't have confirmed field names for the new MyInterviewsResponseDto /
// InterviewerInterviewDto yet, so mapInterview() below checks several
// likely name variants (old generic shape AND plausible new-DTO names)
// before falling back to the joined candidate/job objects. Once real
// responses are confirmed, trim this down to the actual field names.

function splitDateTime(isoString) {
  if (!isoString) {
    return { date: "", time: "" };
  }

  const parsed = new Date(isoString);

  if (Number.isNaN(parsed.getTime())) {
    return { date: "", time: "" };
  }

  const date = parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return { date, time };
}

// Backend enums come back uppercase ("SCHEDULED", "ONLINE") but the
// UI's status/mode comparisons and CSS classes expect Title Case
// ("Scheduled", "Online") — this converts ANY-CASE single word into
// Title Case so it works regardless of what the backend sends.
function toTitleCase(value) {
  if (!value || typeof value !== "string") {
    return value ?? "";
  }

  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// CONFIRM with backend: does GET /candidates/{id} / /candidates/all
// return fields named exactly "name", "email", "experience", "skills"?
// Adjust the candidate?.xxx lines below once confirmed.
export function mapInterview(raw, candidate, job) {
  // The dedicated interviewer DTO may send date/time as a combined
  // ISO string (like the old DTO), or as separate fields — check both.
  const combined = splitDateTime(
    raw.interviewDateTime ?? raw.dateTime ?? raw.scheduledAt
  );

  const date = raw.date ?? raw.interviewDate ?? combined.date;
  const time = raw.time ?? raw.interviewTime ?? combined.time;

  const rawSkills = raw.skills ?? candidate?.skills;

  return {
    id: raw.interviewId ?? raw.id,
    applicationId: raw.applicationId,
    candidateId: raw.candidateId,
    jobId: raw.jobId,
    candidate: String(
      raw.candidateName ?? raw.candidate ?? candidate?.name ?? "Unknown Candidate"
    ),
    email: String(raw.candidateEmail ?? raw.email ?? candidate?.email ?? ""),
    experience: String(
      raw.candidateExperience ?? raw.experience ?? candidate?.experience ?? ""
    ),
    // Array.isArray guards against a wrong TYPE (e.g. a string or
    // object instead of an array) — ?? alone only guards against the
    // field being missing entirely, and a wrong type here previously
    // crashed the whole page (no error boundary in this app) when
    // something downstream called .map() or .length on it.
    skills: Array.isArray(rawSkills) ? rawSkills : [],
    job: String(
      raw.jobTitle ?? raw.job ?? job?.title ?? job?.jobTitle ?? "Unknown Position"
    ),
    date: String(date ?? ""),
    time: String(time ?? ""),
    // NOT YET CONFIRMED: no interviewType field at all in the real
    // response seen so far — ask backend whether this DTO is supposed
    // to include one, or whether "Technical" should just be assumed
    // for all interviewer-side interviews for now.
    type: String(raw.interviewType ?? raw.type ?? ""),
    mode: toTitleCase(raw.interviewMode ?? raw.mode),
    location: String(raw.location ?? ""),
    meetingLink: String(raw.meetingLink ?? ""),
    status: toTitleCase(raw.status),
    // NOT in the raw schema at all — there is no evaluationStatus field
    // from the backend yet. Flag this to backend: how should the UI
    // know if feedback was already submitted for this interview,
    // short of calling getEvaluationByInterviewId for every row?
    evaluationStatus: "Not Available",
    notes: raw.notes ? String(raw.notes) : "",
  };
}

// CONFIRMED via backend source (Notification.java entity):
//   { notificationId, userId, message, type, readStatus, createdAt }
// There is NO title field at all — only message + type. Real type
// enum values (from InterviewService.java / InterviewFeedbackService.java):
//   INTERVIEW_SCHEDULED, INTERVIEW_RESCHEDULED, INTERVIEW_CANCELLED,
//   INTERVIEW_EVALUATION_SUBMITTED
const NOTIFICATION_TITLES = {
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  INTERVIEW_RESCHEDULED: "Interview Rescheduled",
  INTERVIEW_CANCELLED: "Interview Cancelled",
  INTERVIEW_EVALUATION_SUBMITTED: "Evaluation Submitted",
};

export function mapNotification(raw) {
  return {
    id: raw.notificationId ?? raw.id,
    type: raw.type,
    title: NOTIFICATION_TITLES[raw.type] ?? "Notification",
    message: raw.message,
    time: raw.createdAt ?? "",
    read: Boolean(raw.readStatus),
  };
}

const FALLBACK_PROFILE = {
  name: "Interviewer Test",
  email: "interviewer2@gmail.com",
  phone: "+91 98765 43210",
  department: "IT",
  role: "INTERVIEWER",
  designation: "Technical Interviewer",
  location: "",
};

// CONFIRMED via backend source (EmployeeProfileDto.java):
//   { employeeId, employeeCode, name, email, phone, department,
//     designation, manager, location, employmentType, status }
// There is NO "role" field on this DTO at all — role is hardcoded
// "INTERVIEWER" client-side since this app already knows the logged-in
// user's role from login. "location" is kept here (even though the
// Profile page has no input for it) purely so updateMyProfile() can
// pass it through unchanged instead of accidentally blanking it —
// see the comment on updateMyProfile in interviewerService.js.
export function mapProfile(raw) {
  return {
    employeeId: raw.employeeId,
    employeeCode: raw.employeeCode ?? "",
    name: raw.name ?? FALLBACK_PROFILE.name,
    email: raw.email ?? FALLBACK_PROFILE.email,
    phone: raw.phone ?? FALLBACK_PROFILE.phone,
    department: raw.department ?? FALLBACK_PROFILE.department,
    role: "INTERVIEWER",
    designation: raw.designation ?? FALLBACK_PROFILE.designation,
    manager: raw.manager ?? "",
    location: raw.location ?? FALLBACK_PROFILE.location,
    employmentType: raw.employmentType ?? "",
    status: raw.status ?? "",
  };
}

// CONFIRMED via backend source (InterviewEvaluationDto.java, from
// GET /interviewer/evaluations/my and POST .../interview/{id}):
//   { evaluationId, interviewId, candidateId, candidateName, jobId,
//     jobTitle, interviewDateTime, technicalSkills, communication,
//     problemSolving, overallRating, strengths, areasForImprovement,
//     status ("DRAFT" | "SUBMITTED"), submittedAt }
// No candidateEmail, no interviewType, no separate "feedback" text,
// and NO recommendation field at all — the UI still collects a
// recommendation (kept per product decision), but the real backend
// has nowhere to store it, so it will always come back empty/null
// here even for evaluations that were submitted with one selected.
export function mapEvaluation(raw) {
  const { date } = splitDateTime(raw.interviewDateTime);

  return {
    evaluationId: raw.evaluationId,
    interviewId: raw.interviewId,
    candidateId: raw.candidateId,
    candidate: String(raw.candidateName ?? ""),
    email: "",
    job: String(raw.jobTitle ?? ""),
    interviewDate: date,
    interviewType: "",
    technicalRating: raw.technicalSkills,
    communicationRating: raw.communication,
    problemSolvingRating: raw.problemSolving,
    overallRating: raw.overallRating,
    strengths: String(raw.strengths ?? ""),
    improvementAreas: String(raw.areasForImprovement ?? ""),
    feedback: "",
    recommendation: raw.recommendation ?? null,
    // DRAFT -> "Pending", SUBMITTED -> "Submitted" (matches the UI's
    // existing status strings without touching every page).
    status: raw.status === "SUBMITTED" ? "Submitted" : "Pending",
    submittedAt: raw.submittedAt ?? null,
  };
}

function splitSkillsString(skills) {
  if (Array.isArray(skills)) {
    return skills;
  }

  if (typeof skills === "string" && skills.trim()) {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
}

// CONFIRMED via backend source (InterviewerCandidateDto.java, from
// GET /interviewer/candidates/my): skills is a comma-separated STRING
// on this DTO, not an array — split it here so every page downstream
// can keep treating candidate.skills as an array like it already does.
export function mapCandidateRow(raw) {
  const { date } = splitDateTime(raw.interviewDateTime);

  return {
    id: raw.candidateId,
    name: String(raw.candidateName ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    location: String(raw.location ?? ""),
    education: String(raw.education ?? ""),
    experience: String(raw.experience ?? ""),
    skills: splitSkillsString(raw.skills),
    resume: String(raw.resume ?? ""),
    job: String(raw.jobTitle ?? ""),
    jobId: raw.jobId,
    interviewId: raw.interviewId,
    interviewDate: date,
    interviewMode: toTitleCase(raw.interviewMode),
    interviewStatus: toTitleCase(raw.interviewStatus),
  };
}
