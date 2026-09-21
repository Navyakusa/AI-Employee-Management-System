import React, { useEffect, useState } from "react";
import {
  User,
  Bell,
  Lock,
  Palette,
  Save,
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import {
  getMyEmployeeSettings,
  updateMyEmployeeSettings,
} from "../../services/employeeService";
import "./EmployeeSettings.css";

function EmployeeSettings() {
  const [settings, setSettings] = useState(null); // EmployeeSettingsDto
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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

            {/* No change-password endpoint exists yet in auth-controller
                (only /auth/signup and /auth/login are confirmed). This
                button stays inert until that endpoint exists. */}
            <button className="change-password-btn" disabled title="Not available yet">
              Change Password
            </button>
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
