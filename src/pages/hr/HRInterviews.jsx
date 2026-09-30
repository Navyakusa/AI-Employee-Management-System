import React, { useEffect, useState } from "react";
import HRSidebar from "./HRSidebar";

import "./HRDashboard.css";
import "./HRJobs.css";
import "./HRInterviews.css";

// ============================================================
// BACKEND API
// ============================================================

const configuredBase =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const API_BASE = configuredBase.endsWith("/api")
  ? configuredBase
  : `${configuredBase}/api`;

// ============================================================
// AUTH HEADERS
// ============================================================

function getHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

// ============================================================
// SAFE RESPONSE PARSER
// ============================================================

async function parseResponse(response) {
  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        message: text,
      };
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

// ============================================================
// UNWRAP API RESPONSE
// ============================================================

function unwrapResponse(response) {
  if (
    response &&
    typeof response === "object" &&
    Object.prototype.hasOwnProperty.call(response, "success")
  ) {
    if (!response.success) {
      throw new Error(
        response.message || "Backend request failed."
      );
    }

    return response.data;
  }

  return response;
}

// ============================================================
// INTERVIEW TYPES
// ============================================================

const INTERVIEW_TYPES = [
  "HR",
  "TECHNICAL",
  "MANAGERIAL",
  "FINAL",
];

// ============================================================
// INTERVIEW MODES
// ============================================================

const INTERVIEW_MODES = [
  "ONLINE",
  "OFFLINE",
];

// ============================================================
// HR INTERVIEWS
// ============================================================

function HRInterviews() {
  // ==========================================================
  // ELIGIBLE APPLICATIONS
  // ==========================================================

  const [applications, setApplications] = useState([]);

  const [loadingApplications, setLoadingApplications] =
    useState(true);

  const [applicationsError, setApplicationsError] =
    useState("");

  // ==========================================================
  // AVAILABLE INTERVIEWERS
  // ==========================================================

  const [interviewers, setInterviewers] = useState([]);

  const [loadingInterviewers, setLoadingInterviewers] =
    useState(true);

  const [interviewersError, setInterviewersError] =
    useState("");

  // ==========================================================
  // SCHEDULED INTERVIEWS
  // ==========================================================

  const [interviews, setInterviews] = useState([]);

  const [loadingInterviews, setLoadingInterviews] =
    useState(true);

  const [interviewsError, setInterviewsError] =
    useState("");

  // ==========================================================
  // SCHEDULE FORM
  // ==========================================================

  const [form, setForm] = useState({
    candidateId: "",
    jobId: "",
    interviewType: "",
    interviewerId: "",
    date: "",
    time: "",
    interviewMode: "ONLINE",
    meetingLink: "",
    location: "",
    notes: "",
  });

  const [scheduleError, setScheduleError] =
    useState("");

  const [scheduling, setScheduling] =
    useState(false);

  // ==========================================================
  // RESCHEDULE FORM
  // ==========================================================

  const [rescheduleInterview, setRescheduleInterview] =
    useState(null);

  const [rescheduleForm, setRescheduleForm] =
    useState({
      date: "",
      time: "",
      interviewMode: "ONLINE",
      meetingLink: "",
      location: "",
      notes: "",
    });

  const [rescheduleError, setRescheduleError] =
    useState("");

  const [rescheduling, setRescheduling] =
    useState(false);

  // ==========================================================
  // LOAD ELIGIBLE APPLICATIONS
  // ==========================================================

  async function loadApplications() {
    try {
      setLoadingApplications(true);
      setApplicationsError("");

      const response = await fetch(
        `${API_BASE}/applications/eligible-for-interview`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const rawData = await parseResponse(response);

      console.log(
        "Eligible applications API response:",
        rawData
      );

      const data = unwrapResponse(rawData);

      const applicationData = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      console.log(
        "Eligible applications loaded:",
        applicationData
      );

      setApplications(applicationData);
    } catch (error) {
      console.error(
        "Failed to load eligible applications:",
        error
      );

      setApplicationsError(
        error.message ||
          "Failed to load eligible applications."
      );

      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }

  // ==========================================================
  // LOAD AVAILABLE INTERVIEWERS
  // ==========================================================

  async function loadInterviewers() {
    try {
      setLoadingInterviewers(true);
      setInterviewersError("");

      const response = await fetch(
        `${API_BASE}/interviews/available-interviewers`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const rawData = await parseResponse(response);

      console.log(
        "Available interviewers response:",
        rawData
      );

      const data = unwrapResponse(rawData);

      const interviewerData = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      console.log(
        "Available interviewers:",
        interviewerData
      );

      setInterviewers(interviewerData);
    } catch (error) {
      console.error(
        "Failed to load interviewers:",
        error
      );

      setInterviewersError(
        error.message ||
          "Failed to load available interviewers."
      );

      setInterviewers([]);
    } finally {
      setLoadingInterviewers(false);
    }
  }

  // ==========================================================
  // LOAD SCHEDULED INTERVIEWS
  // ==========================================================

  async function loadInterviews() {
    try {
      setLoadingInterviews(true);
      setInterviewsError("");

      const response = await fetch(
        `${API_BASE}/interviews/management`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const rawData = await parseResponse(response);

      console.log(
        "Interview management response:",
        rawData
      );

      const data = unwrapResponse(rawData);

      const interviewData = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setInterviews(interviewData);
    } catch (error) {
      console.error(
        "Failed to load interviews:",
        error
      );

      setInterviewsError(
        error.message ||
          "Failed to load interviews."
      );

      setInterviews([]);
    } finally {
      setLoadingInterviews(false);
    }
  }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadApplications();
    loadInterviewers();
    loadInterviews();
  }, []);

  // ==========================================================
  // SCHEDULE FORM CHANGE
  // ==========================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setScheduleError("");
  }

  // ==========================================================
  // WHEN CANDIDATE CHANGES
  // ==========================================================

  function handleCandidateChange(event) {
    const candidateId = event.target.value;

    setForm((previous) => ({
      ...previous,
      candidateId,
      jobId: "",
    }));

    setScheduleError("");
  }

  // ==========================================================
  // GET UNIQUE CANDIDATES
  // ==========================================================

  function getUniqueCandidates() {
    const map = new Map();

    applications.forEach((application) => {
      if (
        application.candidateId !== undefined &&
        application.candidateId !== null
      ) {
        const id = String(application.candidateId);

        if (!map.has(id)) {
          map.set(id, {
            id,
            name:
              application.candidateName ||
              `Candidate ${id}`,
          });
        }
      }
    });

    return Array.from(map.values());
  }

  // ==========================================================
  // GET CANDIDATE APPLICATIONS
  // ==========================================================

  function getCandidateApplications() {
    if (!form.candidateId) {
      return [];
    }

    return applications.filter(
      (application) =>
        String(application.candidateId) ===
        String(form.candidateId)
    );
  }

  // ==========================================================
  // GET SELECTED APPLICATION
  // ==========================================================

  function getSelectedApplication() {
    if (!form.candidateId || !form.jobId) {
      return null;
    }

    return applications.find(
      (application) =>
        String(application.candidateId) ===
          String(form.candidateId) &&
        String(application.jobId) ===
          String(form.jobId)
    );
  }

  // ==========================================================
  // SCHEDULE INTERVIEW
  // ==========================================================

  async function handleSchedule(event) {
    event.preventDefault();

    setScheduleError("");

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
      !form.candidateId ||
      !form.jobId ||
      !form.interviewType ||
      !form.interviewerId ||
      !form.date ||
      !form.time ||
      !form.interviewMode
    ) {
      setScheduleError(
        "Please fill in candidate, job, interview type, interviewer, date, time, and interview mode."
      );

      return;
    }

    // --------------------------------------------------------
    // FIND APPLICATION
    // --------------------------------------------------------

    const application =
      getSelectedApplication();

    if (!application) {
      setScheduleError(
        "No eligible application found for the selected candidate and job."
      );

      return;
    }

    // --------------------------------------------------------
    // APPLICATION ID
    // --------------------------------------------------------

    const applicationId =
      application.applicationId ??
      application.id;

    if (!applicationId) {
      setScheduleError(
        "Application ID is missing from the selected application."
      );

      return;
    }

    // --------------------------------------------------------
    // CREATE DATE TIME
    // --------------------------------------------------------

    let interviewDateTime;

    try {
      interviewDateTime = new Date(
        `${form.date}T${form.time}:00`
      ).toISOString();
    } catch {
      setScheduleError(
        "Invalid interview date or time."
      );

      return;
    }

    // --------------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------------

    const requestBody = {
      applicationId: Number(applicationId),

      interviewerId: Number(form.interviewerId),

      interviewDateTime,

      interviewMode:
        form.interviewMode,

      meetingLink:
        form.meetingLink || "",

      location:
        form.location || "",

      notes:
        form.notes || "",

      interviewType:
        form.interviewType,
    };

    console.log(
      "Scheduling interview request:",
      requestBody
    );

    // --------------------------------------------------------
    // SEND TO BACKEND
    // --------------------------------------------------------

    try {
      setScheduling(true);
      setScheduleError("");

      const response = await fetch(
        `${API_BASE}/interviews/schedule`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(requestBody),
        }
      );

      const rawData =
        await parseResponse(response);

      console.log(
        "Schedule interview response:",
        rawData
      );

      unwrapResponse(rawData);

      alert(
        rawData?.message ||
          "Interview scheduled successfully."
      );

      // ------------------------------------------------------
      // RESET FORM
      // ------------------------------------------------------

      setForm({
        candidateId: "",
        jobId: "",
        interviewType: "",
        interviewerId: "",
        date: "",
        time: "",
        interviewMode: "ONLINE",
        meetingLink: "",
        location: "",
        notes: "",
      });

      // ------------------------------------------------------
      // RELOAD DATA
      // ------------------------------------------------------

      await loadInterviews();
      await loadApplications();

    } catch (error) {
      console.error(
        "Schedule interview failed:",
        error
      );

      setScheduleError(
        error.message ||
          "Failed to schedule interview."
      );
    } finally {
      setScheduling(false);
    }
  }

  // ==========================================================
  // UPDATE INTERVIEW STATUS
  // ==========================================================

  async function updateStatus(
    interviewId,
    status
  ) {
    try {
      const response = await fetch(
        `${API_BASE}/interviews/${interviewId}/status?status=${encodeURIComponent(
          status
        )}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const rawData =
        await parseResponse(response);

      console.log(
        "Update interview status:",
        rawData
      );

      await loadInterviews();

    } catch (error) {
      console.error(
        "Status update failed:",
        error
      );

      alert(
        error.message ||
          "Failed to update interview status."
      );
    }
  }

  // ==========================================================
  // OPEN RESCHEDULE MODAL
  // ==========================================================

  function openRescheduleModal(interview) {
    const interviewDateTime =
      interview.interviewDateTime ||
      interview.dateTime ||
      interview.scheduledAt;

    let date = "";
    let time = "";

    if (interviewDateTime) {
      const parsedDate =
        new Date(interviewDateTime);

      if (!Number.isNaN(parsedDate.getTime())) {
        const year =
          parsedDate.getFullYear();

        const month = String(
          parsedDate.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          parsedDate.getDate()
        ).padStart(2, "0");

        const hours = String(
          parsedDate.getHours()
        ).padStart(2, "0");

        const minutes = String(
          parsedDate.getMinutes()
        ).padStart(2, "0");

        date = `${year}-${month}-${day}`;
        time = `${hours}:${minutes}`;
      }
    }

    setRescheduleInterview(interview);

    setRescheduleForm({
      date,
      time,
      interviewMode:
        interview.interviewMode ||
        "ONLINE",
      meetingLink:
        interview.meetingLink || "",
      location:
        interview.location || "",
      notes:
        interview.notes || "",
    });

    setRescheduleError("");
  }

  // ==========================================================
  // CLOSE RESCHEDULE MODAL
  // ==========================================================

  function closeRescheduleModal() {
    if (rescheduling) {
      return;
    }

    setRescheduleInterview(null);

    setRescheduleError("");

    setRescheduleForm({
      date: "",
      time: "",
      interviewMode: "ONLINE",
      meetingLink: "",
      location: "",
      notes: "",
    });
  }

  // ==========================================================
  // RESCHEDULE FORM CHANGE
  // ==========================================================

  function handleRescheduleChange(event) {
    const { name, value } = event.target;

    setRescheduleForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setRescheduleError("");
  }

  // ==========================================================
  // RESCHEDULE INTERVIEW
  // ==========================================================

  async function handleReschedule(event) {
    event.preventDefault();

    setRescheduleError("");

    if (!rescheduleInterview) {
      return;
    }

    if (
      !rescheduleForm.date ||
      !rescheduleForm.time ||
      !rescheduleForm.interviewMode
    ) {
      setRescheduleError(
        "Please select the new date, time, and interview mode."
      );

      return;
    }

    const interviewId =
      rescheduleInterview.interviewId ??
      rescheduleInterview.id;

    const applicationId =
      rescheduleInterview.applicationId;

    const interviewerId =
      rescheduleInterview.interviewerId;

    const interviewType =
      rescheduleInterview.interviewType;

    if (!interviewId) {
      setRescheduleError(
        "Interview ID is missing."
      );

      return;
    }

    if (!applicationId) {
      setRescheduleError(
        "Application ID is missing from this interview."
      );

      return;
    }

    if (!interviewerId) {
      setRescheduleError(
        "Interviewer ID is missing from this interview."
      );

      return;
    }

    if (!interviewType) {
      setRescheduleError(
        "Interview type is missing from this interview."
      );

      return;
    }

    let interviewDateTime;

    try {
      interviewDateTime = new Date(
        `${rescheduleForm.date}T${rescheduleForm.time}:00`
      ).toISOString();
    } catch {
      setRescheduleError(
        "Invalid reschedule date or time."
      );

      return;
    }

    const requestBody = {
      applicationId: Number(applicationId),

      interviewerId: Number(interviewerId),

      interviewDateTime,

      interviewMode:
        rescheduleForm.interviewMode,

      meetingLink:
        rescheduleForm.meetingLink || "",

      location:
        rescheduleForm.location || "",

      notes:
        rescheduleForm.notes || "",

      interviewType,
    };

    console.log(
      "Reschedule interview request:",
      {
        interviewId,
        requestBody,
      }
    );

    try {
      setRescheduling(true);
      setRescheduleError("");

      const response = await fetch(
        `${API_BASE}/interviews/${interviewId}/reschedule`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(requestBody),
        }
      );

      const rawData =
        await parseResponse(response);

      console.log(
        "Reschedule interview response:",
        rawData
      );

      unwrapResponse(rawData);

      alert(
        rawData?.message ||
          "Interview rescheduled successfully."
      );

      closeRescheduleModal();

      await loadInterviews();

    } catch (error) {
      console.error(
        "Reschedule interview failed:",
        error
      );

      setRescheduleError(
        error.message ||
          "Failed to reschedule interview."
      );
    } finally {
      setRescheduling(false);
    }
  }

  // ==========================================================
  // HANDLE STATUS CHANGE
  // ==========================================================

  function handleStatusChange(
    interview,
    selectedStatus
  ) {
    const interviewId =
      interview.interviewId ??
      interview.id;

    // --------------------------------------------------------
    // RESCHEDULED
    // --------------------------------------------------------

    if (selectedStatus === "RESCHEDULED") {
      openRescheduleModal(interview);

      return;
    }

    // --------------------------------------------------------
    // COMPLETED / CANCELLED / SCHEDULED
    // --------------------------------------------------------

    updateStatus(
      interviewId,
      selectedStatus
    );
  }

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  function formatDateTime(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="hr-dashboard">

      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <HRSidebar />

      {/* ====================================================
          MAIN
      ==================================================== */}

      <main className="hr-main">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="hr-header">
          <div>
            <h1>Interviews</h1>

            <p>
              Schedule and track candidate interviews.
            </p>
          </div>
        </header>

        {/* ====================================================
            APPLICATION ERROR
        ==================================================== */}

        {applicationsError && (
          <section className="jobs-panel">
            <div
              className="no-jobs"
              style={{
                color: "#dc2626",
              }}
            >
              {applicationsError}
            </div>
          </section>
        )}

        {/* ====================================================
            INTERVIEWER ERROR
        ==================================================== */}

        {interviewersError && (
          <section className="jobs-panel">
            <div
              className="no-jobs"
              style={{
                color: "#dc2626",
              }}
            >
              {interviewersError}
            </div>
          </section>
        )}

        {/* ====================================================
            SCHEDULE INTERVIEW
        ==================================================== */}

        <section className="jobs-panel">

          <div className="jobs-panel-header">
            <h2>
              Schedule an Interview
            </h2>
          </div>

          <form
            className="interview-form"
            onSubmit={handleSchedule}
          >

            <div className="interview-form-grid">

              {/* CANDIDATE */}

              <select
                name="candidateId"
                value={form.candidateId}
                onChange={handleCandidateChange}
                disabled={loadingApplications}
              >
                <option value="">
                  {loadingApplications
                    ? "Loading eligible candidates..."
                    : "Select candidate..."}
                </option>

                {getUniqueCandidates().map(
                  (candidate) => (
                    <option
                      key={candidate.id}
                      value={candidate.id}
                    >
                      {candidate.name}
                    </option>
                  )
                )}
              </select>

              {/* JOB */}

              <select
                name="jobId"
                value={form.jobId}
                onChange={handleChange}
                disabled={
                  !form.candidateId ||
                  loadingApplications
                }
              >
                <option value="">
                  {form.candidateId
                    ? "Select job..."
                    : "Select candidate first"}
                </option>

                {getCandidateApplications().map(
                  (application) => (
                    <option
                      key={
                        application.applicationId ??
                        `${application.candidateId}-${application.jobId}`
                      }
                      value={application.jobId}
                    >
                      {application.jobTitle ||
                        `Job ${application.jobId}`}
                    </option>
                  )
                )}
              </select>

              {/* INTERVIEW TYPE */}

              <select
                name="interviewType"
                value={form.interviewType}
                onChange={handleChange}
              >
                <option value="">
                  Interview type...
                </option>

                {INTERVIEW_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>

              {/* INTERVIEWER */}

              <select
                name="interviewerId"
                value={form.interviewerId}
                onChange={handleChange}
                disabled={loadingInterviewers}
              >
                <option value="">
                  {loadingInterviewers
                    ? "Loading interviewers..."
                    : "Select interviewer..."}
                </option>

                {interviewers.map(
                  (interviewer) => {

                    const interviewerId =
                      interviewer.userId ??
                      interviewer.id ??
                      interviewer.interviewerId;

                    const interviewerName =
                      interviewer.name ??
                      interviewer.fullName ??
                      interviewer.username ??
                      interviewer.email ??
                      `User ${interviewerId}`;

                    return (
                      <option
                        key={interviewerId}
                        value={interviewerId}
                      >
                        {interviewerName}
                        {interviewer.role
                          ? ` (${interviewer.role})`
                          : ""}
                      </option>
                    );
                  }
                )}
              </select>

              {/* DATE */}

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />

              {/* TIME */}

              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              />

              {/* INTERVIEW MODE */}

              <select
                name="interviewMode"
                value={form.interviewMode}
                onChange={handleChange}
              >
                {INTERVIEW_MODES.map(
                  (mode) => (
                    <option
                      key={mode}
                      value={mode}
                    >
                      {mode}
                    </option>
                  )
                )}
              </select>

              {/* MEETING LINK */}

              <input
                type="text"
                name="meetingLink"
                placeholder="Meeting link (optional)"
                value={form.meetingLink}
                onChange={handleChange}
                className="interview-form-wide"
              />

              {/* LOCATION */}

              <input
                type="text"
                name="location"
                placeholder="Location (optional)"
                value={form.location}
                onChange={handleChange}
                className="interview-form-wide"
              />

              {/* NOTES */}

              <textarea
                name="notes"
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={handleChange}
                className="interview-form-wide"
                rows="3"
              />

            </div>

            {/* ERROR */}

            {scheduleError && (
              <p className="interview-error">
                {scheduleError}
              </p>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="create-job-button"
              disabled={
                scheduling ||
                loadingApplications ||
                loadingInterviewers
              }
            >
              {scheduling
                ? "Scheduling..."
                : "Schedule Interview"}
            </button>

          </form>

        </section>

        {/* ====================================================
            SCHEDULED INTERVIEWS
        ==================================================== */}

        <section className="jobs-panel">

          <div className="jobs-panel-header">
            <h2>
              Scheduled Interviews
            </h2>
          </div>

          {/* LOADING */}

          {loadingInterviews && (
            <div className="no-jobs">
              Loading interviews...
            </div>
          )}

          {/* ERROR */}

          {!loadingInterviews &&
            interviewsError && (
              <div
                className="no-jobs"
                style={{
                  color: "#dc2626",
                }}
              >
                {interviewsError}
              </div>
            )}

          {/* EMPTY */}

          {!loadingInterviews &&
            !interviewsError &&
            interviews.length === 0 && (
              <div className="no-jobs">
                No interviews scheduled yet.
              </div>
            )}

          {/* TABLE */}

          {!loadingInterviews &&
            interviews.length > 0 && (
              <div className="job-table">

                <div className="job-row job-heading interview-row-grid">

                  <span>
                    Candidate
                  </span>

                  <span>
                    Job
                  </span>

                  <span>
                    Type
                  </span>

                  <span>
                    Interviewer
                  </span>

                  <span>
                    When
                  </span>

                  <span>
                    Status
                  </span>

                </div>

                {interviews.map(
                  (interview) => (

                    <div
                      className="job-row interview-row-grid"
                      key={
                        interview.interviewId ??
                        interview.id
                      }
                    >

                      {/* CANDIDATE */}

                      <span>

                        {interview.candidateName ||
                          `Candidate ${
                            interview.candidateId ||
                            ""
                          }`}

                        <small
                          style={{
                            display: "block",
                            opacity: 0.65,
                          }}
                        >
                          ID:{" "}
                          {interview.candidateId}
                        </small>

                        {interview.candidateEmail && (
                          <small
                            style={{
                              display: "block",
                              opacity: 0.65,
                            }}
                          >
                            {
                              interview.candidateEmail
                            }
                          </small>
                        )}

                      </span>

                      {/* JOB */}

                      <span>
                        {interview.position ||
                          interview.jobTitle ||
                          `Job ${
                            interview.jobId ||
                            ""
                          }`}
                      </span>

                      {/* TYPE */}

                      <span>
                        {interview.interviewType ||
                          "—"}
                      </span>

                      {/* INTERVIEWER */}

                      <span>
                        {interview.interviewerName ||
                          interview.interviewerId ||
                          "Not assigned"}
                      </span>

                      {/* WHEN */}

                      <span>
                        {formatDateTime(
                          interview.interviewDateTime ||
                          interview.dateTime ||
                          interview.scheduledAt
                        )}
                      </span>

                      {/* STATUS */}

                      <span>

                        <select
                          className="status-select"
                          value={
                            interview.status ||
                            "SCHEDULED"
                          }
                          onChange={(event) =>
                            handleStatusChange(
                              interview,
                              event.target.value
                            )
                          }
                        >

                          <option value="SCHEDULED">
                            Scheduled
                          </option>

                          <option value="COMPLETED">
                            Completed
                          </option>

                          <option value="CANCELLED">
                            Cancelled
                          </option>

                          <option value="RESCHEDULED">
                            Rescheduled
                          </option>

                        </select>

                      </span>

                    </div>

                  )
                )}

              </div>
            )}

        </section>

      </main>

      {/* ======================================================
          RESCHEDULE MODAL
      ====================================================== */}

      {rescheduleInterview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "550px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >

              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Reschedule Interview
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#6b7280",
                  }}
                >
                  Interview ID:{" "}
                  {rescheduleInterview.interviewId ??
                    rescheduleInterview.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRescheduleModal}
                disabled={rescheduling}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

            </div>

            {/* RESCHEDULE FORM */}

            <form
              onSubmit={handleReschedule}
            >

              {/* DATE */}

              <div
                style={{
                  marginBottom: "14px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  New Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={rescheduleForm.date}
                  onChange={
                    handleRescheduleChange
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* TIME */}

              <div
                style={{
                  marginBottom: "14px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  New Time
                </label>

                <input
                  type="time"
                  name="time"
                  value={rescheduleForm.time}
                  onChange={
                    handleRescheduleChange
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* INTERVIEW MODE */}

              <div
                style={{
                  marginBottom: "14px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  Interview Mode
                </label>

                <select
                  name="interviewMode"
                  value={
                    rescheduleForm.interviewMode
                  }
                  onChange={
                    handleRescheduleChange
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  {INTERVIEW_MODES.map(
                    (mode) => (
                      <option
                        key={mode}
                        value={mode}
                      >
                        {mode}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* MEETING LINK */}

              <div
                style={{
                  marginBottom: "14px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  Meeting Link
                </label>

                <input
                  type="text"
                  name="meetingLink"
                  value={
                    rescheduleForm.meetingLink
                  }
                  onChange={
                    handleRescheduleChange
                  }
                  placeholder="Meeting link"
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* LOCATION */}

              <div
                style={{
                  marginBottom: "14px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={
                    rescheduleForm.location
                  }
                  onChange={
                    handleRescheduleChange
                  }
                  placeholder="Location"
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* NOTES */}

              <div
                style={{
                  marginBottom: "14px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={
                    rescheduleForm.notes
                  }
                  onChange={
                    handleRescheduleChange
                  }
                  placeholder="Notes"
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* ERROR */}

              {rescheduleError && (
                <p
                  style={{
                    color: "#dc2626",
                    marginBottom: "14px",
                  }}
                >
                  {rescheduleError}
                </p>
              )}

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >

                <button
                  type="button"
                  onClick={
                    closeRescheduleModal
                  }
                  disabled={rescheduling}
                  style={{
                    padding:
                      "10px 18px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "6px",
                    background:
                      "#ffffff",
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={rescheduling}
                  className="create-job-button"
                >
                  {rescheduling
                    ? "Rescheduling..."
                    : "Save Reschedule"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default HRInterviews;