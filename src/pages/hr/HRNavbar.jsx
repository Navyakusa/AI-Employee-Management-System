
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HRNavbar.css";
function HRNavbar() {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // ============================================================
  // GET UNREAD NOTIFICATION COUNT
  // ============================================================
  const loadUnreadNotificationCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUnreadCount(0);
        return;
      }
      const API_BASE =
        import.meta.env.VITE_API_URL ||
        "http://localhost:8080/api";
      const response = await fetch(
        `${API_BASE}/notifications/unread-count`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          `Notification request failed: ${response.status}`
        );
      }
      const result = await response.json();
      console.log(
        "Unread notification response:",
        result
      );
      // Backend response:
      // {
      //   data: 6,
      //   message: "...",
      //   success: true
      // }
      const count = result?.data;
      setUnreadCount(
        typeof count === "number"
          ? count
          : 0
      );
    } catch (error) {
      console.error(
        "Failed to load unread notification count:",
        error
      );
      setUnreadCount(0);
    }
  };
  // ============================================================
  // LOAD NOTIFICATION COUNT
  // ============================================================
  useEffect(() => {
    loadUnreadNotificationCount();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadUnreadNotificationCount();
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  // ============================================================
  // LOGOUT
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  // ============================================================
  // NOTIFICATION CLICK
  // ============================================================
  const handleNotificationClick = () => {
    navigate("/hr/notifications");
  };
  // ============================================================
  // UI
  // ============================================================
  return (
    <header className="hr-navbar">
      {/* ======================================================
          SEARCH
      ====================================================== */}
      <div className="hr-navbar-search">
        <span className="hr-navbar-search-icon">
          🔍
        </span>
        <input
          type="text"
          placeholder="Search attendance, leave, documents..."
        />
      </div>
      {/* ======================================================
          RIGHT SIDE
      ====================================================== */}
      <div className="hr-navbar-right">
        {/* ====================================================
            NOTIFICATION
        ==================================================== */}
        <button
          type="button"
          className="hr-navbar-notification"
          onClick={handleNotificationClick}
          aria-label="Notifications"
        >
          <span className="hr-navbar-bell">
            🔔
          </span>
          {/* Unread count */}
          {unreadCount > 0 && (
            <span className="hr-navbar-notification-badge">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>
        {/* ====================================================
            PROFILE
        ==================================================== */}
        <div className="hr-navbar-profile-wrapper">
          <button
            type="button"
            className="hr-navbar-profile"
            onClick={() =>
              setProfileMenuOpen(
                !profileMenuOpen
              )
            }
          >
            <div className="hr-navbar-avatar">
              HR
            </div>
            <div className="hr-navbar-profile-info">
              <strong>
                HR Manager
              </strong>
              <span>
                Human Resources
              </span>
            </div>
            <span className="hr-navbar-profile-arrow">
              ⌄
            </span>
          </button>
          {/* ==================================================
              PROFILE MENU
          ================================================== */}
          {profileMenuOpen && (
            <div className="hr-navbar-profile-menu">
              {/* My Profile */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate("/hr/profile");
                }}
              >
                <span>👤</span>
                <span>My Profile</span>
              </button>
              {/* Settings */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate("/hr/settings");
                }}
              >
                <span>⚙️</span>
                <span>Settings</span>
              </button>
              {/* Logout */}
              <button
                type="button"
                className="hr-navbar-logout"
                onClick={handleLogout}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export default HRNavbar;   