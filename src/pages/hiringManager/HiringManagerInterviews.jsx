import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  Clock,
  Video,
  MapPin,
  User,
  MessageSquareText,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerInterviews() {
  const navigate = useNavigate();

  // Temporary frontend data
  // Backend integration will replace this later
  const interviews = [
    {
      id: 1,
      candidate: "Ananya Sharma",
      job: "Java Backend Developer",
      interviewer: "Raj Kumar",
      date: "18 Sep 2026",
      time: "11:00 AM",
      mode: "Online",
      location: "Google Meet",
      status: "Scheduled",
    },
    {
      id: 2,
      candidate: "Rahul Verma",
      job: "React Frontend Developer",
      interviewer: "Priya Reddy",
      date: "20 Sep 2026",
      time: "2:30 PM",
      mode: "Offline",
      location: "Hyderabad Office",
      status: "Scheduled",
    },
    {
      id: 3,
      candidate: "Sneha Reddy",
      job: "QA Engineer",
      interviewer: "Arjun Kumar",
      date: "15 Sep 2026",
      time: "10:00 AM",
      mode: "Online",
      location: "Microsoft Teams",
      status: "Completed",
    },
  ];

  return (
    <div className="hiring-manager-layout">

      <HiringManagerSidebar />

      <div className="hiring-manager-main">

        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* HEADER */}

          <div className="hiring-manager-dashboard-header">

            <p className="hiring-manager-label">
              INTERVIEWS
            </p>

            <h1>Interviews</h1>

            <p>
              Monitor interview schedules, assigned interviewers
              and candidate interview status.
            </p>

          </div>

          {/* INTERVIEW CARDS */}

          <section className="hm-interviews-grid">

            {interviews.map((interview) => (

              <div
                className="hm-interview-card"
                key={interview.id}
              >

                {/* CARD HEADER */}

                <div className="hm-interview-card-header">

                  <div className="hm-interview-icon">
                    <CalendarDays size={21} />
                  </div>

                  <span
                    className={`hm-interview-status ${
                      interview.status === "Completed"
                        ? "completed"
                        : "scheduled"
                    }`}
                  >
                    {interview.status}
                  </span>

                </div>

                {/* CANDIDATE */}

                <div className="hm-interview-candidate">

                  <div className="hm-interview-avatar">
                    <User size={20} />
                  </div>

                  <div>
                    <h3>
                      {interview.candidate}
                    </h3>

                    <p>
                      {interview.job}
                    </p>
                  </div>

                </div>

                {/* INTERVIEW DETAILS */}

                <div className="hm-interview-details">

                  <div>
                    <CalendarDays size={16} />

                    <span>
                      {interview.date}
                    </span>
                  </div>

                  <div>
                    <Clock size={16} />

                    <span>
                      {interview.time}
                    </span>
                  </div>

                  <div>

                    {interview.mode === "Online" ? (
                      <Video size={16} />
                    ) : (
                      <MapPin size={16} />
                    )}

                    <span>
                      {interview.mode}
                    </span>

                  </div>

                  <div>
                    <MapPin size={16} />

                    <span>
                      {interview.location}
                    </span>
                  </div>

                  {/* ASSIGNED INTERVIEWER */}

                  <div>
                    <User size={16} />

                    <span>
                      Interviewer: {interview.interviewer}
                    </span>
                  </div>

                </div>

                {/* ACTIONS */}

                <div className="hm-interview-actions">

                  {/* ALWAYS AVAILABLE */}

                  <button
                    type="button"
                    className="hm-interview-view-button"
                    onClick={() =>
                      navigate(
                        `/hiring-manager/interviews/${interview.id}`
                      )
                    }
                  >
                    View Details
                  </button>

                  {/* ONLY AFTER INTERVIEW IS COMPLETED */}

                  {interview.status === "Completed" && (

                    <button
                      type="button"
                      className="hm-interview-feedback-button"
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

              </div>

            ))}

          </section>

        </main>

      </div>

    </div>
  );
}

export default HiringManagerInterviews;