import React, { useEffect, useState } from "react";
import HRSidebar from "./HRSidebar";
import HRNavbar from "./HRNavbar";
import "./HRScreening.css";

import {
  fetchJobs,
  fetchCandidates,
  screenResume,
  rankCandidatesForJob,
} from "./hrApi";


function HRScreening() {
  // ==========================================================
  // SCREENING
  // ==========================================================

  const [jobId, setJobId] = useState("");
  const [candidateId, setCandidateId] = useState("");

  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const [screening, setScreening] = useState(false);

  const [screenResult, setScreenResult] = useState(null);

  const [screenError, setScreenError] = useState("");

  const [pageError, setPageError] = useState("");

  // ==========================================================
  // AI RANKING
  // ==========================================================

  const [rankingJobId, setRankingJobId] = useState("");

  const [rankingResults, setRankingResults] = useState([]);

  const [rankingLoading, setRankingLoading] = useState(false);

  const [rankingError, setRankingError] = useState("");

  // ==========================================================
  // LOAD JOBS + CANDIDATES
  // ==========================================================

  useEffect(() => {
    loadJobs();
    loadCandidates();
  }, []);

  async function loadJobs() {
    try {
      setLoadingJobs(true);
      setPageError("");

      const data = await fetchJobs();

      console.log("AI Screening - jobs response:", data);

      const jobList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.content)
        ? data.content
        : [];

      setJobs(jobList);
    } catch (error) {
      console.error("Failed to load jobs:", error);

      setPageError(error.message || "Failed to load jobs.");
    } finally {
      setLoadingJobs(false);
    }
  }

  async function loadCandidates() {
    try {
      setLoadingCandidates(true);

      const data = await fetchCandidates();

      console.log(
        "AI Screening - candidates response:",
        data
      );

      const candidateList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.content)
        ? data.content
        : [];

      setCandidates(candidateList);
    } catch (error) {
      console.error(
        "Failed to load candidates:",
        error
      );

      setPageError(
        error.message || "Failed to load candidates."
      );
    } finally {
      setLoadingCandidates(false);
    }
  }

  // ==========================================================
  // GET JOB ID
  // ==========================================================

  function getJobId(job) {
    return (
      job?.id ??
      job?.jobId ??
      job?.job_id
    );
  }

  // ==========================================================
  // GET JOB TITLE
  // ==========================================================

  function getJobTitle(job) {
    return (
      job?.title ||
      job?.jobTitle ||
      job?.name ||
      `Job ${getJobId(job)}`
    );
  }

  // ==========================================================
  // GET CANDIDATE ID
  // ==========================================================

  function getCandidateId(candidate) {
    return (
      candidate?.id ??
      candidate?.candidateId ??
      candidate?.candidate_id
    );
  }

  // ==========================================================
  // GET CANDIDATE NAME
  // ==========================================================

  function getCandidateName(candidate) {
    return (
      candidate?.name ||
      candidate?.fullName ||
      candidate?.candidateName ||
      [
        candidate?.firstName,
        candidate?.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      `Candidate ${getCandidateId(candidate)}`
    );
  }

  // ==========================================================
  // RUN AI SCREENING
  // ==========================================================

  async function handleScreen(e) {
    e.preventDefault();

    setScreenError("");
    setScreenResult(null);

    if (!jobId) {
      setScreenError("Please select a job.");
      return;
    }

    if (!candidateId) {
      setScreenError("Please select a candidate.");
      return;
    }

    try {
      setScreening(true);

      console.log(
        "Running AI Resume Screening:",
        {
          candidateId,
          jobId,
        }
      );

      const result = await screenResume(
        candidateId,
        jobId
      );

      console.log(
        "AI Resume Screening response:",
        result
      );

      /*
       * screenResume() already unwraps:
       *
       * {
       *   success: true,
       *   data: {...}
       * }
       *
       * so `result` is the actual data object.
       */

      setScreenResult(result);
    } catch (error) {
      console.error(
        "AI Resume Screening failed:",
        error
      );

      setScreenError(
        error.message ||
          "Failed to perform AI resume screening."
      );
    } finally {
      setScreening(false);
    }
  }

  // ==========================================================
  // RUN AI RANKING
  // ==========================================================

  async function handleRanking() {
    setRankingError("");
    setRankingResults([]);

    if (!rankingJobId) {
      setRankingError("Please select a job.");
      return;
    }

    try {
      setRankingLoading(true);

      console.log(
        "Running AI Candidate Ranking:",
        {
          jobId: rankingJobId,
        }
      );

      const result = await rankCandidatesForJob(
        rankingJobId
      );

      console.log(
        "AI Candidate Ranking response:",
        result
      );

      /*
       * rankCandidatesForJob() already unwraps:
       *
       * {
       *   success: true,
       *   data: [...]
       * }
       *
       * so result should be the ranking array.
       */

      const rankingList = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : [];

      setRankingResults(rankingList);
    } catch (error) {
      console.error(
        "AI Candidate Ranking failed:",
        error
      );

      setRankingError(
        error.message ||
          "Failed to rank candidates."
      );
    } finally {
      setRankingLoading(false);
    }
  }

  // ==========================================================
  // FORMAT SCORE
  // ==========================================================

  function formatScore(score) {
    if (
      score === null ||
      score === undefined ||
      score === ""
    ) {
      return "—";
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore)) {
      return score;
    }

    return `${numericScore}%`;
  }

  // ==========================================================
  // DISPLAY VALUE
  // ==========================================================

  function displayValue(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Not available";
    }

    return value;
  }

  // ==========================================================
  // SELECTED CANDIDATE
  // ==========================================================

  const selectedCandidate =
    candidates.find(
      (candidate) =>
        String(getCandidateId(candidate)) ===
        String(candidateId)
    );

  // ==========================================================
  // SELECTED JOB
  // ==========================================================

  const selectedJob = jobs.find(
    (job) =>
      String(getJobId(job)) ===
      String(jobId)
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="hr-screening-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <HRSidebar />


      {/* =====================================================
          COMMON HR NAVBAR
      ===================================================== */}

      <HRNavbar />


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="hr-screening-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="screening-header">

          <div>
            <h1>AI Screening</h1>

            <p>
              Analyze candidate resumes against job
              requirements using AI.
            </p>
          </div>

        </header>


        {/* ===================================================
            PAGE ERROR
        =================================================== */}

        {pageError && (
          <div className="error-message">
            {pageError}
          </div>
        )}


        {/* ===================================================
            SCREEN A CANDIDATE
        =================================================== */}

        <section className="screening-card">

          <div className="card-heading">

            <div className="heading-icon">
              🤖
            </div>

            <div>
              <h2>Screen a Candidate</h2>

              <p>
                Select a job and candidate to perform
                AI-based resume screening.
              </p>
            </div>

          </div>


          <form
            className="screening-form"
            onSubmit={handleScreen}
          >

            {/* JOB */}

            <div className="form-group">

              <label htmlFor="screen-job">
                Select Job
              </label>

              <select
                id="screen-job"
                value={jobId}
                onChange={(e) => {
                  setJobId(e.target.value);
                  setScreenResult(null);
                  setScreenError("");
                }}
                disabled={loadingJobs}
              >

                <option value="">
                  {loadingJobs
                    ? "Loading jobs..."
                    : "Select a job..."}
                </option>

                {jobs.map((job) => {
                  const id = getJobId(job);

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {getJobTitle(job)}
                    </option>
                  );
                })}

              </select>

            </div>


            {/* CANDIDATE */}

            <div className="form-group">

              <label htmlFor="screen-candidate">
                Select Candidate
              </label>

              <select
                id="screen-candidate"
                value={candidateId}
                onChange={(e) => {
                  setCandidateId(e.target.value);
                  setScreenResult(null);
                  setScreenError("");
                }}
                disabled={loadingCandidates}
              >

                <option value="">
                  {loadingCandidates
                    ? "Loading candidates..."
                    : "Select a candidate..."}
                </option>

                {candidates.map(
                  (candidate) => {
                    const id =
                      getCandidateId(
                        candidate
                      );

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {getCandidateName(
                          candidate
                        )}
                      </option>
                    );
                  }
                )}

              </select>

            </div>


            {/* BUTTON */}

            <button
              type="submit"
              className="primary-button"
              disabled={
                screening ||
                loadingJobs ||
                loadingCandidates
              }
            >
              {screening
                ? "Screening..."
                : "Run AI Screening"}
            </button>

          </form>


          {screenError && (
            <div className="error-message">
              {screenError}
            </div>
          )}

        </section>


        {/* ===================================================
            SCREENING RESULT
        =================================================== */}

        {screenResult && (
          <section className="screening-card result-card">

            {/* RESULT HEADER */}

            <div className="result-header">

              <div>

                <h2>
                  AI Screening Result
                </h2>

                <p>
                  Candidate:{" "}
                  <strong>
                    {selectedCandidate
                      ? getCandidateName(
                          selectedCandidate
                        )
                      : `Candidate ${candidateId}`}
                  </strong>
                </p>

                <p>
                  Job:{" "}
                  <strong>
                    {selectedJob
                      ? getJobTitle(selectedJob)
                      : `Job ${jobId}`}
                  </strong>
                </p>

              </div>


              {/* SCORE */}

              <div className="overall-score">

                <span>
                  {formatScore(
                    screenResult.screeningScore
                  )}
                </span>

                <small>
                  Screening Score
                </small>

              </div>

            </div>


            {/* =================================================
                SCREENING RESULT + RECOMMENDATION
            ================================================= */}

            <div className="screening-summary-grid">

              <div className="summary-box">

                <span className="summary-label">
                  Screening Result
                </span>

                <strong className="screening-result-value">
                  {displayValue(
                    screenResult.screeningResult
                  )}
                </strong>

              </div>


              <div className="summary-box">

                <span className="summary-label">
                  Recommendation
                </span>

                <p>
                  {displayValue(
                    screenResult.recommendation
                  )}
                </p>

              </div>

            </div>


            {/* =================================================
                RESUME INFORMATION
            ================================================= */}

            <div className="resume-info-section">

              <h3>
                Resume Analysis
              </h3>


              <div className="resume-info-grid">

                <InfoCard
                  title="Skills"
                  value={
                    screenResult.skills
                  }
                />

                <InfoCard
                  title="Experience"
                  value={
                    screenResult.experience
                  }
                />

                <InfoCard
                  title="Education"
                  value={
                    screenResult.education
                  }
                />

                <InfoCard
                  title="Certifications"
                  value={
                    screenResult.certifications
                  }
                />

                <InfoCard
                  title="Job Titles"
                  value={
                    screenResult.jobTitles
                  }
                />

                <InfoCard
                  title="Companies"
                  value={
                    screenResult.companies
                  }
                />

                <InfoCard
                  title="Technologies"
                  value={
                    screenResult.technologies
                  }
                />

                <InfoCard
                  title="Projects"
                  value={
                    screenResult.projects
                  }
                />

              </div>

            </div>


            {/* =================================================
                EXPERIENCE
            ================================================= */}

            <div className="experience-card">

              <span>
                Years of Experience
              </span>

              <strong>
                {displayValue(
                  screenResult.yearsOfExperience
                )}
              </strong>

            </div>


            {/* =================================================
                SCREENING ID / DATE
            ================================================= */}

            <div className="screening-meta">

              <span>
                Screening ID:{" "}
                <strong>
                  {displayValue(
                    screenResult.id
                  )}
                </strong>
              </span>

              <span>
                Screened At:{" "}
                <strong>
                  {screenResult.screenedAt
                    ? new Date(
                        screenResult.screenedAt
                      ).toLocaleString()
                    : "Not available"}
                </strong>
              </span>

            </div>

          </section>
        )}


        {/* ===================================================
            AI RANKINGS
        =================================================== */}

        <section className="screening-card ranking-card">

          <div className="card-heading">

            <div className="heading-icon">
              🏆
            </div>

            <div>

              <h2>
                AI Rankings
              </h2>

              <p>
                Rank candidates against a selected
                job based on AI screening results.
              </p>

            </div>

          </div>


          {/* =================================================
              RANKING CONTROLS
          ================================================= */}

          <div className="ranking-controls">

            <div className="form-group ranking-job-group">

              <label htmlFor="ranking-job">
                Select Job
              </label>

              <select
                id="ranking-job"
                value={rankingJobId}
                onChange={(e) => {
                  setRankingJobId(e.target.value);
                  setRankingResults([]);
                  setRankingError("");
                }}
                disabled={
                  loadingJobs ||
                  rankingLoading
                }
              >

                <option value="">
                  {loadingJobs
                    ? "Loading jobs..."
                    : "Select a job..."}
                </option>

                {jobs.map((job) => {

                  const id = getJobId(job);

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {getJobTitle(job)}
                    </option>
                  );

                })}

              </select>

            </div>


            <button
              type="button"
              className="primary-button ranking-button"
              onClick={handleRanking}
              disabled={
                rankingLoading ||
                loadingJobs ||
                !rankingJobId
              }
            >
              {rankingLoading
                ? "Ranking..."
                : "Rank Candidates"}
            </button>

          </div>


          {/* =================================================
              RANKING ERROR
          ================================================= */}

          {rankingError && (
            <div className="error-message">
              {rankingError}
            </div>
          )}


          {/* =================================================
              RANKING RESULTS
          ================================================= */}

          {rankingResults.length > 0 && (
            <div className="ranking-results">

              <div className="ranking-results-header">

                <div>

                  <h3>
                    Candidate Rankings
                  </h3>

                  <p>
                    AI-generated ranking for{" "}
                    <strong>
                      {jobs.find(
                        (job) =>
                          String(
                            getJobId(job)
                          ) ===
                          String(rankingJobId)
                      )
                        ? getJobTitle(
                            jobs.find(
                              (job) =>
                                String(
                                  getJobId(job)
                                ) ===
                                String(
                                  rankingJobId
                                )
                            )
                          )
                        : `Job ${rankingJobId}`}
                    </strong>
                  </p>

                </div>

                <div className="ranking-count">
                  {rankingResults.length} Candidates
                </div>

              </div>


              <div className="ranking-table-wrapper">

                <table className="ranking-table">

                  <thead>

                    <tr>
                      <th>Rank</th>
                      <th>Candidate</th>
                      <th>Match</th>
                      <th>Must-Have Coverage</th>
                      <th>Missing Must-Have</th>
                    </tr>

                  </thead>


                  <tbody>

                    {rankingResults.map(
                      (item) => {

                        const candidate =
                          candidates.find(
                            (candidateItem) =>
                              String(
                                getCandidateId(
                                  candidateItem
                                )
                              ) ===
                              String(
                                item.candidateId
                              )
                          );


                        const candidateName =
                          candidate
                            ? getCandidateName(
                                candidate
                              )
                            : `Candidate ${item.candidateId}`;


                        return (
                          <tr key={item.id}>

                            {/* RANK */}

                            <td>

                              <span className="rank-badge">
                                #{item.rank}
                              </span>

                            </td>


                            {/* CANDIDATE */}

                            <td>

                              <div className="ranking-candidate-name">

                                <strong>
                                  {candidateName}
                                </strong>

                                {item.candidateRole && (
                                  <span className="candidate-role">
                                    {item.candidateRole}
                                  </span>
                                )}

                              </div>

                            </td>


                            {/* MATCH SCORE */}

                            <td>

                              <span className="match-score">
                                {Number(
                                  item.matchScore ??
                                  0
                                ).toFixed(2)}
                                %
                              </span>

                            </td>


                            {/* MUST HAVE COVERAGE */}

                            <td>

                              <div className="coverage-cell">

                                <div className="coverage-value">
                                  {Number(
                                    item.mustHaveCoveragePct ??
                                    0
                                  ).toFixed(0)}
                                  %
                                </div>

                                <div className="coverage-bar">

                                  <div
                                    className="coverage-fill"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          Number(
                                            item.mustHaveCoveragePct ??
                                            0
                                          )
                                        )
                                      )}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            </td>


                            {/* MISSING SKILLS */}

                            <td>

                              {Array.isArray(
                                item.missingMustHave
                              ) &&
                              item.missingMustHave
                                .length > 0 ? (

                                <div className="missing-skills">

                                  {item.missingMustHave.map(
                                    (
                                      skill,
                                      index
                                    ) => (
                                      <span
                                        className="skill-tag"
                                        key={`${skill}-${index}`}
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}

                                </div>

                              ) : (

                                <span className="no-missing">
                                  ✓ None
                                </span>

                              )}

                            </td>

                          </tr>
                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!rankingLoading &&
            !rankingError &&
            rankingResults.length === 0 && (

              <div className="ranking-empty">

                <div className="ranking-empty-icon">
                  🏆
                </div>

                <h3>
                  No Rankings Yet
                </h3>

                <p>
                  Select a job and click{" "}
                  <strong>
                    Rank Candidates
                  </strong>{" "}
                  to generate AI candidate rankings.
                </p>

              </div>

            )}

        </section>

      </main>

    </div>
  );
}


// ============================================================
// INFO CARD
// ============================================================

function InfoCard({ title, value }) {
  return (
    <div className="info-card">

      <h4>
        {title}
      </h4>

      <p>
        {value === null ||
        value === undefined ||
        value === ""
          ? "Not available"
          : value}
      </p>

    </div>
  );
}


export default HRScreening;