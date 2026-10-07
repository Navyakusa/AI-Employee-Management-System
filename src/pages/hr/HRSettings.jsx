import React, { useState } from "react";
import {
  Building2,
  Mail,
  Globe,
  Settings,
  Save,
} from "lucide-react";

import "./HRSettings.css";
import HRSidebar from "./HRSidebar";
import HRNavbar from "./HRNavbar";


function HRSettings() {

  const [organizationName, setOrganizationName] =
    useState("TalentAI");

  const [supportEmail, setSupportEmail] =
    useState("support@talentai.com");

  const [website, setWebsite] =
    useState("www.talentai.com");


  const [allowRegistration, setAllowRegistration] =
    useState(true);

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [maintenanceMode, setMaintenanceMode] =
    useState(false);


  const handleSave = () => {
    alert("Settings saved successfully!");
  };


  return (
    <div className="hr-dashboard">

      {/* =====================================================
          HR SIDEBAR
      ===================================================== */}

      <HRSidebar />


      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <HRNavbar />


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="hr-main">

        <div className="hr-settings-page">


          {/* =====================================================
              PAGE HEADER
          ===================================================== */}

          <div className="hr-settings-header">

            <span>
              SYSTEM CONFIGURATION
            </span>

            <h1>
              Settings
            </h1>

            <p>
              Manage organization and platform settings.
            </p>

          </div>


          {/* =====================================================
              ORGANIZATION SETTINGS
          ===================================================== */}

          <div className="hr-settings-card">

            <div className="hr-settings-section-header">

              <Building2 size={18} />

              <div>

                <h2>
                  Organization Settings
                </h2>

                <p>
                  Basic organization information.
                </p>

              </div>

            </div>


            <div className="hr-settings-body">


              {/* Organization Name */}

              <label>

                <span>
                  Organization Name
                </span>

                <input
                  value={organizationName}
                  onChange={(e) =>
                    setOrganizationName(e.target.value)
                  }
                />

              </label>


              {/* Support Email */}

              <label>

                <span>

                  <Mail size={14} />

                  Support Email

                </span>

                <input
                  value={supportEmail}
                  onChange={(e) =>
                    setSupportEmail(e.target.value)
                  }
                />

              </label>


              {/* Website */}

              <label>

                <span>

                  <Globe size={14} />

                  Website

                </span>

                <input
                  value={website}
                  onChange={(e) =>
                    setWebsite(e.target.value)
                  }
                />

              </label>


            </div>

          </div>


          {/* =====================================================
              SYSTEM PREFERENCES
          ===================================================== */}

          <div className="hr-settings-card">


            <div className="hr-settings-section-header">

              <Settings size={18} />

              <div>

                <h2>
                  System Preferences
                </h2>

                <p>
                  Configure platform behavior.
                </p>

              </div>

            </div>


            <div className="hr-preferences">


              {/* =================================================
                  ALLOW REGISTRATION
              ================================================= */}

              <div className="preference-row">

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
                  checked={allowRegistration}
                  onChange={(e) =>
                    setAllowRegistration(e.target.checked)
                  }
                />

              </div>


              {/* =================================================
                  EMAIL NOTIFICATIONS
              ================================================= */}

              <div className="preference-row">

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
                  checked={emailNotifications}
                  onChange={(e) =>
                    setEmailNotifications(e.target.checked)
                  }
                />

              </div>


              {/* =================================================
                  MAINTENANCE MODE
              ================================================= */}

              <div className="preference-row">

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
                  checked={maintenanceMode}
                  onChange={(e) =>
                    setMaintenanceMode(e.target.checked)
                  }
                />

              </div>


            </div>

          </div>


          {/* =====================================================
              SAVE BUTTON
          ===================================================== */}

          <div className="hr-settings-save">

            <button onClick={handleSave}>

              <Save size={17} />

              Save Settings

            </button>

          </div>


        </div>

      </main>

    </div>
  );
}


export default HRSettings;