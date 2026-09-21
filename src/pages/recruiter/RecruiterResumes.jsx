import React, { useMemo, useState } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import "./RecruiterResumes.css";

const sampleResumes = [
  {
    id: 1,
    candidate: "Rahul Verma",
    email: "rahul.verma@gmail.com",
    position: "Java Backend Developer",
    experience: "3 Years",
    skills: ["Java", "Spring Boot", "SQL"],
    uploaded: "16 Sep 2026",
    status: "Shortlisted",
    score: 92,
  },
  {
    id: 2,
    candidate: "Ananya Sharma",
    email: "ananya.sharma@gmail.com",
    position: "Frontend Developer",
    experience: "2 Years",
    skills: ["React", "JavaScript", "CSS"],
    uploaded: "15 Sep 2026",
    status: "Interview",
    score: 88,
  },
  {
    id: 3,
    candidate: "Arjun Reddy",
    email: "arjun.reddy@gmail.com",
    position: "Full Stack Developer",
    experience: "4 Years",
    skills: ["React", "Node.js", "MongoDB"],
    uploaded: "14 Sep 2026",
    status: "Screening",
    score: 84,
  },
  {
    id: 4,
    candidate: "Priya Nair",
    email: "priya.nair@gmail.com",
    position: "Python Developer",
    experience: "2 Years",
    skills: ["Python", "Django", "SQL"],
    uploaded: "13 Sep 2026",
    status: "New",
    score: 79,
  },
  {
    id: 5,
    candidate: "Kiran Kumar",
    email: "kiran.kumar@gmail.com",
    position: "Software Engineer",
    experience: "3 Years",
    skills: ["Python", "Java", "AWS"],
    uploaded: "12 Sep 2026",
    status: "Rejected",
    score: 61,
  },
];

function RecruiterResumes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredResumes = useMemo(() => {
    return sampleResumes.filter((resume) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        resume.candidate.toLowerCase().includes(searchText) ||
        resume.email.toLowerCase().includes(searchText) ||
        resume.position.toLowerCase().includes(searchText) ||
        resume.skills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        );

      const matchesStatus =
        statusFilter === "All" || resume.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const handleView = (resume) => {
    alert(`Opening resume for ${resume.candidate}`);
  };

  const handleDownload = (resume) => {
    alert(`Downloading resume of ${resume.candidate}`);
  };

  return (
    <div className="recruiter-resumes-page">
      <RecruiterSidebar />
      <RecruiterTopbar />

      <main className="recruiter-resumes-main">
        <div className="resumes-header">
          <div>
            <h1>Resume Management</h1>
            <p>
              View, search and manage candidate resumes
            </p>
          </div>

          <button
            className="upload-resume-btn"
            onClick={() => alert("Resume upload feature")}
          >
            <span>+</span>
            Upload Resume
          </button>
        </div>

        <section className="resume-summary">
          <div className="resume-summary-card">
            <div className="summary-icon">📄</div>
            <div>
              <span>Total Resumes</span>
              <strong>{sampleResumes.length}</strong>
            </div>
          </div>

          <div className="resume-summary-card">
            <div className="summary-icon">✓</div>
            <div>
              <span>Shortlisted</span>
              <strong>
                {sampleResumes.filter(
                  (resume) => resume.status === "Shortlisted"
                ).length}
              </strong>
            </div>
          </div>

          <div className="resume-summary-card">
            <div className="summary-icon">◷</div>
            <div>
              <span>Under Screening</span>
              <strong>
                {sampleResumes.filter(
                  (resume) => resume.status === "Screening"
                ).length}
              </strong>
            </div>
          </div>

          <div className="resume-summary-card">
            <div className="summary-icon">★</div>
            <div>
              <span>High Match</span>
              <strong>
                {sampleResumes.filter(
                  (resume) => resume.score >= 85
                ).length}
              </strong>
            </div>
          </div>
        </section>

        <section className="resume-table-card">
          <div className="resume-table-toolbar">
            <div className="resume-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search candidate, position or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="resume-status-filter"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Screening">Screening</option>
              <option value="Interview">Interview</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="resume-table-wrapper">
            <table className="resume-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Experience</th>
                  <th>Skills</th>
                  <th>Uploaded</th>
                  <th>AI Match</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredResumes.length > 0 ? (
                  filteredResumes.map((resume) => (
                    <tr key={resume.id}>
                      <td>
                        <div className="candidate-cell">
                          <div className="candidate-avatar">
                            {resume.candidate.charAt(0)}
                          </div>

                          <div>
                            <strong>{resume.candidate}</strong>
                            <small>{resume.email}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="position-text">
                          {resume.position}
                        </span>
                      </td>

                      <td>{resume.experience}</td>

                      <td>
                        <div className="skills-list">
                          {resume.skills.map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      </td>

                      <td>{resume.uploaded}</td>

                      <td>
                        <div className="match-score">
                          <div className="score-circle">
                            {resume.score}%
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`resume-status ${resume.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {resume.status}
                        </span>
                      </td>

                      <td>
                        <div className="resume-actions">
                          <button
                            className="view-btn"
                            onClick={() => handleView(resume)}
                          >
                            View
                          </button>

                          <button
                            className="download-btn"
                            onClick={() => handleDownload(resume)}
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-resumes">
                      <div>
                        <span>📄</span>
                        <h3>No resumes found</h3>
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

          <div className="resume-table-footer">
            Showing{" "}
            <strong>{filteredResumes.length}</strong> of{" "}
            <strong>{sampleResumes.length}</strong> resumes
          </div>
        </section>
      </main>
    </div>
  );
}

export default RecruiterResumes;