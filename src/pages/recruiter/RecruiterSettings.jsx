import React, { useState } from "react";
import {
  UserRound,
  Bell,
  Lock,
  Palette,
  Save,
} from "lucide-react";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";

import "./RecruiterSettings.css";

function RecruiterSettings() {
  const [profile, setProfile] = useState({
    name: "Recruiter",
    email: "recruiter@gmail.com",
    designation: "Recruiter",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    interview: true,
    candidate: true,
  });

  const [saved, setSaved] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(
      "recruiterProfile",
      JSON.stringify(profile)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
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
              Manage your account and application preferences.
            </p>
          </div>

        </div>


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
                Manage your recruiter account information.
              </p>
            </div>

          </div>


          <div className="settings-form">

            <div className="settings-field">

              <label>Recruiter Name</label>

              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
              />

            </div>


            <div className="settings-field">

              <label>Email Address</label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
              />

            </div>


            <div className="settings-field">

              <label>Designation</label>

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
              <h2>Notification Preferences</h2>

              <p>
                Choose which notifications you want to receive.
              </p>
            </div>

          </div>


          <div className="settings-options">

            {/* EMAIL */}
            <div className="settings-option">

              <div>
                <strong>Email Notifications</strong>

                <span>
                  Receive important recruitment updates through email.
                </span>
              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      email: e.target.checked,
                    })
                  }
                />

                <span className="slider"></span>

              </label>

            </div>


            {/* INTERVIEW */}
            <div className="settings-option">

              <div>
                <strong>Interview Notifications</strong>

                <span>
                  Get notified about upcoming interviews and schedules.
                </span>
              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={notifications.interview}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      interview: e.target.checked,
                    })
                  }
                />

                <span className="slider"></span>

              </label>

            </div>


            {/* CANDIDATE */}
            <div className="settings-option">

              <div>
                <strong>Candidate Updates</strong>

                <span>
                  Receive updates when candidates move through the pipeline.
                </span>
              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={notifications.candidate}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      candidate: e.target.checked,
                    })
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
                Manage your account security preferences.
              </p>
            </div>

          </div>


          <div className="security-content">

            <div>
              <strong>Password</strong>

              <span>
                Change your account password securely.
              </span>
            </div>

            <button className="secondary-settings-btn">
              Change Password
            </button>

          </div>

        </section>


        {/* =========================
            APPEARANCE
        ========================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <Palette size={19} />
            </div>

            <div>
              <h2>Appearance</h2>

              <p>
                Customize the appearance of your recruiter workspace.
              </p>
            </div>

          </div>


          <div className="appearance-content">

            <div>
              <strong>Theme</strong>

              <span>
                Select your preferred workspace theme.
              </span>
            </div>

            <select defaultValue="Light">
              <option>Light</option>
              <option>System Default</option>
              <option>Dark</option>
            </select>

          </div>

        </section>


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
          >
            <Save size={16} />
            Save Changes
          </button>

        </div>

      </main>

    </div>
  );
}

export default RecruiterSettings;