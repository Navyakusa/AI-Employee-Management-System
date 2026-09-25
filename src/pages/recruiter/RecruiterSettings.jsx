import React, { useEffect, useState } from "react";
import {
  UserRound,
  Bell,
  Lock,
  Palette,
  Save,
} from "lucide-react";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";

import apiClient from "../../services/apiClient";

import "./RecruiterSettings.css";

function RecruiterSettings() {
  // =========================================================
  // ACCOUNT SETTINGS
  // =========================================================

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    designation: "",
  });

  // =========================================================
  // NOTIFICATION SETTINGS
  // =========================================================

  const [notifications, setNotifications] = useState({
    email: false,
    interview: false,
    candidate: false,
  });

  // =========================================================
  // THEME
  // =========================================================

  const [theme, setTheme] = useState("LIGHT");

  // =========================================================
  // PAGE STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // CHANGE PASSWORD STATES
  // =========================================================

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  // =========================================================
  // GET RECRUITER SETTINGS
  // GET /api/recruiter/settings
  // =========================================================

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/recruiter/settings"
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to load recruiter settings."
        );
      }

      const data = result.data;

      setProfile({
        name: data?.recruiterName || "",
        email: data?.email || "",
        designation: data?.designation || "",
      });

      setNotifications({
        email: Boolean(data?.emailNotifications),
        interview: Boolean(
          data?.interviewNotifications
        ),
        candidate: Boolean(data?.candidateUpdates),
      });

      setTheme(data?.theme || "LIGHT");
    } catch (err) {
      console.error(
        "Recruiter settings fetch error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to access recruiter settings."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load recruiter settings."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // =========================================================
  // PROFILE INPUT CHANGE
  // =========================================================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  // =========================================================
  // NOTIFICATION CHANGE
  // =========================================================

  const handleNotificationChange = (
    notificationName,
    checked
  ) => {
    setNotifications((current) => ({
      ...current,
      [notificationName]: checked,
    }));

    setSaved(false);
    setError("");
  };

  // =========================================================
  // THEME CHANGE
  // =========================================================

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
    setSaved(false);
    setError("");
  };

  // =========================================================
  // SAVE SETTINGS
  // PUT /api/recruiter/settings
  // =========================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const payload = {
        recruiterName: profile.name.trim(),
        email: profile.email.trim(),
        designation: profile.designation.trim(),

        emailNotifications: notifications.email,

        interviewNotifications:
          notifications.interview,

        candidateUpdates: notifications.candidate,

        theme: theme,
      };

      const response = await apiClient.put(
        "/recruiter/settings",
        payload
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to update recruiter settings."
        );
      }

      // Update UI using backend response
      const data = result.data;

      if (data) {
        setProfile({
          name:
            data.recruiterName ||
            payload.recruiterName,

          email:
            data.email ||
            payload.email,

          designation:
            data.designation ||
            payload.designation,
        });

        setNotifications({
          email:
            data.emailNotifications ??
            payload.emailNotifications,

          interview:
            data.interviewNotifications ??
            payload.interviewNotifications,

          candidate:
            data.candidateUpdates ??
            payload.candidateUpdates,
        });

        setTheme(
          data.theme ||
            payload.theme
        );
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error(
        "Recruiter settings update error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to update recruiter settings."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to save recruiter settings."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // PASSWORD INPUT CHANGE
  // =========================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  // =========================================================
  // OPEN PASSWORD MODAL
  // =========================================================

  const handleOpenPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordSuccess("");
    setShowPasswordModal(true);
  };

  // =========================================================
  // CLOSE PASSWORD MODAL
  // =========================================================

  const handleClosePasswordModal = () => {
    if (changingPassword) {
      return;
    }

    setShowPasswordModal(false);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordSuccess("");
  };

  // =========================================================
  // CHANGE PASSWORD
  // PUT /api/recruiter/settings/password
  // =========================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await apiClient.put(
        "/recruiter/settings/password",
        {
          currentPassword:
            passwordForm.currentPassword,

          newPassword:
            passwordForm.newPassword,

          confirmPassword:
            passwordForm.confirmPassword,
        }
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to change password."
        );
      }

      setPasswordSuccess(
        result.message ||
          "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 1800);
    } catch (err) {
      console.error(
        "Change password error:",
        err
      );

      if (err.response?.status === 401) {
        setPasswordError(
          err.response?.data?.message ||
            "Current password is incorrect."
        );
      } else if (err.response?.status === 403) {
        setPasswordError(
          err.response?.data?.message ||
            "You are not authorized to change the password."
        );
      } else {
        setPasswordError(
          err.response?.data?.message ||
            err.message ||
            "Failed to change password."
        );
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="recruiter-settings-page">

      {/* SIDEBAR */}
      <RecruiterSidebar />

      {/* TOPBAR */}
      <RecruiterTopbar />

      {/* MAIN */}
      <main className="recruiter-settings-main">

        {/* PAGE HEADER */}
        <div className="recruiter-settings-header">

          <div>
            <span className="recruiter-settings-label">
              RECRUITMENT WORKSPACE
            </span>

            <h1>Settings</h1>

            <p>
              Manage your account and application
              preferences.
            </p>
          </div>

        </div>

        {/* =========================
            API ERROR
        ========================= */}

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

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (
          <section className="settings-card">
            <div
              style={{
                padding: "24px",
                textAlign: "center",
              }}
            >
              Loading recruiter settings...
            </div>
          </section>
        ) : (
          <>

            {/* =========================
                ACCOUNT SETTINGS
            ========================= */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon">
                  <UserRound size={19} />
                </div>

                <div>
                  <h2>Account Settings</h2>

                  <p>
                    Manage your recruiter account
                    information.
                  </p>
                </div>

              </div>

              <div className="settings-form">

                <div className="settings-field">

                  <label>
                    Recruiter Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Designation
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={profile.designation}
                    onChange={handleProfileChange}
                  />

                </div>

              </div>

            </section>

            {/* =========================
                NOTIFICATION SETTINGS
            ========================= */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon">
                  <Bell size={19} />
                </div>

                <div>
                  <h2>
                    Notification Preferences
                  </h2>

                  <p>
                    Choose which notifications you
                    want to receive.
                  </p>
                </div>

              </div>

              <div className="settings-options">

                {/* EMAIL */}
                <div className="settings-option">

                  <div>
                    <strong>
                      Email Notifications
                    </strong>

                    <span>
                      Receive important recruitment
                      updates through email.
                    </span>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={
                        notifications.email
                      }
                      onChange={(e) =>
                        handleNotificationChange(
                          "email",
                          e.target.checked
                        )
                      }
                    />

                    <span className="slider"></span>

                  </label>

                </div>

                {/* INTERVIEW */}
                <div className="settings-option">

                  <div>
                    <strong>
                      Interview Notifications
                    </strong>

                    <span>
                      Get notified about upcoming
                      interviews and schedules.
                    </span>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={
                        notifications.interview
                      }
                      onChange={(e) =>
                        handleNotificationChange(
                          "interview",
                          e.target.checked
                        )
                      }
                    />

                    <span className="slider"></span>

                  </label>

                </div>

                {/* CANDIDATE */}
                <div className="settings-option">

                  <div>
                    <strong>
                      Candidate Updates
                    </strong>

                    <span>
                      Receive updates when candidates
                      move through the pipeline.
                    </span>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={
                        notifications.candidate
                      }
                      onChange={(e) =>
                        handleNotificationChange(
                          "candidate",
                          e.target.checked
                        )
                      }
                    />

                    <span className="slider"></span>

                  </label>

                </div>

              </div>

            </section>

            {/* =========================
                SECURITY
            ========================= */}

            <section className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon">
                  <Lock size={19} />
                </div>

                <div>
                  <h2>Security</h2>

                  <p>
                    Manage your account security
                    preferences.
                  </p>
                </div>

              </div>

              <div className="security-content">

                <div>
                  <strong>Password</strong>

                  <span>
                    Change your account password
                    securely.
                  </span>
                </div>

                <button
                  type="button"
                  className="secondary-settings-btn"
                  onClick={handleOpenPasswordModal}
                >
                  Change Password
                </button>

              </div>

            </section>

            {/* =========================
                APPEARANCE
            ========================= */}


            {/* =========================
                SAVE
            ========================= */}

            <div className="settings-save-area">

              {saved && (
                <span className="settings-success">
                  Settings saved successfully.
                </span>
              )}

              <button
                className="save-settings-btn"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </>
        )}

      </main>

      {/* =====================================================
          CHANGE PASSWORD MODAL
      ===================================================== */}

      {showPasswordModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={handleClosePasswordModal}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow:
                "0 20px 45px rgba(0, 0, 0, 0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                  }}
                >
                  Change Password
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "13px",
                    color: "#667085",
                  }}
                >
                  Enter your current password and choose
                  a new password.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={changingPassword}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#667085",
                }}
              >
                ×
              </button>
            </div>

            {/* PASSWORD FORM */}

            <form onSubmit={handleChangePassword}>

              {/* CURRENT PASSWORD */}

              <div
                className="settings-field"
                style={{
                  marginBottom: "16px",
                }}
              >
                <label>
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>

              {/* NEW PASSWORD */}

              <div
                className="settings-field"
                style={{
                  marginBottom: "16px",
                }}
              >
                <label>
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
              </div>

              {/* CONFIRM PASSWORD */}

              <div
                className="settings-field"
                style={{
                  marginBottom: "16px",
                }}
              >
                <label>
                  Confirm New Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>

              {/* PASSWORD ERROR */}

              {passwordError && (
                <div
                  role="alert"
                  style={{
                    marginBottom: "16px",
                    padding: "10px 12px",
                    borderRadius: "7px",
                    background: "#fff1f1",
                    color: "#d92d20",
                    border:
                      "1px solid #fecdca",
                    fontSize: "13px",
                  }}
                >
                  {passwordError}
                </div>
              )}

              {/* PASSWORD SUCCESS */}

              {passwordSuccess && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "10px 12px",
                    borderRadius: "7px",
                    background: "#ecfdf3",
                    color: "#027a48",
                    border:
                      "1px solid #abefc6",
                    fontSize: "13px",
                  }}
                >
                  {passwordSuccess}
                </div>
              )}

              {/* MODAL ACTIONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "22px",
                }}
              >
                <button
                  type="button"
                  className="secondary-settings-btn"
                  onClick={handleClosePasswordModal}
                  disabled={changingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-settings-btn"
                  disabled={changingPassword}
                >
                  <Lock size={16} />

                  {changingPassword
                    ? "Changing..."
                    : "Change Password"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default RecruiterSettings;