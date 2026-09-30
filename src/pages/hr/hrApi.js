
/**
 * hrApi.js
 * -------------------------------------------------------------------
 * Shared helper functions connecting the HR pages to:
 *
 * 1. FastAPI AI backend
 * 2. Spring Boot EMS backend
 */

// ============================================================
// FASTAPI AI BACKEND
// ============================================================

const API_BASE =
  import.meta.env.VITE_AI_API_URL ||
  "http://127.0.0.1:8000";

// ============================================================
// CANDIDATES - FASTAPI AI
// ============================================================

export async function fetchAICandidates() {
  const res = await fetch(`${API_BASE}/candidates`);

  if (!res.ok) {
    throw new Error(
      "Failed to load candidates from the AI backend."
    );
  }

  return res.json();
}

export async function uploadAIResume(file, source) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "source",
    source || "Not specified"
  );

  const res = await fetch(
    `${API_BASE}/upload-resume`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      err.detail || "Resume upload failed."
    );
  }

  return res.json();
}

// ============================================================
// JOBS BRIDGE - FASTAPI AI
// ============================================================

export function getLocalJobs() {
  return (
    JSON.parse(
      localStorage.getItem("hrJobs")
    ) || []
  );
}

export async function ensureBackendJobId(localJob) {
  const mapKey = "hrJobBackendIds";

  const map =
    JSON.parse(
      localStorage.getItem(mapKey)
    ) || {};

  if (map[localJob.id]) {
    return map[localJob.id];
  }

  const description = [
    localJob.description,
    localJob.experience
      ? `Experience required: ${localJob.experience}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const res = await fetch(
    `${API_BASE}/set-job`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_title: localJob.title,
        job_description: description,
        location: localJob.location || "",
        required_skills:
          localJob.requiredSkills || [],
        preferred_skills:
          localJob.preferredSkills || [],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(
      "Could not register this job with the AI backend."
    );
  }

  const data = await res.json();

  map[localJob.id] = data.job_id;

  localStorage.setItem(
    mapKey,
    JSON.stringify(map)
  );

  return data.job_id;
}

// ============================================================
// AI SCREENING - FASTAPI
// ============================================================

export async function matchAICandidate(
  candidateId,
  jobId
) {
  const res = await fetch(
    `${API_BASE}/match/${candidateId}/${jobId}`,
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      err.detail || "Match request failed."
    );
  }

  return res.json();
}

export async function getAISkillGap(
  candidateId,
  jobId
) {
  const res = await fetch(
    `${API_BASE}/skill-gap/${candidateId}/${jobId}`,
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      err.detail || "Skill gap request failed."
    );
  }

  return res.json();
}

// ============================================================
// AI RANKINGS - FASTAPI
// ============================================================

export async function rankAICandidatesForJob(
  jobId
) {
  const res = await fetch(
    `${API_BASE}/rank/${jobId}`
  );

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      err.detail || "Ranking request failed."
    );
  }

  return res.json();
}

// ============================================================
// HR ANALYTICS - FASTAPI
// ============================================================

export async function getAIAnalytics() {
  const res = await fetch(
    `${API_BASE}/analytics`
  );

  if (!res.ok) {
    throw new Error(
      "Failed to load analytics from the AI backend."
    );
  }

  return res.json();
}

// ============================================================
// SPRING BOOT EMS BACKEND
// ============================================================

const EMS_API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api";

// ============================================================
// TOKEN / AUTH HELPERS
// ============================================================

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

// ============================================================
// PARSE BACKEND RESPONSE
// ============================================================

async function parseResponse(res) {
  const text = await res.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${res.status}`;

    throw new Error(message);
  }

  return data;
}

// ============================================================
// UNWRAP STANDARD BACKEND RESPONSE
// ============================================================

function unwrapApiResponse(response) {
  if (
    response &&
    typeof response === "object" &&
    Object.prototype.hasOwnProperty.call(
      response,
      "success"
    )
  ) {
    if (!response.success) {
      throw new Error(
        response.message ||
          "Backend request failed."
      );
    }

    return response.data;
  }

  return response;
}

// ============================================================
// JOBS
// ============================================================

// GET /api/jobs/all

export async function fetchJobs() {
  const res = await fetch(
    `${EMS_API_BASE}/jobs/all`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to load jobs."
    );
  }

  const response = await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to load jobs."
    );
  }

  return response.data;
}

// GET /api/jobs/{id}

export async function fetchJobById(jobId) {
  const res = await fetch(
    `${EMS_API_BASE}/jobs/${jobId}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to load job."
    );
  }

  const response = await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to load job."
    );
  }

  return response.data;
}

// POST /api/jobs/create

export async function createJob(jobData) {
  const res = await fetch(
    `${EMS_API_BASE}/jobs/create`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(jobData),
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to create job."
    );
  }

  const response = await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to create job."
    );
  }

  return response.data;
}

// PUT /api/jobs/{id}

export async function updateJob(
  jobId,
  jobData
) {
  const res = await fetch(
    `${EMS_API_BASE}/jobs/${jobId}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(jobData),
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to update job."
    );
  }

  // PUT /api/jobs/{id} returns Job directly
  return await res.json();
}
// PUT /api/jobs/{id}/close

export async function closeJob(jobId) {
  const res = await fetch(
    `${EMS_API_BASE}/jobs/${jobId}/close`,
    {
      method: "PUT",
      headers: authHeaders(),
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to close job."
    );
  }

  // PUT /api/jobs/{id}/close returns Job directly
  return await res.json();
}

// PUT /api/jobs/{id}
// Uses existing PUT /api/jobs/{id}.
// There is no /activate endpoint.

export async function activateJob(jobId) {
  const existingJob =
    await fetchJobById(jobId);

  const updatedJob = {
    ...existingJob,
    status: "OPEN",
  };

  return await updateJob(
    jobId,
    updatedJob
  );
}

// DELETE /api/jobs/{id}

export async function deleteJob(jobId) {
  const res = await fetch(
    `${EMS_API_BASE}/jobs/${jobId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to delete job."
    );
  }

  const response = await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to delete job."
    );
  }

  return response.data;
}

// GET /api/jobs/search

export async function searchJobs({
  title = "",
  location = "",
} = {}) {
  const params = new URLSearchParams();

  if (title.trim()) {
    params.append(
      "title",
      title.trim()
    );
  }

  if (location.trim()) {
    params.append(
      "location",
      location.trim()
    );
  }

  const query = params.toString();

  const url = query
    ? `${EMS_API_BASE}/jobs/search?${query}`
    : `${EMS_API_BASE}/jobs/search`;

  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to search jobs."
    );
  }

  const response = await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to search jobs."
    );
  }

  return response.data;
}

// GET /api/jobs/assigned

export async function fetchAssignedJobs() {
  const res = await fetch(
    `${EMS_API_BASE}/jobs/assigned`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// DASHBOARD
// ============================================================

// GET /api/dashboard/summary

export async function fetchDashboardSummary() {
  const res = await fetch(
    `${EMS_API_BASE}/dashboard/summary`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/employees

export async function fetchEmployees() {
  const res = await fetch(
    `${EMS_API_BASE}/employees`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// POST /api/employees

export async function createEmployee(
  employeeData
) {
  const res = await fetch(
    `${EMS_API_BASE}/employees`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(
        employeeData
      ),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/employees/{id}

export async function fetchEmployeeById(
  employeeId
) {
  const res = await fetch(
    `${EMS_API_BASE}/employees/${employeeId}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/employees/search?keyword=

export async function searchEmployees(
  keyword
) {
  const params = new URLSearchParams({
    keyword: keyword || "",
  });

  const res = await fetch(
    `${EMS_API_BASE}/employees/search?${params}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/employees/status?status=

export async function fetchEmployeesByStatus(
  status
) {
  const params = new URLSearchParams({
    status: status || "",
  });

  const res = await fetch(
    `${EMS_API_BASE}/employees/status?${params}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// PUT /api/employees/{id}

export async function updateEmployee(
  employeeId,
  employeeData
) {
  const res = await fetch(
    `${EMS_API_BASE}/employees/${employeeId}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(
        employeeData
      ),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// DELETE /api/employees/{id}

export async function deleteEmployee(
  employeeId
) {
  const res = await fetch(
    `${EMS_API_BASE}/employees/${employeeId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/employees/statistics

export async function fetchEmployeeStatistics() {
  const res = await fetch(
    `${EMS_API_BASE}/employees/statistics`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/dashboard/applications-by-status

export async function fetchApplicationsByStatus() {
  const res = await fetch(
    `${EMS_API_BASE}/dashboard/applications-by-status`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/dashboard/interviews-by-status

export async function fetchInterviewsByStatus() {
  const res = await fetch(
    `${EMS_API_BASE}/dashboard/interviews-by-status`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/dashboard/applications-per-job

export async function fetchApplicationsPerJob() {
  const res = await fetch(
    `${EMS_API_BASE}/dashboard/applications-per-job`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/dashboard/recent-applications

export async function fetchRecentApplications() {
  const res = await fetch(
    `${EMS_API_BASE}/dashboard/recent-applications`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/dashboard/recent-jobs

export async function fetchRecentJobs() {
  const res = await fetch(
    `${EMS_API_BASE}/dashboard/recent-jobs`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/dashboard/upcoming-interviews

export async function fetchUpcomingInterviews() {
  const res = await fetch(
    `${EMS_API_BASE}/dashboard/upcoming-interviews`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/dashboard/top-ai-candidates

export async function fetchTopAICandidates() {
  const res = await fetch(
    `${EMS_API_BASE}/dashboard/top-ai-candidates`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/dashboard/ai-screening

export async function fetchAIScreening() {
  const res = await fetch(
    `${EMS_API_BASE}/dashboard/ai-screening`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// ANALYTICS
// GET /api/reports/analytics
// ============================================================

export async function getAnalytics() {
  const res = await fetch(
    `${EMS_API_BASE}/reports/analytics`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// CANDIDATES - SPRING BOOT EMS
// ============================================================

// GET /api/candidates/all

export async function fetchCandidates() {
  const res = await fetch(
    `${EMS_API_BASE}/candidates/all`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/candidates/search?keyword=

export async function searchCandidates(
  keyword
) {
  const params = new URLSearchParams({
    keyword: keyword || "",
  });

  const res = await fetch(
    `${EMS_API_BASE}/candidates/search?${params}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/candidates/status/{status}

export async function fetchCandidatesByStatus(
  status
) {
  const res = await fetch(
    `${EMS_API_BASE}/candidates/status/${encodeURIComponent(
      status
    )}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/candidates/stats

export async function fetchCandidateStats() {
  const res = await fetch(
    `${EMS_API_BASE}/candidates/stats`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// POST /api/candidates/create

export async function createCandidate(
  candidate
) {
  const res = await fetch(
    `${EMS_API_BASE}/candidates/create`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(
        candidate
      ),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/candidates/{id}

export async function fetchCandidateById(
  candidateId
) {
  const res = await fetch(
    `${EMS_API_BASE}/candidates/${candidateId}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// RESUME UPLOAD
// POST /api/resumes/upload
// ============================================================

export async function uploadResume(
  candidateId,
  file
) {
  if (
    candidateId === undefined ||
    candidateId === null ||
    candidateId === ""
  ) {
    throw new Error(
      "Candidate ID is required for resume upload."
    );
  }

  if (!file) {
    throw new Error(
      "Resume file is required."
    );
  }

  const formData = new FormData();

  formData.append(
    "candidateId",
    String(candidateId)
  );

  formData.append(
    "file",
    file
  );

  const token = getToken();

  const res = await fetch(
    `${EMS_API_BASE}/resumes/upload`,
    {
      method: "POST",

      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},

      // Do NOT set Content-Type here.
      body: formData,
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// INTERVIEW APPLICATIONS
// ============================================================

// GET /api/applications/eligible-for-interview

export async function fetchEligibleApplicationsForInterview() {
  const res = await fetch(
    `${EMS_API_BASE}/applications/eligible-for-interview`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// RESUME MANAGEMENT
// ============================================================

// GET /api/resumes/{id}

export async function fetchResumeById(
  resumeId
) {
  const res = await fetch(
    `${EMS_API_BASE}/resumes/${resumeId}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/resumes/{id}/view

export async function viewResume(
  resumeId
) {
  const res = await fetch(
    `${EMS_API_BASE}/resumes/${resumeId}/view`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to load resume."
    );
  }

  return res;
}

// GET /api/resumes/{id}/download

export async function downloadResume(
  resumeId
) {
  const res = await fetch(
    `${EMS_API_BASE}/resumes/${resumeId}/download`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to download resume."
    );
  }

  return res;
}

// GET /api/resumes/stats

export async function fetchResumeStats() {
  const res = await fetch(
    `${EMS_API_BASE}/resumes/stats`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/resumes/search?keyword=

export async function searchResumes(
  keyword
) {
  const params = new URLSearchParams({
    keyword: keyword || "",
  });

  const res = await fetch(
    `${EMS_API_BASE}/resumes/search?${params}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/resumes/management

export async function fetchResumeManagement() {
  const res = await fetch(
    `${EMS_API_BASE}/resumes/management`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// LOCAL JOB HELPERS
// ============================================================

/*
 * This keeps the original localStorage key used
 * by the HR job system.
 */

export function getLocalHRJobs() {
  try {
    const saved =
      localStorage.getItem("hrJobs");

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Failed to read local jobs:",
      error
    );

    return [];
  }
}

// ============================================================
// ENSURE BACKEND JOB ID
// ============================================================

export async function ensureEMSBackendJobId(
  localJob
) {
  if (!localJob) {
    throw new Error(
      "Job was not found."
    );
  }

  // Already has backend ID
  if (localJob.backendId) {
    return localJob.backendId;
  }

  if (localJob.backendJobId) {
    return localJob.backendJobId;
  }

  // If local ID is actually backend ID,
  // verify it.
  if (localJob.id) {
    try {
      const backendJob =
        await fetchJobById(
          localJob.id
        );

      if (backendJob?.id) {
        return backendJob.id;
      }
    } catch {
      // Continue below.
    }
  }

  // Create backend job only if necessary
  const jobData = {
    title:
      localJob.title ||
      localJob.jobTitle ||
      "",

    description:
      localJob.description ||
      "",

    location:
      localJob.location ||
      "",

    status:
      localJob.status ||
      "OPEN",
  };

  if (!jobData.title) {
    throw new Error(
      "This local job does not have a backend job ID."
    );
  }

  const created =
    await createJob(jobData);

  const backendId =
    created?.id ||
    created?.jobId;

  if (!backendId) {
    throw new Error(
      "Backend job was created but no job ID was returned."
    );
  }

  return backendId;
}

// ============================================================
// DASHBOARD SUMMARY
// GET /api/dashboard/summary
// ============================================================

/*
 * Kept as the original dashboard implementation.
 * Uses the token directly.
 */

export async function fetchDashboardSummaryDirect() {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/dashboard/summary`,
    {
      method: "GET",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to load dashboard summary."
    );
  }

  const response =
    await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to load dashboard summary."
    );
  }

  return response.data;
}

// ============================================================
// APPLICATIONS BY STATUS
// GET /api/dashboard/applications-by-status
// ============================================================

export async function fetchApplicationsByStatusDirect() {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/dashboard/applications-by-status`,
    {
      method: "GET",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to load applications by status."
    );
  }

  const response =
    await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to load applications by status."
    );
  }

  return response.data;
}

// ============================================================
// OFFERS
// ============================================================

// GET /api/offers

export async function fetchOffers() {
  const res = await fetch(
    `${EMS_API_BASE}/offers`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/offers/{offerId}

export async function fetchOfferById(
  offerId
) {
  const res = await fetch(
    `${EMS_API_BASE}/offers/${offerId}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/offers/stats

export async function fetchOfferStats() {
  const res = await fetch(
    `${EMS_API_BASE}/offers/stats`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/offers/search?query=...

export async function searchOffers(
  query
) {
  const params = new URLSearchParams({
    query: query || "",
  });

  const res = await fetch(
    `${EMS_API_BASE}/offers/search?${params}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// GET /api/offers/status?status=...

export async function fetchOffersByStatus(
  status
) {
  const params = new URLSearchParams({
    status: status || "",
  });

  const res = await fetch(
    `${EMS_API_BASE}/offers/status?${params}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// POST /api/offers

export async function createOffer(
  offerData
) {
  const res = await fetch(
    `${EMS_API_BASE}/offers`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(
        offerData
      ),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// PUT /api/offers/{offerId}/send

export async function sendOffer(
  offerId
) {
  const res = await fetch(
    `${EMS_API_BASE}/offers/${offerId}/send`,
    {
      method: "PUT",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// PUT /api/offers/{offerId}/accept

export async function acceptOffer(
  offerId
) {
  const res = await fetch(
    `${EMS_API_BASE}/offers/${offerId}/accept`,
    {
      method: "PUT",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// PUT /api/offers/{offerId}/reject

export async function rejectOffer(
  offerId
) {
  const res = await fetch(
    `${EMS_API_BASE}/offers/${offerId}/reject`,
    {
      method: "PUT",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// AI RESUME SCREENING
// POST /api/ai-resume-screening/screen
// ============================================================

export async function screenResume(
  candidateId,
  jobId
) {
  const res = await fetch(
    `${EMS_API_BASE}/ai-resume-screening/screen`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        candidateId:
          Number(candidateId),
        jobId:
          Number(jobId),
      }),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// AI CANDIDATE MATCHING
// POST /api/ai-candidate-matching/match
// ============================================================

export async function matchCandidate(
  candidateId,
  jobId
) {
  // First check whether an AI match
  // already exists.

  const existingMatch =
    await findAIMatch(
      candidateId,
      jobId
    );

  if (existingMatch) {
    console.log(
      "Existing AI match found. POST /match will not be called.",
      existingMatch
    );

    return existingMatch;
  }

  // No existing match.
  // Create a new AI match.

  const res = await fetch(
    `${EMS_API_BASE}/ai-candidate-matching/match`,
    {
      method: "POST",
      headers: authHeaders(),

      body: JSON.stringify({
        candidateId:
          Number(candidateId),
        jobId:
          Number(jobId),
      }),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// EXISTING AI MATCHES
// GET /api/ai-candidate-matching/all
// ============================================================

export async function fetchAIMatches() {
  const res = await fetch(
    `${EMS_API_BASE}/ai-candidate-matching/all`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// FIND EXISTING AI MATCH
// ============================================================

export async function findAIMatch(
  candidateId,
  jobId
) {
  const matches =
    await fetchAIMatches();

  console.log(
    "AI Matching - all records:",
    matches
  );

  // Normalize possible backend response shapes

  let list = [];

  if (Array.isArray(matches)) {
    list = matches;
  } else if (
    Array.isArray(matches?.data)
  ) {
    list = matches.data;
  } else if (
    Array.isArray(matches?.content)
  ) {
    list = matches.content;
  } else if (
    Array.isArray(matches?.items)
  ) {
    list = matches.items;
  } else if (
    Array.isArray(matches?.matches)
  ) {
    list = matches.matches;
  }

  const candidateNumber =
    Number(candidateId);

  const jobNumber =
    Number(jobId);

  console.log(
    "Looking for AI match:",
    {
      candidateId:
        candidateNumber,
      jobId:
        jobNumber,
      totalRecords:
        list.length,
    }
  );

  const matchingRecords =
    list.filter((item) => {
      const itemCandidateId =
        Number(
          item?.candidateId ??
            item?.candidate_id ??
            item?.candidate?.id ??
            item?.candidate?.candidateId
        );

      const itemJobId =
        Number(
          item?.jobId ??
            item?.job_id ??
            item?.job?.id ??
            item?.job?.jobId
        );

      return (
        itemCandidateId ===
          candidateNumber &&
        itemJobId ===
          jobNumber
      );
    });

  console.log(
    "AI matching records found for selected candidate/job:",
    matchingRecords
  );

  // No existing match

  if (
    matchingRecords.length ===
    0
  ) {
    return null;
  }

  // Multiple records:
  // use latest database record

  const sortedRecords =
    [...matchingRecords].sort(
      (a, b) =>
        Number(b?.id || 0) -
        Number(a?.id || 0)
    );

  const latestRecord =
    sortedRecords[0];

  console.log(
    "Latest AI matching record selected:",
    latestRecord
  );

  return latestRecord;
}

// ============================================================
// SKILL GAP ANALYSIS
// POST /api/skill-gap-analysis/analyze
// ============================================================

export async function getSkillGap(
  candidateId,
  jobId
) {
  const res = await fetch(
    `${EMS_API_BASE}/skill-gap-analysis/analyze`,
    {
      method: "POST",
      headers: authHeaders(),

      body: JSON.stringify({
        candidateId:
          Number(candidateId),
        jobId:
          Number(jobId),
      }),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// AI CANDIDATE RANKING
// POST /api/candidate-ranking/rank
// ============================================================

export async function rankCandidatesForJob(
  jobId
) {
  const res = await fetch(
    `${EMS_API_BASE}/candidate-ranking/rank`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        jobId:
          Number(jobId),
      }),
    }
  );

  const response =
    await parseResponse(res);

  return unwrapApiResponse(
    response
  );
}

// ============================================================
// EXPORT BASE URL FOR DEBUGGING
// ============================================================

export {
  EMS_API_BASE,
};

