import { useEffect, useState } from "react";

import {
  User,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  Edit3,
  Save,
  X,
  ShieldCheck,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import {
  getMyProfile,
  updateMyProfile,
} from "../../services/interviewerService";

import "./InterviewerDashboard.css";

// Distinguishes the three different ways an axios call can fail, so the
// UI can tell the user something more useful than a generic message:
//   1. err.response exists    -> server responded with an error status
//      (e.g. 403, 500) — a real backend/auth problem.
//   2. err.request exists,
//      but no err.response    -> the request was sent but NO response
//      ever came back — almost always CORS being blocked, the server
//      being down/unreachable, or the endpoint not existing at all.
//   3. neither                -> something broke building the request
//      itself (rare — a code bug, not a network/server issue).
function describeAxiosError(err) {
  if (err?.response) {
    const status = err.response.status;
    const backendMessage = err.response.data?.message;

    return `HTTP ${status}${backendMessage ? `: ${backendMessage}` : ""}`;
  }

  if (err?.request) {
    return "no response from server — likely CORS blocked, the server is unreachable, or the endpoint doesn't exist";
  }

  return err?.message || "unknown error";
}

const FALLBACK_PROFILE = {
  name: "Interviewer Test",
  email: "interviewer2@gmail.com",
  phone: "+91 98765 43210",
  department: "IT",
  role: "INTERVIEWER",
  designation: "Technical Interviewer",
};

function InterviewerProfile() {
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [formData, setFormData] = useState(FALLBACK_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        const mapped = data || FALLBACK_PROFILE;
        setProfile(mapped);
        setFormData(mapped);
      })
      .catch((err) => {
        console.error("Failed to load interviewer profile:", err);

        setError(
          `Couldn't load your profile (${describeAxiosError(
            err
          )}) — showing cached data.`
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleSave = () => {
    setSaving(true);
    setError(null);

    updateMyProfile(formData)
      .then((data) => {
        const mapped = data || formData;
        setProfile(mapped);
        setIsEditing(false);

        // Keep the navbar/localStorage-derived name in sync.
        const existingUser =
          JSON.parse(localStorage.getItem("loggedInUser")) || {};

        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            ...existingUser,
            userName: mapped.name,
            email: mapped.email,
            department: mapped.department,
          })
        );
      })
      .catch((err) => {
        console.error("Failed to update interviewer profile:", err);

        setError(
          `Couldn't save your changes (${describeAxiosError(
            err
          )}). Please try again.`
        );
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="interviewer-layout">
      <InterviewerSidebar />

      <div className="interviewer-main">
        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">
          {/* HEADER */}

          <div className="interviewer-dashboard-header">
            <p className="interviewer-label">ACCOUNT</p>

            <h1>My Profile</h1>

            <p>View and manage your interviewer account information.</p>
          </div>

          {loading ? (
            <p>Loading profile...</p>
          ) : (
            <div className="interviewer-profile-layout">
              {/* LEFT PROFILE CARD */}

              <section className="interviewer-profile-card">
                <div className="interviewer-profile-avatar">
                  {initials || "IN"}
                </div>

                <h2>{profile.name}</h2>

                <p>{profile.designation}</p>

                <span className="interviewer-profile-role">
                  <ShieldCheck size={14} />
                  INTERVIEWER
                </span>

                <div className="interviewer-profile-divider" />

                <div className="interviewer-profile-quick-info">
                  <div>
                    <Mail size={16} />
                    <span>{profile.email}</span>
                  </div>

                  <div>
                    <Building2 size={16} />
                    <span>{profile.department}</span>
                  </div>

                  <div>
                    <BriefcaseBusiness size={16} />
                    <span>{profile.designation}</span>
                  </div>
                </div>
              </section>

              {/* RIGHT */}

              <section className="interviewer-profile-details-card">
                <div className="interviewer-profile-details-header">
                  <div>
                    <h2>Personal Information</h2>

                    <p>
                      Manage your account and professional information.
                    </p>
                  </div>

                  {!isEditing ? (
                    <button
                      type="button"
                      className="interviewer-profile-edit-button"
                      onClick={handleEdit}
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="interviewer-profile-edit-actions">
                      <button
                        type="button"
                        className="cancel"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X size={16} />
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="save"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="interviewer-evaluation-error">{error}</p>
                )}

                <div className="interviewer-profile-form">
                  {/* NAME */}

                  <div className="interviewer-profile-field">
                    <label>
                      <User size={15} />
                      Full Name
                    </label>

                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    ) : (
                      <div>{profile.name}</div>
                    )}
                  </div>

                  {/* EMAIL */}

                  <div className="interviewer-profile-field">
                    <label>
                      <Mail size={15} />
                      Email Address
                    </label>

                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    ) : (
                      <div>{profile.email}</div>
                    )}
                  </div>

                  {/* PHONE */}

                  <div className="interviewer-profile-field">
                    <label>
                      <Phone size={15} />
                      Phone Number
                    </label>

                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    ) : (
                      <div>{profile.phone}</div>
                    )}
                  </div>

                  {/* DEPARTMENT */}

                  <div className="interviewer-profile-field">
                    <label>
                      <Building2 size={15} />
                      Department
                    </label>

                    {isEditing ? (
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      />
                    ) : (
                      <div>{profile.department}</div>
                    )}
                  </div>

                  {/* DESIGNATION */}

                  <div className="interviewer-profile-field">
                    <label>
                      <BriefcaseBusiness size={15} />
                      Designation
                    </label>

                    {isEditing ? (
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                      />
                    ) : (
                      <div>{profile.designation}</div>
                    )}
                  </div>

                  {/* ROLE */}

                  <div className="interviewer-profile-field">
                    <label>
                      <ShieldCheck size={15} />
                      Account Role
                    </label>

                    <div className="interviewer-profile-readonly">
                      INTERVIEWER
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default InterviewerProfile;
