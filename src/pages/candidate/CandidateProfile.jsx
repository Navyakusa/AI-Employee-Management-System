import { useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Upload,
  UserRound,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import "./CandidateDashboard.css";

function CandidateProfile() {
  const fileInputRef = useRef(null);

  const storedUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "{}"
  );

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    fullName:
      storedUser.userName ||
      storedUser.name ||
      "Candidate User",

    email:
      storedUser.email ||
      "candidate@gmail.com",

    phone: "+91 98765 43210",

    location: "Hyderabad, Telangana",

    education:
      "B.Tech - Computer Science and Engineering",

    experience: "1 Year",

    skills:
      "Java, Spring Boot, React, PostgreSQL, REST API, Git",

    linkedin:
      "https://linkedin.com/in/candidate",

    portfolio:
      "https://github.com/candidate",

    expectedSalary: "₹6,50,000",

    noticePeriod: "Immediate",
  });

  const [savedProfile, setSavedProfile] =
    useState(profile);

  const [resume, setResume] = useState({
    name: "Candidate_Resume.pdf",
    size: "1.2 MB",
    updated: "15 Sep 2026",
    file: null,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setSavedProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setIsEditing(false);
  };

  const handleSave = () => {
    // Backend integration later:
    // PUT /api/candidate/profile

    console.log("Updated profile:", profile);

    setSavedProfile(profile);
    setIsEditing(false);
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
    ];

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      alert(
        "Please upload a PDF, DOC, or DOCX resume."
      );
      return;
    }

    setResume({
      name: file.name,
      size: `${(
        file.size /
        (1024 * 1024)
      ).toFixed(2)} MB`,
      updated: new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
      file,
    });

    event.target.value = "";
  };

  const handleDownloadResume = () => {
    if (!resume.file) {
      return;
    }

    const url = URL.createObjectURL(resume.file);

    const link = document.createElement("a");

    link.href = url;
    link.download = resume.name;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          {/* HEADER */}

          <div className="candidate-profile-page-header">
            <div>
              <p className="candidate-label">
                MY ACCOUNT
              </p>

              <h1>My Profile</h1>

              <p>
                Manage your personal information,
                professional details and resume.
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                className="candidate-profile-edit-btn"
                onClick={handleEdit}
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            ) : (
              <div className="candidate-profile-header-actions">
                <button
                  type="button"
                  className="candidate-profile-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="candidate-profile-save-btn"
                  onClick={handleSave}
                >
                  <CheckCircle2 size={15} />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* PROFILE OVERVIEW */}

          <section className="candidate-profile-overview">
            <div className="candidate-profile-avatar">
              {profile.fullName
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="candidate-profile-overview-info">
              <h2>{profile.fullName}</h2>

              <p>
                <Mail size={14} />
                {profile.email}
              </p>

              <p>
                <MapPin size={14} />
                {profile.location}
              </p>
            </div>

            <div className="candidate-profile-completion">
              <div>
                <span>Profile Completion</span>
                <strong>85%</strong>
              </div>

              <div className="candidate-profile-progress">
                <div
                  className="candidate-profile-progress-fill"
                  style={{ width: "85%" }}
                />
              </div>

              <p>
                Add complete professional details to
                improve your profile.
              </p>
            </div>
          </section>

          {/* PERSONAL INFORMATION */}

          <section className="candidate-profile-card">
            <div className="candidate-profile-card-heading">
              <div>
                <UserRound size={19} />
              </div>

              <div>
                <h2>Personal Information</h2>

                <p>
                  Basic information associated with your
                  candidate profile.
                </p>
              </div>
            </div>

            <div className="candidate-profile-form-grid">
              <ProfileField
                label="Full Name"
                name="fullName"
                value={profile.fullName}
                icon={<UserRound size={15} />}
                editing={isEditing}
                onChange={handleChange}
              />

              <ProfileField
                label="Email Address"
                name="email"
                value={profile.email}
                icon={<Mail size={15} />}
                editing={isEditing}
                onChange={handleChange}
              />

              <ProfileField
                label="Phone Number"
                name="phone"
                value={profile.phone}
                icon={<Phone size={15} />}
                editing={isEditing}
                onChange={handleChange}
              />

              <ProfileField
                label="Current Location"
                name="location"
                value={profile.location}
                icon={<MapPin size={15} />}
                editing={isEditing}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* PROFESSIONAL INFORMATION */}

          <section className="candidate-profile-card">
            <div className="candidate-profile-card-heading">
              <div>
                <BriefcaseBusiness size={19} />
              </div>

              <div>
                <h2>
                  Professional Information
                </h2>

                <p>
                  Your education, experience, skills and
                  career preferences.
                </p>
              </div>
            </div>

            <div className="candidate-profile-form-grid">
              <ProfileField
                label="Education"
                name="education"
                value={profile.education}
                icon={<GraduationCap size={15} />}
                editing={isEditing}
                onChange={handleChange}
              />

              <ProfileField
                label="Experience"
                name="experience"
                value={profile.experience}
                icon={
                  <BriefcaseBusiness size={15} />
                }
                editing={isEditing}
                onChange={handleChange}
              />

              <ProfileField
                label="Expected Salary"
                name="expectedSalary"
                value={profile.expectedSalary}
                editing={isEditing}
                onChange={handleChange}
              />

              <ProfileField
                label="Notice Period"
                name="noticePeriod"
                value={profile.noticePeriod}
                editing={isEditing}
                onChange={handleChange}
              />

              <ProfileField
  label="LinkedIn Profile"
  name="linkedin"
  value={profile.linkedin}
  editing={isEditing}
  onChange={handleChange}
/>

              <ProfileField
                label="Portfolio / GitHub"
                name="portfolio"
                value={profile.portfolio}
                editing={isEditing}
                onChange={handleChange}
              />

              <div className="candidate-profile-field candidate-profile-skills-field">
                <label>Skills</label>

                {isEditing ? (
                  <textarea
                    name="skills"
                    rows="3"
                    value={profile.skills}
                    onChange={handleChange}
                    placeholder="Java, Spring Boot, React..."
                  />
                ) : (
                  <div className="candidate-profile-skills">
                    {profile.skills
                      .split(",")
                      .map((skill) => (
                        <span key={skill.trim()}>
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RESUME */}

          <section className="candidate-profile-card">
            <div className="candidate-profile-card-heading">
              <div>
                <FileText size={19} />
              </div>

              <div>
                <h2>Resume</h2>

                <p>
                  Manage the resume used for your job
                  applications.
                </p>
              </div>
            </div>

            <div className="candidate-profile-resume">
              <div className="candidate-profile-resume-icon">
                <FileText size={25} />
              </div>

              <div className="candidate-profile-resume-info">
                <div className="candidate-profile-resume-title">
                  <h3>{resume.name}</h3>

                  <span>
                    <CheckCircle2 size={12} />
                    Current Resume
                  </span>
                </div>

                <p>
                  {resume.size} • Updated{" "}
                  {resume.updated}
                </p>

                <small>
                  Supported formats: PDF, DOC and DOCX
                </small>
              </div>

              <div className="candidate-profile-resume-actions">
                {resume.file && (
                  <button
                    type="button"
                    className="candidate-profile-resume-download"
                    onClick={handleDownloadResume}
                  >
                    <Download size={15} />
                    Download
                  </button>
                )}

                <button
                  type="button"
                  className="candidate-profile-resume-upload"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <Upload size={15} />
                  Replace Resume
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleResumeChange}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  name,
  value,
  icon,
  editing,
  onChange,
}) {
  return (
    <div className="candidate-profile-field">
      <label>{label}</label>

      {editing ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
        />
      ) : (
        <div className="candidate-profile-field-value">
          {icon}
          <span>{value || "Not provided"}</span>
        </div>
      )}
    </div>
  );
}

export default CandidateProfile;