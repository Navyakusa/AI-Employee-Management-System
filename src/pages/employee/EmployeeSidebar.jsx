import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  FileText,
  TrendingUp,
} from "lucide-react";
import "./EmployeeSidebar.css";

function EmployeeSidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/employee/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Attendance",
      path: "/employee/attendance",
      icon: CalendarCheck,
    },
    {
      name: "Leave",
      path: "/employee/leave",
      icon: CalendarDays,
    },
    {
      name: "Documents",
      path: "/employee/documents",
      icon: FileText,
    },
    {
      name: "Performance",
      path: "/employee/performance",
      icon: TrendingUp,
    },
  ];

  return (
    <aside className="employee-sidebar">

      {/* TalentAI Logo */}
      <div className="employee-sidebar-logo">
        <div className="employee-sidebar-logo-box">
          AI
        </div>

        <div className="employee-sidebar-brand-text">
          <h2>TalentAI</h2>
          <span>Employee</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="employee-sidebar-nav">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `employee-sidebar-link ${
                  isActive ? "employee-sidebar-link-active" : ""
                }`
              }
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

      </nav>

    </aside>
  );
}

export default EmployeeSidebar;