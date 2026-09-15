import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  MapPin,
  Users,
  Clock3,
  Search,
  X,
  Building2,
  GraduationCap,
  CalendarDays,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerJobs() {
  // ============================================================
  // FRONTEND MOCK DATA
  // Later this array will be replaced by backend data.
  // ============================================================
  const navigate = useNavigate();
  const jobs = [
    {
      id: 1,
      title: "Java Backend Developer",
      department: "Engineering",
      location: "Hyderabad",
      candidates: 12,
      status: "Active",
      experience: "2 - 4 Years",
      employmentType: "Full Time",
      openings: 3,
      postedDate: "10 Sep 2026",
      closingDate: "30 Sep 2026",
      education: "B.Tech / B.E / MCA",
      skills: [
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "REST APIs",
      ],
      description:
        "We are looking for a Java Backend Developer to design and develop scalable backend services for our recruitment platform.",
    },
    {
      id: 2,
      title: "React Frontend Developer",
      department: "Engineering",
      location: "Bangalore",
      candidates: 8,
      status: "Active",
      experience: "1 - 3 Years",
      employmentType: "Full Time",
      openings: 2,
      postedDate: "11 Sep 2026",
      closingDate: "28 Sep 2026",
      education: "B.Tech / B.E / BCA / MCA",
      skills: [
        "React",
        "JavaScript",
        "HTML",
        "CSS",
        "REST APIs",
      ],
      description:
        "We are looking for a React Frontend Developer to build responsive and interactive interfaces for the recruitment platform.",
    },
    {
      id: 3,
      title: "QA Engineer",
      department: "Quality Assurance",
      location: "Hyderabad",
      candidates: 6,
      status: "Closed",
      experience: "2 - 5 Years",
      employmentType: "Full Time",
      openings: 1,
      postedDate: "01 Sep 2026",
      closingDate: "14 Sep 2026",
      education: "B.Tech / B.E / MCA",
      skills: [
        "Manual Testing",
        "API Testing",
        "Postman",
        "Automation",
      ],
      description:
        "The QA Engineer will be responsible for validating application functionality and ensuring high-quality software releases.",
    },
  ];

  // ============================================================
  // STATE
  // ============================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  

  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  const filteredJobs = jobs.filter((job) => {
  const search = searchTerm.trim().toLowerCase();

  const matchesSearch =
    job.title.toLowerCase().includes(search) ||
    job.department.toLowerCase().includes(search) ||
    job.location.toLowerCase().includes(search);

  const matchesStatus =
    statusFilter === "All" ||
    job.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">
          {/* HEADER */}

          <div className="hiring-manager-dashboard-header">
            <p className="hiring-manager-label">
              RECRUITMENT
            </p>

            <h1>Assigned Jobs</h1>

            <p>
              View jobs assigned to you and review
              recruitment requirements.
            </p>
          </div>

          {/* JOBS SECTION */}

          <section className="hiring-manager-jobs-section">
            {/* TOOLBAR */}

            <div className="hiring-manager-jobs-toolbar">
              <div className="hiring-manager-jobs-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search by job, department or location..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>

              <select
                className="hiring-manager-job-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="All">
                  All Status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Closed">
                  Closed
                </option>
              </select>
            </div>

            {/* JOB CARDS */}

            <div className="hiring-manager-jobs-grid">
              {filteredJobs.map((job) => (
                <div
                  className="hiring-manager-job-card"
                  key={job.id}
                >
                  <div className="hiring-manager-job-card-top">
                    <div className="hiring-manager-job-icon">
                      <BriefcaseBusiness size={22} />
                    </div>

                    <span
                      className={`hiring-manager-job-status ${
                        job.status === "Active"
                          ? "active"
                          : "closed"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <h3>{job.title}</h3>

                  <p className="hiring-manager-job-department">
                    {job.department}
                  </p>

                  <div className="hiring-manager-job-info">
                    <div>
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>

                    <div>
                      <Clock3 size={16} />
                      <span>{job.experience}</span>
                    </div>

                    <div>
                      <Users size={16} />
                      <span>
                        {job.candidates} Candidates
                      </span>
                    </div>
                  </div>

                  <button
  className="hiring-manager-view-job-button"
  onClick={() =>
    navigate(`/hiring-manager/jobs/${job.id}`, {
      state: { job },
    })
  }
>
  View Job
</button>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="hiring-manager-no-jobs">
                  <BriefcaseBusiness size={32} />

                  <h3>No jobs found</h3>

                  <p>
                    No assigned jobs match your
                    current search or filter.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* ========================================================
          JOB DETAILS MODAL
      ======================================================== */}
    </div>
  );
}

export default HiringManagerJobs;