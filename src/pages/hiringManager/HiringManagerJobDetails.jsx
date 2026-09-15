import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  MapPin,
  Users,
  Clock3,
  Building2,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerJobDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const job = location.state?.job;

  // ============================================================
  // IF USER DIRECTLY OPENS URL WITHOUT JOB DATA
  // ============================================================

  if (!job) {
    return (
      <div className="hiring-manager-layout">
        <HiringManagerSidebar />

        <div className="hiring-manager-main">
          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">
            <div className="hiring-manager-job-not-found">
              <BriefcaseBusiness size={40} />

              <h2>Job details not available</h2>

              <p>
                Please return to Assigned Jobs and select a job.
              </p>

              <button
                onClick={() =>
                  navigate("/hiring-manager/jobs")
                }
              >
                Back to Assigned Jobs
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* ====================================================
              BACK BUTTON
          ==================================================== */}

          <button
            className="hiring-manager-job-details-back"
            onClick={() =>
              navigate("/hiring-manager/jobs")
            }
          >
            <ArrowLeft size={18} />
            Back to Assigned Jobs
          </button>

          {/* ====================================================
              JOB HEADER
          ==================================================== */}

          <section className="hiring-manager-job-details-header">

            <div className="hiring-manager-job-details-title">

              <div className="hiring-manager-job-details-icon">
                <BriefcaseBusiness size={26} />
              </div>

              <div>
                <p className="hiring-manager-label">
                  JOB DETAILS
                </p>

                <h1>{job.title}</h1>

                <p>{job.department}</p>
              </div>

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

          </section>

          {/* ====================================================
              JOB INFORMATION
          ==================================================== */}

          <section className="hiring-manager-job-details-info-grid">

            <div className="hiring-manager-job-detail-info-card">
              <MapPin size={21} />

              <div>
                <span>Location</span>
                <strong>{job.location}</strong>
              </div>
            </div>

            <div className="hiring-manager-job-detail-info-card">
              <Clock3 size={21} />

              <div>
                <span>Experience</span>
                <strong>{job.experience}</strong>
              </div>
            </div>

            <div className="hiring-manager-job-detail-info-card">
              <BriefcaseBusiness size={21} />

              <div>
                <span>Employment Type</span>
                <strong>
                  {job.employmentType || "Full Time"}
                </strong>
              </div>
            </div>

            <div className="hiring-manager-job-detail-info-card">
              <Users size={21} />

              <div>
                <span>Candidates</span>
                <strong>
                  {job.candidates}
                </strong>
              </div>
            </div>

            <div className="hiring-manager-job-detail-info-card">
              <Building2 size={21} />

              <div>
                <span>Department</span>
                <strong>
                  {job.department}
                </strong>
              </div>
            </div>

            <div className="hiring-manager-job-detail-info-card">
              <GraduationCap size={21} />

              <div>
                <span>Education</span>
                <strong>
                  {job.education || "Not Specified"}
                </strong>
              </div>
            </div>

          </section>

          {/* ====================================================
              MAIN DETAILS
          ==================================================== */}

          <div className="hiring-manager-job-details-content-grid">

            {/* LEFT */}

            <div>

              {/* JOB DESCRIPTION */}

              <section className="hiring-manager-job-details-section">
                <h2>Job Description</h2>

                <p>
                  {job.description ||
                    "No job description available."}
                </p>
              </section>

              {/* REQUIRED SKILLS */}

              <section className="hiring-manager-job-details-section">
                <h2>Required Skills</h2>

                <div className="hiring-manager-job-details-skills">

                  {job.skills?.length > 0 ? (
                    job.skills.map((skill) => (
                      <span key={skill}>
                        <CheckCircle2 size={15} />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p>
                      No required skills specified.
                    </p>
                  )}

                </div>
              </section>

            </div>

            {/* RIGHT */}

            <div>

              <section className="hiring-manager-job-details-section">
                <h2>Job Overview</h2>

                <div className="hiring-manager-job-overview">

                  <div>
                    <span>Openings</span>
                    <strong>
                      {job.openings || 1}
                    </strong>
                  </div>

                  <div>
                    <span>Applications</span>
                    <strong>
                      {job.candidates}
                    </strong>
                  </div>

                  <div>
                    <span>Posted Date</span>
                    <strong>
                      {job.postedDate ||
                        "Not Available"}
                    </strong>
                  </div>

                  <div>
                    <span>Closing Date</span>
                    <strong>
                      {job.closingDate ||
                        "Not Available"}
                    </strong>
                  </div>

                </div>
              </section>

              {/* RECRUITMENT STATUS */}

              <section className="hiring-manager-job-details-section">
                <h2>Recruitment Status</h2>

                <div className="hiring-manager-recruitment-status">

                  <CalendarDays size={20} />

                  <div>
                    <strong>
                      {job.status === "Active"
                        ? "Recruitment in Progress"
                        : "Recruitment Closed"}
                    </strong>

                    <span>
                      {job.status === "Active"
                        ? "Candidate evaluation is currently active."
                        : "This job is no longer accepting candidates."}
                    </span>
                  </div>

                </div>
              </section>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default HiringManagerJobDetails;