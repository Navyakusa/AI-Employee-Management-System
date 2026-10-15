
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BriefcaseBusiness,
  Users,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  FileText,
  AlertCircle,
  RefreshCw,
  Clock3,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";
import apiClient from "../../services/apiClient";

import "./HiringManagerLayout.css";
import "./HiringManagerDashboard.css";

function HiringManagerDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Direct Axios request using the shared apiClient.
      // JWT authentication is added by your existing interceptor.
      const apiResponse = await apiClient.get(
        "/hiring-manager/dashboard"
      );

      const response = apiResponse.data;

      console.log("Hiring Manager Dashboard:", response);

      const dashboardData =
        response?.data ??
        response?.content ??
        response ??
        null;

      setDashboard(dashboardData);
    } catch (err) {
      console.error("Hiring Manager Dashboard Error:", err);

      setDashboard(null);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load hiring manager dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalJobs = Number(
    dashboard?.totalJobs ??
      dashboard?.assignedJobs ??
      0
  );

  const openJobs = Number(
    dashboard?.openJobs ?? 0
  );

  const totalApplications = Number(
    dashboard?.totalApplications ??
      dashboard?.applications ??
      0
  );

  const totalInterviews = Number(
    dashboard?.totalInterviews ??
      dashboard?.interviews ??
      0
  );

  const pendingDecisions = Number(
    dashboard?.pendingDecisions ?? 0
  );

  const department =
    dashboard?.department ||
    "Hiring Department";

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hm-dashboard-page">
          {/* PAGE HEADER */}
          <header className="hm-dashboard-header">
            <div>
              <span className="hm-dashboard-eyebrow">
                HIRING MANAGER
              </span>

              <h1>Dashboard</h1>

              <p>
                Overview of recruitment activities,
                candidates and interview progress.
              </p>
            </div>
          </header>

          {/* ERROR */}
          {!loading && error && (
            <section className="hm-dashboard-error">
              <div className="hm-dashboard-error-left">
                <div className="hm-dashboard-error-icon">
                  <AlertCircle size={21} />
                </div>

                <div>
                  <h3>Unable to load dashboard</h3>
                  <p>{error}</p>
                </div>
              </div>

              <button
                type="button"
                className="hm-dashboard-retry"
                onClick={loadDashboard}
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </section>
          )}

          {/* LOADING */}
          {loading && (
            <section className="hm-dashboard-loading">
              <RefreshCw
                size={24}
                className="hm-dashboard-loading-icon"
              />

              <span>Loading dashboard...</span>
            </section>
          )}

          {/* DASHBOARD */}
          {!loading && !error && (
            <>
              {/* DEPARTMENT */}
              <section className="hm-dashboard-department-card">
                <div>
                  <span className="hm-dashboard-small-label">
                    Department
                  </span>

                  <strong>{department}</strong>
                </div>

                <span className="hm-dashboard-overview-badge">
                  Dashboard Overview
                </span>
              </section>

              {/* STATISTICS */}
              <section className="hm-dashboard-stats">
                {/* JOBS */}
                <div className="hm-dashboard-stat-card">
                  <div className="hm-dashboard-stat-icon jobs">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <div className="hm-dashboard-stat-content">
                    <span>Assigned Jobs</span>
                    <strong>{totalJobs}</strong>

                    <small>
                      {openJobs} currently open
                    </small>
                  </div>
                </div>

                {/* CANDIDATES */}
                <div className="hm-dashboard-stat-card">
                  <div className="hm-dashboard-stat-icon candidates">
                    <Users size={22} />
                  </div>

                  <div className="hm-dashboard-stat-content">
                    <span>Candidates</span>
                    <strong>{totalApplications}</strong>

                    <small>Applications received</small>
                  </div>
                </div>

                {/* INTERVIEWS */}
                <div className="hm-dashboard-stat-card">
                  <div className="hm-dashboard-stat-icon interviews">
                    <CalendarDays size={22} />
                  </div>

                  <div className="hm-dashboard-stat-content">
                    <span>Interviews</span>
                    <strong>{totalInterviews}</strong>

                    <small>Interview records</small>
                  </div>
                </div>

                {/* DECISIONS */}
                <div className="hm-dashboard-stat-card">
                  <div className="hm-dashboard-stat-icon decisions">
                    <CheckCircle2 size={22} />
                  </div>

                  <div className="hm-dashboard-stat-content">
                    <span>Pending Decisions</span>
                    <strong>{pendingDecisions}</strong>

                    <small>Awaiting review</small>
                  </div>
                </div>
              </section>

              {/* QUICK ACTIONS */}
              <section className="hm-dashboard-section">
                <div className="hm-dashboard-section-heading">
                  <div>
                    <h2>Quick Actions</h2>

                    <p>
                      Access your main hiring activities.
                    </p>
                  </div>
                </div>

                <div className="hm-dashboard-actions">
                  <button
                    type="button"
                    className="hm-dashboard-action"
                    onClick={() =>
                      navigate("/hiring-manager/jobs")
                    }
                  >
                    <div className="hm-dashboard-action-icon">
                      <BriefcaseBusiness size={21} />
                    </div>

                    <div className="hm-dashboard-action-text">
                      <strong>Assigned Jobs</strong>

                      <span>
                        Review your assigned positions.
                      </span>
                    </div>

                    <ArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="hm-dashboard-action"
                    onClick={() =>
                      navigate(
                        "/hiring-manager/shortlisted-candidates"
                      )
                    }
                  >
                    <div className="hm-dashboard-action-icon">
                      <Users size={21} />
                    </div>

                    <div className="hm-dashboard-action-text">
                      <strong>Shortlisted Candidates</strong>

                      <span>
                        Review shortlisted candidates.
                      </span>
                    </div>

                    <ArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="hm-dashboard-action"
                    onClick={() =>
                      navigate("/hiring-manager/interviews")
                    }
                  >
                    <div className="hm-dashboard-action-icon">
                      <CalendarDays size={21} />
                    </div>

                    <div className="hm-dashboard-action-text">
                      <strong>Interviews</strong>

                      <span>
                        Monitor interview schedules.
                      </span>
                    </div>

                    <ArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="hm-dashboard-action"
                    onClick={() =>
                      navigate("/hiring-manager/decisions")
                    }
                  >
                    <div className="hm-dashboard-action-icon">
                      <CheckCircle2 size={21} />
                    </div>

                    <div className="hm-dashboard-action-text">
                      <strong>Candidate Decisions</strong>

                      <span>
                        Review pending hiring decisions.
                      </span>
                    </div>

                    <ArrowRight size={18} />
                  </button>
                </div>
              </section>

              {/* OVERVIEW */}
              <section className="hm-dashboard-bottom-grid">
                {/* RECRUITMENT OVERVIEW */}
                <div className="hm-dashboard-panel">
                  <div className="hm-dashboard-panel-header">
                    <div>
                      <h2>Recruitment Overview</h2>

                      <p>
                        Current recruitment activity.
                      </p>
                    </div>

                    <FileText size={21} />
                  </div>

                  <div className="hm-dashboard-overview-row">
                    <div>
                      <BriefcaseBusiness size={18} />
                      <span>Total Jobs</span>
                    </div>

                    <strong>{totalJobs}</strong>
                  </div>

                  <div className="hm-dashboard-overview-row">
                    <div>
                      <CheckCircle2 size={18} />
                      <span>Open Jobs</span>
                    </div>

                    <strong>{openJobs}</strong>
                  </div>

                  <div className="hm-dashboard-overview-row">
                    <div>
                      <Users size={18} />
                      <span>Applications</span>
                    </div>

                    <strong>{totalApplications}</strong>
                  </div>

                  <div className="hm-dashboard-overview-row">
                    <div>
                      <CalendarDays size={18} />
                      <span>Interviews</span>
                    </div>

                    <strong>{totalInterviews}</strong>
                  </div>
                </div>

                {/* WORKFLOW */}
                <div className="hm-dashboard-panel">
                  <div className="hm-dashboard-panel-header">
                    <div>
                      <h2>Hiring Workflow</h2>

                      <p>
                        Continue with your recruitment process.
                      </p>
                    </div>

                    <Clock3 size={21} />
                  </div>

                  <button
                    type="button"
                    className="hm-dashboard-workflow"
                    onClick={() =>
                      navigate(
                        "/hiring-manager/shortlisted-candidates"
                      )
                    }
                  >
                    <span>1</span>

                    <div>
                      <strong>Review Candidates</strong>

                      <small>
                        Check shortlisted candidate
                        profiles and AI matching results.
                      </small>
                    </div>

                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    className="hm-dashboard-workflow"
                    onClick={() =>
                      navigate("/hiring-manager/interviews")
                    }
                  >
                    <span>2</span>

                    <div>
                      <strong>Review Interviews</strong>

                      <small>
                        Monitor interview schedules
                        and completed interviews.
                      </small>
                    </div>

                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    className="hm-dashboard-workflow"
                    onClick={() =>
                      navigate("/hiring-manager/decisions")
                    }
                  >
                    <span>3</span>

                    <div>
                      <strong>Make Decisions</strong>

                      <small>
                        Review candidate results and
                        complete hiring decisions.
                      </small>
                    </div>

                    <ArrowRight size={17} />
                  </button>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default HiringManagerDashboard;
