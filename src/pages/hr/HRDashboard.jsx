import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HRSidebar from "./HRSidebar";
import "./HRDashboard.css";

import {
  fetchDashboardSummary,
  fetchApplicationsByStatus,
  fetchEmployeeStatistics,
  fetchInterviewsByStatus,
  fetchAIScreening,
} from "./hrApi";

function HRDashboard() {
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // ============================================================
  // DASHBOARD SUMMARY
  // ============================================================

  const [summary, setSummary] = useState(null);
  const [dashboardError, setDashboardError] = useState(false);

  // ============================================================
  // APPLICATIONS BY STATUS
  // ============================================================

  const [applicationsByStatus, setApplicationsByStatus] = useState([]);
  const [applicationsStatusError, setApplicationsStatusError] =
    useState(false);

  // ============================================================
  // EMPLOYEE STATISTICS
  // ============================================================

  const [employeeStatistics, setEmployeeStatistics] = useState(null);
  const [employeeStatisticsError, setEmployeeStatisticsError] =
    useState(false);

  // ============================================================
  // INTERVIEW STATISTICS
  // ============================================================

  const [interviewsByStatus, setInterviewsByStatus] = useState([]);
  const [interviewsStatusError, setInterviewsStatusError] =
    useState(false);

  // ============================================================
  // AI SCREENING
  // ============================================================

  const [aiScreening, setAiScreening] = useState(null);
  const [aiScreeningError, setAiScreeningError] = useState(false);

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  useEffect(() => {
    // ==========================================================
    // DASHBOARD SUMMARY
    // ==========================================================

    fetchDashboardSummary()
      .then((response) => {
        console.log("Dashboard Summary Response:", response);

        const data = response?.data ?? response;

        console.log("Dashboard Summary Data:", data);

        setSummary(data);
      })
      .catch((error) => {
        console.error("Dashboard summary error:", error);
        setDashboardError(true);
      });

    // ==========================================================
    // APPLICATIONS BY STATUS
    // ==========================================================

    fetchApplicationsByStatus()
      .then((response) => {
        console.log("Applications By Status Response:", response);

        const data = response?.data ?? response;

        console.log("Applications By Status Data:", data);

        setApplicationsByStatus(
          Array.isArray(data) ? data : []
        );
      })
      .catch((error) => {
        console.error(
          "Applications by status error:",
          error
        );

        setApplicationsStatusError(true);
      });

    // ==========================================================
    // EMPLOYEE STATISTICS
    // ==========================================================

    fetchEmployeeStatistics()
      .then((response) => {
        console.log("Employee Statistics Response:", response);

        const data = response?.data ?? response;

        console.log("Employee Statistics Data:", data);

        setEmployeeStatistics(data);
      })
      .catch((error) => {
        console.error(
          "Employee statistics error:",
          error
        );

        setEmployeeStatisticsError(true);
      });

    // ==========================================================
    // INTERVIEWS BY STATUS
    // ==========================================================

    fetchInterviewsByStatus()
      .then((response) => {
        console.log(
          "Interviews By Status Response:",
          response
        );

        const data = response?.data ?? response;

        console.log(
          "Interviews By Status Data:",
          data
        );

        setInterviewsByStatus(
          Array.isArray(data) ? data : []
        );
      })
      .catch((error) => {
        console.error(
          "Interviews by status error:",
          error
        );

        setInterviewsStatusError(true);
      });

    // ==========================================================
    // AI SCREENING
    // ==========================================================

    fetchAIScreening()
      .then((response) => {
        console.log(
          "AI Screening Response:",
          response
        );

        const data = response?.data ?? response;

        console.log(
          "AI Screening Data:",
          data
        );

        setAiScreening(data);
      })
      .catch((error) => {
        console.error(
          "AI screening error:",
          error
        );

        setAiScreeningError(true);
      });
  }, []);

  // ============================================================
  // GET APPLICATION STATUS COUNT
  // ============================================================

  const getApplicationStatusCount = (status) => {
    const item = applicationsByStatus.find(
      (item) =>
        item.status?.toUpperCase() ===
        status.toUpperCase()
    );

    return item?.count ?? 0;
  };

  // ============================================================
  // GET INTERVIEW STATUS COUNT
  // ============================================================

  const getInterviewStatusCount = (status) => {
    const item = interviewsByStatus.find(
      (item) =>
        item.status?.toUpperCase() ===
        status.toUpperCase()
    );

    return item?.count ?? 0;
  };

  // ============================================================
  // GET TOTAL INTERVIEWS
  // ============================================================

  const getTotalInterviews = () => {
    return interviewsByStatus.reduce(
      (total, item) =>
        total + (Number(item.count) || 0),
      0
    );
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="hr-dashboard">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <HRSidebar />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="hr-main">

        {/* ====================================================
            HEADER
        ==================================================== */}

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
                  onClick={handleLogout}
                >
                  🚪 <span>Logout</span>
                </button>

              </div>

            )}

          </div>

        </header>

        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <section className="hr-stats">

          {/* ==================================================
              TOTAL EMPLOYEES
          ================================================== */}

          <div className="hr-stat-card">

            <div className="stat-icon">
              👥
            </div>

            <div>

              <p>
                Total Employees
              </p>

              <h2>
                {employeeStatisticsError
                  ? "—"
                  : employeeStatistics === null
                  ? "…"
                  : employeeStatistics.totalEmployees}
              </h2>

              <span>
                {employeeStatisticsError
                  ? "Employee API not reachable"
                  : employeeStatistics === null
                  ? "Loading..."
                  : `${employeeStatistics.activeEmployees} active ${
                      employeeStatistics.activeEmployees === 1
                        ? "employee"
                        : "employees"
                    }`}
              </span>

            </div>

          </div>

          {/* ==================================================
              OPEN POSITIONS
          ================================================== */}

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

          {/* ==================================================
              APPLICATIONS
          ================================================== */}

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

          {/* ==================================================
              NEW EMPLOYEES
          ================================================== */}

          <div className="hr-stat-card">

            <div className="stat-icon">
              🎯
            </div>

            <div>

              <p>
                New Employees
              </p>

              <h2>
                {employeeStatisticsError
                  ? "—"
                  : employeeStatistics === null
                  ? "…"
                  : employeeStatistics.newEmployees}
              </h2>

              <span>
                {employeeStatisticsError
                  ? "Employee API not reachable"
                  : employeeStatistics === null
                  ? "Loading..."
                  : "New employees"}
              </span>

            </div>

          </div>

        </section>

        {/* ====================================================
            BOTTOM SECTION
        ==================================================== */}

        <section className="hr-dashboard-grid">

          {/* ==================================================
              RECRUITMENT OVERVIEW
          ================================================== */}

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

            {/* =================================================
                APPLICATIONS
            ================================================= */}

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

            {/* =================================================
                AI SCREENED
            ================================================= */}

            <div className="recruitment-row">

              <span>
                AI Screened
              </span>

              <strong>
                {aiScreeningError
                  ? "—"
                  : aiScreening === null
                  ? "…"
                  : aiScreening.totalScreenings}
              </strong>

            </div>

            {/* =================================================
                SHORTLISTED
            ================================================= */}

            <div className="recruitment-row">

              <span>
                Shortlisted
              </span>

              <strong>
                {applicationsStatusError
                  ? "—"
                  : applicationsByStatus.length === 0
                  ? "…"
                  : getApplicationStatusCount("SHORTLISTED")}
              </strong>

            </div>

            {/* =================================================
                INTERVIEWS
            ================================================= */}

            <div className="recruitment-row">

              <span>
                Interviews
              </span>

              <strong>
                {interviewsStatusError
                  ? "—"
                  : interviewsByStatus.length === 0
                  ? "…"
                  : getTotalInterviews()}
              </strong>

            </div>

            {/* =================================================
                SELECTED
            ================================================= */}

            <div className="recruitment-row">

              <span>
                Selected
              </span>

              <strong>
                {applicationsStatusError
                  ? "—"
                  : applicationsByStatus.length === 0
                  ? "…"
                  : getApplicationStatusCount("SELECTED")}
              </strong>

            </div>

            {/* =================================================
                JOINED
            ================================================= */}

            <div className="recruitment-row">

              <span>
                Joined
              </span>

              <strong>
                —
              </strong>

            </div>

          </div>

          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

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