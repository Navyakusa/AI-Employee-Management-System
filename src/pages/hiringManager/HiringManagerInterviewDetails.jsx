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
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerInterviewDetails() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  // Temporary frontend data
  // Backend integration will replace this later
  const interviews = [
    {
      id: 1,
      candidate: "Ananya Sharma",
      email: "ananya@gmail.com",
      job: "Java Backend Developer",
      date: "18 Sep 2026",
      time: "11:00 AM",
      mode: "Online",
      location: "Google Meet",
      status: "Scheduled",
      interviewer: "Raj Kumar",
      notes:
        "Evaluate Java fundamentals, Spring Boot knowledge, REST APIs and backend problem-solving skills.",
    },
    {
      id: 2,
      candidate: "Rahul Verma",
      email: "rahul@gmail.com",
      job: "React Frontend Developer",
      date: "20 Sep 2026",
      time: "2:30 PM",
      mode: "Offline",
      location: "Hyderabad Office",
      status: "Scheduled",
      interviewer: "Priya Reddy",
      notes:
        "Evaluate React fundamentals, JavaScript, component design and frontend problem-solving skills.",
    },
    {
      id: 3,
      candidate: "Sneha Reddy",
      email: "sneha@gmail.com",
      job: "QA Engineer",
      date: "15 Sep 2026",
      time: "10:00 AM",
      mode: "Online",
      location: "Microsoft Teams",
      status: "Completed",
      interviewer: "Arjun Kumar",
      notes:
        "Candidate completed the technical interview. Interview feedback is available for Hiring Manager review.",
    },
  ];

  const interview =
    interviews.find(
      (item) => item.id === Number(interviewId)
    ) || interviews[0];

  const initials = interview.candidate
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isCompleted =
    interview.status === "Completed";

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

            <h1>Interview Details</h1>

            <p>
              Monitor candidate interview information,
              assigned interviewer and interview status.
            </p>

          </div>

          {/* MAIN DETAILS CARD */}

          <section className="hm-interview-details-page-card">

            {/* TOP */}

            <div className="hm-interview-details-top">

              <div className="hm-interview-details-candidate">

                <div className="hm-interview-details-avatar">
                  {initials}
                </div>

                <div>
                  <h2>{interview.candidate}</h2>
                  <p>{interview.job}</p>
                </div>

              </div>

              <span
                className={`hm-interview-status ${
                  isCompleted
                    ? "completed"
                    : "scheduled"
                }`}
              >
                {interview.status}
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
                    <span>Email</span>

                    <strong>
                      {interview.email}
                    </strong>
                  </div>

                </div>

                <div className="hm-interview-info-item">

                  <BriefcaseBusiness size={18} />

                  <div>
                    <span>Applied Position</span>

                    <strong>
                      {interview.job}
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
                    <span>Date</span>

                    <strong>
                      {interview.date}
                    </strong>
                  </div>

                </div>

                <div className="hm-interview-info-item">

                  <Clock size={18} />

                  <div>
                    <span>Time</span>

                    <strong>
                      {interview.time}
                    </strong>
                  </div>

                </div>

                <div className="hm-interview-info-item">

                  {interview.mode === "Online" ? (
                    <Video size={18} />
                  ) : (
                    <MapPin size={18} />
                  )}

                  <div>
                    <span>Interview Mode</span>

                    <strong>
                      {interview.mode}
                    </strong>
                  </div>

                </div>

                <div className="hm-interview-info-item">

                  <MapPin size={18} />

                  <div>

                    <span>
                      {interview.mode === "Online"
                        ? "Platform"
                        : "Location"}
                    </span>

                    <strong>
                      {interview.location}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

            {/* ASSIGNED INTERVIEWER */}

            <div className="hm-interview-details-section">

              <h3>
                <User size={18} />
                Assigned Interviewer
              </h3>

              <div className="hm-interview-panel-box">

                <div className="hm-interview-panel-icon">
                  <User size={20} />
                </div>

                <div>

                  <span>Interviewer</span>

                  <strong>
                    {interview.interviewer}
                  </strong>

                </div>

              </div>

            </div>

            {/* INTERVIEW NOTES */}

            <div className="hm-interview-details-section">

              <h3>
                <MessageSquareText size={18} />
                Interview Notes
              </h3>

              <div className="hm-interview-notes-box">
                {interview.notes}
              </div>

            </div>

            {/* ACTIONS */}

            <div className="hm-interview-details-actions">

              {/* BACK */}

              <button
                type="button"
                className="hm-resume-secondary-button"
                onClick={() =>
                  navigate(
                    "/hiring-manager/interviews"
                  )
                }
              >
                <ArrowLeft size={16} />
                Back to Interviews
              </button>

              {/* VIEW FEEDBACK ONLY IF COMPLETED */}

              {isCompleted && (

                <button
                  type="button"
                  className="hm-resume-primary-button"
                  onClick={() =>
                    navigate(
                      `/hiring-manager/interviews/${interview.id}/feedback`
                    )
                  }
                >
                  <MessageSquareText size={16} />
                  View Feedback
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