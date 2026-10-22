import React, { useEffect, useMemo, useState } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import apiClient from "../../services/apiClient";
import "./RecruiterInterviews.css";

const initialInterviewForm = {
  applicationId: "",
  position: "",
  interviewerId: "",
  date: "",
  time: "",
  type: "TECHNICAL",
  mode: "ONLINE",
  meetingLink: "",
  location: "",
  notes: "",
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

  // VIEW INTERVIEW MODAL
  const [selectedInterview, setSelectedInterview] = useState(null);

  const [newInterview, setNewInterview] = useState({
    ...initialInterviewForm,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // AVAILABLE INTERVIEWERS
  // =========================================================

  const [availableInterviewers, setAvailableInterviewers] =
    useState([]);

  const [interviewersLoading, setInterviewersLoading] =
    useState(false);

  const [interviewersError, setInterviewersError] =
    useState("");

  // =========================================================
  // APPLICATIONS / SHORTLISTED CANDIDATES
  // =========================================================

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] =
    useState(false);
  const [applicationsError, setApplicationsError] =
    useState("");

  // =========================================================
  // SCHEDULE INTERVIEW STATE
  // =========================================================

  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");

  // =========================================================
  // FETCH AVAILABLE INTERVIEWERS
  // =========================================================

  const fetchAvailableInterviewers = async () => {
    try {
      setInterviewersLoading(true);
      setInterviewersError("");
      setAvailableInterviewers([]);

      const response = await apiClient.get(
        "/interviews/available-interviewers"
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to load available interviewers."
        );
      }

      setAvailableInterviewers(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      console.error("Available interviewers error:", err);

      setAvailableInterviewers([]);

      setInterviewersError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load available interviewers."
      );
    } finally {
      setInterviewersLoading(false);
    }
  };

  // =========================================================
  // FETCH APPLICATIONS / SHORTLISTED CANDIDATES
  // =========================================================

  
  // Fetch AI-qualified candidates who are eligible for interviews
  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      setApplicationsError("");
      setApplications([]);

      const response = await apiClient.get(
        "/interviews/eligible-candidates"
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to load eligible candidates."
        );
      }

      setApplications(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      console.error("Eligible candidates error:", err);

      setApplications([]);

      setApplicationsError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load eligible candidates."
      );
    } finally {
      setApplicationsLoading(false);
    }
  };


  // =========================================================
  // OPEN SCHEDULE MODAL
  // =========================================================

  const handleOpenModal = () => {
    setNewInterview({
      ...initialInterviewForm,
    });

    setScheduleError("");
    setScheduleSuccess("");

    setShowModal(true);

    fetchApplications();
    fetchAvailableInterviewers();
  };

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

  // =========================================================
  // CANDIDATE SELECTION
  // =========================================================

  const handleCandidateChange = (e) => {
    const applicationId = e.target.value;

    const selectedApplication = applications.find(
      (application) =>
        String(application.applicationId) ===
        String(applicationId)
    );

    setNewInterview((previous) => ({
      ...previous,
      applicationId,
      position: selectedApplication?.jobTitle || "",
      location: selectedApplication?.location || "",
    }));
  };

  // =========================================================
  // CLOSE SCHEDULE MODAL
  // =========================================================

  const handleCloseModal = () => {
    if (scheduling) {
      return;
    }

    setShowModal(false);

    setScheduleError("");
    setScheduleSuccess("");

    setNewInterview({
      ...initialInterviewForm,
    });
  };

  // =========================================================
  // SCHEDULE INTERVIEW
  // =========================================================

  const handleScheduleInterview = async (e) => {
    e.preventDefault();

    setScheduleError("");
    setScheduleSuccess("");

    if (!newInterview.applicationId) {
      setScheduleError("Please select a candidate.");
      return;
    }

    if (!newInterview.interviewerId) {
      setScheduleError("Please select an interviewer.");
      return;
    }

    if (!newInterview.date) {
      setScheduleError("Please select an interview date.");
      return;
    }

    if (!newInterview.time) {
      setScheduleError("Please select an interview time.");
      return;
    }
    if (
  newInterview.mode === "ONLINE" &&
  !newInterview.meetingLink.trim()
) {
  setScheduleError(
    "Meeting link is required for an online interview."
  );
  return;
}

    try {
      setScheduling(true);

      const payload = {
        applicationId: Number(
          newInterview.applicationId
        ),

        interviewerId: Number(
          newInterview.interviewerId
        ),

        interviewDateTime: `${newInterview.date}T${newInterview.time}:00`,

        interviewMode: newInterview.mode,

        meetingLink:
          newInterview.meetingLink.trim(),

        location:
          newInterview.location.trim(),

        notes:
          newInterview.notes.trim(),

        interviewType: newInterview.type,
      };

      console.log(
        "Schedule interview payload:",
        payload
      );

      const response = await apiClient.post(
        "/interviews/schedule",
        payload
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to schedule interview."
        );
      }

      setScheduleSuccess(
        result?.message ||
          "Interview scheduled successfully."
      );

      await fetchInterviews();
      await fetchApplications();
      setNewInterview({
        ...initialInterviewForm,
      });

      setTimeout(() => {
        setShowModal(false);
        setScheduleSuccess("");
      }, 1000);
    } catch (err) {
      console.error(
        "Schedule interview error:",
        err
      );

      setScheduleError(
        err.response?.data?.message ||
          err.message ||
          "Failed to schedule interview."
      );
    } finally {
      setScheduling(false);
    }
  };

  // =========================================================
  // VIEW INTERVIEW DETAILS
  // =========================================================

  const handleView = (interview) => {
    setSelectedInterview(interview);
  };

  const handleCloseViewModal = () => {
    setSelectedInterview(null);
  };

  // =========================================================
  // CANCEL INTERVIEW
  // =========================================================

  const handleCancelInterview = async (interview) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel the interview for ${getCandidateName(
        interview
      )}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await apiClient.put(
        `/interviews/${interview.interviewId}/status`,
        null,
        {
          params: {
            status: "CANCELLED",
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to cancel interview."
        );
      }

      window.alert(
        "Interview cancelled successfully."
      );

      await fetchInterviews();
    } catch (err) {
      console.error(
        "Cancel interview error:",
        err
      );

      window.alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to cancel interview."
      );
    }
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
      meetingUrl = new URL(
        interview.meetingLink
      );
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

  // =========================================================
  // VIEW MODAL FIELD STYLES
  // =========================================================

  const detailGridStyle = {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
  };

  const detailLabelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#667085",
    marginBottom: "6px",
  };

  const detailValueStyle = {
    margin: 0,
    fontSize: "14px",
    fontWeight: 500,
    color: "#182230",
    overflowWrap: "anywhere",
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
            onClick={handleOpenModal}
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
                                    onClick={() =>
                                      handleCancelInterview(
                                        interview
                                      )
                                    }
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
                disabled={scheduling}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleScheduleInterview}>

              {/* =================================================
                  CANDIDATE AND POSITION
              ================================================= */}

              <div className="interview-form-row">
                <div className="interview-form-group">
                  <label>
                    Candidate <span>*</span>
                  </label>

                  <select
                    name="applicationId"
                    value={newInterview.applicationId}
                    onChange={handleCandidateChange}
                    disabled={
                      applicationsLoading ||
                      scheduling
                    }
                    required
                  >
                    
<option value="">
  {applicationsLoading
    ? "Loading qualified candidates..."
    : "Select a qualified candidate"}
</option>

{applications.map((candidate) => (
  <option
    key={candidate.applicationId}
    value={candidate.applicationId}
  >
    {candidate.candidateName} — {candidate.jobTitle}
    {" | Score: "}
    {candidate.screeningScore ?? "N/A"}%
  </option>
))}

                  </select>

                  {applicationsError && (
                    <p
                      role="alert"
                      style={{
                        marginTop: "6px",
                        fontSize: "12px",
                        color: "#d92d20",
                      }}
                    >
                      {applicationsError}
                    </p>
                  )}

                  {!applicationsLoading &&
                    !applicationsError &&
                    applications.length === 0 && (
                      <p
                        style={{
                          marginTop: "6px",
                          fontSize: "12px",
                          color: "#667085",
                        }}
                      >
                        No shortlisted candidates
                        are available.
                      </p>
                    )}
                </div>

                <div className="interview-form-group">
                  <label>
                    Position <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="position"
                    value={newInterview.position}
                    placeholder="Job position"
                    readOnly
                  />
                </div>
              </div>

              {/* =================================================
                  INTERVIEWER
              ================================================= */}

              <div className="interview-form-group">
                <label>
                  Interviewer <span>*</span>
                </label>

                <select
                  name="interviewerId"
                  value={newInterview.interviewerId}
                  onChange={handleInputChange}
                  disabled={
                    interviewersLoading ||
                    scheduling
                  }
                  required
                >
                  <option value="">
                    {interviewersLoading
                      ? "Loading interviewers..."
                      : "Select Interviewer"}
                  </option>

                  {availableInterviewers.map(
                    (interviewer) => (
                      <option
                        key={interviewer.userId}
                        value={interviewer.userId}
                      >
                        {interviewer.name}
                      </option>
                    )
                  )}
                </select>

                {interviewersError && (
                  <p
                    role="alert"
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "#d92d20",
                    }}
                  >
                    {interviewersError}
                  </p>
                )}

                {!interviewersLoading &&
                  !interviewersError &&
                  availableInterviewers.length === 0 && (
                    <p
                      style={{
                        marginTop: "6px",
                        fontSize: "12px",
                        color: "#667085",
                      }}
                    >
                      No interviewers are currently
                      available.
                    </p>
                  )}
              </div>

              {/* =================================================
                  DATE AND TIME
              ================================================= */}

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
                    disabled={scheduling}
                    required
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
                    disabled={scheduling}
                    required
                  />
                </div>
              </div>

              {/* =================================================
                  TYPE AND MODE
              ================================================= */}

              <div className="interview-form-row">
                <div className="interview-form-group">
                  <label>
                    Interview Type
                  </label>

                  <select
                    name="type"
                    value={newInterview.type}
                    onChange={handleInputChange}
                    disabled={scheduling}
                  >
                    <option value="TECHNICAL">
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
                    disabled={scheduling}
                  >
                    <option value="ONLINE">
                      Online
                    </option>

                    <option value="IN_OFFICE">
                      In Office
                    </option>
                  </select>
                </div>
              </div>

              {/* =================================================
                  LOCATION AND MEETING LINK
              ================================================= */}

              <div className="interview-form-row">
                <div className="interview-form-group">
                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={newInterview.location}
                    onChange={handleInputChange}
                    placeholder="Interview location"
                    disabled={scheduling}
                  />
                </div>

                <div className="interview-form-group">
  <label>
    Meeting Link
    {newInterview.mode === "ONLINE" && <span> *</span>}
  </label>

  <input
    type="url"
    name="meetingLink"
    value={newInterview.meetingLink}
    onChange={handleInputChange}
    placeholder="https://meet.google.com/..."
    disabled={scheduling}
    required={newInterview.mode === "ONLINE"}
  />
</div>
              </div>

              {/* =================================================
                  NOTES
              ================================================= */}

              <div className="interview-form-group">
                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={newInterview.notes}
                  onChange={handleInputChange}
                  placeholder="Add interview notes"
                  rows="3"
                  disabled={scheduling}
                />
              </div>

              {/* =================================================
                  SCHEDULE ERROR / SUCCESS
              ================================================= */}

              {scheduleError && (
                <p
                  role="alert"
                  style={{
                    margin: "0 0 16px",
                    fontSize: "13px",
                    color: "#d92d20",
                  }}
                >
                  {scheduleError}
                </p>
              )}

              {scheduleSuccess && (
                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: "13px",
                    color: "#027a48",
                  }}
                >
                  {scheduleSuccess}
                </p>
              )}

              <div className="interview-modal-actions">
                <button
                  type="button"
                  className="interview-cancel-btn"
                  onClick={handleCloseModal}
                  disabled={scheduling}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="interview-save-btn"
                  disabled={
                    scheduling ||
                    applicationsLoading ||
                    interviewersLoading
                  }
                >
                  {scheduling
                    ? "Scheduling..."
                    : "Schedule Interview"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW INTERVIEW DETAILS MODAL
      ===================================================== */}

      {selectedInterview && (
        <div
          className="interview-modal-overlay"
          onClick={handleCloseViewModal}
        >
          <div
            className="interview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-interview-title"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxWidth: "680px",
              width: "calc(100% - 32px)",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div className="interview-modal-header">
              <div>
                <h2 id="view-interview-title">
                  Interview Details
                </h2>

                <p>
                  View the selected candidate interview.
                </p>
              </div>

              <button
                type="button"
                className="interview-modal-close"
                onClick={handleCloseViewModal}
                aria-label="Close interview details"
              >
                ×
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "24px",
                  paddingBottom: "18px",
                  borderBottom:
                    "1px solid #eaecf0",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontSize: "18px",
                      color: "#182230",
                    }}
                  >
                    {getCandidateName(
                      selectedInterview
                    )}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#667085",
                      fontSize: "13px",
                    }}
                  >
                    {getPosition(
                      selectedInterview
                    )}
                  </p>
                </div>

                <span
                  className={`interview-status ${(
                    selectedInterview.status || ""
                  )
                    .toLowerCase()
                    .replaceAll("_", "-")}`}
                >
                  {formatValue(
                    selectedInterview.status
                  )}
                </span>
              </div>

              <div style={detailGridStyle}>
                <div>
                  <span style={detailLabelStyle}>
                    Interview ID
                  </span>

                  <p style={detailValueStyle}>
                    {selectedInterview.interviewId ??
                      "—"}
                  </p>
                </div>

                <div>
                  <span style={detailLabelStyle}>
                    Application ID
                  </span>

                  <p style={detailValueStyle}>
                    {selectedInterview.applicationId ??
                      "—"}
                  </p>
                </div>

                <div>
                  <span style={detailLabelStyle}>
                    Candidate Email
                  </span>

                  <p style={detailValueStyle}>
                    {selectedInterview.candidateEmail ||
                      "—"}
                  </p>
                </div>

                <div>
                  <span style={detailLabelStyle}>
                    Interviewer
                  </span>

                  <p style={detailValueStyle}>
                    {getInterviewerName(
                      selectedInterview
                    )}
                  </p>
                </div>

                <div>
                  <span style={detailLabelStyle}>
                    Interview Date
                  </span>

                  <p style={detailValueStyle}>
                    {formatInterviewDate(
                      selectedInterview.interviewDateTime
                    )}
                  </p>
                </div>

                <div>
                  <span style={detailLabelStyle}>
                    Interview Time
                  </span>

                  <p style={detailValueStyle}>
                    {formatInterviewTime(
                      selectedInterview.interviewDateTime
                    )}
                  </p>
                </div>

                <div>
                  <span style={detailLabelStyle}>
                    Interview Type
                  </span>

                  <p style={detailValueStyle}>
                    {formatValue(
                      selectedInterview.interviewType
                    )}
                  </p>
                </div>

                <div>
                  <span style={detailLabelStyle}>
                    Interview Mode
                  </span>

                  <p style={detailValueStyle}>
                    {formatValue(
                      selectedInterview.interviewMode
                    )}
                  </p>
                </div>

                <div>
                  <span style={detailLabelStyle}>
                    Location
                  </span>

                  <p style={detailValueStyle}>
                    {selectedInterview.location ||
                      "—"}
                  </p>
                </div>

                <div>
                  <span style={detailLabelStyle}>
                    Meeting Link
                  </span>

                  {selectedInterview.meetingLink ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleJoin(
                          selectedInterview
                        )
                      }
                      style={{
                        display: "block",
                        padding: 0,
                        border: 0,
                        background: "none",
                        color: "#344eaa",
                        fontSize: "13px",
                        textAlign: "left",
                        cursor: "pointer",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {
                        selectedInterview.meetingLink
                      }
                    </button>
                  ) : (
                    <p style={detailValueStyle}>
                      —
                    </p>
                  )}
                </div>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "18px",
                  borderTop:
                    "1px solid #eaecf0",
                }}
              >
                <span style={detailLabelStyle}>
                  Interview Notes
                </span>

                <p
                  style={{
                    ...detailValueStyle,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedInterview.notes || "—"}
                </p>
              </div>
            </div>

            <div
              className="interview-modal-actions"
              style={{
                padding: "16px 24px",
                borderTop:
                  "1px solid #eaecf0",
              }}
            >
              <button
                type="button"
                className="interview-cancel-btn"
                onClick={handleCloseViewModal}
              >
                Close
              </button>

              {selectedInterview.status ===
                "SCHEDULED" &&
                selectedInterview.meetingLink && (
                  <button
                    type="button"
                    className="interview-save-btn"
                    onClick={() =>
                      handleJoin(
                        selectedInterview
                      )
                    }
                  >
                    Join Interview
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterInterviews;