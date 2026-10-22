import React, { useEffect, useState } from "react";
import {
  User,
  Bell,
  Lock,
  Palette,
  Save,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import {
  getMyEmployeeSettings,
  updateMyEmployeeSettings,
  changeEmployeePassword,
} from "../../services/employeeService";
import "./EmployeeSettings.css";

function EmployeeSettings() {
  const [settings, setSettings] = useState(null); // EmployeeSettingsDto
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState("error");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getMyEmployeeSettings();
        const data = response.data?.data || {};

        setSettings(data);
        setEmailNotifications(Boolean(data.emailNotifications));
        setSystemNotifications(Boolean(data.systemNotifications));
        setDarkMode(Boolean(data.darkMode));
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage("Please complete all password fields.");
      setPasswordMessageType("error");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage("New password must contain at least 8 characters.");
      setPasswordMessageType("error");
      return;
    }
    if (!/[A-Z]/.test(passwordForm.newPassword) || !/[a-z]/.test(passwordForm.newPassword) || !/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordMessage("Use at least one uppercase letter, one lowercase letter, and one number.");
      setPasswordMessageType("error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      setPasswordMessageType("error");
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordMessage("Your new password must be different from your current password.");
      setPasswordMessageType("error");
      return;
    }

    setPasswordSaving(true);
    try {
      await changeEmployeePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordMessage("Password updated successfully.");
      setPasswordMessageType("success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Failed to change password", err);
      const status = err.response?.status;
      const message = err.response?.data?.message;
      setPasswordMessage(message || (status === 404
        ? "Password change is not enabled on the backend yet. Please ask the backend team to add POST /api/auth/change-password."
        : status === 400 || status === 401
          ? "Current password may be incorrect or the new password was rejected. Please check and try again."
          : "Could not update password. Please try again."));
      setPasswordMessageType("error");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);

    try {
      // EmployeeSettingsUpdateDto requires employeeName/email/designation
      // alongside the toggles, so pass through the values we already have
      // to avoid the backend blanking them out.
      await updateMyEmployeeSettings({
        employeeName: settings.employeeName,
        email: settings.email,
        designation: settings.designation,
        emailNotifications,
        systemNotifications,
        darkMode,
      });

      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="employee-settings-layout">
        <EmployeeSidebar />
        <div className="employee-settings-main">
          <EmployeeTopbar />
          <main className="employee-settings-page">
            <p>Loading settings...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-settings-layout">
      <EmployeeSidebar />

      <div className="employee-settings-main">
        <EmployeeTopbar />

        <main className="employee-settings-page">

          {/* Header */}
          <div className="employee-settings-header">
            <div>
              <h1>Settings</h1>
              <p>Manage your account and application preferences.</p>
            </div>
          </div>

          {/* Account Settings */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-section-icon">
                <User size={20} />
              </div>
              <div>
                <h2>Account Settings</h2>
                <p>Manage your employee account information.</p>
              </div>
            </div>

            <div className="settings-form">
              <div className="settings-field">
                <label>Employee Name</label>
                <input type="text" value={settings.employeeName || ""} readOnly />
              </div>

              <div className="settings-field">
                <label>Email Address</label>
                <input type="email" value={settings.email || ""} readOnly />
              </div>

              <div className="settings-field">
                <label>Designation</label>
                <input type="text" value={settings.designation || ""} readOnly />
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-section-icon">
                <Bell size={20} />
              </div>
              <div>
                <h2>Notification Preferences</h2>
                <p>Choose which notifications you want to receive.</p>
              </div>
            </div>

            <div className="settings-options">
              <div className="settings-option">
                <div>
                  <strong>Email Notifications</strong>
                  <span>Receive important updates through email.</span>
                </div>
                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>

              <div className="settings-option">
                <div>
                  <strong>System Notifications</strong>
                  <span>Receive notifications inside the employee portal.</span>
                </div>
                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={systemNotifications}
                    onChange={(e) => setSystemNotifications(e.target.checked)}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-section-icon">
                <Palette size={20} />
              </div>
              <div>
                <h2>Appearance</h2>
                <p>Customize the appearance of your portal.</p>
              </div>
            </div>

            <div className="settings-options">
              <div className="settings-option">
                <div>
                  <strong>Dark Mode</strong>
                  <span>Use a dark appearance for the employee portal.</span>
                </div>
                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-section-icon">
                <Lock size={20} />
              </div>
              <div>
                <h2>Security</h2>
                <p>Manage your account security.</p>
              </div>
            </div>

            <button
              type="button"
              className="change-password-btn"
              onClick={() => {
                setShowPasswordForm((open) => !open);
                setPasswordMessage("");
              }}
              aria-expanded={showPasswordForm}
            >
              {showPasswordForm ? <X size={16} /> : <Lock size={16} />}
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>

            {showPasswordForm && (
              <form className="employee-password-form" onSubmit={handlePasswordSubmit}>
                <div className="employee-password-fields">
                  {[
                    { key: "currentPassword", label: "Current Password", visibility: "current", placeholder: "Enter current password" },
                    { key: "newPassword", label: "New Password", visibility: "next", placeholder: "At least 8 characters" },
                    { key: "confirmPassword", label: "Confirm New Password", visibility: "confirm", placeholder: "Re-enter new password" },
                  ].map((field) => (
                    <div className="settings-field" key={field.key}>
                      <label htmlFor={field.key}>{field.label}</label>
                      <div className="employee-password-input-wrap">
                        <input
                          id={field.key}
                          type={showPasswords[field.visibility] ? "text" : "password"}
                          autoComplete={field.key === "currentPassword" ? "current-password" : "new-password"}
                          value={passwordForm[field.key]}
                          onChange={(event) => setPasswordForm((previous) => ({ ...previous, [field.key]: event.target.value }))}
                          placeholder={field.placeholder}
                          required
                        />
                        <button type="button" className="employee-password-visibility" aria-label={showPasswords[field.visibility] ? "Hide password" : "Show password"} onClick={() => setShowPasswords((previous) => ({ ...previous, [field.visibility]: !previous[field.visibility] }))}>
                          {showPasswords[field.visibility] ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="employee-password-hint">Use at least 8 characters, including uppercase and lowercase letters and a number.</p>
                {passwordMessage && <p className={`employee-password-message ${passwordMessageType}`} role="status">{passwordMessage}</p>}
                <button type="submit" className="settings-save-btn employee-password-submit" disabled={passwordSaving}>
                  <Save size={16} /> {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </section>

          {/* Save */}
          <div className="settings-save-area">
            <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
              <Save size={17} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}

export default EmployeeSettings;
