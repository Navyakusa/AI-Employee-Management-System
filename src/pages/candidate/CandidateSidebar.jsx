import { useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileCheck2,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";

import "./CandidateDashboard.css";

function CandidateSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/candidate/dashboard",
    },
    {
      label: "Browse Jobs",
      icon: BriefcaseBusiness,
      path: "/candidate/jobs",
    },
    {
      label: "My Applications",
      icon: FileCheck2,
      path: "/candidate/applications",
    },
    {
      label: "My Interviews",
      icon: CalendarDays,
      path: "/candidate/interviews",
    },
    {
      label: "Offers",
      icon: BadgeCheck,
      path: "/candidate/offers",
    },
  ];

  const isActive = (path) => {
    if (path === "/candidate/dashboard") {
      return location.pathname === path;
    }

    return location.pathname.startsWith(path);
  };

  return (
    <aside className="candidate-sidebar">
      {/* LOGO */}

      <div className="candidate-sidebar-logo">
        <div className="candidate-sidebar-logo-icon">
          AI
        </div>

        <div>
          <h2>TalentAI</h2>
          <span>Candidate</span>
        </div>
      </div>

      {/* NAVIGATION */}

      <nav className="candidate-sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              className={`candidate-sidebar-item ${
                isActive(item.path) ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={19} />

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default CandidateSidebar;