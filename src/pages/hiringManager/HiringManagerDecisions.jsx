import React, { useEffect, useMemo, useState } from "react";
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

import {
  getCandidateDecisions,
  approveCandidate,
  rejectCandidate,
} from "./HiringManagerApi";

import "./HiringManagerDashboard.css";

function HiringManagerDecisions() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");

  // ======================================================
  // FETCH CANDIDATE DECISIONS
  // ======================================================

  const fetchDecisions = async (search = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await getCandidateDecisions(search);

      console.log("Candidate decisions response:", response);

      const apiCandidates = response?.data || [];

      const formattedCandidates = apiCandidates.map((candidate) => ({
        applicationId: candidate.applicationId,
        candidateId: candidate.candidateId,
        jobId: candidate.jobId,

        candidateName:
          candidate.candidateName || "Unknown Candidate",

        email:
          candidate.candidateEmail || "Not specified",

        jobTitle:
          candidate.jobTitle || "Not specified",

        experience:
          candidate.experience || "Not specified",

        interviewScore:
          candidate.interviewScore ?? null,

        aiMatchPercentage:
          candidate.aiMatchPercentage ?? null,

        status:
          candidate.status || "PENDING",
      }));

      setCandidates(formattedCandidates);
    } catch (err) {
      console.error(
        "Failed to fetch candidate decisions:",
        err
      );

      setError(
        err.message ||
          "Failed to load candidate decisions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  // ======================================================
  // APPROVE CANDIDATE
  // ======================================================

  const handleApprove = async (candidate) => {
    const confirmed = window.confirm(
      `Are you sure you want to approve ${candidate.candidateName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(candidate.applicationId);
      setActionError("");

      const response = await approveCandidate(
        candidate.applicationId
      );

      console.log("Approve response:", response);

      // Update UI using backend response
      if (response?.data) {
        setCandidates((previousCandidates) =>
          previousCandidates.map((item) =>
            item.applicationId ===
            candidate.applicationId
              ? {
                  ...item,
                  status:
                    response.data.status ||
                    "SELECTED",
                  interviewScore:
                    response.data.interviewScore ??
                    item.interviewScore,
                  aiMatchPercentage:
                    response.data.aiMatchPercentage ??
                    item.aiMatchPercentage,
                }
              : item
          )
        );
      } else {
        await fetchDecisions(searchTerm);
      }
    } catch (err) {
      console.error(
        "Failed to approve candidate:",
        err
      );

      setActionError(
        err.message ||
          "Failed to approve candidate."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // REJECT CANDIDATE
  // ======================================================

  const handleReject = async (candidate) => {
    const confirmed = window.confirm(
      `Are you sure you want to reject ${candidate.candidateName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(candidate.applicationId);
      setActionError("");

      const response = await rejectCandidate(
        candidate.applicationId
      );

      console.log("Reject response:", response);

      if (response?.data) {
        setCandidates((previousCandidates) =>
          previousCandidates.map((item) =>
            item.applicationId ===
            candidate.applicationId
              ? {
                  ...item,
                  status:
                    response.data.status ||
                    "REJECTED",
                  interviewScore:
                    response.data.interviewScore ??
                    item.interviewScore,
                  aiMatchPercentage:
                    response.data.aiMatchPercentage ??
                    item.aiMatchPercentage,
                }
              : item
          )
        );
      } else {
        await fetchDecisions(searchTerm);
      }
    } catch (err) {
      console.error(
        "Failed to reject candidate:",
        err
      );

      setActionError(
        err.message ||
          "Failed to reject candidate."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // SEARCH + FILTER
  // ======================================================

  const filteredCandidates = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !search ||
        candidate.candidateName
          .toLowerCase()
          .includes(search) ||
        candidate.email
          .toLowerCase()
          .includes(search) ||
        candidate.jobTitle
          .toLowerCase()
          .includes(search);

      const normalizedStatus =
        candidate.status?.toUpperCase();

      const matchesStatus =
        statusFilter === "All" ||
        normalizedStatus ===
          statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [
    candidates,
    searchTerm,
    statusFilter,
  ]);

  // ======================================================
  // COUNTS
  // ======================================================

  const pendingCount = candidates.filter(
    (candidate) =>
      candidate.status?.toUpperCase() ===
      "PENDING"
  ).length;

  const approvedCount = candidates.filter(
    (candidate) =>
      ["SELECTED", "HIRED"].includes(
        candidate.status?.toUpperCase()
      )
  ).length;

  const rejectedCount = candidates.filter(
    (candidate) =>
      candidate.status?.toUpperCase() ===
      "REJECTED"
  ).length;

  // ======================================================
  // STATUS DISPLAY
  // ======================================================

  const getDisplayStatus = (status) => {
    switch (status?.toUpperCase()) {
      case "SELECTED":
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

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="hiring-manager-layout">
        <HiringManagerSidebar />

        <div className="hiring-manager-main">
          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">
            <div className="hiring-manager-dashboard-header">
              <p className="hiring-manager-label">
                CANDIDATE DECISIONS
              </p>

              <h1>Candidate Decisions</h1>

              <p>
                Review shortlisted candidates and
                make final hiring decisions.
              </p>
            </div>

            <section className="hm-decision-empty">
              <div className="hm-decision-empty-icon">
                <Clock size={38} />
              </div>

              <h2>Loading Candidates</h2>

              <p>
                Fetching candidate decisions from
                the backend.
              </p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="hiring-manager-layout">
        <HiringManagerSidebar />

        <div className="hiring-manager-main">
          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">
            <div className="hiring-manager-dashboard-header">
              <p className="hiring-manager-label">
                CANDIDATE DECISIONS
              </p>

              <h1>Candidate Decisions</h1>

              <p>
                Review shortlisted candidates and
                make final hiring decisions.
              </p>
            </div>

            <section className="hm-decision-empty">
              <div className="hm-decision-empty-icon">
                <AlertCircle size={38} />
              </div>

              <h2>Unable to Load Candidates</h2>

              <p>{error}</p>

              <button
                type="button"
                onClick={() =>
                  fetchDecisions(searchTerm)
                }
              >
                Try Again
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* HEADER */}

          <div className="hiring-manager-dashboard-header">
            <p className="hiring-manager-label">
              CANDIDATE DECISIONS
            </p>

            <h1>Candidate Decisions</h1>

            <p>
              Review candidates and make final
              hiring decisions based on interview
              and AI results.
            </p>
          </div>

          {/* ACTION ERROR */}

          {actionError && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#fee2e2",
                color: "#991b1b",
              }}
            >
              {actionError}
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
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Status
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Rejected">
                  Rejected
                </option>

                <option value="Hired">
                  Hired
                </option>
              </select>
            </div>

          </div>

          {/* RESULTS COUNT */}

          <div className="hm-decision-results">
            Showing{" "}
            <strong>
              {filteredCandidates.length}
            </strong>{" "}
            candidate
            {filteredCandidates.length !== 1
              ? "s"
              : ""}
          </div>

          {/* CANDIDATES */}

          {filteredCandidates.length > 0 ? (

            <section className="hm-decision-grid">

              {filteredCandidates.map(
                (candidate) => {

                  const displayStatus =
                    getDisplayStatus(
                      candidate.status
                    );

                  const isActionLoading =
                    actionLoading ===
                    candidate.applicationId;

                  return (
                    <div
                      className="hm-decision-card"
                      key={candidate.applicationId}
                    >

                      {/* HEADER */}

                      <div className="hm-decision-card-header">

                        <div className="hm-decision-candidate">

                          <div className="hm-decision-avatar">
                            <User size={21} />
                          </div>

                          <div>
                            <h3>
                              {candidate.candidateName}
                            </h3>

                            <p>
                              {candidate.email}
                            </p>
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

                        <span>
                          {candidate.jobTitle}
                        </span>
                      </div>

                      {/* EXPERIENCE */}

                      <div className="hm-decision-info-row">
                        <span>
                          Experience
                        </span>

                        <strong>
                          {candidate.experience}
                        </strong>
                      </div>

                      {/* AI SCORE */}

                      <div className="hm-decision-score-section">

                        <div className="hm-decision-score-header">

                          <span>
                            <Sparkles size={15} />
                            AI Match Score
                          </span>

                          <strong>
                            {candidate.aiMatchPercentage !==
                            null
                              ? `${candidate.aiMatchPercentage}%`
                              : "Not Available"}
                          </strong>

                        </div>

                        <div className="hm-decision-score-bar">
                          <div
                            className="hm-decision-score-fill"
                            style={{
                              width:
                                candidate.aiMatchPercentage !==
                                null
                                  ? `${Math.min(
                                      Math.max(
                                        candidate.aiMatchPercentage,
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
                        <span>
                          Interview Score
                        </span>

                        <strong>
                          {candidate.interviewScore !==
                          null
                            ? `${candidate.interviewScore} / 5`
                            : "Not Available"}
                        </strong>
                      </div>

                      {/* APPLICATION STATUS */}

                      <div className="hm-decision-interview-status">
                        <span>
                          Application Status
                        </span>

                        <strong>
                          {displayStatus}
                        </strong>
                      </div>

                      {/* ACTIONS */}

                      <div className="hm-decision-actions">

                        {/* VIEW CANDIDATE */}

                        <button
                          type="button"
                          className="hm-decision-view-button"
                          onClick={() =>
                            navigate(
                              `/hiring-manager/shortlisted-candidates/${candidate.applicationId}`
                            )
                          }
                        >
                          View Candidate
                        </button>

                        {/* APPROVE */}

                        {candidate.status?.toUpperCase() ===
                          "PENDING" && (
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
                        )}

                        {/* REJECT */}

                        {candidate.status?.toUpperCase() ===
                          "PENDING" && (
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
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </section>

          ) : (

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
                    setStatusFilter("All");
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