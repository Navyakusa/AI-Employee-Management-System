import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Building2,
  GraduationCap,
  CalendarDays,
  Users,
  Wallet,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import apiClient from "../../services/apiClient";

function JobDetailsPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  // =========================================================
  // STATE
  // =========================================================

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH JOB DETAILS
  // GET /api/jobs/{id}
  // =========================================================

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(
          `/jobs/${jobId}`
        );

        console.log(
          "Job details response:",
          response.data
        );

        const result = response.data;

        if (result?.success && result?.data) {
          setJob(result.data);
        } else if (
          result &&
          typeof result === "object" &&
          result.id
        ) {
          setJob(result);
        } else {
          setJob(null);
          setError("Job not found.");
        }
      } catch (err) {
        console.error(
          "Failed to fetch job details:",
          err
        );

        setJob(null);

        setError(
          err.response?.data?.message ||
            "Unable to load job details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  // =========================================================
  // REQUIRED SKILLS
  // =========================================================

  const getRequiredSkills = () => {
    if (!job?.requiredSkills) {
      return [];
    }

    if (Array.isArray(job.requiredSkills)) {
      return job.requiredSkills;
    }

    return job.requiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  // =========================================================
  // PREFERRED SKILLS
  // =========================================================

  const getPreferredSkills = () => {
    if (!job?.preferredSkills) {
      return [];
    }

    if (Array.isArray(job.preferredSkills)) {
      return job.preferredSkills;
    }

    return job.preferredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  // =========================================================
  // RESPONSIBILITIES
  // =========================================================

  const getResponsibilities = () => {
    if (!job?.responsibilities) {
      return [];
    }

    if (Array.isArray(job.responsibilities)) {
      return job.responsibilities;
    }

    /*
     * Backend currently returns responsibilities as a string.
     *
     * If multiple responsibilities are separated using
     * new lines, semicolons or full stops, split them
     * for the existing list UI.
     */

    return job.responsibilities
      .split(/\r?\n|;|(?<=\.)\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  // =========================================================
  // EXPERIENCE
  // =========================================================

  const getExperience = () => {
    if (!job) {
      return "Not specified";
    }

    const min = job.experienceMin;
    const max = job.experienceMax;

    if (
      min !== null &&
      min !== undefined &&
      max !== null &&
      max !== undefined
    ) {
      return `${min} - ${max} Years`;
    }

    if (min !== null && min !== undefined) {
      return `${min}+ Years`;
    }

    return "Not specified";
  };

  // =========================================================
  // SALARY
  // =========================================================

  const formatIndianSalary = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return value;
    }

    return `₹${numericValue.toLocaleString("en-IN")}`;
  };

  const getSalary = () => {
    if (!job) {
      return "Not specified";
    }

    const min = formatIndianSalary(job.salaryMin);
    const max = formatIndianSalary(job.salaryMax);

    if (min && max) {
      return `${min} - ${max}`;
    }

    if (min) {
      return `${min}+`;
    }

    if (max) {
      return `Up to ${max}`;
    }

    return "Not specified";
  };

  // =========================================================
  // CLOSING DATE
  // =========================================================

  const getClosingDate = () => {
    if (!job?.closingDate) {
      return "Not specified";
    }

    const date = new Date(job.closingDate);

    if (Number.isNaN(date.getTime())) {
      return job.closingDate;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // =========================================================
  // APPLY NOW - CHECK CANDIDATE LOGIN
  // =========================================================

  const handleApplyNow = () => {
    if (!job) {
      return;
    }

    // Closed jobs cannot be applied to
    if (job.status?.toUpperCase() !== "OPEN") {
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const isCandidate =
      token &&
      role?.toUpperCase() === "CANDIDATE";

    // Already logged in as Candidate
    if (isCandidate) {
      navigate(`/apply/${job.id}`);
      return;
    }

    // Remember which job candidate wants to apply for
    sessionStorage.setItem(
      "pendingApplication",
      `/apply/${job.id}`
    );

    // Go to login
    navigate("/login");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="job-not-found">
        <div className="container">
          <Briefcase size={42} />

          <h1>Loading Job...</h1>

          <p>
            Please wait while we load the job details.
          </p>
        </div>
      </section>
    );
  }

  // =========================================================
  // NOT FOUND / ERROR
  // =========================================================

  if (!job) {
    return (
      <section className="job-not-found">
        <div className="container">

          <h1>Job Not Found</h1>

          <p>
            {error ||
              "The position you are looking for does not exist or may no longer be available."}
          </p>

          <Link
            to="/jobs"
            className="btn btn-primary"
          >
            <ArrowLeft size={18} />
            Back to Jobs
          </Link>

        </div>
      </section>
    );
  }

  const requiredSkills = getRequiredSkills();
  const preferredSkills = getPreferredSkills();
  const responsibilities = getResponsibilities();

  const isOpen =
    job.status?.toUpperCase() === "OPEN";

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="job-details-page">

      {/* HEADER */}

      <section className="job-details-header">

        <div className="container">

          <Link
            to="/jobs"
            className="back-to-jobs"
          >
            <ArrowLeft size={17} />
            Back to Jobs
          </Link>


          <div className="job-details-title-section">

            <div>

              <span className="section-label">
                {job.department ||
                  "Department not specified"}
              </span>

              <h1>{job.title}</h1>


              <div className="job-details-meta">

                <span>
                  <MapPin size={17} />

                  {job.location ||
                    "Location not specified"}
                </span>


                <span>
                  <Briefcase size={17} />

                  {job.employmentType ||
                    "Not specified"}
                </span>


                <span>
                  <Briefcase size={17} />

                  {getExperience()}
                </span>

              </div>

            </div>


            {/* APPLY NOW */}

            {isOpen && (
              <button
                type="button"
                className="apply-now-button"
                onClick={handleApplyNow}
              >
                Apply Now
                <ArrowRight size={18} />
              </button>
            )}

          </div>

        </div>

      </section>


      {/* CONTENT */}

      <section className="job-details-content">

        <div className="container job-details-layout">


          {/* MAIN */}

          <main className="job-details-main">


            {/* ABOUT ROLE */}

            <div className="job-details-card">

              <h2>About the Role</h2>

              <p className="job-description">
                {job.description ||
                  "No job description provided."}
              </p>

            </div>


            {/* RESPONSIBILITIES */}

            <div className="job-details-card">

              <h2>Responsibilities</h2>

              {responsibilities.length > 0 ? (
                <ul className="job-details-list">

                  {responsibilities.map(
                    (responsibility, index) => (
                      <li
                        key={`${responsibility}-${index}`}
                      >
                        <CheckCircle2 size={18} />

                        <span>
                          {responsibility}
                        </span>
                      </li>
                    )
                  )}

                </ul>
              ) : (
                <p className="job-description">
                  No responsibilities provided.
                </p>
              )}

            </div>


            {/* REQUIRED SKILLS */}

            <div className="job-details-card">

              <h2>Required Skills</h2>

              {requiredSkills.length > 0 ? (
                <div className="job-detail-skills">

                  {requiredSkills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <p className="job-description">
                  No required skills specified.
                </p>
              )}

            </div>


            {/* PREFERRED SKILLS */}

            <div className="job-details-card">

              <h2>Preferred Skills</h2>

              {preferredSkills.length > 0 ? (
                <div className="job-detail-skills preferred">

                  {preferredSkills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <p className="job-description">
                  No preferred skills specified.
                </p>
              )}

            </div>

          </main>


          {/* SIDEBAR */}

          <aside className="job-details-sidebar">

            <div className="job-summary-card">

              <h3>Job Overview</h3>


              <div className="job-summary-item">

                <Building2 size={20} />

                <div>
                  <span>Department</span>

                  <strong>
                    {job.department ||
                      "Not specified"}
                  </strong>
                </div>

              </div>


              <div className="job-summary-item">

                <MapPin size={20} />

                <div>
                  <span>Location</span>

                  <strong>
                    {job.location ||
                      "Not specified"}
                  </strong>
                </div>

              </div>


              <div className="job-summary-item">

                <Briefcase size={20} />

                <div>
                  <span>Employment Type</span>

                  <strong>
                    {job.employmentType ||
                      "Not specified"}
                  </strong>
                </div>

              </div>


              <div className="job-summary-item">

                <Briefcase size={20} />

                <div>
                  <span>Experience</span>

                  <strong>
                    {getExperience()}
                  </strong>
                </div>

              </div>


              <div className="job-summary-item">

                <Wallet size={20} />

                <div>
                  <span>Salary Range</span>

                  <strong>
                    {getSalary()}
                  </strong>
                </div>

              </div>


              <div className="job-summary-item">

                <GraduationCap size={20} />

                <div>
                  <span>Education</span>

                  <strong>
                    {job.education ||
                      "Not specified"}
                  </strong>
                </div>

              </div>


              <div className="job-summary-item">

                <Users size={20} />

                <div>
                  <span>Openings</span>

                  <strong>
                    {job.openings ??
                      "Not specified"}
                  </strong>
                </div>

              </div>


              <div className="job-summary-item">

                <CalendarDays size={20} />

                <div>
                  <span>Closing Date</span>

                  <strong>
                    {getClosingDate()}
                  </strong>
                </div>

              </div>


              {/* APPLY */}

              {isOpen ? (
                <button
                  type="button"
                  className="sidebar-apply-button"
                  onClick={handleApplyNow}
                >
                  Apply for this Job
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  className="sidebar-apply-button"
                  disabled
                >
                  Position Closed
                </button>
              )}

            </div>

          </aside>

        </div>

      </section>

    </div>
  );
}

export default JobDetailsPage;