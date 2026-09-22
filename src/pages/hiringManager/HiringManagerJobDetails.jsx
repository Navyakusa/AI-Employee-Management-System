import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  Building2,
  FileText,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";
import "./HiringManagerDashboard.css";

const HiringManagerJobDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Job data is passed from HiringManagerJobs.jsx
  const job = location.state?.job;

  /*
  --------------------------------------------------
  If job data is not available
  --------------------------------------------------
  */
  if (!job) {
    return (
      <div className="hr-layout">
        <HiringManagerSidebar />

        <div className="hr-main-content">
          <HiringManagerNavbar />

          <div className="hr-content">
            <button
              className="back-button"
              onClick={() => navigate("/hiring-manager/jobs")}
            >
              <ArrowLeft size={18} />
              Back to Assigned Jobs
            </button>

            <div className="empty-state">
              <FileText size={48} />

              <h2>Job Details Not Available</h2>

              <p>
                The selected job information is not available.
                Please return to Assigned Jobs and select a job again.
              </p>

              <button
                className="primary-button"
                onClick={() => navigate("/hiring-manager/jobs")}
              >
                View Assigned Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  --------------------------------------------------
  Normalize job fields
  --------------------------------------------------
  */

  const title = job.title || job.jobTitle || "Untitled Job";

  const department =
    job.department || "Not specified";

  const locationValue =
    job.location || "Not specified";

  const status =
    job.status || "OPEN";

  const experience =
    job.experience ||
    job.experienceRequired ||
    "Not specified";

  const employmentType =
    job.employmentType ||
    "Not specified";

  const candidates =
    job.candidates ??
    job.candidateCount ??
    job.applicationCount ??
    0;

  const openings =
    job.openings ??
    job.numberOfOpenings ??
    0;

  const education =
    job.education ||
    job.educationRequired ||
    "Not specified";

  const description =
    job.description ||
    "No job description available.";

  const skills =
    job.skills ||
    job.requiredSkills ||
    [];

  const postedDate =
    job.postedDate ||
    job.createdAt ||
    "";

  const closingDate =
    job.closingDate ||
    job.applicationDeadline ||
    "";

  /*
  --------------------------------------------------
  Format dates
  --------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  /*
  --------------------------------------------------
  Convert skills into array
  --------------------------------------------------
  */

  const skillList = Array.isArray(skills)
    ? skills
    : typeof skills === "string"
      ? skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

  /*
  --------------------------------------------------
  Status class
  --------------------------------------------------
  */

  const statusClass =
    String(status).toUpperCase() === "OPEN"
      ? "status-active"
      : "status-closed";

  /*
  --------------------------------------------------
  Render
  --------------------------------------------------
  */

  return (
    <div className="hr-layout">
      <HiringManagerSidebar />

      <div className="hr-main-content">
        <HiringManagerNavbar />

        <div className="hr-content">

          {/* Back Button */}

          <button
            className="back-button"
            onClick={() =>
              navigate("/hiring-manager/jobs")
            }
          >
            <ArrowLeft size={18} />
            Back to Assigned Jobs
          </button>


          {/* Job Header */}

          <div className="job-details-header">

            <div className="job-details-header-left">

              <div className="job-icon-large">
                <Briefcase size={30} />
              </div>

              <div>
                <h1>{title}</h1>

                <p className="job-details-department">
                  <Building2 size={16} />
                  {department}
                </p>
              </div>

            </div>

            <span className={`job-status ${statusClass}`}>
              {String(status).toUpperCase() === "OPEN"
                ? "Active"
                : "Closed"}
            </span>

          </div>


          {/* Job Summary Cards */}

          <div className="job-summary-grid">

            <div className="job-summary-card">
              <MapPin size={22} />

              <div>
                <span>Location</span>
                <strong>{locationValue}</strong>
              </div>
            </div>


            <div className="job-summary-card">
              <Briefcase size={22} />

              <div>
                <span>Experience</span>
                <strong>{experience}</strong>
              </div>
            </div>


            <div className="job-summary-card">
              <Users size={22} />

              <div>
                <span>Candidates</span>
                <strong>{candidates}</strong>
              </div>
            </div>


            <div className="job-summary-card">
              <Users size={22} />

              <div>
                <span>Openings</span>
                <strong>{openings}</strong>
              </div>
            </div>

          </div>


          {/* Main Details */}

          <div className="job-details-grid">

            {/* Left Section */}

            <div className="job-details-main">

              {/* Job Description */}

              <section className="details-card">

                <div className="details-card-header">
                  <FileText size={20} />
                  <h2>Job Description</h2>
                </div>

                <p className="job-description">
                  {description}
                </p>

              </section>


              {/* Required Skills */}

              <section className="details-card">

                <div className="details-card-header">
                  <Briefcase size={20} />
                  <h2>Required Skills</h2>
                </div>

                {skillList.length > 0 ? (
                  <div className="skills-container">
                    {skillList.map((skill, index) => (
                      <span
                        className="skill-tag"
                        key={`${skill}-${index}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="muted-text">
                    No skills specified.
                  </p>
                )}

              </section>

            </div>


            {/* Right Section */}

            <div className="job-details-side">

              {/* Job Information */}

              <section className="details-card">

                <div className="details-card-header">
                  <Briefcase size={20} />
                  <h2>Job Information</h2>
                </div>


                <div className="detail-row">
                  <span>Employment Type</span>
                  <strong>{employmentType}</strong>
                </div>


                <div className="detail-row">
                  <span>Education</span>
                  <strong>{education}</strong>
                </div>


                <div className="detail-row">
                  <span>Experience</span>
                  <strong>{experience}</strong>
                </div>


                <div className="detail-row">
                  <span>Department</span>
                  <strong>{department}</strong>
                </div>


                <div className="detail-row">
                  <span>Location</span>
                  <strong>{locationValue}</strong>
                </div>

              </section>


              {/* Dates */}

              <section className="details-card">

                <div className="details-card-header">
                  <Calendar size={20} />
                  <h2>Important Dates</h2>
                </div>


                <div className="detail-row">

                  <span>
                    <Clock size={15} />
                    Posted Date
                  </span>

                  <strong>
                    {formatDate(postedDate)}
                  </strong>

                </div>


                <div className="detail-row">

                  <span>
                    <Calendar size={15} />
                    Closing Date
                  </span>

                  <strong>
                    {formatDate(closingDate)}
                  </strong>

                </div>

              </section>


              {/* Candidate Information */}

              <section className="details-card">

                <div className="details-card-header">
                  <Users size={20} />
                  <h2>Candidate Overview</h2>
                </div>


                <div className="candidate-overview">

                  <div className="candidate-number">
                    {candidates}
                  </div>

                  <p>
                    Candidates have applied for this
                    position.
                  </p>

                </div>

              </section>

            </div>

          </div>


          {/* Bottom Action */}

          <div className="job-details-actions">

            <button
              className="secondary-button"
              onClick={() =>
                navigate(
                  "/hiring-manager/shortlisted-candidates"
                )
              }
            >
              <Users size={18} />
              View Shortlisted Candidates
            </button>

            <button
              className="primary-button"
              onClick={() =>
                navigate(
                  "/hiring-manager/interviews"
                )
              }
            >
              View Interviews
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default HiringManagerJobDetails;