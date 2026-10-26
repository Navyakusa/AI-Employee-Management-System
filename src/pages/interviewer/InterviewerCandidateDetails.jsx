import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

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

import {
  getCandidateById,
  getInterviewById,
  getResumeDownload,
} from "../../services/interviewerService";

import "./InterviewerDashboard.css";

/*
  NOT YET CONFIRMED with backend — verify GET /candidates/{id} field
  names against a real response and adjust the right-hand side below.
  matchScore in particular may come from a separate AI-matching
  endpoint rather than living on the Candidate object itself.
*/
/*
  NOT YET CONFIRMED with backend — verify GET
  /interviewer/candidate-details/{id} field names against a real
  response and trim these fallback chains down once confirmed.
  matchScore in particular may come from a separate AI-matching
  endpoint rather than living on this DTO at all.
*/
function mapCandidate(raw) {
  return {
    id: raw.id ?? raw.candidateId,
    name: String(raw.name ?? raw.candidateName ?? ""),
    email: String(raw.email ?? raw.candidateEmail ?? ""),
    phone: String(raw.phone ?? raw.phoneNumber ?? raw.candidatePhone ?? ""),
    location: String(raw.location ?? raw.candidateLocation ?? ""),
    job: String(raw.job ?? raw.jobTitle ?? raw.appliedPosition ?? ""),
    experience: String(raw.experience ?? raw.candidateExperience ?? ""),
    education: String(raw.education ?? raw.candidateEducation ?? ""),
    matchScore: raw.matchScore ?? raw.aiMatchScore ?? null,
    interviewStatus: String(raw.interviewStatus ?? raw.status ?? ""),
    resume: String(raw.resume ?? raw.resumeName ?? raw.resumeFileName ?? ""),
    resumeId:
  raw.resumeId ??
  raw.resume?.resumeId ??
  raw.resumeDetails?.resumeId ??
  null,
    summary: String(raw.summary ?? raw.profileSummary ?? ""),
    // Force an array regardless of what the backend actually sends —
    // ?? only guards against null/undefined, not wrong types (e.g. a
    // string or object instead of an array), which previously could
    // crash the whole page since there's no error boundary here.
    skills: Array.isArray(raw.skills) ? raw.skills : [],
  };
}

function InterviewerCandidateDetails() {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get("interviewId");

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingResume, setDownloadingResume] = useState(false);
const [resumeError, setResumeError] = useState("");
  useEffect(() => {
    const loadCandidateDetails = async () => {
      try {
        // Candidate details provide the profile information. The interview
        // endpoint provides the status for the specific interview selected
        // from the candidates list. Using only /candidate-details/{id}
        // previously caused every candidate to display the same status.
        const [candidateData, interviewData] = await Promise.all([
          getCandidateById(candidateId),
          interviewId ? getInterviewById(interviewId).catch(() => null) : Promise.resolve(null),
        ]);

        console.log("Raw candidate-details response:", candidateData);
        console.log("Interview status response:", interviewData);

        if (!candidateData) {
          setCandidate(null);
          return;
        }

        const mappedCandidate = mapCandidate(candidateData);

        // Always prefer the status belonging to the selected interview.
        // Fall back to the candidate-details status only when the page was
        // opened directly without an interviewId in the URL.
        if (interviewData?.status) {
          mappedCandidate.interviewStatus = String(interviewData.status);
        }

        setCandidate(mappedCandidate);
      } catch (err) {
        console.error("Failed to load candidate details:", err);
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    };

    loadCandidateDetails();
  }, [candidateId, interviewId]);

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

 
const handleDownloadResume = async () => {
  if (!candidate?.resumeId) {
    setResumeError(
      "The resume ID was not provided by the backend. Please check the candidate details API."
    );
    return;
  }

  setDownloadingResume(true);
  setResumeError("");

  try {
    const response = await getResumeDownload(candidate.resumeId);

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = candidate.resume || `resume-${candidate.resumeId}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Resume download failed:", error);

    const status = error?.response?.status;

    if (error.message === "A valid resume ID is not available.") {
      setResumeError(error.message);
    } else if (!status) {
      setResumeError(
        "Unable to connect to the server. Check your backend connection."
      );
    } else if (status === 401 || status === 403) {
      setResumeError(
        "You are not authorized to download this resume. Check your login and permissions."
      );
    } else if (status === 404) {
      setResumeError(
        "The resume file was not found on the server."
      );
    } else if (status >= 500) {
      setResumeError(
        "The server could not download this resume. The file may be missing on the backend."
      );
    } else {
      setResumeError(
        `Resume download failed (HTTP ${status}).`
      );
    }
  } finally {
    setDownloadingResume(false);
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

                  <button
  type="button"
  onClick={handleDownloadResume}
  disabled={downloadingResume}
>
  <Download size={16} />
  {downloadingResume ? "Downloading..." : "Download"}
</button>

{resumeError && (
  <p role="alert" style={{ color: "red", marginTop: "8px" }}>
    {resumeError}
  </p>
)}
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
