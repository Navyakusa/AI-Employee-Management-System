import { useEffect, useState } from "react";
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

import { getCandidateById } from "../../services/interviewerService";

import "./InterviewerDashboard.css";

// CONFIRMED via backend source (InterviewerCandidateDetailsDto.java,
// from GET /interviewer/candidate-details/{candidateId}):
//   { candidateId, name, email, phone, location, education,
//     experience, skills (comma-separated STRING, not an array),
//     resume, linkedin, portfolio, expectedSalary, noticePeriod,
//     source, applicationDate, jobId, appliedPosition, interviewId,
//     interviewDateTime, interviewMode, interviewStatus,
//     aiMatchScore, professionalSummary }
// Note: aiMatchScore is currently hardcoded to null on the backend
// (not computed yet) — the "AI Match Score" section already only
// renders when matchScore isn't null, so this just naturally stays
// hidden until backend implements it, with no crash either way.
function splitSkillsString(skills) {
  if (Array.isArray(skills)) {
    return skills;
  }

  if (typeof skills === "string" && skills.trim()) {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
}

function mapCandidate(raw) {
  return {
    id: raw.candidateId,
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    location: String(raw.location ?? ""),
    job: String(raw.appliedPosition ?? ""),
    experience: String(raw.experience ?? ""),
    education: String(raw.education ?? ""),
    matchScore: raw.aiMatchScore ?? null,
    interviewStatus: String(raw.interviewStatus ?? ""),
    resume: String(raw.resume ?? ""),
    resumeId: null,
    summary: String(raw.professionalSummary ?? ""),
    skills: splitSkillsString(raw.skills),
    // Not yet shown in the UI, but captured in case they're useful
    // later — linkedin/portfolio/expectedSalary/noticePeriod/source
    // are all real fields on this DTO with no UI section yet.
    linkedin: raw.linkedin ?? "",
    portfolio: raw.portfolio ?? "",
    expectedSalary: raw.expectedSalary ?? null,
    noticePeriod: raw.noticePeriod ?? "",
    source: raw.source ?? "",
  };
}

function InterviewerCandidateDetails() {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCandidateById(candidateId)
      .then((data) => {
        console.log("Raw candidate-details response:", data);
        setCandidate(data ? mapCandidate(data) : null);
      })
      .catch((err) => {
        console.error("Failed to load candidate details:", err);
        setCandidate(null);
      })
      .finally(() => setLoading(false));
  }, [candidateId]);

  if (loading) {
    return (
      <div className="interviewer-layout">
        <InterviewerSidebar />

        <div className="interviewer-main">
          <InterviewerNavbar />

          <main className="interviewer-dashboard-content">
            <p>Loading candidate...</p>
          </main>
        </div>
      </div>
    );
  }

  // Prevent displaying the wrong candidate when an invalid ID is opened.
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

              <p>The requested candidate could not be found.</p>

              <button
                type="button"
                onClick={() => navigate("/interviewer/interviews")}
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
    // CONFIRMED: there is no separate resumeId field — "resume" on
    // Candidate is just a single String column, format unconfirmed
    // (could be a stored file path or a full URL). If it looks like a
    // URL, open it directly; otherwise there's nothing actionable to
    // do with it yet — ask backend what this string actually contains.
    if (candidate.resume && /^https?:\/\//i.test(candidate.resume)) {
      window.open(candidate.resume, "_blank", "noopener,noreferrer");
    } else if (candidate.resume) {
      alert(
        `Resume on file: "${candidate.resume}" — this isn't a URL, so ask backend what format this field holds (a stored file path? a doc id to fetch separately?) before this can download anything.`
      );
    } else {
      alert("This candidate has no resume on file yet.");
    }
  };

  return (
    <div className="interviewer-layout">
      <InterviewerSidebar />

      <div className="interviewer-main">
        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">
          {/* HEADER */}

          <div className="interviewer-dashboard-header">
            <p className="interviewer-label">CANDIDATE PROFILE</p>

            <h1>Candidate Details</h1>

            <p>Review candidate information before conducting the interview.</p>
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

                {candidate.interviewStatus && (
                  <span
                    className={`interviewer-candidate-interview-status ${candidate.interviewStatus.toLowerCase()}`}
                  >
                    {candidate.interviewStatus}
                  </span>
                )}
              </div>

              {/* AI MATCH */}

              {candidate.matchScore !== null && (
                <div className="interviewer-candidate-match">
                  <div className="interviewer-candidate-match-top">
                    <span>
                      <Star size={15} />
                      AI Match Score
                    </span>

                    <strong>{candidate.matchScore}%</strong>
                  </div>

                  <div className="interviewer-candidate-match-bar">
                    <div
                      className="interviewer-candidate-match-progress"
                      style={{ width: `${candidate.matchScore}%` }}
                    />
                  </div>
                </div>
              )}

              {/* CONTACT */}

              <div className="interviewer-candidate-contact">
                <div>
                  <Mail size={17} />
                  <span>{candidate.email}</span>
                </div>

                <div>
                  <Phone size={17} />
                  <span>{candidate.phone}</span>
                </div>

                <div>
                  <MapPin size={17} />
                  <span>{candidate.location}</span>
                </div>

                <div>
                  <BriefcaseBusiness size={17} />
                  <span>{candidate.experience}</span>
                </div>

                <div>
                  <GraduationCap size={17} />
                  <span>{candidate.education}</span>
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
                    <p>Position associated with this interview.</p>
                  </div>
                </div>

                <div className="interviewer-candidate-position">
                  <BriefcaseBusiness size={20} />

                  <div>
                    <span>Job Position</span>
                    <strong>{candidate.job}</strong>
                  </div>
                </div>
              </div>

              {/* SUMMARY */}

              <div className="interviewer-candidate-section">
                <div className="interviewer-candidate-section-title">
                  <User size={18} />

                  <div>
                    <h3>Professional Summary</h3>
                    <p>Candidate profile overview.</p>
                  </div>
                </div>

                <div className="interviewer-candidate-summary-text">
                  {candidate.summary || "No summary provided."}
                </div>
              </div>

              {/* SKILLS */}

              <div className="interviewer-candidate-section">
                <div className="interviewer-candidate-section-title">
                  <CheckCircle2 size={18} />

                  <div>
                    <h3>Candidate Skills</h3>
                    <p>Skills listed in the candidate profile.</p>
                  </div>
                </div>

                <div className="interviewer-candidate-skills">
                  {candidate.skills.length > 0 ? (
                    candidate.skills.map((skill) => (
                      <span key={skill}>
                        <CheckCircle2 size={14} />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span>No skills listed.</span>
                  )}
                </div>
              </div>

              {/* RESUME */}

              <div className="interviewer-candidate-section">
                <div className="interviewer-candidate-section-title">
                  <FileText size={18} />

                  <div>
                    <h3>Candidate Resume</h3>
                    <p>Resume uploaded by the candidate.</p>
                  </div>
                </div>

                <div className="interviewer-candidate-resume">
                  <div className="interviewer-candidate-resume-icon">
                    <FileText size={23} />
                  </div>

                  <div className="interviewer-candidate-resume-info">
                    <strong>{candidate.resume || "No resume uploaded"}</strong>
                    <span>Candidate uploaded resume</span>
                  </div>

                  <button type="button" onClick={handleDownloadResume}>
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>

              {/* INTERVIEW */}

              {candidate.interviewStatus && (
                <div className="interviewer-candidate-section">
                  <div className="interviewer-candidate-section-title">
                    <CalendarDays size={18} />

                    <div>
                      <h3>Interview Status</h3>
                      <p>Current interview stage for this candidate.</p>
                    </div>
                  </div>

                  <div className="interviewer-candidate-status-box">
                    <CalendarDays size={19} />

                    <div>
                      <span>Current Status</span>
                      <strong>{candidate.interviewStatus}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* ONLY BACK ACTION */}

              <div className="interviewer-candidate-actions">
                <button type="button" onClick={() => navigate(-1)}>
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
