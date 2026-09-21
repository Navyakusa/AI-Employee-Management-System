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