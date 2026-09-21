import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  User,
  BriefcaseBusiness,
  Mail,
  ClipboardCheck,
  ExternalLink,
  FileText,
  CheckCircle2,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import "./InterviewerDashboard.css";

function InterviewerInterviewDetails() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  // Temporary frontend data.
  // Backend integration will replace this later.
  const interviews = [
    {
      id: 1,
      candidateId: 1,
      candidate: "Ananya Sharma",
      email: "ananya@gmail.com",
      job: "Java Backend Developer",
      experience: "3 Years",
      date: "16 Sep 2026",
      time: "11:00 AM",
      type: "Technical",
      mode: "Online",
      location: "Google Meet",
      meetingLink: "https://meet.google.com/",
      status: "Scheduled",
      evaluationStatus: "Not Available",
      skills: [
        "Java",
        "Spring Boot",
        "REST API",
        "PostgreSQL",
      ],
      notes:
        "Evaluate Java fundamentals, Spring Boot, REST APIs and backend problem-solving skills.",
    },

    {
      id: 2,
      candidateId: 2,
      candidate: "Rahul Verma",
      email: "rahul@gmail.com",
      job: "React Frontend Developer",
      experience: "2 Years",
      date: "16 Sep 2026",
      time: "2:30 PM",
      type: "Technical",
      mode: "Online",
      location: "Microsoft Teams",
      meetingLink: "https://teams.microsoft.com/",
      status: "Scheduled",
      evaluationStatus: "Not Available",
      skills: [
        "React",
        "JavaScript",
        "CSS",
        "HTML",
      ],
      notes:
        "Evaluate React fundamentals, JavaScript knowledge, component design and frontend problem-solving skills.",
    },

    {
      id: 3,
      candidateId: 3,
      candidate: "Sneha Reddy",
      email: "sneha@gmail.com",
      job: "QA Engineer",
      experience: "4 Years",
      date: "15 Sep 2026",
      time: "10:00 AM",
      type: "Technical",
      mode: "Offline",
      location: "Hyderabad Office",
      meetingLink: null,
      status: "Completed",
      evaluationStatus: "Pending",
      skills: [
        "Selenium",
        "Postman",
        "Java",
        "API Testing",
      ],
      notes:
        "Evaluate testing fundamentals, API testing, automation knowledge and problem-solving skills.",
    },

    {
      id: 4,
      candidateId: 4,
      candidate: "Arjun Kumar",
      email: "arjun@gmail.com",
      job: "DevOps Engineer",
      experience: "3 Years",
      date: "18 Sep 2026",
      time: "12:00 PM",
      type: "Technical",
      mode: "Online",
      location: "Google Meet",
      meetingLink: "https://meet.google.com/",
      status: "Scheduled",
      evaluationStatus: "Not Available",
      skills: [
        "Docker",
        "AWS",
        "Jenkins",
        "Linux",
      ],
      notes:
        "Evaluate DevOps fundamentals, CI/CD, Docker, cloud knowledge and deployment troubleshooting.",
    },

    {
      id: 5,
      candidateId: 5,
      candidate: "Meghana Rao",
      email: "meghana@gmail.com",
      job: "Full Stack Developer",
      experience: "3 Years",
      date: "14 Sep 2026",
      time: "3:00 PM",
      type: "Technical",
      mode: "Online",
      location: "Microsoft Teams",
      meetingLink: "https://teams.microsoft.com/",
      status: "Completed",
      evaluationStatus: "Submitted",
      skills: [
        "Java",
        "Spring Boot",
        "React",
        "PostgreSQL",
      ],
      notes:
        "Evaluate full stack development knowledge, API design, React and backend integration.",
    },
  ];

  const interview = interviews.find(
    (item) =>
      item.id === Number(interviewId)
  );

  /*
    Important:
    Do NOT use || interviews[0].

    If an invalid interview ID is opened,
    we should not accidentally display
    another candidate's details.
  */

  if (!interview) {
    return (
      <div className="interviewer-layout">

        <InterviewerSidebar />

        <div className="interviewer-main">

          <InterviewerNavbar />

          <main className="interviewer-dashboard-content">

            <section className="interviewer-details-not-found">

              <CalendarDays size={42} />

              <h2>Interview not found</h2>

              <p>
                The requested interview could not
                be found.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/interviewer/interviews"
                  )
                }
              >
                <ArrowLeft size={16} />
                Back to Interviews
              </button>

            </section>

          </main>

        </div>

      </div>
    );
  }

  const initials = interview.candidate
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isCompleted =
    interview.status === "Completed";

  const evaluationPending =
    isCompleted &&
    interview.evaluationStatus === "Pending";

  const evaluationSubmitted =
    interview.evaluationStatus === "Submitted";

  return (
    <div className="interviewer-layout">

      <InterviewerSidebar />

      <div className="interviewer-main">

        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">

          {/* HEADER */}

          <div className="interviewer-dashboard-header">

            <p className="interviewer-label">
              INTERVIEW DETAILS
            </p>

            <h1>Interview Details</h1>

            <p>
              Review candidate information and
              interview requirements.
            </p>

          </div>

          {/* MAIN CARD */}

          <section className="interviewer-details-card">

            {/* TOP */}

            <div className="interviewer-details-top">

              <div className="interviewer-details-candidate">

                <div className="interviewer-details-avatar">
                  {initials}
                </div>

                <div>

                  <h2>
                    {interview.candidate}
                  </h2>

                  <p>
                    {interview.job}
                  </p>

                </div>

              </div>

              <span
                className={`interviewer-interview-status ${interview.status.toLowerCase()}`}
              >
                {interview.status}
              </span>

            </div>

            {/* CANDIDATE INFO */}

            <div className="interviewer-details-section">

              <div className="interviewer-details-section-title">

                <User size={18} />

                <div>
                  <h3>
                    Candidate Information
                  </h3>

                  <p>
                    Candidate details for this
                    interview.
                  </p>
                </div>

              </div>

              <div className="interviewer-details-info-grid">

                <div className="interviewer-details-info-item">

                  <Mail size={18} />

                  <div>
                    <span>Email</span>

                    <strong>
                      {interview.email}
                    </strong>
                  </div>

                </div>

                <div className="interviewer-details-info-item">

                  <BriefcaseBusiness size={18} />

                  <div>
                    <span>
                      Applied Position
                    </span>

                    <strong>
                      {interview.job}
                    </strong>
                  </div>

                </div>

                <div className="interviewer-details-info-item">

                  <User size={18} />

                  <div>
                    <span>Experience</span>

                    <strong>
                      {interview.experience}
                    </strong>
                  </div>

                </div>

                <div className="interviewer-details-info-item">

                  <FileText size={18} />

                  <div>
                    <span>Candidate Profile</span>

                    <button
                      type="button"
                      className="interviewer-details-link-button"
                      onClick={() =>
                        navigate(
                          `/interviewer/candidates/${interview.candidateId}`
                        )
                      }
                    >
                      View Candidate
                    </button>

                  </div>

                </div>

              </div>

            </div>

            {/* INTERVIEW SCHEDULE */}

            <div className="interviewer-details-section">

              <div className="interviewer-details-section-title">

                <CalendarDays size={18} />

                <div>
                  <h3>
                    Interview Schedule
                  </h3>

                  <p>
                    Scheduled interview date,
                    time and mode.
                  </p>
                </div>

              </div>

              <div className="interviewer-details-info-grid">

                <div className="interviewer-details-info-item">

                  <CalendarDays size={18} />

                  <div>
                    <span>Date</span>

                    <strong>
                      {interview.date}
                    </strong>
                  </div>

                </div>

                <div className="interviewer-details-info-item">

                  <Clock3 size={18} />

                  <div>
                    <span>Time</span>

                    <strong>
                      {interview.time}
                    </strong>
                  </div>

                </div>

                <div className="interviewer-details-info-item">

                  {interview.mode === "Online" ? (
                    <Video size={18} />
                  ) : (
                    <MapPin size={18} />
                  )}

                  <div>
                    <span>
                      Interview Mode
                    </span>

                    <strong>
                      {interview.mode}
                    </strong>
                  </div>

                </div>

                <div className="interviewer-details-info-item">

                  <MapPin size={18} />

                  <div>
                    <span>
                      {interview.mode === "Online"
                        ? "Platform"
                        : "Location"}
                    </span>

                    <strong>
                      {interview.location}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

            {/* INTERVIEW TYPE */}

            <div className="interviewer-details-section">

              <div className="interviewer-details-section-title">

                <ClipboardCheck size={18} />

                <div>
                  <h3>
                    Interview Type
                  </h3>

                  <p>
                    Evaluation category assigned
                    for this interview.
                  </p>
                </div>

              </div>

              <div className="interviewer-details-type-box">

                <ClipboardCheck size={20} />

                <div>
                  <span>
                    Interview Round
                  </span>

                  <strong>
                    {interview.type} Interview
                  </strong>
                </div>

              </div>

            </div>

            {/* SKILLS TO EVALUATE */}

            <div className="interviewer-details-section">

              <div className="interviewer-details-section-title">

                <CheckCircle2 size={18} />

                <div>
                  <h3>
                    Skills to Evaluate
                  </h3>

                  <p>
                    Key candidate skills relevant
                    to the position.
                  </p>
                </div>

              </div>

              <div className="interviewer-details-skills">

                {interview.skills.map(
                  (skill) => (

                    <span key={skill}>
                      <CheckCircle2 size={14} />
                      {skill}
                    </span>

                  )
                )}

              </div>

            </div>

            {/* INTERVIEW NOTES */}

            <div className="interviewer-details-section">

              <div className="interviewer-details-section-title">

                <FileText size={18} />

                <div>
                  <h3>
                    Interview Instructions
                  </h3>

                  <p>
                    Focus areas provided for the
                    interview.
                  </p>
                </div>

              </div>

              <div className="interviewer-details-notes">

                {interview.notes}

              </div>

            </div>

            {/* ONLINE INTERVIEW */}

            {interview.mode === "Online" &&
              interview.meetingLink &&
              !isCompleted && (

                <div className="interviewer-details-section">

                  <div className="interviewer-details-section-title">

                    <Video size={18} />

                    <div>
                      <h3>
                        Online Interview
                      </h3>

                      <p>
                        Join the assigned interview
                        using the meeting link.
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="interviewer-join-interview-button"
                    onClick={() =>
                      window.open(
                        interview.meetingLink,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    <Video size={17} />

                    Join Interview

                    <ExternalLink size={15} />
                  </button>

                </div>

              )}

            {/* EVALUATION STATUS */}

            {isCompleted && (

              <div className="interviewer-details-section">

                <div className="interviewer-details-section-title">

                  <ClipboardCheck size={18} />

                  <div>
                    <h3>
                      Evaluation Status
                    </h3>

                    <p>
                      Evaluation status for the
                      completed interview.
                    </p>
                  </div>

                </div>

                {evaluationPending && (

                  <div className="interviewer-details-evaluation pending">

                    <ClipboardCheck size={19} />

                    <div>
                      <strong>
                        Evaluation Pending
                      </strong>

                      <span>
                        Complete the candidate
                        evaluation for this interview.
                      </span>
                    </div>

                  </div>

                )}

                {evaluationSubmitted && (

                  <div className="interviewer-details-evaluation submitted">

                    <CheckCircle2 size={19} />

                    <div>
                      <strong>
                        Evaluation Submitted
                      </strong>

                      <span>
                        Your evaluation has already
                        been submitted.
                      </span>
                    </div>

                  </div>

                )}

              </div>

            )}

            {/* ACTIONS */}

            <div className="interviewer-details-actions">

              <button
                type="button"
                className="interviewer-details-back-button"
                onClick={() =>
                  navigate(
                    "/interviewer/interviews"
                  )
                }
              >
                <ArrowLeft size={16} />
                Back to Interviews
              </button>

              {evaluationPending && (

                <button
                  type="button"
                  className="interviewer-details-evaluate-button"
                  onClick={() =>
                    navigate(
                      `/interviewer/evaluations/${interview.id}`
                    )
                  }
                >
                  <ClipboardCheck size={16} />
                  Evaluate Candidate
                </button>

              )}

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default InterviewerInterviewDetails;