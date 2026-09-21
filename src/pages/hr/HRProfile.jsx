import React, { useState } from "react";
import { User, Mail, Shield, Building2, Save } from "lucide-react";
import "./HRProfile.css";
import HRSidebar from "./HRSidebar";

function HRProfile() {
  const [fullName, setFullName] = useState("HR Manager");
  const [email, setEmail] = useState("hr@talentai.com");
  const [department, setDepartment] = useState("Human Resources");

  const handleSave = () => {
    alert("Profile changes saved successfully!");
  };

  return (
    <div className="hr-dashboard">

      {/* HR Sidebar */}
      <HRSidebar />

      {/* Main Content */}
      <main className="hr-main">

        <div className="hr-profile-page">

          {/* Page Header */}
          <div className="hr-profile-page-header">
            <div>
              <span className="hr-page-label">ACCOUNT</span>
              <h1>My Profile</h1>
              <p>View and update your HR manager profile.</p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="hr-profile-card">

            {/* Profile Information */}
            <div className="hr-profile-top">
              <div className="large-hr-avatar">
                HR
              </div>

              <div>
                <h2>HR Manager</h2>
                <p>{email}</p>
                <span className="hr-role-badge">
                  HR Manager
                </span>
              </div>
            </div>

            <div className="hr-profile-divider"></div>

            {/* Profile Form */}
            <div className="hr-profile-form">

              {/* Full Name */}
              <div className="hr-form-group full-width">
                <label>
                  <User size={16} />
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="hr-form-group full-width">
                <label>
                  <Mail size={16} />
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Role + Department */}
              <div className="hr-form-row">

                <div className="hr-form-group">
                  <label>
                    <Shield size={16} />
                    Role
                  </label>

                  <input
                    type="text"
                    value="HR Manager"
                    disabled
                  />
                </div>

                <div className="hr-form-group">
                  <label>
                    <Building2 size={16} />
                    Department
                  </label>

                  <input
                    type="text"
                    value={department}
                    onChange={(e) =>
                      setDepartment(e.target.value)
                    }
                  />
                </div>

              </div>

              {/* Save Button */}
              <div className="hr-profile-save">
                <button onClick={handleSave}>
                  <Save size={17} />
                  Save Changes
                </button>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default HRProfile;