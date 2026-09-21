import { useEffect, useState } from "react";
import {
  Settings,
  Building2,
  Mail,
  Globe,
  Save,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import "./AdminSettings.css";

function AdminSettings() {
  const [settings, setSettings] = useState({
    organizationName: "",
    supportEmail: "",
    website: "",
    allowRegistrations: false,
    emailNotifications: false,
    maintenanceMode: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // GET CURRENT SETTINGS
  // ==============================

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:8080/api/settings/current",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch settings: ${response.status}`
          );
        }

        const result = await response.json();

        console.log("Settings response:", result);

        if (result.success && result.data) {
          setSettings({
            organizationName:
              result.data.organizationName || "",
            supportEmail:
              result.data.supportEmail || "",
            website:
              result.data.website || "",
            allowRegistrations:
              result.data.allowRegistrations ?? false,
            emailNotifications:
              result.data.emailNotifications ?? false,
            maintenanceMode:
              result.data.maintenanceMode ?? false,
          });
        }
      } catch (error) {
        console.error(error);
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ==============================
  // INPUT CHANGE
  // ==============================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==============================
  // SAVE SETTINGS
  // ==============================

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/settings/save",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        }
      );

      const result = await response.json();

      console.log("Save response:", result);

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to save settings: ${response.status}`
        );
      }

      if (result.success) {
        setMessage(
          result.message ||
            "Settings saved successfully."
        );

        setTimeout(() => {
          setMessage("");
        }, 2500);
      }
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-settings-layout">
      <AdminSidebar />

      <div className="admin-settings-main">
        <AdminNavbar />

        <main className="admin-settings-content">

          <div className="admin-settings-header">
            <p>SYSTEM CONFIGURATION</p>

            <h1>Settings</h1>

            <span>
              Manage organization and platform settings.
            </span>
          </div>

          {message && (
            <div className="admin-settings-success">
              {message}
            </div>
          )}

          {error && (
            <div
              className="admin-settings-success"
              style={{
                background: "#fef2f2",
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="admin-settings-card">
              <div
                style={{
                  padding: "25px",
                  textAlign: "center",
                }}
              >
                Loading settings...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave}>

              <section className="admin-settings-card">

                <div className="admin-settings-card-header">
                  <Building2 size={21} />

                  <div>
                    <h2>
                      Organization Settings
                    </h2>

                    <p>
                      Basic organization information.
                    </p>
                  </div>
                </div>

                <div className="admin-settings-form">

                  <div className="admin-settings-group">
                    <label>
                      Organization Name
                    </label>

                    <input
                      type="text"
                      name="organizationName"
                      value={
                        settings.organizationName
                      }
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-settings-group">
                    <label>
                      <Mail size={16} />
                      Support Email
                    </label>

                    <input
                      type="email"
                      name="supportEmail"
                      value={
                        settings.supportEmail
                      }
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-settings-group">
                    <label>
                      <Globe size={16} />
                      Website
                    </label>

                    <input
                      type="text"
                      name="website"
                      value={settings.website}
                      onChange={handleChange}
                    />
                  </div>

                </div>

              </section>

              <section className="admin-settings-card">

                <div className="admin-settings-card-header">
                  <Settings size={21} />

                  <div>
                    <h2>
                      System Preferences
                    </h2>

                    <p>
                      Configure platform behavior.
                    </p>
                  </div>
                </div>

                <div className="admin-settings-toggle-list">

                  <label className="admin-settings-toggle-item">

                    <div>
                      <strong>
                        Allow User Registrations
                      </strong>

                      <span>
                        Allow new users to create accounts.
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      name="allowRegistrations"
                      checked={
                        settings.allowRegistrations
                      }
                      onChange={handleChange}
                    />

                  </label>

                  <label className="admin-settings-toggle-item">

                    <div>
                      <strong>
                        Email Notifications
                      </strong>

                      <span>
                        Enable platform email notifications.
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={
                        settings.emailNotifications
                      }
                      onChange={handleChange}
                    />

                  </label>

                  <label className="admin-settings-toggle-item">

                    <div>
                      <strong>
                        Maintenance Mode
                      </strong>

                      <span>
                        Temporarily restrict platform access.
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      checked={
                        settings.maintenanceMode
                      }
                      onChange={handleChange}
                    />

                  </label>

                </div>

              </section>

              <div className="admin-settings-actions">

                <button
                  type="submit"
                  disabled={saving}
                >
                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : "Save Settings"}
                </button>

              </div>

            </form>
          )}

        </main>

      </div>

    </div>
  );
}

export default AdminSettings;