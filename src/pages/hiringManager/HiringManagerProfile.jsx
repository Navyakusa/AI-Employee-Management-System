import React, { useEffect, useState } from "react";

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
  AlertCircle,
  Clock,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import {
  getProfile,
  updateProfile,
} from "./HiringManagerApi";

import "./HiringManagerProfile.css";
import "./HiringManagerLayout.css";

function HiringManagerProfile() {
  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "null"
  );

  const [profile, setProfile] = useState({
    name:
      loggedInUser?.userName ||
      "Hiring Manager",

    email:
      loggedInUser?.email ||
      "Not specified",

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

  const [isEditing, setIsEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
  ======================================================
  FETCH PROFILE
  ======================================================
  */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProfile();

        console.log(
          "Profile response:",
          response
        );

        const data = response?.data;

        if (data) {
          const updatedProfile = {
            name:
              data.userName ||
              data.name ||
              loggedInUser?.userName ||
              "Hiring Manager",

            email:
              data.email ||
              loggedInUser?.email ||
              "Not specified",

            role:
              data.role ||
              "Hiring Manager",

            department:
              data.department ||
              loggedInUser?.department ||
              "Management",

            phone:
              data.phone ||
              data.phoneNumber ||
              "+91 98765 43210",

            location:
              data.location ||
              "Hyderabad",

            employeeId:
              data.employeeId ||
              data.userId
                ? `HM-${
                    data.employeeId ||
                    data.userId
                  }`
                : loggedInUser?.userId
                  ? `HM-${loggedInUser.userId}`
                  : "HM-001",
          };

          setProfile(updatedProfile);
          setEditProfile(updatedProfile);

          /*
          Update local storage with the latest
          backend profile information.
          */

          const existingUser = JSON.parse(
            localStorage.getItem(
              "loggedInUser"
            ) || "null"
          );

          if (existingUser) {
            localStorage.setItem(
              "loggedInUser",
              JSON.stringify({
                ...existingUser,
                userName:
                  updatedProfile.name,
                email:
                  updatedProfile.email,
                department:
                  updatedProfile.department,
              })
            );
          }
        }
      } catch (err) {
        console.error(
          "Failed to fetch profile:",
          err
        );

        setError(
          err.message ||
            "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /*
  ======================================================
  INITIALS
  ======================================================
  */

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /*
  ======================================================
  HANDLE CHANGE
  ======================================================
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEditProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  ======================================================
  EDIT
  ======================================================
  */

  const handleEdit = () => {
    setEditProfile(profile);
    setError("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  /*
  ======================================================
  CANCEL
  ======================================================
  */

  const handleCancel = () => {
    setEditProfile(profile);
    setError("");
    setSuccessMessage("");
    setIsEditing(false);
  };

  /*
  ======================================================
  SAVE PROFILE
  ======================================================
  */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (!editProfile.name.trim()) {
        setError("Full name is required.");
        return;
      }

      if (!editProfile.email.trim()) {
        setError("Email address is required.");
        return;
      }

      if (!editProfile.department.trim()) {
        setError("Department is required.");
        return;
      }

      const response = await updateProfile(
        editProfile.name.trim(),
        editProfile.email.trim(),
        editProfile.department.trim()
      );

      console.log(
        "Updated profile response:",
        response
      );

      const backendProfile =
        response?.data;

      const updatedProfile = {
        ...profile,

        name:
          backendProfile?.userName ||
          backendProfile?.name ||
          editProfile.name,

        email:
          backendProfile?.email ||
          editProfile.email,

        department:
          backendProfile?.department ||
          editProfile.department,
      };

      setProfile(updatedProfile);
      setEditProfile(updatedProfile);

      /*
      Keep localStorage synchronized with
      the backend profile.
      */

      const existingUser = JSON.parse(
        localStorage.getItem(
          "loggedInUser"
        ) || "null"
      );

      if (existingUser) {
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            ...existingUser,
            userName:
              updatedProfile.name,
            email:
              updatedProfile.email,
            department:
              updatedProfile.department,
          })
        );
      }

      setIsEditing(false);

      setSuccessMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update profile:",
        err
      );

      setError(
        err.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ======================================================
  LOADING
  ======================================================
  */

  if (loading) {
    return (
      <div className="hiring-manager-layout">

        <HiringManagerSidebar />

        <div className="hiring-manager-main">

          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">

            <div className="hiring-manager-dashboard-header">

              <p className="hiring-manager-label">
                ACCOUNT
              </p>

              <h1>
                My Profile
              </h1>

              <p>
                Loading your profile information...
              </p>

            </div>

            <section className="hm-profile-card">

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "30px",
                  color: "#64748b",
                }}
              >
                <Clock size={20} />
                Loading profile...
              </div>

            </section>

          </main>

        </div>

      </div>
    );
  }

  /*
  ======================================================
  RENDER
  ======================================================
  */

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

            <h1>
              My Profile
            </h1>

            <p>
              View and manage your Hiring Manager
              profile information.
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 18px",
                borderRadius: "10px",
                background: "#fef2f2",
                color: "#b91c1c",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}


          {/* SUCCESS */}

          {successMessage && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 18px",
                borderRadius: "10px",
                background: "#f0fdf4",
                color: "#15803d",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <CheckCircleIcon />
              <span>
                {successMessage}
              </span>
            </div>
          )}


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
                    value={
                      editProfile.name
                    }
                    onChange={
                      handleChange
                    }
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

                {isEditing ? (

                  <input
                    type="email"
                    name="email"
                    value={
                      editProfile.email
                    }
                    onChange={
                      handleChange
                    }
                  />

                ) : (

                  <div className="hm-profile-value">
                    {profile.email}
                  </div>

                )}

              </div>


              {/* PHONE */}

              <div className="hm-profile-field">

                <label>
                  <Phone size={16} />
                  Phone Number
                </label>

                <div className="hm-profile-value">
                  {profile.phone}
                </div>

              </div>


              {/* LOCATION */}

              <div className="hm-profile-field">

                <label>
                  <MapPin size={16} />
                  Location
                </label>

                <div className="hm-profile-value">
                  {profile.location}
                </div>

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
                    value={
                      editProfile.department
                    }
                    onChange={
                      handleChange
                    }
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
                  onClick={
                    handleCancel
                  }
                  disabled={saving}
                >
                  <X size={16} />
                  Cancel
                </button>


                <button
                  type="button"
                  className="hm-profile-save-button"
                  onClick={
                    handleSave
                  }
                  disabled={saving}
                >
                  <Save size={16} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}

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

/*
======================================================
SMALL SUCCESS ICON
======================================================
*/

function CheckCircleIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
      }}
    >
      ✓
    </span>
  );
}

export default HiringManagerProfile;