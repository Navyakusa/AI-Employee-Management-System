import React, { useEffect, useState } from "react";

import {
  Bell,
  Mail,
  CalendarDays,
  MessageSquareText,
  UserCheck,
  Save,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Clock,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import {
  getSettings,
  saveSettings,
} from "./HiringManagerApi";

import "./HiringManagerSettings.css";

function HiringManagerSettings() {
  const defaultSettings = {
    shortlistedCandidateNotifications: true,
    interviewNotifications: true,
    feedbackNotifications: true,
    decisionNotifications: true,
    emailNotifications: true,
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordMessage, setPasswordMessage] = useState("");

  /* =====================================================
     LOAD SETTINGS
     ===================================================== */

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const storedPreferences = JSON.parse(
          localStorage.getItem("hiringManagerSettings") || "null"
        );

        let backendSettings = null;

        try {
          backendSettings = await getSettings();

          console.log("Settings response:", backendSettings);
        } catch (settingsError) {
          console.warn(
            "Could not load backend settings:",
            settingsError
          );
        }

        const backendData =
          backendSettings?.data ||
          backendSettings ||
          {};

        const mergedSettings = {
          shortlistedCandidateNotifications:
            storedPreferences
              ?.shortlistedCandidateNotifications ??
            true,

          interviewNotifications:
            storedPreferences
              ?.interviewNotifications ??
            true,

          feedbackNotifications:
            storedPreferences
              ?.feedbackNotifications ??
            true,

          decisionNotifications:
            storedPreferences
              ?.decisionNotifications ??
            true,

          emailNotifications:
            backendData.emailNotifications ??
            storedPreferences?.emailNotifications ??
            true,
        };

        setSettings(mergedSettings);
      } catch (err) {
        console.error(
          "Failed to load settings:",
          err
        );

        setError(
          err.message ||
            "Failed to load settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  /* =====================================================
     TOGGLE SETTINGS
     ===================================================== */

  const handleToggle = (name) => {
    setSettings((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));

    setSaved(false);
    setError("");
  };

  /* =====================================================
     SAVE SETTINGS
     ===================================================== */

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      localStorage.setItem(
        "hiringManagerSettings",
        JSON.stringify(settings)
      );

      let currentBackendSettings = {};

      try {
        const currentResponse = await getSettings();

        currentBackendSettings =
          currentResponse?.data ||
          currentResponse ||
          {};
      } catch (settingsError) {
        console.warn(
          "No existing backend settings found. Creating settings with defaults."
        );
      }

      const payload = {
        id: currentBackendSettings.id,

        organizationName:
          currentBackendSettings.organizationName ||
          "",

        supportEmail:
          currentBackendSettings.supportEmail ||
          "",

        website:
          currentBackendSettings.website ||
          "",

        allowUserRegistrations:
          currentBackendSettings
            .allowUserRegistrations ??
          true,

        emailNotifications:
          settings.emailNotifications,

        maintenanceMode:
          currentBackendSettings.maintenanceMode ??
          false,
      };

      if (!payload.id) {
        delete payload.id;
      }

      const response = await saveSettings(payload);

      console.log(
        "Saved settings response:",
        response
      );

      setSaved(true);
    } catch (err) {
      console.error(
        "Failed to save settings:",
        err
      );

      setError(
        err.message ||
          "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     PASSWORD CHANGE
     ===================================================== */

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
  };

  const handleUpdatePassword = () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordMessage(
        "Please complete all password fields."
      );

      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setPasswordMessage(
        "New password and confirm password do not match."
      );

      return;
    }

    if (
      passwordData.newPassword.length < 8
    ) {
      setPasswordMessage(
        "New password must contain at least 8 characters."
      );

      return;
    }

    setPasswordMessage(
      "Password validation successful. Backend integration is required to update the password."
    );

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  /* =====================================================
     PASSWORD VISIBILITY
     ===================================================== */

  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  /* =====================================================
     NOTIFICATION OPTIONS
     ===================================================== */

  const notificationOptions = [
    {
      key: "shortlistedCandidateNotifications",
      title: "Shortlisted Candidates",
      description:
        "Receive notifications when candidates are shortlisted for your assigned jobs.",
      icon: <UserCheck size={19} />,
    },

    {
      key: "interviewNotifications",
      title: "Interview Updates",
      description:
        "Receive notifications about interview scheduling and status updates.",
      icon: <CalendarDays size={19} />,
    },

    {
      key: "feedbackNotifications",
      title: "Interview Feedback",
      description:
        "Receive notifications when interviewer feedback becomes available.",
      icon: <MessageSquareText size={19} />,
    },

    {
      key: "decisionNotifications",
      title: "Candidate Decisions",
      description:
        "Receive notifications when candidates are ready for final hiring decisions.",
      icon: <Bell size={19} />,
    },
  ];

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="hiring-manager-layout">

        <HiringManagerSidebar />

        <div className="hiring-manager-main">

          <HiringManagerNavbar />

          <main className="hiring-manager-settings-content">

            <div className="hiring-manager-settings-header">

              <p className="hiring-manager-settings-label">
                PREFERENCES
              </p>

              <h1>Settings</h1>

              <p>
                Loading your settings...
              </p>

            </div>

            <section className="hm-settings-card">

              <div className="hm-settings-loading">

                <Clock size={20} />

                <span>
                  Loading settings...
                </span>

              </div>

            </section>

          </main>

        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN RENDER
     ===================================================== */

  return (
    <div className="hiring-manager-layout">

      <HiringManagerSidebar />

      <div className="hiring-manager-main">

        <HiringManagerNavbar />

        <main className="hiring-manager-settings-content">

          {/* HEADER */}

          <div className="hiring-manager-settings-header">

            <p className="hiring-manager-settings-label">
              PREFERENCES
            </p>

            <h1>Settings</h1>

            <p>
              Manage your Hiring Manager notification
              preferences and account security.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="hm-settings-error">

              <AlertCircle size={18} />

              <span>
                {error}
              </span>

            </div>
          )}

          {/* NOTIFICATIONS */}

          <section className="hm-settings-card">

            <div className="hm-settings-card-header">

              <div className="hm-settings-header-icon">
                <Bell size={20} />
              </div>

              <div>

                <h2>
                  Notification Preferences
                </h2>

                <p>
                  Choose which recruitment activities
                  you want to be notified about.
                </p>

              </div>

            </div>

            <div className="hm-settings-options">

              {notificationOptions.map(
                (option) => (

                  <div
                    className="hm-settings-option"
                    key={option.key}
                  >

                    <div className="hm-settings-option-info">

                      <div className="hm-settings-option-icon">
                        {option.icon}
                      </div>

                      <div>

                        <strong>
                          {option.title}
                        </strong>

                        <span>
                          {option.description}
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      className={`hm-settings-toggle ${
                        settings[option.key]
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleToggle(option.key)
                      }
                      aria-label={`Toggle ${option.title}`}
                    >
                      <span />
                    </button>

                  </div>

                )
              )}

            </div>

          </section>

          {/* EMAIL */}

          <section className="hm-settings-card">

            <div className="hm-settings-card-header">

              <div className="hm-settings-header-icon">
                <Mail size={20} />
              </div>

              <div>

                <h2>
                  Email Notifications
                </h2>

                <p>
                  Control whether recruitment updates
                  are also delivered by email.
                </p>

              </div>

            </div>

            <div className="hm-settings-option">

              <div className="hm-settings-option-info">

                <div className="hm-settings-option-icon">
                  <Mail size={19} />
                </div>

                <div>

                  <strong>
                    Recruitment Email Alerts
                  </strong>

                  <span>
                    Receive important hiring updates
                    through your registered email.
                  </span>

                </div>

              </div>

              <button
                type="button"
                className={`hm-settings-toggle ${
                  settings.emailNotifications
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleToggle(
                    "emailNotifications"
                  )
                }
                aria-label="Toggle recruitment email alerts"
              >
                <span />
              </button>

            </div>

          </section>

          {/* SAVE */}

          <div className="hm-settings-save-row">

            {saved && (
              <span className="hm-settings-saved">

                <ShieldCheck size={16} />

                Preferences saved

              </span>
            )}

            <button
              type="button"
              className="hm-settings-save-button"
              onClick={handleSaveSettings}
              disabled={saving}
            >

              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save Preferences"}

            </button>

          </div>

          {/* SECURITY */}

          <section className="hm-settings-card">

            <div className="hm-settings-card-header">

              <div className="hm-settings-header-icon">
                <LockKeyhole size={20} />
              </div>

              <div>

                <h2>
                  Security
                </h2>

                <p>
                  Update your account password.
                </p>

              </div>

            </div>

            <div className="hm-settings-password-grid">

              {/* CURRENT PASSWORD */}

              <div className="hm-settings-password-field">

                <label>
                  Current Password
                </label>

                <div className="hm-settings-password-input">

                  <input
                    type={
                      showPasswords.current
                        ? "text"
                        : "password"
                    }
                    name="currentPassword"
                    value={
                      passwordData.currentPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      togglePasswordVisibility(
                        "current"
                      )
                    }
                    aria-label="Show or hide current password"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              {/* NEW PASSWORD */}

              <div className="hm-settings-password-field">

                <label>
                  New Password
                </label>

                <div className="hm-settings-password-input">

                  <input
                    type={
                      showPasswords.new
                        ? "text"
                        : "password"
                    }
                    name="newPassword"
                    value={
                      passwordData.newPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      togglePasswordVisibility(
                        "new"
                      )
                    }
                    aria-label="Show or hide new password"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="hm-settings-password-field">

                <label>
                  Confirm New Password
                </label>

                <div className="hm-settings-password-input">

                  <input
                    type={
                      showPasswords.confirm
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      passwordData.confirmPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Confirm new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      togglePasswordVisibility(
                        "confirm"
                      )
                    }
                    aria-label="Show or hide confirm password"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

            </div>

            {passwordMessage && (
              <p className="hm-settings-password-message">
                {passwordMessage}
              </p>
            )}

            <div className="hm-settings-security-actions">

              <button
                type="button"
                className="hm-settings-password-button"
                onClick={handleUpdatePassword}
              >

                <LockKeyhole size={16} />

                Update Password

              </button>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default HiringManagerSettings;