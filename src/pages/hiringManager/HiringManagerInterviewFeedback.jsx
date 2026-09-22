import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  User,
  BriefcaseBusiness,
  Star,
  MessageSquareText,
  CheckCircle2,
  AlertCircle,
  Code2,
  MessagesSquare,
  Brain,
  ThumbsUp,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import { getInterviewFeedback } from "./HiringManagerApi";

import "./HiringManagerDashboard.css";

function HiringManagerInterviewFeedback() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getInterviewFeedback(interviewId);

        setFeedback(response);
      } catch (err) {
        console.error("Failed to fetch interview feedback:", err);

        setError(
          err.message || "Failed to load interview feedback."
        );
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchFeedback();
    }
  }, [interviewId]);

  /*
  ======================================================
  HELPERS
  ======================================================
  */

  const getValue = (value, fallback = "Not specified") => {
    return value !== null &&
      value !== undefined &&
      value !== ""
      ? value
      : fallback;
  };

  const getInitials = (name) => {
    if (!name) return "NA";

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;

    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={18}
        fill={
          index < numericRating
            ? "currentColor"
            : "none"
        }
      />
    ));
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
                INTERVIEW FEEDBACK
              </p>

              <h1>Loading Feedback...</h1>

              <p>
                Fetching interview feedback from the backend.
              </p>
            </div>

            <section className="hm-feedback-page-card">
              <div className="hm-feedback-section">
                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                  }}
                >
                  Please wait while the feedback is being
                  loaded.
                </p>
              </div>
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
                INTERVIEW FEEDBACK
              </p>

              <h1>Unable to Load Feedback</h1>

              <p>
                There was a problem retrieving the interview
                feedback.
              </p>
            </div>

            <section className="hm-feedback-page-card">
              <div className="hm-feedback-section">
                <h3>
                  <AlertCircle size={18} />
                  Feedback Error
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                  }}
                >
                  {error}
                </p>
              </div>

              <div className="hm-interview-details-actions">
                <button
                  type="button"
                  className="hm-resume-secondary-button"
                  onClick={() =>
                    navigate(
                      "/hiring-manager/interviews"
                    )
                  }
                >
                  <ArrowLeft size={16} />
                  Back to Interviews
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  /*
  ======================================================
  NO FEEDBACK
  ======================================================
  */

  if (!feedback) {
    return (
      <div className="hiring-manager-layout">
        <HiringManagerSidebar />

        <div className="hiring-manager-main">
          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">
            <div className="hiring-manager-dashboard-header">
              <p className="hiring-manager-label">
                INTERVIEW FEEDBACK
              </p>

              <h1>Feedback Not Found</h1>

              <p>
                Feedback is not available for this interview
                yet.
              </p>
            </div>

            <section className="hm-feedback-page-card">
              <div className="hm-feedback-section">
                <h3>
                  <AlertCircle size={18} />
                  No Feedback Available
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                  }}
                >
                  Interview feedback has not been submitted
                  for this interview, or the requested
                  interview does not exist.
                </p>
              </div>

              <div className="hm-interview-details-actions">
                <button
                  type="button"
                  className="hm-resume-secondary-button"
                  onClick={() =>
                    navigate(
                      "/hiring-manager/interviews"
                    )
                  }
                >
                  <ArrowLeft size={16} />
                  Back to Interviews
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  /*
  ======================================================
  BACKEND FIELD MAPPING
  ======================================================
  */

  const candidateName =
    feedback.candidateName ||
    feedback.candidate ||
    feedback.userName ||
    "Unknown Candidate";

  const candidateEmail =
    feedback.candidateEmail ||
    feedback.email ||
    "Not specified";

  const job =
    feedback.position ||
    feedback.jobTitle ||
    feedback.job ||
    "Not specified";

  const interviewer =
    feedback.interviewerName ||
    feedback.interviewer ||
    "Not specified";

  const overallRating =
    feedback.overallRating ??
    feedback.overallScore ??
    feedback.rating ??
    0;

  const technicalRating =
    feedback.technicalRating ??
    feedback.technicalScore ??
    0;

  const communicationRating =
    feedback.communicationRating ??
    feedback.communicationScore ??
    0;

  const problemSolvingRating =
    feedback.problemSolvingRating ??
    feedback.problemSolvingScore ??
    0;

  const strengths = Array.isArray(feedback.strengths)
    ? feedback.strengths
    : feedback.strengths
      ? [feedback.strengths]
      : [];

  const concerns = Array.isArray(feedback.concerns)
    ? feedback.concerns
    : feedback.concerns
      ? [feedback.concerns]
      : [];

  const comments =
    feedback.comments ||
    feedback.comment ||
    feedback.feedback ||
    "No comments provided.";

  const recommendation =
    feedback.recommendation ||
    feedback.recommendationStatus ||
    "Not specified";

  const initials = getInitials(candidateName);

  /*
  ======================================================
  RENDER
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
              INTERVIEW FEEDBACK
            </p>

            <h1>
              Interview Feedback
            </h1>

            <p>
              Review feedback submitted by the assigned
              interviewer after the completed interview.
            </p>

          </div>


          {/* MAIN FEEDBACK CARD */}

          <section className="hm-feedback-page-card">

            {/* CANDIDATE HEADER */}

            <div className="hm-feedback-candidate-header">

              <div className="hm-feedback-candidate">

                <div className="hm-feedback-avatar">
                  {initials}
                </div>

                <div>

                  <h2>
                    {candidateName}
                  </h2>

                  <p>
                    {candidateEmail}
                  </p>

                </div>

              </div>

              <span className="hm-feedback-completed-badge">
                Interview Completed
              </span>

            </div>


            {/* INTERVIEW INFORMATION */}

            <div className="hm-feedback-section">

              <h3>
                <BriefcaseBusiness size={18} />
                Interview Information
              </h3>

              <div className="hm-feedback-info-grid">

                {/* POSITION */}

                <div className="hm-feedback-info-item">

                  <BriefcaseBusiness size={18} />

                  <div>

                    <span>
                      Applied Position
                    </span>

                    <strong>
                      {job}
                    </strong>

                  </div>

                </div>


                {/* INTERVIEWER */}

                <div className="hm-feedback-info-item">

                  <User size={18} />

                  <div>

                    <span>
                      Interviewer
                    </span>

                    <strong>
                      {interviewer}
                    </strong>

                  </div>

                </div>

              </div>

            </div>


            {/* OVERALL RATING */}

            <div className="hm-feedback-section">

              <h3>
                <Star size={18} />
                Overall Interview Rating
              </h3>

              <div className="hm-feedback-overall-rating">

                <strong>
                  {getValue(overallRating, "0")}/5
                </strong>

                <div className="hm-feedback-stars">
                  {renderStars(overallRating)}
                </div>

              </div>

            </div>


            {/* DETAILED RATINGS */}

            <div className="hm-feedback-section">

              <h3>
                Evaluation Ratings
              </h3>

              <div className="hm-feedback-rating-grid">

                {/* TECHNICAL */}

                <div className="hm-feedback-rating-card">

                  <Code2 size={21} />

                  <span>
                    Technical Skills
                  </span>

                  <strong>
                    {getValue(technicalRating, "0")}/5
                  </strong>

                  <div className="hm-feedback-stars">
                    {renderStars(technicalRating)}
                  </div>

                </div>


                {/* COMMUNICATION */}

                <div className="hm-feedback-rating-card">

                  <MessagesSquare size={21} />

                  <span>
                    Communication
                  </span>

                  <strong>
                    {getValue(
                      communicationRating,
                      "0"
                    )}/5
                  </strong>

                  <div className="hm-feedback-stars">
                    {renderStars(
                      communicationRating
                    )}
                  </div>

                </div>


                {/* PROBLEM SOLVING */}

                <div className="hm-feedback-rating-card">

                  <Brain size={21} />

                  <span>
                    Problem Solving
                  </span>

                  <strong>
                    {getValue(
                      problemSolvingRating,
                      "0"
                    )}/5
                  </strong>

                  <div className="hm-feedback-stars">
                    {renderStars(
                      problemSolvingRating
                    )}
                  </div>

                </div>

              </div>

            </div>


            {/* CANDIDATE STRENGTHS */}

            <div className="hm-feedback-section">

              <h3>
                <CheckCircle2 size={18} />
                Candidate Strengths
              </h3>

              <div className="hm-feedback-list">

                {strengths.length > 0 ? (
                  strengths.map(
                    (strength, index) => (
                      <div
                        key={`${strength}-${index}`}
                      >
                        <CheckCircle2 size={16} />

                        <span>
                          {strength}
                        </span>
                      </div>
                    )
                  )
                ) : (
                  <div>
                    <AlertCircle size={16} />

                    <span>
                      No strengths provided.
                    </span>
                  </div>
                )}

              </div>

            </div>


            {/* AREAS OF CONCERN */}

            <div className="hm-feedback-section">

              <h3>
                <AlertCircle size={18} />
                Areas of Concern
              </h3>

              <div className="hm-feedback-list">

                {concerns.length > 0 ? (
                  concerns.map(
                    (concern, index) => (
                      <div
                        key={`${concern}-${index}`}
                      >
                        <AlertCircle size={16} />

                        <span>
                          {concern}
                        </span>
                      </div>
                    )
                  )
                ) : (
                  <div>
                    <CheckCircle2 size={16} />

                    <span>
                      No concerns provided.
                    </span>
                  </div>
                )}

              </div>

            </div>


            {/* INTERVIEWER COMMENTS */}

            <div className="hm-feedback-section">

              <h3>
                <MessageSquareText size={18} />
                Interviewer Comments
              </h3>

              <div className="hm-feedback-comments">
                {comments}
              </div>

            </div>


            {/* RECOMMENDATION */}

            <div className="hm-feedback-section">

              <h3>
                <ThumbsUp size={18} />
                Interviewer Recommendation
              </h3>

              <div className="hm-feedback-recommendation">

                <CheckCircle2 size={20} />

                <div>

                  <span>
                    Recommendation
                  </span>

                  <strong>
                    {recommendation}
                  </strong>

                </div>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="hm-interview-details-actions">

              <button
                type="button"
                className="hm-resume-secondary-button"
                onClick={() =>
                  navigate(
                    `/hiring-manager/interviews/${interviewId}`
                  )
                }
              >
                <ArrowLeft size={16} />
                Back to Interview
              </button>


              <button
                type="button"
                className="hm-resume-primary-button"
                onClick={() =>
                  navigate(
                    "/hiring-manager/decisions"
                  )
                }
              >
                <ThumbsUp size={16} />
                Go to Candidate Decisions
              </button>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default HiringManagerInterviewFeedback;