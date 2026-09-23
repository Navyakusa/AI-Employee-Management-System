import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  ClipboardCheck,
  CheckCircle2,
  Clock3,
  User,
  BriefcaseBusiness,
  Star,
  Eye,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import { getMyEvaluationsList } from "../../services/interviewerService";

import "./InterviewerDashboard.css";

function InterviewerEvaluations() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyEvaluationsList()
      .then((data) => setEvaluations(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Unable to load evaluations right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredEvaluations = evaluations.filter((evaluation) => {
    const value = searchTerm.trim().toLowerCase();

    const matchesSearch =
      evaluation.candidate?.toLowerCase().includes(value) ||
      evaluation.email?.toLowerCase().includes(value) ||
      evaluation.job?.toLowerCase().includes(value);

    const matchesFilter = filter === "All" || evaluation.status === filter;

    return matchesSearch && matchesFilter;
  });

  const pendingCount = evaluations.filter(
    (evaluation) => evaluation.status === "Pending"
  ).length;

  const submittedCount = evaluations.filter(
    (evaluation) => evaluation.status === "Submitted"
  ).length;

  return (
    <div className="interviewer-layout">
      <InterviewerSidebar />

      <div className="interviewer-main">
        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">
          {/* HEADER */}

          <div className="interviewer-dashboard-header">
            <p className="interviewer-label">INTERVIEW FEEDBACK</p>

            <h1>Evaluations</h1>

            <p>
              Complete pending interview evaluations and review your
              submitted feedback.
            </p>
          </div>

          {/* SUMMARY */}

          <section className="interviewer-evaluations-summary">
            <div className="interviewer-evaluations-summary-card">
              <div className="interviewer-evaluations-summary-icon pending">
                <Clock3 size={21} />
              </div>

              <div>
                <span>Pending Evaluations</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>

            <div className="interviewer-evaluations-summary-card">
              <div className="interviewer-evaluations-summary-icon submitted">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Submitted</span>
                <strong>{submittedCount}</strong>
              </div>
            </div>

            <div className="interviewer-evaluations-summary-card">
              <div className="interviewer-evaluations-summary-icon total">
                <ClipboardCheck size={21} />
              </div>

              <div>
                <span>Total Evaluations</span>
                <strong>{evaluations.length}</strong>
              </div>
            </div>
          </section>

          {/* MAIN CARD */}

          <section className="interviewer-evaluations-card">
            {/* TOOLBAR */}

            <div className="interviewer-evaluations-toolbar">
              <div className="interviewer-evaluations-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search candidate or job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="interviewer-evaluations-filters">
                {["All", "Pending", "Submitted"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={filter === item ? "active" : ""}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* LIST */}

            <div className="interviewer-evaluations-list">
              {loading && <p>Loading evaluations...</p>}

              {!loading && error && (
                <div className="interviewer-evaluations-empty">
                  <User size={38} />
                  <h3>Something went wrong</h3>
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && filteredEvaluations.length > 0 ? (
                filteredEvaluations.map((evaluation) => {
                  const initials = evaluation.candidate
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const isPending = evaluation.status === "Pending";

                  return (
                    <div
                      className="interviewer-evaluations-row"
                      key={evaluation.interviewId}
                    >
                      {/* CANDIDATE */}

                      <div className="interviewer-evaluations-user">
                        <div className="interviewer-evaluations-avatar">
                          {initials}
                        </div>

                        <div>
                          <strong>{evaluation.candidate}</strong>
                          <span>{evaluation.email}</span>
                        </div>
                      </div>

                      {/* JOB */}

                      <div className="interviewer-evaluations-column">
                        <span>Position</span>

                        <strong>
                          <BriefcaseBusiness size={14} />
                          {evaluation.job}
                        </strong>
                      </div>

                      {/* INTERVIEW */}

                      <div className="interviewer-evaluations-column">
                        <span>Interview</span>

                        <strong>{evaluation.interviewType}</strong>

                        <small>{evaluation.interviewDate}</small>
                      </div>

                      {/* RATING */}

                      <div className="interviewer-evaluations-column">
                        <span>Rating</span>

                        {evaluation.rating ? (
                          <div className="interviewer-evaluations-rating">
                            <Star size={15} />
                            <strong>{evaluation.rating}</strong>
                            <small>/ 5</small>
                          </div>
                        ) : (
                          <strong className="interviewer-evaluations-muted">
                            —
                          </strong>
                        )}
                      </div>

                      {/* STATUS */}

                      <div className="interviewer-evaluations-column">
                        <span>Status</span>

                        <div
                          className={`interviewer-evaluations-status ${evaluation.status.toLowerCase()}`}
                        >
                          {evaluation.status}
                        </div>
                      </div>

                      {/* ACTION */}

                      <div className="interviewer-evaluations-action">
                        {isPending ? (
                          <button
                            type="button"
                            className="evaluate"
                            onClick={() =>
                              navigate(
                                `/interviewer/evaluations/${evaluation.interviewId}`
                              )
                            }
                          >
                            <ClipboardCheck size={16} />
                            Evaluate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="view"
                            onClick={() =>
                              navigate(
                                `/interviewer/evaluations/${evaluation.interviewId}/view`
                              )
                            }
                          >
                            <Eye size={16} />
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                !loading &&
                !error && (
                  <div className="interviewer-evaluations-empty">
                    <User size={38} />
                    <h3>No evaluations found</h3>
                    <p>No evaluations match your current search or filter.</p>
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

export default InterviewerEvaluations;
