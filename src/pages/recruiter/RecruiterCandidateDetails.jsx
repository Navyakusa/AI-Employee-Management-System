
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BriefcaseBusiness,
  CalendarDays,
  IndianRupee,
  Clock3,
  Globe,
  FileText,
  ExternalLink,
  AlertCircle,
  Download,
} from "lucide-react";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import apiClient from "../../services/apiClient";

import "./RecruiterCandidateDetails.css";

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return value;
};

const formatDate = (value) => {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatSalary = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  const salary = Number(value);

  if (!Number.isFinite(salary)) {
    return String(value);
  }

  return `₹${salary.toLocaleString("en-IN")} per annum`;
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getStatusClass = (status) => {
  if (!status) return "";

  return status.toLowerCase().replace(/_/g, "-");
};

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="recruiter-detail-item">
      <div className="recruiter-detail-item-icon">
        <Icon size={17} />
      </div>

      <div className="recruiter-detail-item-content">
        <span>{label}</span>
        <strong>{displayValue(value)}</strong>
      </div>
    </div>
  );
}

function RecruiterCandidateDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [managementRecords, setManagementRecords] = useState([]);
  const [resumes, setResumes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // ==========================================
  // FETCH CANDIDATE DETAILS
  // ==========================================

  useEffect(() => {
    let active = true;

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError("");
        setCandidate(null);

        const response = await apiClient.get(
          `/candidates/${id}`
        );

        if (!active) return;

        const result = response.data;

        if (
          !result ||
          typeof result !== "object" ||
          Array.isArray(result)
        ) {
          throw new Error(
            "Invalid candidate details response."
          );
        }

        setCandidate(result);
      } catch (err) {
        if (!active) return;

        console.error("Candidate details error:", err);

        if (err.response?.status === 401) {
          setError(
            "Your session has expired. Please log in again."
          );
        } else if (err.response?.status === 403) {
          setError(
            "You are not authorized to view this candidate."
          );
        } else if (err.response?.status === 404) {
          setError("Candidate not found.");
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load candidate details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCandidate();

    return () => {
      active = false;
    };
  }, [id]);

  // ==========================================
  // FETCH RESUME MANAGEMENT DATA
  // ==========================================

  useEffect(() => {
    let active = true;

    const fetchManagementRecords = async () => {
      try {
        setResumeError("");

        const response = await apiClient.get(
          "/resumes/management"
        );

        const records = response.data?.data;

        if (!Array.isArray(records)) {
          throw new Error(
            "Invalid resume management response."
          );
        }

        if (active) {
          setManagementRecords(records);
        }
      } catch (err) {
        console.error(
          "Resume management fetch error:",
          err
        );

        if (active) {
          setResumeError(
            "Unable to load this candidate's resume and application information."
          );
        }
      }
    };

    fetchManagementRecords();

    return () => {
      active = false;
    };
  }, [id]);

  // ==========================================
  // FETCH RESUME METADATA FOR DOWNLOAD
  // ==========================================

  useEffect(() => {
    let active = true;

    const fetchResumes = async () => {
      try {
        const response = await apiClient.get(
          "/resumes/all"
        );

        const records = response.data?.data;

        if (!Array.isArray(records)) {
          throw new Error(
            "Invalid resume metadata response."
          );
        }

        if (active) {
          setResumes(records);
        }
      } catch (err) {
        console.error(
          "Resume metadata fetch error:",
          err
        );
      }
    };

    fetchResumes();

    return () => {
      active = false;
    };
  }, [id]);

  // ==========================================
  // MATCH CANDIDATE WITH THEIR RESUME
  // ==========================================

  const candidateManagementRecords =
    managementRecords.filter(
      (record) =>
        Number(record.candidateId) === Number(id)
    );

  // Prefer the resume linked to an application.
  const applicationRecords =
    candidateManagementRecords.filter(
      (record) =>
        record.applicationId != null &&
        record.jobId != null
    );

  const uniqueApplications = new Map();

  applicationRecords.forEach((record) => {
    const key = String(record.applicationId);
    const previous = uniqueApplications.get(key);

    if (
      !previous ||
      Number(record.resumeId) > Number(previous.resumeId)
    ) {
      uniqueApplications.set(key, record);
    }
  });

  const linkedApplications = Array.from(
    uniqueApplications.values()
  );

  // Only show a single job/status when there is exactly
  // one identifiable application for this candidate.
  const application =
    linkedApplications.length === 1
      ? linkedApplications[0]
      : null;

  // Choose the latest uploaded file available for this
  // candidate. Do not use a resume belonging to another ID.
  const availableResumeRecords =
    candidateManagementRecords
      .filter(
        (record) =>
          record.fileAvailable === true &&
          record.resumeId != null
      )
      .sort(
        (a, b) =>
          Number(b.resumeId) - Number(a.resumeId)
      );

  const selectedResume =
    application?.fileAvailable === true
      ? application
      : availableResumeRecords[0] || null;

  const resumeMetadata = selectedResume
    ? resumes.find(
        (resume) =>
          Number(resume.id) ===
            Number(selectedResume.resumeId) &&
          Number(resume.candidateId) === Number(id)
      )
    : null;

  const candidateSkills =
    candidate?.skills?.trim() ||
    application?.skills ||
    selectedResume?.skills ||
    "";

  const skills = candidateSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const candidateExperience =
    candidate?.experience ||
    application?.experience ||
    selectedResume?.experience ||
    "";

  const applicationStatus =
    application?.status || null;

  // ==========================================
  // DOWNLOAD RESUME
  // ==========================================

  const handleDownloadResume = async () => {
    if (!selectedResume) {
      setResumeError(
        "No downloadable resume is available for this candidate."
      );
      return;
    }

    setResumeError("");
    setDownloading(true);

    try {
      const response = await apiClient.get(
        `/resumes/${selectedResume.resumeId}/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(
        response.data
      );

      const link = document.createElement("a");

      link.href = url;
      link.download =
        resumeMetadata?.fileName ||
        `candidate-${id}-resume.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(
        () => window.URL.revokeObjectURL(url),
        1000
      );
    } catch (err) {
      console.error("Resume download failed:", err);

      setResumeError(
        err.response?.data?.message ||
          "Unable to download the resume. Please check whether the file exists on the server."
      );
    } finally {
      setDownloading(false);
    }
  };

  // ==========================================
  // EXISTING PAGE DESIGN
  // ==========================================

  return (
    <div className="recruiter-candidate-details-page">
      <RecruiterSidebar />

      <RecruiterTopbar />

      <main className="recruiter-candidate-details-main">
        <div className="recruiter-candidate-details-content">
          <button
            type="button"
            className="recruiter-details-back"
            onClick={() =>
              navigate("/recruiter/candidates")
            }
          >
            <ArrowLeft size={16} />
            Back to Candidates
          </button>

          <div className="recruiter-details-page-heading">
            <span>RECRUITMENT WORKSPACE</span>
            <h1>Candidate Details</h1>
            <p>
              Review candidate information and professional profile.
            </p>
          </div>

          {loading && (
            <div className="recruiter-details-message">
              Loading candidate details...
            </div>
          )}

          {!loading && error && (
            <div
              className="recruiter-details-error"
              role="alert"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {!loading && !error && candidate && (
            <>
              {/* CANDIDATE PROFILE HEADER */}

              <section className="recruiter-details-profile-card">
                <div className="recruiter-details-profile-left">
                  <div className="recruiter-details-avatar">
                    {candidate.name
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>

                  <div className="recruiter-details-profile-info">
                    <div className="recruiter-details-name-row">
                      <h2>
                        {displayValue(candidate.name)}
                      </h2>

                      <span
                        className={`recruiter-details-status ${getStatusClass(
                          applicationStatus ||
                            candidate.status
                        )}`}
                      >
                        {formatStatus(
                          applicationStatus ||
                            candidate.status
                        )}
                      </span>
                    </div>

                    <p>
                      <Mail size={14} />
                      {displayValue(candidate.email)}
                    </p>

                    <p>
                      <MapPin size={14} />
                      {displayValue(candidate.location)}
                    </p>
                  </div>
                </div>

                <div className="recruiter-details-profile-id">
                  <span>Candidate ID</span>
                  <strong>#{candidate.id}</strong>
                </div>
              </section>

              <div className="recruiter-details-grid">
                {/* LEFT COLUMN */}

                <div className="recruiter-details-column">
                  {/* PERSONAL INFORMATION */}

                  <section className="recruiter-details-card">
                    <div className="recruiter-details-card-heading">
                      <UserRound size={19} />
                      <h3>Personal Information</h3>
                    </div>

                    <div className="recruiter-details-info-grid">
                      <DetailItem
                        icon={UserRound}
                        label="Full Name"
                        value={candidate.name}
                      />

                      <DetailItem
                        icon={Mail}
                        label="Email Address"
                        value={candidate.email}
                      />

                      <DetailItem
                        icon={Phone}
                        label="Phone Number"
                        value={candidate.phone}
                      />

                      <DetailItem
                        icon={MapPin}
                        label="Location"
                        value={candidate.location}
                      />
                    </div>
                  </section>

                  {/* PROFESSIONAL INFORMATION */}

                  <section className="recruiter-details-card">
                    <div className="recruiter-details-card-heading">
                      <BriefcaseBusiness size={19} />
                      <h3>Professional Information</h3>
                    </div>

                    <div className="recruiter-details-info-grid">
                      <DetailItem
                        icon={GraduationCap}
                        label="Education"
                        value={candidate.education}
                      />

                      <DetailItem
                        icon={BriefcaseBusiness}
                        label="Experience"
                        value={candidateExperience}
                      />

                      <DetailItem
                        icon={IndianRupee}
                        label="Expected Salary"
                        value={formatSalary(
                          candidate.expectedSalary
                        )}
                      />

                      <DetailItem
                        icon={Clock3}
                        label="Notice Period"
                        value={candidate.noticePeriod}
                      />
                    </div>
                  </section>

                  {/* SKILLS */}

                  <section className="recruiter-details-card">
                    <div className="recruiter-details-card-heading">
                      <BriefcaseBusiness size={19} />
                      <h3>Skills</h3>
                    </div>

                    {skills.length > 0 ? (
                      <div className="recruiter-details-skills">
                        {skills.map((skill, index) => (
                          <span key={`${skill}-${index}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="recruiter-details-muted">
                        No skills provided.
                      </p>
                    )}
                  </section>
                </div>

                {/* RIGHT COLUMN */}

                <div className="recruiter-details-column">
                  {/* APPLICATION INFORMATION */}

                  <section className="recruiter-details-card">
                    <div className="recruiter-details-card-heading">
                      <FileText size={19} />
                      <h3>Application Information</h3>
                    </div>

                    <div className="recruiter-details-info-grid recruiter-details-info-single">
                      {application && (
                        <DetailItem
                          icon={BriefcaseBusiness}
                          label="Applied Position"
                          value={application.position}
                        />
                      )}

                      <DetailItem
                        icon={CalendarDays}
                        label="Application Date"
                        value={formatDate(
                          candidate.applicationDate
                        )}
                      />

                      <DetailItem
                        icon={FileText}
                        label="Application Status"
                        value={
                          applicationStatus
                            ? formatStatus(applicationStatus)
                            : linkedApplications.length > 1
                              ? "Multiple applications"
                              : "Not available"
                        }
                      />

                      <DetailItem
                        icon={BriefcaseBusiness}
                        label="Application Source"
                        value={candidate.source}
                      />
                    </div>
                  </section>

                  {/* RESUME */}

                  <section className="recruiter-details-card">
                    <div className="recruiter-details-card-heading">
                      <FileText size={19} />
                      <h3>Resume</h3>
                    </div>

                    {selectedResume ? (
                      <>
                        <div className="recruiter-details-resume">
                          <div className="recruiter-details-resume-icon">
                            <FileText size={23} />
                          </div>

                          <div>
                            <strong>
                              {resumeMetadata?.fileName ||
                                `Resume #${selectedResume.resumeId}`}
                            </strong>
                            <span>
                              Uploaded resume
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleDownloadResume}
                          disabled={downloading}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            marginTop: "16px",
                            padding: "10px 14px",
                            background: "#4f65dc",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: downloading
                              ? "not-allowed"
                              : "pointer",
                          }}
                        >
                          <Download size={16} />
                          {downloading
                            ? "Downloading..."
                            : "Download Resume"}
                        </button>
                      </>
                    ) : (
                      <p className="recruiter-details-muted">
                        No downloadable resume is available
                        for this candidate.
                      </p>
                    )}

                    {resumeError && (
                      <p
                        role="alert"
                        style={{
                          marginTop: "12px",
                          color: "#dc2626",
                          fontSize: "13px",
                        }}
                      >
                        {resumeError}
                      </p>
                    )}
                  </section>

                  {/* PROFESSIONAL LINKS */}

                  <section className="recruiter-details-card">
                    <div className="recruiter-details-card-heading">
                      <Globe size={19} />
                      <h3>Professional Links</h3>
                    </div>

                    <div className="recruiter-details-links">
                      {candidate.linkedin ? (
                        <a
                          href={candidate.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe size={17} />
                          LinkedIn Profile
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <p className="recruiter-details-muted">
                          LinkedIn profile not provided.
                        </p>
                      )}

                      {candidate.portfolio ? (
                        <a
                          href={candidate.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe size={17} />
                          Portfolio
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <p className="recruiter-details-muted">
                          Portfolio not provided.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default RecruiterCandidateDetails;