import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ClipboardCheck,
  User,
  BriefcaseBusiness,
  CalendarDays,
  Star,
  CheckCircle2,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import "./InterviewerDashboard.css";

function InterviewerEvaluationForm() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  // Temporary frontend data
  const interviews = [
    {
      id: 3,
      candidateId: 3,
      candidate: "Sneha Reddy",
      email: "sneha@gmail.com",
      job: "QA Engineer",
      date: "15 Sep 2026",
      type: "Technical",
      status: "Completed",
      evaluationStatus: "Pending",
    },
    {
      id: 5,
      candidateId: 5,
      candidate: "Meghana Rao",
      email: "meghana@gmail.com",
      job: "Full Stack Developer",
      date: "14 Sep 2026",
      type: "Technical",
      status: "Completed",
      evaluationStatus: "Submitted",
    },
  ];

  const interview = interviews.find(
    (item) => item.id === Number(interviewId)
  );

  const [formData, setFormData] = useState({
    technicalRating: 0,
    communicationRating: 0,
    problemSolvingRating: 0,
    overallRating: 0,
    strengths: "",
    improvementAreas: "",
    feedback: "",
    recommendation: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!interview) {
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
                The requested interview evaluation
                could not be found.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/interviewer/evaluations")
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

  // Don't allow duplicate evaluation
  if (
    interview.evaluationStatus === "Submitted" &&
    !submitted
  ) {
    return (
      <div className="interviewer-layout">
        <InterviewerSidebar />

        <div className="interviewer-main">
          <InterviewerNavbar />

          <main className="interviewer-dashboard-content">

            <section className="interviewer-evaluation-already-submitted">

              <CheckCircle2 size={45} />

              <h2>Evaluation Already Submitted</h2>

              <p>
                Feedback for {interview.candidate} has
                already been submitted.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/interviewer/evaluations")
                }
              >
                Back to Evaluations
              </button>

            </section>

          </main>
        </div>
      </div>
    );
  }

  const initials = interview.candidate
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleTextChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleRating = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.technicalRating) {
      newErrors.technicalRating =
        "Technical rating is required.";
    }

    if (!formData.communicationRating) {
      newErrors.communicationRating =
        "Communication rating is required.";
    }

    if (!formData.problemSolvingRating) {
      newErrors.problemSolvingRating =
        "Problem-solving rating is required.";
    }

    if (!formData.overallRating) {
      newErrors.overallRating =
        "Overall rating is required.";
    }

    if (!formData.strengths.trim()) {
      newErrors.strengths =
        "Candidate strengths are required.";
    }

    if (!formData.improvementAreas.trim()) {
      newErrors.improvementAreas =
        "Areas for improvement are required.";
    }

    if (!formData.feedback.trim()) {
      newErrors.feedback =
        "Interview feedback is required.";
    }

    if (!formData.recommendation) {
      newErrors.recommendation =
        "Please select a recommendation.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Frontend only.
    console.log("Evaluation:", {
      interviewId: interview.id,
      candidateId: interview.candidateId,
      ...formData,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="interviewer-layout">

        <InterviewerSidebar />

        <div className="interviewer-main">

          <InterviewerNavbar />

          <main className="interviewer-dashboard-content">

            <section className="interviewer-evaluation-success">

              <div className="interviewer-evaluation-success-icon">
                <CheckCircle2 size={35} />
              </div>

              <h2>Evaluation Submitted</h2>

              <p>
                Your interview feedback for{" "}
                <strong>{interview.candidate}</strong>{" "}
                has been submitted successfully.
              </p>

              <p className="interviewer-evaluation-success-note">
                The Hiring Manager can review this
                feedback during the candidate decision
                process.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/interviewer/evaluations")
                }
              >
                Back to Evaluations
              </button>

            </section>

          </main>

        </div>

      </div>
    );
  }

  const RatingInput = ({
    label,
    field,
    description,
  }) => (
    <div className="interviewer-evaluation-rating-field">

      <div className="interviewer-evaluation-field-heading">
        <div>
          <label>{label}</label>
          <span>{description}</span>
        </div>

        {formData[field] > 0 && (
          <strong>
            {formData[field]} / 5
          </strong>
        )}
      </div>

      <div className="interviewer-evaluation-stars">

        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={
              value <= formData[field]
                ? "selected"
                : ""
            }
            onClick={() =>
              handleRating(field, value)
            }
            title={`${value} out of 5`}
          >
            <Star size={22} />
          </button>
        ))}

      </div>

      {errors[field] && (
        <span className="interviewer-evaluation-error">
          {errors[field]}
        </span>
      )}

    </div>
  );

  return (
    <div className="interviewer-layout">

      <InterviewerSidebar />

      <div className="interviewer-main">

        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">

          <div className="interviewer-dashboard-header">

            <p className="interviewer-label">
              INTERVIEW FEEDBACK
            </p>

            <h1>Candidate Evaluation</h1>

            <p>
              Record your assessment and recommendation
              after completing the interview.
            </p>

          </div>

          {/* CANDIDATE SUMMARY */}

          <section className="interviewer-evaluation-candidate-card">

            <div className="interviewer-evaluation-candidate-avatar">
              {initials}
            </div>

            <div className="interviewer-evaluation-candidate-info">

              <h2>{interview.candidate}</h2>

              <span>{interview.email}</span>

            </div>

            <div className="interviewer-evaluation-candidate-meta">

              <div>
                <BriefcaseBusiness size={16} />
                {interview.job}
              </div>

              <div>
                <CalendarDays size={16} />
                {interview.date}
              </div>

              <div>
                <ClipboardCheck size={16} />
                {interview.type} Interview
              </div>

            </div>

            <span className="interviewer-evaluation-completed-badge">
              <CheckCircle2 size={14} />
              Interview Completed
            </span>

          </section>

          {/* FORM */}

          <form
            className="interviewer-evaluation-form"
            onSubmit={handleSubmit}
          >

            {/* RATINGS */}

            <section className="interviewer-evaluation-form-section">

              <div className="interviewer-evaluation-form-title">
                <Star size={19} />

                <div>
                  <h3>Candidate Ratings</h3>

                  <p>
                    Rate the candidate from 1 to 5
                    based on the completed interview.
                  </p>
                </div>
              </div>

              <div className="interviewer-evaluation-rating-grid">

                <RatingInput
                  label="Technical Skills"
                  field="technicalRating"
                  description="Technical knowledge relevant to the role."
                />

                <RatingInput
                  label="Communication"
                  field="communicationRating"
                  description="Clarity and effectiveness of communication."
                />

                <RatingInput
                  label="Problem Solving"
                  field="problemSolvingRating"
                  description="Ability to analyse and solve problems."
                />

                <RatingInput
                  label="Overall Rating"
                  field="overallRating"
                  description="Overall interview performance."
                />

              </div>

            </section>

            {/* STRENGTHS */}

            <section className="interviewer-evaluation-form-section">

              <div className="interviewer-evaluation-form-title">
                <CheckCircle2 size={19} />

                <div>
                  <h3>Candidate Strengths</h3>

                  <p>
                    Mention the candidate's strongest
                    areas observed during the interview.
                  </p>
                </div>
              </div>

              <textarea
                name="strengths"
                value={formData.strengths}
                onChange={handleTextChange}
                placeholder="Example: Strong API testing knowledge, clear understanding of automation concepts..."
                rows="4"
              />

              {errors.strengths && (
                <span className="interviewer-evaluation-error">
                  {errors.strengths}
                </span>
              )}

            </section>

            {/* IMPROVEMENT */}

            <section className="interviewer-evaluation-form-section">

              <div className="interviewer-evaluation-form-title">
                <ClipboardCheck size={19} />

                <div>
                  <h3>Areas for Improvement</h3>

                  <p>
                    Mention areas where the candidate
                    could improve.
                  </p>
                </div>
              </div>

              <textarea
                name="improvementAreas"
                value={formData.improvementAreas}
                onChange={handleTextChange}
                placeholder="Enter areas for improvement..."
                rows="4"
              />

              {errors.improvementAreas && (
                <span className="interviewer-evaluation-error">
                  {errors.improvementAreas}
                </span>
              )}

            </section>

            {/* FEEDBACK */}

            <section className="interviewer-evaluation-form-section">

              <div className="interviewer-evaluation-form-title">
                <User size={19} />

                <div>
                  <h3>Detailed Interview Feedback</h3>

                  <p>
                    Provide your overall assessment
                    from the interview.
                  </p>
                </div>
              </div>

              <textarea
                name="feedback"
                value={formData.feedback}
                onChange={handleTextChange}
                placeholder="Enter detailed interview feedback..."
                rows="6"
              />

              {errors.feedback && (
                <span className="interviewer-evaluation-error">
                  {errors.feedback}
                </span>
              )}

            </section>

            {/* RECOMMENDATION */}

            <section className="interviewer-evaluation-form-section">

              <div className="interviewer-evaluation-form-title">
                <ClipboardCheck size={19} />

                <div>
                  <h3>Recommendation</h3>

                  <p>
                    Provide your interview recommendation.
                    The final hiring decision remains with
                    the Hiring Manager.
                  </p>
                </div>
              </div>

              <div className="interviewer-recommendation-options">

                {[
                  "Strongly Recommended",
                  "Recommended",
                  "Needs Further Review",
                  "Not Recommended",
                ].map((recommendation) => (

                  <button
                    key={recommendation}
                    type="button"
                    className={
                      formData.recommendation ===
                      recommendation
                        ? "selected"
                        : ""
                    }
                    onClick={() => {
                      setFormData((previous) => ({
                        ...previous,
                        recommendation,
                      }));

                      setErrors((previous) => ({
                        ...previous,
                        recommendation: "",
                      }));
                    }}
                  >
                    <ClipboardCheck size={16} />
                    {recommendation}
                  </button>

                ))}

              </div>

              {errors.recommendation && (
                <span className="interviewer-evaluation-error">
                  {errors.recommendation}
                </span>
              )}

            </section>

            {/* ACTIONS */}

            <div className="interviewer-evaluation-form-actions">

              <button
                type="button"
                className="back"
                onClick={() =>
                  navigate("/interviewer/evaluations")
                }
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                type="submit"
                className="submit"
              >
                <CheckCircle2 size={16} />
                Submit Evaluation
              </button>

            </div>

          </form>

        </main>

      </div>

    </div>
  );
}

export default InterviewerEvaluationForm;