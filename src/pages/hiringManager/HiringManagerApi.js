const API_BASE_URL = "http://192.168.0.7:8080/api";

/*
========================================================
COMMON HEADERS
========================================================
*/

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};


/*
========================================================
HIRING MANAGER DASHBOARD
========================================================
*/

export const getHiringManagerDashboard = async () => {
  const response = await fetch(
    `${API_BASE_URL}/hiring-manager/dashboard`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch hiring manager dashboard: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
SHORTLISTED / ELIGIBLE CANDIDATES
========================================================

Backend endpoint verified from Swagger:

GET /api/applications/eligible-for-interview

Expected response:

{
  "data": [
    {
      "applicationId": 5,
      "candidateId": 8,
      "candidateName": "Candidate1",
      "jobId": 1,
      "jobTitle": "Java Full Stack Developer"
    }
  ],
  "success": true
}

========================================================
*/

export const getShortlistedCandidates = async () => {
  const response = await fetch(
    `${API_BASE_URL}/applications/eligible-for-interview`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch shortlisted candidates: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
ELIGIBLE CANDIDATES
========================================================
*/

export const getEligibleCandidates = async () => {
  const response = await fetch(
    `${API_BASE_URL}/applications/eligible-for-interview`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch eligible candidates: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
CANDIDATE REVIEW
========================================================
*/

export const getCandidateReview = async (applicationId) => {
  const response = await fetch(
    `${API_BASE_URL}/applications/${applicationId}/review`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch candidate review: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
SHORTLIST CANDIDATE
========================================================
*/

export const shortlistCandidate = async (
  candidateId,
  jobId
) => {
  const response = await fetch(
    `${API_BASE_URL}/applications/shortlist?candidateId=${candidateId}&jobId=${jobId}`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to shortlist candidate: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
ASSIGNED JOBS
========================================================
*/

export const getAssignedJobs = async () => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/assigned`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch assigned jobs: ${response.status}`
    );
  }

  return response.json();
};
/*
========================================================
GET JOB DETAILS BY ID
========================================================
*/

export const getJobById = async (jobId) => {
  if (!jobId) {
    throw new Error("Job ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch job details: ${response.status}`
    );
  }

  return response.json();
};

/*
========================================================
INTERVIEW MANAGEMENT
========================================================
*/

export const getInterviewManagementData = async () => {
  const response = await fetch(
    `${API_BASE_URL}/interviews/management`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch interview management data: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
INTERVIEW STATS
========================================================
*/

export const getInterviewStats = async () => {
  const response = await fetch(
    `${API_BASE_URL}/interviews/stats`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch interview stats: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
UPCOMING INTERVIEWS
========================================================
*/

export const getUpcomingInterviews = async () => {
  const response = await fetch(
    `${API_BASE_URL}/interviews/upcoming`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch upcoming interviews: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
INTERVIEW DETAILS
========================================================
*/

export const getInterviewDetails = async (
  interviewId
) => {
  const response = await fetch(
    `${API_BASE_URL}/interviews/${interviewId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch interview details: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
SEARCH INTERVIEWS
========================================================
*/

export const searchInterviews = async (
  keyword
) => {
  const response = await fetch(
    `${API_BASE_URL}/interviews/search?keyword=${encodeURIComponent(
      keyword
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to search interviews: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
INTERVIEWS BY STATUS
========================================================
*/

export const getInterviewsByStatus = async (
  status
) => {
  const response = await fetch(
    `${API_BASE_URL}/interviews/status/${encodeURIComponent(
      status
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch interviews by status: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
INTERVIEW FEEDBACK
========================================================
*/

export const getInterviewFeedback = async (
  interviewId
) => {
  const response = await fetch(
    `${API_BASE_URL}/interview-feedback/interview/${interviewId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch interview feedback: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
NOTIFICATIONS
========================================================
*/

export const getMyNotifications = async () => {
  const response = await fetch(
    `${API_BASE_URL}/notifications/my`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch notifications: ${response.status}`
    );
  }

  return response.json();
};


export const getUnreadNotificationCount = async () => {
  const response = await fetch(
    `${API_BASE_URL}/notifications/unread-count`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch unread notification count: ${response.status}`
    );
  }

  return response.json();
};


export const getNotificationStats = async () => {
  const response = await fetch(
    `${API_BASE_URL}/notifications/stats`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch notification stats: ${response.status}`
    );
  }

  return response.json();
};


export const markNotificationAsRead = async (
  notificationId
) => {
  const response = await fetch(
    `${API_BASE_URL}/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to mark notification as read: ${response.status}`
    );
  }

  return response.json();
};


export const markAllNotificationsAsRead = async () => {
  const response = await fetch(
    `${API_BASE_URL}/notifications/read-all`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to mark all notifications as read: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
PROFILE
========================================================
*/

export const getProfile = async () => {
  const response = await fetch(
    `${API_BASE_URL}/profile/get`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch profile: ${response.status}`
    );
  }

  return response.json();
};


export const updateProfile = async (
  userName,
  email,
  department
) => {
  const params = new URLSearchParams({
    userName,
    email,
    department,
  });

  const response = await fetch(
    `${API_BASE_URL}/profile/update?${params.toString()}`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to update profile: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
SETTINGS
========================================================
*/

export const getSettings = async () => {
  const response = await fetch(
    `${API_BASE_URL}/settings/current`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch settings: ${response.status}`
    );
  }

  return response.json();
};


export const saveSettings = async (
  settings
) => {
  const response = await fetch(
    `${API_BASE_URL}/settings/save`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(settings),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to save settings: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
CANDIDATE DECISIONS
========================================================
*/

export const getCandidateDecisions = async (
  search = ""
) => {
  const query = search
    ? `?search=${encodeURIComponent(search)}`
    : "";

  const response = await fetch(
    `${API_BASE_URL}/candidate-decisions${query}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch candidate decisions: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
APPROVE CANDIDATE
========================================================
*/

export const approveCandidate = async (
  applicationId
) => {
  const response = await fetch(
    `${API_BASE_URL}/candidate-decisions/${applicationId}/approve`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to approve candidate: ${response.status}`
    );
  }

  return response.json();
};


/*
========================================================
REJECT CANDIDATE
========================================================
*/

export const rejectCandidate = async (
  applicationId
) => {
  const response = await fetch(
    `${API_BASE_URL}/candidate-decisions/${applicationId}/reject`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to reject candidate: ${response.status}`
    );
  }

  return response.json();
};