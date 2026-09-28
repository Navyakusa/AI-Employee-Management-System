import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  Brain,
  FileCheck,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

import apiClient from "../../services/apiClient";

function HomePage() {
  // =========================================================
  // FEATURED JOBS STATE
  // =========================================================

  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  // =========================================================
  // LOAD JOBS FROM BACKEND
  // GET /api/jobs/all
  // =========================================================

  useEffect(() => {
    const loadFeaturedJobs = async () => {
      try {
        setJobsLoading(true);
        setJobsError("");

        const response = await apiClient.get("/jobs/all");

        const jobs =
          response.data?.data ||
          response.data ||
          [];

        // Only OPEN jobs should be displayed publicly
        const openJobs = Array.isArray(jobs)
          ? jobs.filter(
              (job) =>
                job.status?.toUpperCase() === "OPEN"
            )
          : [];

        // Show maximum 3 jobs on home page
        setFeaturedJobs(openJobs.slice(0, 3));
      } catch (error) {
        console.error(
          "Failed to load featured jobs:",
          error
        );

        setJobsError(
          error.response?.data?.message ||
            "Unable to load featured jobs."
        );
      } finally {
        setJobsLoading(false);
      }
    };

    loadFeaturedJobs();
  }, []);

  // =========================================================
  // FORMAT EXPERIENCE
  // =========================================================

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

    if (max !== null && max !== undefined) {
      return `Up to ${max} Years`;
    }

    return "Not specified";
  };

  // =========================================================
  // GET SKILLS
  // =========================================================

  const getSkills = (job) => {
    if (!job.requiredSkills) {
      return [];
    }

    if (Array.isArray(job.requiredSkills)) {
      return job.requiredSkills.slice(0, 3);
    }

    return job.requiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
      .slice(0, 3);
  };

  return (
    <div className="home-page">

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container hero-content">

          <div className="hero-text">
            <span className="hero-badge">
              AI-Powered Recruitment Platform
            </span>

            <h1>
              Find the right opportunity.
              <span> Build your future.</span>
            </h1>

            <p>
              Discover career opportunities that match your
              skills, experience, and ambitions.
            </p>

            <div className="hero-buttons">
              <Link to="/jobs" className="btn btn-primary">
                Explore Jobs
                <ArrowRight size={18} />
              </Link>

              <Link to="/about" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-icon">
              <Users size={34} />
            </div>

            <h3>Smart Recruitment</h3>

            <p>
              AI-assisted screening helps organizations
              discover the right candidates faster.
            </p>

            <div className="hero-stat">
              <strong>1000+</strong>
              <span>Applications Processed</span>
            </div>

            <div className="hero-stat">
              <strong>500+</strong>
              <span>Candidates Screened</span>
            </div>
          </div>

        </div>
      </section>


      {/* JOB SEARCH */}
      <section className="job-search-section">
        <div className="container">

          <div className="job-search-box">

            <div className="search-field">
              <Search size={20} />

              <input
                type="text"
                placeholder="Job title or keyword"
              />
            </div>

            <div className="search-field">
              <MapPin size={20} />

              <input
                type="text"
                placeholder="Location"
              />
            </div>

            <Link to="/jobs" className="search-button">
              Search Jobs
            </Link>

          </div>

        </div>
      </section>


      {/* FEATURED JOBS */}
      <section className="section">
        <div className="container">

          <div className="section-header">
            <div>
              <span className="section-label">
                CAREER OPPORTUNITIES
              </span>

              <h2>Featured Jobs</h2>

              <p>
                Explore some of our latest opportunities.
              </p>
            </div>

            <Link to="/jobs" className="view-all-link">
              View All Jobs
              <ArrowRight size={18} />
            </Link>
          </div>


          {/* LOADING */}
          {jobsLoading && (
            <p>Loading featured jobs...</p>
          )}


          {/* ERROR */}
          {!jobsLoading && jobsError && (
            <p className="form-error">
              {jobsError}
            </p>
          )}


          {/* NO OPEN JOBS */}
          {!jobsLoading &&
            !jobsError &&
            featuredJobs.length === 0 && (
              <p>
                No open positions are available right now.
              </p>
            )}


          {/* REAL BACKEND JOBS */}
          {!jobsLoading &&
            !jobsError &&
            featuredJobs.length > 0 && (

              <div className="jobs-grid">

                {featuredJobs.map((job) => {

                  const skills = getSkills(job);

                  return (
                    <div
                      className="job-card"
                      key={job.id}
                    >

                      <div className="job-card-top">

                        <div className="job-icon">
                          <Briefcase size={22} />
                        </div>

                        <span className="job-type">
                          {job.employmentType ||
                            "Not specified"}
                        </span>

                      </div>

                      <h3>
                        {job.title}
                      </h3>

                      <p className="department">
                        {job.department ||
                          "Department not specified"}
                      </p>

                      <div className="job-info">

                        <span>
                          <MapPin size={16} />
                          {job.location ||
                            "Location not specified"}
                        </span>

                        <span>
                          <Briefcase size={16} />
                          {getExperience(job)}
                        </span>

                      </div>


                      {skills.length > 0 && (
                        <div className="skills">

                          {skills.map(
                            (skill, index) => (
                              <span
                                key={`${job.id}-${skill}-${index}`}
                              >
                                {skill}
                              </span>
                            )
                          )}

                        </div>
                      )}


                      <Link
                        to={`/jobs/${job.id}`}
                        className="job-link"
                      >
                        View Job
                        <ArrowRight size={17} />
                      </Link>

                    </div>
                  );
                })}

              </div>
            )}

        </div>
      </section>


      {/* WHY CHOOSE US */}
      <section className="section why-section">
        <div className="container">

          <div className="center-heading">
            <span className="section-label">
              SMARTER RECRUITMENT
            </span>

            <h2>
              A Better Hiring Experience
            </h2>

            <p>
              Technology that makes recruitment simpler,
              faster and more transparent.
            </p>
          </div>

          <div className="features-grid">

            <div className="feature-card">
              <Brain size={30} />

              <h3>
                AI-Powered Screening
              </h3>

              <p>
                Candidates are evaluated based on
                relevant skills and job requirements.
              </p>
            </div>

            <div className="feature-card">
              <FileCheck size={30} />

              <h3>
                Smart Resume Analysis
              </h3>

              <p>
                Resume information can be processed
                into structured candidate profiles.
              </p>
            </div>

            <div className="feature-card">
              <CalendarCheck size={30} />

              <h3>
                Organized Interviews
              </h3>

              <p>
                Interview scheduling and evaluations
                stay organized throughout hiring.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">

          <div className="center-heading">
            <span className="section-label">
              YOUR JOURNEY
            </span>

            <h2>
              How Our Recruitment Process Works
            </h2>
          </div>

          <div className="process-grid">

            <div className="process-item">
              <span>01</span>
              <h3>Find a Job</h3>
              <p>
                Browse available opportunities
                matching your interests.
              </p>
            </div>

            <div className="process-item">
              <span>02</span>
              <h3>Apply Online</h3>
              <p>
                Submit your information and upload
                your resume.
              </p>
            </div>

            <div className="process-item">
              <span>03</span>
              <h3>Get Screened</h3>
              <p>
                Your profile progresses through
                screening and shortlisting.
              </p>
            </div>

            <div className="process-item">
              <span>04</span>
              <h3>Interview</h3>
              <p>
                Attend scheduled interviews with
                the hiring team.
              </p>
            </div>

            <div className="process-item">
              <span>05</span>
              <h3>Join the Team</h3>
              <p>
                Successful candidates continue to
                offer and onboarding.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="cta-section">

        <div className="container cta-content">

          <div>
            <h2>
              Ready to take the next step?
            </h2>

            <p>
              Explore available positions and find
              an opportunity that fits you.
            </p>
          </div>

          <Link to="/jobs" className="cta-button">
            Browse Open Positions
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

    </div>
  );
}

export default HomePage;