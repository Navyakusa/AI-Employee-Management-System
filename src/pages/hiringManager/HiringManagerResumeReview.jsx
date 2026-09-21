import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  FileText,
  Download,
  CalendarDays,
  XCircle,
  Sparkles,
  Clock3,
  User,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerResumeReview() {
  const navigate = useNavigate();

  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Temporary frontend data.
  // Backend integration will replace this later.
  const candidate = {
    id: 1,
    name: "Ananya Sharma",
    email: "ananya@gmail.com",
    phone: "+91 98765 43210",
    location: "Hyderabad",

    job: "Java Backend Developer",
    department: "Engineering",

    experience: "3 Years",
    education: "B.Tech - Computer Science",

    applicationDate: "10 Sep 2026",

    matchScore: 92,

    skills: [
      "Java",
      "Spring Boot",
      "REST API",
      "PostgreSQL",
      "Docker",
      "Git",
    ],

    resume: "Ananya_Sharma_Resume.pdf",

    professionalSummary:
      "Backend developer with 3 years of experience building scalable applications using Java, Spring Boot, REST APIs and PostgreSQL. Experienced in developing secure backend services and working with modern development tools.",

    aiAnalysis: {
      skillsMatch: 95,
      experienceMatch: 88,
      educationMatch: 90,
      overallFit: 92,
    },
  };

  const initials = candidate.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleBack = () => {
    navigate("/hiring-manager/shortlisted-candidates");
  };

  const handleScheduleInterview = () => {
    // Frontend navigation only for now.
    navigate("/hiring-manager/interviews");
  };

  const handleReject = () => {
    setShowRejectBox(true);
  };

  const handleCancelReject = () => {
    setShowRejectBox(false);
    setRejectReason("");
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    // Backend API will be added later.
    alert(
      `${candidate.name} rejected.\nReason: ${rejectReason}`
    );

    setRejectReason("");
    setShowRejectBox(false);

    navigate("/hiring-manager/shortlisted-candidates");
  };

  const handleDownloadResume = () => {
    // Actual resume URL/API will be connected later.
    alert("Resume download will be connected with backend later.");
  };

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* BACK BUTTON */}
          <button
            type="button"
            className="hm-review-back"
            onClick={handleBack}
          >
            <ArrowLeft size={17} />
            Back to Shortlisted Candidates
          </button>

          {/* PAGE HEADER */}
          <div className="hiring-manager-dashboard-header">
            <p className="hiring-manager-label">
              CANDIDATE REVIEW
            </p>

            <h1>Resume Review</h1>

            <p>
              Review candidate information, resume and AI analysis
              before making a hiring decision.
            </p>
          </div>

          {/* CANDIDATE PROFILE HEADER */}
          <section className="hm-review-profile-card">

            <div className="hm-review-profile-left">

              <div className="hm-review-avatar">
                {initials}
              </div>

              <div>
                <h2>{candidate.name}</h2>

                <p>{candidate.email}</p>

                <div className="hm-review-job">
                  <BriefcaseBusiness size={15} />
                  {candidate.job}
                </div>
              </div>

            </div>

            <span className="hm-shortlisted-badge">
              Shortlisted
            </span>

          </section>

          {/* SUMMARY STATS */}
          <section className="hm-review-stats">

            <div className="hm-review-stat">
              <Sparkles size={22} />

              <div>
                <span>AI Match Score</span>
                <strong>{candidate.matchScore}%</strong>
              </div>
            </div>

            <div className="hm-review-stat">
              <BriefcaseBusiness size={22} />

              <div>
                <span>Experience</span>
                <strong>{candidate.experience}</strong>
              </div>
            </div>

            <div className="hm-review-stat">
              <Clock3 size={22} />

              <div>
                <span>Applied On</span>
                <strong>{candidate.applicationDate}</strong>
              </div>
            </div>

          </section>

          {/* MAIN CONTENT */}
          <div className="hm-review-grid">

            {/* LEFT SIDE */}
            <div>

              {/* CANDIDATE INFORMATION */}
              <section className="hm-review-card">

                <h2>Candidate Information</h2>

                <div className="hm-review-info-grid">

                  <div className="hm-review-info-item">
                    <User size={18} />

                    <div>
                      <span>Full Name</span>
                      <strong>{candidate.name}</strong>
                    </div>
                  </div>

                  <div className="hm-review-info-item">
                    <Mail size={18} />

                    <div>
                      <span>Email Address</span>
                      <strong>{candidate.email}</strong>
                    </div>
                  </div>

                  <div className="hm-review-info-item">
                    <Phone size={18} />

                    <div>
                      <span>Phone Number</span>
                      <strong>{candidate.phone}</strong>
                    </div>
                  </div>

                  <div className="hm-review-info-item">
                    <MapPin size={18} />

                    <div>
                      <span>Location</span>
                      <strong>{candidate.location}</strong>
                    </div>
                  </div>

                  <div className="hm-review-info-item">
                    <BriefcaseBusiness size={18} />

                    <div>
                      <span>Experience</span>
                      <strong>{candidate.experience}</strong>
                    </div>
                  </div>

                  <div className="hm-review-info-item">
                    <GraduationCap size={18} />

                    <div>
                      <span>Education</span>
                      <strong>{candidate.education}</strong>
                    </div>
                  </div>

                </div>

              </section>

              {/* PROFESSIONAL SUMMARY */}
              <section className="hm-review-card">

                <h2>Professional Summary</h2>

                <p className="hm-review-description">
                  {candidate.professionalSummary}
                </p>

              </section>

              {/* SKILLS */}
              <section className="hm-review-card">

                <h2>Skills</h2>

                <div className="hm-review-skills">

                  {candidate.skills.map((skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  ))}

                </div>

              </section>

              {/* RESUME */}
              <section className="hm-review-card">

                <h2>Candidate Resume</h2>

                <div className="hm-review-resume">

                  <div className="hm-review-resume-icon">
                    <FileText size={21} />
                  </div>

                  <div>
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

              </section>

            </div>

            {/* RIGHT SIDE */}
            <div>

              {/* AI ANALYSIS */}
              <section className="hm-review-card">

                <h2>AI Candidate Analysis</h2>

                <div className="hm-review-score">

                  <div className="hm-review-score-circle">
                    {candidate.matchScore}%
                  </div>

                  <div>
                    <strong>Excellent Match</strong>

                    <span>
                      Candidate profile strongly matches the
                      requirements for this position.
                    </span>
                  </div>

                </div>

                <div className="hm-review-analysis">

                  {/* SKILLS MATCH */}
                  <div>
                    <span>Skills Match</span>

                    <strong>
                      {candidate.aiAnalysis.skillsMatch}%
                    </strong>
                  </div>

                  <div className="hm-review-analysis-bar">
                    <div
                      style={{
                        width: `${candidate.aiAnalysis.skillsMatch}%`,
                      }}
                    />
                  </div>

                  {/* EXPERIENCE MATCH */}
                  <div>
                    <span>Experience Match</span>

                    <strong>
                      {candidate.aiAnalysis.experienceMatch}%
                    </strong>
                  </div>

                  <div className="hm-review-analysis-bar">
                    <div
                      style={{
                        width: `${candidate.aiAnalysis.experienceMatch}%`,
                      }}
                    />
                  </div>

                  {/* EDUCATION MATCH */}
                  <div>
                    <span>Education Match</span>

                    <strong>
                      {candidate.aiAnalysis.educationMatch}%
                    </strong>
                  </div>

                  <div className="hm-review-analysis-bar">
                    <div
                      style={{
                        width: `${candidate.aiAnalysis.educationMatch}%`,
                      }}
                    />
                  </div>

                  {/* OVERALL FIT */}
                  <div>
                    <span>Overall Job Fit</span>

                    <strong>
                      {candidate.aiAnalysis.overallFit}%
                    </strong>
                  </div>

                  <div className="hm-review-analysis-bar">
                    <div
                      style={{
                        width: `${candidate.aiAnalysis.overallFit}%`,
                      }}
                    />
                  </div>

                </div>

              </section>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default HiringManagerResumeReview;