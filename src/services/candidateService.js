// src/services/candidateService.js
//
// All candidate API calls live here. If an endpoint path is wrong,
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
  mapApplication,
  mapDashboard,
  mapInterview,
  isOfferVisibleToCandidate,
  mapJob,
  mapOffer,
  sortInterviews,
} from "./candidateHelpers";

const unwrap = (response) => response?.data?.data ?? null;

/* ---------------- PROFILE ---------------- */

export const getMyProfile = async () =>
  unwrap(await axiosInstance.get("/candidate-profile/my"));

export const updateMyProfile = async (payload) =>
  unwrap(await axiosInstance.put("/candidate-profile/my", payload));

/* ---------------- JOBS ---------------- */

export const getAllJobs = async () =>
  unwrap(await axiosInstance.get("/jobs/all")) || [];

export const getJobById = async (jobId) =>
  unwrap(await axiosInstance.get(`/jobs/${jobId}`));

/* ---------------- APPLICATIONS ---------------- */

export const getMyApplications = async () =>
  unwrap(await axiosInstance.get("/applications/my")) || [];

// The apply endpoint takes no body - it uses the candidate's profile.
export const applyToJob = async (jobId) =>
  unwrap(await axiosInstance.post(`/applications/apply/${jobId}`));

// /applications/my only returns ids, status and date (no job title or
// location), so the job details are joined in here. Newest first.
// (preloadedJobs is optional - the dashboard passes the jobs it already has)
export const getMyApplicationsWithJobs = async (preloadedJobs) => {
  const [applications, jobs] = await Promise.all([
    getMyApplications(),
    preloadedJobs ?? getAllJobs(),
  ]);

  const jobsById = new Map(
    jobs.map((job) => [String(job.id ?? job.jobId), mapJob(job)])
  );

  return applications
    .map((application) =>
      mapApplication(
        application,
        jobsById.get(String(application.jobId))
      )
    )
    .sort((a, b) => b.id - a.id);
};

/* ---------------- INTERVIEWS ---------------- */

export const getMyInterviews = async () =>
  unwrap(await axiosInstance.get("/interviews/my")) || [];

// Interviews only carry a jobId, so the job title is joined in here.
export const getMyInterviewsWithJobs = async (preloadedJobs) => {
  const [interviews, jobs] = await Promise.all([
    getMyInterviews(),
    preloadedJobs ?? getAllJobs(),
  ]);

  const jobsById = new Map(
    jobs.map((job) => [String(job.id ?? job.jobId), mapJob(job)])
  );

  return sortInterviews(
    interviews.map((interview) =>
      mapInterview(interview, jobsById.get(String(interview.jobId)))
    )
  );
};

/* ---------------- NOTIFICATIONS ---------------- */

export const getMyNotifications = async () =>
  unwrap(await axiosInstance.get("/notifications/my")) || [];

// the API returns a plain number in "data"
export const getUnreadCount = async () =>
  Number(unwrap(await axiosInstance.get("/notifications/unread-count")) ?? 0) || 0;

export const markNotificationRead = async (notificationId) =>
  axiosInstance.put(`/notifications/${notificationId}/read`);

export const markAllNotificationsRead = async () =>
  axiosInstance.put("/notifications/read-all");

export const deleteNotification = async (notificationId) =>
  axiosInstance.delete(`/notifications/${notificationId}`);

/* ---------------- DASHBOARD ---------------- */

export const getCandidateDashboard = async () => {
  // fetched once and shared, so nothing is requested twice
  const jobsPromise = getAllJobs().catch(() => []);
  const profilePromise = getMyProfile().catch(() => null);

  const [summary, jobs, profile, applications, interviews, offers] =
    await Promise.all([
      axiosInstance.get("/candidate-dashboard/summary").then(unwrap),
      jobsPromise,
      profilePromise,

      // The same sources the pages use, so the numbers always match.
      // A failure here just falls back to the backend summary.
      getMyApplicationsWithJobs(jobsPromise).catch(() => null),
      getMyInterviewsWithJobs(jobsPromise).catch(() => null),
      getMyOffers().catch(() => null),
    ]);

  return mapDashboard(summary || {}, jobs, profile, {
    applications,
    interviews,
    offers,
  });
};

/* ---------------- RESUME ---------------- */

// POST /resumes/upload is multipart: "candidateId" + "file".
// The backend reads the file itself and returns the extracted text
// and skills, so nothing needs to be parsed in the browser.
export const uploadResume = async (candidateId, file) => {
  const formData = new FormData();

  formData.append("candidateId", String(candidateId));
  formData.append("file", file);

  return unwrap(
    await axiosInstance.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

/* ---------------- OFFERS ---------------- */

// The backend now has a "my offers" endpoint that returns only the
// logged-in candidate's own offers, so GET /offers (which returned
// EVERY candidate's offers) is no longer used here.
export const getMyOffers = async () => {
  const offers = unwrap(await axiosInstance.get("/offers/my")) || [];

  return offers
    .filter(isOfferVisibleToCandidate)
    .map(mapOffer)
    .sort((a, b) => b.id - a.id);
};

// Neither call takes a body (there is nowhere to send a decline reason).
export const acceptOffer = async (offerId) =>
  unwrap(await axiosInstance.put(`/offers/${offerId}/accept`));

export const rejectOffer = async (offerId) =>
  unwrap(await axiosInstance.put(`/offers/${offerId}/reject`));
