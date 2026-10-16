
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import apiClient from "../../services/apiClient";
import "./RecruiterScreening.css";

function RecruiterScreening() {
  const location = useLocation();
  const navigate = useNavigate();

  const [screenings, setScreenings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState({});

  const [availableApplications, setAvailableApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [candidateId, setCandidateId] = useState("");
  const [jobId, setJobId] = useState("");
  const [selectedApplicationKey, setSelectedApplicationKey] = useState("");

  const [screeningLoading, setScreeningLoading] = useState(false);
  const [screeningError, setScreeningError] = useState("");
  const [screeningSuccess, setScreeningSuccess] = useState("");

  // NEW: Selected record for the Analysis popup.
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const isValidId = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0;
  };

  // GET /api/candidates/all
  const fetchCandidates = async () => {
    try {
      const response = await apiClient.get("/candidates/all");
      const result = response.data;

      const candidateList = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setCandidates(candidateList);
    } catch (err) {
      console.error("Candidate details fetch error:", err);
      setCandidates([]);
    }
  };

  // GET /api/jobs/{id}
  const fetchJobs = async (screeningRecords) => {
    const jobIds = [
      ...new Set(
        screeningRecords
          .map((screening) => screening.jobId)
          .filter((id) => id !== null && id !== undefined)
      ),
    ];

    if (jobIds.length === 0) {
      setJobs({});
      return;
    }

    const jobResults = await Promise.all(
      jobIds.map(async (id) => {
        try {
          const response = await apiClient.get(`/jobs/${id}`);
          const result = response.data;

          if (result?.success && result?.data) {
            return [String(id), result.data];
          }

          return null;
        } catch (err) {
          console.error(`Failed to fetch job ${id}:`, err);
          return null;
        }
      })
    );

    const jobMap = {};

    jobResults.forEach((entry) => {
      if (entry) {
        const [id, job] = entry;
        jobMap[id] = job;
      }
    });

    setJobs(jobMap);
  };

  // GET /api/ai-resume-screening/all
  const fetchScreenings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/ai-resume-screening/all");
      const result = response.data;
      console.log("AI SCREENING API RESPONSE:", result);
console.log(
  "FIRST SCREENING SKILLS:",
  result?.data?.[0]?.skills
);

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to fetch AI screening results."
        );
      }

      const screeningRecords = Array.isArray(result.data)
  ? result.data
  : [];

// ---------------------------------------------------------
// Show only the latest screening for each Candidate + Job.
//
// Backend still keeps all historical screening records.
// We are only removing duplicates from the React table.
//
// Example:
// Candidate 31 + Job 1
// Screening 69  -> hidden
// Screening 78  -> hidden
// Screening 81  -> hidden
// Screening 82  -> displayed
// ---------------------------------------------------------

const allScreenings = [...screeningRecords];

allScreenings.sort(
  (a, b) => Number(b.id || 0) - Number(a.id || 0)
);

setScreenings(allScreenings);

await Promise.all([
  fetchCandidates(),
  fetchJobs(allScreenings),
]);

    } catch (err) {
      console.error("AI screening fetch error:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to view AI screening results.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load AI screening results."
        );
      }

      setScreenings([]);
    } finally {
      setLoading(false);
    }
  };

  // GET /api/resumes/management
const fetchAvailableApplications = async () => {
  try {
    setApplicationsLoading(true);
    setApplicationsError("");

    const response = await apiClient.get("/resumes/management");
    const result = response.data;

    if (!result?.success || !Array.isArray(result?.data)) {
      throw new Error(
        result?.message || "Unable to load candidate applications."
      );
    }

    // ---------------------------------------------------------
    // STEP 1:
    // Keep only resume records that contain a valid
    // candidateId and jobId.
    // ---------------------------------------------------------
    const validRecords = result.data.filter(
  (resume) =>
    isValidId(resume.applicationId) &&
    isValidId(resume.candidateId) &&
    isValidId(resume.jobId)
);

    // ---------------------------------------------------------
    // STEP 2:
    // Resume Management can return multiple resumes for the
    // same application.
    //
    // Example:
    // Candidate 31
    // Application 21
    // Job 1
    //
    // may have Resume 38, 54, 55, etc.
    //
    // We only want ONE option in the AI Screening dropdown.
    //
    // If applicationId exists:
    //     deduplicate using applicationId.
    //
    // Otherwise:
    //     deduplicate using candidateId + jobId.
    //
    // If duplicates exist, keep the record with the highest
    // resumeId (latest resume record).
    // ---------------------------------------------------------
    const uniqueApplicationsMap = new Map();

    validRecords.forEach((resume) => {
      const key = isValidId(resume.applicationId)
        ? `application-${resume.applicationId}`
        : `candidate-${resume.candidateId}-job-${resume.jobId}`;

      const existingResume = uniqueApplicationsMap.get(key);

      if (!existingResume) {
        uniqueApplicationsMap.set(key, resume);
        return;
      }

      const existingResumeId = Number(existingResume.resumeId || 0);
      const currentResumeId = Number(resume.resumeId || 0);

      if (currentResumeId > existingResumeId) {
        uniqueApplicationsMap.set(key, resume);
      }
    });

    // ---------------------------------------------------------
    // STEP 3:
    // Convert the unique resume/application records into the
    // structure already used by the existing React dropdown.
    // ---------------------------------------------------------
    const applications = Array.from(
  uniqueApplicationsMap.values()
).map((resume) => ({
  applicationId: resume.applicationId ?? null,
  resumeId: resume.resumeId ?? null,
  candidateId: Number(resume.candidateId),
  candidateName: resume.candidateName || "Unknown Candidate",
  candidateEmail: resume.candidateEmail || "",
  jobId: Number(resume.jobId),
  jobTitle: resume.position || `Job #${resume.jobId}`,
}));
    // Optional sorting only changes display order.
    // It does not change API data or screening behavior.
    applications.sort((a, b) => {
      const nameA = String(a.candidateName || "").toLowerCase();
      const nameB = String(b.candidateName || "").toLowerCase();

      return nameA.localeCompare(nameB);
    });

    setAvailableApplications(applications);

    if (result.data.length > 0 && applications.length === 0) {
      setApplicationsError(
        "The Resume Management API is not returning valid candidateId and jobId values. Ask the backend team to include both IDs for each application."
      );
    }
  } catch (err) {
    console.error("Application selection fetch error:", err);

    setApplicationsError(
      err.response?.data?.message ||
        err.message ||
        "Unable to load candidate applications."
    );

    setAvailableApplications([]);
  } finally {
    setApplicationsLoading(false);
  }
};

  useEffect(() => {
    fetchScreenings();
    fetchAvailableApplications();
  }, []);

  // Automatically select the application passed from Resume Management.
  useEffect(() => {
    const selected = location.state?.selectedApplication;

    if (!selected) return;

    if (
      !isValidId(selected.candidateId) ||
      !isValidId(selected.jobId)
    ) {
      setScreeningError(
        "The selected application does not contain valid candidate and job IDs."
      );
      setShowScreeningModal(true);

      navigate(location.pathname, {
        replace: true,
        state: null,
      });

      return;
    }

    setCandidateId(String(selected.candidateId));
    setJobId(String(selected.jobId));
    setSelectedApplicationKey("");
    setScreeningError("");
    setScreeningSuccess("");
    setShowScreeningModal(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, navigate]);

  const candidateMap = useMemo(() => {
    const map = {};

    candidates.forEach((candidate) => {
      if (candidate.id !== null && candidate.id !== undefined) {
        map[String(candidate.id)] = candidate;
      }
    });

    return map;
  }, [candidates]);

  const getCandidateDetails = (screening) => {
    return candidateMap[String(screening.candidateId)] || null;
  };

  const getJobDetails = (screening) => {
    return jobs[String(screening.jobId)] || null;
  };

  const getSkills = (skills) => {
    if (!skills) return [];

    if (Array.isArray(skills)) {
      return skills
        .map(String)
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return String(skills)
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  const getExperience = (screening) => {
    if (
      screening.yearsOfExperience !== null &&
      screening.yearsOfExperience !== undefined
    ) {
      const years = Number(screening.yearsOfExperience);

      return `${years} ${years === 1 ? "Year" : "Years"}`;
    }

    return "—";
  };

  const formatResult = (result) => {
    if (!result) return "Not Available";

    return result
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatScreenedDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredCandidates = useMemo(() => {
    const text = search.trim().toLowerCase();

    return screenings.filter((screening) => {
      const skills = getSkills(screening.skills);
      const candidate = getCandidateDetails(screening);
      const job = getJobDetails(screening);

      const candidateText =
        `candidate ${screening.candidateId}`.toLowerCase();

      const jobText =
        `job ${screening.jobId}`.toLowerCase();

      const resultText = formatResult(
        screening.screeningResult
      ).toLowerCase();

      const matchesSearch =
        !text ||
        candidateText.includes(text) ||
        jobText.includes(text) ||
        candidate?.name?.toLowerCase().includes(text) ||
        candidate?.email?.toLowerCase().includes(text) ||
        job?.title?.toLowerCase().includes(text) ||
        job?.department?.toLowerCase().includes(text) ||
        resultText.includes(text) ||
        skills.some((skill) =>
          skill.toLowerCase().includes(text)
        );

      const matchesFilter =
        filter === "All" ||
        screening.screeningResult === filter;

      return matchesSearch && matchesFilter;
    });
  }, [
    screenings,
    search,
    filter,
    candidateMap,
    jobs,
  ]);

  const totalScreened = screenings.length;

  const highMatch = screenings.filter(
    (screening) =>
      Number(screening.screeningScore || 0) >= 85
  ).length;

  const recommended = screenings.filter(
    (screening) =>
      screening.screeningResult === "QUALIFIED" ||
      screening.screeningResult === "RECOMMENDED"
  ).length;

  const needsReview = screenings.filter(
    (screening) =>
      screening.screeningResult === "REVIEW" ||
      screening.screeningResult === "NEEDS_REVIEW"
  ).length;

  const getScoreClass = (score) => {
    const value = Number(score || 0);

    if (value >= 85) return "score-high";
    if (value >= 70) return "score-medium";

    return "score-low";
  };

  const getResultClass = (result) => {
    if (!result) return "not-available";

    const value = result.toLowerCase();

    if (value === "qualified" || value === "recommended") {
      return "recommended";
    }

    if (value === "review" || value === "needs_review") {
      return "review";
    }

    if (value === "shortlisted") {
      return "shortlisted";
    }

    if (
      value === "not_qualified" ||
      value === "not_recommended"
    ) {
      return "not-recommended";
    }

    return "not-available";
  };

  // UPDATED: Open a React modal instead of a browser alert.
  const handleViewAnalysis = (screening) => {
    setSelectedAnalysis(screening);
  };

  const handleCloseAnalysis = () => {
    setSelectedAnalysis(null);
  };

  // Open Run Screening modal without asking for manual IDs.
  const handleRunScreening = () => {
    setCandidateId("");
    setJobId("");
    setSelectedApplicationKey("");
    setScreeningError("");
    setScreeningSuccess("");
    setShowScreeningModal(true);

    fetchAvailableApplications();
  };

  const handleCloseScreeningModal = () => {
    if (screeningLoading) return;

    setShowScreeningModal(false);
    setCandidateId("");
    setJobId("");
    setSelectedApplicationKey("");
    setScreeningError("");
    setScreeningSuccess("");
  };

  const handleApplicationSelection = (value) => {
    setSelectedApplicationKey(value);
    setScreeningError("");

    if (value === "") {
      setCandidateId("");
      setJobId("");
      return;
    }

    const selected = availableApplications[Number(value)];

    if (!selected) {
      setCandidateId("");
      setJobId("");
      return;
    }

    setCandidateId(String(selected.candidateId));
    setJobId(String(selected.jobId));
  };

  // POST /api/ai-resume-screening/screen
  const handleSubmitScreening = async (e) => {
  e.preventDefault();

  setScreeningError("");
  setScreeningSuccess("");
  if (
  !selectedApplication ||
  !isValidId(selectedApplication.applicationId) ||
  !isValidId(selectedApplication.resumeId) ||
  !isValidId(candidateId) ||
  !isValidId(jobId)
) {
  setScreeningError(
    "Application ID or Resume ID is missing. Please select a valid application."
  );
  return;
}

  try {
    setScreeningLoading(true);

const response = await apiClient.post(
  "/ai-resume-screening/screen",
  {
    applicationId: Number(selectedApplication.applicationId),
    resumeId: Number(selectedApplication.resumeId),
    candidateId: Number(candidateId),
    jobId: Number(jobId),
  }
);

    const result = response.data;

    if (!result?.success) {
      throw new Error(
        result?.message || "AI screening failed."
      );
    }

    setScreeningSuccess(
      result.message ||
        "AI resume screening completed successfully."
    );

    await fetchScreenings();

    setTimeout(() => {
      setShowScreeningModal(false);
      setCandidateId("");
      setJobId("");
      setSelectedApplicationKey("");
      setScreeningSuccess("");
    }, 1200);
  } catch (err) {
    console.error("AI screening POST error:", err);

    if (err.response?.status === 401) {
      setScreeningError(
        "Your session has expired. Please login again."
      );
    } else if (err.response?.status === 403) {
      setScreeningError(
        "You are not authorized to run AI screening."
      );
    } else {
      setScreeningError(
        err.response?.data?.message ||
          err.message ||
          "Failed to perform AI resume screening."
      );
    }
  } finally {
    setScreeningLoading(false);
  }
};
  // Resolve selected candidate/job for the Run Screening modal.
  const selectedApplication =
    selectedApplicationKey !== ""
      ? availableApplications[
          Number(selectedApplicationKey)
        ] || null
      : availableApplications.find(
          (application) =>
            String(application.candidateId) ===
              String(candidateId) &&
            String(application.jobId) ===
              String(jobId)
        ) || null;

  const selectedCandidateName =
    selectedApplication?.candidateName ||
    candidateMap[String(candidateId)]?.name ||
    (candidateId ? `Candidate #${candidateId}` : "");

  const selectedJobTitle =
    selectedApplication?.jobTitle ||
    jobs[String(jobId)]?.title ||
    (jobId ? `Job #${jobId}` : "");

  return (
    <div className="recruiter-screening-page">
      <RecruiterSidebar />
      <RecruiterTopbar />

      <main className="recruiter-screening-main">
        {/* HEADER */}
        <div className="screening-header">
          <div>
            <h1>AI Screening</h1>
            <p>
              Review AI-powered candidate screening and
              matching results
            </p>
          </div>

          
        </div>

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fff1f1",
              color: "#d92d20",
              border: "1px solid #fecdca",
            }}
          >
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <section className="screening-summary">
          <div className="screening-card">
            <div className="screening-icon">👥</div>
            <div>
              <span>Total Screened</span>
              <strong>{totalScreened}</strong>
            </div>
          </div>

          <div className="screening-card">
            <div className="screening-icon">★</div>
            <div>
              <span>High Match</span>
              <strong>{highMatch}</strong>
            </div>
          </div>

          <div className="screening-card">
            <div className="screening-icon">✓</div>
            <div>
              <span>Recommended</span>
              <strong>{recommended}</strong>
            </div>
          </div>

          <div className="screening-card">
            <div className="screening-icon">◷</div>
            <div>
              <span>Needs Review</span>
              <strong>{needsReview}</strong>
            </div>
          </div>
        </section>

        {/* INFO */}
        <section className="screening-info">
          <div className="ai-info-icon">✦</div>
          <div>
            <h3>AI Candidate Screening</h3>
            <p>
              AI screening compares candidate information
              with job requirements and provides a match
              score to help recruiters review candidates.
            </p>
          </div>
        </section>

        {/* TABLE */}
        <section className="screening-table-card">
          <div className="screening-toolbar">
            <div className="screening-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search candidates or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="screening-filter"
            >
              <option value="All">All Results</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="RECOMMENDED">Recommended</option>
              <option value="REVIEW">Review</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
              <option value="NOT_QUALIFIED">Not Qualified</option>
            </select>
          </div>

          <div className="screening-table-wrapper">
            <table className="screening-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Experience</th>
                  <th>Skills</th>
                  <th>AI Match</th>
                  <th>Result</th>
                  <th>Screened</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="screening-empty"
                    >
                      <div>
                        <span>✦</span>
                        <h3>Loading screening results...</h3>
                      </div>
                    </td>
                  </tr>
                ) : filteredCandidates.length > 0 ? (
                  filteredCandidates.map((screening) => {
                    const skills = getSkills(screening.skills);

                    const score = Number(
                      screening.screeningScore || 0
                    );

                    const candidate =
                      getCandidateDetails(screening);

                    const job = getJobDetails(screening);

                    const candidateName =
                      candidate?.name ||
                      `Candidate #${screening.candidateId}`;

                    const candidateEmail =
                      candidate?.email || null;

                    const jobTitle =
                      job?.title ||
                      `Job #${screening.jobId}`;

                    const jobDepartment =
                      job?.department || null;

                    return (
                      <tr key={screening.id}>
                        <td>
                          <div className="screening-candidate">
                            <div className="screening-avatar">
                              {candidate?.name
                                ? candidate.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "C"}
                            </div>

                            <div>
                              <strong>
                                {candidateName}
                              </strong>

                              {candidateEmail && (
                                <small>
                                  {candidateEmail}
                                </small>
                              )}

                              <small>
                                Screening ID:{" "}
                                {screening.id}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="screening-position">
                            {jobTitle}
                          </span>

                          {jobDepartment && (
                            <small
                              style={{
                                display: "block",
                                marginTop: "4px",
                                color: "#667085",
                              }}
                            >
                              {jobDepartment}
                            </small>
                          )}
                        </td>

                        <td>
                          {getExperience(screening)}
                        </td>

                        <td>
                          <div className="screening-skills">
                            {skills.length > 0 ? (
                              skills.map((skill, index) => (
                                <span
                                  key={`${screening.id}-${skill}-${index}`}
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div
                            className={`ai-score ${getScoreClass(
                              score
                            )}`}
                          >
                            <strong>
                              {score.toFixed(2)}%
                            </strong>
                            <span>Match</span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`screening-result ${getResultClass(
                              screening.screeningResult
                            )}`}
                          >
                            {formatResult(
                              screening.screeningResult
                            )}
                          </span>
                        </td>

                        <td>
                          {formatScreenedDate(
                            screening.screenedAt
                          )}
                        </td>

                        <td>
                          <div className="screening-actions">
                            <button
                              className="analysis-btn"
                              onClick={() =>
                                handleViewAnalysis(screening)
                              }
                            >
                              Analysis
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="screening-empty"
                    >
                      <div>
                        <span>✦</span>
                        <h3>No screening results found</h3>
                        <p>
                          Try changing your search or filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="screening-footer">
            Showing{" "}
            <strong>
              {filteredCandidates.length}
            </strong>{" "}
            of <strong>{screenings.length}</strong>{" "}
            screening results
          </div>
        </section>
      </main>

      {/* NEW: AI SCREENING ANALYSIS MODAL */}
      {selectedAnalysis && (
        <div
          className="screening-modal-overlay"
          onClick={handleCloseAnalysis}
        >
          <div
            className="screening-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="screening-analysis-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "calc(100% - 32px)",
              maxWidth: "650px",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div className="screening-modal-header">
              <div>
                <h2 id="screening-analysis-title">
                  AI Screening Analysis
                </h2>
                <p>
                  Candidate screening details and recommendation
                </p>
              </div>

              <button
                type="button"
                className="screening-modal-close"
                onClick={handleCloseAnalysis}
                aria-label="Close analysis"
              >
                ×
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <small style={{ color: "#667085" }}>
                    Candidate
                  </small>
                  <p style={{ margin: "6px 0 0", fontWeight: 600 }}>
                    {getCandidateDetails(selectedAnalysis)?.name ||
                      `Candidate #${selectedAnalysis.candidateId}`}
                  </p>
                  <small style={{ color: "#667085" }}>
                    Candidate ID: {selectedAnalysis.candidateId}
                  </small>
                </div>

                <div>
                  <small style={{ color: "#667085" }}>
                    Applied Job
                  </small>
                  <p style={{ margin: "6px 0 0", fontWeight: 600 }}>
                    {getJobDetails(selectedAnalysis)?.title ||
                      `Job #${selectedAnalysis.jobId}`}
                  </p>
                  <small style={{ color: "#667085" }}>
                    Job ID: {selectedAnalysis.jobId}
                  </small>
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  background: "#f8f7ff",
                  border: "1px solid #e9e5ff",
                  borderRadius: "12px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    color: "#667085",
                  }}
                >
                  AI Match Score
                </p>

                <h2
                  style={{
                    margin: "0 0 12px",
                    fontSize: "34px",
                    color: "#6941c6",
                  }}
                >
                  {Number(
                    selectedAnalysis.screeningScore ?? 0
                  ).toFixed(2)}
                  %
                </h2>

                <span
                  className={`screening-result ${getResultClass(
                    selectedAnalysis.screeningResult
                  )}`}
                >
                  {formatResult(
                    selectedAnalysis.screeningResult
                  )}
                </span>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    margin: "0 0 8px",
                  }}
                >
                  Recommendation
                </h3>

                <p
                  style={{
                    color: "#475467",
                    lineHeight: 1.6,
                    margin: 0,
                    overflowWrap: "anywhere",
                  }}
                >
                  {selectedAnalysis.recommendation ||
                    "No recommendation available."}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    margin: "0 0 10px",
                  }}
                >
                  Extracted Skills
                </h3>

                <div
                  className="screening-skills"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  {getSkills(selectedAnalysis.skills).length > 0 ? (
                    getSkills(selectedAnalysis.skills).map(
                      (skill, index) => (
                        <span key={`${skill}-${index}`}>
                          {skill}
                        </span>
                      )
                    )
                  ) : (
                    <p style={{ color: "#667085" }}>
                      No skills available.
                    </p>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  paddingTop: "12px",
                  borderTop: "1px solid #eaecf0",
                }}
              >
                <button
                  type="button"
                  className="screening-cancel-btn"
                  onClick={handleCloseAnalysis}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default RecruiterScreening;