import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ClipboardCheck,
  BriefcaseBusiness,
  CalendarDays,
  Star,
  CheckCircle2,
  MessageSquareText,
  Award,
  TrendingUp,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import "./InterviewerDashboard.css";

function InterviewerEvaluationView() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  // Temporary frontend data
  // Backend integration will replace this later.
  const evaluations = [
    {
      interviewId: 5,
      candidateId: 5,
      candidate: "Meghana Rao",
      email: "meghana@gmail.com",
      job: "Full Stack Developer",
      interviewDate: "14 Sep 2026",
      interviewType: "Technical",

      technicalRating: 5,
      communicationRating: 4,
      problemSolvingRating: 4,
      overallRating: 4.5,

      strengths:
        "Strong Java and Spring Boot fundamentals. Good understanding of React integration and REST API development.",

      improvementAreas:
        "Can improve advanced system design knowledge and cloud deployment experience.",

      feedback:
        "The candidate demonstrated strong full stack development knowledge and answered most technical questions clearly. She showed good understanding of backend API development, database integration and frontend concepts.",

      recommendation: "Recommended",

      status: "Submitted",
    },

    {
      interviewId: 6,
      candidateId: 6,
      candidate: "Vikram Singh",
      email: "vikram@gmail.com",
      job: "Backend Developer",
      interviewDate: "13 Sep 2026",
      interviewType: "Technical",

      technicalRating: 4,
      communicationRating: 4,
      problemSolvingRating: 4,
      overallRating: 4.1,

      strengths:
        "Good backend development fundamentals and strong understanding of REST APIs and database concepts.",

      improvementAreas:
        "Can improve knowledge of distributed systems and cloud technologies.",

      feedback:
        "The candidate performed well in the technical interview and demonstrated good backend development knowledge.",

      recommendation: "Recommended",

      status: "Submitted",
    },
  ];

  const evaluation = evaluations.find(
    (item) =>
      item.interviewId === Number(interviewId)
  );

  if (!evaluation) {
    return (
      <div className="interviewer-layout">

        <InterviewerSidebar />

        <div className="interviewer-main">

          <InterviewerNavbar />

          <main className="interviewer-dashboard-content">

            <section className="interviewer-details-not-found">

              <ClipboardCheck size={42} />

              <h2>Evaluation not found</h2>

              <p>
                The requested submitted evaluation
                could not be found.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/interviewer/evaluations"
                  )
                }
              >
                <ArrowLeft size={16} />
                Back to Evaluations
              </button>

            </section>

          </main>

        </div>

      </div>
    );
  }

  const initials = evaluation.candidate
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const RatingDisplay = ({
    label,
    rating,
  }) => {
    return (
      <div className="interviewer-view-rating-card">

        <div className="interviewer-view-rating-heading">

          <span>{label}</span>

          <strong>
            {rating} / 5
          </strong>

        </div>

        <div className="interviewer-view-rating-stars">

          {[1, 2, 3, 4, 5].map((value) => (

            <Star
              key={value}
              size={19}
              className={
                value <= Math.round(rating)
                  ? "active"
                  : ""
              }
            />

          ))}

        </div>

      </div>
    );
  };

  return (
    <div className="interviewer-layout">

      <InterviewerSidebar />

      <div className="interviewer-main">

        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">

          {/* HEADER */}

          <div className="interviewer-dashboard-header">

            <p className="interviewer-label">
              INTERVIEW FEEDBACK
            </p>

            <h1>Submitted Evaluation</h1>

            <p>
              Review the interview feedback you
              submitted for this candidate.
            </p>

          </div>

          {/* CANDIDATE */}

          <section className="interviewer-view-candidate-card">

            <div className="interviewer-view-candidate-avatar">
              {initials}
            </div>

            <div className="interviewer-view-candidate-info">

              <h2>
                {evaluation.candidate}
              </h2>

              <span>
                {evaluation.email}
              </span>

            </div>

            <div className="interviewer-view-candidate-meta">

              <div>
                <BriefcaseBusiness size={16} />

                <span>
                  {evaluation.job}
                </span>
              </div>

              <div>
                <CalendarDays size={16} />

                <span>
                  {evaluation.interviewDate}
                </span>
              </div>

              <div>
                <ClipboardCheck size={16} />

                <span>
                  {evaluation.interviewType}
                </span>
              </div>

            </div>

            <div className="interviewer-view-submitted-badge">

              <CheckCircle2 size={14} />

              Submitted

            </div>

          </section>

          {/* MAIN */}

          <section className="interviewer-view-evaluation-card">

            {/* RATINGS */}

            <div className="interviewer-view-section">

              <div className="interviewer-view-section-title">

                <Star size={19} />

                <div>
                  <h3>
                    Candidate Ratings
                  </h3>

                  <p>
                    Ratings submitted after the
                    completed interview.
                  </p>
                </div>

              </div>

              <div className="interviewer-view-ratings-grid">

                <RatingDisplay
                  label="Technical Skills"
                  rating={
                    evaluation.technicalRating
                  }
                />

                <RatingDisplay
                  label="Communication"
                  rating={
                    evaluation.communicationRating
                  }
                />

                <RatingDisplay
                  label="Problem Solving"
                  rating={
                    evaluation.problemSolvingRating
                  }
                />

                <RatingDisplay
                  label="Overall Rating"
                  rating={
                    evaluation.overallRating
                  }
                />

              </div>

            </div>

            {/* STRENGTHS */}

            <div className="interviewer-view-section">

              <div className="interviewer-view-section-title">

                <Award size={19} />

                <div>
                  <h3>
                    Candidate Strengths
                  </h3>

                  <p>
                    Strengths observed during the
                    interview.
                  </p>
                </div>

              </div>

              <div className="interviewer-view-text-box strengths">

                <CheckCircle2 size={18} />

                <p>
                  {evaluation.strengths}
                </p>

              </div>

            </div>

            {/* IMPROVEMENT */}

            <div className="interviewer-view-section">

              <div className="interviewer-view-section-title">

                <TrendingUp size={19} />

                <div>
                  <h3>
                    Areas for Improvement
                  </h3>

                  <p>
                    Areas identified during the
                    candidate assessment.
                  </p>
                </div>

              </div>

              <div className="interviewer-view-text-box">

                <TrendingUp size={18} />

                <p>
                  {evaluation.improvementAreas}
                </p>

              </div>

            </div>

            {/* FEEDBACK */}

            <div className="interviewer-view-section">

              <div className="interviewer-view-section-title">

                <MessageSquareText size={19} />

                <div>
                  <h3>
                    Detailed Interview Feedback
                  </h3>

                  <p>
                    Overall assessment submitted by
                    the interviewer.
                  </p>
                </div>

              </div>

              <div className="interviewer-view-feedback-box">

                {evaluation.feedback}

              </div>

            </div>

            {/* RECOMMENDATION */}

            <div className="interviewer-view-section">

              <div className="interviewer-view-section-title">

                <ClipboardCheck size={19} />

                <div>
                  <h3>Recommendation</h3>

                  <p>
                    Interview recommendation provided
                    to the Hiring Manager.
                  </p>
                </div>

              </div>

              <div className="interviewer-view-recommendation">

                <div className="interviewer-view-recommendation-icon">
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <span>
                    Interviewer Recommendation
                  </span>

                  <strong>
                    {evaluation.recommendation}
                  </strong>
                </div>

              </div>

              <p className="interviewer-view-decision-note">
                This recommendation is interview
                feedback only. The final candidate
                decision is handled by the Hiring
                Manager.
              </p>

            </div>

            {/* ACTION */}

            <div className="interviewer-view-actions">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/interviewer/evaluations"
                  )
                }
              >
                <ArrowLeft size={16} />
                Back to Evaluations
              </button>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default InterviewerEvaluationView;