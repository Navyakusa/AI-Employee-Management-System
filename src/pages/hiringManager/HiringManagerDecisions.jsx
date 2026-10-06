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

import {
  getCandidateDecisions,
  approveCandidate,
  rejectCandidate,
} from "./HiringManagerApi";

import "./HiringManagerDecisions.css";
import "./HiringManagerLayout.css";


function HiringManagerDecisions() {
  const navigate = useNavigate();

  const [candidates, setCandidates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [actionLoading, setActionLoading] =
    useState(null);

  const [actionError, setActionError] =
    useState("");


  /*
  ======================================================
  NORMALIZE STATUS
  ======================================================
  */

  const normalizeStatus = (status) => {
    return String(status || "PENDING")
      .trim()
      .toUpperCase();
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

      const response =
        await getCandidateDecisions();

      console.log(
        "Candidate Decisions API:",
        response
      );

      const apiCandidates =
        Array.isArray(response?.data)
          ? response.data
          : [];

      const formattedCandidates =
        apiCandidates.map((candidate) => ({
          applicationId:
            candidate.applicationId,

          candidateId:
            candidate.candidateId,

          jobId:
            candidate.jobId,

          candidateName:
            candidate.candidateName ||
            "Unknown Candidate",

          email:
            candidate.candidateEmail ||
            candidate.email ||
            "Not specified",

          jobTitle:
            candidate.jobTitle ||
            "Not specified",

          experience:
            candidate.experience ||
            "Not specified",

          interviewScore:
            candidate.interviewScore ??
            null,

          aiMatchPercentage:
            candidate.aiMatchPercentage ??
            null,

          status:
            candidate.status ||
            "PENDING",

          department:
            candidate.department ||
            null,

          location:
            candidate.location ||
            null,

          skills:
            candidate.skills ||
            candidate.requiredSkills ||
            null,

          appliedAt:
            candidate.appliedAt ||
            candidate.applicationDate ||
            null,
        }));

      setCandidates(
        formattedCandidates
      );

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


  /*
  ======================================================
  APPROVE CANDIDATE
  ======================================================
  */

  const handleApprove = async (
    candidate
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to approve ${candidate.candidateName}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        candidate.applicationId
      );

      setActionError("");

      const response =
        await approveCandidate(
          candidate.applicationId
        );

      console.log(
        "Approve response:",
        response
      );

      if (response?.data) {

        setCandidates(
          (previousCandidates) =>
            previousCandidates.map(
              (item) =>
                item.applicationId ===
                candidate.applicationId
                  ? {
                      ...item,

                      status:
                        response.data.status ||
                        "SELECTED",

                      interviewScore:
                        response.data
                          .interviewScore ??
                        item.interviewScore,

                      aiMatchPercentage:
                        response.data
                          .aiMatchPercentage ??
                        item.aiMatchPercentage,
                    }
                  : item
            )
        );

      } else {
        await fetchDecisions();
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


  /*
  ======================================================
  REJECT CANDIDATE
  ======================================================
  */

  const handleReject = async (
    candidate
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to reject ${candidate.candidateName}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        candidate.applicationId
      );

      setActionError("");

      const response =
        await rejectCandidate(
          candidate.applicationId
        );

      console.log(
        "Reject response:",
        response
      );

      if (response?.data) {

        setCandidates(
          (previousCandidates) =>
            previousCandidates.map(
              (item) =>
                item.applicationId ===
                candidate.applicationId
                  ? {
                      ...item,

                      status:
                        response.data.status ||
                        "REJECTED",

                      interviewScore:
                        response.data
                          .interviewScore ??
                        item.interviewScore,

                      aiMatchPercentage:
                        response.data
                          .aiMatchPercentage ??
                        item.aiMatchPercentage,
                    }
                  : item
            )
        );

      } else {
        await fetchDecisions();
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


  /*
  ======================================================
  SEARCH + FILTER
  ======================================================
  */

  const filteredCandidates =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return candidates.filter(
        (candidate) => {

          const candidateName =
            String(
              candidate.candidateName ||
              ""
            ).toLowerCase();

          const email =
            String(
              candidate.email ||
              ""
            ).toLowerCase();

          const jobTitle =
            String(
              candidate.jobTitle ||
              ""
            ).toLowerCase();

          const matchesSearch =
            !search ||
            candidateName.includes(
              search
            ) ||
            email.includes(search) ||
            jobTitle.includes(search);

          const status =
            normalizeStatus(
              candidate.status
            );

          let matchesStatus = true;

          if (
            statusFilter !== "ALL"
          ) {

            if (
              statusFilter ===
              "APPROVED"
            ) {

              matchesStatus =
                status ===
                  "APPROVED" ||
                status ===
                  "SELECTED";

            } else {

              matchesStatus =
                status ===
                statusFilter;
            }
          }

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );

    }, [
      candidates,
      searchTerm,
      statusFilter,
    ]);


  /*
  ======================================================
  COUNTS
  ======================================================
  */

  const pendingCount =
    candidates.filter(
      (candidate) =>
        normalizeStatus(
          candidate.status
        ) === "PENDING"
    ).length;


  const approvedCount =
    candidates.filter(
      (candidate) =>
        [
          "APPROVED",
          "SELECTED",
          "HIRED",
        ].includes(
          normalizeStatus(
            candidate.status
          )
        )
    ).length;


  const rejectedCount =
    candidates.filter(
      (candidate) =>
        normalizeStatus(
          candidate.status
        ) === "REJECTED"
    ).length;


  /*
  ======================================================
  DISPLAY STATUS
  ======================================================
  */

  const getDisplayStatus = (
    status
  ) => {

    switch (
      normalizeStatus(status)
    ) {

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
        return status ||
          "Pending";
    }
  };


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

            <div className="hiring-manager-dashboard-header">

              <p className="hiring-manager-label">
                CANDIDATE DECISIONS
              </p>

              <h1>
                Candidate Decisions
              </h1>

              <p>
                Review shortlisted candidates
                and make final hiring decisions.
              </p>

            </div>


            <section className="hm-decision-empty">

              <div className="hm-decision-empty-icon">

                <Clock
                  size={38}
                />

              </div>

              <h2>
                Loading Candidates
              </h2>

              <p>
                Fetching candidate
                decisions from the backend.
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

            <div className="hiring-manager-dashboard-header">

              <p className="hiring-manager-label">
                CANDIDATE DECISIONS
              </p>

              <h1>
                Candidate Decisions
              </h1>

              <p>
                Review shortlisted candidates
                and make final hiring decisions.
              </p>

            </div>


            <section className="hm-decision-empty">

              <div className="hm-decision-empty-icon">

                <AlertCircle
                  size={38}
                />

              </div>

              <h2>
                Unable to Load Candidates
              </h2>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={
                  fetchDecisions
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


  /*
  ======================================================
  MAIN
  ======================================================
  */

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

            <h1>
              Candidate Decisions
            </h1>

            <p>
              Review candidates and make
              final hiring decisions based
              on interview and AI results.
            </p>

          </div>


          {/* ACTION ERROR */}

          {actionError && (
            <div className="hm-decision-empty">

              <div className="hm-decision-empty-icon">

                <AlertCircle
                  size={30}
                />

              </div>

              <h2>
                Action Failed
              </h2>

              <p>
                {actionError}
              </p>

            </div>
          )}


          {/* SUMMARY */}

          <div className="hm-decision-summary">

            <div className="hm-decision-summary-card">

              <div className="hm-decision-summary-icon pending">

                <Clock
                  size={21}
                />

              </div>

              <div>

                <span>
                  Pending Decisions
                </span>

                <strong>
                  {pendingCount}
                </strong>

              </div>

            </div>


            <div className="hm-decision-summary-card">

              <div className="hm-decision-summary-icon approved">

                <CheckCircle
                  size={21}
                />

              </div>

              <div>

                <span>
                  Approved
                </span>

                <strong>
                  {approvedCount}
                </strong>

              </div>

            </div>


            <div className="hm-decision-summary-card">

              <div className="hm-decision-summary-icon rejected">

                <XCircle
                  size={21}
                />

              </div>

              <div>

                <span>
                  Rejected
                </span>

                <strong>
                  {rejectedCount}
                </strong>

              </div>

            </div>

          </div>


          {/* SEARCH + FILTER */}

          <div className="hm-decision-toolbar">

            <div className="hm-decision-search">

              <Search
                size={19}
              />

              <input
                type="text"
                placeholder="Search candidate, email or job..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

            </div>


            <div className="hm-decision-filter">

              <Filter
                size={18}
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >

                <option value="ALL">
                  All Status
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

                <option value="HIRED">
                  Hired
                </option>

              </select>

            </div>

          </div>


          {/* RESULTS */}

          <div className="hm-decision-results">

            Showing{" "}

            <strong>
              {filteredCandidates.length}
            </strong>{" "}

            candidate
            {filteredCandidates.length !==
            1
              ? "s"
              : ""}

          </div>


          {/* CANDIDATE CARDS */}

          {filteredCandidates.length >
          0 ? (

            <section className="hm-decision-grid">

              {filteredCandidates.map(
                (candidate) => {

                  const displayStatus =
                    getDisplayStatus(
                      candidate.status
                    );

                  const normalized =
                    normalizeStatus(
                      candidate.status
                    );

                  const isPending =
                    normalized ===
                    "PENDING";

                  const isActionLoading =
                    actionLoading ===
                    candidate.applicationId;


                  return (

                    <div
                      className="hm-decision-card"
                      key={
                        candidate.applicationId
                      }
                    >

                      {/* HEADER */}

                      <div className="hm-decision-card-header">

                        <div className="hm-decision-candidate">

                          <div className="hm-decision-avatar">

                            <User
                              size={21}
                            />

                          </div>

                          <div>

                            <h3>
                              {
                                candidate.candidateName
                              }
                            </h3>

                            <p>
                              {
                                candidate.email
                              }
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

                        <BriefcaseBusiness
                          size={17}
                        />

                        <span>
                          {
                            candidate.jobTitle
                          }
                        </span>

                      </div>


                      {/* EXPERIENCE */}

                      <div className="hm-decision-info-row">

                        <span>
                          Experience
                        </span>

                        <strong>
                          {
                            candidate.experience
                          }
                        </strong>

                      </div>


                      {/* AI SCORE */}

                      <div className="hm-decision-score-section">

                        <div className="hm-decision-score-header">

                          <span>

                            <Sparkles
                              size={15}
                            />

                            AI Match Score

                          </span>


                          <strong>

                            {
                              candidate.aiMatchPercentage !==
                                null &&
                              candidate.aiMatchPercentage !==
                                undefined
                                ? `${candidate.aiMatchPercentage}%`
                                : "Not Available"
                            }

                          </strong>

                        </div>


                        <div className="hm-decision-score-bar">

                          <div
                            className="hm-decision-score-fill"
                            style={{
                              width:
                                candidate.aiMatchPercentage !==
                                  null &&
                                candidate.aiMatchPercentage !==
                                  undefined
                                  ? `${Math.min(
                                      Math.max(
                                        Number(
                                          candidate.aiMatchPercentage
                                        ),
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

                          {
                            candidate.interviewScore !==
                              null &&
                            candidate.interviewScore !==
                              undefined
                              ? `${candidate.interviewScore} / 5`
                              : "Not Available"
                          }

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


                        {/* VIEW */}

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

                        {isPending && (

                          <button
                            type="button"
                            className="hm-decision-approve-button"
                            disabled={
                              isActionLoading
                            }
                            onClick={() =>
                              handleApprove(
                                candidate
                              )
                            }
                          >

                            <CheckCircle
                              size={16}
                            />

                            {isActionLoading
                              ? "Processing..."
                              : "Approve"}

                          </button>

                        )}


                        {/* REJECT */}

                        {isPending && (

                          <button
                            type="button"
                            className="hm-decision-reject-button"
                            disabled={
                              isActionLoading
                            }
                            onClick={() =>
                              handleReject(
                                candidate
                              )
                            }
                          >

                            <XCircle
                              size={16}
                            />

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

            /* EMPTY */

            <div className="hm-decision-empty">

              <div className="hm-decision-empty-icon">

                <User
                  size={38}
                />

              </div>

              <h2>
                No Candidates Found
              </h2>

              <p>

                {candidates.length ===
                0
                  ? "There are currently no candidate decisions available."
                  : "No candidates match your current search or status filter."}

              </p>


              {candidates.length >
                0 && (

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter(
                      "ALL"
                    );
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