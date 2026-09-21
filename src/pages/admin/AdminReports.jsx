import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Building2,
  BriefcaseBusiness,
  Clock3,
  BarChart3,
  CalendarCheck,
  ClipboardList,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

import "./AdminReports.css";

function AdminReports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
            "/api/reports/analytics",
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
        );

        if (!response.ok) {
          throw new Error(
              `Analytics request failed: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success && result.data) {
          setAnalytics(result.data);
        } else {
          throw new Error(
              result.message || "Unable to fetch analytics"
          );
        }
      } catch (error) {
        console.error("Analytics error:", error);

        setError(
            "Unable to load analytics data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatLabel = (value) => {
    if (!value) {
      return "";
    }

    return value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) {
      return "0%";
    }

    return `${Number(value).toFixed(2)}%`;
  };

  const formatMonth = (monthValue) => {
    if (!monthValue) {
      return "";
    }

    const [year, month] = monthValue.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1
    );

    return date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const roleDistribution =
      analytics?.roleDistribution || {};

  const departmentStatusDistribution =
      analytics?.departmentStatusDistribution || {};

  const jobsByDepartment =
      analytics?.jobsByDepartment || {};

  const jobStatusDistribution =
      analytics?.jobStatusDistribution || {};

  const applicationStatusDistribution =
      analytics?.applicationStatusDistribution || {};

  const interviewStatusDistribution =
      analytics?.interviewStatusDistribution || {};

  const applicationTrends =
      analytics?.applicationTrends || {};

  const interviewTrends =
      analytics?.interviewTrends || {};

  const jobTrends =
      analytics?.jobTrends || {};

  const employeeCount =
      roleDistribution.EMPLOYEE || 0;

  const recruitmentReports = [
    {
      name: "Total Applications",
      value: analytics?.totalApplications ?? 0,
    },
    {
      name: "Total Interviews",
      value: analytics?.totalInterviews ?? 0,
    },
    {
      name: "Applications / Job",
      value:
          analytics?.applicationsPerJob ?? 0,
    },
    {
      name: "Application → Interview",
      value: formatPercentage(
          analytics?.applicationToInterviewRate
      ),
    },
    {
      name: "Selection Rate",
      value: formatPercentage(
          analytics?.selectionRate
      ),
    },
    {
      name: "Rejection Rate",
      value: formatPercentage(
          analytics?.rejectionRate
      ),
    },
    {
      name: "Withdrawal Rate",
      value: formatPercentage(
          analytics?.withdrawalRate
      ),
    },
    {
      name: "Interview Completion",
      value: formatPercentage(
          analytics?.interviewCompletionRate
      ),
    },
    {
      name: "Interview Cancellation",
      value: formatPercentage(
          analytics?.interviewCancellationRate
      ),
    },
  ];

  if (loading) {
    return (
        <div className="admin-reports-layout">
          <AdminSidebar />

          <div className="admin-reports-main">
            <AdminNavbar />

            <main className="admin-reports-content">
              <div className="admin-report-state">
                <BarChart3 size={30} />

                <h2>Loading analytics...</h2>

                <p>
                  Fetching organization and recruitment
                  reports.
                </p>
              </div>
            </main>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="admin-reports-layout">
          <AdminSidebar />

          <div className="admin-reports-main">
            <AdminNavbar />

            <main className="admin-reports-content">
              <div className="admin-report-state error">
                <BarChart3 size={30} />

                <h2>Analytics unavailable</h2>

                <p>{error}</p>
              </div>
            </main>
          </div>
        </div>
    );
  }

  return (
      <div className="admin-reports-layout">
        <AdminSidebar />

        <div className="admin-reports-main">
          <AdminNavbar />

          <main className="admin-reports-content">
            <div className="admin-reports-header">
              <div>
                <p>ANALYTICS & REPORTING</p>

                <h1>Reports</h1>

                <span>
                View organization, department and
                recruitment analytics.
              </span>
              </div>
            </div>

            {/* OVERVIEW */}

            <div className="admin-report-stats">
              <div className="admin-report-stat-card">
                <div className="admin-report-stat-icon">
                  <Users size={22} />
                </div>

                <div>
                  <span>Total Users</span>

                  <strong>
                    {analytics?.totalUsers ?? 0}
                  </strong>
                </div>
              </div>

              <div className="admin-report-stat-card">
                <div className="admin-report-stat-icon">
                  <UserCheck size={22} />
                </div>

                <div>
                  <span>Active Users</span>

                  <strong>
                    {analytics?.activeUsers ?? 0}
                  </strong>
                </div>
              </div>

              <div className="admin-report-stat-card">
                <div className="admin-report-stat-icon">
                  <Users size={22} />
                </div>

                <div>
                  <span>Employees</span>

                  <strong>{employeeCount}</strong>
                </div>
              </div>

              <div className="admin-report-stat-card">
                <div className="admin-report-stat-icon">
                  <Building2 size={22} />
                </div>

                <div>
                  <span>Departments</span>

                  <strong>
                    {analytics?.totalDepartments ?? 0}
                  </strong>
                </div>
              </div>

              <div className="admin-report-stat-card">
                <div className="admin-report-stat-icon">
                  <BriefcaseBusiness size={22} />
                </div>

                <div>
                  <span>Total Jobs</span>

                  <strong>
                    {analytics?.totalJobs ?? 0}
                  </strong>
                </div>
              </div>

              <div className="admin-report-stat-card">
                <div className="admin-report-stat-icon">
                  <ClipboardList size={22} />
                </div>

                <div>
                  <span>Applications</span>

                  <strong>
                    {analytics?.totalApplications ?? 0}
                  </strong>
                </div>
              </div>

              <div className="admin-report-stat-card">
                <div className="admin-report-stat-icon">
                  <CalendarCheck size={22} />
                </div>

                <div>
                  <span>Interviews</span>

                  <strong>
                    {analytics?.totalInterviews ?? 0}
                  </strong>
                </div>
              </div>
            </div>

            {/* DISTRIBUTIONS */}

            <div className="admin-report-grid">
              <section className="admin-report-card">
                <div className="admin-report-card-header">
                  <div>
                    <h2>Role Distribution</h2>

                    <p>
                      Number of users assigned to each
                      system role.
                    </p>
                  </div>

                  <Users size={20} />
                </div>

                <div className="admin-report-list">
                  {Object.entries(
                      roleDistribution
                  ).map(([role, count]) => (
                      <div
                          className="admin-report-list-item"
                          key={role}
                      >
                    <span>
                      {formatLabel(role)}
                    </span>

                        <strong>{count}</strong>
                      </div>
                  ))}

                  {Object.keys(roleDistribution)
                      .length === 0 && (
                      <div className="admin-report-empty">
                        No role data available.
                      </div>
                  )}
                </div>
              </section>

              <section className="admin-report-card">
                <div className="admin-report-card-header">
                  <div>
                    <h2>
                      Department Status
                    </h2>

                    <p>
                      Department status distribution.
                    </p>
                  </div>

                  <Building2 size={20} />
                </div>

                <div className="admin-report-list">
                  {Object.entries(
                      departmentStatusDistribution
                  ).map(([status, count]) => (
                      <div
                          className="admin-report-list-item"
                          key={status}
                      >
                    <span>
                      {formatLabel(status)}
                    </span>

                        <strong>{count}</strong>
                      </div>
                  ))}

                  {Object.keys(
                      departmentStatusDistribution
                  ).length === 0 && (
                      <div className="admin-report-empty">
                        No department data available.
                      </div>
                  )}
                </div>
              </section>
            </div>

            {/* JOBS BY DEPARTMENT */}

            <div className="admin-report-grid">
              <section className="admin-report-card">
                <div className="admin-report-card-header">
                  <div>
                    <h2>Jobs by Department</h2>

                    <p>
                      Job openings grouped by
                      department.
                    </p>
                  </div>

                  <BriefcaseBusiness size={20} />
                </div>

                <div className="admin-report-list">
                  {Object.entries(
                      jobsByDepartment
                  ).map(([department, count]) => (
                      <div
                          className="admin-report-list-item"
                          key={department}
                      >
                        <span>{department}</span>

                        <strong>{count}</strong>
                      </div>
                  ))}

                  {Object.keys(jobsByDepartment)
                      .length === 0 && (
                      <div className="admin-report-empty">
                        No department job data available.
                      </div>
                  )}
                </div>
              </section>

              <section className="admin-report-card">
                <div className="admin-report-card-header">
                  <div>
                    <h2>Job Status</h2>

                    <p>
                      Jobs grouped by current status.
                    </p>
                  </div>

                  <BriefcaseBusiness size={20} />
                </div>

                <div className="admin-report-list">
                  {Object.entries(
                      jobStatusDistribution
                  ).map(([status, count]) => (
                      <div
                          className="admin-report-list-item"
                          key={status}
                      >
                    <span>
                      {formatLabel(status)}
                    </span>

                        <strong>{count}</strong>
                      </div>
                  ))}

                  {Object.keys(
                      jobStatusDistribution
                  ).length === 0 && (
                      <div className="admin-report-empty">
                        No job status data available.
                      </div>
                  )}
                </div>
              </section>
            </div>

            {/* APPLICATION / INTERVIEW STATUS */}

            <div className="admin-report-grid">
              <section className="admin-report-card">
                <div className="admin-report-card-header">
                  <div>
                    <h2>Application Pipeline</h2>

                    <p>
                      Applications grouped by current
                      hiring status.
                    </p>
                  </div>

                  <ClipboardList size={20} />
                </div>

                <div className="admin-report-list">
                  {Object.entries(
                      applicationStatusDistribution
                  ).map(([status, count]) => (
                      <div
                          className="admin-report-list-item"
                          key={status}
                      >
                    <span>
                      {formatLabel(status)}
                    </span>

                        <strong>{count}</strong>
                      </div>
                  ))}

                  {Object.keys(
                      applicationStatusDistribution
                  ).length === 0 && (
                      <div className="admin-report-empty">
                        No application data available.
                      </div>
                  )}
                </div>
              </section>

              <section className="admin-report-card">
                <div className="admin-report-card-header">
                  <div>
                    <h2>Interview Status</h2>

                    <p>
                      Interviews grouped by scheduling
                      status.
                    </p>
                  </div>

                  <CalendarCheck size={20} />
                </div>

                <div className="admin-report-list">
                  {Object.entries(
                      interviewStatusDistribution
                  ).map(([status, count]) => (
                      <div
                          className="admin-report-list-item"
                          key={status}
                      >
                    <span>
                      {formatLabel(status)}
                    </span>

                        <strong>{count}</strong>
                      </div>
                  ))}

                  {Object.keys(
                      interviewStatusDistribution
                  ).length === 0 && (
                      <div className="admin-report-empty">
                        No interview data available.
                      </div>
                  )}
                </div>
              </section>
            </div>

            {/* RECRUITMENT KPI */}

            <section className="admin-recruitment-report-card">
              <div className="admin-report-card-header">
                <div>
                  <h2>Recruitment Analytics</h2>

                  <p>
                    Live recruitment performance
                    metrics from the backend.
                  </p>
                </div>

                <BriefcaseBusiness size={22} />
              </div>

              <div className="admin-recruitment-report-grid">
                {recruitmentReports.map(
                    (report) => (
                        <div
                            className="admin-recruitment-report-item"
                            key={report.name}
                        >
                          <div>
                      <span>
                        {report.name}
                      </span>

                            <strong>
                              {report.value}
                            </strong>
                          </div>
                        </div>
                    )
                )}
              </div>
            </section>

            {/* TRENDS */}

            <section className="admin-recruitment-report-card admin-report-trend-section">
              <div className="admin-report-card-header">
                <div>
                  <h2>Monthly Trends</h2>

                  <p>
                    Monthly job, application and
                    interview activity.
                  </p>
                </div>

                <BarChart3 size={22} />
              </div>

              <div className="admin-report-trend-grid">
                <div className="admin-report-trend-card">
                  <h3>Applications</h3>

                  {Object.entries(
                      applicationTrends
                  ).map(([month, count]) => (
                      <div
                          className="admin-report-trend-row"
                          key={month}
                      >
                    <span>
                      {formatMonth(month)}
                    </span>

                        <strong>{count}</strong>
                      </div>
                  ))}

                  {Object.keys(applicationTrends)
                      .length === 0 && (
                      <p className="admin-report-empty">
                        No application trend data.
                      </p>
                  )}
                </div>

                <div className="admin-report-trend-card">
                  <h3>Interviews</h3>

                  {Object.entries(
                      interviewTrends
                  ).map(([month, count]) => (
                      <div
                          className="admin-report-trend-row"
                          key={month}
                      >
                    <span>
                      {formatMonth(month)}
                    </span>

                        <strong>{count}</strong>
                      </div>
                  ))}

                  {Object.keys(interviewTrends)
                      .length === 0 && (
                      <p className="admin-report-empty">
                        No interview trend data.
                      </p>
                  )}
                </div>

                <div className="admin-report-trend-card">
                  <h3>Jobs</h3>

                  {Object.entries(
                      jobTrends
                  ).map(([month, count]) => (
                      <div
                          className="admin-report-trend-row"
                          key={month}
                      >
                    <span>
                      {formatMonth(month)}
                    </span>

                        <strong>{count}</strong>
                      </div>
                  ))}

                  {Object.keys(jobTrends)
                      .length === 0 && (
                      <p className="admin-report-empty">
                        No job trend data.
                      </p>
                  )}
                </div>
              </div>
            </section>

            {/* NOT YET SUPPORTED */}

            <section className="admin-recruitment-report-card admin-report-future-card">
              <div className="admin-report-card-header">
                <div>
                  <h2>Employee Analytics</h2>

                  <p>
                    Workforce analytics requiring
                    employee-specific data.
                  </p>
                </div>

                <Users size={22} />
              </div>

              <div className="admin-employee-analysis-grid">
                {[
                  "Employee Distribution",
                  "Attendance",
                  "Leave",
                  "Performance",
                  "Attrition Trends",
                ].map((item) => (
                    <div
                        className="admin-employee-analysis-item"
                        key={item}
                    >
                      <div>
                        <span>{item}</span>

                        <strong>—</strong>
                      </div>

                      <div className="admin-report-not-connected">
                        <Clock3 size={14} />
                        Not connected yet
                      </div>
                    </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
  );
}

export default AdminReports;