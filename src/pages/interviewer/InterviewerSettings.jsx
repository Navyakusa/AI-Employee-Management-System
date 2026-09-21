import { useState } from "react";

import {
  Bell,
  CalendarDays,
  CalendarClock,
  ClipboardCheck,
  ShieldCheck,
  Building2,
  BriefcaseBusiness,
  Save,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import "./InterviewerDashboard.css";

function InterviewerSettings() {
  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  const savedSettings = JSON.parse(
  localStorage.getItem("interviewerSettings")
);

const [settings, setSettings] = useState(
  savedSettings || {
    interviewAssignments: true,
    scheduleChanges: true,
    evaluationReminders: true,
    evaluationConfirmation: true,
  }
);

  const [saved, setSaved] = useState(false);

  const interviewerName =
    loggedInUser?.userName || "Interviewer Test";

  const interviewerEmail =
    loggedInUser?.email || "interviewer2@gmail.com";

  const department =
    loggedInUser?.department || "IT";

  const handleToggle = (settingName) => {
    setSettings((previous) => ({
      ...previous,
      [settingName]:
        !previous[settingName],
    }));

    setSaved(false);
  };

  const handleSave = () => {
    // Temporary frontend persistence.
    // Backend integration can replace this later.
    localStorage.setItem(
      "interviewerSettings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="interviewer-layout">

      <InterviewerSidebar />

      <div className="interviewer-main">

        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">

          {/* HEADER */}

          <div className="interviewer-dashboard-header">

            <p className="interviewer-label">
              ACCOUNT
            </p>

            <h1>Settings</h1>

            <p>
              Manage your interview notification
              preferences and account settings.
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
                    <h2>
                      Notification Preferences
                    </h2>

                    <p>
                      Choose which interview updates
                      you want to receive.
                    </p>
                  </div>

                </div>

                <div className="interviewer-settings-options">

                  {/* ASSIGNMENTS */}

                  <div className="interviewer-settings-option">

                    <div className="interviewer-settings-option-info">

                      <div className="interviewer-settings-option-icon">
                        <CalendarDays size={18} />
                      </div>

                      <div>
                        <strong>
                          Interview Assignments
                        </strong>

                        <span>
                          Receive a notification when
                          a new interview is assigned
                          to you.
                        </span>
                      </div>

                    </div>

                    <button
                      type="button"
                      aria-label="Toggle interview assignment notifications"
                      className={`interviewer-settings-toggle ${
                        settings.interviewAssignments
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleToggle(
                          "interviewAssignments"
                        )
                      }
                    >
                      <span />
                    </button>

                  </div>

                  {/* SCHEDULE */}

                  <div className="interviewer-settings-option">

                    <div className="interviewer-settings-option-info">

                      <div className="interviewer-settings-option-icon">
                        <CalendarClock size={18} />
                      </div>

                      <div>
                        <strong>
                          Schedule Changes
                        </strong>

                        <span>
                          Receive notifications when
                          an interview is rescheduled
                          or cancelled.
                        </span>
                      </div>

                    </div>

                    <button
                      type="button"
                      aria-label="Toggle schedule change notifications"
                      className={`interviewer-settings-toggle ${
                        settings.scheduleChanges
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleToggle(
                          "scheduleChanges"
                        )
                      }
                    >
                      <span />
                    </button>

                  </div>

                  {/* EVALUATION REMINDER */}

                  <div className="interviewer-settings-option">

                    <div className="interviewer-settings-option-info">

                      <div className="interviewer-settings-option-icon">
                        <ClipboardCheck size={18} />
                      </div>

                      <div>
                        <strong>
                          Evaluation Reminders
                        </strong>

                        <span>
                          Receive reminders when
                          interview feedback is still
                          pending.
                        </span>
                      </div>

                    </div>

                    <button
                      type="button"
                      aria-label="Toggle evaluation reminders"
                      className={`interviewer-settings-toggle ${
                        settings.evaluationReminders
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleToggle(
                          "evaluationReminders"
                        )
                      }
                    >
                      <span />
                    </button>

                  </div>

                  {/* CONFIRMATION */}

                  <div className="interviewer-settings-option">

                    <div className="interviewer-settings-option-info">

                      <div className="interviewer-settings-option-icon">
                        <CheckCircle2 size={18} />
                      </div>

                      <div>
                        <strong>
                          Evaluation Confirmation
                        </strong>

                        <span>
                          Receive confirmation after
                          your interview evaluation
                          has been submitted.
                        </span>
                      </div>

                    </div>

                    <button
                      type="button"
                      aria-label="Toggle evaluation confirmation notifications"
                      className={`interviewer-settings-toggle ${
                        settings.evaluationConfirmation
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleToggle(
                          "evaluationConfirmation"
                        )
                      }
                    >
                      <span />
                    </button>

                  </div>

                </div>

              </section>

              {/* SECURITY */}

              <section className="interviewer-settings-card">

                <div className="interviewer-settings-card-header">

                  <div className="interviewer-settings-header-icon security">
                    <LockKeyhole size={20} />
                  </div>

                  <div>
                    <h2>Security</h2>

                    <p>
                      Security options for your
                      interviewer account.
                    </p>
                  </div>

                </div>

                <div className="interviewer-settings-security">

                  <div>

                    <div className="interviewer-settings-security-icon">
                      <ShieldCheck size={19} />
                    </div>

                    <div>
                      <strong>
                        Account Password
                      </strong>

                      <span>
                        Manage the password used to
                        access your EMS account.
                      </span>
                    </div>

                  </div>

                  <button
                    type="button"
                    disabled
                    title="Available after backend integration"
                  >
                    Change Password
                  </button>

                </div>

                <p className="interviewer-settings-backend-note">
                  Password management will be enabled
                  when the account security API is
                  integrated.
                </p>

              </section>

              {/* SAVE */}

              <div className="interviewer-settings-save-area">

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
                >
                  <Save size={16} />
                  Save Changes
                </button>

              </div>

            </div>

            {/* RIGHT ACCOUNT CARD */}

            <aside className="interviewer-settings-account-card">

              <div className="interviewer-settings-account-icon">
                <ShieldCheck size={24} />
              </div>

              <h3>
                Account Information
              </h3>

              <p>
                Your account information is managed
                through your EMS profile.
              </p>

              <div className="interviewer-settings-account-list">

                <div>

                  <span>Name</span>

                  <strong>
                    {interviewerName}
                  </strong>

                </div>

                <div>

                  <span>Email</span>

                  <strong>
                    {interviewerEmail}
                  </strong>

                </div>

                <div>

                  <span>
                    <Building2 size={14} />
                    Department
                  </span>

                  <strong>
                    {department}
                  </strong>

                </div>

                <div>

                  <span>
                    <BriefcaseBusiness
                      size={14}
                    />
                    Role
                  </span>

                  <strong>
                    INTERVIEWER
                  </strong>

                </div>

              </div>

              <div className="interviewer-settings-role-note">

                <ShieldCheck size={16} />

                <p>
                  Your account role is controlled by
                  the EMS administrator and cannot be
                  changed here.
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