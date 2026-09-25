import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  ClipboardCheck,
  User,
  BriefcaseBusiness,
  Video,
  MapPin,
  ArrowRight,
  MessageSquareText,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import {
  getMyInterviews,
  getDashboardSummary,
} from "../../services/interviewerService";

import "./InterviewerDashboard.css";

function InterviewerDashboard() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getMyInterviews(), getDashboardSummary()])
      .then(([interviewsData, summaryData]) => {
        setInterviews(Array.isArray(interviewsData) ? interviewsData : []);
        setSummary(summaryData);
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        setError("Unable to load your interviews right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  /*
    CONFIRMED backend behavior: the dashboard summary's todaysSchedule
    and evaluationQueue lists (and their raw counts) include EVERY
    status, not just Scheduled — a Cancelled or Rescheduled interview
    today would show up mixed into "Today's Schedule" otherwise. So
    this filters to Scheduled specifically to match what the page has
    always meant by "today's schedule", and uses the filtered length
    for the stat card instead of trusting the backend's unfiltered
    count — keeping the number and the list underneath it consistent.
  */
  const todaysSchedule = (summary?.todaysSchedule ?? []).filter(
    (interview) => interview.status === "Scheduled"
  );

  // pendingEvaluations from getDashboardSummary() is already corrected
  // for the backend's copy-paste bug (see interviewerService.js) — no
  // further filtering needed here.
  const evaluationQueue = summary?.evaluationQueue ?? [];

  /*
    ASSUMPTION: interview.date is a string that can be directly compared
    to today's date in the same format. CONFIRM the date format the
    backend returns (e.g. "16 Sep 2026" vs ISO "2026-09-16") and adjust
    this comparison if needed — ideally parse both sides with a date
    library (e.g. dayjs) instead of a raw string match.
  */
  const todayDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // The dashboard summary endpoint has no "list of upcoming
  // interviews" — only a count — so the Upcoming Interviews grid
  // still comes from getMyInterviews(), filtered the same way as
  // before.
  const upcomingInterviews = interviews.filter(
    (interview) =>
      interview.status === "Scheduled" && interview.date !== todayDate
  );

  const summaryCards = [
    {
      title: "Today's Interviews",
      value: todaysSchedule.length,
      icon: <CalendarDays size={22} />,
      className: "today",
    },
    {
      title: "Upcoming Interviews",
      value: upcomingInterviews.length,
      icon: <Clock3 size={22} />,
      className: "upcoming",
    },
    {
      title: "Completed Interviews",
      value: summary?.completedInterviews ?? 0,
      icon: <CheckCircle2 size={22} />,
      className: "completed",
    },
    {
      title: "Pending Evaluations",
      value: evaluationQueue.length,
      icon: <ClipboardCheck size={22} />,
      className: "pending",
    },
  ];

  return (
    <div className="interviewer-layout">
      <InterviewerSidebar />

      <div className="interviewer-main">
        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">
          {/* ================= HEADER ================= */}

          <div className="interviewer-dashboard-header">
            <p className="interviewer-label">INTERVIEW WORKSPACE</p>

            <h1>Interviewer Dashboard</h1>

            <p>
              Manage your assigned interviews and complete candidate
              evaluations.
            </p>
          </div>

          {loading && <p>Loading dashboard...</p>}

          {!loading && error && (
            <div className="interviewer-empty-state">
              <CalendarDays size={34} />
              <h3>Something went wrong</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* ================= SUMMARY ================= */}

              <section className="interviewer-summary-grid">
                {summaryCards.map((card) => (
                  <div
                    className="interviewer-summary-card"
                    key={card.title}
                  >
                    <div
                      className={`interviewer-summary-icon ${card.className}`}
                    >
                      {card.icon}
                    </div>

                    <div className="interviewer-summary-info">
                      <span>{card.title}</span>
                      <strong>{card.value}</strong>
                    </div>
                  </div>
                ))}
              </section>

              {/* ================= MAIN GRID ================= */}

              <div className="interviewer-dashboard-grid">
                {/* TODAY'S SCHEDULE */}

                <section className="interviewer-dashboard-card interviewer-schedule-card">
                  <div className="interviewer-card-header">
                    <div>
                      <h2>Today's Schedule</h2>
                      <p>Interviews assigned to you for today.</p>
                    </div>

                    <button
                      type="button"
                      className="interviewer-text-button"
                      onClick={() => navigate("/interviewer/interviews")}
                    >
                      View All
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="interviewer-schedule-list">
                    {todaysSchedule.length > 0 ? (
                      todaysSchedule.map((interview) => (
                        <div
                          className="interviewer-schedule-item"
                          key={interview.id}
                        >
                          {/* TIME */}

                          <div className="interviewer-schedule-time">
                            <Clock3 size={17} />
                            <strong>{interview.time}</strong>
                          </div>

                          {/* CANDIDATE */}

                          <div className="interviewer-schedule-candidate">
                            <div className="interviewer-candidate-avatar">
                              <User size={19} />
                            </div>

                            <div>
                              <strong>{interview.candidate}</strong>
                              <span>{interview.job}</span>
                            </div>
                          </div>

                          {/* INTERVIEW TYPE */}

                          <div className="interviewer-schedule-type">
                            <BriefcaseBusiness size={16} />
                            <span>{interview.type}</span>
                          </div>

                          {/* MODE */}

                          <div className="interviewer-schedule-mode">
                            {interview.mode === "Online" ? (
                              <Video size={16} />
                            ) : (
                              <MapPin size={16} />
                            )}

                            <div>
                              <span>{interview.mode}</span>
                              <small>{interview.location}</small>
                            </div>
                          </div>

                          {/* ACTION */}

                          <button
                            type="button"
                            className="interviewer-view-button"
                            onClick={() =>
                              navigate(
                                `/interviewer/interviews/${interview.id}`
                              )
                            }
                          >
                            View Details
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="interviewer-empty-state">
                        <CalendarDays size={34} />
                        <h3>No Interviews Today</h3>
                        <p>
                          You don't have any interviews scheduled for
                          today.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* ================= EVALUATION QUEUE ================= */}

                <section className="interviewer-dashboard-card interviewer-evaluation-card">
                  <div className="interviewer-card-header">
                    <div>
                      <h2>Evaluation Queue</h2>
                      <p>Completed interviews waiting for your feedback.</p>
                    </div>
                  </div>

                  <div className="interviewer-evaluation-list">
                    {evaluationQueue.length > 0 ? (
                      evaluationQueue.map((interview) => (
                        <div
                          className="interviewer-evaluation-item"
                          key={interview.id}
                        >
                          <div className="interviewer-evaluation-user">
                            <div className="interviewer-evaluation-avatar">
                              {interview.candidate
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>{interview.candidate}</strong>
                              <span>{interview.job}</span>
                            </div>
                          </div>

                          <div className="interviewer-evaluation-meta">
                            <CheckCircle2 size={15} />
                            Interview Completed
                          </div>

                          <button
                            type="button"
                            className="interviewer-evaluate-button"
                            onClick={() =>
                              navigate(
                                `/interviewer/evaluations/${interview.id}`
                              )
                            }
                          >
                            <MessageSquareText size={16} />
                            Evaluate
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="interviewer-empty-state small">
                        <CheckCircle2 size={30} />
                        <h3>You're up to date</h3>
                        <p>No candidate evaluations are pending.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* ================= UPCOMING ================= */}

              <section className="interviewer-dashboard-card interviewer-upcoming-section">
                <div className="interviewer-card-header">
                  <div>
                    <h2>Upcoming Interviews</h2>
                    <p>Your next scheduled candidate interviews.</p>
                  </div>

                  <button
                    type="button"
                    className="interviewer-text-button"
                    onClick={() => navigate("/interviewer/interviews")}
                  >
                    View Schedule
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="interviewer-upcoming-grid">
                  {upcomingInterviews.map((interview) => (
                    <div
                      className="interviewer-upcoming-item"
                      key={interview.id}
                    >
                      <div className="interviewer-upcoming-top">
                        <div className="interviewer-upcoming-date">
                          <CalendarDays size={18} />
                          <span>{interview.date}</span>
                        </div>

                        <span className="interviewer-status-badge">
                          Scheduled
                        </span>
                      </div>

                      <h3>{interview.candidate}</h3>
                      <p>{interview.job}</p>

                      <div className="interviewer-upcoming-details">
                        <div>
                          <Clock3 size={15} />
                          {interview.time}
                        </div>

                        <div>
                          {interview.mode === "Online" ? (
                            <Video size={15} />
                          ) : (
                            <MapPin size={15} />
                          )}
                          {interview.mode}
                        </div>

                        <div>
                          <BriefcaseBusiness size={15} />
                          {interview.type}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/interviewer/interviews/${interview.id}`
                          )
                        }
                      >
                        View Interview
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default InterviewerDashboard;
