// ============================================================
// JOBS
// SPRING BOOT EMS BACKEND
// ============================================================

// ============================================================
// GET ALL JOBS
// GET /api/jobs/all
// ============================================================
export async function fetchJobs() {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/jobs/all`,
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


// ============================================================
// GET JOB BY ID
// GET /api/jobs/{id}
// ============================================================
export async function fetchJobById(jobId) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/jobs/${jobId}`,
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


// ============================================================
// CREATE JOB
// POST /api/jobs/create
// ============================================================
export async function createJob(jobData) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/jobs/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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


// ============================================================
// UPDATE JOB
// PUT /api/jobs/{id}
// ============================================================
export async function updateJob(jobId, jobData) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/jobs/${jobId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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

  // IMPORTANT:
  // PUT /api/jobs/{id} returns Job directly,
  // NOT ApiResponse<Job>
  return await res.json();
}


// ============================================================
// CLOSE JOB
// PUT /api/jobs/{id}/close
// ============================================================
export async function closeJob(jobId) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/jobs/${jobId}/close`,
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
        "Failed to close job."
    );
  }

  // IMPORTANT:
  // PUT /api/jobs/{id}/close returns Job directly,
  // NOT ApiResponse<Job>
  return await res.json();
}


// ============================================================
// ACTIVATE JOB
// Uses existing PUT /api/jobs/{id}
// There is NO /activate endpoint in the backend.
// ============================================================
export async function activateJob(jobId) {
  // First get the complete existing job.
  // This is important because the backend update method
  // updates all the job fields.
  const existingJob = await fetchJobById(jobId);

  // Change only the status.
  const updatedJob = {
    ...existingJob,
    status: "OPEN",
  };

  // Use the existing PUT /api/jobs/{id}
  return await updateJob(
    jobId,
    updatedJob
  );
}


// ============================================================
// DELETE JOB
// DELETE /api/jobs/{id}
// ============================================================
export async function deleteJob(jobId) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/jobs/${jobId}`,
    {
      method: "DELETE",
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


// ============================================================
// SEARCH JOBS
// GET /api/jobs/search
// ============================================================
export async function searchJobs({
  title = "",
  location = "",
} = {}) {
  const token = localStorage.getItem("token");

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

  const queryString = params.toString();

  const url = queryString
    ? `${EMS_API_BASE}/jobs/search?${queryString}`
    : `${EMS_API_BASE}/jobs/search`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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


// ============================================================
// GET ASSIGNED JOBS
// GET /api/jobs/assigned
// ============================================================
export async function fetchAssignedJobs() {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${EMS_API_BASE}/jobs/assigned`,
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
        "Failed to load assigned jobs."
    );
  }

  const response = await res.json();

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to load assigned jobs."
    );
  }

  return response.data;
}