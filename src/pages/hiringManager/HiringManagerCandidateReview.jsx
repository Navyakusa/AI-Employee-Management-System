import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  BriefcaseBusiness,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  XCircle,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerCandidateReview() {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  const [reviewNotes, setReviewNotes] = useState("");

  // Temporary frontend data
  // Backend integration will replace this later
  const candidates = [
    {
      id: 1,
      name: "Ananya Sharma",
      email: "ananya@gmail.com",
      job: "Java Backend Developer",
      experience: "3 Years",
      matchScore: 92,
      skills: [
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "REST API",
      ],
      strengths: [
        "Strong Java fundamentals",
        "Good Spring Boot experience",
        "Relevant backend development experience",
      ],
      gaps: [
        "Limited cloud experience",
        "Advanced system design can be evaluated",
      ],
    },
    {
      id: 2,
      name: "Rahul Verma",
      email: "rahul@gmail.com",
      job: "React Frontend Developer",
      experience: "2 Years",
      matchScore: 87,
      skills: [
        "React",
        "JavaScript",
        "CSS",
      ],
      strengths: [
        "Good React knowledge",
        "Strong frontend fundamentals",
        "Relevant UI development experience",
      ],
      gaps: [
        "Limited backend exposure",
        "Testing experience can be evaluated",
      ],
    },
    {
      id: 3,
      name: "Sneha Reddy",
      email: "sneha@gmail.com",
      job: "QA Engineer",
      experience: "4 Years",
      matchScore: 83,
      skills: [
        "Selenium",
        "Postman",
        "Java",
      ],
      strengths: [
        "Good testing experience",
        "Strong API testing knowledge",
        "Relevant automation skills",
      ],
      gaps: [
        "Performance testing exposure can be evaluated",
      ],
    },
  ];

  // Find selected candidate using candidateId from URL
  const candidate =
    candidates.find(
      (item) => item.id === Number(candidateId)
    ) || candidates[0];

  // Generate initials
  const initials = candidate.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ------------------------------------------------
  // MOVE CANDIDATE TO INTERVIEW
  // ------------------------------------------------

  const handleMoveToInterview = () => {
    // Backend integration will be added later.
    // For now we only navigate to Interviews.

    navigate(
      `/hiring-manager/interviews?candidateId=${candidate.id}`
    );
  };

  // ------------------------------------------------
  // REJECT CANDIDATE
  // ------------------------------------------------

  const handleRejectCandidate = () => {
    // Backend integration will be added later.
    // For now return to shortlisted candidates.

    navigate(
      "/hiring-manager/shortlisted-candidates"
    );
  };

  return (
    <div className="hiring-manager-layout">

      <HiringManagerSidebar />

      <div className="hiring-manager-main">

        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* ================= HEADER ================= */}

          <div className="hiring-manager-dashboard-header">

            <p className="hiring-manager-label">
              CANDIDATE REVIEW
            </p>

            <h1>Review Candidate</h1>

            <p>
              Evaluate the candidate profile and AI analysis
              before proceeding to the interview stage.
            </p>

          </div>

          {/* ============ CANDIDATE REVIEW CARD ============ */}

          <section className="hm-resume-main-card">

            {/* CANDIDATE INFORMATION */}

            <div className="hm-resume-profile-top">

              <div className="hm-resume-avatar">
                {initials}
              </div>

              <div>
                <h2>{candidate.name}</h2>
                <p>{candidate.email}</p>
              </div>

            </div>

            {/* APPLIED POSITION */}

            <div className="hm-resume-section">

              <h3>
                <BriefcaseBusiness size={18} />
                Applied Position
              </h3>

              <p>{candidate.job}</p>

              <p>
                Experience: {candidate.experience}
              </p>

            </div>

            {/* AI MATCH ANALYSIS */}

            <div className="hm-resume-section">

              <h3>
                <Star size={18} />
                AI Match Analysis
              </h3>

              <div className="hm-resume-score-card">

                <div>
                  <span>Candidate Match</span>

                  <strong>
                    {candidate.matchScore}%
                  </strong>
                </div>

                <div className="hm-resume-score-bar">

                  <div
                    className="hm-resume-score-progress"
                    style={{
                      width: `${candidate.matchScore}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* MATCHING SKILLS */}

            <div className="hm-resume-section">

              <h3>Matching Skills</h3>

              <div className="hm-resume-skills">

                {candidate.skills.map((skill) => (

                  <span key={skill}>
                    <CheckCircle2 size={14} />
                    {skill}
                  </span>

                ))}

              </div>

            </div>

            {/* CANDIDATE STRENGTHS */}

            <div className="hm-resume-section">

              <h3>
                <CheckCircle2 size={18} />
                Candidate Strengths
              </h3>

              {candidate.strengths.map(
                (strength) => (

                  <p key={strength}>
                    ✓ {strength}
                  </p>

                )
              )}

            </div>

            {/* AREAS TO EVALUATE */}

            <div className="hm-resume-section">

              <h3>
                <AlertCircle size={18} />
                Areas to Evaluate
              </h3>

              {candidate.gaps.map((gap) => (

                <p key={gap}>
                  • {gap}
                </p>

              ))}

            </div>

            {/* HIRING MANAGER NOTES */}

            <div className="hm-resume-section">

              <h3>Hiring Manager Notes</h3>

              <p>
                Add observations that may help during the
                interview process.
              </p>

              <textarea
                value={reviewNotes}
                onChange={(e) =>
                  setReviewNotes(e.target.value)
                }
                placeholder="Enter candidate review notes..."
                rows="5"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  marginTop: "12px",
                  border: "1px solid #dbe3ee",
                  borderRadius: "10px",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />

            </div>

            {/* ================= REVIEW ACTIONS ================= */}

            <div className="hm-review-action-section">

              <div className="hm-review-action-heading">

                <h3>Review Actions</h3>

                <p>
                  After reviewing the candidate profile and AI
                  analysis, choose the next recruitment action.
                </p>

              </div>

              <div className="hm-review-action-buttons">

                {/* MOVE TO INTERVIEW */}

                <button
                  type="button"
                  className="hm-move-interview-button"
                  onClick={handleMoveToInterview}
                >
                  <CalendarDays size={17} />
                  Move to Interview
                </button>

                {/* REJECT */}

                <button
                  type="button"
                  className="hm-reject-candidate-button"
                  onClick={handleRejectCandidate}
                >
                  <XCircle size={17} />
                  Reject Candidate
                </button>

              </div>

            </div>

            {/* BACK BUTTON */}

            <div className="hm-resume-actions">

              <button
                type="button"
                className="hm-resume-secondary-button"
                onClick={() =>
                  navigate(
                    "/hiring-manager/shortlisted-candidates"
                  )
                }
              >
                <ArrowLeft size={16} />
                Back to Shortlisted Candidates
              </button>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default HiringManagerCandidateReview;