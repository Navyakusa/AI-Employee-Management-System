import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  CheckCircle2,
  XCircle,
  User,
  BriefcaseBusiness,
  Star,
  Eye,
  MessageSquareText,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerDecisions() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  // Temporary frontend data.
  // IMPORTANT:
  // Only candidates with COMPLETED interviews
  // and submitted interviewer feedback should appear here.
  //
  // Backend integration will replace this later.
  const [candidates] = useState([
    {
      id: 3,
      interviewId: 3,
      name: "Sneha Reddy",
      email: "sneha@gmail.com",
      job: "QA Engineer",
      experience: "4 Years",

      matchScore: 83,

      interviewScore: 4.0,
      interviewStatus: "Completed",
      feedbackAvailable: true,

      interviewer: "Arjun Kumar",
      recommendation: "Recommended",

      decisionStatus:
  localStorage.getItem("candidateDecision_3") ||
  "Pending",
    },
  ]);

  const filteredCandidates = candidates.filter(
    (candidate) => {
      const value = searchTerm
        .trim()
        .toLowerCase();

      return (
        candidate.name
          .toLowerCase()
          .includes(value) ||
        candidate.email
          .toLowerCase()
          .includes(value) ||
        candidate.job
          .toLowerCase()
          .includes(value)
      );
    }
  );

  const pendingCount = candidates.filter(
    (candidate) =>
      candidate.decisionStatus === "Pending"
  ).length;

  const approvedCount = candidates.filter(
    (candidate) =>
      candidate.decisionStatus === "Approved"
  ).length;

  const rejectedCount = candidates.filter(
    (candidate) =>
      candidate.decisionStatus === "Rejected"
  ).length;

  const getInitials = (name) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="hiring-manager-layout">

      <HiringManagerSidebar />

      <div className="hiring-manager-main">

        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* HEADER */}

          <div className="hiring-manager-dashboard-header">

            <p className="hiring-manager-label">
              HIRING DECISIONS
            </p>

            <h1>Candidate Decisions</h1>

            <p>
              Review candidates who have completed
              their interviews and make the final
              hiring decision.
            </p>

          </div>

          {/* SUMMARY */}

          <section className="hm-decision-summary">

            {/* PENDING */}

            <div className="hm-decision-summary-card">

              <div className="hm-decision-summary-icon pending">
                <User size={21} />
              </div>

              <div>
                <span>
                  Pending Decisions
                </span>

                <strong>
                  {pendingCount}
                </strong>
              </div>

            </div>

            {/* APPROVED */}

            <div className="hm-decision-summary-card">

              <div className="hm-decision-summary-icon approved">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Approved</span>

                <strong>
                  {approvedCount}
                </strong>
              </div>

            </div>

            {/* REJECTED */}

            <div className="hm-decision-summary-card">

              <div className="hm-decision-summary-icon rejected">
                <XCircle size={21} />
              </div>

              <div>
                <span>Rejected</span>

                <strong>
                  {rejectedCount}
                </strong>
              </div>

            </div>

          </section>

          {/* DECISIONS TABLE */}

          <section className="hm-decisions-card">

            {/* TOOLBAR */}

            <div className="hm-decisions-toolbar">

              <div className="hm-decisions-search">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search candidate or job..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* TABLE */}

            <div className="hm-decisions-table-wrapper">

              <table className="hm-decisions-table">

                <thead>

                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>AI Match</th>
                    <th>Interview</th>
                    <th>Recommendation</th>
                    <th>Decision Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredCandidates.length > 0 ? (

                    filteredCandidates.map(
                      (candidate) => (

                        <tr key={candidate.id}>

                          {/* CANDIDATE */}

                          <td>

                            <div className="hm-decision-user">

                              <div className="hm-decision-avatar">
                                {getInitials(
                                  candidate.name
                                )}
                              </div>

                              <div>

                                <strong>
                                  {candidate.name}
                                </strong>

                                <span>
                                  {candidate.email}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* JOB */}

                          <td>

                            <div className="hm-decision-job">

                              <BriefcaseBusiness
                                size={15}
                              />

                              <div>

                                <strong>
                                  {candidate.job}
                                </strong>

                                <span>
                                  {
                                    candidate.experience
                                  }
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* AI MATCH */}

                          <td>

                            <span className="hm-decision-match">
                              {
                                candidate.matchScore
                              }
                              %
                            </span>

                          </td>

                          {/* INTERVIEW */}

                          <td>

                            <div className="hm-decision-interview-info">

                              <div className="hm-interview-rating">

                                <Star size={15} />

                                <strong>
                                  {
                                    candidate.interviewScore
                                  }
                                </strong>

                                <span>/ 5</span>

                              </div>

                              <span className="hm-decision-interview-completed">
                                Completed
                              </span>

                            </div>

                          </td>

                          {/* RECOMMENDATION */}

                          <td>

                            <div className="hm-decision-recommendation">

                              <MessageSquareText
                                size={15}
                              />

                              <span>
                                {
                                  candidate.recommendation
                                }
                              </span>

                            </div>

                          </td>

                          {/* DECISION STATUS */}

                          <td>

                            <span
                              className={`hm-decision-status ${candidate.decisionStatus.toLowerCase()}`}
                            >
                              {
                                candidate.decisionStatus
                              }
                            </span>

                          </td>

                          {/* ACTION */}

                          <td>

                            {candidate.decisionStatus ===
                            "Pending" ? (

                              <button
                                type="button"
                                className="hm-decision-review-button"
                                onClick={() =>
                                  navigate(
                                    `/hiring-manager/decisions/${candidate.id}`
                                  )
                                }
                              >
                                <Eye size={16} />
                                Review Decision
                              </button>

                            ) : (

                              <button
                                type="button"
                                className="hm-decision-view-button"
                                onClick={() =>
                                  navigate(
                                    `/hiring-manager/decisions/${candidate.id}`
                                  )
                                }
                              >
                                <Eye size={16} />
                                View Decision
                              </button>

                            )}

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="hm-decisions-empty"
                      >
                        No candidates ready for
                        final decision.
                      </td>

                    </tr>

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

export default HiringManagerDecisions;