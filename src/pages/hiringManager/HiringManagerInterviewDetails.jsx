import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Video,
  MapPin,
  User,
  BriefcaseBusiness,
  Mail,
  MessageSquareText,
  ExternalLink,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import { getInterviewDetails } from "./HiringManagerApi";

import "./HiringManagerInterviewDetails.css";
import "./HiringManagerLayout.css";

function HiringManagerInterviewDetails() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getInterviewDetails(interviewId);

        console.log("Interview details:", response);

        if (response?.success && response?.data) {
          setInterview(response.data);
        } else {
          setError(
            response?.message ||
              "Interview details not found."
          );
        }
      } catch (err) {
        console.error(
          "Failed to fetch interview details:",
          err
        );

        setError(
          err.message ||
            "Failed to load interview details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchInterviewDetails();
    }
  }, [interviewId]);

  /*
  ========================================================
  HELPERS
  ========================================================
  */

  const formatStatus = (status) => {
    if (!status) {
      return "Not specified";
    }

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return {
        date: "Not specified",
        time: "Not specified",
      };
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return {
        date: "Not specified",
        time: "Not specified",
      };
    }

    return {
      date: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),

      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  /*
  ========================================================
  LOADING
  ========================================================
  */

  if (loading) {
    return (
      <div className="hiring-manager-layout">

        <HiringManagerSidebar />

        <div className="hiring-manager-main">

          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">

            <div
              style={{
                padding: "60px",
                textAlign: "center",
              }}
            >
              <h2>
                Loading interview details...
              </h2>
            </div>

          </main>

        </div>

      </div>
    );
  }

  /*
  ========================================================
  ERROR
  ========================================================
  */

  if (error || !interview) {
    return (
      <div className="hiring-manager-layout">

        <HiringManagerSidebar />

        <div className="hiring-manager-main">

          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">

            <div
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              {error ||
                "Interview details not found."}
            </div>

            <button
              type="button"
              className="hm-interview-join-button"
              onClick={() =>
                navigate(
                  "/hiring-manager/interviews"
                )
              }
            >
              <ArrowLeft size={16} />
              Back to Interviews
            </button>

          </main>

        </div>

      </div>
    );
  }

  /*
  ========================================================
  REAL BACKEND DATA
  ========================================================
  */

  const candidateName =
    interview.candidateName ||
    "Not specified";

  const candidateEmail =
    interview.candidateEmail ||
    "Not specified";

  const position =
    interview.position ||
    "Not specified";

  const status =
    interview.status || "NOT SPECIFIED";

  const interviewStatus =
    formatStatus(status);

  const dateTime =
    formatDateTime(
      interview.interviewDateTime
    );

  const interviewMode =
    interview.interviewMode ||
    "Not specified";

  const interviewType =
    interview.interviewType ||
    "Not specified";

  const interviewerName =
    interview.interviewerName ||
    "Not specified";

  const location =
    interview.location ||
    "Not specified";

  const notes =
    interview.notes ||
    "No interview notes available.";

  const meetingLink =
    interview.meetingLink ||
    null;

  const initials = candidateName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isCompleted =
    String(status).toUpperCase() ===
    "COMPLETED";

  return (
    <div className="hiring-manager-layout">

      <HiringManagerSidebar />

      <div className="hiring-manager-main">

        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* HEADER */}

          <div className="hiring-manager-dashboard-header">

            <p className="hiring-manager-label">
              INTERVIEW DETAILS
            </p>

            <h1>
              Interview Details
            </h1>

            <p>
              Monitor candidate interview
              information, assigned interviewer
              and interview status.
            </p>

          </div>

          {/* INTERVIEW CARD */}

          <section className="hm-interview-details-page-card">

            {/* TOP */}

            <div className="hm-interview-details-top">

              <div className="hm-interview-details-candidate">

                <div className="hm-interview-details-avatar">
                  {initials || "CA"}
                </div>

                <div>

                  <h2>
                    {candidateName}
                  </h2>

                  <p>
                    {position}
                  </p>

                </div>

              </div>

              <span
                className={`hm-interview-status ${
                  isCompleted
                    ? "completed"
                    : "scheduled"
                }`}
              >
                {interviewStatus}
              </span>

            </div>

            {/* CANDIDATE INFORMATION */}

            <div className="hm-interview-details-section">

              <h3>
                <User size={18} />
                Candidate Information
              </h3>

              <div className="hm-interview-info-grid">

                <div className="hm-interview-info-item">

                  <Mail size={18} />

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {candidateEmail}
                    </strong>

                  </div>

                </div>

                <div className="hm-interview-info-item">

                  <BriefcaseBusiness
                    size={18}
                  />

                  <div>

                    <span>
                      Applied Position
                    </span>

                    <strong>
                      {position}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

            {/* INTERVIEW SCHEDULE */}

            <div className="hm-interview-details-section">

              <h3>
                <CalendarDays size={18} />
                Interview Schedule
              </h3>

              <div className="hm-interview-info-grid">

                <div className="hm-interview-info-item">

                  <CalendarDays size={18} />

                  <div>

                    <span>
                      Date
                    </span>

                    <strong>
                      {dateTime.date}
                    </strong>

                  </div>

                </div>

                <div className="hm-interview-info-item">

                  <Clock size={18} />

                  <div>

                    <span>
                      Time
                    </span>

                    <strong>
                      {dateTime.time}
                    </strong>

                  </div>

                </div>

                <div className="hm-interview-info-item">

                  <Video size={18} />

                  <div>

                    <span>
                      Interview Mode
                    </span>

                    <strong>
                      {interviewMode}
                    </strong>

                  </div>

                </div>

                <div className="hm-interview-info-item">

                  <MapPin size={18} />

                  <div>

                    <span>
                      Location
                    </span>

                    <strong>
                      {location}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

            {/* INTERVIEW TYPE */}

            <div className="hm-interview-details-section">

              <h3>
                <Video size={18} />
                Interview Type
              </h3>

              <div className="hm-interview-panel-box">

                <div className="hm-interview-panel-icon">
                  <Video size={20} />
                </div>

                <div>

                  <span>
                    Interview Type
                  </span>

                  <strong>
                    {interviewType}
                  </strong>

                </div>

              </div>

            </div>

            {/* INTERVIEWER */}

            <div className="hm-interview-details-section">

              <h3>
                <User size={18} />
                Interview Panel
              </h3>

              <div className="hm-interview-panel-box">

                <div className="hm-interview-panel-icon">
                  <User size={20} />
                </div>

                <div>

                  <span>
                    Assigned Interviewer
                  </span>

                  <strong>
                    {interviewerName}
                  </strong>

                </div>

              </div>

            </div>

            {/* NOTES */}

            <div className="hm-interview-details-section">

              <h3>
                <MessageSquareText size={18} />
                Interview Notes
              </h3>

              <div className="hm-interview-notes-box">

                {notes}

              </div>

            </div>

            {/* MEETING LINK */}

            {meetingLink && (

              <div className="hm-interview-details-section">

                <h3>
                  <Video size={18} />
                  Online Interview
                </h3>

                <p>
                  Meeting link provided for
                  this interview.
                </p>

                <button
                  type="button"
                  className="hm-interview-join-button"
                  onClick={() =>
                    window.open(
                      meetingLink,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <Video size={17} />
                  Join Interview
                  <ExternalLink size={15} />
                </button>

              </div>

            )}

            {/* ACTIONS */}

            <div className="hm-interview-details-actions">

              <button
                type="button"
                className="hm-interview-join-button"
                onClick={() =>
                  navigate(
                    "/hiring-manager/interviews"
                  )
                }
              >
                <ArrowLeft size={16} />
                Back to Interviews
              </button>

              {isCompleted && (

                <button
                  type="button"
                  className="hm-interview-join-button"
                  onClick={() =>
                    navigate(
                      `/hiring-manager/interviews/${interviewId}/feedback`
                    )
                  }
                >
                  <MessageSquareText
                    size={16}
                  />
                  Give Feedback
                </button>

              )}

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default HiringManagerInterviewDetails;