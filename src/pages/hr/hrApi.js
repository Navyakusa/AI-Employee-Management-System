/**
 * hrApi.js
 * -------------------------------------------------------------------
 * Shared helper functions connecting the HR pages to:
 *
 * 1. FastAPI AI backend
 * 2. Spring Boot EMS backend
 *
 * Existing AI functions are preserved.
 * Dashboard and Offers functions are included.
 */


// ============================================================
// FASTAPI AI BACKEND
// ============================================================

const API_BASE =
  import.meta.env.VITE_AI_API_URL ||
  "http://127.0.0.1:8000";


// ============================================================
// CANDIDATES
// ============================================================

export async function fetchCandidates() {
  const res = await fetch(`${API_BASE}/candidates`);

  if (!res.ok) {
    throw new Error(
      "Failed to load candidates from the AI backend."
    );
  }

  return res.json();
}


export async function uploadResume(file, source) {
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
// JOBS BRIDGE
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
// AI SCREENING
// ============================================================

export async function matchCandidate(
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


export async function getSkillGap(
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
// AI RANKINGS
// ============================================================

export async function rankCandidatesForJob(
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

export async function getAnalytics() {
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
  "http://localhost:8080/api";


// ============================================================
// DASHBOARD SUMMARY
// GET /api/dashboard/summary
// ============================================================

export async function fetchDashboardSummary() {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/dashboard/summary`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

export async function fetchApplicationsByStatus() {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/dashboard/applications-by-status`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
// SPRING BOOT EMS BACKEND
// ============================================================


// ============================================================
// GET ALL OFFERS
// GET /api/offers
// ============================================================

export async function fetchOffers() {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/offers`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to load offers."
    );
  }

  const response =
    await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to load offers."
    );
  }

  return response.data;
}


// ============================================================
// GET OFFER STATISTICS
// GET /api/offers/stats
// ============================================================

export async function fetchOfferStats() {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/offers/stats`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to load offer statistics."
    );
  }

  const response =
    await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to load offer statistics."
    );
  }

  return response.data;
}


// ============================================================
// SEARCH OFFERS
// GET /api/offers/search?query=...
// ============================================================

export async function searchOffers(query) {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/offers/search?query=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to search offers."
    );
  }

  const response =
    await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to search offers."
    );
  }

  return response.data;
}


// ============================================================
// GET OFFERS BY STATUS
// GET /api/offers/status?status=...
// ============================================================

export async function fetchOffersByStatus(status) {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/offers/status?status=${encodeURIComponent(status)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to filter offers."
    );
  }

  const response =
    await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to filter offers."
    );
  }

  return response.data;
}


// ============================================================
// CREATE OFFER
// POST /api/offers
// ============================================================

export async function createOffer(offerData) {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/offers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(offerData),
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to create offer."
    );
  }

  const response =
    await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to create offer."
    );
  }

  return response.data;
}


// ============================================================
// SEND OFFER
// PUT /api/offers/{offerId}/send
// ============================================================

export async function sendOffer(offerId) {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/offers/${offerId}/send`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to send offer."
    );
  }

  const response =
    await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to send offer."
    );
  }

  return response.data;
}


// ============================================================
// ACCEPT OFFER
// PUT /api/offers/{offerId}/accept
// ============================================================

export async function acceptOffer(offerId) {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/offers/${offerId}/accept`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to accept offer."
    );
  }

  const response =
    await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to accept offer."
    );
  }

  return response.data;
}


// ============================================================
// REJECT OFFER
// PUT /api/offers/{offerId}/reject
// ============================================================

export async function rejectOffer(offerId) {
  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/offers/${offerId}/reject`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message ||
        "Failed to reject offer."
    );
  }

  const response =
    await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to reject offer."
    );
  }

  return response.data;
}