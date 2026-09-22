import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  Clock,
  Video,
  MapPin,
  User,
  MessageSquareText,
  AlertCircle,
  LoaderCircle,
  Filter,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import { getInterviewManagementData } from "./HiringManagerApi";

import "./HiringManagerDashboard.css";

function HiringManagerInterviews() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  ======================================================
  FETCH INTERVIEWS
  ======================================================
  */

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getInterviewManagementData();

        console.log("Interview management response:", response);

        const interviewData = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        console.log("Interviews:", interviewData);

        setInterviews(interviewData);
      } catch (err) {
        console.error("Failed to load interviews:", err);

        setError(
          err.message || "Failed to load interviews."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, []);

  /*
  ======================================================
  HELPERS
  ======================================================
  */

  const normalizeStatus = (status) => {
    return String(status || "")
      .trim()
      .toUpperCase();
  };

  const formatStatus = (status) => {
    const normalized = normalizeStatus(status);

    if (!normalized) {
      return "NOT SPECIFIED";
    }

    return normalized.replaceAll("_", " ");
  };

  const formatDate = (dateTime) => {
    if (!dateTime) {
      return "Date not scheduled";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "Date not scheduled";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) {
      return "Time not scheduled";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "Time not scheduled";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getModeIcon = (mode) => {
    const value = String(mode || "").toLowerCase();

    if (
      value.includes("online") ||
      value.includes("virtual") ||
      value.includes("video")
    ) {
      return <Video size={16} />;
    }

    return <MapPin size={16} />;
  };

  /*
  ======================================================
  FILTER COUNTS
  ======================================================
  */

  const scheduledCount = interviews.filter(
    (item) => normalizeStatus(item.status) === "SCHEDULED"
  ).length;

  const completedCount = interviews.filter(
    (item) => normalizeStatus(item.status) === "COMPLETED"
  ).length;

  const cancelledCount = interviews.filter(
    (item) => normalizeStatus(item.status) === "CANCELLED"
  ).length;

  /*
  ======================================================
  FILTERED INTERVIEWS
  ======================================================
  */

  const filteredInterviews = useMemo(() => {
    if (activeFilter === "ALL") {
      return interviews;
    }

    return interviews.filter(
      (interview) =>
        normalizeStatus(interview.status) === activeFilter
    );
  }, [interviews, activeFilter]);

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
                INTERVIEWS
              </p>

              <h1>Interviews</h1>

              <p>
                View scheduled interviews, candidate details,
                interview status, and submit candidate feedback.
              </p>
            </div>

            <div
              className="empty-state"
              style={{
                textAlign: "center",
                padding: "60px",
              }}
            >
              <LoaderCircle
                size={35}
                style={{ marginBottom: "15px" }}
              />

              <p>Loading interviews...</p>
            </div>
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
                INTERVIEWS
              </p>

              <h1>Interviews</h1>

              <p>
                View scheduled interviews, candidate details,
                interview status, and submit candidate feedback.
              </p>
            </div>

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

              <h3>Unable to Load Interviews</h3>

              <p>{error}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="hiring-manager-dashboard-header">
            <p className="hiring-manager-label">
              INTERVIEWS
            </p>

            <h1>Interviews</h1>

            <p>
              View scheduled interviews, candidate details,
              interview status, and submit candidate feedback.
            </p>
          </div>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Total Interviews
              </span>

              <strong
                style={{
                  fontSize: "28px",
                  color: "#111827",
                }}
              >
                {interviews.length}
              </strong>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Scheduled
              </span>

              <strong
                style={{
                  fontSize: "28px",
                  color: "#5547f5",
                }}
              >
                {scheduledCount}
              </strong>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Completed
              </span>

              <strong
                style={{
                  fontSize: "28px",
                  color: "#059669",
                }}
              >
                {completedCount}
              </strong>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Cancelled
              </span>

              <strong
                style={{
                  fontSize: "28px",
                  color: "#dc2626",
                }}
              >
                {cancelledCount}
              </strong>
            </div>
          </section>

          {/* ==================================================
              FILTERS
          ================================================== */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                color: "#64748b",
                fontWeight: "600",
                marginRight: "5px",
              }}
            >
              <Filter size={17} />
              Filter:
            </div>

            {[
              {
                key: "ALL",
                label: "All",
              },
              {
                key: "SCHEDULED",
                label: "Scheduled",
              },
              {
                key: "COMPLETED",
                label: "Completed",
              },
              {
                key: "CANCELLED",
                label: "Cancelled",
              },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() =>
                  setActiveFilter(filter.key)
                }
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border:
                    activeFilter === filter.key
                      ? "1px solid #5547f5"
                      : "1px solid #dbe3ee",
                  background:
                    activeFilter === filter.key
                      ? "#5547f5"
                      : "#fff",
                  color:
                    activeFilter === filter.key
                      ? "#fff"
                      : "#475569",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* ==================================================
              NO DATA
          ================================================== */}

          {filteredInterviews.length === 0 && (
            <div
              className="empty-state"
              style={{
                textAlign: "center",
                padding: "60px",
              }}
            >
              <CalendarDays
                size={40}
                style={{ marginBottom: "15px" }}
              />

              <h3>
                No{" "}
                {activeFilter === "ALL"
                  ? ""
                  : activeFilter.toLowerCase()}{" "}
                interviews
              </h3>

              <p>
                There are no interviews matching the
                selected status.
              </p>
            </div>
          )}

          {/* ==================================================
              INTERVIEW CARDS
          ================================================== */}

          {filteredInterviews.length > 0 && (
            <section className="hm-interviews-grid">
              {filteredInterviews.map((interview) => {
                const status = normalizeStatus(
                  interview.status
                );

                const isCompleted =
                  status === "COMPLETED";

                const isCancelled =
                  status === "CANCELLED";

                return (
                  <div
                    className="hm-interview-card"
                    key={interview.interviewId}
                  >
                    {/* CARD HEADER */}

                    <div className="hm-interview-card-header">
                      <div className="hm-interview-icon">
                        <CalendarDays size={21} />
                      </div>

                      <span
                        className={`hm-interview-status ${
                          isCompleted
                            ? "completed"
                            : isCancelled
                            ? "cancelled"
                            : "scheduled"
                        }`}
                      >
                        {formatStatus(
                          interview.status
                        )}
                      </span>
                    </div>

                    {/* CANDIDATE */}

                    <div className="hm-interview-candidate">
                      <div className="hm-interview-avatar">
                        <User size={20} />
                      </div>

                      <div>
                        <h3>
                          {interview.candidateName ||
                            "Candidate"}
                        </h3>

                        <p>
                          {interview.position ||
                            "Position not specified"}
                        </p>
                      </div>
                    </div>

                    {/* DETAILS */}

                    <div className="hm-interview-details">

                      <div>
                        <CalendarDays size={16} />

                        <span>
                          {formatDate(
                            interview.interviewDateTime
                          )}
                        </span>
                      </div>

                      <div>
                        <Clock size={16} />

                        <span>
                          {formatTime(
                            interview.interviewDateTime
                          )}
                        </span>
                      </div>

                      <div>
                        {getModeIcon(
                          interview.interviewMode
                        )}

                        <span>
                          {interview.interviewMode ||
                            "Mode not specified"}
                        </span>
                      </div>

                      <div>
                        <User size={16} />

                        <span>
                          {interview.interviewerName
                            ? `Interviewer: ${interview.interviewerName}`
                            : "Interviewer not specified"}
                        </span>
                      </div>

                      <div>
                        <MapPin size={16} />

                        <span
                          style={{
                            wordBreak: "break-word",
                          }}
                        >
                          {interview.location ||
                            interview.meetingLink ||
                            "Location not specified"}
                        </span>
                      </div>

                    </div>

                    {/* INTERVIEW TYPE */}

                    {interview.interviewType && (
                      <div
                        style={{
                          marginTop: "12px",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        <strong>
                          Interview Type:
                        </strong>{" "}
                        {interview.interviewType}
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="hm-interview-actions">

                      <button
                        type="button"
                        className="hm-interview-view-button"
                        onClick={() =>
                          navigate(
                            `/hiring-manager/interviews/${interview.interviewId}`
                          )
                        }
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className="hm-interview-feedback-button"
                        disabled={!isCompleted}
                        onClick={() =>
                          navigate(
                            `/hiring-manager/interviews/${interview.interviewId}/feedback`
                          )
                        }
                      >
                        <MessageSquareText size={16} />

                        {isCompleted
                          ? "View Feedback"
                          : "Awaiting Interview"}
                      </button>

                    </div>

                  </div>
                );
              })}
            </section>
          )}

        </main>
      </div>
    </div>
  );
}

export default HiringManagerInterviews;