import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HRSidebar from "./HRSidebar";
import "./HRDashboard.css";

import {
  fetchDashboardSummary,
  fetchApplicationsByStatus,
} from "./hrApi";

function HRDashboard() {
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [summary, setSummary] = useState(null);
  const [dashboardError, setDashboardError] = useState(false);

  const [applicationsByStatus, setApplicationsByStatus] = useState([]);
  const [applicationsStatusError, setApplicationsStatusError] =
    useState(false);

  useEffect(() => {
    // ==============================
    // DASHBOARD SUMMARY
    // ==============================

    fetchDashboardSummary()
      .then((data) => {
        console.log("Dashboard Summary:", data);
        setSummary(data);
      })
      .catch((error) => {
        console.error("Dashboard summary error:", error);
        setDashboardError(true);
      });

    // ==============================
    // APPLICATIONS BY STATUS
    // ==============================

    fetchApplicationsByStatus()
      .then((data) => {
        console.log("Applications By Status:", data);
        setApplicationsByStatus(data);
      })
      .catch((error) => {
        console.error(
          "Applications by status error:",
          error
        );

        setApplicationsStatusError(true);
      });
  }, []);

  // ==============================
  // GET APPLICATION STATUS COUNT
  // ==============================

  const getApplicationStatusCount = (status) => {
    const item = applicationsByStatus.find(
      (item) =>
        item.status?.toUpperCase() === status.toUpperCase()
    );

    return item?.count ?? 0;
  };

  return (
    <div className="hr-dashboard">

      {/* ==============================
          SIDEBAR
      ============================== */}

      <HRSidebar />

      {/* ==============================
          MAIN CONTENT
      ============================== */}

      <main className="hr-main">

        {/* ==============================
            HEADER
        ============================== */}

        <header className="hr-header">

          <div>
            <h1>HR Dashboard</h1>

            <p>
              Welcome back, HR Manager 👋
            </p>
          </div>

          <div className="hr-profile-wrapper">

            <button
              className="hr-profile"
              onClick={() =>
                setProfileMenuOpen(!profileMenuOpen)
              }
            >

              <div className="hr-avatar">
                HR
              </div>

              <div className="hr-profile-info">

                <strong>
                  HR Manager
                </strong>

                <span>
                  Human Resources
                </span>

              </div>

              <span className="profile-arrow">
                ⌄
              </span>

            </button>

            {profileMenuOpen && (

              <div className="hr-profile-menu">

                <button
                  onClick={() =>
                    navigate("/hr/profile")
                  }
                >
                  👤 <span>My Profile</span>
                </button>

                <button
                  onClick={() =>
                    navigate("/hr/settings")
                  }
                >
                  ⚙️ <span>Settings</span>
                </button>

                <button
                  className="logout-option"
                  onClick={() => {

                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    navigate("/login");
                  }}
                >
                  🚪 <span>Logout</span>
                </button>

              </div>

            )}

          </div>

        </header>

        {/* ==============================
            STATISTICS
        ============================== */}

        <section className="hr-stats">

          {/* TOTAL EMPLOYEES */}

          <div className="hr-stat-card">

            <div className="stat-icon">
              👥
            </div>

            <div>

              <p>
                Total Employees
              </p>

              <h2>
                —
              </h2>

              <span>
                Employee API not connected
              </span>

            </div>

          </div>

          {/* OPEN POSITIONS */}

          <div className="hr-stat-card">

            <div className="stat-icon">
              💼
            </div>

            <div>

              <p>
                Open Positions
              </p>

              <h2>

                {dashboardError
                  ? "—"
                  : summary === null
                  ? "…"
                  : summary.activeJobs}

              </h2>

              <span>
                Currently hiring
              </span>

            </div>

          </div>

          {/* APPLICATIONS */}

          <div className="hr-stat-card">

            <div className="stat-icon">
              📄
            </div>

            <div>

              <p>
                Applications
              </p>

              <h2>

                {dashboardError
                  ? "—"
                  : summary === null
                  ? "…"
                  : summary.totalApplications}

              </h2>

              <span>
                {dashboardError
                  ? "Dashboard backend not reachable"
                  : "Total applications"}

              </span>

            </div>

          </div>

          {/* NEW EMPLOYEES */}

          <div className="hr-stat-card">

            <div className="stat-icon">
              🎯
            </div>

            <div>

              <p>
                New Employees
              </p>

              <h2>
                —
              </h2>

              <span>
                Employee API not connected
              </span>

            </div>

          </div>

        </section>

        {/* ==============================
            BOTTOM SECTION
        ============================== */}

        <section className="hr-dashboard-grid">

          {/* ==============================
              RECRUITMENT OVERVIEW
          ============================== */}

          <div className="hr-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Recruitment Overview
                </h2>

                <p>
                  Current recruitment pipeline
                </p>

              </div>

            </div>

            {/* APPLICATIONS */}

            <div className="recruitment-row">

              <span>
                Applications
              </span>

              <strong>

                {dashboardError
                  ? "—"
                  : summary === null
                  ? "…"
                  : summary.totalApplications}

              </strong>

            </div>

            {/* AI SCREENED */}

            <div className="recruitment-row">

              <span>
                AI Screened
              </span>

              <strong>
                —
              </strong>

            </div>

            {/* SHORTLISTED */}

            <div className="recruitment-row">

              <span>
                Shortlisted
              </span>

              <strong>

                {applicationsStatusError
                  ? "—"
                  : applicationsByStatus.length === 0
                  ? "…"
                  : getApplicationStatusCount(
                      "SHORTLISTED"
                    )}

              </strong>

            </div>

            {/* INTERVIEWS */}

            <div className="recruitment-row">

              <span>
                Interviews
              </span>

              <strong>

                {dashboardError
                  ? "—"
                  : summary === null
                  ? "…"
                  : summary.totalInterviews}

              </strong>

            </div>

            {/* SELECTED */}

            <div className="recruitment-row">

              <span>
                Selected
              </span>

              <strong>

                {applicationsStatusError
                  ? "—"
                  : applicationsByStatus.length === 0
                  ? "…"
                  : getApplicationStatusCount(
                      "SELECTED"
                    )}

              </strong>

            </div>

            {/* JOINED */}

            <div className="recruitment-row">

              <span>
                Joined
              </span>

              <strong>
                —
              </strong>

            </div>

          </div>

          {/* ==============================
              QUICK ACTIONS
          ============================== */}

          <div className="hr-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Frequently used HR actions
                </p>

              </div>

            </div>

            <div className="quick-actions">

              <button
                onClick={() =>
                  navigate("/hr/jobs/create")
                }
              >
                <span>➕</span>
                Create Job
              </button>

              <button
                onClick={() =>
                  navigate("/hr/candidates")
                }
              >
                <span>👥</span>
                View Candidates
              </button>

              <button
                onClick={() =>
                  navigate("/hr/interviews")
                }
              >
                <span>📅</span>
                Schedule Interview
              </button>

              <button
                onClick={() =>
                  navigate("/hr/analytics")
                }
              >
                <span>📊</span>
                View Analytics
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default HRDashboard;