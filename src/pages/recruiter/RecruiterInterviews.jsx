
import React, { useEffect, useMemo, useState } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import apiClient from "../../services/apiClient";
import "./RecruiterInterviews.css";

const initialInterviewForm = {
  candidate: "",
  position: "",
  interviewer: "",
  date: "",
  time: "",
  type: "Technical",
  mode: "Online",
};

// =========================================================
// FORMAT BACKEND VALUES
// =========================================================

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getCandidateName = (interview) => {
  return (
    interview.candidateName ||
    (interview.candidateId != null
      ? `Candidate #${interview.candidateId}`
      : "Unknown Candidate")
  );
};

const getInterviewerName = (interview) => {
  return (
    interview.interviewerName ||
    (interview.interviewerId != null
      ? `Interviewer #${interview.interviewerId}`
      : "—")
  );
};

const getPosition = (interview) => {
  return (
    interview.position ||
    (interview.jobId != null
      ? `Job #${interview.jobId}`
      : "—")
  );
};

// =========================================================
// DATE AND TIME HELPERS
// =========================================================

const parseInterviewDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatInterviewDate = (value) => {
  const date = parseInterviewDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatInterviewTime = (value) => {
  const date = parseInterviewDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getUpcomingDateParts = (value) => {
  const date = parseInterviewDate(value);

  if (!date) {
    return {
      day: "—",
      month: "—",
    };
  }

  return {
    day: date.toLocaleDateString("en-IN", {
      day: "2-digit",
    }),
    month: date.toLocaleDateString("en-IN", {
      month: "short",
    }),
  };
};

// =========================================================
// RECRUITER INTERVIEWS
// =========================================================

function RecruiterInterviews() {
  const [interviews, setInterviews] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [newInterview, setNewInterview] = useState({
    ...initialInterviewForm,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH REAL INTERVIEWS FROM SPRING BOOT
  // =========================================================

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/interviews/management"
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to load interview management data."
        );
      }

      setInterviews(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      console.error("Interview management error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to view interview management data."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load interviews."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // =========================================================
  // SEARCH AND STATUS FILTER
  // =========================================================

  const filteredInterviews = useMemo(() => {
    const text = search.trim().toLowerCase();

    return interviews.filter((interview) => {
      const searchableText = [
        getCandidateName(interview),
        interview.candidateEmail,
        getPosition(interview),
        getInterviewerName(interview),
        interview.interviewType,
        interview.interviewMode,
        interview.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !text || searchableText.includes(text);

      const matchesStatus =
        statusFilter === "All" ||
        interview.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [interviews, search, statusFilter]);

  // =========================================================
  // SUMMARY COUNTS
  // =========================================================

  const totalInterviews = interviews.length;

  const scheduledInterviews = interviews.filter(
    (interview) => interview.status === "SCHEDULED"
  ).length;

  const completedInterviews = interviews.filter(
    (interview) => interview.status === "COMPLETED"
  ).length;

  const cancelledInterviews = interviews.filter(
    (interview) => interview.status === "CANCELLED"
  ).length;

  // =========================================================
  // UPCOMING INTERVIEWS
  // =========================================================

  const upcomingInterviews = useMemo(() => {
    const now = new Date();

    return interviews
      .filter((interview) => {
        if (interview.status !== "SCHEDULED") {
          return false;
        }

        const interviewDate = parseInterviewDate(
          interview.interviewDateTime
        );

        return interviewDate && interviewDate > now;
      })
      .sort((first, second) => {
        return (
          parseInterviewDate(
            first.interviewDateTime
          ).getTime() -
          parseInterviewDate(
            second.interviewDateTime
          ).getTime()
        );
      })
      .slice(0, 3);
  }, [interviews]);

  // =========================================================
  // SCHEDULE FORM INPUTS
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewInterview((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false);

    setNewInterview({
      ...initialInterviewForm,
    });
  };

  // =========================================================
  // VIEW INTERVIEW DETAILS
  // =========================================================

  const handleView = (interview) => {
    const details = [
      `Interview ID: ${interview.interviewId}`,
      `Application ID: ${interview.applicationId ?? "—"}`,
      `Candidate: ${getCandidateName(interview)}`,
      `Candidate Email: ${interview.candidateEmail || "—"}`,
      `Position: ${getPosition(interview)}`,
      `Interviewer: ${getInterviewerName(interview)}`,
      `Date: ${formatInterviewDate(
        interview.interviewDateTime
      )}`,
      `Time: ${formatInterviewTime(
        interview.interviewDateTime
      )}`,
      `Type: ${formatValue(interview.interviewType)}`,
      `Mode: ${formatValue(interview.interviewMode)}`,
      `Status: ${formatValue(interview.status)}`,
      `Meeting Link: ${interview.meetingLink || "—"}`,
      `Location: ${interview.location || "—"}`,
      `Notes: ${interview.notes || "—"}`,
    ];

    window.alert(details.join("\n"));
  };

  // =========================================================
  // JOIN INTERVIEW
  // =========================================================

  const handleJoin = (interview) => {
    if (!interview.meetingLink) {
      window.alert(
        "No meeting link is available for this interview."
      );
      return;
    }

    let meetingUrl;

    try {
      meetingUrl = new URL(interview.meetingLink);
    } catch {
      window.alert(
        "The meeting link for this interview is invalid."
      );
      return;
    }

    if (
      meetingUrl.protocol !== "https:" &&
      meetingUrl.protocol !== "http:"
    ) {
      window.alert(
        "The meeting link must use HTTP or HTTPS."
      );
      return;
    }

    window.open(
      meetingUrl.href,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="recruiter-interviews-page">
      <RecruiterSidebar />
      <RecruiterTopbar />

      <main className="recruiter-interviews-main">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="interviews-header">
          <div>
            <h1>Interviews</h1>

            <p>
              Schedule and manage candidate interviews
            </p>
          </div>

          <button
            className="schedule-interview-btn"
            onClick={() => setShowModal(true)}
          >
            <span>+</span>
            Schedule Interview
          </button>
        </div>

        {/* =====================================================
            API ERROR
        ===================================================== */}

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fff1f1",
              color: "#d92d20",
              border: "1px solid #fecdca",
            }}
          >
            {error}
          </div>
        )}

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <section className="interviews-summary">
          <div className="interview-summary-card">
            <div className="interview-summary-icon">
              ◷
            </div>

            <div>
              <span>Total Interviews</span>
              <strong>{totalInterviews}</strong>
            </div>
          </div>

          <div className="interview-summary-card">
            <div className="interview-summary-icon">
              ✓
            </div>

            <div>
              <span>Scheduled</span>
              <strong>{scheduledInterviews}</strong>
            </div>
          </div>

          <div className="interview-summary-card">
            <div className="interview-summary-icon">
              ●
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedInterviews}</strong>
            </div>
          </div>

          <div className="interview-summary-card">
            <div className="interview-summary-icon">
              !
            </div>

            <div>
              <span>Cancelled</span>
              <strong>{cancelledInterviews}</strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            UPCOMING INTERVIEWS
        ===================================================== */}

        <section className="upcoming-interviews-card">
          <div className="upcoming-title">
            <div className="upcoming-icon">
              ◷
            </div>

            <div>
              <h3>Upcoming Interviews</h3>

              <p>
                Candidate interviews scheduled for the
                upcoming days
              </p>
            </div>
          </div>

          <div className="upcoming-list">
            {loading ? (
              <div className="no-upcoming">
                Loading upcoming interviews...
              </div>
            ) : (
              <>
                {upcomingInterviews.map((interview) => {
                  const dateParts =
                    getUpcomingDateParts(
                      interview.interviewDateTime
                    );

                  return (
                    <div
                      className="upcoming-item"
                      key={interview.interviewId}
                    >
                      <div className="upcoming-date">
                        <strong>
                          {dateParts.day}
                        </strong>

                        <span>
                          {dateParts.month}
                        </span>
                      </div>

                      <div className="upcoming-details">
                        <strong>
                          {getCandidateName(interview)}
                        </strong>

                        <span>
                          {getPosition(interview)}
                        </span>
                      </div>

                      <div className="upcoming-time">
                        <strong>
                          {formatInterviewTime(
                            interview.interviewDateTime
                          )}
                        </strong>

                        <span>
                          {formatValue(
                            interview.interviewMode
                          )}
                        </span>
                      </div>

                      <button
                        className="upcoming-view-btn"
                        onClick={() =>
                          handleView(interview)
                        }
                      >
                        View
                      </button>
                    </div>
                  );
                })}

                {upcomingInterviews.length === 0 && (
                  <div className="no-upcoming">
                    No upcoming interviews.
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* =====================================================
            INTERVIEWS TABLE
        ===================================================== */}

        <section className="interviews-table-card">
          <div className="interviews-toolbar">
            <div className="interviews-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search candidate or position..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <select
              className="interviews-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="SCHEDULED">
                Scheduled
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          </div>

          <div className="interviews-table-wrapper">
            <table className="interviews-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Interviewer</th>
                  <th>Date &amp; Time</th>
                  <th>Type</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="interviews-empty"
                    >
                      <div>
                        <span>◷</span>

                        <h3>
                          Loading interviews...
                        </h3>
                      </div>
                    </td>
                  </tr>
                ) : filteredInterviews.length > 0 ? (
                  filteredInterviews.map(
                    (interview) => {
                      const candidateName =
                        getCandidateName(interview);

                      const status =
                        interview.status || "";

                      const interviewType =
                        interview.interviewType || "";

                      return (
                        <tr
                          key={interview.interviewId}
                        >
                          <td>
                            <div className="interview-candidate">
                              <div className="interview-avatar">
                                {candidateName.charAt(0)}
                              </div>

                              <div>
                                <strong>
                                  {candidateName}
                                </strong>

                                <small>
                                  {interview.candidateEmail ||
                                    "—"}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="interview-position">
                              {getPosition(interview)}
                            </span>
                          </td>

                          <td>
                            {getInterviewerName(
                              interview
                            )}
                          </td>

                          <td>
                            <div className="interview-datetime">
                              <strong>
                                {formatInterviewDate(
                                  interview.interviewDateTime
                                )}
                              </strong>

                              <span>
                                {formatInterviewTime(
                                  interview.interviewDateTime
                                )}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`interview-type ${interviewType.toLowerCase()}`}
                            >
                              {formatValue(
                                interview.interviewType
                              )}
                            </span>
                          </td>

                          <td>
                            <span className="interview-mode">
                              {formatValue(
                                interview.interviewMode
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`interview-status ${status
                                .toLowerCase()
                                .replaceAll("_", "-")}`}
                            >
                              {formatValue(status)}
                            </span>
                          </td>

                          <td>
                            <div className="interview-actions">
                              <button
                                className="interview-view-btn"
                                onClick={() =>
                                  handleView(interview)
                                }
                              >
                                View
                              </button>

                              {status === "SCHEDULED" && (
                                <>
                                  {interview.meetingLink && (
                                    <button
                                      className="join-interview-btn"
                                      onClick={() =>
                                        handleJoin(
                                          interview
                                        )
                                      }
                                    >
                                      Join
                                    </button>
                                  )}

                                  <button
                                    className="cancel-interview-btn"
                                    disabled
                                    title="Cancellation integration will be added next."
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="interviews-empty"
                    >
                      <div>
                        <span>◷</span>

                        <h3>
                          No interviews found
                        </h3>

                        <p>
                          Try changing your search or
                          status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="interviews-footer">
            Showing{" "}
            <strong>
              {filteredInterviews.length}
            </strong>{" "}
            of{" "}
            <strong>
              {interviews.length}
            </strong>{" "}
            interviews
          </div>
        </section>
      </main>

      {/* =====================================================
          SCHEDULE INTERVIEW MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="interview-modal-overlay"
          onClick={handleCloseModal}
        >
          <div
            className="interview-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="interview-modal-header">
              <div>
                <h2>
                  Schedule Interview
                </h2>

                <p>
                  Create a new candidate interview.
                </p>
              </div>

              <button
                type="button"
                className="interview-modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="interview-form-row">
                <div className="interview-form-group">
                  <label>
                    Candidate <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="candidate"
                    value={newInterview.candidate}
                    onChange={handleInputChange}
                    placeholder="Candidate name"
                  />
                </div>

                <div className="interview-form-group">
                  <label>
                    Position <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="position"
                    value={newInterview.position}
                    onChange={handleInputChange}
                    placeholder="Job position"
                  />
                </div>
              </div>

              <div className="interview-form-group">
                <label>
                  Interviewer
                </label>

                <input
                  type="text"
                  name="interviewer"
                  value={newInterview.interviewer}
                  onChange={handleInputChange}
                  placeholder="Interviewer name or team"
                />
              </div>

              <div className="interview-form-row">
                <div className="interview-form-group">
                  <label>
                    Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={newInterview.date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="interview-form-group">
                  <label>
                    Time <span>*</span>
                  </label>

                  <input
                    type="time"
                    name="time"
                    value={newInterview.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="interview-form-row">
                <div className="interview-form-group">
                  <label>
                    Interview Type
                  </label>

                  <select
                    name="type"
                    value={newInterview.type}
                    onChange={handleInputChange}
                  >
                    <option value="Technical">
                      Technical
                    </option>

                    <option value="HR">
                      HR
                    </option>
                  </select>
                </div>

                <div className="interview-form-group">
                  <label>
                    Interview Mode
                  </label>

                  <select
                    name="mode"
                    value={newInterview.mode}
                    onChange={handleInputChange}
                  >
                    <option value="Online">
                      Online
                    </option>

                    <option value="In Office">
                      In Office
                    </option>
                  </select>
                </div>
              </div>

              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: "13px",
                  color: "#667085",
                }}
              >
                Scheduling will be enabled after
                connecting real applications and
                interviewer accounts.
              </p>

              <div className="interview-modal-actions">
                <button
                  type="button"
                  className="interview-cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="interview-save-btn"
                  disabled
                  title="Scheduling integration will be added next."
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterInterviews;