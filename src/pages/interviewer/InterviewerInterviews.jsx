import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  User,
  BriefcaseBusiness,
  ClipboardCheck,
  Eye,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import { getMyInterviews } from "../../services/interviewerService";

import "./InterviewerDashboard.css";

function InterviewerInterviews() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Picks up ?search= from the navbar search bar, if present.
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search");

    if (initialSearch) {
      setSearchTerm(initialSearch);
    }

    getMyInterviews()
      .then((data) => {
        setInterviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Unable to load your interviews right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredInterviews = interviews.filter((interview) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      interview.candidate?.toLowerCase().includes(search) ||
      interview.email?.toLowerCase().includes(search) ||
      interview.job?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || interview.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const scheduledCount = interviews.filter(
    (interview) => interview.status === "Scheduled"
  ).length;

  const completedCount = interviews.filter(
    (interview) => interview.status === "Completed"
  ).length;

  const pendingEvaluationCount = interviews.filter(
    (interview) =>
      interview.status === "Completed" &&
      interview.evaluationStatus === "Pending"
  ).length;

  return (
    <div className="interviewer-layout">
      <InterviewerSidebar />

      <div className="interviewer-main">
        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">
          {/* HEADER */}

          <div className="interviewer-dashboard-header">
            <p className="interviewer-label">INTERVIEW MANAGEMENT</p>

            <h1>My Interviews</h1>

            <p>
              View interviews assigned to you and complete evaluations
              after each interview.
            </p>
          </div>

          {/* SUMMARY */}

          <section className="interviewer-interview-summary">
            <div className="interviewer-interview-summary-card">
              <div className="interviewer-interview-summary-icon scheduled">
                <CalendarDays size={21} />
              </div>

              <div>
                <span>Scheduled</span>
                <strong>{scheduledCount}</strong>
              </div>
            </div>

            <div className="interviewer-interview-summary-card">
              <div className="interviewer-interview-summary-icon completed">
                <ClipboardCheck size={21} />
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
            </div>

            <div className="interviewer-interview-summary-card">
              <div className="interviewer-interview-summary-icon pending">
                <Clock3 size={21} />
              </div>

              <div>
                <span>Pending Evaluations</span>
                <strong>{pendingEvaluationCount}</strong>
              </div>
            </div>
          </section>

          {/* INTERVIEWS */}

          <section className="interviewer-interviews-card">
            {/* TOOLBAR */}

            <div className="interviewer-interviews-toolbar">
              <div className="interviewer-interviews-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search candidate or job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="interviewer-interviews-filters">
                {["All", "Scheduled", "Completed"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={statusFilter === status ? "active" : ""}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* GRID */}

            <div className="interviewer-interviews-grid">
              {loading && <p>Loading interviews...</p>}

              {!loading && error && (
                <div className="interviewer-interviews-empty">
                  <User size={38} />
                  <h3>Something went wrong</h3>
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && filteredInterviews.length > 0 ? (
                filteredInterviews.map((interview) => {
                  const initials = interview.candidate
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <article
                      className="interviewer-interview-card"
                      key={interview.id}
                    >
                      {/* CARD HEADER */}

                      <div className="interviewer-interview-card-top">
                        <div className="interviewer-interview-candidate">
                          <div className="interviewer-interview-avatar">
                            {initials}
                          </div>

                          <div>
                            <h3>{interview.candidate}</h3>
                            <span>{interview.email}</span>
                          </div>
                        </div>

                        <span
                          className={`interviewer-interview-status ${interview.status?.toLowerCase()}`}
                        >
                          {interview.status}
                        </span>
                      </div>

                      {/* JOB */}

                      <div className="interviewer-interview-job">
                        <BriefcaseBusiness size={17} />

                        <div>
                          <span>Applied Position</span>
                          <strong>{interview.job}</strong>
                        </div>
                      </div>

                      {/* INFORMATION */}

                      <div className="interviewer-interview-info">
                        <div>
                          <CalendarDays size={16} />
                          <span>{interview.date}</span>
                        </div>

                        <div>
                          <Clock3 size={16} />
                          <span>{interview.time}</span>
                        </div>

                        <div>
                          {interview.mode === "Online" ? (
                            <Video size={16} />
                          ) : (
                            <MapPin size={16} />
                          )}
                          <span>{interview.mode}</span>
                        </div>

                        <div>
                          <MapPin size={16} />
                          <span>{interview.location}</span>
                        </div>
                      </div>

                      {/* TYPE */}

                      <div className="interviewer-interview-type">
                        <span>Interview Type</span>
                        <strong>{interview.type}</strong>
                      </div>

                      {/* ACTIONS */}

                      <div className="interviewer-interview-actions">
                        <button
                          type="button"
                          className="interviewer-interview-view"
                          onClick={() =>
                            navigate(
                              `/interviewer/interviews/${interview.id}`
                            )
                          }
                        >
                          <Eye size={16} />
                          View Details
                        </button>

                        {interview.status === "Completed" &&
                          interview.evaluationStatus === "Pending" && (
                            <button
                              type="button"
                              className="interviewer-interview-evaluate"
                              onClick={() =>
                                navigate(
                                  `/interviewer/evaluations/${interview.id}`
                                )
                              }
                            >
                              <ClipboardCheck size={16} />
                              Evaluate
                            </button>
                          )}

                        {interview.evaluationStatus === "Submitted" && (
                          <span className="interviewer-evaluation-submitted">
                            <ClipboardCheck size={15} />
                            Evaluation Submitted
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })
              ) : (
                !loading &&
                !error && (
                  <div className="interviewer-interviews-empty">
                    <User size={38} />
                    <h3>No interviews found</h3>
                    <p>
                      No assigned interviews match your current search
                      or filter.
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default InterviewerInterviews;
