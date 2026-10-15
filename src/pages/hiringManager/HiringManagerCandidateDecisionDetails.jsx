import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  User,
  BriefcaseBusiness,
  Star,
  CheckCircle2,
  XCircle,
  MessageSquareText,
  Brain,
  Code2,
  MessagesSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";
import apiClient from "../../services/apiClient";

import "./HiringManagerDashboard.css";

function HiringManagerCandidateDecisionDetails() {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  // =========================================================
  // STATE
  // =========================================================

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState("PENDING");
  const [finalNotes, setFinalNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // =========================================================
  // FETCH CANDIDATE DECISION
  // =========================================================

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      setError("");

      if (!candidateId) {
        setCandidate(null);
        setError("Candidate ID is missing.");
        return;
      }

      console.log(
        "Loading candidate decision for candidateId:",
        candidateId
      );

      // apiClient already includes /api in its base URL.
      const response = await apiClient.get(
        "/candidate-decisions"
      );

      console.log(
        "Candidate decisions API response:",
        response.data
      );

      const responseData = response.data;

      // Support common backend response structures.
      const candidates = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
          ? responseData.data
          : Array.isArray(responseData?.content)
            ? responseData.content
            : [];

      /*
       * The route parameter may be a candidate ID or
       * an application ID, depending on the configured route.
       */
      const foundCandidate = candidates.find(
        (item) =>
          String(item?.candidateId) === String(candidateId) ||
          String(item?.applicationId) === String(candidateId)
      );

      if (!foundCandidate) {
        setCandidate(null);
        setError("Candidate decision record was not found.");
        return;
      }

      console.log("Selected candidate:", foundCandidate);

      setCandidate(foundCandidate);

      setDecision(
        foundCandidate.status ||
          foundCandidate.decision ||
          "PENDING"
      );
    } catch (err) {
      console.error(
        "Failed to load candidate decision:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session may have expired. Please sign in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view this candidate. Please check Hiring Manager permissions."
        );
      } else if (err.response?.status === 404) {
        setError(
          "The candidate decisions endpoint was not found. Please verify the backend API mapping."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load candidate decision."
        );
      }

      setCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  // =========================================================
  // APPROVE CANDIDATE
  // =========================================================

  const handleApprove = async () => {
    if (!candidate?.applicationId) {
      setActionError("Application ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to approve ${
        candidate.candidateName || "this candidate"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      console.log(
        "Approving application:",
        candidate.applicationId
      );

      const response = await apiClient.patch(
        `/candidate-decisions/${candidate.applicationId}/approve`
      );

      console.log("Approve response:", response.data);

      const updatedData =
        response.data?.data ?? response.data ?? {};

      setDecision(
        updatedData.status ||
          updatedData.decision ||
          "APPROVED"
      );

      setCandidate((previous) => ({
        ...previous,
        ...updatedData,
        status: updatedData.status || "APPROVED",
      }));

      navigate("/hiring-manager/decisions");
    } catch (err) {
      console.error("Failed to approve candidate:", err);

      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Failed to approve candidate."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // REJECT CANDIDATE
  // =========================================================

  const handleReject = async () => {
    if (!candidate?.applicationId) {
      setActionError("Application ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reject ${
        candidate.candidateName || "this candidate"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      console.log(
        "Rejecting application:",
        candidate.applicationId
      );

      const response = await apiClient.patch(
        `/candidate-decisions/${candidate.applicationId}/reject`
      );

      console.log("Reject response:", response.data);

      const updatedData =
        response.data?.data ?? response.data ?? {};

      setDecision(
        updatedData.status ||
          updatedData.decision ||
          "REJECTED"
      );

      setCandidate((previous) => ({
        ...previous,
        ...updatedData,
        status: updatedData.status || "REJECTED",
      }));

      navigate("/hiring-manager/decisions");
    } catch (err) {
      console.error("Failed to reject candidate:", err);

      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Failed to reject candidate."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // STAR RATING
  // =========================================================

  const renderStars = (rating) => {
    const numericRating = Math.max(
      0,
      Math.min(5, Number(rating) || 0)
    );

    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={17}
        fill={
          index < numericRating
            ? "currentColor"
            : "none"
        }
      />
    ));
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="hiring-manager-layout">
        <HiringManagerSidebar />

        <div className="hiring-manager-main">
          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">
            <div
              style={{
                minHeight: "500px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              <Loader2
                size={40}
                className="hm-loading-icon"
              />

              <p>Loading candidate details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR / CANDIDATE NOT FOUND
  // =========================================================

  if (error || !candidate) {
    return (
      <div className="hiring-manager-layout">
        <HiringManagerSidebar />

        <div className="hiring-manager-main">
          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">
            <div className="hiring-manager-dashboard-header">
              <p className="hiring-manager-label">
                FINAL REVIEW
              </p>

              <h1>Candidate Not Found</h1>

              <p>
                {error ||
                  "The requested candidate decision record could not be found."}
              </p>
            </div>

            <section className="hm-final-decision-card">
              <div className="hm-final-section">
                <h3>
                  <AlertCircle size={18} />
                  Candidate Unavailable
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                  }}
                >
                  No candidate decision record was returned
                  by the backend for this candidate.
                </p>
              </div>

              <div className="hm-interview-details-actions">
                <button
                  type="button"
                  className="hm-resume-secondary-button"
                  onClick={() =>
                    navigate("/hiring-manager/decisions")
                  }
                >
                  <ArrowLeft size={16} />
                  Back to Candidate Decisions
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // SAFE VALUES
  // =========================================================

  const candidateName =
    candidate.candidateName ||
    candidate.name ||
    "Unknown Candidate";

  const candidateEmail =
    candidate.candidateEmail ||
    candidate.email ||
    "Email not available";

  const jobTitle =
    candidate.jobTitle ||
    candidate.job ||
    "Position not available";

  const experience =
    candidate.experience || "Not specified";

  const matchScore =
    candidate.aiMatchPercentage ??
    candidate.matchScore ??
    candidate.aiMatchScore ??
    null;

  const interviewScore =
    candidate.interviewScore ??
    candidate.overallRating ??
    null;

  const technicalRating =
    candidate.technicalRating ??
    candidate.technicalScore ??
    null;

  const communicationRating =
    candidate.communicationRating ??
    candidate.communicationScore ??
    null;

  const problemSolvingRating =
    candidate.problemSolvingRating ??
    candidate.problemSolvingScore ??
    null;

  const interviewStatus =
    candidate.interviewStatus || "Completed";

  const interviewer =
    candidate.interviewerName ||
    candidate.interviewer ||
    "Not specified";

  const recommendation =
    candidate.interviewRecommendation ||
    candidate.recommendation ||
    "Not available";

  const feedback =
    candidate.interviewFeedback ||
    candidate.feedback ||
    "No interviewer feedback available.";

  const strengths = Array.isArray(candidate.strengths)
    ? candidate.strengths
    : [];

  const concerns = Array.isArray(candidate.concerns)
    ? candidate.concerns
    : [];

  const initials = candidateName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">
          {/* HEADER */}
          <div className="hiring-manager-dashboard-header">
            <p className="hiring-manager-label">
              FINAL REVIEW
            </p>

            <h1>Candidate Decision</h1>

            <p>
              Review the candidate, AI analysis and completed
              interview feedback before making the final hiring
              decision.
            </p>
          </div>

          {/* MAIN CARD */}
          <section className="hm-final-decision-card">
            {/* CANDIDATE HEADER */}
            <div className="hm-final-candidate-header">
              <div className="hm-final-candidate">
                <div className="hm-final-avatar">
                  {initials}
                </div>

                <div>
                  <h2>{candidateName}</h2>
                  <p>{candidateEmail}</p>
                </div>
              </div>

              <span
                className={`hm-decision-status ${String(
                  decision
                ).toLowerCase()}`}
              >
                {decision}
              </span>
            </div>

            {/* CANDIDATE INFORMATION */}
            <div className="hm-final-section">
              <h3>
                <User size={18} />
                Candidate Information
              </h3>

              <div className="hm-final-info-grid">
                <div className="hm-final-info-item">
                  <BriefcaseBusiness size={18} />

                  <div>
                    <span>Applied Position</span>
                    <strong>{jobTitle}</strong>
                  </div>
                </div>

                <div className="hm-final-info-item">
                  <User size={18} />

                  <div>
                    <span>Experience</span>
                    <strong>{experience}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* APPLICATION INFORMATION */}
            <div className="hm-final-section">
              <h3>Application Information</h3>

              <div className="hm-final-info-grid">
                <div className="hm-final-info-item">
                  <div>
                    <span>Application ID</span>
                    <strong>
                      {candidate.applicationId ?? "N/A"}
                    </strong>
                  </div>
                </div>

                <div className="hm-final-info-item">
                  <div>
                    <span>Candidate ID</span>
                    <strong>
                      {candidate.candidateId ?? "N/A"}
                    </strong>
                  </div>
                </div>

                <div className="hm-final-info-item">
                  <div>
                    <span>Job ID</span>
                    <strong>{candidate.jobId ?? "N/A"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* AI ANALYSIS */}
            <div className="hm-final-section">
              <h3>
                <Brain size={18} />
                AI Candidate Analysis
              </h3>

              <div className="hm-final-ai-card">
                <div className="hm-final-ai-top">
                  <div>
                    <span>AI Match Score</span>

                    <strong>
                      {matchScore !== null &&
                      matchScore !== ""
                        ? `${matchScore}%`
                        : "Not available"}
                    </strong>
                  </div>
                </div>

                {matchScore !== null &&
                  matchScore !== "" && (
                    <div className="hm-final-ai-bar">
                      <div
                        className="hm-final-ai-progress"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              Number(matchScore) || 0
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  )}
              </div>
            </div>

            {/* INTERVIEW RESULT */}
            <div className="hm-final-section">
              <h3>
                <MessageSquareText size={18} />
                Interview Result
              </h3>

              <div className="hm-final-interview-header">
                <div>
                  <span>Interview Status</span>

                  <strong className="hm-final-completed">
                    <CheckCircle2 size={15} />
                    {interviewStatus}
                  </strong>
                </div>

                <div>
                  <span>Assigned Interviewer</span>
                  <strong>{interviewer}</strong>
                </div>

                <div>
                  <span>Overall Rating</span>

                  <div className="hm-final-rating">
                    <strong>
                      {interviewScore !== null
                        ? `${interviewScore}/5`
                        : "N/A"}
                    </strong>

                    {interviewScore !== null && (
                      <div>
                        {renderStars(interviewScore)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* INTERVIEW RATINGS */}
            <div className="hm-final-section">
              <h3>Interview Evaluation</h3>

              <div className="hm-final-rating-grid">
                <div className="hm-final-rating-card">
                  <Code2 size={21} />
                  <span>Technical Skills</span>

                  <strong>
                    {technicalRating !== null
                      ? `${technicalRating}/5`
                      : "N/A"}
                  </strong>

                  {technicalRating !== null && (
                    <div className="hm-feedback-stars">
                      {renderStars(technicalRating)}
                    </div>
                  )}
                </div>

                <div className="hm-final-rating-card">
                  <MessagesSquare size={21} />
                  <span>Communication</span>

                  <strong>
                    {communicationRating !== null
                      ? `${communicationRating}/5`
                      : "N/A"}
                  </strong>

                  {communicationRating !== null && (
                    <div className="hm-feedback-stars">
                      {renderStars(communicationRating)}
                    </div>
                  )}
                </div>

                <div className="hm-final-rating-card">
                  <Brain size={21} />
                  <span>Problem Solving</span>

                  <strong>
                    {problemSolvingRating !== null
                      ? `${problemSolvingRating}/5`
                      : "N/A"}
                  </strong>

                  {problemSolvingRating !== null && (
                    <div className="hm-feedback-stars">
                      {renderStars(problemSolvingRating)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STRENGTHS */}
            <div className="hm-final-section">
              <h3>
                <CheckCircle2 size={18} />
                Candidate Strengths
              </h3>

              <div className="hm-final-list">
                {strengths.length > 0 ? (
                  strengths.map((strength, index) => (
                    <div key={index}>
                      <CheckCircle2 size={16} />
                      <span>{strength}</span>
                    </div>
                  ))
                ) : (
                  <div>
                    <span>
                      No strengths data available from backend.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CONCERNS */}
            <div className="hm-final-section">
              <h3>
                <AlertCircle size={18} />
                Areas of Concern
              </h3>

              <div className="hm-final-list">
                {concerns.length > 0 ? (
                  concerns.map((concern, index) => (
                    <div key={index}>
                      <AlertCircle size={16} />
                      <span>{concern}</span>
                    </div>
                  ))
                ) : (
                  <div>
                    <span>
                      No concerns data available from backend.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* INTERVIEWER FEEDBACK */}
            <div className="hm-final-section">
              <h3>
                <MessageSquareText size={18} />
                Interviewer Feedback
              </h3>

              <div className="hm-final-feedback-box">
                {feedback}
              </div>
            </div>

            {/* RECOMMENDATION */}
            <div className="hm-final-section">
              <h3>Interviewer Recommendation</h3>

              <div className="hm-final-recommendation">
                <CheckCircle2 size={20} />

                <div>
                  <span>Recommendation</span>
                  <strong>{recommendation}</strong>
                </div>
              </div>
            </div>

            {/* FINAL NOTES */}
            <div className="hm-final-section">
              <h3>Hiring Manager Final Notes</h3>

              <p className="hm-final-notes-description">
                Add your final observations before completing
                the hiring decision.
              </p>

              <textarea
                value={finalNotes}
                onChange={(event) =>
                  setFinalNotes(event.target.value)
                }
                placeholder="Enter final hiring decision notes..."
                rows="5"
                disabled={decision !== "PENDING"}
                className="hm-final-notes"
              />
            </div>

            {/* ACTION ERROR */}
            {actionError && (
              <div
                role="alert"
                style={{
                  padding: "12px 16px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  background: "#fee2e2",
                  color: "#b91c1c",
                }}
              >
                {actionError}
              </div>
            )}

            {/* FINAL DECISION */}
            <div className="hm-final-section">
              <h3>Final Hiring Decision</h3>

              {decision === "PENDING" ? (
                <div className="hm-final-decision-actions">
                  <button
                    type="button"
                    className="hm-final-approve-button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2
                        size={17}
                        className="hm-loading-icon"
                      />
                    ) : (
                      <CheckCircle2 size={17} />
                    )}

                    Approve Candidate
                  </button>

                  <button
                    type="button"
                    className="hm-final-reject-button"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2
                        size={17}
                        className="hm-loading-icon"
                      />
                    ) : (
                      <XCircle size={17} />
                    )}

                    Reject Candidate
                  </button>
                </div>
              ) : (
                <div
                  className={`hm-final-result ${String(
                    decision
                  ).toLowerCase()}`}
                >
                  {["APPROVED", "SELECTED"].includes(
                    String(decision).toUpperCase()
                  ) ? (
                    <CheckCircle2 size={21} />
                  ) : (
                    <XCircle size={21} />
                  )}

                  <div>
                    <span>Final Decision</span>
                    <strong>Candidate {decision}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* BACK BUTTON */}
            <div className="hm-interview-details-actions">
              <button
                type="button"
                className="hm-resume-secondary-button"
                onClick={() =>
                  navigate("/hiring-manager/decisions")
                }
              >
                <ArrowLeft size={16} />
                Back to Candidate Decisions
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default HiringManagerCandidateDecisionDetails;
