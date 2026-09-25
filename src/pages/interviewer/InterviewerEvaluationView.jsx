import { useEffect, useState } from "react";
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

import { getEvaluationByInterviewId } from "../../services/interviewerService";

import "./InterviewerDashboard.css";

function InterviewerEvaluationView() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvaluationByInterviewId(interviewId)
      .then((data) => setEvaluation(data))
      .catch(() => setEvaluation(null))
      .finally(() => setLoading(false));
  }, [interviewId]);

  if (loading) {
    return (
      <div className="interviewer-layout">
        <InterviewerSidebar />

        <div className="interviewer-main">
          <InterviewerNavbar />

          <main className="interviewer-dashboard-content">
            <p>Loading evaluation...</p>
          </main>
        </div>
      </div>
    );
  }

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
                The requested submitted evaluation could not be found.
              </p>

              <button
                type="button"
                onClick={() => navigate("/interviewer/evaluations")}
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

  const RatingDisplay = ({ label, rating }) => {
    return (
      <div className="interviewer-view-rating-card">
        <div className="interviewer-view-rating-heading">
          <span>{label}</span>
          <strong>{rating} / 5</strong>
        </div>

        <div className="interviewer-view-rating-stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              size={19}
              className={value <= Math.round(rating) ? "active" : ""}
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
            <p className="interviewer-label">INTERVIEW FEEDBACK</p>

            <h1>Submitted Evaluation</h1>

            <p>
              Review the interview feedback you submitted for this
              candidate.
            </p>
          </div>

          {/* CANDIDATE */}

          <section className="interviewer-view-candidate-card">
            <div className="interviewer-view-candidate-avatar">
              {initials}
            </div>

            <div className="interviewer-view-candidate-info">
              <h2>{evaluation.candidate}</h2>
              <span>{evaluation.email}</span>
            </div>

            <div className="interviewer-view-candidate-meta">
              <div>
                <BriefcaseBusiness size={16} />
                <span>{evaluation.job}</span>
              </div>

              <div>
                <CalendarDays size={16} />
                <span>{evaluation.interviewDate}</span>
              </div>

              <div>
                <ClipboardCheck size={16} />
                <span>{evaluation.interviewType}</span>
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
                  <h3>Candidate Ratings</h3>
                  <p>Ratings submitted after the completed interview.</p>
                </div>
              </div>

              <div className="interviewer-view-ratings-grid">
                <RatingDisplay
                  label="Technical Skills"
                  rating={evaluation.technicalRating}
                />

                <RatingDisplay
                  label="Communication"
                  rating={evaluation.communicationRating}
                />

                <RatingDisplay
                  label="Problem Solving"
                  rating={evaluation.problemSolvingRating}
                />

                <RatingDisplay
                  label="Overall Rating"
                  rating={evaluation.overallRating}
                />
              </div>
            </div>

            {/* STRENGTHS */}

            <div className="interviewer-view-section">
              <div className="interviewer-view-section-title">
                <Award size={19} />

                <div>
                  <h3>Candidate Strengths</h3>
                  <p>Strengths observed during the interview.</p>
                </div>
              </div>

              <div className="interviewer-view-text-box strengths">
                <CheckCircle2 size={18} />
                <p>{evaluation.strengths}</p>
              </div>
            </div>

            {/* IMPROVEMENT */}

            <div className="interviewer-view-section">
              <div className="interviewer-view-section-title">
                <TrendingUp size={19} />

                <div>
                  <h3>Areas for Improvement</h3>
                  <p>Areas identified during the candidate assessment.</p>
                </div>
              </div>

              <div className="interviewer-view-text-box">
                <TrendingUp size={18} />
                <p>{evaluation.improvementAreas}</p>
              </div>
            </div>

            {/* FEEDBACK */}
            {/*
              The real backend has no separate "detailed feedback" text
              field at all (confirmed via InterviewEvaluationDto.java) —
              this section only renders if there's actually something
              to show, rather than an empty box with a heading.
            */}
            {evaluation.feedback && (
              <div className="interviewer-view-section">
                <div className="interviewer-view-section-title">
                  <MessageSquareText size={19} />

                  <div>
                    <h3>Detailed Interview Feedback</h3>
                    <p>Overall assessment submitted by the interviewer.</p>
                  </div>
                </div>

                <div className="interviewer-view-feedback-box">
                  {evaluation.feedback}
                </div>
              </div>
            )}

            {/* RECOMMENDATION */}

            <div className="interviewer-view-section">
              <div className="interviewer-view-section-title">
                <ClipboardCheck size={19} />

                <div>
                  <h3>Recommendation</h3>
                  <p>
                    Interview recommendation provided to the Hiring
                    Manager.
                  </p>
                </div>
              </div>

              <div className="interviewer-view-recommendation">
                <div className="interviewer-view-recommendation-icon">
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <span>Interviewer Recommendation</span>
                  {/*
                    KEPT PER PRODUCT DECISION: the real backend has no
                    field to store this at all (confirmed via
                    InterviewEvaluationDto.java), so this will always
                    show the fallback below until backend adds a
                    matching field — the section stays, but the value
                    is honest about not being saved anywhere yet.
                  */}
                  <strong>
                    {evaluation.recommendation || "Not recorded"}
                  </strong>
                </div>
              </div>

              <p className="interviewer-view-decision-note">
                This recommendation is interview feedback only. The
                final candidate decision is handled by the Hiring
                Manager.
              </p>
            </div>

            {/* ACTION */}

            <div className="interviewer-view-actions">
              <button
                type="button"
                onClick={() => navigate("/interviewer/evaluations")}
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
