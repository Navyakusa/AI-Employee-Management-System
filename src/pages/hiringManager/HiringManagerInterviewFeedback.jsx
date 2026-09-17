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

import "./HiringManagerDashboard.css";

function HiringManagerInterviewFeedback() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  // Temporary frontend data
  // Later this will come from backend Interview Feedback API
  const feedbackList = [
    {
      interviewId: 3,
      candidate: "Sneha Reddy",
      email: "sneha@gmail.com",
      job: "QA Engineer",
      interviewer: "Arjun Kumar",

      overallRating: 4,
      technicalRating: 4,
      communicationRating: 4,
      problemSolvingRating: 5,

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

      comments:
        "Sneha demonstrated strong knowledge of software testing fundamentals, API testing and automation. She explained her previous QA experience clearly and handled scenario-based questions well.",

      recommendation: "Recommended",
    },
  ];

  const feedback =
    feedbackList.find(
      (item) =>
        item.interviewId === Number(interviewId)
    ) || feedbackList[0];

  const initials = feedback.candidate
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map(
      (_, index) => (
        <Star
          key={index}
          size={18}
          fill={
            index < rating
              ? "currentColor"
              : "none"
          }
        />
      )
    );
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
              INTERVIEW FEEDBACK
            </p>

            <h1>Interview Feedback</h1>

            <p>
              Review feedback submitted by the assigned
              interviewer after the completed interview.
            </p>

          </div>

          {/* MAIN CARD */}

          <section className="hm-feedback-page-card">

            {/* CANDIDATE */}

            <div className="hm-feedback-candidate-header">

              <div className="hm-feedback-candidate">

                <div className="hm-feedback-avatar">
                  {initials}
                </div>

                <div>
                  <h2>{feedback.candidate}</h2>

                  <p>{feedback.email}</p>
                </div>

              </div>

              <span className="hm-feedback-completed-badge">
                Interview Completed
              </span>

            </div>

            {/* BASIC INFORMATION */}

            <div className="hm-feedback-section">

              <h3>
                <BriefcaseBusiness size={18} />
                Interview Information
              </h3>

              <div className="hm-feedback-info-grid">

                <div className="hm-feedback-info-item">

                  <BriefcaseBusiness size={18} />

                  <div>
                    <span>Applied Position</span>

                    <strong>
                      {feedback.job}
                    </strong>
                  </div>

                </div>

                <div className="hm-feedback-info-item">

                  <User size={18} />

                  <div>
                    <span>Interviewer</span>

                    <strong>
                      {feedback.interviewer}
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
                  {feedback.overallRating}/5
                </strong>

                <div className="hm-feedback-stars">
                  {renderStars(
                    feedback.overallRating
                  )}
                </div>

              </div>

            </div>

            {/* DETAILED RATINGS */}

            <div className="hm-feedback-section">

              <h3>Evaluation Ratings</h3>

              <div className="hm-feedback-rating-grid">

                <div className="hm-feedback-rating-card">

                  <Code2 size={21} />

                  <span>
                    Technical Skills
                  </span>

                  <strong>
                    {feedback.technicalRating}/5
                  </strong>

                  <div className="hm-feedback-stars">
                    {renderStars(
                      feedback.technicalRating
                    )}
                  </div>

                </div>

                <div className="hm-feedback-rating-card">

                  <MessagesSquare size={21} />

                  <span>
                    Communication
                  </span>

                  <strong>
                    {feedback.communicationRating}/5
                  </strong>

                  <div className="hm-feedback-stars">
                    {renderStars(
                      feedback.communicationRating
                    )}
                  </div>

                </div>

                <div className="hm-feedback-rating-card">

                  <Brain size={21} />

                  <span>
                    Problem Solving
                  </span>

                  <strong>
                    {feedback.problemSolvingRating}/5
                  </strong>

                  <div className="hm-feedback-stars">
                    {renderStars(
                      feedback.problemSolvingRating
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* STRENGTHS */}

            <div className="hm-feedback-section">

              <h3>
                <CheckCircle2 size={18} />
                Candidate Strengths
              </h3>

              <div className="hm-feedback-list">

                {feedback.strengths.map(
                  (strength) => (
                    <div key={strength}>

                      <CheckCircle2 size={16} />

                      <span>{strength}</span>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* CONCERNS */}

            <div className="hm-feedback-section">

              <h3>
                <AlertCircle size={18} />
                Areas of Concern
              </h3>

              <div className="hm-feedback-list">

                {feedback.concerns.map(
                  (concern) => (
                    <div key={concern}>

                      <AlertCircle size={16} />

                      <span>{concern}</span>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* COMMENTS */}

            <div className="hm-feedback-section">

              <h3>
                <MessageSquareText size={18} />
                Interviewer Comments
              </h3>

              <div className="hm-feedback-comments">
                {feedback.comments}
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
                    {feedback.recommendation}
                  </strong>
                </div>

              </div>

            </div>

            {/* ACTION */}

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

export default HiringManagerInterviewFeedback;