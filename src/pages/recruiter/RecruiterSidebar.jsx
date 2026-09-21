import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Brain,
  ClipboardList,
  CalendarDays,
} from "lucide-react";

import "./RecruiterSidebar.css";

function RecruiterSidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/recruiter/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Candidates",
      path: "/recruiter/candidates",
      icon: Users,
    },
    {
      name: "Resume Management",
      path: "/recruiter/resumes",
      icon: FileText,
    },
    {
      name: "AI Screening",
      path: "/recruiter/screening",
      icon: Brain,
    },
    {
      name: "Screening Questions",
      path: "/recruiter/questions",
      icon: ClipboardList,
    },
    {
      name: "Interviews",
      path: "/recruiter/interviews",
      icon: CalendarDays,
    },
  ];

  return (
    <aside className="recruiter-sidebar">

      {/* Logo */}

      <div className="recruiter-sidebar-logo">

        <div className="recruiter-logo-box">
          AI
        </div>

        <div className="recruiter-logo-text">
          <strong>TalentAI</strong>
          <span>Recruiter</span>
        </div>

      </div>

      {/* Menu */}

      <nav className="recruiter-sidebar-menu">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `recruiter-sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <Icon size={16} />

              <span>{item.name}</span>
            </NavLink>
          );

        })}

      </nav>

    </aside>
  );
}

export default RecruiterSidebar;