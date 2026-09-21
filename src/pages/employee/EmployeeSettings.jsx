import React, { useState } from "react";
import {
  User,
  Bell,
  Lock,
  Palette,
  Save,
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import "./EmployeeSettings.css";

function EmployeeSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

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
                <input
                  type="text"
                  value="Maheshwari"
                  readOnly
                />
              </div>

              <div className="settings-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value="maheshwari@example.com"
                  readOnly
                />
              </div>

              <div className="settings-field">
                <label>Designation</label>
                <input
                  type="text"
                  value="Software Engineer"
                  readOnly
                />
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
                  <span>
                    Receive important updates through email.
                  </span>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) =>
                      setEmailNotifications(e.target.checked)
                    }
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>

              <div className="settings-option">
                <div>
                  <strong>System Notifications</strong>
                  <span>
                    Receive notifications inside the employee portal.
                  </span>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={systemNotifications}
                    onChange={(e) =>
                      setSystemNotifications(e.target.checked)
                    }
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
                  <span>
                    Use a dark appearance for the employee portal.
                  </span>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) =>
                      setDarkMode(e.target.checked)
                    }
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

            <button className="change-password-btn">
              Change Password
            </button>

          </section>

          {/* Save */}
          <div className="settings-save-area">
            <button
              className="settings-save-btn"
              onClick={handleSave}
            >
              <Save size={17} />
              Save Changes
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}

export default EmployeeSettings;