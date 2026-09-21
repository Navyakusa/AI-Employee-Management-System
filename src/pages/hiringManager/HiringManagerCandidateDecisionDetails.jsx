import { useState } from "react";
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
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerCandidateDecisionDetails() {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  const [finalNotes, setFinalNotes] = useState("");
  const [decision, setDecision] = useState(() => {
  return (
    localStorage.getItem(
      `candidateDecision_${candidateId}`
    ) || "Pending"
  );
});

  // Temporary frontend data.
  // Backend integration will replace this later.
  //
  // Only candidates with:
  // 1. Completed interview
  // 2. Submitted interviewer feedback
  // should reach this page.
  const candidates = [
    {
      id: 3,
      interviewId: 3,

      name: "Sneha Reddy",
      email: "sneha@gmail.com",

      job: "QA Engineer",
      experience: "4 Years",

      matchScore: 83,

      interviewStatus: "Completed",

      interviewer: "Arjun Kumar",

      overallRating: 4,
      technicalRating: 4,
      communicationRating: 4,
      problemSolvingRating: 5,

      recommendation: "Recommended",

      strengths: [
        "Strong API testing knowledge",
        "Good understanding of Selenium automation",
        "Explained testing scenarios clearly",
        "Good problem-solving approach",
      ],

      concerns: [
        "Limited performance testing experience",
        "Could improve advanced automation framework knowledge",
      ],

      feedback:
        "Sneha demonstrated strong knowledge of software testing fundamentals, API testing and automation. She explained her previous QA experience clearly and handled scenario-based questions well.",
    },
  ];

  const candidate =
    candidates.find(
      (item) =>
        item.id === Number(candidateId)
    ) || candidates[0];

  const initials = candidate.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const renderStars = (rating) =>
    Array.from({ length: 5 }).map(
      (_, index) => (
        <Star
          key={index}
          size={17}
          fill={
            index < rating
              ? "currentColor"
              : "none"
          }
        />
      )
    );

  const handleApprove = () => {
  const newDecision = "Approved";

  setDecision(newDecision);

  localStorage.setItem(
    `candidateDecision_${candidate.id}`,
    newDecision
  );

  navigate("/hiring-manager/decisions");
};

const handleReject = () => {
  const newDecision = "Rejected";

  setDecision(newDecision);

  localStorage.setItem(
    `candidateDecision_${candidate.id}`,
    newDecision
  );

  navigate("/hiring-manager/decisions");
};

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
              Review the candidate, AI analysis and
              completed interview feedback before making
              the final hiring decision.
            </p>

          </div>

          <section className="hm-final-decision-card">

            {/* CANDIDATE HEADER */}

            <div className="hm-final-candidate-header">

              <div className="hm-final-candidate">

                <div className="hm-final-avatar">
                  {initials}
                </div>

                <div>
                  <h2>
                    {candidate.name}
                  </h2>

                  <p>
                    {candidate.email}
                  </p>
                </div>

              </div>

              <span
                className={`hm-decision-status ${decision.toLowerCase()}`}
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
                    <span>
                      Applied Position
                    </span>

                    <strong>
                      {candidate.job}
                    </strong>
                  </div>

                </div>

                <div className="hm-final-info-item">

                  <User size={18} />

                  <div>
                    <span>
                      Experience
                    </span>

                    <strong>
                      {candidate.experience}
                    </strong>
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
                    <span>
                      AI Match Score
                    </span>

                    <strong>
                      {candidate.matchScore}%
                    </strong>
                  </div>

                </div>

                <div className="hm-final-ai-bar">

                  <div
                    className="hm-final-ai-progress"
                    style={{
                      width:
                        `${candidate.matchScore}%`,
                    }}
                  />

                </div>

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

                  <span>
                    Interview Status
                  </span>

                  <strong className="hm-final-completed">
                    <CheckCircle2 size={15} />
                    {candidate.interviewStatus}
                  </strong>

                </div>

                <div>

                  <span>
                    Assigned Interviewer
                  </span>

                  <strong>
                    {candidate.interviewer}
                  </strong>

                </div>

                <div>

                  <span>
                    Overall Rating
                  </span>

                  <div className="hm-final-rating">

                    <strong>
                      {candidate.overallRating}/5
                    </strong>

                    <div>
                      {renderStars(
                        candidate.overallRating
                      )}
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* INTERVIEW RATINGS */}

            <div className="hm-final-section">

              <h3>
                Interview Evaluation
              </h3>

              <div className="hm-final-rating-grid">

                <div className="hm-final-rating-card">

                  <Code2 size={21} />

                  <span>
                    Technical Skills
                  </span>

                  <strong>
                    {candidate.technicalRating}/5
                  </strong>

                  <div className="hm-feedback-stars">
                    {renderStars(
                      candidate.technicalRating
                    )}
                  </div>

                </div>

                <div className="hm-final-rating-card">

                  <MessagesSquare size={21} />

                  <span>
                    Communication
                  </span>

                  <strong>
                    {candidate.communicationRating}/5
                  </strong>

                  <div className="hm-feedback-stars">
                    {renderStars(
                      candidate.communicationRating
                    )}
                  </div>

                </div>

                <div className="hm-final-rating-card">

                  <Brain size={21} />

                  <span>
                    Problem Solving
                  </span>

                  <strong>
                    {candidate.problemSolvingRating}/5
                  </strong>

                  <div className="hm-feedback-stars">
                    {renderStars(
                      candidate.problemSolvingRating
                    )}
                  </div>

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

                {candidate.strengths.map(
                  (strength) => (

                    <div key={strength}>

                      <CheckCircle2
                        size={16}
                      />

                      <span>
                        {strength}
                      </span>

                    </div>

                  )
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

                {candidate.concerns.map(
                  (concern) => (

                    <div key={concern}>

                      <AlertCircle
                        size={16}
                      />

                      <span>
                        {concern}
                      </span>

                    </div>

                  )
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
                {candidate.feedback}
              </div>

            </div>

            {/* RECOMMENDATION */}

            <div className="hm-final-section">

              <h3>
                Interviewer Recommendation
              </h3>

              <div className="hm-final-recommendation">

                <CheckCircle2 size={20} />

                <div>
                  <span>
                    Recommendation
                  </span>

                  <strong>
                    {candidate.recommendation}
                  </strong>
                </div>

              </div>

            </div>

            {/* FINAL NOTES */}

            <div className="hm-final-section">

              <h3>
                Hiring Manager Final Notes
              </h3>

              <p className="hm-final-notes-description">
                Add your final observations before
                completing the hiring decision.
              </p>

              <textarea
                value={finalNotes}
                onChange={(e) =>
                  setFinalNotes(
                    e.target.value
                  )
                }
                placeholder="Enter final hiring decision notes..."
                rows="5"
                disabled={
                  decision !== "Pending"
                }
                className="hm-final-notes"
              />

            </div>

            {/* FINAL DECISION */}

            <div className="hm-final-section">

              <h3>
                Final Hiring Decision
              </h3>

              {decision === "Pending" ? (

                <div className="hm-final-decision-actions">

                  <button
                    type="button"
                    className="hm-final-approve-button"
                    onClick={handleApprove}
                  >
                    <CheckCircle2 size={17} />
                    Approve Candidate
                  </button>

                  <button
                    type="button"
                    className="hm-final-reject-button"
                    onClick={handleReject}
                  >
                    <XCircle size={17} />
                    Reject Candidate
                  </button>

                </div>

              ) : (

                <div
                  className={`hm-final-result ${decision.toLowerCase()}`}
                >

                  {decision === "Approved" ? (
                    <CheckCircle2 size={21} />
                  ) : (
                    <XCircle size={21} />
                  )}

                  <div>

                    <span>
                      Final Decision
                    </span>

                    <strong>
                      Candidate {decision}
                    </strong>

                  </div>

                </div>

              )}

            </div>

            {/* BACK */}

            <div className="hm-interview-details-actions">

              <button
                type="button"
                className="hm-resume-secondary-button"
                onClick={() =>
                  navigate(
                    "/hiring-manager/decisions"
                  )
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