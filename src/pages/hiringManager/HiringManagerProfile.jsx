import { useState } from "react";

import {
  User,
  Mail,
  BriefcaseBusiness,
  Building2,
  Phone,
  MapPin,
  Pencil,
  Save,
  X,
  ShieldCheck,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerProfile() {
  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  const [isEditing, setIsEditing] =
    useState(false);

  const [profile, setProfile] = useState({
    name:
      loggedInUser?.userName ||
      "Hiring Manager",

    email:
      loggedInUser?.email ||
      "manager@gmail.com",

    role: "Hiring Manager",

    department:
      loggedInUser?.department ||
      "Management",

    phone: "+91 98765 43210",

    location: "Hyderabad",

    employeeId:
      loggedInUser?.userId
        ? `HM-${loggedInUser.userId}`
        : "HM-001",
  });

  const [editProfile, setEditProfile] =
    useState(profile);

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setEditProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleSave = () => {
    setProfile(editProfile);

    // Temporary frontend storage.
    // Later backend profile API will replace this.
    const existingUser = JSON.parse(
      localStorage.getItem("loggedInUser")
    );

    if (existingUser) {
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          ...existingUser,
          userName: editProfile.name,
          department: editProfile.department,
        })
      );
    }

    setIsEditing(false);
  };

  return (
    <div className="hiring-manager-layout">

      <HiringManagerSidebar />

      <div className="hiring-manager-main">

        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* HEADER */}

          <div className="hiring-manager-dashboard-header">

            <p className="hiring-manager-label">
              ACCOUNT
            </p>

            <h1>My Profile</h1>

            <p>
              View and manage your Hiring Manager
              profile information.
            </p>

          </div>

          {/* PROFILE HEADER */}

          <section className="hm-profile-header-card">

            <div className="hm-profile-main">

              <div className="hm-profile-avatar">
                {initials || "HM"}
              </div>

              <div>

                <h2>
                  {profile.name}
                </h2>

                <p>
                  {profile.email}
                </p>

                <div className="hm-profile-role">

                  <ShieldCheck size={15} />

                  Hiring Manager

                </div>

              </div>

            </div>

            {!isEditing && (

              <button
                type="button"
                className="hm-profile-edit-button"
                onClick={handleEdit}
              >
                <Pencil size={16} />
                Edit Profile
              </button>

            )}

          </section>

          {/* PROFILE INFORMATION */}

          <section className="hm-profile-card">

            <div className="hm-profile-card-header">

              <div>

                <h2>
                  Personal Information
                </h2>

                <p>
                  Your account and professional
                  information.
                </p>

              </div>

            </div>

            <div className="hm-profile-form-grid">

              {/* NAME */}

              <div className="hm-profile-field">

                <label>
                  <User size={16} />
                  Full Name
                </label>

                {isEditing ? (

                  <input
                    type="text"
                    name="name"
                    value={editProfile.name}
                    onChange={handleChange}
                  />

                ) : (

                  <div className="hm-profile-value">
                    {profile.name}
                  </div>

                )}

              </div>

              {/* EMAIL */}

              <div className="hm-profile-field">

                <label>
                  <Mail size={16} />
                  Email Address
                </label>

                <div className="hm-profile-value">
                  {profile.email}
                </div>

              </div>

              {/* PHONE */}

              <div className="hm-profile-field">

                <label>
                  <Phone size={16} />
                  Phone Number
                </label>

                {isEditing ? (

                  <input
                    type="text"
                    name="phone"
                    value={editProfile.phone}
                    onChange={handleChange}
                  />

                ) : (

                  <div className="hm-profile-value">
                    {profile.phone}
                  </div>

                )}

              </div>

              {/* LOCATION */}

              <div className="hm-profile-field">

                <label>
                  <MapPin size={16} />
                  Location
                </label>

                {isEditing ? (

                  <input
                    type="text"
                    name="location"
                    value={editProfile.location}
                    onChange={handleChange}
                  />

                ) : (

                  <div className="hm-profile-value">
                    {profile.location}
                  </div>

                )}

              </div>

              {/* ROLE */}

              <div className="hm-profile-field">

                <label>
                  <BriefcaseBusiness size={16} />
                  Role
                </label>

                <div className="hm-profile-value">
                  Hiring Manager
                </div>

              </div>

              {/* DEPARTMENT */}

              <div className="hm-profile-field">

                <label>
                  <Building2 size={16} />
                  Department
                </label>

                {isEditing ? (

                  <input
                    type="text"
                    name="department"
                    value={editProfile.department}
                    onChange={handleChange}
                  />

                ) : (

                  <div className="hm-profile-value">
                    {profile.department}
                  </div>

                )}

              </div>

            </div>

            {/* ACTIONS */}

            {isEditing && (

              <div className="hm-profile-actions">

                <button
                  type="button"
                  className="hm-profile-cancel-button"
                  onClick={handleCancel}
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="button"
                  className="hm-profile-save-button"
                  onClick={handleSave}
                >
                  <Save size={16} />
                  Save Changes
                </button>

              </div>

            )}

          </section>

          {/* ACCOUNT INFORMATION */}

          <section className="hm-profile-card">

            <div className="hm-profile-card-header">

              <div>

                <h2>
                  Account Information
                </h2>

                <p>
                  Platform account details.
                </p>

              </div>

            </div>

            <div className="hm-profile-account-grid">

              <div>

                <span>
                  Employee ID
                </span>

                <strong>
                  {profile.employeeId}
                </strong>

              </div>

              <div>

                <span>
                  Account Role
                </span>

                <strong>
                  HIRING_MANAGER
                </strong>

              </div>

              <div>

                <span>
                  Account Status
                </span>

                <strong className="hm-profile-active">
                  Active
                </strong>

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default HiringManagerProfile;