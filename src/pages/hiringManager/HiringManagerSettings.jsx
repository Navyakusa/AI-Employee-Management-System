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

import apiClient from "../../services/apiClient";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerSettings.css";
import "./HiringManagerLayout.css";

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

  const getErrorMessage = (err, fallback) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback;

  /*
   * LOAD SETTINGS
   * GET /api/settings/current
   */
  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        let storedPreferences = null;

        try {
          storedPreferences = JSON.parse(
            localStorage.getItem("hiringManagerSettings") || "null"
          );
        } catch {
          storedPreferences = null;
        }

        let backendData = {};

        try {
          const response = await apiClient.get("/settings/current");

          console.log("Settings response:", response.data);

          const responseData = response?.data;

          backendData =
            responseData?.data &&
            typeof responseData.data === "object"
              ? responseData.data
              : responseData || {};
        } catch (settingsError) {
          console.warn(
            "Could not load backend settings:",
            settingsError
          );
        }

        const mergedSettings = {
          shortlistedCandidateNotifications:
            storedPreferences?.shortlistedCandidateNotifications ?? true,

          interviewNotifications:
            storedPreferences?.interviewNotifications ?? true,

          feedbackNotifications:
            storedPreferences?.feedbackNotifications ?? true,

          decisionNotifications:
            storedPreferences?.decisionNotifications ?? true,

          emailNotifications:
            backendData?.emailNotifications ??
            storedPreferences?.emailNotifications ??
            true,
        };

        if (isMounted) {
          setSettings(mergedSettings);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);

        if (isMounted) {
          setError(
            getErrorMessage(err, "Failed to load settings.")
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * TOGGLE SETTINGS
   */
  const handleToggle = (name) => {
    setSettings((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));

    setSaved(false);
    setError("");
  };

  /*
   * SAVE SETTINGS
   * PUT /api/settings/save
   */
  const handleSaveSettings = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      let currentBackendSettings = {};

      try {
        const currentResponse = await apiClient.get("/settings/current");

        const responseData = currentResponse?.data;

        currentBackendSettings =
          responseData?.data &&
          typeof responseData.data === "object"
            ? responseData.data
            : responseData || {};
      } catch (settingsError) {
        console.warn(
          "Could not retrieve existing backend settings:",
          settingsError
        );
      }

      const payload = {
        organizationName:
          currentBackendSettings.organizationName || "",

        supportEmail:
          currentBackendSettings.supportEmail || "",

        website:
          currentBackendSettings.website || "",

        allowUserRegistrations:
          currentBackendSettings.allowUserRegistrations ?? true,

        emailNotifications:
          settings.emailNotifications,

        maintenanceMode:
          currentBackendSettings.maintenanceMode ?? false,
      };

      if (currentBackendSettings.id) {
        payload.id = currentBackendSettings.id;
      }

      const response = await apiClient.put(
        "/settings/save",
        payload
      );

      console.log("Saved settings response:", response.data);

      localStorage.setItem(
        "hiringManagerSettings",
        JSON.stringify(settings)
      );

      setSaved(true);
    } catch (err) {
      console.error("Failed to save settings:", err);

      setError(
        getErrorMessage(err, "Failed to save settings.")
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * PASSWORD FORM
   * Validation only: no backend password endpoint was provided.
   */
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
      setPasswordMessage("Please complete all password fields.");
      return;
    }

    if (
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setPasswordMessage(
        "New password and confirm password do not match."
      );
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    setPasswordMessage(
      "Password validation successful. A backend password-update endpoint is required to change your password."
    );
  };

  /*
   * PASSWORD VISIBILITY
   */
  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  /*
   * NOTIFICATION OPTIONS
   */
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

  /*
   * LOADING
   */
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

              <p>Loading your settings...</p>
            </div>

            <section className="hm-settings-card">
              <div className="hm-settings-loading">
                <Clock size={20} />
                <span>Loading settings...</span>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  /*
   * MAIN PAGE
   */
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
              Manage your Hiring Manager notification preferences
              and account security.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="hm-settings-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* NOTIFICATION PREFERENCES */}
          <section className="hm-settings-card">
            <div className="hm-settings-card-header">
              <div className="hm-settings-header-icon">
                <Bell size={20} />
              </div>

              <div>
                <h2>Notification Preferences</h2>

                <p>
                  Choose which recruitment activities you want
                  to be notified about.
                </p>
              </div>
            </div>

            <div className="hm-settings-options">
              {notificationOptions.map((option) => (
                <div
                  className="hm-settings-option"
                  key={option.key}
                >
                  <div className="hm-settings-option-info">
                    <div className="hm-settings-option-icon">
                      {option.icon}
                    </div>

                    <div>
                      <strong>{option.title}</strong>
                      <span>{option.description}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`hm-settings-toggle ${
                      settings[option.key] ? "active" : ""
                    }`}
                    onClick={() => handleToggle(option.key)}
                    aria-label={`Toggle ${option.title}`}
                    aria-pressed={Boolean(settings[option.key])}
                  >
                    <span />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* EMAIL NOTIFICATIONS */}
          <section className="hm-settings-card">
            <div className="hm-settings-card-header">
              <div className="hm-settings-header-icon">
                <Mail size={20} />
              </div>

              <div>
                <h2>Email Notifications</h2>

                <p>
                  Control whether recruitment updates are also
                  delivered by email.
                </p>
              </div>
            </div>

            <div className="hm-settings-option">
              <div className="hm-settings-option-info">
                <div className="hm-settings-option-icon">
                  <Mail size={19} />
                </div>

                <div>
                  <strong>Recruitment Email Alerts</strong>

                  <span>
                    Receive important hiring updates through your
                    registered email.
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={`hm-settings-toggle ${
                  settings.emailNotifications ? "active" : ""
                }`}
                onClick={() => handleToggle("emailNotifications")}
                aria-label="Toggle recruitment email alerts"
                aria-pressed={Boolean(settings.emailNotifications)}
              >
                <span />
              </button>
            </div>
          </section>

          {/* SAVE PREFERENCES */}
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
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>

          {/* SECURITY */}
          <section className="hm-settings-card">
            <div className="hm-settings-card-header">
              <div className="hm-settings-header-icon">
                <LockKeyhole size={20} />
              </div>

              <div>
                <h2>Security</h2>

                <p>Update your account password.</p>
              </div>
            </div>

            <div className="hm-settings-password-grid">
              {/* CURRENT PASSWORD */}
              <div className="hm-settings-password-field">
                <label htmlFor="currentPassword">
                  Current Password
                </label>

                <div className="hm-settings-password-input">
                  <input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      togglePasswordVisibility("current")
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
                <label htmlFor="newPassword">New Password</label>

                <div className="hm-settings-password-input">
                  <input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
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
                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <div className="hm-settings-password-input">
                  <input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      togglePasswordVisibility("confirm")
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
              <p
                className="hm-settings-password-message"
                role="status"
              >
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
