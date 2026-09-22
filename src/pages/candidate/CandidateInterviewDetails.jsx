import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Info,
  MapPin,
  UserRound,
  Video,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import { getMyInterviewsWithJobs } from "../../services/candidateService";
import { getErrorMessage } from "../../services/candidateHelpers";

import "./CandidateDashboard.css";

function CandidateInterviewDetails() {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Temporary frontend data.
  // Backend API will replace this later.
  const interviews = [
    {
      id: 1,
      jobTitle: "Java Backend Developer",
      company: "TalentAI",
      date: "18 Sep 2026",
      time: "11:00 AM",
      duration: "60 Minutes",
      type: "Technical Interview",
      mode: "Online",
      platform: "Google Meet",
      meetingLink: "https://meet.google.com/",
      interviewer: "Technical Interview Panel",
      status: "Upcoming",
      location: null,
      instructions: [
        "Join the meeting 10 minutes before the scheduled time.",
        "Keep your resume and project details ready for discussion.",
        "Ensure you have a stable internet connection and working microphone.",
        "Be prepared for Java, Spring Boot and backend development questions.",
      ],
    },
    {
      id: 2,
      jobTitle: "Full Stack Developer",
      company: "TalentAI",
      date: "14 Sep 2026",
      time: "02:30 PM",
      duration: "60 Minutes",
      type: "Technical Interview",
      mode: "Online",
      platform: "Microsoft Teams",
      meetingLink: null,
      interviewer: "Engineering Interview Panel",
      status: "Completed",
      location: null,
      instructions: [],
    },
    {
      id: 3,
      jobTitle: "Software Engineer",
      company: "TalentAI",
      date: "11 Sep 2026",
      time: "10:00 AM",
      duration: "45 Minutes",
      type: "HR Interview",
      mode: "On-site",
      platform: "Hyderabad Office",
      meetingLink: null,
      interviewer: "HR Interview Panel",
      status: "Completed",
      location: "CloudMatrix, Hyderabad Office",
      instructions: [],
    },
  ];


  // The candidate's own interview list is used to find this interview.
  useEffect(() => {
    let cancelled = false;

    const loadInterview = async () => {
      setLoading(true);
      setError("");

      try {
        const list = await getMyInterviewsWithJobs();

        if (!cancelled) {
          setInterview(
            list.find(
              (item) =>
                String(item.id) === String(interviewId)
            ) || null
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "Unable to load this interview."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInterview();

    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  if (loading || !interview) {
    return (
      <div className="candidate-layout">
        <CandidateSidebar />

        <div className="candidate-main">
          <CandidateNavbar />

          <main className="candidate-dashboard-content">
            <div className="candidate-job-not-found">
              <CalendarDays size={34} />

              <h2>
                {loading
                  ? "Loading interview..."
                  : error
                  ? "Unable to load interview"
                  : "Interview not found"}
              </h2>

              <p>
                {loading
                  ? "Please wait while we fetch your interview."
                  : error ||
                    "The interview you are trying to view does not exist."}
              </p>

              {!loading && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/candidate/interviews")
                  }
                >
                  Back to My Interviews
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isUpcoming =
    interview.status === "Upcoming";

  const isOnline =
    interview.mode === "Online";

  const handleJoinInterview = () => {
    if (!interview.meetingLink) {
      return;
    }

    const link = /^https?:\/\//i.test(interview.meetingLink)
      ? interview.meetingLink
      : `https://${interview.meetingLink}`;

    window.open(link, "_blank", "noopener,noreferrer");
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
            className="candidate-application-back"
            onClick={() =>
              navigate("/candidate/interviews")
            }
          >
            <ArrowLeft size={17} />
            Back to My Interviews
          </button>

          {/* HEADER */}

          <div className="candidate-interview-detail-header">
            <div>
              <p className="candidate-label">
                INTERVIEW DETAILS
              </p>

              <h1>{interview.jobTitle}</h1>

              <div className="candidate-interview-detail-company">
                <Building2 size={15} />
                <span>{interview.company}</span>
              </div>
            </div>

            <span
              className={`candidate-interview-detail-status ${interview.status.toLowerCase()}`}
            >
              {interview.status}
            </span>
          </div>

          {/* SCHEDULE SUMMARY */}

          <section className="candidate-interview-detail-summary">
            <div className="candidate-interview-detail-summary-item">
              <div>
                <CalendarDays size={19} />
              </div>

              <span>Interview Date</span>
              <strong>{interview.date}</strong>
            </div>

            <div className="candidate-interview-detail-summary-item">
              <div>
                <Clock3 size={19} />
              </div>

              <span>Interview Time</span>
              <strong>{interview.time}</strong>
            </div>

            <div className="candidate-interview-detail-summary-item">
              <div>
                <BriefcaseBusiness size={19} />
              </div>

              <span>Interview Type</span>
              <strong>{interview.type}</strong>
            </div>

            <div className="candidate-interview-detail-summary-item">
              <div>
                {isOnline ? (
                  <Video size={19} />
                ) : (
                  <MapPin size={19} />
                )}
              </div>

              <span>Interview Mode</span>
              <strong>{interview.mode}</strong>
            </div>
          </section>

          {/* MAIN CONTENT */}

          <div className="candidate-interview-detail-layout">
            <div className="candidate-interview-detail-main">
              {/* INTERVIEW INFORMATION */}

              <section className="candidate-interview-detail-card">
                <div className="candidate-interview-detail-card-header">
                  <div>
                    <BriefcaseBusiness size={19} />
                  </div>

                  <div>
                    <h2>Interview Information</h2>
                    <p>
                      Details about your scheduled
                      interview.
                    </p>
                  </div>
                </div>

                <div className="candidate-interview-information-grid">
                  <div>
                    <span>Interview Type</span>
                    <strong>
                      {interview.type}
                    </strong>
                  </div>

                  <div>
                    <span>Interview Mode</span>
                    <strong>
                      {interview.mode}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {isOnline
                        ? "Platform"
                        : "Location"}
                    </span>

                    <strong>
                      {isOnline
                        ? interview.platform
                        : interview.location}
                    </strong>
                  </div>

                  <div>
                    <span>Interviewer</span>
                    <strong>
                      {interview.interviewer}
                    </strong>
                  </div>
                </div>
              </section>

              {/* JOIN INTERVIEW */}

              {isUpcoming && isOnline && (
                <section className="candidate-join-interview-card">
                  <div className="candidate-join-interview-icon">
                    <Video size={25} />
                  </div>

                  <div className="candidate-join-interview-content">
                    <h2>Online Interview</h2>

                    <p>
                      Your interview will be conducted
                      through {interview.platform}. Use the
                      meeting link below at the scheduled
                      time.
                    </p>

                    <div className="candidate-interview-meeting-row">
                      <div>
                        <Video size={16} />

                        <span>
                          {interview.platform}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleJoinInterview}
                        disabled={!interview.meetingLink}
                      >
                        Join Interview
                        <ExternalLink size={15} />
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* ON-SITE LOCATION */}

              {isUpcoming && !isOnline && (
                <section className="candidate-interview-detail-card">
                  <div className="candidate-interview-detail-card-header">
                    <div>
                      <MapPin size={19} />
                    </div>

                    <div>
                      <h2>Interview Location</h2>
                      <p>
                        Your interview will be conducted
                        at the office.
                      </p>
                    </div>
                  </div>

                  <div className="candidate-onsite-location">
                    <MapPin size={19} />

                    <div>
                      <span>Office Location</span>
                      <strong>
                        {interview.location}
                      </strong>
                    </div>
                  </div>
                </section>
              )}

              {/* INSTRUCTIONS */}

              {isUpcoming &&
                interview.instructions.length > 0 && (
                  <section className="candidate-interview-detail-card">
                    <div className="candidate-interview-detail-card-header">
                      <div>
                        <Info size={19} />
                      </div>

                      <div>
                        <h2>
                          Interview Instructions
                        </h2>

                        <p>
                          Please review these instructions
                          before attending.
                        </p>
                      </div>
                    </div>

                    <div className="candidate-interview-instructions">
                      {interview.instructions.map(
                        (instruction, index) => (
                          <div
                            key={index}
                            className="candidate-interview-instruction"
                          >
                            <div>
                              <CheckCircle2 size={15} />
                            </div>

                            <p>{instruction}</p>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

              {/* COMPLETED */}

              {!isUpcoming && (
                <section className="candidate-completed-interview-card">
                  <div>
                    <CheckCircle2 size={23} />
                  </div>

                  <div>
                    <h2>
                      {interview.status === "Cancelled"
                        ? "Interview Cancelled"
                        : "Interview Completed"}
                    </h2>

                    <p>
                      {interview.status === "Cancelled"
                        ? "This interview has been cancelled. The recruitment team will contact you if it is rescheduled."
                        : "This interview has been completed. Your application status will be updated when the recruitment team completes the next review."}
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT SIDE */}

            <aside className="candidate-interview-detail-side">
              <section className="candidate-interview-side-card">
                <h2>Schedule</h2>

                <div className="candidate-interview-side-list">
                  <div>
                    <CalendarDays size={16} />

                    <div>
                      <span>Date</span>
                      <strong>
                        {interview.date}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <Clock3 size={16} />

                    <div>
                      <span>Time</span>
                      <strong>
                        {interview.time}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <BriefcaseBusiness size={16} />

                    <div>
                      <span>Type</span>
                      <strong>
                        {interview.type}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="candidate-interview-side-card">
                <h2>Interview Panel</h2>

                <div className="candidate-interviewer-info">
                  <div>
                    <UserRound size={20} />
                  </div>

                  <div>
                    <span>Interviewer</span>
                    <strong>
                      {interview.interviewer}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="candidate-interview-help-card">
                <Info size={18} />

                <div>
                  <strong>Need assistance?</strong>

                  <p>
                    Contact the recruitment team if you
                    have questions about your interview
                    schedule.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CandidateInterviewDetails;