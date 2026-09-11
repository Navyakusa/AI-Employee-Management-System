import React from "react";
import { NavLink } from "react-router-dom";
import "./HRSidebar.css";
function HRSidebar() {
  return (
    <aside className="hr-sidebar">

      {/* Logo */}
      <div className="hr-logo">
        Talent<span>AI</span>
      </div>

      {/* Main Navigation */}
      <nav className="hr-navigation">

        <NavLink to="/hr/dashboard">
          📊 Dashboard
        </NavLink>

        <NavLink to="/hr/jobs">
          💼 Jobs
        </NavLink>

        <NavLink to="/hr/candidates">
          👥 Candidates
        </NavLink>

        <NavLink to="/hr/ai-screening">
          🤖 AI Screening
        </NavLink>

        <NavLink to="/hr/interviews">
          📅 Interviews
        </NavLink>

        <NavLink to="/hr/offers">
          📄 Offers
        </NavLink>

        <NavLink to="/hr/employees">
          👨‍💼 Employees
        </NavLink>

        <NavLink to="/hr/analytics">
          📈 Analytics
        </NavLink>

      </nav>

      {/* Bottom Navigation */}
      

       

      

    </aside>
  );
}

export default HRSidebar;