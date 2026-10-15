import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  FileText,
  Brain,
  AlertCircle,
  CalendarDays,
  XCircle,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";
import apiClient from "../../services/apiClient";

import "./HiringManagerLayout.css";
import "./HiringManagerResumeReview.css";

const HiringManagerResumeReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidateId } = useParams();

  // The route parameter is the application ID in the current flow.
  const applicationId =
    candidateId || location.state?.applicationId;

  const [candidate, setCandidate] = useState(
    location.state?.candidate || null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * FETCH CANDIDATE REVIEW
   *
   * Assumed endpoint:
   * GET /api/hiring-manager/shortlisted-candidates/{applicationId}
   *
   * apiClient is assumed to have /api in its baseURL.
   * Confirm the actual mapping with the backend team.
   */
  useEffect(() => {
    let cancelled = false;

    const loadResumeReview = async () => {
      try {
        setLoading(true);
        setError("");

        if (!applicationId) {
          throw new Error("Application ID is missing.");
        }

        console.log(
          "Loading resume review for application:",
          applicationId
        );

        const response = await apiClient.get(
          `/hiring-manager/shortlisted-candidates/${encodeURIComponent(
            applicationId
          )}`
        );

        console.log(
          "Resume review API response:",
          response.data
        );

        const candidateData =
          response.data?.data ?? response.data;

        if (
          !candidateData ||
          typeof candidateData !== "object" ||
          Array.isArray(candidateData)
        ) {
          throw new Error(
            "Resume review data is not available."
          );
        }

        if (!cancelled) {
          setCandidate(candidateData);
        }
      } catch (err) {
        console.error(
          "Failed to load resume review:",
          err
        );

        let message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load resume review.";

        if (err.response?.status === 401) {
          message =
            "Your session may have expired. Please sign in again.";
        } else if (err.response?.status === 403) {
          message =
            "Access denied. The backend team must verify the candidate-review endpoint and HIRING_MANAGER permissions.";
        } else if (err.response?.status === 404) {
          message =
            "The candidate-review endpoint or application was not found. Please confirm the controller mapping with the backend team.";
        }

        if (!cancelled) {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadResumeReview();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  /*
   * HELPERS
   */
  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Not available";
    }

    if (Array.isArray(value)) {
      return value.length
        ? value.join(", ")
        : "Not available";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return value;
  };

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

  /*
   * BACK
   */
  const handleBack = () => {
    navigate(
      "/hiring-manager/shortlisted-candidates"
    );
  };

  /*
   * SCHEDULE INTERVIEW
   *
   * This navigates to the interview page.
   * It does not create an interview API request.
   */
  const handleScheduleInterview = () => {
    if (!candidate) {
      return;
    }

    const currentApplicationId =
      candidate.applicationId ?? applicationId;

    navigate(
      `/hiring-manager/interviews?candidateId=${encodeURIComponent(
        candidate.candidateId ?? ""
      )}`,
      {
        state: {
          candidate,
          applicationId: currentApplicationId,
        },
      }
    );
  };

  /*
   * REJECT
   *
   * No rejection API is called until the backend
   * confirms the correct endpoint and request format.
   */
  const handleReject = () => {
    if (!candidate) {
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

    window.alert(
      "The rejection API has not been connected yet. Please confirm the candidate-decision endpoint with the backend team."
    );
  };

  /*
   * LOADING
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
                RESUME REVIEW
              </p>

              <h1>Resume Review</h1>

              <p>
                Loading candidate resume information...
              </p>
            </div>

            <section className="hm-resume-main-card">
              <div
                className="empty-state"
                style={{
                  textAlign: "center",
                  padding: "60px",
                }}
              >
                <FileText
                  size={40}
                  style={{ marginBottom: "15px" }}
                />

                <p>Loading resume review...</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  /*
   * ERROR
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
                RESUME REVIEW
              </p>

              <h1>Resume Review</h1>

              <p>
                Review the candidate's resume and
                extracted information.
              </p>
            </div>

            <section className="hm-resume-main-card">
              <div
                className="empty-state"
                style={{
                  textAlign: "center",
                  padding: "60px",
                }}
              >
                <AlertCircle
                  size={40}
                  style={{ marginBottom: "15px" }}
                />

                <h3>Unable to Load Resume</h3>

                <p>
                  {error ||
                    "Candidate information is not available."}
                </p>

                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    marginTop: "18px",
                    padding: "11px 20px",
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
   * DATA
   */
  const initials = getInitials(candidate.candidateName);
  const aiScore = candidate.aiMatchScore;

  const hasAiScore =
    aiScore !== null &&
    aiScore !== undefined &&
    aiScore !== "" &&
    Number.isFinite(Number(aiScore));

  const scoreWidth = hasAiScore
    ? Math.max(0, Math.min(100, Number(aiScore)))
    : 0;

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">
          {/* HEADER */}
          <div className="hiring-manager-dashboard-header">
            <p className="hiring-manager-label">
              RESUME REVIEW
            </p>

            <h1>Resume Review</h1>

            <p>
              Review the candidate's resume, extracted
              information and AI analysis.
            </p>
          </div>

          {/* BACK BUTTON */}
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background: "#e5e7eb",
              color: "#111827",
              fontWeight: "600",
            }}
          >
            <ArrowLeft size={16} />
            Back to Shortlisted Candidates
          </button>

          <section className="hm-resume-main-card">
            {/* CANDIDATE HEADER */}
            <div className="hm-resume-profile-top">
              <div className="hm-resume-avatar">
                {initials}
              </div>

              <div>
                <h2>
                  {formatValue(candidate.candidateName)}
                </h2>

                <p>{formatValue(candidate.email)}</p>

                <p>
                  Application ID:{" "}
                  {formatValue(
                    candidate.applicationId ?? applicationId
                  )}
                </p>
              </div>
            </div>

            {/* CANDIDATE INFORMATION */}
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
                  marginTop: "18px",
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

                  <p>{formatValue(candidate.email)}</p>
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

                  <p>{formatValue(candidate.phone)}</p>
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

                  <p>{formatValue(candidate.location)}</p>
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

                  <p>{formatValue(candidate.education)}</p>
                </div>

                <div>
                  <strong>
                    <BriefcaseBusiness
                      size={15}
                      style={{
                        marginRight: "6px",
                        verticalAlign: "middle",
                      }}
                    />
                    Experience
                  </strong>

                  <p>{formatValue(candidate.experience)}</p>
                </div>
              </div>
            </div>

            {/* RESUME FILE */}
            <div className="hm-resume-section">
              <h3>
                <FileText size={18} />
                Resume
              </h3>

              <div
                style={{
                  marginTop: "15px",
                  padding: "18px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "#f8fafc",
                }}
              >
                <p>
                  <strong>File Name:</strong>{" "}
                  {formatValue(candidate.resumeFileName)}
                </p>

                <p>
                  <strong>File Type:</strong>{" "}
                  {formatValue(candidate.resumeFileType)}
                </p>

                <p>
                  <strong>Resume ID:</strong>{" "}
                  {formatValue(candidate.resumeId)}
                </p>
              </div>
            </div>

            {/* EXTRACTED INFORMATION */}
            <div className="hm-resume-section">
              <h3>
                <FileText size={18} />
                Extracted Resume Information
              </h3>

              <div style={{ marginTop: "15px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <strong>Extracted Skills</strong>
                  <p>
                    {formatValue(candidate.extractedSkills)}
                  </p>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <strong>Extracted Experience</strong>
                  <p>
                    {formatValue(
                      candidate.extractedExperience
                    )}
                  </p>
                </div>

                <div>
                  <strong>Extracted Education</strong>
                  <p>
                    {formatValue(
                      candidate.extractedEducation
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* APPLIED JOB */}
            <div className="hm-resume-section">
              <h3>
                <BriefcaseBusiness size={18} />
                Applied Job
              </h3>

              <p>
                <strong>Job Title:</strong>{" "}
                {formatValue(candidate.jobTitle)}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {formatValue(candidate.department)}
              </p>

              <p>
                <strong>Job Location:</strong>{" "}
                {formatValue(candidate.jobLocation)}
              </p>

              <p>
                <strong>Employment Type:</strong>{" "}
                {formatValue(candidate.employmentType)}
              </p>

              <p>
                <strong>Required Skills:</strong>{" "}
                {formatValue(candidate.requiredSkills)}
              </p>

              <p>
                <strong>Preferred Skills:</strong>{" "}
                {formatValue(candidate.preferredSkills)}
              </p>
            </div>

            {/* AI ANALYSIS */}
            <div className="hm-resume-section">
              <h3>
                <Brain size={18} />
                AI Resume Analysis
              </h3>

              <div
                style={{
                  textAlign: "center",
                  margin: "25px 0",
                }}
              >
                <p>
                  <strong>AI Match Score</strong>
                </p>

                <div
                  style={{
                    fontSize: "42px",
                    fontWeight: "700",
                  }}
                >
                  {hasAiScore ? `${aiScore}%` : "N/A"}
                </div>

                {hasAiScore && (
                  <div
                    style={{
                      height: "9px",
                      background: "#e5e7eb",
                      borderRadius: "20px",
                      overflow: "hidden",
                      marginTop: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: `${scoreWidth}%`,
                        height: "100%",
                        background: "#5547f5",
                        borderRadius: "20px",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* MATCH DETAILS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "14px",
                  marginTop: "20px",
                }}
              >
                <div>
                  <strong>Skill Match</strong>
                  <p>{formatValue(candidate.skillMatch)}</p>
                </div>

                <div>
                  <strong>Experience Match</strong>
                  <p>
                    {formatValue(candidate.experienceMatch)}
                  </p>
                </div>

                <div>
                  <strong>Education Match</strong>
                  <p>
                    {formatValue(candidate.educationMatch)}
                  </p>
                </div>

                <div>
                  <strong>Certification Match</strong>
                  <p>
                    {formatValue(
                      candidate.certificationMatch
                    )}
                  </p>
                </div>

                <div>
                  <strong>Location Match</strong>
                  <p>
                    {formatValue(candidate.locationMatch)}
                  </p>
                </div>

                <div>
                  <strong>Role Match</strong>
                  <p>{formatValue(candidate.roleMatch)}</p>
                </div>
              </div>

              {/* AI EXPLANATION */}
              <div style={{ marginTop: "25px" }}>
                <h4>AI Explanation</h4>
                <p>
                  {formatValue(candidate.aiExplanation)}
                </p>
              </div>
            </div>

            {/* APPLICATION INFORMATION */}
            <div className="hm-resume-section">
              <h3>Application Information</h3>

              <p>
                <strong>Application ID:</strong>{" "}
                {formatValue(
                  candidate.applicationId ?? applicationId
                )}
              </p>

              <p>
                <strong>Candidate ID:</strong>{" "}
                {formatValue(candidate.candidateId)}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {formatValue(candidate.status)}
              </p>

              <p>
                <strong>Applied At:</strong>{" "}
                {candidate.appliedAt
                  ? new Date(
                      candidate.appliedAt
                    ).toLocaleString("en-IN")
                  : "Not available"}
              </p>
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "25px",
                marginBottom: "20px",
              }}
            >
              <button
                type="button"
                onClick={handleScheduleInterview}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 22px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: "#5547f5",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                <CalendarDays size={17} />
                Schedule Interview
              </button>

              <button
                type="button"
                onClick={handleReject}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 22px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  fontWeight: "600",
                }}
              >
                <XCircle size={17} />
                Reject Candidate
              </button>
            </div>

            {/* BACK */}
            <div className="hm-resume-actions">
              <button
                type="button"
                className="hm-resume-secondary-button"
                onClick={handleBack}
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
};

export default HiringManagerResumeReview;
