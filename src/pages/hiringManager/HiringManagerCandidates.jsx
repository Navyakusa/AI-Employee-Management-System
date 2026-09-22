import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";
import { getShortlistedCandidates } from "./HiringManagerApi";
import "./HiringManagerDashboard.css";

const HiringManagerCandidates = () => {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  ========================================================
  FETCH SHORTLISTED CANDIDATES
  ========================================================
  */

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getShortlistedCandidates();

        // Debugging
        console.log("FULL API RESPONSE:", response);
        console.log("API DATA:", response?.data);

        let candidateData = [];

        /*
        ApiResponse format:
        {
            success: true,
            message: "...",
            data: [...]
        }
        */

        if (Array.isArray(response?.data)) {
          candidateData = response.data;
        } else if (Array.isArray(response)) {
          candidateData = response;
        } else if (Array.isArray(response?.content)) {
          candidateData = response.content;
        }

        console.log("CANDIDATES TO DISPLAY:", candidateData);

        setCandidates(candidateData);

      } catch (err) {
        console.error("Failed to load candidates:", err);

        setError(
          err.message || "Failed to load shortlisted candidates"
        );

      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  /*
  ========================================================
  SEARCH
  ========================================================
  */

  const filteredCandidates = candidates.filter((candidate) => {
    const search = searchTerm.toLowerCase();

    return (
      candidate.candidateName
        ?.toLowerCase()
        .includes(search) ||

      candidate.email
        ?.toLowerCase()
        .includes(search) ||

      candidate.jobTitle
        ?.toLowerCase()
        .includes(search)
    );
  });

  /*
  ========================================================
  OPEN CANDIDATE REVIEW
  ========================================================
  */

  const handleCandidateClick = (candidate) => {
    navigate(
      `/hiring-manager/shortlisted-candidates/${candidate.applicationId}`,
      {
        state: {
          candidate,
        },
      }
    );
  };

  /*
  ========================================================
  PAGE
  ========================================================
  */

  return (
    <div className="hiring-manager-layout">

      {/* SIDEBAR */}

      <HiringManagerSidebar />


      {/* MAIN AREA */}

      <div className="hiring-manager-main">

        {/* NAVBAR */}

        <HiringManagerNavbar />


        {/* CONTENT */}

        <div className="hiring-manager-content">

          {/* PAGE HEADER */}

          <div className="page-header">

            <div>

              <h1>
                Shortlisted Candidates
              </h1>

              <p>
                Review candidates shortlisted for your assigned jobs.
              </p>

            </div>

          </div>


          {/* SEARCH */}

          <div className="search-container">

            <input
              type="text"
              placeholder="Search by candidate name, email or job..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>


          {/* LOADING */}

          {loading && (
            <div className="empty-state">

              <p>
                Loading shortlisted candidates...
              </p>

            </div>
          )}


          {/* ERROR */}

          {!loading && error && (
            <div className="empty-state">

              <h3>
                Unable to load candidates
              </h3>

              <p>
                {error}
              </p>

            </div>
          )}


          {/* NO DATA */}

          {!loading &&
            !error &&
            filteredCandidates.length === 0 && (

              <div className="empty-state">

                <h3>
                  No shortlisted candidates
                </h3>

                <p>
                  No shortlisted candidates are currently available.
                </p>

              </div>

            )}


          {/* CANDIDATES */}

          {!loading &&
            !error &&
            filteredCandidates.length > 0 && (

              <div className="candidates-grid">

                {filteredCandidates.map((candidate) => (

                  <div
                    key={candidate.applicationId}
                    className="candidate-card"
                    onClick={() =>
                      handleCandidateClick(candidate)
                    }
                  >

                    {/* HEADER */}

                    <div className="candidate-card-header">

                      <div>

                        <h3>
                          {candidate.candidateName ||
                            "Unknown Candidate"}
                        </h3>

                        <p>
                          {candidate.email || "No email"}
                        </p>

                      </div>


                      <span className="candidate-status">

                        {candidate.status || "N/A"}

                      </span>

                    </div>


                    {/* INFORMATION */}

                    <div className="candidate-info">

                      <p>
                        <strong>
                          Job:
                        </strong>{" "}

                        {candidate.jobTitle || "N/A"}

                      </p>


                      <p>
                        <strong>
                          Department:
                        </strong>{" "}

                        {candidate.department || "N/A"}

                      </p>


                      <p>
                        <strong>
                          Location:
                        </strong>{" "}

                        {candidate.location || "N/A"}

                      </p>


                      <p>
                        <strong>
                          Experience:
                        </strong>{" "}

                        {candidate.experience || "N/A"}

                      </p>

                    </div>


                    {/* SKILLS */}

                    <div className="candidate-skills">

                      <strong>
                        Skills:
                      </strong>

                      <p>
                        {candidate.skills ||
                          candidate.requiredSkills ||
                          "Not available"}
                      </p>

                    </div>


                    {/* FOOTER */}

                    <div className="candidate-footer">

                      {/* AI SCORE */}

                      <div>

                        <small>
                          AI Match Score
                        </small>

                        <strong>

                          {candidate.aiMatchScore !==
                            null &&
                          candidate.aiMatchScore !==
                            undefined
                            ? `${candidate.aiMatchScore}%`
                            : "N/A"}

                        </strong>

                      </div>


                      {/* APPLIED DATE */}

                      <div>

                        <small>
                          Applied
                        </small>

                        <strong>

                          {candidate.appliedAt
                            ? new Date(
                                candidate.appliedAt
                              ).toLocaleDateString()
                            : "N/A"}

                        </strong>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

        </div>

      </div>

    </div>
  );
};

export default HiringManagerCandidates;