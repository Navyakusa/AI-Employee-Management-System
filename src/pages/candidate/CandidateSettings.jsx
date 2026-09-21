import { useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import "./CandidateDashboard.css";

function CandidateSettings() {
  const storedUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "{}"
  );

  const [saved, setSaved] = useState(false);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    interviewReminders: true,
    offerUpdates: true,
    jobRecommendations: true,
    profileVisibility: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const handlePreferenceChange = (name) => {
    setPreferences((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));

    setSaved(false);
  };

  const handleSavePreferences = () => {
    // Backend integration later.
    localStorage.setItem(
      "candidatePreferences",
      JSON.stringify(preferences)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordMessage(
        "Please complete all password fields."
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordMessage(
        "New password and confirm password do not match."
      );
      return;
    }

    // Backend integration later:
    // PUT /api/candidate/change-password

    console.log("Password change requested");

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordMessage(
      "Password updated successfully."
    );
  };

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          {/* HEADER */}

          <div className="candidate-settings-header">
            <div>
              <p className="candidate-label">
                ACCOUNT SETTINGS
              </p>

              <h1>Settings</h1>

              <p>
                Manage your account preferences,
                notifications and security settings.
              </p>
            </div>
          </div>

          <div className="candidate-settings-layout">
            <div className="candidate-settings-main">
              {/* ACCOUNT */}

              <section className="candidate-settings-card">
                <div className="candidate-settings-card-heading">
                  <div>
                    <UserRound size={19} />
                  </div>

                  <div>
                    <h2>Account Information</h2>

                    <p>
                      Basic information associated with
                      your account.
                    </p>
                  </div>
                </div>

                <div className="candidate-settings-account">
                  <div>
                    <span>Name</span>

                    <strong>
                      {storedUser.userName ||
                        storedUser.name ||
                        "Candidate User"}
                    </strong>
                  </div>

                  <div>
                    <span>Email Address</span>

                    <strong>
                      {storedUser.email ||
                        "candidate@gmail.com"}
                    </strong>
                  </div>

                  <div>
                    <span>Account Role</span>

                    <strong>Candidate</strong>
                  </div>

                  <div>
                    <span>Account Status</span>

                    <strong className="candidate-settings-active">
                      <CheckCircle2 size={13} />
                      Active
                    </strong>
                  </div>
                </div>
              </section>

              {/* NOTIFICATION SETTINGS */}

              <section className="candidate-settings-card">
                <div className="candidate-settings-card-heading">
                  <div>
                    <Bell size={19} />
                  </div>

                  <div>
                    <h2>
                      Notification Preferences
                    </h2>

                    <p>
                      Choose which recruitment updates
                      you want to receive.
                    </p>
                  </div>
                </div>

                <div className="candidate-settings-options">
                  <SettingToggle
                    icon={<Mail size={17} />}
                    title="Email Notifications"
                    description="Receive important recruitment notifications by email."
                    enabled={
                      preferences.emailNotifications
                    }
                    onChange={() =>
                      handlePreferenceChange(
                        "emailNotifications"
                      )
                    }
                  />

                  <SettingToggle
                    icon={
                      <BriefcaseBusiness size={17} />
                    }
                    title="Application Updates"
                    description="Get notified when the status of your job application changes."
                    enabled={
                      preferences.applicationUpdates
                    }
                    onChange={() =>
                      handlePreferenceChange(
                        "applicationUpdates"
                      )
                    }
                  />

                  <SettingToggle
                    icon={<Bell size={17} />}
                    title="Interview Reminders"
                    description="Receive reminders about upcoming interviews."
                    enabled={
                      preferences.interviewReminders
                    }
                    onChange={() =>
                      handlePreferenceChange(
                        "interviewReminders"
                      )
                    }
                  />

                  <SettingToggle
                    icon={
                      <CheckCircle2 size={17} />
                    }
                    title="Offer Updates"
                    description="Receive notifications when you receive or update a job offer."
                    enabled={
                      preferences.offerUpdates
                    }
                    onChange={() =>
                      handlePreferenceChange(
                        "offerUpdates"
                      )
                    }
                  />

                  <SettingToggle
                    icon={
                      <BriefcaseBusiness size={17} />
                    }
                    title="Job Recommendations"
                    description="Receive job recommendations based on your candidate profile."
                    enabled={
                      preferences.jobRecommendations
                    }
                    onChange={() =>
                      handlePreferenceChange(
                        "jobRecommendations"
                      )
                    }
                  />
                </div>

                <div className="candidate-settings-save-area">
                  {saved && (
                    <span>
                      <CheckCircle2 size={14} />
                      Preferences saved
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleSavePreferences}
                  >
                    <Save size={15} />
                    Save Preferences
                  </button>
                </div>
              </section>

              {/* PRIVACY */}

              <section className="candidate-settings-card">
                <div className="candidate-settings-card-heading">
                  <div>
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <h2>Privacy</h2>

                    <p>
                      Control the visibility of your
                      candidate profile.
                    </p>
                  </div>
                </div>

                <div className="candidate-settings-options">
                  <SettingToggle
                    icon={
                      <UserRound size={17} />
                    }
                    title="Profile Visibility"
                    description="Allow authorized recruitment teams to view your candidate profile for relevant job opportunities."
                    enabled={
                      preferences.profileVisibility
                    }
                    onChange={() =>
                      handlePreferenceChange(
                        "profileVisibility"
                      )
                    }
                  />
                </div>
              </section>

              {/* SECURITY */}

              <section className="candidate-settings-card">
                <div className="candidate-settings-card-heading">
                  <div>
                    <Lock size={19} />
                  </div>

                  <div>
                    <h2>Password & Security</h2>

                    <p>
                      Update the password used to access
                      your account.
                    </p>
                  </div>
                </div>

                <form
                  className="candidate-settings-password-form"
                  onSubmit={handlePasswordSubmit}
                >
                  <PasswordField
                    label="Current Password"
                    name="currentPassword"
                    value={
                      passwordForm.currentPassword
                    }
                    visible={showPassword.current}
                    onChange={handlePasswordChange}
                    onToggle={() =>
                      setShowPassword((previous) => ({
                        ...previous,
                        current: !previous.current,
                      }))
                    }
                  />

                  <PasswordField
                    label="New Password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    visible={showPassword.new}
                    onChange={handlePasswordChange}
                    onToggle={() =>
                      setShowPassword((previous) => ({
                        ...previous,
                        new: !previous.new,
                      }))
                    }
                  />

                  <PasswordField
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={
                      passwordForm.confirmPassword
                    }
                    visible={showPassword.confirm}
                    onChange={handlePasswordChange}
                    onToggle={() =>
                      setShowPassword((previous) => ({
                        ...previous,
                        confirm: !previous.confirm,
                      }))
                    }
                  />

                  {passwordMessage && (
                    <p
                      className={`candidate-settings-password-message ${
                        passwordMessage.includes(
                          "successfully"
                        )
                          ? "success"
                          : "error"
                      }`}
                    >
                      {passwordMessage}
                    </p>
                  )}

                  <div className="candidate-settings-password-action">
                    <button type="submit">
                      <Lock size={14} />
                      Update Password
                    </button>
                  </div>
                </form>
              </section>
            </div>

            {/* RIGHT SIDE */}

            <aside className="candidate-settings-side">
              <section className="candidate-settings-side-card">
                <div className="candidate-settings-security-icon">
                  <ShieldCheck size={23} />
                </div>

                <h3>Account Security</h3>

                <p>
                  Keep your account secure by using a
                  strong password and never sharing your
                  login credentials.
                </p>
              </section>

              <section className="candidate-settings-side-card">
                <h3>Candidate Account</h3>

                <div className="candidate-settings-account-row">
                  <span>Role</span>
                  <strong>Candidate</strong>
                </div>

                <div className="candidate-settings-account-row">
                  <span>Status</span>

                  <strong className="active">
                    Active
                  </strong>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingToggle({
  icon,
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="candidate-setting-option">
      <div className="candidate-setting-option-icon">
        {icon}
      </div>

      <div className="candidate-setting-option-content">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className={`candidate-settings-toggle ${
          enabled ? "active" : ""
        }`}
        onClick={onChange}
        aria-label={`Toggle ${title}`}
      >
        <span />
      </button>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  visible,
  onChange,
  onToggle,
}) {
  return (
    <div className="candidate-settings-password-field">
      <label>{label}</label>

      <div>
        <Lock size={15} />

        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

export default CandidateSettings;