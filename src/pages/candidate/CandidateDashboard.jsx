import { useNavigate } from "react-router-dom";

import {
  BriefcaseBusiness,
  FileCheck2,
  CalendarDays,
  BadgeCheck,
  ArrowRight,
  Clock3,
  MapPin,
  Video,
  CheckCircle2,
  UserRound,
  Sparkles,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import "./CandidateDashboard.css";

function CandidateDashboard() {
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  const candidateName =
    loggedInUser?.userName || "Candidate";

  const firstName =
    candidateName.split(" ")[0] || "Candidate";

  // Temporary frontend data.
  // Backend integration will replace this later.

  const stats = {
    applications: 4,
    interviews: 1,
    offers: 1,
    profileCompletion: 85,
  };

  const recentApplications = [
    {
      id: 1,
      job: "Java Backend Developer",
      company: "Anasol Technologies",
      appliedDate: "10 Sep 2026",
      status: "Interview",
    },
    {
      id: 2,
      job: "Full Stack Developer",
      company: "TechNova Solutions",
      appliedDate: "08 Sep 2026",
      status: "Shortlisted",
    },
    {
      id: 3,
      job: "Software Engineer",
      company: "CloudMatrix",
      appliedDate: "05 Sep 2026",
      status: "AI Screened",
    },
  ];

  const upcomingInterview = {
    id: 1,
    job: "Java Backend Developer",
    company: "Anasol Technologies",
    date: "18 Sep 2026",
    time: "11:00 AM",
    type: "Technical",
    mode: "Online",
    platform: "Google Meet",
  };

  const recommendedJobs = [
    {
      id: 101,
      title: "Java Developer",
      company: "Innovate Systems",
      location: "Hyderabad",
      experience: "1 - 3 Years",
      type: "Full Time",
    },
    {
      id: 102,
      title: "Backend Engineer",
      company: "DigitalCore",
      location: "Bengaluru",
      experience: "1 - 2 Years",
      type: "Full Time",
    },
    {
      id: 103,
      title: "Full Stack Developer",
      company: "Nexa Technologies",
      location: "Hyderabad",
      experience: "2 - 4 Years",
      type: "Full Time",
    },
  ];

  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  return (
    <div className="candidate-layout">

      <CandidateSidebar />

      <div className="candidate-main">

        <CandidateNavbar />

        <main className="candidate-dashboard-content">

          {/* HEADER */}

          <div className="candidate-dashboard-header">

            <p className="candidate-label">
              CANDIDATE DASHBOARD
            </p>

            <h1>
              Welcome back, {firstName}
            </h1>

            <p>
              Track your applications, interviews and
              latest opportunities from one place.
            </p>

          </div>

          {/* SUMMARY CARDS */}

          <section className="candidate-summary-grid">

            <div className="candidate-summary-card">

              <div className="candidate-summary-icon applications">
                <FileCheck2 size={21} />
              </div>

              <div>
                <span>Total Applications</span>
                <strong>
                  {stats.applications}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/candidate/applications"
                    )
                  }
                >
                  View applications
                </button>
              </div>

            </div>

            <div className="candidate-summary-card">

              <div className="candidate-summary-icon interviews">
                <CalendarDays size={21} />
              </div>

              <div>
                <span>Upcoming Interviews</span>
                <strong>
                  {stats.interviews}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/candidate/interviews"
                    )
                  }
                >
                  View interviews
                </button>
              </div>

            </div>

            <div className="candidate-summary-card">

              <div className="candidate-summary-icon offers">
                <BadgeCheck size={21} />
              </div>

              <div>
                <span>Offers</span>
                <strong>
                  {stats.offers}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/candidate/offers"
                    )
                  }
                >
                  View offers
                </button>
              </div>

            </div>

            <div className="candidate-summary-card">

              <div className="candidate-summary-icon profile">
                <UserRound size={21} />
              </div>

              <div>
                <span>Profile Completion</span>

                <strong>
                  {stats.profileCompletion}%
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/candidate/profile"
                    )
                  }
                >
                  Complete profile
                </button>
              </div>

            </div>

          </section>

          {/* MAIN DASHBOARD GRID */}

          <section className="candidate-dashboard-grid">

            {/* RECENT APPLICATIONS */}

            <div className="candidate-dashboard-card candidate-applications-card">

              <div className="candidate-card-header">

                <div>
                  <h2>
                    Recent Applications
                  </h2>

                  <p>
                    Track the latest status of your
                    job applications.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/candidate/applications"
                    )
                  }
                >
                  View All
                  <ArrowRight size={15} />
                </button>

              </div>

              <div className="candidate-recent-applications">

                {recentApplications.map(
                  (application) => (

                    <div
                      className="candidate-application-row"
                      key={application.id}
                    >

                      <div className="candidate-application-job-icon">
                        <BriefcaseBusiness
                          size={19}
                        />
                      </div>

                      <div className="candidate-application-info">

                        <strong>
                          {application.job}
                        </strong>

                        <span>
                          {application.company}
                        </span>

                      </div>

                      <div className="candidate-application-date">

                        <Clock3 size={14} />

                        <span>
                          {application.appliedDate}
                        </span>

                      </div>

                      <span
                        className={`candidate-application-status ${getStatusClass(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* UPCOMING INTERVIEW */}

            <div className="candidate-dashboard-card candidate-upcoming-interview">

              <div className="candidate-card-header">

                <div>
                  <h2>
                    Upcoming Interview
                  </h2>

                  <p>
                    Your next scheduled interview.
                  </p>
                </div>

                <CalendarDays size={20} />

              </div>

              <div className="candidate-interview-highlight">

                <div className="candidate-interview-company-icon">
                  <BriefcaseBusiness size={21} />
                </div>

                <div>

                  <h3>
                    {upcomingInterview.job}
                  </h3>

                  <p>
                    {upcomingInterview.company}
                  </p>

                </div>

              </div>

              <div className="candidate-interview-details">

                <div>
                  <CalendarDays size={15} />

                  <span>
                    {upcomingInterview.date}
                  </span>
                </div>

                <div>
                  <Clock3 size={15} />

                  <span>
                    {upcomingInterview.time}
                  </span>
                </div>

                <div>
                  <Video size={15} />

                  <span>
                    {upcomingInterview.mode}
                  </span>
                </div>

                <div>
                  <MapPin size={15} />

                  <span>
                    {upcomingInterview.platform}
                  </span>
                </div>

              </div>

              <div className="candidate-interview-type">

                <span>Interview Type</span>

                <strong>
                  {upcomingInterview.type}
                </strong>

              </div>

              <button
                type="button"
                className="candidate-interview-view-button"
                onClick={() =>
                  navigate(
                    `/candidate/interviews/${upcomingInterview.id}`
                  )
                }
              >
                View Interview Details
                <ArrowRight size={15} />
              </button>

            </div>

          </section>

          {/* RECOMMENDED JOBS */}

          <section className="candidate-dashboard-card candidate-recommended-card">

            <div className="candidate-card-header">

              <div>
                <h2>
                  <Sparkles size={17} />
                  Recommended Jobs
                </h2>

                <p>
                  Opportunities that may match your
                  profile and experience.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/jobs")
                }
              >
                Browse All Jobs
                <ArrowRight size={15} />
              </button>

            </div>

            <div className="candidate-recommended-jobs">

              {recommendedJobs.map((job) => (

                <div
                  className="candidate-recommended-job"
                  key={job.id}
                >

                  <div className="candidate-job-top">

                    <div className="candidate-job-icon">
                      <BriefcaseBusiness
                        size={20}
                      />
                    </div>

                    <span>
                      {job.type}
                    </span>

                  </div>

                  <h3>{job.title}</h3>

                  <p>{job.company}</p>

                  <div className="candidate-job-meta">

                    <span>
                      <MapPin size={14} />
                      {job.location}
                    </span>

                    <span>
                      <BriefcaseBusiness
                        size={14}
                      />
                      {job.experience}
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/candidate/jobs/${job.id}`
                      )
                    }
                  >
                    View Job
                    <ArrowRight size={14} />
                  </button>

                </div>

              ))}

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default CandidateDashboard;