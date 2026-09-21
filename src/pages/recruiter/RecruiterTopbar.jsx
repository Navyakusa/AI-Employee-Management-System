import React, { useState } from "react";
import {
  Search,
  Bell,
  UserRound,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./RecruiterTopbar.css";

function RecruiterTopbar() {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("role");

    navigate("/login");
  };

  const handleProfile = () => {
    setShowProfileMenu(false);
    navigate("/recruiter/profile");
  };

  const handleSettings = () => {
    setShowProfileMenu(false);
    navigate("/recruiter/settings");
  };

  return (
    <header className="recruiter-topbar">

      {/* SEARCH */}
      <div className="recruiter-topbar-search">
        <Search size={17} />

        <input
          type="text"
          placeholder="Search candidates, jobs..."
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="recruiter-topbar-right">

        {/* NOTIFICATION */}
        <button
          className="recruiter-notification-btn"
          onClick={() => navigate("/recruiter/notifications")}
          title="Notifications"
        >
          <Bell size={18} />

          <span className="notification-dot"></span>
        </button>

        {/* RECRUITER PROFILE */}
        <div className="recruiter-profile-container">

          <button
            type="button"
            className="recruiter-profile-btn"
            onClick={() =>
              setShowProfileMenu((prev) => !prev)
            }
          >

            <div className="recruiter-profile-avatar">
              R
            </div>

            <div className="recruiter-profile-info">
              <strong>Recruiter</strong>
              <span>Recruiter</span>
            </div>

            <ChevronDown
              size={15}
              className={`recruiter-arrow ${
                showProfileMenu ? "open" : ""
              }`}
            />

          </button>

          {/* PROFILE MENU */}
          {showProfileMenu && (
            <div className="recruiter-profile-dropdown">

              {/* MY PROFILE */}
              <button
                type="button"
                onClick={handleProfile}
              >
                <UserRound size={17} />

                <div>
                  <strong>My Profile</strong>
                  <span>
                    View your profile
                  </span>
                </div>
              </button>

              {/* SETTINGS */}
              <button
                type="button"
                onClick={handleSettings}
              >
                <Settings size={17} />

                <div>
                  <strong>Settings</strong>
                  <span>
                    Account preferences
                  </span>
                </div>
              </button>

              <div className="recruiter-dropdown-divider"></div>

              {/* LOGOUT */}
              <button
                type="button"
                className="recruiter-logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={17} />

                <div>
                  <strong>Logout</strong>
                  <span>
                    Sign out of your account
                  </span>
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