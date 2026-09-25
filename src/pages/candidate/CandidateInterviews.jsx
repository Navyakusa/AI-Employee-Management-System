
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Video,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import { getMyInterviewsWithJobs } from "../../services/candidateService";
import { getErrorMessage } from "../../services/candidateHelpers";

import "./CandidateDashboard.css";

function CandidateInterviews() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInterviews = async () => {
    setLoading(true);
    setError("");

    try {
      setInterviews(await getMyInterviewsWithJobs());
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load your interviews.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredInterviews = useMemo(() => {
    const value = search.trim().toLowerCase();

    return interviews.filter((interview) => {
      const matchesSearch =
        !value ||
        interview.jobTitle
          .toLowerCase()
          .includes(value) ||
        interview.company
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        status === "All" ||
        interview.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [interviews, search, status]);

  const upcomingCount = interviews.filter(
    (interview) => interview.status === "Upcoming"
  ).length;

  const completedCount = interviews.filter(
    (interview) => interview.status === "Completed"
  ).length;

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          {/* HEADER */}

          <div className="candidate-interviews-page-header">
            <div>
              <p className="candidate-label">
                INTERVIEW SCHEDULE
              </p>

              <h1>My Interviews</h1>

              <p>
                View your scheduled interviews and track
                completed interview rounds.
              </p>
            </div>
          </div>

          {/* SUMMARY */}

          <section className="candidate-interview-summary-grid">
            <div className="candidate-interview-summary-card">
              <div className="candidate-interview-summary-icon total">
                <CalendarDays size={20} />
              </div>

              <div>
                <span>Total Interviews</span>
                <strong>{interviews.length}</strong>
              </div>
            </div>

            <div className="candidate-interview-summary-card">
              <div className="candidate-interview-summary-icon upcoming">
                <Clock3 size={20} />
              </div>

              <div>
                <span>Upcoming</span>
                <strong>{upcomingCount}</strong>
              </div>
            </div>

            <div className="candidate-interview-summary-card">
              <div className="candidate-interview-summary-icon completed">
                <CalendarDays size={20} />
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
            </div>
          </section>

          {/* FILTERS */}

          <section className="candidate-interview-filter-card">
            <div className="candidate-interview-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search job or company..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="candidate-interview-status-filter">
              <CalendarDays size={17} />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
              >
                <option value="All">
                  All Interviews
                </option>

                <option value="Upcoming">
                  Upcoming
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>
          </section>

          {/* TITLE */}

          <div className="candidate-interview-list-heading">
            <div>
              <h2>Interview Schedule</h2>

              <p>
                {filteredInterviews.length} interview
                {filteredInterviews.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          {/* LIST */}

          {loading ? (
            <div className="candidate-interview-empty">
              <CalendarDays size={29} />

              <h3>Loading your interviews...</h3>

              <p>Please wait a moment.</p>
            </div>
          ) : error ? (
            <div className="candidate-interview-empty">
              <CalendarDays size={29} />

              <h3>Unable to load interviews</h3>

              <p>{error}</p>

              <button type="button" onClick={loadInterviews}>
                Try Again
              </button>
            </div>
          ) : filteredInterviews.length > 0 ? (
            <div className="candidate-interviews-list">
              {filteredInterviews.map((interview) => (
                <article
                  key={interview.id}
                  className="candidate-interview-list-card"
                >
                  <div className="candidate-interview-list-icon">
                    <Video size={22} />
                  </div>

                  <div className="candidate-interview-list-content">
                    <div className="candidate-interview-list-top">
                      <div>
                        <h3>
                          {interview.jobTitle}
                        </h3>

                        <p>
                          <Building2 size={13} />
                          {interview.company}
                        </p>
                      </div>

                      <span
                        className={`candidate-interview-status ${interview.status.toLowerCase()}`}
                      >
                        {interview.status}
                      </span>
                    </div>

                    <div className="candidate-interview-list-meta">
                      <span>
                        <CalendarDays size={14} />
                        {interview.date}
                      </span>

                      <span>
                        <Clock3 size={14} />
                        {interview.time}
                      </span>

                      <span>
                        <BriefcaseBusiness size={14} />
                        {interview.type}
                      </span>

                      <span>
                        {interview.mode ===
                        "Online" ? (
                          <Video size={14} />
                        ) : (
                          <MapPin size={14} />
                        )}

                        {interview.mode}
                      </span>
                    </div>

                    <div className="candidate-interview-platform">
                      {interview.mode === "Online" ? (
                        <Video size={14} />
                      ) : (
                        <MapPin size={14} />
                      )}

                      <span>
                        {interview.platform}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="candidate-interview-details-btn"
                    onClick={() =>
                      navigate(
                        `/candidate/interviews/${interview.id}`
                      )
                    }
                  >
                    View Details
                    <ArrowRight size={15} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="candidate-interview-empty">
              <CalendarDays size={29} />

              <h3>No interviews found</h3>

              <p>
                {interviews.length === 0
                  ? "You have no interviews scheduled yet."
                  : "No interviews match the selected filter."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CandidateInterviews;