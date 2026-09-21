import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  FileText,
  Eye,
  Star,
  BriefcaseBusiness,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerCandidates() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  // Temporary frontend data
  // Backend will replace this later
  const candidates = [
    {
      id: 1,
      name: "Ananya Sharma",
      email: "ananya@gmail.com",
      phone: "+91 98765 43210",
      location: "Hyderabad",
      job: "Java Backend Developer",
      department: "Engineering",
      experience: "3 Years",
      education: "B.Tech - Computer Science",
      skills: ["Java", "Spring Boot", "PostgreSQL"],
      matchScore: 92,
      status: "Shortlisted",
      resume: "Ananya_Sharma_Resume.pdf",
      appliedDate: "12 Sep 2026",
    },
    {
      id: 2,
      name: "Rahul Verma",
      email: "rahul@gmail.com",
      phone: "+91 98765 12345",
      location: "Bangalore",
      job: "React Frontend Developer",
      department: "Engineering",
      experience: "2 Years",
      education: "B.Tech - Information Technology",
      skills: ["React", "JavaScript", "CSS"],
      matchScore: 87,
      status: "Shortlisted",
      resume: "Rahul_Verma_Resume.pdf",
      appliedDate: "11 Sep 2026",
    },
    {
      id: 3,
      name: "Sneha Reddy",
      email: "sneha@gmail.com",
      phone: "+91 91234 56789",
      location: "Hyderabad",
      job: "QA Engineer",
      department: "Quality Assurance",
      experience: "4 Years",
      education: "B.Tech - Computer Science",
      skills: ["Selenium", "Postman", "Java"],
      matchScore: 83,
      status: "Shortlisted",
      resume: "Sneha_Reddy_Resume.pdf",
      appliedDate: "10 Sep 2026",
    },
  ];

  const filteredCandidates = candidates.filter((candidate) => {
    const value = searchTerm.toLowerCase();

    return (
      candidate.name.toLowerCase().includes(value) ||
      candidate.email.toLowerCase().includes(value) ||
      candidate.job.toLowerCase().includes(value)
    );
  });

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleReviewCandidate = (candidate) => {
    navigate(
      `/hiring-manager/shortlisted-candidates/${candidate.id}`,
      {
        state: {
          candidate,
        },
      }
    );
  };

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* HEADER */}
          <div className="hiring-manager-dashboard-header">
            <p className="hiring-manager-label">
              CANDIDATES
            </p>

            <h1>Shortlisted Candidates</h1>

            <p>
              Review candidates shortlisted for your assigned jobs.
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="hm-candidate-summary">

            <div className="hm-candidate-summary-card">
              <div className="hm-candidate-summary-icon">
                <Star size={21} />
              </div>

              <div>
                <span>Total Shortlisted</span>
                <strong>{candidates.length}</strong>
              </div>
            </div>

            <div className="hm-candidate-summary-card">
              <div className="hm-candidate-summary-icon">
                <BriefcaseBusiness size={21} />
              </div>

              <div>
                <span>Assigned Jobs</span>
                <strong>3</strong>
              </div>
            </div>

          </div>

          {/* CANDIDATE SECTION */}
          <section className="hm-candidates-card">

            <div className="hm-candidates-toolbar">
              <div className="hm-candidates-search">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search candidates or jobs..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />

              </div>
            </div>

            <div className="hm-candidates-table-wrapper">

              <table className="hm-candidates-table">

                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied Job</th>
                    <th>Experience</th>
                    <th>Skills</th>
                    <th>AI Match</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate) => (

                      <tr key={candidate.id}>

                        <td>
                          <div className="hm-candidate-user">

                            <div className="hm-candidate-avatar">
                              {getInitials(candidate.name)}
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

                        <td>{candidate.job}</td>

                        <td>{candidate.experience}</td>

                        <td>
                          <div className="hm-candidate-skills">

                            {candidate.skills.map((skill) => (
                              <span key={skill}>
                                {skill}
                              </span>
                            ))}

                          </div>
                        </td>

                        <td>
                          <div className="hm-match-score">

                            <strong>
                              {candidate.matchScore}%
                            </strong>

                            <div className="hm-match-bar">
                              <div
                                className="hm-match-progress"
                                style={{
                                  width: `${candidate.matchScore}%`,
                                }}
                              />
                            </div>

                          </div>
                        </td>

                        <td>
                          <span className="hm-shortlisted-badge">
                            {candidate.status}
                          </span>
                        </td>

                        <td>
                          <div className="hm-candidate-actions">

                            <button
  type="button"
  title="View Resume"
  onClick={() =>
    navigate(
      `/hiring-manager/resume-review/${candidate.id}`
    )
  }
>
  <FileText size={17} />
</button>

<button
  type="button"
  className="review"
  title="Review Candidate"
  onClick={() =>
    navigate(
      `/hiring-manager/candidate-review/${candidate.id}`
    )
  }
>
  <Eye size={17} />
  Review
</button>

                          </div>
                        </td>

                      </tr>

                    ))
                  ) : (

                    <tr>
                      <td
                        colSpan="7"
                        className="hm-candidates-empty"
                      >
                        No shortlisted candidates found.
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

export default HiringManagerCandidates;