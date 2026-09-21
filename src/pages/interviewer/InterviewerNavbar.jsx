import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

function InterviewerNavbar() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

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
  onClick={() =>
    navigate("/interviewer/notifications")
  }
>
  <Bell size={20} />

  <span className="interviewer-notification-badge">
    3
  </span>
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