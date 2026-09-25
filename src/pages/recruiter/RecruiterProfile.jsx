import React, { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";

import apiClient from "../../services/apiClient";

import "./RecruiterProfile.css";

function RecruiterProfile() {
  // =========================================================
  // PROFILE STATE
  // =========================================================

  const [recruiter, setRecruiter] = useState({
    employeeId: "",
    employeeCode: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    manager: "",
    location: "",
    employmentType: "",
    status: "",
    joiningDate: "",
  });

  // =========================================================
  // EDIT FORM STATE
  // =========================================================

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    location: "",
  });

  // =========================================================
  // PAGE STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // =========================================================
  // GET PROFILE
  // GET /api/profile/get
  // =========================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/profile/get"
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to load recruiter profile."
        );
      }

      const data = result.data;

      const profileData = {
        employeeId: data?.employeeId || "",
        employeeCode: data?.employeeCode || "",
        name: data?.name || "",
        email: data?.email || "",
        phone: data?.phone || "",
        department: data?.department || "",
        designation: data?.designation || "",
        manager: data?.manager || "",
        location: data?.location || "",
        employmentType: data?.employmentType || "",
        status: data?.status || "",
        joiningDate: "",
      };

      setRecruiter(profileData);

      setEditForm({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        department: profileData.department,
        location: profileData.location,
      });
    } catch (err) {
      console.error(
        "Recruiter profile fetch error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to access this profile."
        );
      } else if (err.response?.status === 404) {
        setError(
          err.response?.data?.message ||
            "Recruiter profile was not found."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load recruiter profile."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =========================================================
  // EDIT PROFILE
  // =========================================================

  const handleEdit = () => {
    setEditForm({
      name: recruiter.name,
      email: recruiter.email,
      phone: recruiter.phone,
      department: recruiter.department,
      location: recruiter.location,
    });

    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancel = () => {
    setEditForm({
      name: recruiter.name,
      email: recruiter.email,
      phone: recruiter.phone,
      department: recruiter.department,
      location: recruiter.location,
    });

    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  // =========================================================
  // EDIT INPUT CHANGE
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // UPDATE PROFILE
  // PUT /api/profile/update
  // =========================================================

  const handleSaveProfile = async () => {
    if (
      !editForm.name.trim() ||
      !editForm.email.trim() ||
      !editForm.phone.trim() ||
      !editForm.department.trim() ||
      !editForm.location.trim()
    ) {
      setError(
        "Please fill in all editable profile fields."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await apiClient.put(
        "/profile/update",
        null,
        {
          params: {
            userName: editForm.name.trim(),
            email: editForm.email.trim(),
            phone: editForm.phone.trim(),
            department:
              editForm.department.trim(),
            location: editForm.location.trim(),
          },
        }
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to update recruiter profile."
        );
      }

      const data = result.data;

      const updatedProfile = {
        employeeId:
          data?.employeeId ??
          recruiter.employeeId,

        employeeCode:
          data?.employeeCode ||
          recruiter.employeeCode,

        name:
          data?.name ||
          editForm.name,

        email:
          data?.email ||
          editForm.email,

        phone:
          data?.phone ||
          editForm.phone,

        department:
          data?.department ||
          editForm.department,

        designation:
          data?.designation ||
          recruiter.designation,

        manager:
          data?.manager ||
          recruiter.manager,

        location:
          data?.location ||
          editForm.location,

        employmentType:
          data?.employmentType ||
          recruiter.employmentType,

        status:
          data?.status ||
          recruiter.status,

        joiningDate:
          recruiter.joiningDate,
      };

      setRecruiter(updatedProfile);

      setEditForm({
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        department: updatedProfile.department,
        location: updatedProfile.location,
      });

      setSuccess(
        result?.message ||
          "Profile updated successfully"
      );

      setIsEditing(false);

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "Recruiter profile update error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to update this profile."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to update recruiter profile."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // AVATAR LETTER
  // =========================================================

  const avatarLetter =
    recruiter.name?.trim()?.charAt(0)?.toUpperCase() ||
    "R";

  return (
    <div className="recruiter-profile-page">

      {/* SIDEBAR */}
      <RecruiterSidebar />

      {/* TOPBAR */}
      <RecruiterTopbar />

      {/* MAIN CONTENT */}
      <main className="recruiter-profile-main">

        {/* PAGE HEADER */}
        <div className="recruiter-profile-header">

          <div>
            <span className="recruiter-profile-label">
              RECRUITMENT WORKSPACE
            </span>

            <h1>My Profile</h1>

            <p>
              View your recruiter account information.
            </p>
          </div>

          {!loading && !isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Edit Profile
            </button>
          )}

        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fff1f1",
              color: "#d92d20",
              border: "1px solid #fecdca",
            }}
          >
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}

        {success && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#ecfdf3",
              color: "#027a48",
              border: "1px solid #abefc6",
            }}
          >
            {success}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <section className="recruiter-profile-card">
            <div
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >
              Loading recruiter profile...
            </div>
          </section>
        ) : (
          <>

            {/* PROFILE CARD */}
            <section className="recruiter-profile-card">

              {/* PROFILE HEADER */}
              <div className="recruiter-profile-card-header">

                <div className="recruiter-large-avatar">
                  {avatarLetter}
                </div>

                <div className="recruiter-profile-title">

                  <h2>{recruiter.name}</h2>

                  <p>{recruiter.designation}</p>

                  <span className="recruiter-status">
                    <span className="status-dot"></span>
                    {recruiter.status}
                  </span>

                </div>

              </div>

              {/* INFORMATION */}
              <div className="recruiter-profile-section">

                <div className="recruiter-section-title">
                  <UserRound size={18} />
                  <div>
                    <h3>Personal Information</h3>
                    <p>
                      Your basic account information.
                    </p>
                  </div>
                </div>

                <div className="recruiter-info-grid">

                  {/* NAME */}
                  <div className="recruiter-info-item">
                    <span className="info-label">
                      Full Name
                    </span>

                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="info-value">
                        <UserRound size={16} />
                        {recruiter.name}
                      </div>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div className="recruiter-info-item">
                    <span className="info-label">
                      Email Address
                    </span>

                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="info-value">
                        <Mail size={16} />
                        {recruiter.email}
                      </div>
                    )}
                  </div>

                  {/* PHONE */}
                  <div className="recruiter-info-item">
                    <span className="info-label">
                      Phone Number
                    </span>

                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="info-value">
                        <Phone size={16} />
                        {recruiter.phone}
                      </div>
                    )}
                  </div>

                  {/* LOCATION */}
                  <div className="recruiter-info-item">
                    <span className="info-label">
                      Location
                    </span>

                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="info-value">
                        <MapPin size={16} />
                        {recruiter.location}
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* WORK INFORMATION */}
              <div className="recruiter-profile-section">

                <div className="recruiter-section-title">
                  <Briefcase size={18} />

                  <div>
                    <h3>Work Information</h3>
                    <p>
                      Your recruiter employment details.
                    </p>
                  </div>
                </div>

                <div className="recruiter-info-grid">

                  {/* EMPLOYEE ID */}
                  <div className="recruiter-info-item">
                    <span className="info-label">
                      Recruiter ID
                    </span>

                    <div className="info-value">
                      <ShieldCheck size={16} />
                      {recruiter.employeeCode ||
                        recruiter.employeeId}
                    </div>
                  </div>

                  {/* DEPARTMENT */}
                  <div className="recruiter-info-item">
                    <span className="info-label">
                      Department
                    </span>

                    {isEditing ? (
                      <input
                        type="text"
                        name="department"
                        value={editForm.department}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="info-value">
                        <Building2 size={16} />
                        {recruiter.department}
                      </div>
                    )}
                  </div>

                  {/* DESIGNATION */}
                  <div className="recruiter-info-item">
                    <span className="info-label">
                      Designation
                    </span>

                    <div className="info-value">
                      <Briefcase size={16} />
                      {recruiter.designation}
                    </div>
                  </div>

                  {/* JOINING DATE */}
                  <div className="recruiter-info-item">
                    <span className="info-label">
                      Joining Date
                    </span>

                    <div className="info-value">
                      <CalendarDays size={16} />
                      {recruiter.joiningDate || "—"}
                    </div>
                  </div>

                  {/* EMPLOYMENT TYPE */}
                  <div className="recruiter-info-item">
                    <span className="info-label">
                      Employment Type
                    </span>

                    <div className="info-value">
                      {recruiter.employmentType}
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="recruiter-info-item">
                    <span className="info-label">
                      Account Status
                    </span>

                    <div className="info-value status-value">
                      <span className="status-dot"></span>
                      {recruiter.status}
                    </div>
                  </div>

                </div>

              </div>

            </section>

            {/* EDIT ACTIONS */}

            {isEditing && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "18px",
                }}
              >
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            )}

          </>
        )}

      </main>

    </div>
  );
}

export default RecruiterProfile;