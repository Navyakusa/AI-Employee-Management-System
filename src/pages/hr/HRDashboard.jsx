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

  // Real candidate count from the AI backend — no hardcoded number.
  // null = still loading, "error" = backend unreachable.
 const [summary, setSummary] = useState(null);
const [dashboardError, setDashboardError] = useState(false);
const [applicationsByStatus, setApplicationsByStatus] = useState([]);
const [applicationsStatusError, setApplicationsStatusError] = useState(false);

  useEffect(() => {
  // Dashboard summary
  fetchDashboardSummary()
    .then((data) => {
      console.log("Dashboard Summary:", data);
      setSummary(data);
    })
    .catch((error) => {
      console.error("Dashboard summary error:", error);
      setDashboardError(true);
    });

  // Applications by status
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

const getApplicationStatusCount = (status) => {
  const item = applicationsByStatus.find(
    (item) =>
      item.status?.toUpperCase() === status.toUpperCase()
  );

  return item?.count ?? 0;
}; 

  return (
    <div className="hr-dashboard">

      {/* Sidebar */}
      <HRSidebar />

      {/* Main Content */}
      <main className="hr-main">

        {/* Top Header */}
        <header className="hr-header">
          <div>
            <h1>HR Dashboard</h1>
            <p>Welcome back, HR Manager 👋</p>
          </div>

          <div className="hr-profile">
            <div className="hr-avatar">HR</div>
            <div>
              <strong>HR Manager</strong>
              <span>Human Resources</span>
            </div>
          </div>
        </header>

        {/* Statistics */}
        <section className="hr-stats">

          <div className="hr-stat-card">
            <div className="stat-icon">👥</div>
            <div>
              <p>Total Employees</p>
              <h2>250</h2>
              <span>237 active employees</span>
            </div>
          </div>

          <div className="hr-stat-card">
  <div className="stat-icon">💼</div>

  <div>
    <p>Open Positions</p>

    <h2>
      {dashboardError
        ? "—"
        : summary === null
        ? "…"
        : summary.activeJobs}
    </h2>

    <span>Currently hiring</span>
  </div>
</div>

          <div className="hr-stat-card">
  <div className="stat-icon">📄</div>

  <div>
    <p>Applications</p>

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
          <div className="hr-stat-card">
            <div className="stat-icon">🎯</div>
            <div>
              <p>New Employees</p>
              <h2>18</h2>
              <span>This month</span>
            </div>
          </div>

        </section>

        {/* Bottom Section */}
        <section className="hr-dashboard-grid">

          {/* Recruitment Overview */}
          <div className="hr-panel">
            <div className="panel-header">
              <div>
                <h2>Recruitment Overview</h2>
                <p>Current recruitment pipeline</p>
              </div>
            </div>

            <div className="recruitment-row">
              <span>Applications</span>
              <strong>1000</strong>
            </div>

            <div className="recruitment-row">
              <span>AI Screened</span>
              <strong>650</strong>
            </div>

            <div className="recruitment-row">
              <span>Shortlisted</span>
              <strong>250</strong>
            </div>

            <div className="recruitment-row">
              <span>Interviewed</span>
              <strong>100</strong>
            </div>

            <div className="recruitment-row">
              <span>Selected</span>
              <strong>30</strong>
            </div>

            <div className="recruitment-row">
              <span>Joined</span>
              <strong>25</strong>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hr-panel">

            <div className="panel-header">
              <div>
                <h2>Quick Actions</h2>
                <p>Frequently used HR actions</p>
              </div>
            </div>

            <div className="quick-actions">

              <button onClick={() => navigate("/hr/jobs/create")}>
  <span>➕</span>
  Create Job
</button>

              <button onClick={() => navigate("/hr/candidates")}>
                <span>👥</span>
                View Candidates
              </button>

              <button onClick={() => navigate("/hr/interviews")}>
                <span>📅</span>
                Schedule Interview
              </button>

              <button onClick={() => navigate("/hr/analytics")}>
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