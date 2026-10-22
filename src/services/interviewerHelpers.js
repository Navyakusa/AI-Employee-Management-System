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

// How long an interview is assumed to last. Once its start time plus this
// has passed, a still-"Scheduled" interview is treated as finished.
const INTERVIEW_DURATION_MINUTES = 60;

// Start of the interview as a timestamp (ms), or null if unknown.
function toTimestamp(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

// The backend never changes an interview's status on its own: it stays
// "SCHEDULED" until someone updates it manually, even long after the
// interview time has passed. So the UI works out the real status here:
//   - Scheduled / Rescheduled, time still ahead -> "Scheduled"
//   - Scheduled / Rescheduled, time has passed  -> "Completed"
//   - anything else (Completed, Cancelled)      -> unchanged
function effectiveStatus(rawStatus, scheduledAt, now = Date.now()) {
  const status = toTitleCase(rawStatus);
  const isPending = status === "Scheduled" || status === "Rescheduled";

  if (!isPending) return status;

  if (
    scheduledAt !== null &&
    scheduledAt + INTERVIEW_DURATION_MINUTES * 60 * 1000 < now
  ) {
    return "Completed";
  }

  return "Scheduled";
}

// CONFIRM with backend: does GET /candidates/{id} / /candidates/all
// return fields named exactly "name", "email", "experience", "skills"?
// Adjust the candidate?.xxx lines below once confirmed.
export function mapInterview(raw, candidate, job) {
  // The dedicated interviewer DTO may send date/time as a combined
  // ISO string (like the old DTO), or as separate fields — check both.
  const rawDateTime = raw.interviewDateTime ?? raw.dateTime ?? raw.scheduledAt;
  const combined = splitDateTime(rawDateTime);
  const scheduledAt = toTimestamp(rawDateTime);

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
    // Start time as a timestamp (ms) so pages can sort and compare
    // interviews by real date instead of by formatted text.
    scheduledAt,
    // What the backend actually has stored (e.g. "Scheduled").
    backendStatus: toTitleCase(raw.status),
    // Corrected for the clock: past interviews are no longer "Scheduled".
    status: effectiveStatus(raw.status, scheduledAt),
    // NOT in the raw schema at all — there is no evaluationStatus field
    // from the backend yet. Flag this to backend: how should the UI
    // know if feedback was already submitted for this interview,
    // short of calling getEvaluationByInterviewId for every row?
    evaluationStatus: "Not Available",
    notes: raw.notes ? String(raw.notes) : "",
  };
}

// One row from GET /interviewer/candidates/my (InterviewerCandidateDto):
//   candidateId, candidateName, email, phone, location, education,
//   experience, skills (comma-separated text), resume, linkedin,
//   portfolio, expectedSalary, noticePeriod, source, applicationDate,
//   candidateStatus, jobId, jobTitle, interviewId, interviewDateTime,
//   interviewMode, interviewStatus
// The backend builds one row per INTERVIEW, so a candidate with two
// interviews appears twice.
export function mapCandidateRow(raw = {}) {
  const scheduledAt = toTimestamp(raw.interviewDateTime);
  const { date, time } = splitDateTime(raw.interviewDateTime);

  // skills arrives as one string ("Java, React") - pages expect an array.
  const skills = Array.isArray(raw.skills)
    ? raw.skills
    : String(raw.skills ?? "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

  return {
    ...raw,
    id: raw.candidateId ?? raw.id,
    candidateId: raw.candidateId ?? raw.id,
    name: String(raw.candidateName ?? raw.name ?? "Unknown Candidate"),
    email: String(raw.email ?? raw.candidateEmail ?? ""),
    phone: String(raw.phone ?? ""),
    location: String(raw.location ?? ""),
    education: String(raw.education ?? ""),
    experience: String(raw.experience ?? ""),
    skills,
    resume: String(raw.resume ?? ""),
    job: String(raw.jobTitle ?? raw.job ?? "Unknown Position"),
    jobId: raw.jobId,
    interviewId: raw.interviewId,
    interviewDate: date,
    interviewTime: time,
    scheduledAt,
    interviewMode: toTitleCase(raw.interviewMode),
    candidateStatus: toTitleCase(raw.candidateStatus),
    // Same correction as mapInterview: past interviews aren't "Scheduled".
    backendInterviewStatus: toTitleCase(raw.interviewStatus),
    interviewStatus: effectiveStatus(raw.interviewStatus, scheduledAt),
  };
}

export function mapNotification(raw) {
  const statusSaysRead =
    typeof raw.status === "string" && raw.status.toUpperCase() === "READ";

  return {
    id: raw.id ?? raw.notificationId,
    type: raw.type,
    title: raw.title,
    message: raw.message,
    time: raw.time ?? raw.createdAt ?? "",
    read: raw.read ?? raw.isRead ?? statusSaysRead,
  };
}

const FALLBACK_PROFILE = {
  name: "Interviewer Test",
  email: "interviewer2@gmail.com",
  phone: "+91 98765 43210",
  department: "IT",
  role: "INTERVIEWER",
  designation: "Technical Interviewer",
};

export function mapProfile(raw) {
  return {
    name: raw.name ?? raw.userName ?? FALLBACK_PROFILE.name,
    email: raw.email ?? FALLBACK_PROFILE.email,
    phone: raw.phone ?? raw.phoneNumber ?? FALLBACK_PROFILE.phone,
    department: raw.department ?? FALLBACK_PROFILE.department,
    role: raw.role ?? "INTERVIEWER",
    designation: raw.designation ?? FALLBACK_PROFILE.designation,
  };
}

export function mapEvaluation(raw) {
  return {
    interviewId: raw.interviewId,
    candidateId: raw.candidateId,
    candidate: raw.candidate ?? raw.candidateName,
    email: raw.email ?? raw.candidateEmail,
    job: raw.job ?? raw.jobTitle,
    interviewDate: raw.interviewDate ?? raw.date,
    interviewType: raw.interviewType ?? raw.type,
    technicalRating: raw.technicalRating,
    communicationRating: raw.communicationRating,
    problemSolvingRating: raw.problemSolvingRating,
    overallRating: raw.overallRating,
    strengths: raw.strengths,
    improvementAreas: raw.improvementAreas,
    feedback: raw.feedback,
    recommendation: raw.recommendation,
    status: raw.status ?? "Submitted",
  };
}
