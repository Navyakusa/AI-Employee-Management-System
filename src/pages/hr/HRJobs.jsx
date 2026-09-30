import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import HRSidebar from "./HRSidebar";
import "./HRJobs.css";

import {
  fetchJobs,
  fetchApplicationsPerJob,
  closeJob,
  activateJob,
} from "./hrApi";

function HRJobs() {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [jobs, setJobs] = useState([]);
  const [applicationsPerJob, setApplicationsPerJob] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  // ============================================================
  // LOAD JOBS + APPLICATION COUNTS FROM BACKEND
  // ============================================================

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobsResponse, applicationsResponse] =
        await Promise.all([
          fetchJobs(),
          fetchApplicationsPerJob(),
        ]);

      console.log("Jobs from backend:", jobsResponse);
      console.log(
        "Applications per job from backend:",
        applicationsResponse
      );

      // --------------------------------------------------------
      // JOBS
      // --------------------------------------------------------

      const jobsData = Array.isArray(jobsResponse)
        ? jobsResponse
        : [];

      // --------------------------------------------------------
      // APPLICATIONS PER JOB
      // --------------------------------------------------------

      const applicationsData = Array.isArray(
        applicationsResponse
      )
        ? applicationsResponse
        : [];

      setJobs(jobsData);
      setApplicationsPerJob(applicationsData);

    } catch (err) {
      console.error("Failed to load jobs:", err);

      setError(
        err.message ||
          "Failed to load jobs from backend."
      );

      setJobs([]);
      setApplicationsPerJob([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    loadJobs();
  }, []);

  // ============================================================
  // GET APPLICATION COUNT FOR A JOB
  // ============================================================

  const getApplicationCount = (jobId) => {
    const item = applicationsPerJob.find(
      (application) =>
        Number(application.jobId) === Number(jobId)
    );

    return Number(item?.applicationCount) || 0;
  };

  // ============================================================
  // TOTAL APPLICATIONS
  // ============================================================

  const totalApplications = applicationsPerJob.reduce(
    (total, item) => {
      return (
        total +
        (Number(item.applicationCount) || 0)
      );
    },
    0
  );

  // ============================================================
  // CLOSE JOB
  // PUT /api/jobs/{id}/close
  // ============================================================

  const handleCloseJob = async (jobId) => {
    try {
      setActionLoading(jobId);
      setError("");

      console.log("Closing backend job:", jobId);

      await closeJob(jobId);

      // Reload latest backend data
      await loadJobs();

    } catch (err) {
      console.error(
        "Failed to close job:",
        err
      );

      setError(
        err.message ||
          "Failed to close job."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // ACTIVATE JOB
  // PUT /api/jobs/{id}/activate
  // ============================================================

  const handleActivateJob = async (jobId) => {
    try {
      setActionLoading(jobId);
      setError("");

      console.log(
        "Activating backend job:",
        jobId
      );

      await activateJob(jobId);

      // Reload latest backend data
      await loadJobs();

    } catch (err) {
      console.error(
        "Failed to activate job:",
        err
      );

      setError(
        err.message ||
          "Failed to activate job."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================
  // We keep the existing search UI.
  //
  // Backend already gives us the complete job list.
  // Searching locally allows the user to search by:
  // title, department, or location.
  // ============================================================

  const filteredJobs = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return jobs;
    }

    return jobs.filter((job) => {
      const title =
        job.title?.toLowerCase() || "";

      const department =
        job.department?.toLowerCase() || "";

      const location =
        job.location?.toLowerCase() || "";

      return (
        title.includes(search) ||
        department.includes(search) ||
        location.includes(search)
      );
    });
  }, [jobs, searchTerm]);

  // ============================================================
  // ACTIVE JOBS
  // Backend OPEN status = Active
  // ============================================================

  const activeJobs = jobs.filter(
    (job) =>
      job.status?.toUpperCase() === "OPEN"
  ).length;

  // ============================================================
  // OPEN POSITIONS
  //
  // Sum the openings from all currently OPEN jobs.
  // ============================================================

  const openPositions = jobs
    .filter(
      (job) =>
        job.status?.toUpperCase() === "OPEN"
    )
    .reduce(
      (total, job) =>
        total +
        (Number(job.openings) || 0),
      0
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="hr-dashboard">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <HRSidebar />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="hr-main">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="hr-header">

          <div>
            <h1>
              Jobs
            </h1>

            <p>
              Manage your organization's
              job openings.
            </p>
          </div>

          <button
            className="create-job-button"
            onClick={() =>
              navigate("/hr/jobs/create")
            }
          >
            + Create Job
          </button>

        </header>

        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
            }}
          >
            {error}
          </div>
        )}

        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <section className="jobs-stats">

          {/* ==================================================
              OPEN POSITIONS
          ================================================== */}

          <div className="job-stat-card">

            <span>
              Open Positions
            </span>

            <strong>
              {loading
                ? "..."
                : openPositions}
            </strong>

          </div>

          {/* ==================================================
              ACTIVE JOBS
          ================================================== */}

          <div className="job-stat-card">

            <span>
              Active Jobs
            </span>

            <strong>
              {loading
                ? "..."
                : activeJobs}
            </strong>

          </div>

          {/* ==================================================
              TOTAL APPLICATIONS
          ================================================== */}

          <div className="job-stat-card">

            <span>
              Total Applications
            </span>

            <strong>
              {loading
                ? "..."
                : totalApplications}
            </strong>

          </div>

        </section>

        {/* ====================================================
            JOBS PANEL
        ==================================================== */}

        <section className="jobs-panel">

          <div className="jobs-panel-header">

            <h2>
              Job Openings
            </h2>

            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="no-jobs">
              Loading jobs...
            </div>

          ) : (

            <div className="job-table">

              {/* ==============================================
                  TABLE HEADER
              ============================================== */}

              <div className="job-row job-heading">

                <span>
                  Job Title
                </span>

                <span>
                  Department
                </span>

                <span>
                  Applications
                </span>

                <span>
                  Status
                </span>

                <span>
                  Actions
                </span>

              </div>

              {/* ==============================================
                  NO JOBS
              ============================================== */}

              {filteredJobs.length === 0 ? (

                <div className="no-jobs">
                  No jobs found.
                </div>

              ) : (

                filteredJobs.map((job) => {

                  // ------------------------------------------
                  // BACKEND STATUS
                  // ------------------------------------------

                  const isOpen =
                    job.status
                      ?.toUpperCase() ===
                    "OPEN";

                  // ------------------------------------------
                  // APPLICATION COUNT
                  // ------------------------------------------

                  const applicationCount =
                    getApplicationCount(
                      job.id
                    );

                  // ------------------------------------------
                  // BUTTON LOADING
                  // ------------------------------------------

                  const isProcessing =
                    actionLoading ===
                    job.id;

                  return (

                    <div
                      className="job-row"
                      key={job.id}
                    >

                      {/* ==================================
                          JOB TITLE
                      ================================== */}

                      <span>
                        {job.title ||
                          "Untitled Job"}
                      </span>

                      {/* ==================================
                          DEPARTMENT
                      ================================== */}

                      <span>
                        {job.department ||
                          "—"}
                      </span>

                      {/* ==================================
                          APPLICATIONS
                      ================================== */}

                      <span>
                        {applicationCount}
                      </span>

                      {/* ==================================
                          STATUS
                      ================================== */}

                      <span
                        className={`job-status ${
                          isOpen
                            ? "active"
                            : "closed"
                        }`}
                      >
                        {isOpen
                          ? "Active"
                          : "Closed"}
                      </span>

                      {/* ==================================
                          ACTIONS
                      ================================== */}

                      <span className="job-actions">

                        {isOpen ? (

                          // --------------------------------
                          // CLOSE BUTTON
                          // --------------------------------

                          <button
                            type="button"
                            className="close-job-button"
                            disabled={
                              isProcessing
                            }
                            onClick={() =>
                              handleCloseJob(
                                job.id
                              )
                            }
                            title="Close Position"
                          >

                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6L6 18" />
                              <path d="M6 6L18 18" />
                            </svg>

                            <span>
                              {isProcessing
                                ? "Closing..."
                                : "Close"}
                            </span>

                          </button>

                        ) : (

                          // --------------------------------
                          // ACTIVATE BUTTON
                          // --------------------------------

                          <button
                            type="button"
                            className="activate-job-button"
                            disabled={
                              isProcessing
                            }
                            onClick={() =>
                              handleActivateJob(
                                job.id
                              )
                            }
                            title="Activate Position"
                          >

                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12l5 5L20 7" />
                            </svg>

                            <span>
                              {isProcessing
                                ? "Activating..."
                                : "Activate"}
                            </span>

                          </button>

                        )}

                      </span>

                    </div>

                  );
                })

              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default HRJobs;