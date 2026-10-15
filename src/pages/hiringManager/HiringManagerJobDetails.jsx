import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Users,
  Calendar,
  Clock,
  Building2,
  FileText,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import apiClient from "../../services/apiClient";

import "./HiringManagerDashboard.css";
import "./HiringManagerJobdetails.css";

const HiringManagerJobDetails = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD JOB DIRECTLY THROUGH APICLIENT
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const loadJob = async () => {
      try {
        setLoading(true);
        setError("");

        if (!jobId) {
          throw new Error("Job ID is missing.");
        }

        // apiClient baseURL already includes /api.
        const response = await apiClient.get(`/jobs/${jobId}`);

        console.log("VIEW JOB API RESPONSE:", response.data);

        // Axios response.data contains the backend response body.
        const responseData = response.data;

        let jobData = null;

        if (responseData?.data != null) {
          jobData = responseData.data;
        } else if (responseData?.content != null) {
          jobData = responseData.content;
        } else if (responseData?.job != null) {
          jobData = responseData.job;
        } else if (responseData != null) {
          jobData = responseData;
        }

        if (
          !jobData ||
          typeof jobData !== "object" ||
          Array.isArray(jobData)
        ) {
          throw new Error("Job details were not found.");
        }

        if (isMounted) {
          setJob(jobData);
        }
      } catch (err) {
        console.error("VIEW JOB ERROR:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              err.message ||
              "Unable to load job details from the backend."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="hiring-manager-layout">
        <HiringManagerSidebar />

        <div className="hiring-manager-main">
          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">
            <div className="hiring-manager-dashboard-header">
              <span className="hiring-manager-label">
                RECRUITMENT
              </span>

              <h1>Job Details</h1>

              <p>
                Loading job information from the backend...
              </p>
            </div>

            <div className="job-details-loading-card">
              <div className="job-details-spinner"></div>

              <h2>Loading Job Details</h2>

              <p>
                Please wait while we retrieve the job information.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !job) {
    return (
      <div className="hiring-manager-layout">
        <HiringManagerSidebar />

        <div className="hiring-manager-main">
          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">
            <button
              className="back-button"
              onClick={() =>
                navigate("/hiring-manager/jobs")
              }
            >
              <ArrowLeft size={18} />
              Back to Assigned Jobs
            </button>

            <div className="job-details-error-card">
              <div className="job-details-error-icon">
                <FileText size={42} />
              </div>

              <h2>Unable to Load Job</h2>

              <p>
                {error ||
                  "The requested job could not be found."}
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate("/hiring-manager/jobs")
                }
              >
                View Assigned Jobs
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // NORMALIZE BACKEND DATA
  // =========================================================

  const title =
    job.title ||
    job.jobTitle ||
    "Untitled Job";

  const department =
    job.department ||
    "Not specified";

  const locationValue =
    job.location ||
    "Not specified";

  const status =
    job.status ||
    "OPEN";

  const experience =
    job.experience ||
    job.experienceRequired ||
    (
      job.experienceMin !== undefined ||
      job.experienceMax !== undefined
        ? `${job.experienceMin ?? 0} - ${
            job.experienceMax ?? "Not specified"
          } years`
        : "Not specified"
    );

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

  const responsibilities =
    job.responsibilities ||
    "";

  const skills =
    job.requiredSkills ??
    job.skills ??
    [];

  const preferredSkills =
    job.preferredSkills ??
    [];

  const postedDate =
    job.postedDate ||
    job.createdDate ||
    job.createdAt ||
    "";

  const closingDate =
    job.closingDate ||
    job.applicationDeadline ||
    "";

  // =========================================================
  // HELPERS
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const convertToArray = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim())
        .filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const requiredSkillList = convertToArray(skills);
  const preferredSkillList = convertToArray(preferredSkills);

  const normalizedStatus = String(status).toUpperCase();

  const isOpen =
    normalizedStatus === "OPEN" ||
    normalizedStatus === "ACTIVE";

  const statusClass = isOpen
    ? "status-active"
    : "status-closed";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">
          {/* BACK */}

          <button
            className="back-button"
            onClick={() =>
              navigate("/hiring-manager/jobs")
            }
          >
            <ArrowLeft size={18} />
            Back to Assigned Jobs
          </button>

          {/* PAGE HEADER */}

          <div className="hiring-manager-dashboard-header">
            <span className="hiring-manager-label">
              RECRUITMENT
            </span>

            <h1>Job Details</h1>

            <p>
              Complete information for the selected job.
            </p>
          </div>

          {/* JOB HEADER */}

          <section className="job-details-header">
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
              {isOpen ? "Active" : "Closed"}
            </span>
          </section>

          {/* SUMMARY */}

          <section className="job-summary-grid">
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
          </section>

          {/* DETAILS */}

          <section className="job-details-grid">
            {/* LEFT COLUMN */}

            <div className="job-details-main">
              {/* DESCRIPTION */}

              <section className="details-card">
                <div className="details-card-header">
                  <FileText size={20} />
                  <h2>Job Description</h2>
                </div>

                <p className="job-description">
                  {description}
                </p>
              </section>

              {/* RESPONSIBILITIES */}

              {responsibilities && (
                <section className="details-card">
                  <div className="details-card-header">
                    <Briefcase size={20} />
                    <h2>Responsibilities</h2>
                  </div>

                  <div className="job-responsibilities">
                    {String(responsibilities)
                      .split(/\r?\n/)
                      .map((item, index) => {
                        const value = item
                          .replace(/^[-•*]\s*/, "")
                          .trim();

                        if (!value) {
                          return null;
                        }

                        return (
                          <div
                            className="responsibility-item"
                            key={index}
                          >
                            <span className="responsibility-dot">
                              •
                            </span>

                            <span>{value}</span>
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}

              {/* REQUIRED SKILLS */}

              <section className="details-card">
                <div className="details-card-header">
                  <Briefcase size={20} />
                  <h2>Required Skills</h2>
                </div>

                {requiredSkillList.length > 0 ? (
                  <div className="skills-container">
                    {requiredSkillList.map((skill, index) => (
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
                    No required skills specified.
                  </p>
                )}
              </section>

              {/* PREFERRED SKILLS */}

              {preferredSkillList.length > 0 && (
                <section className="details-card">
                  <div className="details-card-header">
                    <Briefcase size={20} />
                    <h2>Preferred Skills</h2>
                  </div>

                  <div className="skills-container">
                    {preferredSkillList.map((skill, index) => (
                      <span
                        className="skill-tag preferred-skill-tag"
                        key={`${skill}-${index}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN */}

            <div className="job-details-side">
              {/* JOB INFORMATION */}

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

              {/* IMPORTANT DATES */}

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

                  <strong>{formatDate(postedDate)}</strong>
                </div>

                <div className="detail-row">
                  <span>
                    <Calendar size={15} />
                    Closing Date
                  </span>

                  <strong>{formatDate(closingDate)}</strong>
                </div>
              </section>

              {/* CANDIDATE OVERVIEW */}

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
                    Candidates have applied for this position.
                  </p>
                </div>
              </section>
            </div>
          </section>

          {/* ACTIONS */}

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
                navigate("/hiring-manager/interviews")
              }
            >
              <Calendar size={18} />
              View Interviews
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HiringManagerJobDetails;
