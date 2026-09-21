import React, { useMemo, useState } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import "./RecruiterScreening.css";

const sampleCandidates = [
  {
    id: 1,
    name: "Rahul Verma",
    email: "rahul.verma@gmail.com",
    position: "Java Backend Developer",
    experience: "3 Years",
    matchScore: 92,
    status: "Shortlisted",
    skills: ["Java", "Spring Boot", "SQL"],
    screenedDate: "16 Sep 2026",
  },
  {
    id: 2,
    name: "Ananya Sharma",
    email: "ananya.sharma@gmail.com",
    position: "Frontend Developer",
    experience: "2 Years",
    matchScore: 88,
    status: "Recommended",
    skills: ["React", "JavaScript", "CSS"],
    screenedDate: "15 Sep 2026",
  },
  {
    id: 3,
    name: "Arjun Reddy",
    email: "arjun.reddy@gmail.com",
    position: "Full Stack Developer",
    experience: "4 Years",
    matchScore: 84,
    status: "Recommended",
    skills: ["React", "Node.js", "MongoDB"],
    screenedDate: "14 Sep 2026",
  },
  {
    id: 4,
    name: "Priya Nair",
    email: "priya.nair@gmail.com",
    position: "Python Developer",
    experience: "2 Years",
    matchScore: 79,
    status: "Review",
    skills: ["Python", "Django", "SQL"],
    screenedDate: "13 Sep 2026",
  },
  {
    id: 5,
    name: "Kiran Kumar",
    email: "kiran.kumar@gmail.com",
    position: "Software Engineer",
    experience: "3 Years",
    matchScore: 61,
    status: "Not Recommended",
    skills: ["Python", "Java", "AWS"],
    screenedDate: "12 Sep 2026",
  },
];

function RecruiterScreening() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredCandidates = useMemo(() => {
    return sampleCandidates.filter((candidate) => {
      const text = search.toLowerCase();

      const matchesSearch =
        candidate.name.toLowerCase().includes(text) ||
        candidate.email.toLowerCase().includes(text) ||
        candidate.position.toLowerCase().includes(text) ||
        candidate.skills.some((skill) =>
          skill.toLowerCase().includes(text)
        );

      const matchesFilter =
        filter === "All" || candidate.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const getScoreClass = (score) => {
    if (score >= 85) return "score-high";
    if (score >= 70) return "score-medium";
    return "score-low";
  };

  const handleViewAnalysis = (candidate) => {
    alert(
      `AI Screening Analysis\n\nCandidate: ${candidate.name}\nMatch Score: ${candidate.matchScore}%`
    );
  };

  const handleShortlist = (candidate) => {
    alert(`${candidate.name} has been shortlisted.`);
  };

  return (
    <div className="recruiter-screening-page">
      <RecruiterSidebar />
      <RecruiterTopbar />

      <main className="recruiter-screening-main">
        <div className="screening-header">
          <div>
            <h1>AI Screening</h1>
            <p>
              Review AI-powered candidate screening and matching results
            </p>
          </div>

          <button
            className="run-screening-btn"
            onClick={() => alert("AI screening process started.")}
          >
            <span>✦</span>
            Run AI Screening
          </button>
        </div>

        <section className="screening-summary">
          <div className="screening-card">
            <div className="screening-icon">👥</div>
            <div>
              <span>Total Screened</span>
              <strong>{sampleCandidates.length}</strong>
            </div>
          </div>

          <div className="screening-card">
            <div className="screening-icon">★</div>
            <div>
              <span>High Match</span>
              <strong>
                {
                  sampleCandidates.filter(
                    (candidate) => candidate.matchScore >= 85
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="screening-card">
            <div className="screening-icon">✓</div>
            <div>
              <span>Recommended</span>
              <strong>
                {
                  sampleCandidates.filter(
                    (candidate) =>
                      candidate.status === "Recommended"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="screening-card">
            <div className="screening-icon">◷</div>
            <div>
              <span>Needs Review</span>
              <strong>
                {
                  sampleCandidates.filter(
                    (candidate) => candidate.status === "Review"
                  ).length
                }
              </strong>
            </div>
          </div>
        </section>

        <section className="screening-info">
          <div className="ai-info-icon">✦</div>

          <div>
            <h3>AI Candidate Screening</h3>
            <p>
              AI screening compares candidate information with job
              requirements and provides a match score to help recruiters
              review candidates.
            </p>
          </div>
        </section>

        <section className="screening-table-card">
          <div className="screening-toolbar">
            <div className="screening-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search candidates or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="screening-filter"
            >
              <option value="All">All Results</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Recommended">Recommended</option>
              <option value="Review">Review</option>
              <option value="Not Recommended">
                Not Recommended
              </option>
            </select>
          </div>

          <div className="screening-table-wrapper">
            <table className="screening-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Experience</th>
                  <th>Skills</th>
                  <th>AI Match</th>
                  <th>Result</th>
                  <th>Screened</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>
                        <div className="screening-candidate">
                          <div className="screening-avatar">
                            {candidate.name.charAt(0)}
                          </div>

                          <div>
                            <strong>{candidate.name}</strong>
                            <small>{candidate.email}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="screening-position">
                          {candidate.position}
                        </span>
                      </td>

                      <td>{candidate.experience}</td>

                      <td>
                        <div className="screening-skills">
                          {candidate.skills.map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      </td>

                      <td>
                        <div
                          className={`ai-score ${getScoreClass(
                            candidate.matchScore
                          )}`}
                        >
                          <strong>{candidate.matchScore}%</strong>
                          <span>Match</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`screening-result ${candidate.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {candidate.status}
                        </span>
                      </td>

                      <td>{candidate.screenedDate}</td>

                      <td>
                        <div className="screening-actions">
                          <button
                            className="analysis-btn"
                            onClick={() =>
                              handleViewAnalysis(candidate)
                            }
                          >
                            Analysis
                          </button>

                          {candidate.matchScore >= 80 && (
                            <button
                              className="shortlist-btn"
                              onClick={() =>
                                handleShortlist(candidate)
                              }
                            >
                              Shortlist
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="screening-empty"
                    >
                      <div>
                        <span>✦</span>
                        <h3>No screening results found</h3>
                        <p>
                          Try changing your search or filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="screening-footer">
            Showing{" "}
            <strong>{filteredCandidates.length}</strong> of{" "}
            <strong>{sampleCandidates.length}</strong> candidates
          </div>
        </section>
      </main>
    </div>
  );
}

export default RecruiterScreening;