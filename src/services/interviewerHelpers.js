// src/services/interviewerHelpers.js
//
// Field-name mapping for interviewer data. If a backend DTO uses a
// different field name than the UI expects, this is the only file
// to fix — nothing in the page components should need to change.
//
// CONFIRMED via Swagger's documented response schema for
// GET /interviews/my (the actual raw interview shape has only ids,
// no candidate name / email / job title):
//   { interviewId, applicationId, candidateId, jobId, interviewerId,
//     interviewDateTime, interviewType, interviewMode, meetingLink,
//     location, notes, createdAt, status }
//
// So mapInterview() now takes the raw interview PLUS the matching
// candidate and job objects (joined in interviewerService.js, same
// pattern as candidateHelpers.js's mapInterview) and merges them into
// the flat shape the page components expect.

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

// CONFIRM with backend: does GET /candidates/{id} / /candidates/all
// return fields named exactly "name", "email", "experience", "skills"?
// Adjust the candidate?.xxx lines below once confirmed.
export function mapInterview(raw, candidate, job) {
  const { date, time } = splitDateTime(raw.interviewDateTime);

  return {
    id: raw.interviewId,
    applicationId: raw.applicationId,
    candidateId: raw.candidateId,
    jobId: raw.jobId,
    candidate: candidate?.name ?? "Unknown Candidate",
    email: candidate?.email ?? "",
    experience: candidate?.experience ?? "",
    skills: candidate?.skills ?? [],
    job: job?.title ?? job?.jobTitle ?? "Unknown Position",
    date,
    time,
    type: raw.interviewType,
    mode: raw.interviewMode,
    location: raw.location,
    meetingLink: raw.meetingLink,
    status: raw.status,
    // NOT in the raw schema at all — there is no evaluationStatus field
    // from the backend yet. Flag this to backend: how should the UI
    // know if feedback was already submitted for this interview,
    // short of calling getEvaluationByInterviewId for every row?
    evaluationStatus: "Not Available",
    notes: raw.notes,
  };
}

export function mapNotification(raw) {
  return {
    id: raw.id ?? raw.notificationId,
    type: raw.type,
    title: raw.title,
    message: raw.message,
    time: raw.time ?? raw.createdAt ?? "",
    read: raw.read ?? raw.isRead ?? false,
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
