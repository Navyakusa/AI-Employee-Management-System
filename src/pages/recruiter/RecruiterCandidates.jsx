
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserRound,
  Mail,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import apiClient from "../../services/apiClient";

import "./RecruiterCandidates.css";

function RecruiterCandidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumes, setResumes] = useState([]);
  const [resumeError, setResumeError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  // ==========================================
  // FETCH CANDIDATES FROM BACKEND
  // ==========================================

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(
          "/candidates/all"
        );

        console.log(
          "Recruiter candidates response:",
          response.data
        );

        // This endpoint returns a direct JSON array.
        const result = response.data;

        if (!Array.isArray(result)) {
          throw new Error(
            "Invalid candidate response received from backend."
          );
        }

        setCandidates(result);
      } catch (err) {
        console.error(
          "Error fetching recruiter candidates:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Your session has expired. Please log in again."
          );
        } else if (err.response?.status === 403) {
          setError(
            "You are not authorized to access candidates."
          );
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load candidates."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Fetch resume metadata independently so candidate list still works if it fails.
  useEffect(() => {
    let active = true;
    const fetchResumes = async () => {
      try {
        const response = await apiClient.get("/resumes/all");
        if (!Array.isArray(response.data?.data)) {
          throw new Error("Invalid resume response received from backend.");
        }
        if (active) setResumes(response.data.data);
      } catch (err) {
        console.error("Error fetching resumes:", err);
        if (active) setResumeError("Unable to load resume information.");
      }
    };
    fetchResumes();
    return () => { active = false; };
  }, []);

  // Only select a resume automatically when the candidate has one record,
  // or when their candidate record names exactly one matching file.
  const getCandidateResume = (candidate) => {
    const matches = resumes.filter(
      (resume) => Number(resume.candidateId) === Number(candidate.id)
    );
    if (matches.length === 1) return matches[0];
    if (matches.length > 1 && candidate.resume) {
      const named = matches.filter(
        (resume) => resume.fileName === candidate.resume
      );
      if (named.length === 1) return named[0];
    }
    return null;
  };

  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const totalCandidates = candidates.length;

  const shortlistedCount = candidates.filter(
    (candidate) =>
      candidate.status?.toUpperCase() ===
      "SHORTLISTED"
  ).length;

  const interviewCount = candidates.filter(
    (candidate) =>
      candidate.status?.toUpperCase() ===
      "INTERVIEW"
  ).length;

  // ==========================================
  // SEARCH AND STATUS FILTER
  // ==========================================

  const filteredCandidates = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        (candidate.name || "")
          .toLowerCase()
          .includes(searchText) ||
        (candidate.email || "")
          .toLowerCase()
          .includes(searchText) ||
        (candidate.skills || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        candidate.status?.toUpperCase() ===
          statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [candidates, search, statusFilter]);

  // ==========================================
  // STATUS DISPLAY
  // ==========================================

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClass = (status) => {
    if (!status) return "";

    return status
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/\s+/g, "-");
  };

  // ==========================================
  // VIEW CANDIDATE
  // ==========================================

  const handleViewCandidate = (candidate) => {
    navigate(
      `/recruiter/candidates/${candidate.id}`
    );
  };

  // ==========================================
  // DOWNLOAD RESUME
  // ==========================================

  const handleDownloadResume = async (candidate) => {
    setResumeError("");
    const resume = getCandidateResume(candidate);
    if (!resume) {
      setResumeError(
        `No unambiguous resume is available for ${candidate.name || "this candidate"}.`
      );
      return;
    }

    setDownloadingId(candidate.id);
    try {
      const response = await apiClient.get(
        `/resumes/${resume.id}/download`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = resume.fileName || "candidate-resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Resume download failed:", err);
      setResumeError(
        `Unable to download the resume for ${candidate.name || "this candidate"}. The file may be missing from the server.`
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="recruiter-candidates-page">
      <RecruiterSidebar />

      <RecruiterTopbar />

      <main className="recruiter-candidates-main">
        {/* HEADER */}

        <div className="recruiter-candidates-header">
          <div>
            <span className="recruiter-candidates-label">
              RECRUITMENT WORKSPACE
            </span>

            <h1>Candidates</h1>

            <p>
              Manage and review candidates across
              your recruitment pipeline.
            </p>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              marginBottom: "18px",
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {resumeError && (
          <div role="alert" style={{ padding: "12px 16px", marginBottom: "18px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px" }}>
            {resumeError}
          </div>
        )}

        {/* SUMMARY */}

        <div className="candidate-summary">
          <div className="candidate-summary-card">
            <div className="candidate-summary-icon">
              <UserRound size={19} />
            </div>

            <div>
              <span>Total Candidates</span>

              <strong>
                {loading ? "..." : totalCandidates}
              </strong>
            </div>
          </div>

          <div className="candidate-summary-card">
            <div className="candidate-summary-icon">
              <UserRound size={19} />
            </div>

            <div>
              <span>Shortlisted</span>

              <strong>
                {loading ? "..." : shortlistedCount}
              </strong>
            </div>
          </div>

          <div className="candidate-summary-card">
            <div className="candidate-summary-icon">
              <UserRound size={19} />
            </div>

            <div>
              <span>Interviews</span>

              <strong>
                {loading ? "..." : interviewCount}
              </strong>
            </div>
          </div>
        </div>

        {/* CANDIDATES CARD */}

        <section className="candidates-card">
          {/* TOOLBAR */}

          <div className="candidates-toolbar">
            <div className="candidate-search">
              <Search size={16} />

              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="candidate-filter">
              <Filter size={15} />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="All">
                  All Status
                </option>

                <option value="APPLIED">
                  Applied
                </option>

                <option value="SCREENING">
                  Screening
                </option>

                <option value="AI_SCREENED">
                  AI Screened
                </option>

                <option value="SHORTLISTED">
                  Shortlisted
                </option>

                <option value="INTERVIEW">
                  Interview
                </option>

                <option value="SELECTED">
                  Selected
                </option>

                <option value="REJECTED">
                  Rejected
                </option>
              </select>
            </div>
          </div>

          {/* TABLE */}

          <div className="candidates-table-wrapper">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Experience</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="no-candidates"
                    >
                      Loading candidates...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="no-candidates"
                    >
                      Unable to display candidates.
                    </td>
                  </tr>
                ) : filteredCandidates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="no-candidates"
                    >
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map(
                    (candidate) => (
                      <tr key={candidate.id}>
                        {/* CANDIDATE */}

                        <td>
                          <div className="candidate-name-cell">
                            <div className="candidate-avatar">
                              {candidate.name
                                ?.charAt(0)
                                ?.toUpperCase() || "C"}
                            </div>

                            <div>
                              <strong>
                                {candidate.name ||
                                  "Candidate"}
                              </strong>

                              <span>
                                <Mail size={11} />

                                {candidate.email || "—"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* POSITION */}

                        <td>
                          <span className="position-text">
                            —
                          </span>
                        </td>

                        {/* EXPERIENCE */}

                        <td>
                          {candidate.experience || "—"}
                        </td>

                        {/* SKILLS */}

                        <td>
                          <div className="candidate-skills">
                            {(candidate.skills || "")
                              .split(",")
                              .map((skill) => skill.trim())
                              .filter(Boolean)
                              .map((skill) => (
                                <span key={skill}>
                                  {skill}
                                </span>
                              ))}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`candidate-status ${getStatusClass(
                              candidate.status
                            )}`}
                          >
                            {formatStatus(
                              candidate.status
                            )}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="candidate-actions">
                            <button
                              type="button"
                              title="View Candidate"
                              onClick={() =>
                                handleViewCandidate(
                                  candidate
                                )
                              }
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              title={
                                downloadingId === candidate.id
                                  ? "Downloading resume..."
                                  : getCandidateResume(candidate)
                                    ? "Download Resume"
                                    : "No unambiguous resume record available"
                              }
                              disabled={downloadingId !== null || !getCandidateResume(candidate)}
                              onClick={() =>
                                handleDownloadResume(
                                  candidate
                                )
                              }
                            >
                              <Download size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RecruiterCandidates;