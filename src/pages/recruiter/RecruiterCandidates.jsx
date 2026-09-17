import React, { useState } from "react";
import {
  Search,
  UserRound,
  Mail,
  Phone,
  Eye,
  Download,
  Filter,
} from "lucide-react";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";

import "./RecruiterCandidates.css";

function RecruiterCandidates() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const candidates = [
    {
      id: 1,
      name: "Rahul Verma",
      email: "rahul.verma@gmail.com",
      phone: "+91 98765 43210",
      position: "Java Backend Developer",
      experience: "3 Years",
      skills: "Java, Spring Boot, SQL",
      status: "Shortlisted",
    },
    {
      id: 2,
      name: "Ananya Sharma",
      email: "ananya.sharma@gmail.com",
      phone: "+91 91234 56789",
      position: "Frontend Developer",
      experience: "2 Years",
      skills: "React, JavaScript, CSS",
      status: "Interview",
    },
    {
      id: 3,
      name: "Arjun Reddy",
      email: "arjun.reddy@gmail.com",
      phone: "+91 99887 66554",
      position: "Full Stack Developer",
      experience: "4 Years",
      skills: "React, Node.js, MongoDB",
      status: "Screening",
    },
    {
      id: 4,
      name: "Priya Nair",
      email: "priya.nair@gmail.com",
      phone: "+91 90123 45678",
      position: "Python Developer",
      experience: "2 Years",
      skills: "Python, Django, SQL",
      status: "New",
    },
    {
      id: 5,
      name: "Kiran Kumar",
      email: "kiran.kumar@gmail.com",
      phone: "+91 93456 78901",
      position: "Software Engineer",
      experience: "3 Years",
      skills: "Python, Java, AWS",
      status: "Rejected",
    },
  ];

  const filteredCandidates = candidates.filter((candidate) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      candidate.name.toLowerCase().includes(searchText) ||
      candidate.email.toLowerCase().includes(searchText) ||
      candidate.position.toLowerCase().includes(searchText) ||
      candidate.skills.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      candidate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
              Manage and review candidates across your recruitment pipeline.
            </p>
          </div>

        </div>


        {/* SUMMARY */}
        <div className="candidate-summary">

          <div className="candidate-summary-card">
            <div className="candidate-summary-icon">
              <UserRound size={19} />
            </div>

            <div>
              <span>Total Candidates</span>
              <strong>{candidates.length}</strong>
            </div>
          </div>


          <div className="candidate-summary-card">
            <div className="candidate-summary-icon">
              <UserRound size={19} />
            </div>

            <div>
              <span>Shortlisted</span>
              <strong>
                {
                  candidates.filter(
                    (c) => c.status === "Shortlisted"
                  ).length
                }
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
                {
                  candidates.filter(
                    (c) => c.status === "Interview"
                  ).length
                }
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
                <option value="All">All Status</option>
                <option value="New">New</option>
                <option value="Screening">Screening</option>
                <option value="Shortlisted">
                  Shortlisted
                </option>
                <option value="Interview">
                  Interview
                </option>
                <option value="Rejected">
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

                {filteredCandidates.length === 0 ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="no-candidates"
                    >
                      No candidates found.
                    </td>
                  </tr>

                ) : (

                  filteredCandidates.map((candidate) => (

                    <tr key={candidate.id}>

                      {/* CANDIDATE */}
                      <td>

                        <div className="candidate-name-cell">

                          <div className="candidate-avatar">
                            {candidate.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {candidate.name}
                            </strong>

                            <span>
                              <Mail size={11} />
                              {candidate.email}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* POSITION */}
                      <td>
                        <span className="position-text">
                          {candidate.position}
                        </span>
                      </td>


                      {/* EXPERIENCE */}
                      <td>
                        {candidate.experience}
                      </td>


                      {/* SKILLS */}
                      <td>

                        <div className="candidate-skills">

                          {candidate.skills
                            .split(", ")
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
                          className={`candidate-status ${candidate.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {candidate.status}
                        </span>

                      </td>


                      {/* ACTIONS */}
                      <td>

                        <div className="candidate-actions">

                          <button
                            title="View Candidate"
                            onClick={() =>
                              alert(
                                `Viewing ${candidate.name}`
                              )
                            }
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            title="Download Resume"
                            onClick={() =>
                              alert(
                                `Resume download for ${candidate.name}`
                              )
                            }
                          >
                            <Download size={15} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

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