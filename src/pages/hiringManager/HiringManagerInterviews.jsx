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
  const interviews = [
    {
      id: 1,
      candidate: "Ananya Sharma",
      job: "Java Backend Developer",
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

          <div className="hiring-manager-dashboard-header">
            <p className="hiring-manager-label">
              INTERVIEWS
            </p>

            <h1>Interviews</h1>

            <p>
              View assigned interviews and submit candidate feedback.
            </p>
          </div>

          <section className="hm-interviews-grid">

            {interviews.map((interview) => (
              <div
                className="hm-interview-card"
                key={interview.id}
              >
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

                </div>

                <div className="hm-interview-actions">

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

  <button
    type="button"
    className="hm-interview-feedback-button"
    disabled={interview.status !== "Completed"}
    onClick={() =>
      navigate(
        `/hiring-manager/interviews/${interview.id}/feedback`
      )
    }
  >
    <MessageSquareText size={16} />

    {interview.status === "Completed"
      ? "Feedback"
      : "Awaiting Interview"}
  </button>

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