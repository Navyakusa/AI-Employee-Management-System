
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError("");
        setCandidate(null);

        // apiClient already has /api as its base URL.
        // Final request: GET /api/candidates/{id}
        const response = await apiClient.get(
          `/candidates/${id}`
        );

        if (!active) return;

        // The tested endpoint returns a candidate object directly.
        const result = response.data;

        if (!result || typeof result !== "object" || Array.isArray(result)) {
          throw new Error("Invalid candidate details response.");
        }

        setCandidate(result);
      } catch (err) {
        if (!active) return;

        console.error("Candidate details error:", err);

        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response?.status === 403) {
          setError("You are not authorized to view this candidate.");
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

  const skills = (candidate?.skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <div className="recruiter-candidate-details-page">
      <RecruiterSidebar />

      <RecruiterTopbar />

      <main className="recruiter-candidate-details-main">
        <div className="recruiter-candidate-details-content">
          <button
            type="button"
            className="recruiter-details-back"
            onClick={() => navigate("/recruiter/candidates")}
          >
            <ArrowLeft size={16} />
            Back to Candidates
          </button>

          <div className="recruiter-details-page-heading">
            <span>RECRUITMENT WORKSPACE</span>
            <h1>Candidate Details</h1>
            <p>Review candidate information and professional profile.</p>
          </div>

          {loading && (
            <div className="recruiter-details-message">
              Loading candidate details...
            </div>
          )}

          {!loading && error && (
            <div className="recruiter-details-error" role="alert">
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
                    {candidate.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>

                  <div className="recruiter-details-profile-info">
                    <div className="recruiter-details-name-row">
                      <h2>{displayValue(candidate.name)}</h2>

                      <span
                        className={`recruiter-details-status ${getStatusClass(
                          candidate.status
                        )}`}
                      >
                        {formatStatus(candidate.status)}
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
                        value={candidate.experience}
                      />

                      <DetailItem
                        icon={IndianRupee}
                        label="Expected Salary"
                        value={formatSalary(candidate.expectedSalary)}
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
                        {skills.map((skill) => (
                          <span key={skill}>{skill}</span>
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
                      <DetailItem
                        icon={CalendarDays}
                        label="Application Date"
                        value={formatDate(candidate.applicationDate)}
                      />

                      <DetailItem
                        icon={FileText}
                        label="Application Status"
                        value={formatStatus(candidate.status)}
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

                    {candidate.resume ? (
                      <div className="recruiter-details-resume">
                        <div className="recruiter-details-resume-icon">
                          <FileText size={23} />
                        </div>

                        <div>
                          <strong>{candidate.resume}</strong>
                          <span>Resume filename</span>
                        </div>
                      </div>
                    ) : (
                      <p className="recruiter-details-muted">
                        No resume attached to this candidate record.
                      </p>
                    )}

                    <p className="recruiter-details-note">
                      Resume download will be connected after
                      confirming the backend download endpoint.
                    </p>
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