import { useEffect, useState } from "react";

import {
  Bell,
  ClipboardCheck,
  Moon,
  ShieldCheck,
  Building2,
  BriefcaseBusiness,
  Save,
  CheckCircle2,
  LockKeyhole,
  X,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import {
  getCurrentSettings,
  saveSettings,
  changePassword,
} from "../../services/interviewerService";

import "./InterviewerDashboard.css";

// CONFIRMED via backend source: these are the only 3 fields that
// actually exist and persist (EmployeeSettings entity, via
// GET/PUT /api/employee-settings/my). The original 4-toggle mock
// ("Interview Assignments", "Schedule Changes", "Evaluation
// Reminders", "Evaluation Confirmation") had no matching backend
// fields at all — ask backend if those need dedicated fields added,
// or if these 2 general toggles should just represent them for now.
const DEFAULT_SETTINGS = {
  emailNotifications: true,
  systemNotifications: true,
  darkMode: false,
};

// Same pattern used in InterviewerProfile.jsx — distinguishes a real
// server error response from a request that never got a response at
// all (network/CORS/endpoint-doesn't-exist-yet), so the message tells
// you which one happened instead of a generic failure.
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

function InterviewerSettings() {
  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const interviewerName =
    loggedInUser?.userName || "Interviewer Test";

  const interviewerEmail =
    loggedInUser?.email || "interviewer2@gmail.com";

  const department = loggedInUser?.department || "IT";

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
    setPasswordError(null);
  };

  const handleChangePassword = (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword) {
      setPasswordError("Enter your current password.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    setPasswordSaving(true);
    setPasswordError(null);

    changePassword(passwordForm)
      .then(() => {
        setPasswordSuccess(true);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setPasswordSuccess(false);
          setShowPasswordForm(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to change password:", err);
        setPasswordError(
          `Couldn't change your password (${describeAxiosError(err)}).`
        );
      })
      .finally(() => setPasswordSaving(false));
  };

  useEffect(() => {
    getCurrentSettings()
      .then((data) => {
        setSettings((previous) => ({ ...previous, ...data }));
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setError(
          "Couldn't load saved settings — showing defaults."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (settingName) => {
    setSettings((previous) => ({
      ...previous,
      [settingName]: !previous[settingName],
    }));

    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setError(null);

    saveSettings(settings)
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      })
      .catch((err) => {
        console.error("Failed to save settings:", err);
        setError("Couldn't save settings. Please try again.");
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

            <h1>Settings</h1>

            <p>
              Manage your interview notification preferences and
              account settings.
            </p>
          </div>

          <div className="interviewer-settings-layout">
            {/* MAIN SETTINGS */}

            <div className="interviewer-settings-main">
              {/* NOTIFICATIONS */}

              <section className="interviewer-settings-card">
                <div className="interviewer-settings-card-header">
                  <div className="interviewer-settings-header-icon">
                    <Bell size={20} />
                  </div>

                  <div>
                    <h2>Notification Preferences</h2>

                    <p>
                      Choose which interview updates you want to
                      receive.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <p>Loading settings...</p>
                ) : (
                  <div className="interviewer-settings-options">
                    {/* EMAIL NOTIFICATIONS */}

                    <div className="interviewer-settings-option">
                      <div className="interviewer-settings-option-info">
                        <div className="interviewer-settings-option-icon">
                          <Bell size={18} />
                        </div>

                        <div>
                          <strong>Email Notifications</strong>

                          <span>
                            Receive interview and evaluation updates
                            by email.
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Toggle email notifications"
                        className={`interviewer-settings-toggle ${
                          settings.emailNotifications ? "active" : ""
                        }`}
                        onClick={() => handleToggle("emailNotifications")}
                      >
                        <span />
                      </button>
                    </div>

                    {/* SYSTEM NOTIFICATIONS */}

                    <div className="interviewer-settings-option">
                      <div className="interviewer-settings-option-info">
                        <div className="interviewer-settings-option-icon">
                          <ClipboardCheck size={18} />
                        </div>

                        <div>
                          <strong>System Notifications</strong>

                          <span>
                            Receive in-app notifications for
                            interview assignments, schedule changes,
                            and evaluations.
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Toggle system notifications"
                        className={`interviewer-settings-toggle ${
                          settings.systemNotifications ? "active" : ""
                        }`}
                        onClick={() =>
                          handleToggle("systemNotifications")
                        }
                      >
                        <span />
                      </button>
                    </div>

                    {/* DARK MODE */}

                    <div className="interviewer-settings-option">
                      <div className="interviewer-settings-option-info">
                        <div className="interviewer-settings-option-icon">
                          <Moon size={18} />
                        </div>

                        <div>
                          <strong>Dark Mode</strong>

                          <span>
                            Switch the interface to a darker color
                            theme.
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Toggle dark mode"
                        className={`interviewer-settings-toggle ${
                          settings.darkMode ? "active" : ""
                        }`}
                        onClick={() => handleToggle("darkMode")}
                      >
                        <span />
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* SECURITY */}

              <section className="interviewer-settings-card">
                <div className="interviewer-settings-card-header">
                  <div className="interviewer-settings-header-icon security">
                    <LockKeyhole size={20} />
                  </div>

                  <div>
                    <h2>Security</h2>

                    <p>Security options for your interviewer account.</p>
                  </div>
                </div>

                <div className="interviewer-settings-security">
                  <div>
                    <div className="interviewer-settings-security-icon">
                      <ShieldCheck size={19} />
                    </div>

                    <div>
                      <strong>Account Password</strong>

                      <span>
                        Manage the password used to access your EMS
                        account.
                      </span>
                    </div>
                  </div>

                  {!showPasswordForm && (
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {/*
                  NOT YET CONFIRMED LIVE: this calls
                  PUT /api/auth/change-password, which backend
                  described adding but wasn't present in the source
                  we reviewed. If it 404s, that just means it hasn't
                  been deployed yet — not a bug here.
                */}
                {showPasswordForm && (
                  <form
                    className="interviewer-evaluation-form-section"
                    onSubmit={handleChangePassword}
                    style={{ marginTop: "16px" }}
                  >
                    <div className="interviewer-profile-field">
                      <label>Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordFieldChange}
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="interviewer-profile-field">
                      <label>New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordFieldChange}
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="interviewer-profile-field">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordFieldChange}
                        autoComplete="new-password"
                      />
                    </div>

                    {passwordError && (
                      <p className="interviewer-evaluation-error">
                        {passwordError}
                      </p>
                    )}

                    {passwordSuccess && (
                      <p className="interviewer-settings-saved-message">
                        <CheckCircle2 size={16} />
                        Password changed successfully.
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "12px",
                      }}
                    >
                      <button
                        type="button"
                        className="cancel"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordError(null);
                          setPasswordForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        disabled={passwordSaving}
                      >
                        <X size={16} />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="save"
                        disabled={passwordSaving}
                      >
                        <Save size={16} />
                        {passwordSaving ? "Saving..." : "Save Password"}
                      </button>
                    </div>
                  </form>
                )}
              </section>

              {/* SAVE */}

              <div className="interviewer-settings-save-area">
                {error && (
                  <div className="interviewer-settings-saved-message">
                    {error}
                  </div>
                )}

                {saved && (
                  <div className="interviewer-settings-saved-message">
                    <CheckCircle2 size={16} />
                    Settings saved successfully.
                  </div>
                )}

                <button
                  type="button"
                  className="interviewer-settings-save-button"
                  onClick={handleSave}
                  disabled={saving || loading}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* RIGHT ACCOUNT CARD */}

            <aside className="interviewer-settings-account-card">
              <div className="interviewer-settings-account-icon">
                <ShieldCheck size={24} />
              </div>

              <h3>Account Information</h3>

              <p>
                Your account information is managed through your EMS
                profile.
              </p>

              <div className="interviewer-settings-account-list">
                <div>
                  <span>Name</span>
                  <strong>{interviewerName}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{interviewerEmail}</strong>
                </div>

                <div>
                  <span>
                    <Building2 size={14} />
                    Department
                  </span>
                  <strong>{department}</strong>
                </div>

                <div>
                  <span>
                    <BriefcaseBusiness size={14} />
                    Role
                  </span>
                  <strong>INTERVIEWER</strong>
                </div>
              </div>

              <div className="interviewer-settings-role-note">
                <ShieldCheck size={16} />
                <p>
                  Your account role is controlled by the EMS
                  administrator and cannot be changed here.
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default InterviewerSettings;
