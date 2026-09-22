import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  BriefcaseBusiness,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  XCircle,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import {
  getCandidateReview,
} from "./HiringManagerApi";

import "./HiringManagerDashboard.css";

function HiringManagerCandidateReview() {
  const navigate = useNavigate();

  /*
  IMPORTANT:
  The route is:
  /hiring-manager/shortlisted-candidates/:applicationId
  */

  const { applicationId } = useParams();

  const [candidate, setCandidate] = useState(null);

  const [reviewNotes, setReviewNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  ======================================================
  FETCH CANDIDATE REVIEW
  ======================================================
  */

  useEffect(() => {
    const loadCandidateReview = async () => {
      try {
        setLoading(true);
        setError("");

        if (!applicationId) {
          throw new Error(
            "Application ID is missing."
          );
        }

        const response =
          await getCandidateReview(
            applicationId
          );

        console.log(
          "Candidate review response:",
          response
        );

        if (!response?.data) {
          throw new Error(
            response?.message ||
              "Candidate review data not available."
          );
        }

        setCandidate(response.data);

      } catch (err) {
        console.error(
          "Failed to load candidate review:",
          err
        );

        setError(
          err.message ||
            "Failed to load candidate review."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCandidateReview();
  }, [applicationId]);

  /*
  ======================================================
  HELPERS
  ======================================================
  */

  const getInitials = (name) => {
    if (!name) {
      return "CA";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Not available";
    }

    return value;
  };

  /*
  ======================================================
  MOVE TO INTERVIEW
  ======================================================
  */

  const handleMoveToInterview = () => {
    if (!candidate) {
      return;
    }

    navigate(
      `/hiring-manager/interviews?candidateId=${candidate.candidateId}`,
      {
        state: {
          candidate,
          applicationId: candidate.applicationId,
        },
      }
    );
  };

  /*
  ======================================================
  VIEW FULL RESUME
  ======================================================
  */

  const handleViewResume = () => {
    if (!candidate) {
      return;
    }

    navigate(
      `/hiring-manager/resume-review/${candidate.applicationId}`,
      {
        state: {
          applicationId:
            candidate.applicationId,

          candidate,
        },
      }
    );
  };

  /*
  ======================================================
  REJECT CANDIDATE
  ======================================================
  */

  const handleRejectCandidate = () => {
    if (!candidate) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reject ${
        candidate.candidateName ||
        "this candidate"
      }?`
    );

    if (!confirmed) {
      return;
    }

    /*
    No final rejection endpoint has been provided
    by the backend yet.

    For now, return to shortlisted candidates.
    */

    navigate(
      "/hiring-manager/shortlisted-candidates"
    );
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
                CANDIDATE REVIEW
              </p>

              <h1>
                Review Candidate
              </h1>

              <p>
                Loading candidate information...
              </p>

            </div>

            <section className="hm-resume-main-card">

              <div
                className="empty-state"
                style={{
                  padding: "50px",
                  textAlign: "center",
                }}
              >

                <p>
                  Loading candidate review...
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

  if (error || !candidate) {
    return (
      <div className="hiring-manager-layout">

        <HiringManagerSidebar />

        <div className="hiring-manager-main">

          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">

            <div className="hiring-manager-dashboard-header">

              <p className="hiring-manager-label">
                CANDIDATE REVIEW
              </p>

              <h1>
                Review Candidate
              </h1>

              <p>
                Review the shortlisted candidate details.
              </p>

            </div>

            <section className="hm-resume-main-card">

              <div
                className="empty-state"
                style={{
                  padding: "50px",
                  textAlign: "center",
                }}
              >

                <AlertCircle
                  size={40}
                  style={{
                    marginBottom: "15px",
                  }}
                />

                <h3>
                  Unable to Load Candidate
                </h3>

                <p>
                  {error ||
                    "Candidate information is not available."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/hiring-manager/shortlisted-candidates"
                    )
                  }
                  style={{
                    marginTop: "15px",
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: "#5547f5",
                    color: "#fff",
                    fontWeight: "600",
                  }}
                >
                  Back to Shortlisted Candidates
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
  EXTRACT DATA
  ======================================================
  */

  const initials = getInitials(
    candidate.candidateName
  );

  const aiScore =
    candidate.aiMatchScore;

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

            <h1>
              Review Candidate
            </h1>

            <p>
              Evaluate the candidate profile, resume
              information and AI analysis before
              proceeding to the interview stage.
            </p>

          </div>


          {/* ============ CANDIDATE REVIEW CARD ============ */}

          <section className="hm-resume-main-card">

            {/* ================= CANDIDATE ================= */}

            <div className="hm-resume-profile-top">

              <div className="hm-resume-avatar">
                {initials}
              </div>

              <div>

                <h2>
                  {formatValue(
                    candidate.candidateName
                  )}
                </h2>

                <p>
                  {formatValue(
                    candidate.email
                  )}
                </p>

              </div>

            </div>


            {/* ================= CONTACT INFORMATION ================= */}

            <div className="hm-resume-section">

              <h3>
                <User size={18} />
                Candidate Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                  marginTop: "15px",
                }}
              >

                <div>
                  <strong>
                    <Mail
                      size={15}
                      style={{
                        marginRight: "6px",
                        verticalAlign: "middle",
                      }}
                    />
                    Email
                  </strong>

                  <p>
                    {formatValue(
                      candidate.email
                    )}
                  </p>
                </div>


                <div>
                  <strong>
                    <Phone
                      size={15}
                      style={{
                        marginRight: "6px",
                        verticalAlign: "middle",
                      }}
                    />
                    Phone
                  </strong>

                  <p>
                    {formatValue(
                      candidate.phone
                    )}
                  </p>
                </div>


                <div>
                  <strong>
                    <MapPin
                      size={15}
                      style={{
                        marginRight: "6px",
                        verticalAlign: "middle",
                      }}
                    />
                    Location
                  </strong>

                  <p>
                    {formatValue(
                      candidate.location
                    )}
                  </p>
                </div>


                <div>
                  <strong>
                    <GraduationCap
                      size={15}
                      style={{
                        marginRight: "6px",
                        verticalAlign: "middle",
                      }}
                    />
                    Education
                  </strong>

                  <p>
                    {formatValue(
                      candidate.education
                    )}
                  </p>
                </div>

              </div>

            </div>


            {/* ================= APPLIED POSITION ================= */}

            <div className="hm-resume-section">

              <h3>
                <BriefcaseBusiness size={18} />
                Applied Position
              </h3>

              <p>
                <strong>
                  Job:
                </strong>{" "}
                {formatValue(
                  candidate.jobTitle
                )}
              </p>

              <p>
                <strong>
                  Department:
                </strong>{" "}
                {formatValue(
                  candidate.department
                )}
              </p>

              <p>
                <strong>
                  Job Location:
                </strong>{" "}
                {formatValue(
                  candidate.jobLocation
                )}
              </p>

              <p>
                <strong>
                  Employment Type:
                </strong>{" "}
                {formatValue(
                  candidate.employmentType
                )}
              </p>

              <p>
                <strong>
                  Experience:
                </strong>{" "}
                {formatValue(
                  candidate.experience
                )}
              </p>

            </div>


            {/* ================= RESUME ================= */}

            <div className="hm-resume-section">

              <h3>
                <FileText size={18} />
                Candidate Resume
              </h3>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "15px",
                  padding: "16px",
                  marginTop: "12px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "#f8fafc",
                }}
              >

                <div>

                  <strong>
                    {formatValue(
                      candidate.resumeFileName
                    )}
                  </strong>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                    }}
                  >
                    File Type:{" "}
                    {formatValue(
                      candidate.resumeFileType
                    )}
                  </p>

                  <p
                    style={{
                      margin:
                        "3px 0 0",
                    }}
                  >
                    Resume ID:{" "}
                    {formatValue(
                      candidate.resumeId
                    )}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    handleViewResume
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding:
                      "11px 18px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background:
                      "#5547f5",
                    color: "#fff",
                    fontWeight:
                      "600",
                    whiteSpace:
                      "nowrap",
                  }}
                >

                  <FileText
                    size={17}
                  />

                  View Full Resume

                </button>

              </div>

            </div>


            {/* ================= AI MATCH ANALYSIS ================= */}

            <div className="hm-resume-section">

              <h3>
                <Star size={18} />
                AI Match Analysis
              </h3>


              <div className="hm-resume-score-card">

                <div>

                  <span>
                    Candidate Match
                  </span>

                  <strong>
                    {aiScore !==
                      null &&
                    aiScore !==
                      undefined
                      ? `${aiScore}%`
                      : "N/A"}
                  </strong>

                </div>


                {aiScore !==
                  null &&
                aiScore !==
                  undefined && (

                  <div className="hm-resume-score-bar">

                    <div
                      className="hm-resume-score-progress"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            Number(
                              aiScore
                            )
                          )
                        )}%`,
                      }}
                    />

                  </div>

                )}

              </div>

            </div>


            {/* ================= MATCH DETAILS ================= */}

            <div className="hm-resume-section">

              <h3>
                <CheckCircle2
                  size={18}
                />
                AI Match Details
              </h3>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginTop: "15px",
                }}
              >

                <div>
                  <strong>
                    Skill Match
                  </strong>

                  <p>
                    {formatValue(
                      candidate.skillMatch
                    )}
                  </p>
                </div>


                <div>
                  <strong>
                    Experience Match
                  </strong>

                  <p>
                    {formatValue(
                      candidate.experienceMatch
                    )}
                  </p>
                </div>


                <div>
                  <strong>
                    Education Match
                  </strong>

                  <p>
                    {formatValue(
                      candidate.educationMatch
                    )}
                  </p>
                </div>


                <div>
                  <strong>
                    Certification Match
                  </strong>

                  <p>
                    {formatValue(
                      candidate.certificationMatch
                    )}
                  </p>
                </div>


                <div>
                  <strong>
                    Location Match
                  </strong>

                  <p>
                    {formatValue(
                      candidate.locationMatch
                    )}
                  </p>
                </div>


                <div>
                  <strong>
                    Role Match
                  </strong>

                  <p>
                    {formatValue(
                      candidate.roleMatch
                    )}
                  </p>
                </div>

              </div>

            </div>


            {/* ================= SKILLS ================= */}

            <div className="hm-resume-section">

              <h3>
                Matching / Candidate Skills
              </h3>

              <p>
                {formatValue(
                  candidate.skills
                )}
              </p>

            </div>


            {/* ================= EXTRACTED RESUME INFORMATION ================= */}

            <div className="hm-resume-section">

              <h3>
                Extracted Resume Information
              </h3>

              <p>
                <strong>
                  Extracted Skills:
                </strong>{" "}
                {formatValue(
                  candidate.extractedSkills
                )}
              </p>

              <p>
                <strong>
                  Extracted Experience:
                </strong>{" "}
                {formatValue(
                  candidate.extractedExperience
                )}
              </p>

              <p>
                <strong>
                  Extracted Education:
                </strong>{" "}
                {formatValue(
                  candidate.extractedEducation
                )}
              </p>

            </div>


            {/* ================= JOB REQUIREMENTS ================= */}

            <div className="hm-resume-section">

              <h3>
                Job Requirements
              </h3>

              <p>
                <strong>
                  Required Skills:
                </strong>{" "}
                {formatValue(
                  candidate.requiredSkills
                )}
              </p>

              <p>
                <strong>
                  Preferred Skills:
                </strong>{" "}
                {formatValue(
                  candidate.preferredSkills
                )}
              </p>

            </div>


            {/* ================= AI EXPLANATION ================= */}

            <div className="hm-resume-section">

              <h3>
                <AlertCircle
                  size={18}
                />
                AI Explanation
              </h3>

              <p>
                {formatValue(
                  candidate.aiExplanation
                )}
              </p>

            </div>


            {/* ================= APPLICATION INFORMATION ================= */}

            <div className="hm-resume-section">

              <h3>
                Application Information
              </h3>

              <p>
                <strong>
                  Application ID:
                </strong>{" "}
                {formatValue(
                  candidate.applicationId
                )}
              </p>

              <p>
                <strong>
                  Status:
                </strong>{" "}
                {formatValue(
                  candidate.status
                )}
              </p>

              <p>
                <strong>
                  Applied At:
                </strong>{" "}
                {candidate.appliedAt
                  ? new Date(
                      candidate.appliedAt
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "Not available"}
              </p>

            </div>


            {/* ================= NOTES ================= */}

            <div className="hm-resume-section">

              <h3>
                Hiring Manager Notes
              </h3>

              <p>
                Add observations that may
                help during the interview
                process.
              </p>

              <textarea
                value={
                  reviewNotes
                }
                onChange={(e) =>
                  setReviewNotes(
                    e.target.value
                  )
                }
                placeholder="Enter candidate review notes..."
                rows="5"
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding: "12px",
                  marginTop:
                    "12px",
                  border:
                    "1px solid #dbe3ee",
                  borderRadius:
                    "10px",
                  resize:
                    "vertical",
                  fontFamily:
                    "inherit",
                }}
              />

            </div>


            {/* ================= ACTIONS ================= */}

            <div className="hm-review-action-section">

              <div className="hm-review-action-heading">

                <h3>
                  Review Actions
                </h3>

                <p>
                  After reviewing the
                  candidate profile and AI
                  analysis, choose the next
                  recruitment action.
                </p>

              </div>


              <div className="hm-review-action-buttons">

                {/* MOVE TO INTERVIEW */}

                <button
                  type="button"
                  className="hm-move-interview-button"
                  onClick={
                    handleMoveToInterview
                  }
                >

                  <CalendarDays
                    size={17}
                  />

                  Move to Interview

                </button>


                {/* REJECT */}

                <button
                  type="button"
                  className="hm-reject-candidate-button"
                  onClick={
                    handleRejectCandidate
                  }
                >

                  <XCircle
                    size={17}
                  />

                  Reject Candidate

                </button>

              </div>

            </div>


            {/* ================= BACK ================= */}

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

                <ArrowLeft
                  size={16}
                />

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