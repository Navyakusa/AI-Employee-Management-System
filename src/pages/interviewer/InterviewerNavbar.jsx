import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import {
  fetchInterviewerUnreadCount,
  NOTIFICATIONS_UPDATED_EVENT,
} from "../../services/interviewerNotificationUtils";

// How often the bell re-checks for new notifications (ms).
const NOTIFICATION_POLL_INTERVAL = 30000;

function InterviewerNavbar() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refreshUnread = () => {
      fetchInterviewerUnreadCount()
        .then((count) => {
          if (!cancelled) setUnreadCount(count);
        })
        .catch(() => {
          // Keep the last known value if the request fails.
        });
    };

    refreshUnread();

    const intervalId = setInterval(
      refreshUnread,
      NOTIFICATION_POLL_INTERVAL
    );

    // Refresh immediately when notifications are read elsewhere,
    // or when the user comes back to this tab.
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshUnread);
    window.addEventListener("focus", refreshUnread);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshUnread);
      window.removeEventListener("focus", refreshUnread);
    };
  }, []);

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  const interviewerName =
    loggedInUser?.userName || "Interviewer";

  const initials = interviewerName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSearch = (e) => {
    if (e.key !== "Enter") {
      return;
    }

    const value = searchTerm.trim();

    if (!value) {
      return;
    }

    navigate(
      `/interviewer/interviews?search=${encodeURIComponent(
        value
      )}`
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("loggedInUser");

    navigate("/login");
  };

  return (
    <header className="interviewer-navbar">

      <div className="interviewer-navbar-search">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search interviews, candidates..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          onKeyDown={handleSearch}
        />

      </div>

      <div className="interviewer-navbar-actions">

        <button
          type="button"
          className="interviewer-notification-button"
          style={{ position: "relative" }}
          aria-label={
            unreadCount > 0
              ? `Notifications (${unreadCount} unread)`
              : "Notifications"
          }
          title={
            unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "Notifications"
          }
          onClick={() => navigate("/interviewer/notifications")}
        >
          <Bell size={20} />

          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "6px",
                right: "7px",
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: "#e5484d",
                border: "2px solid #ffffff",
                boxSizing: "content-box",
              }}
            />
          )}
        </button>

        <div className="interviewer-profile-wrapper">

          <button
            type="button"
            className="interviewer-profile"
            onClick={() =>
              setShowProfileMenu(
                (previous) => !previous
              )
            }
          >

            <div className="interviewer-profile-avatar">
              {initials || "IN"}
            </div>

            <div className="interviewer-profile-info">
              <strong>{interviewerName}</strong>
              <span>Interviewer</span>
            </div>

            <ChevronDown size={18} />

          </button>

          {showProfileMenu && (

            <div className="interviewer-profile-dropdown">

              <button
  type="button"
  onClick={() => {
    setShowProfileMenu(false);
    navigate("/interviewer/profile");
  }}
>
  <User size={17} />
  My Profile
</button>

              <button
  type="button"
  onClick={() => {
    setShowProfileMenu(false);
    navigate("/interviewer/settings");
  }}
>
  <Settings size={17} />
  Settings
</button>

              <button
                type="button"
                className="logout"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Logout
              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default InterviewerNavbar;