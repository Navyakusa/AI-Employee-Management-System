import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import { getEligibleCandidates } from "./HiringManagerApi";

import "./HiringManagerLayout.css";
import "./HiringManagerCandidates.css";

const HiringManagerCandidates = () => {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH SHORTLISTED / ELIGIBLE CANDIDATES
  // =========================================================

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getEligibleCandidates();

        console.log(
          "HIRING MANAGER - ELIGIBLE CANDIDATES RESPONSE:",
          response
        );

        let candidateData = [];

        if (Array.isArray(response?.data)) {
          candidateData = response.data;
        } else if (Array.isArray(response)) {
          candidateData = response;
        } else if (Array.isArray(response?.content)) {
          candidateData = response.content;
        }

        console.log(
          "HIRING MANAGER - CANDIDATES TO DISPLAY:",
          candidateData
        );

        setCandidates(candidateData);
      } catch (err) {
        console.error(
          "Failed to load Hiring Manager candidates:",
          err
        );

        setError(
          err.message ||
            "Failed to load shortlisted candidates."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredCandidates = candidates.filter((candidate) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    const candidateName = String(
      candidate.candidateName || ""
    ).toLowerCase();

    const candidateEmail = String(
      candidate.candidateEmail ||
        candidate.email ||
        ""
    ).toLowerCase();

    const jobTitle = String(
      candidate.jobTitle || ""
    ).toLowerCase();

    return (
      candidateName.includes(search) ||
      candidateEmail.includes(search) ||
      jobTitle.includes(search)
    );
  });

  // =========================================================
  // OPEN CANDIDATE DETAILS
  // =========================================================

  const handleCandidateClick = (candidate) => {
    if (!candidate.applicationId) {
      console.error(
        "Application ID is missing:",
        candidate
      );

      return;
    }

    navigate(
      `/hiring-manager/shortlisted-candidates/${candidate.applicationId}`,
      {
        state: {
          candidate,
        },
      }
    );
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="hiring-manager-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <HiringManagerSidebar />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="hiring-manager-main">

        {/* ===================================================
            NAVBAR
        =================================================== */}

        <HiringManagerNavbar />

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="hiring-manager-content">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="hm-candidates-page-header">
            <div>
              <h1>
                Shortlisted Candidates
              </h1>

              <p>
                Review candidates shortlisted for your
                assigned jobs.
              </p>
            </div>
          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="hm-candidates-search-container">
            <input
              type="text"
              placeholder="Search by candidate name, email or job..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          {/* =================================================
              RESULT COUNT
          ================================================= */}

          {!loading && !error && (
            <p className="hm-candidates-result-count">
              Showing{" "}
              <strong>
                {filteredCandidates.length}
              </strong>{" "}
              candidates
            </p>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="hm-candidates-empty-state">
              <div className="hm-candidates-loading-spinner"></div>

              <h3>
                Loading shortlisted candidates...
              </h3>

              <p>
                Please wait while we load the candidates.
              </p>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <div className="hm-candidates-error">

              <div className="hm-candidates-error-icon">
                !
              </div>

              <h3>
                Unable to load candidates
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="hm-candidates-retry-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Retry
              </button>

            </div>
          )}

          {/* =================================================
              NO DATA
          ================================================= */}

          {!loading &&
            !error &&
            filteredCandidates.length === 0 && (
              <div className="hm-candidates-empty-state">

                <div className="hm-candidates-empty-icon">
                  👥
                </div>

                <h3>
                  No Shortlisted Candidates Found
                </h3>

                <p>
                  There are currently no eligible
                  candidates available for review.
                </p>

              </div>
            )}

          {/* =================================================
              CANDIDATES
          ================================================= */}

          {!loading &&
            !error &&
            filteredCandidates.length > 0 && (

              <div className="hm-candidates-grid">

                {filteredCandidates.map(
                  (candidate) => (

                    <div
                      key={
                        candidate.applicationId ||
                        candidate.candidateId
                      }
                      className="hm-candidate-card"
                      onClick={() =>
                        handleCandidateClick(candidate)
                      }
                    >

                      {/* =====================================
                          CARD HEADER
                      ===================================== */}

                      <div className="hm-candidate-card-header">

                        <div className="hm-candidate-header-info">

                          <h3>
                            {candidate.candidateName ||
                              "Unknown Candidate"}
                          </h3>

                          <p>
                            {candidate.candidateEmail ||
                              candidate.email ||
                              "Email not available"}
                          </p>

                        </div>

                        <span className="hm-candidate-status">
                          Shortlisted
                        </span>

                      </div>

                      {/* =====================================
                          CANDIDATE INFORMATION
                      ===================================== */}

                      <div className="hm-candidate-info">

                        <p>
                          <strong>
                            Application ID:
                          </strong>{" "}
                          {candidate.applicationId ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Candidate ID:
                          </strong>{" "}
                          {candidate.candidateId ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Job:
                          </strong>{" "}
                          {candidate.jobTitle ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Job ID:
                          </strong>{" "}
                          {candidate.jobId ||
                            "N/A"}
                        </p>

                      </div>

                      {/* =====================================
                          OPTIONAL INFORMATION
                      ===================================== */}

                      {(candidate.department ||
                        candidate.location ||
                        candidate.experience) && (

                        <div className="hm-candidate-info hm-candidate-optional-info">

                          {candidate.department && (
                            <p>
                              <strong>
                                Department:
                              </strong>{" "}
                              {candidate.department}
                            </p>
                          )}

                          {candidate.location && (
                            <p>
                              <strong>
                                Location:
                              </strong>{" "}
                              {candidate.location}
                            </p>
                          )}

                          {candidate.experience && (
                            <p>
                              <strong>
                                Experience:
                              </strong>{" "}
                              {candidate.experience}
                            </p>
                          )}

                        </div>
                      )}

                      {/* =====================================
                          AI SCORE
                      ===================================== */}

                      {(candidate.aiMatchPercentage !==
                        undefined ||
                        candidate.aiMatchScore !==
                          undefined) && (

                        <div className="hm-candidate-footer">

                          <div className="hm-ai-score">

                            <small>
                              AI Match Score
                            </small>

                            <strong>
                              {candidate.aiMatchPercentage ??
                                candidate.aiMatchScore ??
                                "N/A"}

                              {candidate.aiMatchPercentage !=
                                null ||
                              candidate.aiMatchScore !=
                                null
                                ? "%"
                                : ""}
                            </strong>

                          </div>

                        </div>
                      )}

                      {/* =====================================
                          VIEW BUTTON
                      ===================================== */}

                      <div className="hm-candidate-review-button-wrapper">

                        <button
                          type="button"
                          className="hm-candidate-review-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCandidateClick(
                              candidate
                            );
                          }}
                        >
                          Review Candidate
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default HiringManagerCandidates;