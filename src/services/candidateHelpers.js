// src/services/candidateHelpers.js
//
// Small helpers that convert backend data into what the candidate
// pages display. Every page imports from here, so if a backend field
// name or format changes, this is the only file to touch.

// The backend jobs have no company field, so one name is used everywhere.
// Change it here if needed.
export const COMPANY_NAME = "Anasol Technologies";

/* ---------------------------------------------------------- */
/* GENERAL                                                     */
/* ---------------------------------------------------------- */

export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const toNumberOrNull = (value) =>
  value === null || value === undefined || value === ""
    ? null
    : Number(value);

// Two-letter ALL-CAPS words are kept as they are ("HR", "IT", "QA"),
// everything else becomes "Capitalised".
export const titleCase = (value) =>
  String(value ?? "")
    .trim()
    .split(/(\s+)/)
    .map((word) =>
      word.length <= 2 && /^[A-Z]+$/.test(word)
        ? word
        : word.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
    )
    .join("");

// "Java, Spring Boot,React" -> ["Java", "Spring Boot", "React"]
export const splitList = (value) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const splitLines = (value) =>
  String(value ?? "")
    .split(/\r?\n|•/)
    .map((item) => item.trim())
    .filter(Boolean);

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "21 Sep 2026" - fixed month names, because toLocaleDateString gives
// "Sept" on some browsers and "Sep" on others.
const formatDateParts = (date) =>
  `${String(date.getDate()).padStart(2, "0")} ${
    MONTHS[date.getMonth()]
  } ${date.getFullYear()}`;

// Backend sends microseconds ("...09.244179") which Safari cannot parse.
export const parseDate = (value) => {
  if (!value) return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));

  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3])
    );
  }

  const date = new Date(String(value).replace(/(\.\d{3})\d+/, "$1"));

  return Number.isNaN(date.getTime()) ? null : date;
};

export const timeAgo = (value) => {
  const date = parseDate(value);

  if (!date) return "";

  const minutes = Math.floor(
    (Date.now() - date.getTime()) / 60000
  );

  if (minutes < 1) return "Just now";

  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }

  return formatDateParts(date);
};

/* ---------------------------------------------------------- */
/* JOBS                                                        */
/* ---------------------------------------------------------- */

// "Full-Time" and "Full Time" both become "Full Time"
export const formatEmploymentType = (value) => {
  const cleaned = String(value ?? "")
    .replace(/[-_]/g, " ")
    .trim();

  return cleaned ? titleCase(cleaned) : "Not specified";
};

export const formatExperience = (min, max) => {
  const low = toNumberOrNull(min);
  const high = toNumberOrNull(max);

  if (low === null && high === null) return "Not specified";

  if (low !== null && high !== null) {
    if (low === high) return `${low} ${low === 1 ? "Year" : "Years"}`;
    return `${low} - ${high} Years`;
  }

  if (low !== null) return `${low}+ Years`;

  return `Up to ${high} Years`;
};

const toLakhs = (amount) => {
  const lakhs = amount / 100000;

  return Number.isInteger(lakhs)
    ? String(lakhs)
    : lakhs.toFixed(1).replace(/\.0$/, "");
};

// 600000 / 1000000 -> "₹6 - 10 LPA"
export const formatSalary = (min, max) => {
  const low = toNumberOrNull(min);
  const high = toNumberOrNull(max);

  if (!low && !high) return "Not disclosed";

  if (low && high && low !== high) {
    return `₹${toLakhs(low)} - ${toLakhs(high)} LPA`;
  }

  return `₹${toLakhs(low || high)} LPA`;
};

// Works for /jobs/all, /jobs/{id} and the dashboard's recommendedJobs
// (the dashboard uses "jobId", the jobs API uses "id").
export const mapJob = (job = {}) => {
  const experience = formatExperience(
    job.experienceMin,
    job.experienceMax
  );

  const education = String(job.education ?? "").trim();
  const preferredSkills = splitList(job.preferredSkills);

  // The backend has no "requirements" field, so build it from the
  // fields it does have.
  const requirements = [];

  if (education) {
    requirements.push(`Education: ${education}`);
  }

  if (experience !== "Not specified") {
    requirements.push(`Experience: ${experience}`);
  }

  if (preferredSkills.length > 0) {
    requirements.push(
      `Preferred skills: ${preferredSkills.join(", ")}`
    );
  }

  return {
    id: job.id ?? job.jobId,
    title: job.title || "Untitled Job",
    company: COMPANY_NAME,
    department: titleCase(job.department) || "General",
    location: job.location || "Not specified",
    experience,
    type: formatEmploymentType(job.employmentType),
    salary: formatSalary(job.salaryMin, job.salaryMax),
    openings: job.openings ?? 1,
    education: education || "Not specified",
    posted: timeAgo(job.createdDate),
    skills: splitList(job.requiredSkills),
    description: job.description || "",
    responsibilities: splitLines(job.responsibilities),
    requirements,
    status: String(job.status || "OPEN").toUpperCase(),
  };
};

/* ---------------------------------------------------------- */
/* PROFILE                                                     */
/* ---------------------------------------------------------- */

export const EMPTY_PROFILE = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  education: "",
  experience: "",
  skills: "",
  linkedin: "",
  portfolio: "",
  expectedSalary: "",
  noticePeriod: "",
  resume: "",
};

/* ---------------------------------------------------------- */
/* REMEMBERED RESUME (stopgap)                                 */
/* ---------------------------------------------------------- */

// After an upload the profile API still returns resume: "", so the
// page would forget the file on refresh. Until the backend fills that
// field, the uploaded file's name/date is remembered in THIS browser
// (per account email). The backend's own value always wins when set.
const RESUME_KEY = "candidateResume:";

const resumeKey = (email) =>
  RESUME_KEY + String(email ?? "").trim().toLowerCase();

export const readRememberedResume = (email) => {
  try {
    const raw = localStorage.getItem(resumeKey(email));

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const rememberResume = (email, info) => {
  try {
    localStorage.setItem(resumeKey(email), JSON.stringify(info));
  } catch {
    // storage full / blocked: the upload itself still worked
  }
};

// Backend -> page
export const fromApiProfile = (profile = {}) => ({
  fullName: profile.name || "",
  email: profile.email || "",
  phone: profile.phone || "",
  location: profile.location || "",
  education: profile.education || "",
  experience: profile.experience || "",
  skills: profile.skills || "",
  linkedin: profile.linkedin || "",
  portfolio: profile.portfolio || "",
  expectedSalary: profile.expectedSalary
    ? String(profile.expectedSalary)
    : "",
  noticePeriod: profile.noticePeriod || "",
  resume:
    profile.resume ||
    readRememberedResume(profile.email)?.name ||
    "",
});

const parseSalary = (value) => {
  const number = parseFloat(
    String(value ?? "").replace(/[^0-9.]/g, "")
  );

  return Number.isFinite(number) ? number : 0;
};

// Page -> backend (PUT /candidate-profile/my).
// Email and resume are not part of this request.
export const toApiProfile = (profile) => ({
  name: profile.fullName.trim(),
  phone: profile.phone.trim(),
  location: profile.location.trim(),
  education: profile.education.trim(),
  experience: profile.experience.trim(),
  skills: splitList(profile.skills).join(", "),
  linkedin: profile.linkedin.trim(),
  portfolio: profile.portfolio.trim(),
  expectedSalary: parseSalary(profile.expectedSalary),
  noticePeriod: profile.noticePeriod.trim(),
});

// 800000 -> "₹8,00,000"
export const formatRupees = (value) => {
  const number = parseSalary(value);

  return number ? `₹${number.toLocaleString("en-IN")}` : "";
};

const COMPLETION_FIELDS = [
  "fullName",
  "email",
  "phone",
  "location",
  "education",
  "experience",
  "skills",
  "linkedin",
  "portfolio",
  "expectedSalary",
  "noticePeriod",
  "resume",
];

// The profile API has no completion percentage, so it is worked out
// from how many profile fields are filled in.
export const calcProfileCompletion = (profile) => {
  const filled = COMPLETION_FIELDS.filter((field) =>
    String(profile[field] ?? "").trim()
  ).length;

  return Math.round((filled / COMPLETION_FIELDS.length) * 100);
};

/* ---------------------------------------------------------- */
/* APPLICATIONS                                                */
/* ---------------------------------------------------------- */

// "21 Sep 2026" (empty string when the backend has no date)
export const formatDate = (value) => {
  const date = parseDate(value);

  return date ? formatDateParts(date) : "";
};

// Backend status -> label shown in the UI, and how far along the
// 5-step timeline the application is (0 = no progress shown).
//
// Only APPLIED and WITHDRAWN have been seen from the API so far.
// The other names are best guesses - if the backend uses different
// words, add them here. Nothing else needs to change.
const STATUS_INFO = {
  APPLIED: { label: "Applied", step: 1 },

  SCREENED: { label: "AI Screened", step: 2 },
  AI_SCREENED: { label: "AI Screened", step: 2 },
  UNDER_REVIEW: { label: "AI Screened", step: 2 },

  SHORTLISTED: { label: "Shortlisted", step: 3 },

  INTERVIEW: { label: "Interview", step: 4 },
  INTERVIEW_SCHEDULED: { label: "Interview", step: 4 },
  INTERVIEWED: { label: "Interview", step: 4 },

  SELECTED: { label: "Selected", step: 5 },
  APPROVED: { label: "Selected", step: 5 },
  OFFERED: { label: "Selected", step: 5 },
  HIRED: { label: "Selected", step: 5 },

  REJECTED: { label: "Rejected", step: 5 },

  WITHDRAWN: { label: "Withdrawn", step: 0 },
};

export const APPLICATION_STATUS_FILTERS = [
  "Applied",
  "AI Screened",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
  "Withdrawn",
];

export const getStatusInfo = (status) => {
  const key = String(status ?? "").toUpperCase();

  return (
    STATUS_INFO[key] || {
      label: titleCase(key.replace(/_/g, " ").toLowerCase()) || "Applied",
      step: 1,
    }
  );
};

// application = item from GET /applications/my
// job         = the same job already run through mapJob (may be missing)

export const mapApplication = (application = {}, job) => {
  const rawStatus = String(
    application.status ?? application.applicationStatus ?? ""
  ).toUpperCase();

  const info = getStatusInfo(rawStatus);

  return {
    id: application.applicationId ?? application.id,
    jobId: application.jobId,
    jobTitle: job?.title || `Job #${application.jobId}`,
    company: COMPANY_NAME,
    location: job?.location || "Not specified",
    type: job?.type || "Not specified",
    appliedDate: formatDate(
      application.appliedAt ?? application.applicationDate
    ),
    status: info.label,
    rawStatus,
    currentStep: info.step,
    applicationCode: `APP-${String(
      application.applicationId ?? application.id
    ).padStart(4, "0")}`,
  };
};

/* ---------------------------------------------------------- */
/* INTERVIEWS                                                  */
/* ---------------------------------------------------------- */

const pad2 = (number) => String(number).padStart(2, "0");

// "11:00 AM"
export const formatTime = (value) => {
  const date = parseDate(value);

  if (!date) return "";

  const hours = date.getHours();

  return `${pad2(hours % 12 || 12)}:${pad2(date.getMinutes())} ${
    hours >= 12 ? "PM" : "AM"
  }`;
};

// Only "SCHEDULED" has been seen from the API. The other names are
// guesses - add the real ones here if they differ.
const INTERVIEW_STATUS = {
  SCHEDULED: "Upcoming",
  RESCHEDULED: "Upcoming",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  CANCELED: "Cancelled",
};

export const getInterviewStatus = (status) => {
  const key = String(status ?? "").toUpperCase();

  return (
    INTERVIEW_STATUS[key] ||
    titleCase(key.replace(/_/g, " ").toLowerCase()) ||
    "Upcoming"
  );
};

// "TECHNICAL" -> "Technical Interview", "HR Interview" stays as is
const formatInterviewType = (value) => {
  const cleaned = titleCase(
    String(value ?? "").replace(/[-_]/g, " ")
  );

  if (!cleaned) return "Interview";

  return /interview/i.test(cleaned)
    ? cleaned
    : `${cleaned} Interview`;
};

const getMeetingPlatform = (link) => {
  const value = String(link ?? "").toLowerCase();

  if (value.includes("meet.google")) return "Google Meet";
  if (
    value.includes("teams.microsoft") ||
    value.includes("teams.live")
  ) {
    return "Microsoft Teams";
  }
  if (value.includes("zoom.us")) return "Zoom";

  return "Online Meeting";
};

// interview = item from GET /interviews/my (or the dashboard's
//             upcomingInterview, which has the same fields)
// job       = the same job already run through mapJob (may be missing)
export const mapInterview = (interview = {}, job) => {
  const mode = String(interview.interviewMode ?? "");

  const isOnline = mode
    ? /online|virtual|video|remote/i.test(mode)
    : Boolean(interview.meetingLink);

  return {
    id: interview.interviewId,
    applicationId: interview.applicationId,
    jobId: interview.jobId,
    jobTitle: job?.title || `Job #${interview.jobId}`,
    company: COMPANY_NAME,
    dateTime: interview.interviewDateTime,
    date: formatDate(interview.interviewDateTime),
    time: formatTime(interview.interviewDateTime),
    type: formatInterviewType(interview.interviewType),
    mode: isOnline ? "Online" : "On-site",
    platform: isOnline
      ? getMeetingPlatform(interview.meetingLink)
      : interview.location || "To be confirmed",
    meetingLink: interview.meetingLink || null,
    location: isOnline
      ? null
      : interview.location || "To be confirmed",
    // The API only sends an interviewer id, not a name.
    interviewer: "Interview Panel",
    status: getInterviewStatus(interview.status),
    // The API's "notes" field is shown as the instructions list.
    instructions: splitLines(interview.notes),
  };
};

// Upcoming first (soonest first), then the rest (newest first)
export const sortInterviews = (list) => {
  const time = (item) => parseDate(item.dateTime)?.getTime() ?? 0;

  const upcoming = list
    .filter((item) => item.status === "Upcoming")
    .sort((a, b) => time(a) - time(b));

  const others = list
    .filter((item) => item.status !== "Upcoming")
    .sort((a, b) => time(b) - time(a));

  return [...upcoming, ...others];
};

/* ---------------------------------------------------------- */
/* NOTIFICATIONS                                               */
/* ---------------------------------------------------------- */

// Pages tell the navbar to refresh its unread badge / name.
export const NOTIFICATIONS_CHANGED_EVENT =
  "candidate:notifications-changed";
export const PROFILE_CHANGED_EVENT = "candidate:profile-changed";

export const notifyNotificationsChanged = () =>
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));

export const notifyProfileChanged = () =>
  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));

// The backend has a free-text "type" (real values not seen yet, the
// list was empty). It is sorted into the 4 groups the page filters by.
export const getNotificationCategory = (type) => {
  const value = String(type ?? "").toUpperCase();

  if (value.includes("INTERVIEW")) return "INTERVIEW";
  if (value.includes("OFFER")) return "OFFER";

  if (
    /APPLICATION|APPLY|APPLIED|SHORTLIST|SCREEN|REJECT|STATUS/.test(
      value
    )
  ) {
    return "APPLICATION";
  }

  if (value.includes("JOB")) return "JOB";

  return "GENERAL";
};

export const mapNotification = (notification = {}) => ({
  id: notification.notificationId,
  type: getNotificationCategory(notification.type),
  // The API has no title, so it is made from the type:
  // "INTERVIEW_SCHEDULED" -> "Interview Scheduled"
  title:
    titleCase(
      String(notification.type ?? "")
        .replace(/[_-]/g, " ")
        .toLowerCase()
    ) ||
    "Notification",
  message: notification.message || "",
  time: timeAgo(notification.createdAt),
  read: Boolean(notification.readStatus),
});

/* ---------------------------------------------------------- */
/* DASHBOARD                                                   */
/* ---------------------------------------------------------- */

// summary = GET /candidate-dashboard/summary -> data
// jobs    = GET /jobs/all -> data
// profile = GET /candidate-profile/my -> data (optional)
// lists   = the SAME mapped lists the detail pages use (all optional):
//             applications = getMyApplicationsWithJobs()
//             interviews   = getMyInterviewsWithJobs()
//             offers       = getMyOffers()
//
// Why: the backend's dashboard summary looks the candidate up differently
// from the applications / interviews / offers endpoints, so its counts
// and lists did not match the pages ("1" on the dashboard, "2" on My
// Applications). Anything that can be taken from the page's own list is
// taken from there, so the dashboard and the pages always agree.
// The summary is only the fallback when one of those lists failed to load.
export const mapDashboard = (
  summary = {},
  jobs = [],
  profile = null,
  { applications, interviews, offers } = {}
) => {
  const jobsById = new Map(
    jobs.map((job) => [String(job.id ?? job.jobId), mapJob(job)])
  );

  // ----- next interview -----
  let interview = null;

  if (interviews) {
    // the list is sorted upcoming-first, soonest first
    interview =
      interviews.find((item) => item.status === "Upcoming") || null;
  } else if (summary.upcomingInterview) {
    interview = mapInterview(
      summary.upcomingInterview,
      jobsById.get(String(summary.upcomingInterview.jobId))
    );
  }

  // ----- recent applications (newest 3) -----
  const recentApplications = applications
    ? applications.slice(0, 3).map((application) => ({
        id: application.id,
        job: application.jobTitle,
        company: application.company,
        appliedDate: application.appliedDate,
        status: application.status,
      }))
    : (summary.recentApplications || []).map((application) => ({
        id: application.applicationId,
        job:
          application.jobTitle ||
          jobsById.get(String(application.jobId))?.title ||
          `Job #${application.jobId}`,
        company: COMPANY_NAME,
        appliedDate: formatDate(application.appliedAt),
        status: getStatusInfo(application.status).label,
      }));

  return {
    candidateName: summary.candidateName || "",

    stats: {
      applications: applications
        ? applications.length
        : summary.totalApplications ?? 0,

      interviews: interviews
        ? interviews.filter((item) => item.status === "Upcoming")
            .length
        : summary.upcomingInterviews ?? 0,

      offers: offers ? offers.length : summary.totalOffers ?? 0,

      // worked out with the same function the Profile page uses
      profileCompletion: profile
        ? calcProfileCompletion(fromApiProfile(profile))
        : summary.profileCompletionPercentage ?? 0,
    },

    recentApplications,

    upcomingInterview: interview
      ? { ...interview, job: interview.jobTitle }
      : null,

    recommendedJobs: (summary.recommendedJobs || []).map(mapJob),
  };
};

/* ---------------------------------------------------------- */
/* RESUME FILE                                                 */
/* ---------------------------------------------------------- */

export const MAX_RESUME_MB = 5;

// Returns an error message, or "" when the file is fine.
export const validateResumeFile = (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!["pdf", "doc", "docx"].includes(extension)) {
    return "Please choose a PDF, DOC or DOCX file.";
  }

  if (file.size > MAX_RESUME_MB * 1024 * 1024) {
    return `The file is too large. Please choose one under ${MAX_RESUME_MB} MB.`;
  }

  return "";
};

/* ---------------------------------------------------------- */
/* OFFERS                                                      */
/* ---------------------------------------------------------- */

// SENT = the recruiter sent it and the candidate has not answered yet.
const OFFER_STATUS = {
  SENT: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Declined",
  DECLINED: "Declined",
};

// PENDING = created by the recruiter but NOT sent yet, so the
// candidate must not see it.
const HIDDEN_OFFER_STATUSES = ["PENDING", "DRAFT", "CREATED"];

export const getOfferStatus = (status) => {
  const key = String(status ?? "").toUpperCase();

  return (
    OFFER_STATUS[key] ||
    titleCase(key.replace(/_/g, " ").toLowerCase()) ||
    "Pending"
  );
};

export const isOfferVisibleToCandidate = (offer = {}) =>
  !HIDDEN_OFFER_STATUSES.includes(
    String(offer.status ?? "").toUpperCase()
  );

// The API has no offer date, probation period, reporting manager or
// benefits, so those stay empty and the pages hide them.
export const mapOffer = (offer = {}) => ({
  id: offer.offerId,
  offerCode: offer.offerCode || "",
  jobTitle: offer.position || "Job Offer",
  designation: offer.position || "Not specified",
  company: COMPANY_NAME,
  location: offer.location || "Not specified",
  employmentType: formatEmploymentType(offer.employmentType),
  salary: offer.salary
    ? `${formatRupees(offer.salary)} per annum`
    : "Not disclosed",
  joiningDate: formatDate(offer.joiningDate) || "To be confirmed",
  offeredDate: "",
  probationPeriod: "",
  reportingManager: "",
  benefits: [],
  status: getOfferStatus(offer.status),
});
