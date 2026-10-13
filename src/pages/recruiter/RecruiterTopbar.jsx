import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Bell,
  UserRound,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import apiClient from "../../services/apiClient";
import "./RecruiterTopbar.css";

function RecruiterTopbar() {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get(
        "/notifications/unread-count"
      );

      const result = response.data;

      if (result?.success) {
        const count = Number(result.data ?? 0);

        setUnreadCount(
          Number.isFinite(count) ? Math.max(0, count) : 0
        );
      }
    } catch (error) {
      console.error(
        "Unable to fetch unread notification count:",
        error
      );
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Refresh periodically so read/new notifications are reflected
    const intervalId = setInterval(fetchUnreadCount, 15000);

    // Refresh when the user returns to the browser tab
    const handleFocus = () => fetchUnreadCount();

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchUnreadCount]);

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
          type="button"
          className="recruiter-notification-btn"
          onClick={() => navigate("/recruiter/notifications")}
          title={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell
  size={22}
  color="#111827"
  strokeWidth={2}
  absoluteStrokeWidth
/>

          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
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
              <button type="button" onClick={handleProfile}>
                <UserRound size={17} />
                <div>
                  <strong>My Profile</strong>
                  <span>View your profile</span>
                </div>
              </button>

              <button type="button" onClick={handleSettings}>
                <Settings size={17} />
                <div>
                  <strong>Settings</strong>
                  <span>Account preferences</span>
                </div>
              </button>

              <div className="recruiter-dropdown-divider"></div>

              <button
                type="button"
                className="recruiter-logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={17} />
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
