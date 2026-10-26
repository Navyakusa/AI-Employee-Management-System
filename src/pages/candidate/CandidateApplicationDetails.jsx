import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MapPin,
  Sparkles,
  UserCheck,
  Video,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import {
  getMyApplicationsWithJobs,
  getMyInterviewsWithJobs,
} from "../../services/candidateService";
import { getErrorMessage } from "../../services/candidateHelpers";

import "./CandidateDashboard.css";

function CandidateApplicationDetails() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Temporary frontend data.
  // Backend API will replace this later.
  const applications = [
    {
      id: 1,
      jobTitle: "Java Backend Developer",
      company: "TalentAI",
      location: "Hyderabad",
      type: "Full Time",
      appliedDate: "10 Sep 2026",
      status: "Interview",
      currentStep: 4,
      applicationId: "APP-2026-001",
      interview: {
        date: "18 Sep 2026",
        time: "11:00 AM",
        mode: "Online",
        type: "Technical Interview",
      },
    },
    {
      id: 2,
      jobTitle: "Full Stack Developer",
      company: "TalentAI",
      location: "Bengaluru",
      type: "Full Time",
      appliedDate: "08 Sep 2026",
      status: "Shortlisted",
      currentStep: 3,
      applicationId: "APP-2026-002",
    },
    {
      id: 3,
      jobTitle: "Software Engineer",
      company: "TalentAI",
      location: "Hyderabad",
      type: "Full Time",
      appliedDate: "05 Sep 2026",
      status: "AI Screened",
      currentStep: 2,
      applicationId: "APP-2026-003",
    },
    {
      id: 4,
      jobTitle: "React Developer",
      company: "TalentAI",
      location: "Pune",
      type: "Full Time",
      appliedDate: "02 Sep 2026",
      status: "Applied",
      currentStep: 1,
      applicationId: "APP-2026-004",
    },
  ];

  // There is no "get one application" endpoint for candidates, so the
  // application is found in the candidate's own list.
  
useEffect(() => {
  let cancelled = false;

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const [list, interviews] = await Promise.all([
        getMyApplicationsWithJobs(),
        getMyInterviewsWithJobs().catch(() => []),
      ]);

      if (cancelled) return;

      // Match by application ID, not candidate ID or job ID.
      const found = list.find(
        (item) => String(item.id) === String(applicationId)
      );

      const matchedInterview = found
        ? interviews.find(
            (interview) =>
              String(interview.applicationId) === String(found.id) &&
              interview.status === "Upcoming"
          ) || null
        : null;

      setApplication(
        found
          ? {
              ...found,
              interview: matchedInterview,
              currentStep: matchedInterview
                ? 4
                : found.currentStep,
            }
          : null
      );
    } catch (err) {
      if (!cancelled) {
        setError(
          getErrorMessage(err, "Unable to load this application.")
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadApplication();

  const refreshOnFocus = () => {
    if (document.visibilityState === "visible") {
      loadApplication();
    }
  };

  window.addEventListener("focus", refreshOnFocus);
  document.addEventListener("visibilitychange", refreshOnFocus);

  return () => {
    cancelled = true;
    window.removeEventListener("focus", refreshOnFocus);
    document.removeEventListener("visibilitychange", refreshOnFocus);
  };
}, [applicationId]);


  const steps = [
    {
      id: 1,
      title: "Applied",
      description:
        "Your application has been submitted successfully.",
      icon: FileCheck2,
    },
    {
      id: 2,
      title: "AI Screened",
      description:
        "Your resume has completed the initial screening process.",
      icon: Sparkles,
    },
    {
      id: 3,
      title: "Shortlisted",
      description:
        "Your profile has been shortlisted for the next stage.",
      icon: UserCheck,
    },
    {
      id: 4,
      title: "Interview",
      description:
        "Interview stage of the recruitment process.",
      icon: Video,
    },
    {
      id: 5,
      title: "Final Decision",
      description:
        "Final recruitment decision after interview review.",
      icon: CheckCircle2,
    },
  ];

  const getStatusClass = (status) =>
    status.toLowerCase().replace(/\s+/g, "-");

  if (loading || !application) {
    return (
      <div className="candidate-layout">
        <CandidateSidebar />

        <div className="candidate-main">
          <CandidateNavbar />

          <main className="candidate-dashboard-content">
            <div className="candidate-job-not-found">
              <BriefcaseBusiness size={34} />

              <h2>
                {loading
                  ? "Loading application..."
                  : error
                  ? "Unable to load application"
                  : "Application not found"}
              </h2>

              <p>
                {loading
                  ? "Please wait while we fetch your application."
                  : error ||
                    "The application you are trying to view does not exist."}
              </p>

              {!loading && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/candidate/applications")
                  }
                >
                  Back to My Applications
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          {/* BACK */}

          <button
            type="button"
            className="candidate-application-back"
            onClick={() =>
              navigate("/candidate/applications")
            }
          >
            <ArrowLeft size={17} />
            Back to My Applications
          </button>

          {/* HEADER */}

          <div className="candidate-app-detail-header">
            <div>
              <p className="candidate-label">
                APPLICATION DETAILS
              </p>

              <h1>{application.jobTitle}</h1>

              <div className="candidate-app-detail-company">
                <Building2 size={15} />
                <span>{application.company}</span>
              </div>
            </div>

            <span
              className={`candidate-app-detail-status ${getStatusClass(
                application.status
              )}`}
            >
              {application.interview
  ? "Interview"
  : application.status}
            </span>
          </div>

          {/* SUMMARY */}

          <section className="candidate-app-detail-summary">
            <div className="candidate-app-detail-summary-item">
              <div>
                <BriefcaseBusiness size={18} />
              </div>

              <span>Employment Type</span>
              <strong>{application.type}</strong>
            </div>

            <div className="candidate-app-detail-summary-item">
              <div>
                <MapPin size={18} />
              </div>

              <span>Location</span>
              <strong>{application.location}</strong>
            </div>

            <div className="candidate-app-detail-summary-item">
              <div>
                <CalendarDays size={18} />
              </div>

              <span>Applied On</span>
              <strong>{application.appliedDate || "Not available"}</strong>
            </div>

            <div className="candidate-app-detail-summary-item">
              <div>
                <FileCheck2 size={18} />
              </div>

              <span>Application ID</span>
              <strong>{application.applicationCode}</strong>
            </div>
          </section>

          <div className="candidate-app-detail-layout">
            {/* PROGRESS */}

            <section className="candidate-app-progress-card">
              <div className="candidate-app-section-title">
                <div>
                  <h2>Application Progress</h2>

                  <p>
                    Track where your application currently
                    stands in the recruitment process.
                  </p>
                </div>
              </div>

              <div className="candidate-application-timeline">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;

                  const completed =
                    step.id < application.currentStep;

                  const active =
                    step.id === application.currentStep;

                  return (
                    <div
                      className={`candidate-timeline-step ${
                        completed
                          ? "completed"
                          : active
                          ? "active"
                          : "pending"
                      }`}
                      key={step.id}
                    >
                      <div className="candidate-timeline-left">
                        <div className="candidate-timeline-icon">
                          {completed ? (
                            <Check size={17} />
                          ) : (
                            <StepIcon size={17} />
                          )}
                        </div>

                        {index !== steps.length - 1 && (
                          <div className="candidate-timeline-line" />
                        )}
                      </div>

                      <div className="candidate-timeline-content">
                        <div className="candidate-timeline-title">
                          <h3>{step.title}</h3>

                          {completed && (
                            <span>Completed</span>
                          )}

                          {active && (
                            <span className="current">
                              Current Stage
                            </span>
                          )}
                        </div>

                        <p>{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* RIGHT SIDE */}

            <div className="candidate-app-detail-side">
              {/* CURRENT STATUS */}

              <section className="candidate-app-info-card">
                <h2>Current Status</h2>

                <div className="candidate-current-stage">
                  <div>
                    <Clock3 size={21} />
                  </div>

                  <div>
                    <span>Your application is currently</span>
                    <strong>
  {application.interview ? "Interview" : application.status}
</strong>
                  </div>
                </div>

                <p>
                  {application.rawStatus === "WITHDRAWN"
                    ? "You withdrew this application."
                    : "We'll update your application status as it moves through the recruitment process."}
                </p>
              </section>

              {/* INTERVIEW INFORMATION */}

              {application.interview && (
                <section className="candidate-app-info-card">
                  <div className="candidate-app-info-heading">
                    <Video size={18} />
                    <h2>Upcoming Interview</h2>
                  </div>

                  <div className="candidate-app-interview-info">
                    <div>
                      <CalendarDays size={15} />

                      <span>
                        {application.interview.date}
                      </span>
                    </div>

                    <div>
                      <Clock3 size={15} />

                      <span>
                        {application.interview.time}
                      </span>
                    </div>

                    <div>
                      <Video size={15} />

                      <span>
                        {application.interview.mode}
                      </span>
                    </div>

                    <div>
                      <BriefcaseBusiness size={15} />

                      <span>
                        {application.interview.type}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="candidate-view-interview-button"
                    onClick={() =>
                      navigate(
                        `/candidate/interviews/${application.interview.id}`
                      )
                    }
                  >
                    View Interview Details
                  </button>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CandidateApplicationDetails;