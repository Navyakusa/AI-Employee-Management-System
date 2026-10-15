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

import apiClient from "../../services/apiClient";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerProfile.css";
import "./HiringManagerLayout.css";

function HiringManagerProfile() {
  const getLoggedInUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("loggedInUser") || "null"
      );
    } catch {
      return null;
    }
  };

  const loggedInUser = getLoggedInUser();

  const [profile, setProfile] = useState({
    name: loggedInUser?.userName || "Hiring Manager",
    email: loggedInUser?.email || "Not specified",
    role: "Hiring Manager",
    department: loggedInUser?.department || "Management",
    phone: "",
    location: "",
    employeeId: loggedInUser?.userId
      ? `HM-${loggedInUser.userId}`
      : "HM-001",
  });

  const [editProfile, setEditProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /*
  ======================================================
  ERROR MESSAGE HELPER
  ======================================================
  */

  const getErrorMessage = (err, fallback) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback;

  /*
  ======================================================
  FETCH PROFILE
  GET /api/profile/get
  ======================================================
  */

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get("/profile/get");

        console.log("Profile response:", response.data);

        const payload = response.data;

        const data =
          payload?.data && typeof payload.data === "object"
            ? payload.data
            : payload;

        if (!data || typeof data !== "object") {
          throw new Error("Invalid profile response from the backend.");
        }

        const currentUser = getLoggedInUser();

        const backendUserId =
          data.userId ?? currentUser?.userId;

        const backendEmployeeId =
          data.employeeId ?? backendUserId;

        const updatedProfile = {
          name:
            data.userName ||
            data.name ||
            currentUser?.userName ||
            "Hiring Manager",

          email:
            data.email ||
            currentUser?.email ||
            "Not specified",

          role: data.role || "Hiring Manager",

          department:
            data.department ||
            currentUser?.department ||
            "Management",

          phone:
            data.phone ||
            data.phoneNumber ||
            "",

          location:
            data.location ||
            "",

          employeeId: backendEmployeeId
            ? `HM-${backendEmployeeId}`
            : "HM-001",
        };

        if (isMounted) {
          setProfile(updatedProfile);
          setEditProfile(updatedProfile);
        }

        if (currentUser) {
          localStorage.setItem(
            "loggedInUser",
            JSON.stringify({
              ...currentUser,
              userName: updatedProfile.name,
              email: updatedProfile.email,
              department: updatedProfile.department,
            })
          );
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);

        if (isMounted) {
          setError(
            getErrorMessage(err, "Failed to load profile.")
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
  ======================================================
  INITIALS
  ======================================================
  */

  const initials = (profile.name || "Hiring Manager")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /*
  ======================================================
  HANDLE INPUT CHANGE
  ======================================================
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEditProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  };

  /*
  ======================================================
  EDIT PROFILE
  ======================================================
  */

  const handleEdit = () => {
    setEditProfile({ ...profile });
    setError("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  /*
  ======================================================
  CANCEL EDIT
  ======================================================
  */

  const handleCancel = () => {
    setEditProfile({ ...profile });
    setError("");
    setSuccessMessage("");
    setIsEditing(false);
  };

  /*
  ======================================================
  SAVE PROFILE
  PUT /api/profile/update?userName=...&email=...&department=...
  ======================================================
  */

  const handleSave = async () => {
    if (saving) return;

    const userName = editProfile.name.trim();
    const email = editProfile.email.trim();
    const department = editProfile.department.trim();

    if (!userName) {
      setError("Full name is required.");
      return;
    }

    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (!department) {
      setError("Department is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const params = new URLSearchParams({
        userName,
        email,
        department,
      });

      const response = await apiClient.put(
        `/profile/update?${params.toString()}`
      );

      console.log("Updated profile response:", response.data);

      const payload = response.data;

      const backendProfile =
        payload?.data && typeof payload.data === "object"
          ? payload.data
          : payload;

      const updatedProfile = {
        ...profile,

        name:
          backendProfile?.userName ||
          backendProfile?.name ||
          userName,

        email:
          backendProfile?.email ||
          email,

        department:
          backendProfile?.department ||
          department,
      };

      setProfile(updatedProfile);
      setEditProfile(updatedProfile);
      setIsEditing(false);

      const currentUser = getLoggedInUser();

      if (currentUser) {
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            ...currentUser,
            userName: updatedProfile.name,
            email: updatedProfile.email,
            department: updatedProfile.department,
          })
        );
      }

      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Failed to update profile:", err);

      setError(
        getErrorMessage(err, "Failed to update profile.")
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
              <p className="hiring-manager-label">ACCOUNT</p>
              <h1>My Profile</h1>
              <p>Loading your profile information...</p>
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
  MAIN RENDER
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
            <p className="hiring-manager-label">ACCOUNT</p>

            <h1>My Profile</h1>

            <p>
              View and manage your Hiring Manager profile
              information.
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

              <span>{successMessage}</span>
            </div>
          )}

          {/* PROFILE HEADER */}

          <section className="hm-profile-header-card">
            <div className="hm-profile-main">
              <div className="hm-profile-avatar">
                {initials || "HM"}
              </div>

              <div>
                <h2>{profile.name}</h2>

                <p>{profile.email}</p>

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

          {/* PERSONAL INFORMATION */}

          <section className="hm-profile-card">
            <div className="hm-profile-card-header">
              <div>
                <h2>Personal Information</h2>

                <p>
                  Your account and professional information.
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
                    autoComplete="name"
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
                    value={editProfile.email}
                    onChange={handleChange}
                    autoComplete="email"
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
                  {profile.phone || "Not provided"}
                </div>
              </div>

              {/* LOCATION */}

              <div className="hm-profile-field">
                <label>
                  <MapPin size={16} />
                  Location
                </label>

                <div className="hm-profile-value">
                  {profile.location || "Not provided"}
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
                  disabled={saving}
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="button"
                  className="hm-profile-save-button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </section>

          {/* ACCOUNT INFORMATION */}

          <section className="hm-profile-card">
            <div className="hm-profile-card-header">
              <div>
                <h2>Account Information</h2>

                <p>Platform account details.</p>
              </div>
            </div>

            <div className="hm-profile-account-grid">
              <div>
                <span>Employee ID</span>
                <strong>{profile.employeeId}</strong>
              </div>

              <div>
                <span>Account Role</span>
                <strong>HIRING_MANAGER</strong>
              </div>

              <div>
                <span>Account Status</span>
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
