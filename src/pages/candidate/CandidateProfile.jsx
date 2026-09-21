import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
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

import {
  getMyProfile,
  updateMyProfile,
  uploadResume,
} from "../../services/candidateService";
import {
  EMPTY_PROFILE,
  calcProfileCompletion,
  formatRupees,
  formatDate,
  fromApiProfile,
  getErrorMessage,
  notifyProfileChanged,
  readRememberedResume,
  rememberResume,
  splitList,
  toApiProfile,
  validateResumeFile,
} from "../../services/candidateHelpers";

import "./CandidateDashboard.css";

function CandidateProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [savedProfile, setSavedProfile] = useState(EMPTY_PROFILE);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // The id the profile API returns for this candidate. Resume upload
  // uses it, so uploads can only ever go to the candidate's own record.
  const [candidateId, setCandidateId] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);
  const fileInputRef = useRef(null);

  const completion = calcProfileCompletion(profile);

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyProfile();
      const mapped = fromApiProfile(data);

      setProfile(mapped);
      setSavedProfile(mapped);
      setCandidateId(Number(data?.id) || 0);
      setUploadedResume(readRememberedResume(mapped.email));
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load your profile.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setNotice("");
    setSavedProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile.fullName.trim()) {
      setNotice("Full name is required.");
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      const updated = await updateMyProfile(
        toApiProfile(profile)
      );

      const mapped = fromApiProfile(updated);

      setProfile(mapped);
      setSavedProfile(mapped);
      setCandidateId((current) => Number(updated?.id) || current);
      setIsEditing(false);
      setNotice("Profile updated successfully.");
      notifyProfileChanged();

      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setNotice(
        getErrorMessage(err, "Unable to save your profile.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResumeChange = async (event) => {
    const file = event.target.files?.[0];

    // allow choosing the same file again later
    event.target.value = "";

    if (!file) {
      return;
    }

    const problem = validateResumeFile(file);

    if (problem) {
      setNotice(problem);
      return;
    }

    setUploading(true);
    setNotice("");

    try {
      const result = await uploadResume(candidateId, file);

      const uploaded = {
        name: result?.fileName || file.name,
        updated:
          formatDate(result?.uploadedAt) || formatDate(new Date()),
      };

      // the profile API does not return the resume yet, so keep it
      // in this browser to survive a refresh
      rememberResume(profile.email, uploaded);
      setUploadedResume(uploaded);

      // The backend reads skills from the resume, so reload the profile.
      try {
        const mapped = fromApiProfile(await getMyProfile());

        setProfile(mapped);
        setSavedProfile(mapped);
      } catch {
        // the upload itself worked; the profile refreshes next visit
      }

      setNotice("Resume uploaded successfully.");
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setNotice(
        getErrorMessage(
          err,
          "Unable to upload your resume. Please try again."
        )
      );
    } finally {
      setUploading(false);
    }
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
                disabled={loading || Boolean(error)}
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
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="candidate-profile-save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <CheckCircle2 size={15} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {loading && (
            <section className="candidate-profile-card">
              <p>Loading your profile...</p>
            </section>
          )}

          {error && (
            <section className="candidate-profile-card">
              <p>{error}</p>

              <button
                type="button"
                className="candidate-profile-cancel-btn"
                onClick={loadProfile}
              >
                Try Again
              </button>
            </section>
          )}

          {notice && (
            <section className="candidate-profile-card">
              <p>{notice}</p>
            </section>
          )}

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
                <strong>{completion}%</strong>
              </div>

              <div className="candidate-profile-progress">
                <div
                  className="candidate-profile-progress-fill"
                  style={{ width: `${completion}%` }}
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
                editing={false}
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
                display={formatRupees(profile.expectedSalary)}
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
                    {splitList(profile.skills).length > 0 ? (
                      splitList(profile.skills).map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))
                    ) : (
                      <span>Not provided</span>
                    )}
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
                  <h3>
                    {profile.resume ||
                      uploadedResume?.name ||
                      "No resume uploaded"}
                  </h3>

                  {(uploadedResume || profile.resume) && (
                    <span>
                      <CheckCircle2 size={12} />
                      Current Resume
                    </span>
                  )}
                </div>

                <p>
                  {uploadedResume
                    ? `Uploaded ${uploadedResume.updated}`
                    : profile.resume
                    ? "Resume on file"
                    : "Upload a resume to apply faster."}
                </p>

                <small>
                  {candidateId
                    ? "Supported formats: PDF, DOC and DOCX (up to 5 MB)."
                    : "Save your profile once to enable resume upload."}
                </small>
              </div>

              <div className="candidate-profile-resume-actions">
                <button
                  type="button"
                  className="candidate-profile-resume-upload"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || isEditing || !candidateId}
                  title={
                    isEditing
                      ? "Save or cancel your edits first"
                      : !candidateId
                      ? "Save your profile once to enable resume upload"
                      : "Upload a PDF, DOC or DOCX resume"
                  }
                >
                  <Upload size={15} />
                  {uploading
                    ? "Uploading..."
                    : uploadedResume || profile.resume
                    ? "Replace Resume"
                    : "Upload Resume"}
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
  display,
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
          <span>{display || value || "Not provided"}</span>
        </div>
      )}
    </div>
  );
}

export default CandidateProfile;