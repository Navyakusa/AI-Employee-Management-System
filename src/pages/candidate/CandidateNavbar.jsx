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

import "./CandidateDashboard.css";

function CandidateNavbar() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  const candidateName =
    loggedInUser?.userName || "Candidate";

  const initials = candidateName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSearch = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const value = searchTerm.trim();

    if (!value) {
      return;
    }

    navigate(
      `/candidate/jobs?search=${encodeURIComponent(
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
    <header className="candidate-navbar">
      {/* SEARCH */}

      <div className="candidate-navbar-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          onKeyDown={handleSearch}
        />
      </div>

      {/* RIGHT SIDE */}

      <div className="candidate-navbar-actions">
        {/* NOTIFICATIONS */}

        <button
          type="button"
          className="candidate-notification-button"
          onClick={() =>
            navigate("/candidate/notifications")
          }
        >
          <Bell size={20} />

          <span className="candidate-notification-badge">
            3
          </span>
        </button>

        {/* PROFILE */}

        <div className="candidate-profile-wrapper">
          <button
            type="button"
            className="candidate-navbar-profile"
            onClick={() =>
              setShowProfileMenu(
                (previous) => !previous
              )
            }
          >
            <div className="candidate-navbar-avatar">
              {initials || "CA"}
            </div>

            <div className="candidate-navbar-profile-info">
              <strong>{candidateName}</strong>
              <span>Candidate</span>
            </div>

            <ChevronDown size={17} />
          </button>

          {/* DROPDOWN */}

          {showProfileMenu && (
            <div className="candidate-profile-dropdown">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/candidate/profile");
                }}
              >
                <User size={17} />
                My Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/candidate/settings");
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

export default CandidateNavbar;