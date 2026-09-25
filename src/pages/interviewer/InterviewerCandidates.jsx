import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  User,
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import { getMyCandidatesList } from "../../services/interviewerService";

import "./InterviewerDashboard.css";

function InterviewerCandidates() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyCandidatesList()
      .then((data) => setCandidates(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Unable to load candidates right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCandidates = candidates.filter((candidate) => {
    const value = searchTerm.trim().toLowerCase();

    return (
      candidate.name?.toLowerCase().includes(value) ||
      candidate.email?.toLowerCase().includes(value) ||
      candidate.job?.toLowerCase().includes(value)
    );
  });

  const scheduledCount = candidates.filter(
    (candidate) => candidate.interviewStatus === "Scheduled"
  ).length;

  const completedCount = candidates.filter(
    (candidate) => candidate.interviewStatus === "Completed"
  ).length;

  return (
    <div className="interviewer-layout">
      <InterviewerSidebar />

      <div className="interviewer-main">
        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">
          {/* HEADER */}

          <div className="interviewer-dashboard-header">
            <p className="interviewer-label">CANDIDATES</p>

            <h1>Assigned Candidates</h1>

            <p>View candidates associated with your assigned interviews.</p>
          </div>

          {/* SUMMARY */}

          <section className="interviewer-candidates-summary">
            <div className="interviewer-candidates-summary-card">
              <div className="interviewer-candidates-summary-icon total">
                <User size={21} />
              </div>

              <div>
                <span>Total Candidates</span>
                <strong>{candidates.length}</strong>
              </div>
            </div>

            <div className="interviewer-candidates-summary-card">
              <div className="interviewer-candidates-summary-icon scheduled">
                <Clock3 size={21} />
              </div>

              <div>
                <span>Scheduled</span>
                <strong>{scheduledCount}</strong>
              </div>
            </div>

            <div className="interviewer-candidates-summary-card">
              <div className="interviewer-candidates-summary-icon completed">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
            </div>
          </section>

          {/* CANDIDATES CARD */}

          <section className="interviewer-candidates-card">
            {/* SEARCH */}

            <div className="interviewer-candidates-toolbar">
              <div className="interviewer-candidates-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search candidate or job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* TABLE */}

            <div className="interviewer-candidates-table-wrapper">
              <table className="interviewer-candidates-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied Position</th>
                    <th>Experience</th>
                    <th>Interview Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6" className="interviewer-candidates-empty">
                        Loading candidates...
                      </td>
                    </tr>
                  )}

                  {!loading && error && (
                    <tr>
                      <td colSpan="6" className="interviewer-candidates-empty">
                        {error}
                      </td>
                    </tr>
                  )}

                  {!loading && !error && filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate, index) => {
                      const initials = candidate.name
                        ?.split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={`${candidate.id}-${index}`}>
                          {/* CANDIDATE */}

                          <td>
                            <div className="interviewer-candidates-user">
                              <div className="interviewer-candidates-avatar">
                                {initials}
                              </div>

                              <div>
                                <strong>{candidate.name}</strong>
                                <span>{candidate.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* JOB */}

                          <td>
                            <div className="interviewer-candidates-job">
                              <BriefcaseBusiness size={15} />
                              <span>{candidate.job}</span>
                            </div>
                          </td>

                          {/* EXPERIENCE */}

                          <td>{candidate.experience}</td>

                          {/* DATE */}

                          <td>
                            <div className="interviewer-candidates-date">
                              <CalendarDays size={15} />
                              <span>{candidate.interviewDate}</span>
                            </div>
                          </td>

                          {/* STATUS */}

                          <td>
                            <span
                              className={`interviewer-candidates-status ${candidate.interviewStatus?.toLowerCase()}`}
                            >
                              {candidate.interviewStatus}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td>
                            <button
                              type="button"
                              className="interviewer-candidates-view-button"
                              onClick={() =>
                                navigate(
                                  `/interviewer/candidates/${candidate.id}`
                                )
                              }
                            >
                              <Eye size={16} />
                              View Candidate
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    !loading &&
                    !error && (
                      <tr>
                        <td
                          colSpan="6"
                          className="interviewer-candidates-empty"
                        >
                          No candidates found.
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default InterviewerCandidates;
