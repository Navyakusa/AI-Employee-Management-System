import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BriefcaseBusiness,
  Users,
  CalendarDays,
  CheckCircle,
  ArrowRight,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import { getHiringManagerDashboard } from "./HiringManagerApi";

import "./HiringManagerDashboard.css";

function HiringManagerDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  ======================================================
  GET LOGGED-IN HIRING MANAGER
  ======================================================
  */

  const getLoggedInUser = () => {
    try {
      const storedUser = localStorage.getItem("loggedInUser");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Unable to read loggedInUser:", error);
      return null;
    }
  };

  /*
  ======================================================
  FETCH DASHBOARD
  ======================================================
  */

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const loggedInUser = getLoggedInUser();

      const email =
        loggedInUser?.email ||
        loggedInUser?.userEmail ||
        "";

      if (!email) {
        throw new Error(
          "Hiring Manager email is not available."
        );
      }

      const response =
        await getHiringManagerDashboard();

      console.log(
        "HIRING MANAGER DASHBOARD RESPONSE:",
        response
      );

      /*
      API response structure:

      {
        success: true,
        message: "...",
        data: {
          totalJobs: ...,
          openJobs: ...,
          totalApplications: ...,
          totalInterviews: ...,
          department: "..."
        }
      }
      */

      setDashboard(response?.data || response || null);

    } catch (error) {
      console.error(
        "Hiring Manager Dashboard Error:",
        error
      );

      setError(
        error.message ||
        "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ======================================================
  LOAD ON PAGE OPEN
  ======================================================
  */

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
  ======================================================
  DASHBOARD VALUES
  ======================================================
  */

  const totalJobs =
    dashboard?.totalJobs ??
    dashboard?.assignedJobs ??
    0;

  const openJobs =
    dashboard?.openJobs ??
    0;

  const totalApplications =
    dashboard?.totalApplications ??
    dashboard?.shortlistedCandidates ??
    0;

  const totalInterviews =
    dashboard?.totalInterviews ??
    dashboard?.upcomingInterviews ??
    0;

  const pendingDecisions =
    dashboard?.pendingDecisions ??
    0;

  const department =
    dashboard?.department ||
    "Hiring Department";


  /*
  ======================================================
  RENDER
  ======================================================
  */

  return (
    <div className="hiring-manager-layout">

      {/* SIDEBAR */}

      <HiringManagerSidebar />

      <div className="hiring-manager-main">

        {/* NAVBAR */}

        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="hiring-manager-dashboard-header">

            <p className="hiring-manager-label">
              HIRING MANAGER
            </p>

            <h1>
              Dashboard
            </h1>

            <p>
              Overview of recruitment activities,
              candidates and interview progress.
            </p>

          </div>


          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (

            <div className="hm-dashboard-message">

              <RefreshCw
                size={20}
                className="hm-dashboard-spinner"
              />

              <span>
                Loading dashboard...
              </span>

            </div>

          )}


          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (

            <div className="hm-dashboard-error">

              <div className="hm-dashboard-error-content">

                <AlertCircle size={20} />

                <div>
                  <strong>
                    Unable to load dashboard
                  </strong>

                  <p>
                    {error}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={loadDashboard}
              >
                <RefreshCw size={16} />
                Retry
              </button>

            </div>

          )}


          {/* ==================================================
              DASHBOARD CONTENT
          ================================================== */}

          {!loading && (

            <>

              {/* ==================================================
                  DEPARTMENT
              ================================================== */}

              <div className="hm-dashboard-department">

                <div>
                  <span>
                    Department
                  </span>

                  <strong>
                    {department}
                  </strong>
                </div>

                <span className="hm-dashboard-live">
                  Dashboard Overview
                </span>

              </div>


              {/* ==================================================
                  SUMMARY CARDS
              ================================================== */}

              <section className="hm-dashboard-stats-grid">

                {/* ASSIGNED JOBS */}

                <div className="hm-dashboard-stat-card">

                  <div className="hm-dashboard-stat-icon jobs">
                    <BriefcaseBusiness size={23} />
                  </div>

                  <div className="hm-dashboard-stat-content">

                    <span>
                      Assigned Jobs
                    </span>

                    <strong>
                      {totalJobs}
                    </strong>

                    <small>
                      {openJobs} currently open
                    </small>

                  </div>

                </div>


                {/* CANDIDATES */}

                <div className="hm-dashboard-stat-card">

                  <div className="hm-dashboard-stat-icon candidates">
                    <Users size={23} />
                  </div>

                  <div className="hm-dashboard-stat-content">

                    <span>
                      Candidates
                    </span>

                    <strong>
                      {totalApplications}
                    </strong>

                    <small>
                      Applications received
                    </small>

                  </div>

                </div>


                {/* INTERVIEWS */}

                <div className="hm-dashboard-stat-card">

                  <div className="hm-dashboard-stat-icon interviews">
                    <CalendarDays size={23} />
                  </div>

                  <div className="hm-dashboard-stat-content">

                    <span>
                      Interviews
                    </span>

                    <strong>
                      {totalInterviews}
                    </strong>

                    <small>
                      Interview records
                    </small>

                  </div>

                </div>


                {/* DECISIONS */}

                <div className="hm-dashboard-stat-card">

                  <div className="hm-dashboard-stat-icon decisions">
                    <CheckCircle size={23} />
                  </div>

                  <div className="hm-dashboard-stat-content">

                    <span>
                      Pending Decisions
                    </span>

                    <strong>
                      {pendingDecisions}
                    </strong>

                    <small>
                      Awaiting review
                    </small>

                  </div>

                </div>

              </section>


              {/* ==================================================
                  QUICK ACTIONS
              ================================================== */}

              <section className="hm-dashboard-section">

                <div className="hm-dashboard-section-header">

                  <div>
                    <h2>
                      Quick Actions
                    </h2>

                    <p>
                      Access your main hiring activities.
                    </p>
                  </div>

                </div>


                <div className="hm-dashboard-actions-grid">

                  {/* JOBS */}

                  <button
                    type="button"
                    className="hm-dashboard-action-card"
                    onClick={() =>
                      navigate(
                        "/hiring-manager/jobs"
                      )
                    }
                  >

                    <div className="hm-dashboard-action-icon">
                      <BriefcaseBusiness size={22} />
                    </div>

                    <div>

                      <strong>
                        Assigned Jobs
                      </strong>

                      <span>
                        Review your assigned positions.
                      </span>

                    </div>

                    <ArrowRight size={18} />

                  </button>


                  {/* CANDIDATES */}

                  <button
                    type="button"
                    className="hm-dashboard-action-card"
                    onClick={() =>
                      navigate(
                        "/hiring-manager/shortlisted-candidates"
                      )
                    }
                  >

                    <div className="hm-dashboard-action-icon">
                      <Users size={22} />
                    </div>

                    <div>

                      <strong>
                        Shortlisted Candidates
                      </strong>

                      <span>
                        Review shortlisted candidates.
                      </span>

                    </div>

                    <ArrowRight size={18} />

                  </button>


                  {/* INTERVIEWS */}

                  <button
                    type="button"
                    className="hm-dashboard-action-card"
                    onClick={() =>
                      navigate(
                        "/hiring-manager/interviews"
                      )
                    }
                  >

                    <div className="hm-dashboard-action-icon">
                      <CalendarDays size={22} />
                    </div>

                    <div>

                      <strong>
                        Interviews
                      </strong>

                      <span>
                        Monitor interview schedules.
                      </span>

                    </div>

                    <ArrowRight size={18} />

                  </button>


                  {/* DECISIONS */}

                  <button
                    type="button"
                    className="hm-dashboard-action-card"
                    onClick={() =>
                      navigate(
                        "/hiring-manager/decisions"
                      )
                    }
                  >

                    <div className="hm-dashboard-action-icon">
                      <CheckCircle size={22} />
                    </div>

                    <div>

                      <strong>
                        Candidate Decisions
                      </strong>

                      <span>
                        Review pending hiring decisions.
                      </span>

                    </div>

                    <ArrowRight size={18} />

                  </button>

                </div>

              </section>


              {/* ==================================================
                  RECRUITMENT OVERVIEW
              ================================================== */}

              <section className="hm-dashboard-overview-grid">

                {/* JOB OVERVIEW */}

                <div className="hm-dashboard-panel">

                  <div className="hm-dashboard-panel-header">

                    <div>
                      <h2>
                        Recruitment Overview
                      </h2>

                      <p>
                        Current recruitment activity.
                      </p>
                    </div>

                    <FileText size={21} />

                  </div>


                  <div className="hm-dashboard-overview-item">

                    <div className="hm-dashboard-overview-left">

                      <BriefcaseBusiness size={18} />

                      <span>
                        Total Jobs
                      </span>

                    </div>

                    <strong>
                      {totalJobs}
                    </strong>

                  </div>


                  <div className="hm-dashboard-overview-item">

                    <div className="hm-dashboard-overview-left">

                      <CheckCircle size={18} />

                      <span>
                        Open Jobs
                      </span>

                    </div>

                    <strong>
                      {openJobs}
                    </strong>

                  </div>


                  <div className="hm-dashboard-overview-item">

                    <div className="hm-dashboard-overview-left">

                      <Users size={18} />

                      <span>
                        Applications
                      </span>

                    </div>

                    <strong>
                      {totalApplications}
                    </strong>

                  </div>


                  <div className="hm-dashboard-overview-item">

                    <div className="hm-dashboard-overview-left">

                      <CalendarDays size={18} />

                      <span>
                        Interviews
                      </span>

                    </div>

                    <strong>
                      {totalInterviews}
                    </strong>

                  </div>

                </div>


                {/* NEXT STEPS */}

                <div className="hm-dashboard-panel">

                  <div className="hm-dashboard-panel-header">

                    <div>
                      <h2>
                        Hiring Workflow
                      </h2>

                      <p>
                        Continue with your recruitment process.
                      </p>
                    </div>

                    <Clock size={21} />

                  </div>


                  <button
                    type="button"
                    className="hm-dashboard-workflow-item"
                    onClick={() =>
                      navigate(
                        "/hiring-manager/shortlisted-candidates"
                      )
                    }
                  >

                    <span className="workflow-number">
                      1
                    </span>

                    <div>

                      <strong>
                        Review Candidates
                      </strong>

                      <span>
                        Check shortlisted candidate profiles
                        and AI matching results.
                      </span>

                    </div>

                    <ArrowRight size={17} />

                  </button>


                  <button
                    type="button"
                    className="hm-dashboard-workflow-item"
                    onClick={() =>
                      navigate(
                        "/hiring-manager/interviews"
                      )
                    }
                  >

                    <span className="workflow-number">
                      2
                    </span>

                    <div>

                      <strong>
                        Review Interviews
                      </strong>

                      <span>
                        Monitor interview schedules and
                        completed interviews.
                      </span>

                    </div>

                    <ArrowRight size={17} />

                  </button>


                  <button
                    type="button"
                    className="hm-dashboard-workflow-item"
                    onClick={() =>
                      navigate(
                        "/hiring-manager/decisions"
                      )
                    }
                  >

                    <span className="workflow-number">
                      3
                    </span>

                    <div>

                      <strong>
                        Make Decisions
                      </strong>

                      <span>
                        Approve or reject candidates after
                        reviewing their results.
                      </span>

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