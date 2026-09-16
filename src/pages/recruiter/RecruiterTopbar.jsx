import React, { useState } from "react";
import {
  Search,
  Bell,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./RecruiterTopbar.css";

function RecruiterTopbar() {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");

    navigate("/login");
  };

  return (
    <header className="recruiter-topbar">

      {/* Search */}

      <div className="recruiter-topbar-search">

        <Search size={16} />

        <input
          type="text"
          placeholder="Search candidates, jobs..."
        />

      </div>

      {/* Right Side */}

      <div className="recruiter-topbar-right">

        {/* Notification */}

        <button
          className="recruiter-notification-btn"
          onClick={() =>
            navigate("/recruiter/notifications")
          }
          title="Notifications"
        >
          <Bell size={18} />

          <span className="notification-dot"></span>
        </button>

        {/* Profile */}

        <div className="recruiter-profile-container">

          <button
            className="recruiter-profile-btn"
            onClick={() =>
              setShowProfileMenu(!showProfileMenu)
            }
          >

            <div className="recruiter-profile-avatar">
              R
            </div>

            <div className="recruiter-profile-info">
              <strong>Recruiter</strong>
              <span>Recruiter</span>
            </div>

            <span className="recruiter-profile-arrow">
              {showProfileMenu ? "⌃" : "⌄"}
            </span>

          </button>

          {/* Dropdown */}

          {showProfileMenu && (

            <div className="recruiter-profile-dropdown">

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/recruiter/profile");
                }}
              >
                <UserRound size={16} />

                <div>
                  <strong>My Profile</strong>
                  <span>View your profile</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/recruiter/settings");
                }}
              >
                <Settings size={16} />

                <div>
                  <strong>Settings</strong>
                  <span>Account preferences</span>
                </div>
              </button>

              <div className="recruiter-dropdown-divider"></div>

              <button
                className="recruiter-logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />

                <div>
                  <strong>Logout</strong>
                  <span>Sign out of your account</span>
                </div>
              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default RecruiterTopbar;