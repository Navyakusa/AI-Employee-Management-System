import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  FileText,
  Download,
  CheckCircle2,
  CalendarDays,
  Star,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import "./InterviewerDashboard.css";

function InterviewerCandidateDetails() {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  // Temporary frontend data
  // Backend integration will replace this later.
  const candidates = [
    {
      id: 1,
      name: "Ananya Sharma",
      email: "ananya@gmail.com",
      phone: "+91 98765 43210",
      location: "Hyderabad",
      job: "Java Backend Developer",
      experience: "3 Years",
      education: "B.Tech - Computer Science",
      matchScore: 92,
      interviewStatus: "Scheduled",
      resume: "Ananya_Sharma_Resume.pdf",
      summary:
        "Backend developer with experience in Java, Spring Boot, REST APIs and PostgreSQL. Strong understanding of object-oriented programming and backend application development.",
      skills: [
        "Java",
        "Spring Boot",
        "REST API",
        "PostgreSQL",
        "Docker",
        "Git",
      ],
    },

    {
      id: 2,
      name: "Rahul Verma",
      email: "rahul@gmail.com",
      phone: "+91 98765 12345",
      location: "Bangalore",
      job: "React Frontend Developer",
      experience: "2 Years",
      education: "B.Tech - Information Technology",
      matchScore: 87,
      interviewStatus: "Scheduled",
      resume: "Rahul_Verma_Resume.pdf",
      summary:
        "Frontend developer with experience in React, JavaScript, HTML and CSS. Experienced in building responsive and reusable user interface components.",
      skills: [
        "React",
        "JavaScript",
        "HTML",
        "CSS",
        "Bootstrap",
        "Git",
      ],
    },

    {
      id: 3,
      name: "Sneha Reddy",
      email: "sneha@gmail.com",
      phone: "+91 98765 67890",
      location: "Hyderabad",
      job: "QA Engineer",
      experience: "4 Years",
      education: "B.Tech - Computer Science",
      matchScore: 83,
      interviewStatus: "Completed",
      resume: "Sneha_Reddy_Resume.pdf",
      summary:
        "QA engineer with experience in manual testing, API testing and automation. Strong knowledge of Selenium, Postman and software testing processes.",
      skills: [
        "Selenium",
        "Postman",
        "Java",
        "API Testing",
        "Manual Testing",
        "Automation Testing",
      ],
    },

    {
      id: 4,
      name: "Arjun Kumar",
      email: "arjun@gmail.com",
      phone: "+91 98765 24680",
      location: "Bangalore",
      job: "DevOps Engineer",
      experience: "3 Years",
      education: "B.Tech - Computer Science",
      matchScore: 89,
      interviewStatus: "Scheduled",
      resume: "Arjun_Kumar_Resume.pdf",
      summary:
        "DevOps engineer with experience in CI/CD, Docker, cloud deployment and Linux environments. Familiar with automation and infrastructure management.",
      skills: [
        "Docker",
        "AWS",
        "Jenkins",
        "Linux",
        "Git",
        "CI/CD",
      ],
    },

    {
      id: 5,
      name: "Meghana Rao",
      email: "meghana@gmail.com",
      phone: "+91 98765 13579",
      location: "Hyderabad",
      job: "Full Stack Developer",
      experience: "3 Years",
      education: "B.Tech - Computer Science",
      matchScore: 90,
      interviewStatus: "Completed",
      resume: "Meghana_Rao_Resume.pdf",
      summary:
        "Full stack developer experienced in Java, Spring Boot, React and PostgreSQL with knowledge of REST API development and frontend integration.",
      skills: [
        "Java",
        "Spring Boot",
        "React",
        "JavaScript",
        "PostgreSQL",
        "REST API",
      ],
    },
  ];

  const candidate = candidates.find(
    (item) => item.id === Number(candidateId)
  );

  // Prevent displaying the wrong candidate
  // when an invalid ID is opened.
  if (!candidate) {
    return (
      <div className="interviewer-layout">
        <InterviewerSidebar />

        <div className="interviewer-main">
          <InterviewerNavbar />

          <main className="interviewer-dashboard-content">

            <section className="interviewer-details-not-found">

              <User size={42} />

              <h2>Candidate not found</h2>

              <p>
                The requested candidate could not
                be found.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/interviewer/interviews")
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

  const initials = candidate.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleDownloadResume = () => {
    // Frontend only for now.
    // Later backend will provide the actual resume URL/file.
    alert(
      `Resume download will be connected later: ${candidate.resume}`
    );
  };

  return (
    <div className="interviewer-layout">

      <InterviewerSidebar />

      <div className="interviewer-main">

        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">

          {/* HEADER */}

          <div className="interviewer-dashboard-header">

            <p className="interviewer-label">
              CANDIDATE PROFILE
            </p>

            <h1>Candidate Details</h1>

            <p>
              Review candidate information before
              conducting the interview.
            </p>

          </div>

          <div className="interviewer-candidate-page-layout">

            {/* LEFT SIDE */}

            <section className="interviewer-candidate-profile-card">

              <div className="interviewer-candidate-profile-top">

                <div className="interviewer-candidate-profile-avatar">
                  {initials}
                </div>

                <h2>{candidate.name}</h2>

                <p>{candidate.job}</p>

                <span
                  className={`interviewer-candidate-interview-status ${candidate.interviewStatus.toLowerCase()}`}
                >
                  {candidate.interviewStatus}
                </span>

              </div>

              {/* AI MATCH */}

              <div className="interviewer-candidate-match">

                <div className="interviewer-candidate-match-top">

                  <span>
                    <Star size={15} />
                    AI Match Score
                  </span>

                  <strong>
                    {candidate.matchScore}%
                  </strong>

                </div>

                <div className="interviewer-candidate-match-bar">

                  <div
                    className="interviewer-candidate-match-progress"
                    style={{
                      width: `${candidate.matchScore}%`,
                    }}
                  />

                </div>

              </div>

              {/* CONTACT */}

              <div className="interviewer-candidate-contact">

                <div>
                  <Mail size={17} />

                  <span>
                    {candidate.email}
                  </span>
                </div>

                <div>
                  <Phone size={17} />

                  <span>
                    {candidate.phone}
                  </span>
                </div>

                <div>
                  <MapPin size={17} />

                  <span>
                    {candidate.location}
                  </span>
                </div>

                <div>
                  <BriefcaseBusiness size={17} />

                  <span>
                    {candidate.experience}
                  </span>
                </div>

                <div>
                  <GraduationCap size={17} />

                  <span>
                    {candidate.education}
                  </span>
                </div>

              </div>

            </section>

            {/* RIGHT SIDE */}

            <section className="interviewer-candidate-content-card">

              {/* APPLIED POSITION */}

              <div className="interviewer-candidate-section">

                <div className="interviewer-candidate-section-title">

                  <BriefcaseBusiness size={18} />

                  <div>
                    <h3>Applied Position</h3>

                    <p>
                      Position associated with this
                      interview.
                    </p>
                  </div>

                </div>

                <div className="interviewer-candidate-position">

                  <BriefcaseBusiness size={20} />

                  <div>
                    <span>Job Position</span>

                    <strong>
                      {candidate.job}
                    </strong>
                  </div>

                </div>

              </div>

              {/* SUMMARY */}

              <div className="interviewer-candidate-section">

                <div className="interviewer-candidate-section-title">

                  <User size={18} />

                  <div>
                    <h3>
                      Professional Summary
                    </h3>

                    <p>
                      Candidate profile overview.
                    </p>
                  </div>

                </div>

                <div className="interviewer-candidate-summary-text">
                  {candidate.summary}
                </div>

              </div>

              {/* SKILLS */}

              <div className="interviewer-candidate-section">

                <div className="interviewer-candidate-section-title">

                  <CheckCircle2 size={18} />

                  <div>
                    <h3>Candidate Skills</h3>

                    <p>
                      Skills listed in the candidate
                      profile.
                    </p>
                  </div>

                </div>

                <div className="interviewer-candidate-skills">

                  {candidate.skills.map((skill) => (

                    <span key={skill}>
                      <CheckCircle2 size={14} />
                      {skill}
                    </span>

                  ))}

                </div>

              </div>

              {/* RESUME */}

              <div className="interviewer-candidate-section">

                <div className="interviewer-candidate-section-title">

                  <FileText size={18} />

                  <div>
                    <h3>Candidate Resume</h3>

                    <p>
                      Resume uploaded by the
                      candidate.
                    </p>
                  </div>

                </div>

                <div className="interviewer-candidate-resume">

                  <div className="interviewer-candidate-resume-icon">
                    <FileText size={23} />
                  </div>

                  <div className="interviewer-candidate-resume-info">

                    <strong>
                      {candidate.resume}
                    </strong>

                    <span>
                      Candidate uploaded resume
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadResume}
                  >
                    <Download size={16} />
                    Download
                  </button>

                </div>

              </div>

              {/* INTERVIEW */}

              <div className="interviewer-candidate-section">

                <div className="interviewer-candidate-section-title">

                  <CalendarDays size={18} />

                  <div>
                    <h3>Interview Status</h3>

                    <p>
                      Current interview stage for
                      this candidate.
                    </p>
                  </div>

                </div>

                <div className="interviewer-candidate-status-box">

                  <CalendarDays size={19} />

                  <div>
                    <span>Current Status</span>

                    <strong>
                      {candidate.interviewStatus}
                    </strong>
                  </div>

                </div>

              </div>

              {/* ONLY BACK ACTION */}

              <div className="interviewer-candidate-actions">

                <button
                  type="button"
                  onClick={() =>
                    navigate(-1)
                  }
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}

export default InterviewerCandidateDetails;