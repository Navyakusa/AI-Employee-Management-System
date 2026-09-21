import { useState } from "react";

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

import "./InterviewerDashboard.css";

function InterviewerProfile() {
  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  // Temporary data until backend profile integration
  const initialProfile = {
    name:
      loggedInUser?.userName ||
      "Interviewer Test",

    email:
      loggedInUser?.email ||
      "interviewer2@gmail.com",

    phone: "+91 98765 43210",

    department:
      loggedInUser?.department ||
      "IT",

    role: "INTERVIEWER",

    designation:
      "Technical Interviewer",
  };

  const [profile, setProfile] =
    useState(initialProfile);

  const [formData, setFormData] =
    useState(initialProfile);

  const [isEditing, setIsEditing] =
    useState(false);

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
    setProfile(formData);
    setIsEditing(false);

    // Temporary frontend update.
    // Backend API will replace this later.
    const existingUser =
      JSON.parse(
        localStorage.getItem("loggedInUser")
      ) || {};

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        ...existingUser,
        userName: formData.name,
        email: formData.email,
        department: formData.department,
      })
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
              ACCOUNT
            </p>

            <h1>My Profile</h1>

            <p>
              View and manage your interviewer
              account information.
            </p>

          </div>

          <div className="interviewer-profile-layout">

            {/* LEFT PROFILE CARD */}

            <section className="interviewer-profile-card">

              <div className="interviewer-profile-avatar">
                {initials || "IN"}
              </div>

              <h2>{profile.name}</h2>

              <p>
                {profile.designation}
              </p>

              <span className="interviewer-profile-role">
                <ShieldCheck size={14} />
                INTERVIEWER
              </span>

              <div className="interviewer-profile-divider" />

              <div className="interviewer-profile-quick-info">

                <div>
                  <Mail size={16} />

                  <span>
                    {profile.email}
                  </span>
                </div>

                <div>
                  <Building2 size={16} />

                  <span>
                    {profile.department}
                  </span>
                </div>

                <div>
                  <BriefcaseBusiness size={16} />

                  <span>
                    {profile.designation}
                  </span>
                </div>

              </div>

            </section>

            {/* RIGHT */}

            <section className="interviewer-profile-details-card">

              <div className="interviewer-profile-details-header">

                <div>
                  <h2>
                    Personal Information
                  </h2>

                  <p>
                    Manage your account and
                    professional information.
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
                    >
                      <X size={16} />
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="save"
                      onClick={handleSave}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>

                  </div>

                )}

              </div>

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
                    <div>
                      {profile.name}
                    </div>
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
                    <div>
                      {profile.email}
                    </div>
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
                    <div>
                      {profile.phone}
                    </div>
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
                      value={
                        formData.department
                      }
                      onChange={handleChange}
                    />
                  ) : (
                    <div>
                      {profile.department}
                    </div>
                  )}

                </div>

                {/* DESIGNATION */}

                <div className="interviewer-profile-field">

                  <label>
                    <BriefcaseBusiness
                      size={15}
                    />
                    Designation
                  </label>

                  {isEditing ? (
                    <input
                      type="text"
                      name="designation"
                      value={
                        formData.designation
                      }
                      onChange={handleChange}
                    />
                  ) : (
                    <div>
                      {profile.designation}
                    </div>
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

        </main>

      </div>

    </div>
  );
}

export default InterviewerProfile;