// src/services/interviewerService.js
//
// All interviewer API calls live here. If an endpoint path is wrong,
// this is the only file to fix.
//
// axiosInstance already has baseURL "http://localhost:8080/api" and
// attaches the token, so paths here do NOT start with "/api".
//
// Every backend response looks like:
//   { success, message, data, timestamp }
// so each function returns response.data.data.

import axiosInstance from "./axiosInstance";
import {
  mapInterview,
  mapNotification,
  mapProfile,
  mapEvaluation,
} from "./interviewerHelpers";

const unwrap = (response) => response?.data?.data ?? null;

/* ---------------- INTERVIEWS ---------------- */

// The raw interview object only carries candidateId / jobId (confirmed
// via Swagger's schema — no name, email or job title come back), so
// they're joined in here the same way candidateService.js joins job
// titles into candidate-side interviews.
export const getMyInterviews = async () => {
  const [interviewsRaw, candidatesRaw, jobsRaw] = await Promise.all([
    axiosInstance
      .get("/interviews/my")
      .then(unwrap)
      .catch(() => []),
    axiosInstance
      .get("/candidates/all")
      .then(unwrap)
      .catch(() => []),
    axiosInstance
      .get("/jobs/all")
      .then(unwrap)
      .catch(() => []),
  ]);

  const interviews = interviewsRaw || [];
  const candidates = candidatesRaw || [];
  const jobs = jobsRaw || [];

  const candidatesById = new Map(
    candidates.map((candidate) => [
      String(candidate.id ?? candidate.candidateId),
      candidate,
    ])
  );

  const jobsById = new Map(
    jobs.map((job) => [String(job.id ?? job.jobId), job])
  );

  return interviews.map((raw) =>
    mapInterview(
      raw,
      candidatesById.get(String(raw.candidateId)),
      jobsById.get(String(raw.jobId))
    )
  );
};

/*
  GAP: no GET /interviews/{interviewId} exists yet. Once backend adds
  one, replace the workaround in getInterviewById() below.
*/
export const getInterviewById = async (interviewId) => {
  const interviews = await getMyInterviews();
  return (
    interviews.find((item) => String(item.id) === String(interviewId)) ||
    null
  );
};

/*
  GAP workaround: there is still no endpoint scoped to "candidates
  assigned to me". This derives the candidates list from getMyInterviews()
  instead — one row per interview (each interview already carries the
  candidate's name/email/job, joined in above). If a candidate has more
  than one interview with this interviewer, they'll appear more than
  once; ask backend if that's acceptable or if a real dedicated
  endpoint should be added later.
*/
export const getMyCandidatesList = async () => {
  const interviews = await getMyInterviews();

  return interviews.map((interview) => ({
    id: interview.candidateId,
    name: interview.candidate,
    email: interview.email,
    job: interview.job,
    experience: interview.experience,
    interviewDate: interview.date,
    interviewStatus: interview.status,
  }));
};

/*
  GAP workaround: it's unclear if GET /interview-feedback (no id) is
  scoped to the logged-in interviewer, so instead this builds the
  Pending + Submitted list by checking each completed interview
  individually via getEvaluationByInterviewId. This is one API call
  PER completed interview (N+1) — fine for a handful of interviews,
  but ask backend for a proper bulk "my evaluations" endpoint if the
  list grows.
*/
export const getMyEvaluationsList = async () => {
  const interviews = await getMyInterviews();
  const completed = interviews.filter(
    (interview) => interview.status === "Completed"
  );

  return Promise.all(
    completed.map(async (interview) => {
      const evaluation = await getEvaluationByInterviewId(interview.id);

      return {
        interviewId: interview.id,
        candidateId: interview.candidateId,
        candidate: interview.candidate,
        email: interview.email,
        job: interview.job,
        interviewDate: interview.date,
        interviewType: interview.type,
        status: evaluation ? "Submitted" : "Pending",
        rating: evaluation?.overallRating ?? null,
        recommendation: evaluation?.recommendation ?? null,
      };
    })
  );
};

/* ---------------- NOTIFICATIONS ---------------- */

export const getMyNotifications = async () => {
  const raw = unwrap(await axiosInstance.get("/notifications/my")) || [];
  return raw.map(mapNotification);
};

export const getUnreadNotificationCount = async () =>
  Number(unwrap(await axiosInstance.get("/notifications/unread-count")) ?? 0) ||
  0;

export const markNotificationRead = async (notificationId) =>
  axiosInstance.put(`/notifications/${notificationId}/read`);

export const markAllNotificationsRead = async () =>
  axiosInstance.put("/notifications/read-all");

/* ---------------- SETTINGS ---------------- */

// NOT YET CONFIRMED: does the generic Settings DTO carry these 4
// interviewer-specific boolean fields, or does interviewer need its
// own settings shape (the way Employee has EmployeeSettingsDto)?
export const getCurrentSettings = async () =>
  unwrap(await axiosInstance.get("/settings/current"));

export const saveSettings = async (settings) =>
  unwrap(await axiosInstance.put("/settings/save", settings));

/* ---------------- PROFILE ---------------- */

export const getMyProfile = async () => {
  const raw = await unwrap(await axiosInstance.get("/profile/get"));
  return raw ? mapProfile(raw) : null;
};

export const updateMyProfile = async (payload) => {
  const raw = unwrap(await axiosInstance.put("/profile/update", payload));
  return raw ? mapProfile(raw) : null;
};

/* ---------------- INTERVIEW FEEDBACK / EVALUATIONS ---------------- */

// NOT YET CONFIRMED: exact InterviewFeedbackDto field names for the
// request body (technicalRating, communicationRating, etc.).
export const submitEvaluation = async (payload) =>
  unwrap(await axiosInstance.post("/interview-feedback", payload));

export const getEvaluationByInterviewId = async (interviewId) => {
  try {
    const raw = unwrap(
      await axiosInstance.get(`/interview-feedback/interview/${interviewId}`)
    );
    return raw ? mapEvaluation(raw) : null;
  } catch {
    // No evaluation submitted yet for this interview.
    return null;
  }
};

/*
  GAP: unclear if GET /interview-feedback (no id) is scoped to the
  logged-in interviewer or returns everyone's feedback. Needed for
  InterviewerEvaluations.jsx's combined Pending + Submitted list.
  Confirm with backend before wiring that page up.
*/

/* ---------------- CANDIDATES ---------------- */

// GET /candidates/{id} works for InterviewerCandidateDetails.jsx, but
// there is no endpoint scoped to "candidates assigned to me" yet for
// InterviewerCandidates.jsx (the list page).
export const getCandidateById = async (candidateId) =>
  unwrap(await axiosInstance.get(`/candidates/${candidateId}`));

/* ---------------- RESUME ---------------- */

// NOT YET CONFIRMED: does the Candidate object include a resumeId
// field to pass in here?
export const getResumeView = async (resumeId) =>
  unwrap(await axiosInstance.get(`/resumes/${resumeId}/view`));
