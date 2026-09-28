import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  ArrowRight,
} from "lucide-react";

import apiClient from "../../services/apiClient";

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  // ==========================================
  // FETCH OPEN JOBS FROM BACKEND
  // GET /api/jobs/all
  // ==========================================

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get("/jobs/all");

        console.log("Jobs response:", response.data);

        const allJobs = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // Public website should display only OPEN jobs
        const openJobs = allJobs.filter(
          (job) =>
            job.status?.toUpperCase() === "OPEN"
        );

        setJobs(openJobs);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);

        setJobs([]);
        setError(
          "Unable to load jobs. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ==========================================
  // CONVERT REQUIRED SKILLS STRING TO ARRAY
  // ==========================================

  const getSkills = (job) => {
    if (!job.requiredSkills) {
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

  // ==========================================
  // EXPERIENCE
  // ==========================================

  const getExperience = (job) => {
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

  // ==========================================
  // DYNAMIC DEPARTMENTS
  // ==========================================

  const departments = useMemo(() => {
    const values = jobs
      .map((job) => job.department)
      .filter(Boolean);

    const unique = [];

    values.forEach((value) => {
      const alreadyExists = unique.some(
        (item) =>
          item.toLowerCase() === value.toLowerCase()
      );

      if (!alreadyExists) {
        unique.push(value);
      }
    });

    return unique;
  }, [jobs]);

  // ==========================================
  // DYNAMIC LOCATIONS
  // ==========================================

  const locations = useMemo(() => {
    return [
      ...new Set(
        jobs
          .map((job) => job.location)
          .filter(Boolean)
      ),
    ];
  }, [jobs]);

  // ==========================================
  // DYNAMIC JOB TYPES
  // ==========================================

  const jobTypes = useMemo(() => {
    return [
      ...new Set(
        jobs
          .map((job) => job.employmentType)
          .filter(Boolean)
      ),
    ];
  }, [jobs]);

  // ==========================================
  // FILTER JOBS
  // ==========================================

  const filteredJobs = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return jobs.filter((job) => {
      const skills = getSkills(job);

      const matchesSearch =
        !search ||
        (job.title || "")
          .toLowerCase()
          .includes(search) ||
        (job.department || "")
          .toLowerCase()
          .includes(search) ||
        skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(search)
        );

      const matchesDepartment =
        !department ||
        (job.department || "").toLowerCase() ===
          department.toLowerCase();

      const matchesLocation =
        !location ||
        job.location === location;

      const matchesType =
        !jobType ||
        job.employmentType === jobType;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesLocation &&
        matchesType
      );
    });
  }, [
    jobs,
    searchTerm,
    department,
    location,
    jobType,
  ]);

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearchTerm("");
    setDepartment("");
    setLocation("");
    setJobType("");
  };

  return (
    <div className="jobs-page">

      {/* HERO */}

      <section className="jobs-hero">
        <div className="container">

          <span className="section-label">
            CAREERS
          </span>

          <h1>
            Find Your Next Opportunity
          </h1>

          <p>
            Explore open positions and discover roles that match
            your skills, experience, and career goals.
          </p>

        </div>
      </section>


      {/* JOBS */}

      <section className="jobs-content-section">

        <div className="container">

          {/* FILTERS */}

          <div className="jobs-filter-box">

            <div className="jobs-search-input">

              <Search size={19} />

              <input
                type="text"
                placeholder="Search by job title or skill"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

            </div>


            {/* DEPARTMENT */}

            <select
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value)
              }
            >

              <option value="">
                All Departments
              </option>

              {departments.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}

            </select>


            {/* LOCATION */}

            <select
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            >

              <option value="">
                All Locations
              </option>

              {locations.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}

            </select>


            {/* JOB TYPE */}

            <select
              value={jobType}
              onChange={(e) =>
                setJobType(e.target.value)
              }
            >

              <option value="">
                All Job Types
              </option>

              {jobTypes.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}

            </select>

          </div>


          {/* RESULTS */}

          <div className="jobs-results-header">

            <div>
              <h2>Open Positions</h2>

              {!loading && !error && (
                <p>
                  {filteredJobs.length} jobs found
                </p>
              )}

            </div>


            <button
              type="button"
              className="clear-filters-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>


          {/* LOADING */}

          {loading && (
            <div className="no-jobs-state">

              <Briefcase size={42} />

              <h3>Loading jobs...</h3>

              <p>
                Please wait while we load available
                opportunities.
              </p>

            </div>
          )}


          {/* ERROR */}

          {!loading && error && (
            <div className="no-jobs-state">

              <Briefcase size={42} />

              <h3>Unable to load jobs</h3>

              <p>{error}</p>

            </div>
          )}


          {/* JOB CARDS */}

          {!loading &&
          !error &&
          filteredJobs.length > 0 ? (

            <div className="jobs-list-grid">

              {filteredJobs.map((job) => {

                const skills = getSkills(job);

                return (
                  <article
                    className="jobs-list-card"
                    key={job.id}
                  >

                    <div className="jobs-list-card-header">

                      <div className="jobs-company-icon">
                        <Building2 size={24} />
                      </div>

                      <span className="job-status-badge">
                        Hiring
                      </span>

                    </div>


                    <h3>{job.title}</h3>


                    <p className="jobs-department">
                      {job.department}
                    </p>


                    <div className="jobs-meta">

                      <span>
                        <MapPin size={16} />
                        {job.location}
                      </span>


                      <span>
                        <Briefcase size={16} />
                        {getExperience(job)}
                      </span>


                      <span>
                        <Briefcase size={16} />
                        {job.employmentType ||
                          "Not specified"}
                      </span>

                    </div>


                    {skills.length > 0 && (
                      <div className="jobs-skills">

                        {skills.map(
                          (skill, index) => (
                            <span
                              key={`${job.id}-${index}`}
                            >
                              {skill}
                            </span>
                          )
                        )}

                      </div>
                    )}


                    <div className="jobs-card-footer">

                      <Link
                        to={`/jobs/${job.id}`}
                        className="view-job-button"
                      >
                        View Job
                        <ArrowRight size={17} />
                      </Link>

                    </div>

                  </article>
                );
              })}

            </div>

          ) : (

            !loading &&
            !error && (
              <div className="no-jobs-state">

                <Briefcase size={42} />

                <h3>No jobs found</h3>

                <p>
                  {jobs.length === 0
                    ? "There are currently no open positions."
                    : "Try changing your search or filters."}
                </p>


                {jobs.length > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}

              </div>
            )
          )}

        </div>

      </section>

    </div>
  );
}

export default JobsPage;