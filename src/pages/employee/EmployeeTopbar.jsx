import React, { useState } from "react";
import { Search, Bell, UserRound, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./EmployeeTopbar.css";

function EmployeeTopbar() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const employeeName = "Maheshwari";
  const designation = "Software Engineer";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");

    navigate("/login");
  };

  const handleNotificationClick = () => {
    setShowProfileMenu(false);
    navigate("/employee/notifications");
  };

  const handleProfileClick = () => {
    setShowProfileMenu((prev) => !prev);
  };

  return (
    <header className="employee-topbar">

      {/* Search */}
      <div className="employee-search-box">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search attendance, leave, documents..."
        />
      </div>

      {/* Right Side */}
      <div className="employee-topbar-right">

        {/* Notification */}
        <button
          className="employee-topbar-icon-btn"
          onClick={handleNotificationClick}
          title="Notifications"
        >
          <Bell size={21} />

          <span className="employee-notification-dot"></span>
        </button>

        {/* Profile */}
        <div className="employee-profile-container">

          <button
            className="employee-profile-btn"
            onClick={handleProfileClick}
          >
            <div className="employee-avatar">
              M
            </div>

            <div className="employee-profile-info">
              <strong>{employeeName}</strong>
              <span>{designation}</span>
            </div>
          </button>

          {/* Profile Menu */}
          {showProfileMenu && (
            <div className="employee-profile-menu">

              <div className="employee-profile-menu-header">
                <div className="employee-menu-avatar">
                  M
                </div>

                <div>
                  <strong>{employeeName}</strong>
                  <span>{designation}</span>
                </div>
              </div>

              <div className="employee-profile-menu-divider"></div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/employee/profile");
                }}
              >
                <UserRound size={17} />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/employee/settings");
                }}
              >
                <Settings size={17} />
                <span>Settings</span>
              </button>

              <div className="employee-profile-menu-divider"></div>

              <button
                className="employee-logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default EmployeeTopbar;