import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  ArrowRight,
  SlidersHorizontal,
  Building2,
  RotateCcw,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import { getAllJobs } from "../../services/candidateService";
import {
  getErrorMessage,
  mapJob,
} from "../../services/candidateHelpers";

import "./CandidateDashboard.css";

function CandidateJobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Temporary frontend data.
  // Backend API will replace this later.
  const jobs = [
    {
      id: 101,
      title: "Java Backend Developer",
      company: "TalentAI",
      location: "Hyderabad",
      experience: "1 - 3 Years",
      type: "Full Time",
      workMode: "Hybrid",
      posted: "2 days ago",
      skills: [
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "REST API",
      ],
      description:
        "We are looking for a Java Backend Developer to build scalable backend services and REST APIs.",
    },
    {
      id: 102,
      title: "Full Stack Developer",
      company: "TalentAI",
      location: "Bengaluru",
      experience: "1 - 3 Years",
      type: "Full Time",
      workMode: "Hybrid",
      posted: "3 days ago",
      skills: [
        "Java",
        "Spring Boot",
        "React",
        "MySQL",
      ],
      description:
        "Join our engineering team to develop modern full stack applications using Java, Spring Boot and React.",
    },
    {
      id: 103,
      title: "Software Engineer",
      company: "TalentAI",
      location: "Hyderabad",
      experience: "0 - 2 Years",
      type: "Full Time",
      workMode: "On-site",
      posted: "4 days ago",
      skills: [
        "Java",
        "SQL",
        "Git",
        "REST API",
      ],
      description:
        "Work with our product engineering team to design, develop and maintain enterprise applications.",
    },
    {
      id: 104,
      title: "React Developer",
      company: "TalentAI",
      location: "Pune",
      experience: "1 - 2 Years",
      type: "Full Time",
      workMode: "Remote",
      posted: "5 days ago",
      skills: [
        "React",
        "JavaScript",
        "HTML",
        "CSS",
      ],
      description:
        "Develop responsive and reusable frontend components for modern web applications using React.",
    },
    {
      id: 105,
      title: "Spring Boot Developer",
      company: "TalentAI",
      location: "Chennai",
      experience: "2 - 4 Years",
      type: "Full Time",
      workMode: "On-site",
      posted: "1 week ago",
      skills: [
        "Java",
        "Spring Boot",
        "Hibernate",
        "PostgreSQL",
      ],
      description:
        "Build secure and scalable enterprise backend applications using Java and Spring Boot.",
    },
    {
      id: 106,
      title: "Junior Java Developer",
      company: "TalentAI",
      location: "Hyderabad",
      experience: "0 - 1 Years",
      type: "Full Time",
      workMode: "On-site",
      posted: "1 week ago",
      skills: [
        "Java",
        "Spring MVC",
        "MySQL",
        "Git",
      ],
      description:
        "Great opportunity for junior developers to work on Java-based enterprise applications.",
    },
  ];

  [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllJobs();

      // Candidates only see jobs that are still open.
      setJobs(
        data
          .map(mapJob)
          .filter((job) => job.status === "OPEN")
      );
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load jobs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );
  const [location, setLocation] = useState("All Locations");
  const [experience, setExperience] =
    useState("All Experience");

  // Keep the search box in sync when the navbar search is used
  // while already on this page.
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const locations = [
    "All Locations",
    ...new Set(jobs.map((job) => job.location)),
  ];

  const experienceOptions = [
    "All Experience",
    ...new Set(jobs.map((job) => job.experience)),
  ];

  const filteredJobs = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !searchValue ||
        job.title.toLowerCase().includes(searchValue) ||
        job.company.toLowerCase().includes(searchValue) ||
        job.skills.some((skill) =>
          skill.toLowerCase().includes(searchValue)
        );

      const matchesLocation =
        location === "All Locations" ||
        job.location === location;

      const matchesExperience =
        experience === "All Experience" ||
        job.experience === experience;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesExperience
      );
    });
  }, [jobs, search, location, experience]);

  const clearFilters = () => {
    setSearch("");
    setLocation("All Locations");
    setExperience("All Experience");
  };

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          {/* PAGE HEADER */}

          <div className="candidate-jobs-page-header">
            <div>
              <p className="candidate-label">
                JOB OPPORTUNITIES
              </p>

              <h1>Browse Jobs</h1>

              <p>
                Discover opportunities that match your
                skills, experience and career goals.
              </p>
            </div>

            <div className="candidate-jobs-count">
              <BriefcaseBusiness size={20} />

              <div>
                <strong>{filteredJobs.length}</strong>
                <span>Jobs Available</span>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTERS */}

          <section className="candidate-job-filter-card">
            <div className="candidate-job-search">
              <Search size={19} />

              <input
                type="text"
                placeholder="Search by job title, company or skill..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="candidate-job-filter">
              <MapPin size={18} />

              <select
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
              >
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="candidate-job-filter">
              <BriefcaseBusiness size={18} />

              <select
                value={experience}
                onChange={(event) =>
                  setExperience(event.target.value)
                }
              >
                {experienceOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="candidate-clear-filter"
              onClick={clearFilters}
            >
              <RotateCcw size={16} />
              Clear
            </button>
          </section>

          {/* RESULTS HEADER */}

          <div className="candidate-job-results-header">
            <div>
              <h2>Available Opportunities</h2>

              <p>
                Showing {filteredJobs.length}{" "}
                {filteredJobs.length === 1
                  ? "job"
                  : "jobs"}
              </p>
            </div>

            <div className="candidate-filter-indicator">
              <SlidersHorizontal size={16} />
              Filtered Results
            </div>
          </div>

          {/* JOB LIST */}

          {loading ? (
            <div className="candidate-no-jobs">
              <div>
                <BriefcaseBusiness size={28} />
              </div>

              <h3>Loading jobs...</h3>

              <p>
                Please wait while we fetch the latest
                openings.
              </p>
            </div>
          ) : error ? (
            <div className="candidate-no-jobs">
              <div>
                <Search size={28} />
              </div>

              <h3>Unable to load jobs</h3>

              <p>{error}</p>

              <button type="button" onClick={loadJobs}>
                Try Again
              </button>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="candidate-jobs-list">
              {filteredJobs.map((job) => (
                <article
                  className="candidate-job-list-card"
                  key={job.id}
                >
                  <div className="candidate-job-list-main">
                    <div className="candidate-job-company-logo">
                      <Building2 size={24} />
                    </div>

                    <div className="candidate-job-list-info">
                      <div className="candidate-job-title-row">
                        <div>
                          <h3>{job.title}</h3>
                          <p>{job.company}</p>
                        </div>

                        <span className="candidate-job-type-badge">
                          {job.type}
                        </span>
                      </div>

                      <div className="candidate-job-list-meta">
                        <span>
                          <MapPin size={15} />
                          {job.location}
                        </span>

                        <span>
                          <BriefcaseBusiness size={15} />
                          {job.experience}
                        </span>

                        <span>
                          <Building2 size={15} />
                          {job.department}
                        </span>

                        {job.posted && (
                          <span>
                            <Clock3 size={15} />
                            {job.posted}
                          </span>
                        )}
                      </div>

                      <p className="candidate-job-description">
                        {job.description}
                      </p>

                      <div className="candidate-job-skills">
                        {job.skills.map((skill) => (
                          <span key={skill}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="candidate-job-list-actions">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/candidate/jobs/${job.id}`
                        )
                      }
                    >
                      View Details
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="candidate-no-jobs">
              <div>
                <Search size={28} />
              </div>

              <h3>No jobs found</h3>

              <p>
                We couldn't find jobs matching your
                current search and filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CandidateJobs;