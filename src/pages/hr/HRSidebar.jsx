
import React from "react";
import { NavLink } from "react-router-dom";
import "./HRSidebar.css";

function HRSidebar() {
  return (
    <aside className="hr-sidebar">
      {/* LOGO */}
      <div className="hr-logo">
        Talent<span>AI</span>
      </div>

      {/* MAIN NAVIGATION */}
      <nav className="hr-navigation">
        {/* Dashboard */}
        <NavLink to="/hr/dashboard">
          <span className="hr-nav-icon">📊</span>
          <span className="hr-nav-label">Dashboard</span>
        </NavLink>

        {/* Jobs */}
        <NavLink to="/hr/jobs">
          <span className="hr-nav-icon">💼</span>
          <span className="hr-nav-label">Jobs</span>
        </NavLink>

        {/* Candidates */}
        <NavLink to="/hr/candidates">
          <span className="hr-nav-icon">👥</span>
          <span className="hr-nav-label">Candidates</span>
        </NavLink>

        {/* AI Screening */}
        <NavLink to="/hr/ai-screening">
          <span className="hr-nav-icon">🤖</span>
          <span className="hr-nav-label">AI Screening</span>
        </NavLink>

        {/* Interviews */}
        <NavLink to="/hr/interviews">
          <span className="hr-nav-icon">📅</span>
          <span className="hr-nav-label">Interviews</span>
        </NavLink>

        {/* Offers */}
        <NavLink to="/hr/offers">
          <span className="hr-nav-icon">📄</span>
          <span className="hr-nav-label">Offers</span>
        </NavLink>

        {/* Employees */}
        <NavLink to="/hr/employees">
          <span className="hr-nav-icon">👨‍💼</span>
          <span className="hr-nav-label">Employees</span>
        </NavLink>

        {/* Onboarding - NEW */}
        <NavLink to="/hr/onboarding">
          <span className="hr-nav-icon">📋</span>
          <span className="hr-nav-label">Onboarding</span>
        </NavLink>

        {/* Leave Requests */}
        <NavLink to="/hr/leave-requests">
          <span className="hr-nav-icon">📝</span>
          <span className="hr-nav-label">Leave Requests</span>
        </NavLink>

        {/* Analytics */}
        <NavLink to="/hr/analytics">
          <span className="hr-nav-icon">📈</span>
          <span className="hr-nav-label">Analytics</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default HRSidebar;
