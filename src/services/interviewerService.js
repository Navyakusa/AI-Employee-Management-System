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
  mapCandidateRow,
} from "./interviewerHelpers";

const unwrap = (response) => response?.data?.data ?? null;

/* ---------------- INTERVIEWS ---------------- */

// CONFIRMED via real response from GET /interviewer/interviews/my:
//   {
//     data: {
//       scheduledCount, completedCount, totalCount,
//       interviews: [{ interviewId, candidateId, candidateName,
//         candidateEmail, jobId, jobTitle, interviewDateTime,
//         interviewMode, meetingLink, location, status, notes }]
//     }
//   }
// Two things this confirmed:
//   1. The array is nested under data.interviews, NOT data itself —
//      candidateName/candidateEmail/jobTitle are already included
//      directly on each interview, so the /candidates/all + /jobs/all
//      join below is now just a fallback for fields this DTO doesn't
//      send (experience, skills), not the primary data source.
//   2. status and interviewMode are UPPERCASE enums ("SCHEDULED",
//      "ONLINE"), not "Scheduled"/"Online" — normalized in
//      interviewerHelpers.js's mapInterview.
// Still unconfirmed: no interviewType field in this response at all —
// see the GAP note in interviewerHelpers.js.
export const getMyInterviews = async () => {
  const [responseData, candidatesRaw, jobsRaw] = await Promise.all([
    axiosInstance
      .get("/interviewer/interviews/my")
      .then(unwrap)
      .catch((err) => {
        console.error("GET /interviewer/interviews/my failed:", err);
        return null;
      }),
    axiosInstance
      .get("/candidates/all")
      .then(unwrap)
      .catch(() => []),
    axiosInstance
      .get("/jobs/all")
      .then(unwrap)
      .catch(() => []),
  ]);

  const interviews = responseData?.interviews ?? [];
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

// UPDATED: now uses the dedicated interviewer-interview-controller
// endpoint instead of the generic one.
export const getInterviewById = async (interviewId) => {
  const raw = unwrap(
    await axiosInstance
      .get(`/interviewer/interviews/${interviewId}`)
      .catch((err) => {
        console.error(
          `GET /interviewer/interviews/${interviewId} failed:`,
          err
        );
        throw err;
      })
  );

  if (!raw) {
    return null;
  }

  // Still need candidate + job details joined in, same as the list.
  const [candidate, job] = await Promise.all([
    getCandidateById(raw.candidateId).catch(() => null),
    axiosInstance
      .get(`/jobs/${raw.jobId}`)
      .then(unwrap)
      .catch(() => null),
  ]);

  return mapInterview(raw, candidate, job);
};

// CONFIRMED via backend source: GET /interviewer-dashboard/summary
// returns { interviewerId, todaysInterviews, upcomingInterviews,
// completedInterviews, pendingEvaluations, todaysSchedule: [Interview],
// evaluationQueue: [Interview] } — todaysSchedule/evaluationQueue are
// RAW Interview entities (interviewId, candidateId, jobId, ..., no
// candidate name or job title), so they're joined against
// /candidates/all + /jobs/all the same way getMyInterviews() does.
//
// CONFIRMED BACKEND BUG (InterviewerDashboardService.java): both
// pendingEvaluations and evaluationQueue use the EXACT SAME query as
// completedInterviews — there is no check for whether an evaluation
// was already submitted. This means the raw backend values would
// always equal completedInterviews, even for interviews you've
// already evaluated. Worked around here by cross-referencing the real
// evaluations list and filtering out anything already Submitted.
// Report this to backend: pendingEvaluations should exclude interviews
// that already have a SUBMITTED InterviewEvaluation row.
export const getDashboardSummary = async () => {
  const [summaryRaw, candidatesRaw, jobsRaw, evaluationsList] =
    await Promise.all([
      axiosInstance
        .get("/interviewer-dashboard/summary")
        .then(unwrap)
        .catch((err) => {
          console.error("GET /interviewer-dashboard/summary failed:", err);
          return null;
        }),
      axiosInstance
        .get("/candidates/all")
        .then(unwrap)
        .catch(() => []),
      axiosInstance
        .get("/jobs/all")
        .then(unwrap)
        .catch(() => []),
      getMyEvaluationsList().catch(() => []),
    ]);

  const summary = summaryRaw || {};
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

  const mapRawInterview = (raw) =>
    mapInterview(
      raw,
      candidatesById.get(String(raw.candidateId)),
      jobsById.get(String(raw.jobId))
    );

  const todaysSchedule = (summary.todaysSchedule ?? []).map(mapRawInterview);

  const submittedInterviewIds = new Set(
    evaluationsList
      .filter((evaluation) => evaluation.status === "Submitted")
      .map((evaluation) => String(evaluation.interviewId))
  );

  const evaluationQueue = (summary.evaluationQueue ?? [])
    .map(mapRawInterview)
    .filter((interview) => !submittedInterviewIds.has(String(interview.id)));

  return {
    todaysInterviews: Number(summary.todaysInterviews ?? 0),
    upcomingInterviews: Number(summary.upcomingInterviews ?? 0),
    completedInterviews: Number(summary.completedInterviews ?? 0),
    // Corrected count, not the buggy backend value — see comment above.
    pendingEvaluations: evaluationQueue.length,
    todaysSchedule,
    evaluationQueue,
  };
};

/*
  GAP workaround retired: this used to derive the candidates list from
  getMyInterviews() since no dedicated endpoint existed. Now uses
  GET /interviewer/candidates/my directly — see the function below.
*/

// CONFIRMED via backend source: GET /interviewer/candidates/my exists
// and returns { totalCandidates, scheduledCandidates,
// completedCandidates, candidates: [InterviewerCandidateDto] }.
// IMPORTANT: this does NOT deduplicate by candidate either — backend
// source (InterviewerCandidateService.java) builds one row per
// INTERVIEW, same as our old workaround. A candidate with 2 interviews
// with you still shows up twice — that's a backend design choice, not
// something fixable from here.
export const getMyCandidatesList = async () => {
  const raw = unwrap(
    await axiosInstance
      .get("/interviewer/candidates/my")
      .catch((err) => {
        console.error("GET /interviewer/candidates/my failed:", err);
        return null;
      })
  );

  const rows = raw?.candidates ?? [];
  return rows.map(mapCandidateRow);
};

// CONFIRMED via backend source: GET /interviewer/evaluations/my
// returns { pendingCount, submittedCount, totalCount, evaluations }.
// BUT that "evaluations" list only contains interviews that already
// have an InterviewEvaluation database row (backend source:
// evaluationRepository.findByInterviewerId — no auto-creation of a
// placeholder row for completed-but-not-yet-started evaluations). A
// completed interview with NO evaluation row at all won't appear in
// that list, so it's merged here with getMyInterviews() to synthesize
// a "Pending" entry for anything completed that's missing one —
// otherwise those interviews would silently vanish from this page
// instead of showing up as something to evaluate.
export const getMyEvaluationsList = async () => {
  const [rawResponse, interviews] = await Promise.all([
    axiosInstance
      .get("/interviewer/evaluations/my")
      .then(unwrap)
      .catch((err) => {
        console.error("GET /interviewer/evaluations/my failed:", err);
        return null;
      }),
    getMyInterviews(),
  ]);

  const existingEvaluations = (rawResponse?.evaluations ?? []).map(
    mapEvaluation
  );

  const existingInterviewIds = new Set(
    existingEvaluations.map((evaluation) => String(evaluation.interviewId))
  );

  const syntheticPending = interviews
    .filter(
      (interview) =>
        interview.status === "Completed" &&
        !existingInterviewIds.has(String(interview.id))
    )
    .map((interview) => ({
      evaluationId: null,
      interviewId: interview.id,
      candidateId: interview.candidateId,
      candidate: interview.candidate,
      email: interview.email,
      job: interview.job,
      interviewDate: interview.date,
      interviewType: interview.type,
      status: "Pending",
      recommendation: null,
    }));

  return [
    ...existingEvaluations.map((evaluation) => ({
      ...evaluation,
      rating: evaluation.overallRating,
    })),
    ...syntheticPending,
  ];
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

// New endpoints your backend teammate just added:
export const deleteNotification = async (notificationId) =>
  axiosInstance.delete(`/notifications/${notificationId}`);

export const getNotificationStats = async () =>
  unwrap(await axiosInstance.get("/notifications/stats"));

/* ---------------- SETTINGS ---------------- */

// CONFIRMED via backend source: /api/settings/current and
// /api/settings/save were never the right endpoints — that
// SettingsController serves a global, organization-wide Settings
// entity (organizationName, supportEmail, maintenanceMode, etc.),
// completely unrelated to per-user notification preferences.
//
// The real per-user endpoint is /api/employee-settings/my
// (EmployeeSettingsController), which works for the interviewer
// account too since it's backed by the same Employee record Profile
// uses. It only supports 3 real fields though — NOT the 4 toggles
// the original mock UI had:
//   emailNotifications, systemNotifications, darkMode
// There is no backend field anywhere for "Evaluation Reminders" or
// "Evaluation Confirmation" specifically — ask backend if those need
// their own fields added, or if emailNotifications/systemNotifications
// should just cover them for now.
export const getCurrentSettings = async () =>
  unwrap(await axiosInstance.get("/employee-settings/my"));

export const saveSettings = async (settings) =>
  unwrap(
    await axiosInstance.put("/employee-settings/my", {
      emailNotifications: settings.emailNotifications,
      systemNotifications: settings.systemNotifications,
      darkMode: settings.darkMode,
    })
  );

/* ---------------- PROFILE ---------------- */

export const getMyProfile = async () => {
  const raw = await unwrap(await axiosInstance.get("/profile/get"));
  return raw ? mapProfile(raw) : null;
};

// CONFIRMED via backend source (ProfileController.java): this endpoint
// uses @RequestParam, NOT @RequestBody — it expects QUERY STRING
// parameters, not a JSON body. All 5 are required by Spring even if
// unchanged (a missing param throws before the service layer's
// "only update if non-blank" logic ever runs), so every call must
// include userName, email, phone, department, AND location — even
// though "location" isn't shown anywhere in the Profile UI. Passing
// it through unchanged from what was loaded avoids silently wiping it.
export const updateMyProfile = async (payload) => {
  const raw = unwrap(
    await axiosInstance.put("/profile/update", null, {
      params: {
        userName: payload.name ?? "",
        email: payload.email ?? "",
        phone: payload.phone ?? "",
        department: payload.department ?? "",
        location: payload.location ?? "",
      },
    })
  );
  return raw ? mapProfile(raw) : null;
};

/* ---------------- INTERVIEW EVALUATIONS ---------------- */

// CONFIRMED via backend source: the real endpoint is
// POST /interviewer/evaluations/interview/{interviewId} — NOT
// /interview-feedback (that was the wrong endpoint this whole time).
// Real request body (InterviewEvaluationRequestDto):
//   { technicalSkills, communication, problemSolving, overallRating,
//     strengths, areasForImprovement }
// There is NO recommendation field on the real DTO. The evaluation
// form still collects one (kept per product decision — ask backend
// to add a matching field if it should actually be saved), but it is
// intentionally left out of this request body since the backend has
// nowhere to store it.
export const submitEvaluation = async (payload) => {
  const raw = unwrap(
    await axiosInstance.post(
      `/interviewer/evaluations/interview/${payload.interviewId}`,
      {
        technicalSkills: payload.technicalRating,
        communication: payload.communicationRating,
        problemSolving: payload.problemSolvingRating,
        overallRating: payload.overallRating ?? null,
        strengths: payload.strengths,
        areasForImprovement: payload.improvementAreas,
      }
    )
  );

  return raw ? mapEvaluation(raw) : null;
};

// CONFIRMED via backend source: there is no direct "get evaluation by
// interviewId" endpoint — only by evaluationId (GET
// /interviewer/evaluations/{evaluationId}), or the full list (GET
// /interviewer/evaluations/my). Since evaluationId isn't known from
// the interviewId alone, this fetches the full list and searches it
// client-side instead.
export const getEvaluationByInterviewId = async (interviewId) => {
  const raw = unwrap(
    await axiosInstance
      .get("/interviewer/evaluations/my")
      .catch((err) => {
        console.error("GET /interviewer/evaluations/my failed:", err);
        return null;
      })
  );

  const evaluations = raw?.evaluations ?? [];
  const match = evaluations.find(
    (evaluation) => String(evaluation.interviewId) === String(interviewId)
  );

  return match ? mapEvaluation(match) : null;
};

/* ---------------- PASSWORD ---------------- */

// NOT YET CONFIRMED LIVE: backend team described adding this endpoint
// but it did not exist in the source code we reviewed. If this 404s,
// it means it hasn't been deployed yet — that's expected, not a bug
// on our end. ChangePasswordDto requires all 3 fields.
export const changePassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
}) =>
  unwrap(
    await axiosInstance.put("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    })
  );

/* ---------------- CANDIDATES ---------------- */

// UPDATED: the generic GET /candidates/{id} started returning 403 for
// the interviewer role — same pattern as /interviews/my. Backend added
// a dedicated interviewer-candidate-details-controller endpoint for
// this exact purpose; using that instead.
export const getCandidateById = async (candidateId) =>
  unwrap(
    await axiosInstance
      .get(`/interviewer/candidate-details/${candidateId}`)
      .catch((err) => {
        console.error(
          `GET /interviewer/candidate-details/${candidateId} failed:`,
          err
        );
        throw err;
      })
  );

/* ---------------- RESUME ---------------- */

// NOT YET CONFIRMED: does the Candidate object include a resumeId
// field to pass in here?
export const getResumeView = async (resumeId) =>
  unwrap(await axiosInstance.get(`/resumes/${resumeId}/view`));
