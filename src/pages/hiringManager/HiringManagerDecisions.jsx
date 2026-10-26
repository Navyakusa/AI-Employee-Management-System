import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  User,
  BriefcaseBusiness,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import apiClient from "../../services/apiClient";

import "./HiringManagerDecisions.css";
import "./HiringManagerLayout.css";

function HiringManagerDecisions() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");

  /*
  ======================================================
  HELPERS
  ======================================================
  */

  const normalizeStatus = (status) =>
    String(status || "PENDING").trim().toUpperCase();

  const getErrorMessage = (err, fallback) => {
    if (err.response?.status === 401) {
      return "Your session may have expired. Please log in again.";
    }

    if (err.response?.status === 403) {
      return "Access denied. Please ask the backend team to verify Hiring Manager permissions.";
    }

    if (err.response?.status === 404) {
      return "The requested API endpoint was not found. Please verify the backend mapping.";
    }

    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      fallback
    );
  };

  const extractArray = (responseData) => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData?.content)) {
      return responseData.content;
    }

    if (Array.isArray(responseData?.candidates)) {
      return responseData.candidates;
    }

    if (Array.isArray(responseData?.applications)) {
      return responseData.applications;
    }

    return [];
  };

  /*
  ======================================================
  FETCH CANDIDATE DECISIONS
  ======================================================
  */

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      setError("");

      // Confirm that GET /api/candidate-decisions is the
      // actual listing endpoint in CandidateDecisionController.
      const response = await apiClient.get(
  "/candidate-decisions/pending"
);

      console.log(
        "Candidate Decisions API response:",
        response.data
      );

      const apiCandidates = extractArray(response.data);

      const formattedCandidates = apiCandidates.map(
        (candidate) => ({
          applicationId:
            candidate.applicationId ??
            candidate.application?.applicationId ??
            candidate.id,

          candidateId:
            candidate.candidateId ??
            candidate.candidate?.candidateId,

          jobId:
            candidate.jobId ??
            candidate.job?.jobId,

          candidateName:
            candidate.candidateName ??
            candidate.candidate?.name ??
            candidate.fullName ??
            "Unknown Candidate",

          email:
            candidate.candidateEmail ??
            candidate.email ??
            candidate.candidate?.email ??
            "Not specified",

          jobTitle:
            candidate.jobTitle ??
            candidate.job?.title ??
            candidate.position ??
            "Not specified",

          experience:
            candidate.experience ??
            candidate.yearsOfExperience ??
            "Not specified",

          interviewScore:
            candidate.interviewScore ?? null,

          aiMatchPercentage: (() => {
  const score =
    candidate.aiMatchPercentage ??
    candidate.aiMatchScore ??
    null;

  if (score === null || score === "") {
    return null;
  }

  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return null;
  }

  return numericScore >= 0 && numericScore <= 1
    ? numericScore * 100
    : numericScore;
})(),

          status:
            candidate.status ??
            candidate.applicationStatus ??
            "PENDING",

          department:
            candidate.department ??
            candidate.job?.department ??
            null,

          location:
            candidate.location ??
            candidate.job?.location ??
            null,

          skills:
            candidate.skills ??
            candidate.requiredSkills ??
            null,

          appliedAt:
            candidate.appliedAt ??
            candidate.applicationDate ??
            null,
        })
      );

      setCandidates(formattedCandidates);
    } catch (err) {
      console.error(
        "Failed to fetch candidate decisions:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to load candidate decisions."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  /*
  ======================================================
  APPROVE CANDIDATE
  ======================================================
  */

  const handleApprove = async (candidate) => {
    if (candidate.applicationId == null) {
      setActionError(
        "Cannot approve this candidate because the application ID is missing."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to approve ${candidate.candidateName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(candidate.applicationId);
      setActionError("");

      // Backend security summary specifies PATCH for approve.
      const response = await apiClient.patch(
        `/candidate-decisions/${candidate.applicationId}/approve`
      );

      console.log(
        "Approve candidate response:",
        response.data
      );

      const updatedStatus =
        response.data?.status ??
        response.data?.applicationStatus ??
        "SELECTED";

      setCandidates((previousCandidates) =>
        previousCandidates.map((item) =>
          item.applicationId === candidate.applicationId
            ? {
                ...item,
                status: updatedStatus,
                interviewScore:
                  response.data?.interviewScore ??
                  item.interviewScore,
                aiMatchPercentage:
                  response.data?.aiMatchPercentage ??
                  item.aiMatchPercentage,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to approve candidate:",
        err
      );

      setActionError(
        getErrorMessage(
          err,
          "Failed to approve candidate."
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
  ======================================================
  REJECT CANDIDATE
  ======================================================
  */

  const handleReject = async (candidate) => {
    if (candidate.applicationId == null) {
      setActionError(
        "Cannot reject this candidate because the application ID is missing."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reject ${candidate.candidateName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(candidate.applicationId);
      setActionError("");

      // Backend security summary specifies PATCH for reject.
      const response = await apiClient.patch(
        `/candidate-decisions/${candidate.applicationId}/reject`
      );

      console.log(
        "Reject candidate response:",
        response.data
      );

      const updatedStatus =
        response.data?.status ??
        response.data?.applicationStatus ??
        "REJECTED";

      setCandidates((previousCandidates) =>
        previousCandidates.map((item) =>
          item.applicationId === candidate.applicationId
            ? {
                ...item,
                status: updatedStatus,
                interviewScore:
                  response.data?.interviewScore ??
                  item.interviewScore,
                aiMatchPercentage:
                  response.data?.aiMatchPercentage ??
                  item.aiMatchPercentage,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to reject candidate:",
        err
      );

      setActionError(
        getErrorMessage(
          err,
          "Failed to reject candidate."
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
  ======================================================
  SEARCH + FILTER
  ======================================================
  */

  const filteredCandidates = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const candidateName = String(
        candidate.candidateName || ""
      ).toLowerCase();

      const email = String(
        candidate.email || ""
      ).toLowerCase();

      const jobTitle = String(
        candidate.jobTitle || ""
      ).toLowerCase();

      const matchesSearch =
        !search ||
        candidateName.includes(search) ||
        email.includes(search) ||
        jobTitle.includes(search);

      const status = normalizeStatus(candidate.status);

      let matchesStatus = true;

      if (statusFilter !== "ALL") {
        if (statusFilter === "APPROVED") {
          matchesStatus = [
            "APPROVED",
            "SELECTED",
          ].includes(status);
        } else {
          matchesStatus = status === statusFilter;
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchTerm, statusFilter]);

  /*
  ======================================================
  COUNTS
  ======================================================
  */

  const pendingCount = candidates.filter(
  (candidate) =>
    ["PENDING", "SHORTLISTED"].includes(
      normalizeStatus(candidate.status)
    )
).length;
  const approvedCount = candidates.filter(
    (candidate) =>
      ["APPROVED", "SELECTED", "HIRED"].includes(
        normalizeStatus(candidate.status)
      )
  ).length;

  const rejectedCount = candidates.filter(
    (candidate) =>
      normalizeStatus(candidate.status) === "REJECTED"
  ).length;

  /*
  ======================================================
  DISPLAY STATUS
  ======================================================
  */

  const getDisplayStatus = (status) => {
    switch (normalizeStatus(status)) {
      case "SELECTED":
      case "APPROVED":
        return "Approved";

      case "HIRED":
        return "Hired";

      case "REJECTED":
        return "Rejected";

      case "PENDING":
        return "Pending";

      default:
        return status || "Pending";
    }
  };

  /*
  ======================================================
  SHARED PAGE HEADER
  ======================================================
  */

  const renderPageHeader = () => (
    <div className="hiring-manager-dashboard-header">
      <p className="hiring-manager-label">
        CANDIDATE DECISIONS
      </p>

      <h1>Candidate Decisions</h1>

      <p>
        Review shortlisted candidates and make final hiring
        decisions.
      </p>
    </div>
  );

  /*
  ======================================================
  LOADING
  ======================================================
  */

  if (loading) {
    return (
      <div className="hiring-manager-layout">
        <HiringManagerSidebar />

        <div className="hiring-manager-main">
          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">
            {renderPageHeader()}

            <section className="hm-decision-empty">
              <div className="hm-decision-empty-icon">
                <Clock size={38} />
              </div>

              <h2>Loading Candidates</h2>

              <p>
                Fetching candidate decisions from the backend.
              </p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  /*
  ======================================================
  ERROR
  ======================================================
  */

  if (error) {
    return (
      <div className="hiring-manager-layout">
        <HiringManagerSidebar />

        <div className="hiring-manager-main">
          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">
            {renderPageHeader()}

            <section className="hm-decision-empty">
              <div className="hm-decision-empty-icon">
                <AlertCircle size={38} />
              </div>

              <h2>Unable to Load Candidates</h2>

              <p>{error}</p>

              <button
                type="button"
                onClick={fetchDecisions}
              >
                Try Again
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  /*
  ======================================================
  MAIN PAGE
  ======================================================
  */

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">
          {renderPageHeader()}

          {/* ACTION ERROR */}

          {actionError && (
            <div
              className="hm-decision-empty"
              role="alert"
            >
              <div className="hm-decision-empty-icon">
                <AlertCircle size={30} />
              </div>

              <h2>Action Failed</h2>

              <p>{actionError}</p>

              <button
                type="button"
                onClick={() => setActionError("")}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* SUMMARY */}

          <div className="hm-decision-summary">
            <div className="hm-decision-summary-card">
              <div className="hm-decision-summary-icon pending">
                <Clock size={21} />
              </div>

              <div>
                <span>Pending Decisions</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>

            <div className="hm-decision-summary-card">
              <div className="hm-decision-summary-icon approved">
                <CheckCircle size={21} />
              </div>

              <div>
                <span>Approved</span>
                <strong>{approvedCount}</strong>
              </div>
            </div>

            <div className="hm-decision-summary-card">
              <div className="hm-decision-summary-icon rejected">
                <XCircle size={21} />
              </div>

              <div>
                <span>Rejected</span>
                <strong>{rejectedCount}</strong>
              </div>
            </div>
          </div>

          {/* SEARCH + FILTER */}

          <div className="hm-decision-toolbar">
            <div className="hm-decision-search">
              <Search size={19} />

              <input
                type="text"
                placeholder="Search candidate, email or job..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="hm-decision-filter">
              <Filter size={18} />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="HIRED">Hired</option>
              </select>
            </div>
          </div>

          {/* RESULTS */}

          <div className="hm-decision-results">
            Showing{" "}
            <strong>{filteredCandidates.length}</strong>{" "}
            candidate
            {filteredCandidates.length !== 1 ? "s" : ""}
          </div>

          {/* CANDIDATE CARDS */}

          {filteredCandidates.length > 0 ? (
            <section className="hm-decision-grid">
              {filteredCandidates.map((candidate, index) => {
                const displayStatus = getDisplayStatus(
                  candidate.status
                );

                const normalized = normalizeStatus(
                  candidate.status
                );

                const isPending = normalized === "PENDING";

                const isActionLoading =
                  actionLoading === candidate.applicationId;

                return (
                  <div
                    className="hm-decision-card"
                    key={
                      candidate.applicationId ??
                      candidate.candidateId ??
                      index
                    }
                  >
                    {/* HEADER */}

                    <div className="hm-decision-card-header">
                      <div className="hm-decision-candidate">
                        <div className="hm-decision-avatar">
                          <User size={21} />
                        </div>

                        <div>
                          <h3>{candidate.candidateName}</h3>
                          <p>{candidate.email}</p>
                        </div>
                      </div>

                      <span
                        className={`hm-decision-status ${displayStatus.toLowerCase()}`}
                      >
                        {displayStatus}
                      </span>
                    </div>

                    {/* JOB */}

                    <div className="hm-decision-job">
                      <BriefcaseBusiness size={17} />
                      <span>{candidate.jobTitle}</span>
                    </div>

                    {/* EXPERIENCE */}

                    <div className="hm-decision-info-row">
                      <span>Experience</span>
                      <strong>{candidate.experience}</strong>
                    </div>

                    {/* AI SCORE */}

                    <div className="hm-decision-score-section">
                      <div className="hm-decision-score-header">
                        <span>
                          <Sparkles size={15} />
                          AI Match Score
                        </span>

                        <strong>
                          {candidate.aiMatchPercentage !== null &&
                          candidate.aiMatchPercentage !== undefined
                            ? `${candidate.aiMatchPercentage}%`
                            : "Not Available"}
                        </strong>
                      </div>

                      <div className="hm-decision-score-bar">
                        <div
                          className="hm-decision-score-fill"
                          style={{
                            width:
                              candidate.aiMatchPercentage !== null &&
                              candidate.aiMatchPercentage !== undefined
                                ? `${Math.min(
                                    Math.max(
                                      Number(
                                        candidate.aiMatchPercentage
                                      ) || 0,
                                      0
                                    ),
                                    100
                                  )}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>

                    {/* INTERVIEW SCORE */}

                    <div className="hm-decision-interview-score">
                      <span>Interview Score</span>

                      <strong>
                        {candidate.interviewScore !== null &&
                        candidate.interviewScore !== undefined
                          ? `${candidate.interviewScore} / 5`
                          : "Not Available"}
                      </strong>
                    </div>

                    {/* APPLICATION STATUS */}

                    <div className="hm-decision-interview-status">
                      <span>Application Status</span>
                      <strong>{displayStatus}</strong>
                    </div>

                    {/* ACTIONS */}

                    <div className="hm-decision-actions">
                      <button
                        type="button"
                        className="hm-decision-view-button"
                       disabled={candidate.candidateId == null}
                       onClick={() => {
  if (candidate.candidateId != null) {
    navigate(
      `/hiring-manager/shortlisted-candidates/${candidate.candidateId}`
    );
  }
}}
                      >
                        View Candidate
                      </button>

                      {isPending && (
                        <>
                          <button
                            type="button"
                            className="hm-decision-approve-button"
                            disabled={isActionLoading}
                            onClick={() =>
                              handleApprove(candidate)
                            }
                          >
                            <CheckCircle size={16} />

                            {isActionLoading
                              ? "Processing..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            className="hm-decision-reject-button"
                            disabled={isActionLoading}
                            onClick={() =>
                              handleReject(candidate)
                            }
                          >
                            <XCircle size={16} />

                            {isActionLoading
                              ? "Processing..."
                              : "Reject"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          ) : (
            /* EMPTY STATE */

            <div className="hm-decision-empty">
              <div className="hm-decision-empty-icon">
                <User size={38} />
              </div>

              <h2>No Candidates Found</h2>

              <p>
                {candidates.length === 0
                  ? "There are currently no candidate decisions available."
                  : "No candidates match your current search or status filter."}
              </p>

              {candidates.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default HiringManagerDecisions;
