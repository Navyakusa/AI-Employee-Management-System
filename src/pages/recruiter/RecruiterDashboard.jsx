import React, { useEffect, useState } from "react";
import {
  Users,
  Brain,
  UserCheck,
  CalendarDays,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import apiClient from "../../services/apiClient";

import "./RecruiterDashboard.css";

function RecruiterDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalCandidates: 0,
    aiScreened: 0,
    shortlisted: 0,
    interviews: 0,

    pipeline: {
      applied: 0,
      aiScreened: 0,
      shortlisted: 0,
      hrScreening: 0,
      interview: 0,
      selected: 0,
    },

    recentCandidates: [],
    upcomingInterviews: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH RECRUITER DASHBOARD
  // =========================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(

          "/recruiter/dashboard"

          "/api/recruiter/dashboard"

        );

        console.log(
          "Recruiter dashboard response:",
          response.data
        );

        const result = response.data;

        if (!result?.success) {
          setError(
            result?.message ||
              "Failed to load recruiter dashboard."
          );
          return;
        }

        const data = result?.data;

        if (!data) {
          setError(
            "Dashboard data was not received from backend."
          );
          return;
        }

        setDashboardData({
          totalCandidates:
            data.totalCandidates ?? 0,

          aiScreened:
            data.aiScreened ?? 0,

          shortlisted:
            data.shortlisted ?? 0,

          interviews:
            data.interviews ?? 0,

          pipeline: {
            applied:
              data.pipeline?.applied ?? 0,

            aiScreened:
              data.pipeline?.aiScreened ?? 0,

            shortlisted:
              data.pipeline?.shortlisted ?? 0,

            hrScreening:
              data.pipeline?.hrScreening ?? 0,

            interview:
              data.pipeline?.interview ?? 0,

            selected:
              data.pipeline?.selected ?? 0,
          },

          recentCandidates:
            Array.isArray(data.recentCandidates)
              ? data.recentCandidates
              : [],

          upcomingInterviews:
            Array.isArray(data.upcomingInterviews)
              ? data.upcomingInterviews
              : [],
        });
      } catch (err) {
        console.error(
          "Recruiter dashboard error:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Your session has expired. Please login again."
          );
        } else if (err.response?.status === 403) {
          setError(
            "You are not authorized to access the recruiter dashboard."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load recruiter dashboard."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // =========================================================
  // STAT CARDS
  // =========================================================

  const stats = [
    {
      title: "Total Candidates",
      value: dashboardData.totalCandidates,
      icon: Users,
      type: "blue",
    },
    {
      title: "AI Screened",
      value: dashboardData.aiScreened,
      icon: Brain,
      type: "purple",
    },
    {
      title: "Shortlisted",
      value: dashboardData.shortlisted,
      icon: UserCheck,
      type: "green",
    },
    {
      title: "Interviews",
      value: dashboardData.interviews,
      icon: CalendarDays,
      type: "orange",
    },
  ];

  // =========================================================
  // PIPELINE
  // =========================================================

  const pipeline = [
    {
      name: "Applied",
      count: dashboardData.pipeline.applied,
    },
    {
      name: "AI Screened",
      count: dashboardData.pipeline.aiScreened,
    },
    {
      name: "Shortlisted",
      count: dashboardData.pipeline.shortlisted,
    },
    {
      name: "HR Screening",
      count: dashboardData.pipeline.hrScreening,
    },
    {
      name: "Interview",
      count: dashboardData.pipeline.interview,
    },
    {
      name: "Selected",
      count: dashboardData.pipeline.selected,
    },
  ];

  // =========================================================
  // FORMAT INTERVIEW TIME
  // =========================================================

  const formatInterviewTime = (dateTime) => {
    if (!dateTime) {
      return "--";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =========================================================
  // FORMAT AI MATCH
  // =========================================================

  const formatAiMatch = (score) => {
    if (
      score === null ||
      score === undefined ||
      score === ""
    ) {
      return "--";
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore)) {
      return "--";
    }

    /*
      IMPORTANT:
      This assumes backend returns percentage values,
      e.g. 91 = 91%.

      If your actual backend returns 0.91 for 91%,
      change this to:
      return `${Math.round(numericScore * 100)}%`;
    */

    return `${Math.round(numericScore)}%`;
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "";
    }

    return status
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
  };

  return (
    <div className="recruiter-dashboard-page">
      <RecruiterSidebar />

      <RecruiterTopbar />

      <main className="recruiter-dashboard-main">
        {/* ================= TOPBAR ================= */}

        <header className="recruiter-dashboard-topbar">
          <div className="recruiter-search">
            <input
              type="text"
              placeholder="Search candidates, jobs..."
            />
          </div>

          <div className="recruiter-user-area">
            <button
              type="button"
              className="recruiter-notification-btn"
            >
              <AlertCircle size={20} />
              <span />
            </button>

            <div className="recruiter-user-avatar">
              R
            </div>

            <div className="recruiter-user-info">
              <strong>Recruiter</strong>
              <small>Recruiter</small>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}

        <section className="recruiter-dashboard-content">
          <div className="recruiter-page-heading">
            <div>
              <span className="recruiter-eyebrow">
                RECRUITMENT WORKSPACE
              </span>

              <h1>Recruiter Dashboard</h1>

              <p>
                Manage candidates, screening,
                interviews and recruitment activities.
              </p>
            </div>
          </div>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="recruiter-dashboard-error">
              <AlertCircle size={17} />

              <span>{error}</span>
            </div>
          )}

          {/* ================= STAT CARDS ================= */}

          <div className="recruiter-stat-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  className="recruiter-stat-card"
                  key={stat.title}
                >
                  <div
                    className={`recruiter-stat-icon ${stat.type}`}
                  >
                    <Icon size={21} />
                  </div>

                  <div>
                    <span>{stat.title}</span>

                    <strong>
                      {loading ? "..." : stat.value}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= PIPELINE ================= */}

          <section className="recruiter-card recruiter-pipeline-card">
            <div className="recruiter-card-header">
              <div>
                <h2>Candidate Pipeline</h2>

                <p>
                  Track candidates through the
                  recruitment process.
                </p>
              </div>

              <button
                type="button"
                className="recruiter-view-btn"
                onClick={() =>
                  navigate("/recruiter/candidates")
                }
              >
                View Candidates
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="recruiter-pipeline">
              {pipeline.map((stage, index) => (
                <React.Fragment key={stage.name}>
                  <div className="recruiter-pipeline-stage">
                    <div className="recruiter-pipeline-number">
                      {loading
                        ? "..."
                        : stage.count}
                    </div>

                    <span>{stage.name}</span>
                  </div>

                  {index <
                    pipeline.length - 1 && (
                    <ArrowRight
                      className="recruiter-pipeline-arrow"
                      size={18}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* ================= TWO COLUMNS ================= */}

          <div className="recruiter-dashboard-columns">
            {/* ================= RECENT CANDIDATES ================= */}

            <section className="recruiter-card">
              <div className="recruiter-card-header">
                <div>
                  <h2>Recent Candidates</h2>

                  <p>Latest candidate activity.</p>
                </div>

                <button
                  type="button"
                  className="recruiter-text-btn"
                  onClick={() =>
                    navigate(
                      "/recruiter/candidates"
                    )
                  }
                >
                  View All
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="recruiter-candidate-list">
                {loading ? (
                  <div className="recruiter-dashboard-empty">
                    Loading candidates...
                  </div>
                ) : dashboardData
                    .recentCandidates.length === 0 ? (
                  <div className="recruiter-dashboard-empty">
                    No recent candidates available.
                  </div>
                ) : (
                  dashboardData.recentCandidates.map(
                    (candidate) => (
                      <div
                        className="recruiter-candidate-row"
                        key={
                          candidate.candidateId ??
                          `${candidate.candidateName}-${candidate.jobId}`
                        }
                      >
                        <div className="recruiter-candidate-avatar">
                          {candidate.candidateName
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </div>

                        <div className="recruiter-candidate-details">
                          <strong>
                            {candidate.candidateName ||
                              "Candidate"}
                          </strong>

                          <span>
                            {candidate.position ||
                              "Position not available"}
                          </span>
                        </div>

                        <div className="recruiter-match-score">
                          <strong>
                            {formatAiMatch(
                              candidate.aiMatch
                            )}
                          </strong>

                          <span>AI Match</span>
                        </div>

                        <span
                          className={`recruiter-status ${getStatusClass(
                            candidate.status
                          )}`}
                        >
                          {candidate.status ||
                            "Unknown"}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </section>

            {/* ================= UPCOMING INTERVIEWS ================= */}

            <section className="recruiter-card">
              <div className="recruiter-card-header">
                <div>
                  <h2>Upcoming Interviews</h2>

                  <p>
                    Scheduled candidate interviews.
                  </p>
                </div>

                <CalendarDays size={20} />
              </div>

              <div className="recruiter-interview-list">
                {loading ? (
                  <div className="recruiter-dashboard-empty">
                    Loading interviews...
                  </div>
                ) : dashboardData
                    .upcomingInterviews.length ===
                  0 ? (
                  <div className="recruiter-dashboard-empty">
                    No upcoming interviews available.
                  </div>
                ) : (
                  dashboardData.upcomingInterviews.map(
                    (interview) => (
                      <div
                        className="recruiter-interview-row"
                        key={
                          interview.interviewId ??
                          `${interview.candidateName}-${interview.interviewDateTime}`
                        }
                      >
                        <div className="recruiter-time">
                          <Clock size={15} />

                          <strong>
                            {formatInterviewTime(
                              interview.interviewDateTime
                            )}
                          </strong>
                        </div>

                        <div className="recruiter-interview-person">
                          <div className="recruiter-small-avatar">
                            {interview.candidateName
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "C"}
                          </div>

                          <div>
                            <strong>
                              {interview.candidateName ||
                                "Candidate"}
                            </strong>

                            <span>
                              {interview.position ||
                                "Position not available"}
                            </span>
                          </div>
                        </div>

                        <span className="recruiter-interview-type">
                          {interview.interviewType ||
                            interview.interviewMode ||
                            "Interview"}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </section>
          </div>

          {/* ================= AI SCREENING ================= */}

          <section className="recruiter-card recruiter-ai-card">
            <div className="recruiter-ai-icon">
              <Brain size={25} />
            </div>

            <div className="recruiter-ai-content">
              <h2>AI Candidate Screening</h2>

              <p>
                Review AI-assisted candidate matching
                and screening results before making
                recruitment decisions.
              </p>
            </div>

            <button
              type="button"
              className="recruiter-ai-button"
              onClick={() =>
                navigate("/recruiter/ai-screening")
              }
            >
              Open AI Screening
              <ArrowRight size={16} />
            </button>
          </section>
        </section>
      </main>
    </div>
  );
}

export default RecruiterDashboard;