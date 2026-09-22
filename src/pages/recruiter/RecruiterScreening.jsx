
import React, { useEffect, useMemo, useState } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import apiClient from "../../services/apiClient";
import "./RecruiterScreening.css";

function RecruiterScreening() {
  const [screenings, setScreenings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState({});

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [candidateId, setCandidateId] = useState("");
  const [jobId, setJobId] = useState("");
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [screeningError, setScreeningError] = useState("");
  const [screeningSuccess, setScreeningSuccess] = useState("");

  // =========================================================
  // FETCH CANDIDATE DETAILS
  // =========================================================
  const fetchCandidates = async () => {
    try {
      const response = await apiClient.get("/candidates/all");

      const result = response.data;

      // Candidate API returns a direct array.
      // Also support an ApiResponse-wrapped array.
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

  // =========================================================
  // FETCH JOB DETAILS FOR SCREENING RECORDS
  // =========================================================
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

  // =========================================================
  // FETCH AI SCREENING RESULTS
  // =========================================================
  const fetchScreenings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/ai-resume-screening/all"
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to fetch AI screening results."
        );
      }

      const screeningRecords = Array.isArray(result.data)
        ? result.data
        : [];

      setScreenings(screeningRecords);

      // Fetch related details without blocking screening results.
      await Promise.all([
        fetchCandidates(),
        fetchJobs(screeningRecords),
      ]);
    } catch (err) {
      console.error("AI screening fetch error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to view AI screening results."
        );
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

  useEffect(() => {
    fetchScreenings();
  }, []);

  // =========================================================
  // CREATE CANDIDATE LOOKUP MAP
  // =========================================================
  const candidateMap = useMemo(() => {
    const map = {};

    candidates.forEach((candidate) => {
      if (candidate.id !== null && candidate.id !== undefined) {
        map[String(candidate.id)] = candidate;
      }
    });

    return map;
  }, [candidates]);

  // =========================================================
  // GET CANDIDATE DETAILS
  // =========================================================
  const getCandidateDetails = (screening) => {
    return candidateMap[String(screening.candidateId)] || null;
  };

  // =========================================================
  // GET JOB DETAILS
  // =========================================================
  const getJobDetails = (screening) => {
    return jobs[String(screening.jobId)] || null;
  };

  // =========================================================
  // FORMAT SKILLS
  // =========================================================
  const getSkills = (skills) => {
    if (!skills || !skills.trim()) {
      return [];
    }

    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  // =========================================================
  // FORMAT EXPERIENCE
  // =========================================================
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

  // =========================================================
  // FORMAT SCREENING RESULT
  // =========================================================
  const formatResult = (result) => {
    if (!result) {
      return "Not Available";
    }

    return result
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // =========================================================
  // FORMAT SCREENED DATE
  // =========================================================
  const formatScreenedDate = (date) => {
    if (!date) {
      return "—";
    }

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

  // =========================================================
  // SEARCH + FILTER
  // =========================================================
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
  }, [screenings, search, filter, candidateMap, jobs]);

  // =========================================================
  // SUMMARY COUNTS
  // =========================================================
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

  // =========================================================
  // SCORE COLOR
  // =========================================================
  const getScoreClass = (score) => {
    const value = Number(score || 0);

    if (value >= 85) return "score-high";
    if (value >= 70) return "score-medium";

    return "score-low";
  };

  // =========================================================
  // RESULT CSS CLASS
  // =========================================================
  const getResultClass = (result) => {
    if (!result) {
      return "not-available";
    }

    const value = result.toLowerCase();

    if (
      value === "qualified" ||
      value === "recommended"
    ) {
      return "recommended";
    }

    if (
      value === "review" ||
      value === "needs_review"
    ) {
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

  // =========================================================
  // VIEW ANALYSIS
  // =========================================================
  const handleViewAnalysis = (screening) => {
    const score = Number(
      screening.screeningScore || 0
    ).toFixed(2);

    const candidate = getCandidateDetails(screening);
    const job = getJobDetails(screening);

    alert(
      `AI Screening Analysis\n\n` +
        `Candidate: ${
          candidate?.name || `Candidate #${screening.candidateId}`
        }\n` +
        `Candidate ID: ${screening.candidateId}\n` +
        `Job: ${job?.title || `Job #${screening.jobId}`}\n` +
        `Job ID: ${screening.jobId}\n` +
        `Match Score: ${score}%\n` +
        `Result: ${formatResult(
          screening.screeningResult
        )}\n\n` +
        `Recommendation:\n${
          screening.recommendation || "Not Available"
        }`
    );
  };

  // =========================================================
  // OPEN RUN AI SCREENING MODAL
  // =========================================================
  const handleRunScreening = () => {
    setCandidateId("");
    setJobId("");
    setScreeningError("");
    setScreeningSuccess("");
    setShowScreeningModal(true);
  };

  // =========================================================
  // CLOSE RUN AI SCREENING MODAL
  // =========================================================
  const handleCloseScreeningModal = () => {
    if (screeningLoading) {
      return;
    }

    setShowScreeningModal(false);
    setCandidateId("");
    setJobId("");
    setScreeningError("");
    setScreeningSuccess("");
  };

  // =========================================================
  // SUBMIT AI SCREENING
  // =========================================================
  const handleSubmitScreening = async (e) => {
    e.preventDefault();

    setScreeningError("");
    setScreeningSuccess("");

    if (!candidateId.trim()) {
      setScreeningError("Candidate ID is required.");
      return;
    }

    if (!jobId.trim()) {
      setScreeningError("Job ID is required.");
      return;
    }

    const candidateIdNumber = Number(candidateId);
    const jobIdNumber = Number(jobId);

    if (
      !Number.isInteger(candidateIdNumber) ||
      candidateIdNumber <= 0
    ) {
      setScreeningError(
        "Please enter a valid Candidate ID."
      );
      return;
    }

    if (
      !Number.isInteger(jobIdNumber) ||
      jobIdNumber <= 0
    ) {
      setScreeningError(
        "Please enter a valid Job ID."
      );
      return;
    }

    try {
      setScreeningLoading(true);

      const response = await apiClient.post(
        "/ai-resume-screening/screen",
        {
          candidateId: candidateIdNumber,
          jobId: jobIdNumber,
        }
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "AI screening failed."
        );
      }

      setScreeningSuccess(
        result?.message ||
          "AI resume screening completed successfully."
      );

      // Refresh the table with the newly created screening.
      await fetchScreenings();

      setTimeout(() => {
        setShowScreeningModal(false);
        setCandidateId("");
        setJobId("");
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

  return (
    <div className="recruiter-screening-page">
      <RecruiterSidebar />
      <RecruiterTopbar />

      <main className="recruiter-screening-main">
        <div className="screening-header">
          <div>
            <h1>AI Screening</h1>

            <p>
              Review AI-powered candidate screening and
              matching results
            </p>
          </div>

          <button
            className="run-screening-btn"
            onClick={handleRunScreening}
          >
            <span>✦</span>
            Run AI Screening
          </button>
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

        <section className="screening-table-card">
          <div className="screening-toolbar">
            <div className="screening-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search candidates or skills..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="screening-filter"
            >
              <option value="All">
                All Results
              </option>

              <option value="QUALIFIED">
                Qualified
              </option>

              <option value="RECOMMENDED">
                Recommended
              </option>

              <option value="REVIEW">
                Review
              </option>

              <option value="NEEDS_REVIEW">
                Needs Review
              </option>

              <option value="NOT_QUALIFIED">
                Not Qualified
              </option>
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
                        <h3>
                          Loading screening results...
                        </h3>
                      </div>
                    </td>
                  </tr>
                ) : filteredCandidates.length > 0 ? (
                  filteredCandidates.map(
                    (screening) => {
                      const skills = getSkills(
                        screening.skills
                      );

                      const score = Number(
                        screening.screeningScore || 0
                      );

                      const candidate = getCandidateDetails(
                        screening
                      );

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
                                skills.map(
                                  (skill, index) => (
                                    <span
                                      key={`${screening.id}-${skill}-${index}`}
                                    >
                                      {skill}
                                    </span>
                                  )
                                )
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
                                  handleViewAnalysis(
                                    screening
                                  )
                                }
                              >
                                Analysis
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="screening-empty"
                    >
                      <div>
                        <span>✦</span>

                        <h3>
                          No screening results found
                        </h3>

                        <p>
                          Try changing your search or
                          filter.
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

      {showScreeningModal && (
        <div
          className="screening-modal-overlay"
          onClick={handleCloseScreeningModal}
        >
          <div
            className="screening-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="screening-modal-header">
              <div>
                <h2>Run AI Screening</h2>

                <p>
                  Enter the candidate and job IDs to run
                  AI-powered resume screening.
                </p>
              </div>

              <button
                type="button"
                className="screening-modal-close"
                onClick={handleCloseScreeningModal}
                disabled={screeningLoading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitScreening}>
              <div className="screening-form-group">
                <label htmlFor="candidateId">
                  Candidate ID
                  <span>*</span>
                </label>

                <input
                  id="candidateId"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter candidate ID"
                  value={candidateId}
                  onChange={(e) =>
                    setCandidateId(e.target.value)
                  }
                  disabled={screeningLoading}
                />
              </div>

              <div className="screening-form-group">
                <label htmlFor="jobId">
                  Job ID
                  <span>*</span>
                </label>

                <input
                  id="jobId"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter job ID"
                  value={jobId}
                  onChange={(e) =>
                    setJobId(e.target.value)
                  }
                  disabled={screeningLoading}
                />
              </div>

              {screeningError && (
                <div className="screening-modal-error">
                  {screeningError}
                </div>
              )}

              {screeningSuccess && (
                <div className="screening-modal-success">
                  ✓ {screeningSuccess}
                </div>
              )}

              <div className="screening-modal-actions">
                <button
                  type="button"
                  className="screening-cancel-btn"
                  onClick={handleCloseScreeningModal}
                  disabled={screeningLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="screening-submit-btn"
                  disabled={screeningLoading}
                >
                  {screeningLoading
                    ? "Running AI Screening..."
                    : "✦ Run Screening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterScreening;