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

function HiringManagerNavbar() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  const managerName =
    loggedInUser?.userName || "Hiring Manager";

  const managerRole =
    loggedInUser?.backendRole || "HIRING_MANAGER";

  const initials = managerName
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
      `/hiring-manager/shortlisted-candidates?search=${encodeURIComponent(
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
    <header className="hiring-manager-navbar">

      <div className="hiring-manager-navbar-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search candidates, jobs..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          onKeyDown={handleSearch}
        />
      </div>

      <div className="hiring-manager-navbar-actions">

        <button
          type="button"
          className="hiring-manager-notification-button"
        >
          <Bell size={20} />
        </button>

        <div className="hiring-manager-profile-wrapper">

          <button
            type="button"
            className="hiring-manager-profile"
            onClick={() =>
              setShowProfileMenu(
                (previous) => !previous
              )
            }
          >

            <div className="hiring-manager-profile-avatar">
              {initials || "HM"}
            </div>

            <div className="hiring-manager-profile-info">
              <strong>
                {managerName}
              </strong>

              <span>
                Hiring Manager
              </span>
            </div>

            <ChevronDown size={18} />

          </button>

          {showProfileMenu && (
  <div className="hiring-manager-profile-dropdown">

    {/* MY PROFILE */}
    <button
      type="button"
      onClick={() => {
        setShowProfileMenu(false);
        navigate("/hiring-manager/profile");
      }}
    >
      <User size={17} />
      My Profile
    </button>

    {/* SETTINGS */}
    <button
      type="button"
      onClick={() => {
        setShowProfileMenu(false);
        navigate("/hiring-manager/settings");
      }}
    >
      <Settings size={17} />
      Settings
    </button>

    {/* LOGOUT */}
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

export default HiringManagerNavbar;