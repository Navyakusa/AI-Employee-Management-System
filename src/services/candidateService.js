
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

export const applyToJob = async (jobId) =>
  unwrap(await axiosInstance.post(`/applications/apply/${jobId}`));

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
      mapInterview(
        interview,
        jobsById.get(String(interview.jobId))
      )
    )
  );
};

/* ---------------- NOTIFICATIONS ---------------- */

export const getMyNotifications = async () =>
  unwrap(await axiosInstance.get("/notifications/my")) || [];

export const getUnreadCount = async () =>
  Number(
    unwrap(await axiosInstance.get("/notifications/unread-count")) ?? 0
  ) || 0;

export const markNotificationRead = async (notificationId) =>
  axiosInstance.put(`/notifications/${notificationId}/read`);

export const markAllNotificationsRead = async () =>
  axiosInstance.put("/notifications/read-all");

export const deleteNotification = async (notificationId) =>
  axiosInstance.delete(`/notifications/${notificationId}`);

/* ---------------- DASHBOARD ---------------- */

export const getCandidateDashboard = async () => {
  const jobsPromise = getAllJobs().catch(() => []);
  const profilePromise = getMyProfile().catch(() => null);

  const [summary, jobs, profile, applications, interviews, offers] =
    await Promise.all([
      axiosInstance
        .get("/candidate-dashboard/summary")
        .then(unwrap),
      jobsPromise,
      profilePromise,
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

export const getMyOffers = async () => {
  const offers = unwrap(await axiosInstance.get("/offers/my")) || [];

  return offers
    .filter(isOfferVisibleToCandidate)
    .map(mapOffer)
    .sort((a, b) => b.id - a.id);
};

export const acceptOffer = async (offerId) =>
  unwrap(await axiosInstance.put(`/offers/${offerId}/accept`));

export const rejectOffer = async (offerId) =>
  unwrap(await axiosInstance.put(`/offers/${offerId}/reject`));

/* ---------------- ONBOARDING ---------------- */

/* ---------------- ONBOARDING ---------------- */

// Get the logged-in candidate's onboarding record.
export const getMyOnboarding = async () =>
  unwrap(await axiosInstance.get("/onboarding/my"));

// Get documents for that onboarding record.
export const getMyOnboardingDocuments = async (onboardingId) => {
  const documents = unwrap(
    await axiosInstance.get(`/onboarding/${onboardingId}/documents`)
  );

  return documents || [];
};

// Upload a document for onboarding.
export const uploadOnboardingDocument = async (
  onboardingId,
  documentType,
  file
) => {
  const formData = new FormData();
  formData.append("file", file);

  return unwrap(
    await axiosInstance.post(
      `/onboarding/${onboardingId}/documents?documentType=${encodeURIComponent(documentType)}`,
      formData
    )
  );
};