import { useState } from "react";

import {
  Search,
  CheckCircle2,
  XCircle,
  User,
  BriefcaseBusiness,
  Star,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerDecisions() {
  const [searchTerm, setSearchTerm] = useState("");

  // Temporary frontend data
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "Ananya Sharma",
      email: "ananya@gmail.com",
      job: "Java Backend Developer",
      experience: "3 Years",
      matchScore: 92,
      interviewScore: 4.5,
      status: "Pending",
    },
    {
      id: 2,
      name: "Rahul Verma",
      email: "rahul@gmail.com",
      job: "React Frontend Developer",
      experience: "2 Years",
      matchScore: 87,
      interviewScore: 4.2,
      status: "Pending",
    },
    {
      id: 3,
      name: "Sneha Reddy",
      email: "sneha@gmail.com",
      job: "QA Engineer",
      experience: "4 Years",
      matchScore: 83,
      interviewScore: 3.9,
      status: "Pending",
    },
  ]);

  const handleApprove = (candidateId) => {
    setCandidates((previous) =>
      previous.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              status: "Approved",
            }
          : candidate
      )
    );
  };

  const handleReject = (candidateId) => {
    setCandidates((previous) =>
      previous.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              status: "Rejected",
            }
          : candidate
      )
    );
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const value = searchTerm.toLowerCase();

    return (
      candidate.name.toLowerCase().includes(value) ||
      candidate.email.toLowerCase().includes(value) ||
      candidate.job.toLowerCase().includes(value)
    );
  });

  const pendingCount = candidates.filter(
    (candidate) => candidate.status === "Pending"
  ).length;

  const approvedCount = candidates.filter(
    (candidate) => candidate.status === "Approved"
  ).length;

  const rejectedCount = candidates.filter(
    (candidate) => candidate.status === "Rejected"
  ).length;

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
              Review interview results and approve or reject candidates.
            </p>

          </div>

          {/* SUMMARY */}

          <section className="hm-decision-summary">

            <div className="hm-decision-summary-card">

              <div className="hm-decision-summary-icon pending">
                <User size={21} />
              </div>

              <div>
                <span>Pending Decisions</span>
                <strong>{pendingCount}</strong>
              </div>

            </div>

            <div className="hm-decision-summary-card">

              <div className="hm-decision-summary-icon approved">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Approved</span>
                <strong>{approvedCount}</strong>
              </div>

            </div>

            <div className="hm-decision-summary-card">

              <div className="hm-decision-summary-icon rejected">
                <XCircle size={21} />
              </div>

              <div>
                <span>Rejected</span>
                <strong>{rejectedCount}</strong>
              </div>

            </div>

          </section>

          {/* TABLE CARD */}

          <section className="hm-decisions-card">

            {/* SEARCH */}

            <div className="hm-decisions-toolbar">

              <div className="hm-decisions-search">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search candidate or job..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
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
                    <th>Experience</th>
                    <th>AI Match</th>
                    <th>Interview Score</th>
                    <th>Status</th>
                    <th>Decision</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate) => (

                      <tr key={candidate.id}>

                        {/* CANDIDATE */}

                        <td>
                          <div className="hm-decision-user">

                            <div className="hm-decision-avatar">
                              {candidate.name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
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
                            <BriefcaseBusiness size={15} />
                            {candidate.job}
                          </div>
                        </td>

                        {/* EXPERIENCE */}

                        <td>
                          {candidate.experience}
                        </td>

                        {/* AI MATCH */}

                        <td>
                          <span className="hm-decision-match">
                            {candidate.matchScore}%
                          </span>
                        </td>

                        {/* INTERVIEW SCORE */}

                        <td>
                          <div className="hm-interview-rating">
                            <Star size={15} />
                            <strong>
                              {candidate.interviewScore}
                            </strong>
                            <span>/ 5</span>
                          </div>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`hm-decision-status ${candidate.status.toLowerCase()}`}
                          >
                            {candidate.status}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>

                          {candidate.status === "Pending" ? (

                            <div className="hm-decision-actions">

                              <button
                                type="button"
                                className="approve"
                                onClick={() =>
                                  handleApprove(candidate.id)
                                }
                              >
                                <CheckCircle2 size={15} />
                                Approve
                              </button>

                              <button
                                type="button"
                                className="reject"
                                onClick={() =>
                                  handleReject(candidate.id)
                                }
                              >
                                <XCircle size={15} />
                                Reject
                              </button>

                            </div>

                          ) : (

                            <span className="hm-decision-completed">
                              Decision completed
                            </span>

                          )}

                        </td>

                      </tr>

                    ))
                  ) : (

                    <tr>
                      <td
                        colSpan="7"
                        className="hm-decisions-empty"
                      >
                        No candidates found.
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