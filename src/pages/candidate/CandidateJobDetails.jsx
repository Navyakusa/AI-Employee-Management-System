import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  Users,
  Wallet,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import { getJobById } from "../../services/candidateService";
import {
  getErrorMessage,
  mapJob,
} from "../../services/candidateHelpers";

import "./CandidateDashboard.css";

function CandidateJobDetails() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      salary: "₹4 - 7 LPA",
      openings: 3,
      posted: "2 days ago",
      education: "B.Tech / B.E / MCA",
      department: "Engineering",
      skills: [
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "REST API",
        "Git",
        "Hibernate",
      ],
      description:
        "We are looking for a Java Backend Developer to design, develop and maintain scalable backend applications using Java and Spring Boot.",
      responsibilities: [
        "Develop and maintain backend applications using Java and Spring Boot.",
        "Design and implement REST APIs.",
        "Work with PostgreSQL and database technologies.",
        "Collaborate with frontend developers and other team members.",
        "Write clean, maintainable and reusable code.",
      ],
      requirements: [
        "Strong knowledge of Core Java.",
        "Understanding of Spring Boot and REST APIs.",
        "Experience working with relational databases.",
        "Basic knowledge of Git and version control.",
        "Good problem-solving and communication skills.",
      ],
    },
    {
      id: 102,
      title: "Full Stack Developer",
      company: "TalentAI",
      location: "Bengaluru",
      experience: "1 - 3 Years",
      type: "Full Time",
      workMode: "Hybrid",
      salary: "₹5 - 8 LPA",
      openings: 2,
      posted: "3 days ago",
      education: "B.Tech / B.E / MCA",
      department: "Engineering",
      skills: [
        "Java",
        "Spring Boot",
        "React",
        "MySQL",
        "JavaScript",
      ],
      description:
        "We are looking for a Full Stack Developer to build modern web applications using Spring Boot and React.",
      responsibilities: [
        "Develop frontend applications using React.",
        "Build REST APIs using Spring Boot.",
        "Integrate frontend applications with backend services.",
        "Design and maintain database components.",
        "Participate in code reviews and testing.",
      ],
      requirements: [
        "Knowledge of Java and Spring Boot.",
        "Experience with React and JavaScript.",
        "Understanding of REST APIs.",
        "Knowledge of SQL databases.",
        "Good analytical and communication skills.",
      ],
    },
    {
      id: 103,
      title: "Software Engineer",
      company: "TalentAI",
      location: "Hyderabad",
      experience: "0 - 2 Years",
      type: "Full Time",
      workMode: "On-site",
      salary: "₹3.5 - 6 LPA",
      openings: 4,
      posted: "4 days ago",
      education: "B.Tech / B.E / MCA",
      department: "Technology",
      skills: ["Java", "SQL", "Git", "REST API"],
      description:
        "Join our engineering team to build and maintain enterprise software solutions.",
      responsibilities: [
        "Develop software features based on requirements.",
        "Fix application defects.",
        "Write reusable and maintainable code.",
        "Work with development and QA teams.",
      ],
      requirements: [
        "Good programming fundamentals.",
        "Knowledge of Java.",
        "Understanding of SQL.",
        "Basic knowledge of REST APIs and Git.",
      ],
    },
  ];

  useEffect(() => {
    let cancelled = false;

    const loadJob = async () => {
      setLoading(true);
      setError("");
      setJob(null);

      try {
        const data = await getJobById(jobId);

        if (!cancelled) {
          setJob(data ? mapJob(data) : null);
        }
      } catch (err) {
        if (!cancelled) {
          // 404 just means the job does not exist
          if (err?.response?.status !== 404) {
            setError(
              getErrorMessage(err, "Unable to load this job.")
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (loading) {
    return (
      <div className="candidate-layout">
        <CandidateSidebar />

        <div className="candidate-main">
          <CandidateNavbar />

          <main className="candidate-dashboard-content">
            <div className="candidate-job-not-found">
              <BriefcaseBusiness size={34} />

              <h2>Loading job...</h2>

              <p>Please wait while we fetch the job details.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="candidate-layout">
        <CandidateSidebar />

        <div className="candidate-main">
          <CandidateNavbar />

          <main className="candidate-dashboard-content">
            <div className="candidate-job-not-found">
              <BriefcaseBusiness size={34} />

              <h2>
                {error ? "Unable to load job" : "Job not found"}
              </h2>

              <p>
                {error ||
                  "The job you are trying to view is not available."}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/jobs")
                }
              >
                Back to Jobs
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    navigate(`/candidate/jobs/${job.id}/apply`);
  };

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          {/* BACK */}

          <button
            type="button"
            className="candidate-job-back-button"
            onClick={() => navigate("/candidate/jobs")}
          >
            <ArrowLeft size={17} />
            Back to Jobs
          </button>

          {/* JOB HEADER */}

          <section className="candidate-job-details-header">
            <div className="candidate-job-details-heading">
              <div className="candidate-job-details-logo">
                <Building2 size={29} />
              </div>

              <div>
                <div className="candidate-job-details-title-row">
                  <h1>{job.title}</h1>

                  <span>{job.type}</span>
                </div>

                <p className="candidate-job-details-company">
                  {job.company}
                </p>

                <div className="candidate-job-details-header-meta">
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
                      Posted {job.posted}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="candidate-apply-now-button"
              onClick={handleApply}
            >
              Apply Now
            </button>
          </section>

          {/* CONTENT */}

          <div className="candidate-job-details-grid">
            <div className="candidate-job-details-main">
              {/* DESCRIPTION */}

              <section className="candidate-job-details-card">
                <h2>Job Description</h2>

                <p>{job.description}</p>
              </section>

              {/* RESPONSIBILITIES */}

              {job.responsibilities.length > 0 && (
              <section className="candidate-job-details-card">
                <h2>Key Responsibilities</h2>

                <div className="candidate-job-details-list">
                  {job.responsibilities.map(
                    (responsibility) => (
                      <div key={responsibility}>
                        <CheckCircle2 size={17} />

                        <span>{responsibility}</span>
                      </div>
                    )
                  )}
                </div>
              </section>

              
              )}

              {/* REQUIREMENTS */}

              {job.requirements.length > 0 && (
              <section className="candidate-job-details-card">
                <h2>Requirements</h2>

                <div className="candidate-job-details-list">
                  {job.requirements.map(
                    (requirement) => (
                      <div key={requirement}>
                        <CheckCircle2 size={17} />

                        <span>{requirement}</span>
                      </div>
                    )
                  )}
                </div>
              </section>

              
              )}

              {/* SKILLS */}

              {job.skills.length > 0 && (
              <section className="candidate-job-details-card">
                <h2>Required Skills</h2>

                <div className="candidate-job-details-skills">
                  {job.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </section>
              )}

                          </div>

            {/* RIGHT SIDE */}

            <aside className="candidate-job-details-sidebar">
              <section className="candidate-job-overview-card">
                <h2>Job Overview</h2>

                <div className="candidate-job-overview-item">
                  <BriefcaseBusiness size={18} />

                  <div>
                    <span>Experience</span>
                    <strong>{job.experience}</strong>
                  </div>
                </div>

                <div className="candidate-job-overview-item">
                  <Wallet size={18} />

                  <div>
                    <span>Salary</span>
                    <strong>{job.salary}</strong>
                  </div>
                </div>

                <div className="candidate-job-overview-item">
                  <MapPin size={18} />

                  <div>
                    <span>Location</span>
                    <strong>{job.location}</strong>
                  </div>
                </div>

                <div className="candidate-job-overview-item">
                  <Building2 size={18} />

                  <div>
                    <span>Department</span>
                    <strong>{job.department}</strong>
                  </div>
                </div>

                <div className="candidate-job-overview-item">
                  <Users size={18} />

                  <div>
                    <span>Openings</span>
                    <strong>{job.openings}</strong>
                  </div>
                </div>

                <div className="candidate-job-overview-item">
                  <GraduationCap size={18} />

                  <div>
                    <span>Education</span>
                    <strong>{job.education}</strong>
                  </div>
                </div>

                <div className="candidate-job-overview-item">
                  <CalendarDays size={18} />

                  <div>
                    <span>Employment Type</span>
                    <strong>{job.type}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                >
                  Apply for this Job
                </button>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CandidateJobDetails;