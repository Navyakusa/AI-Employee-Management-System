import { useEffect, useState } from "react";
import {
  Users,
  BriefcaseBusiness,
  ClipboardList,
  CalendarCheck,
  Clock3,
  ArrowUpRight,
  Activity,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

import apiClient from "../../services/apiClient";

function AdminDashboard() {
  const navigate = useNavigate();


  // ============================================================
  // DASHBOARD SUMMARY
  // ============================================================

  const [dashboardSummary, setDashboardSummary] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    totalInterviews: 0,
    pendingApplications: 0,
  });

  const [summaryLoading, setSummaryLoading] = useState(true);

  // ============================================================
  // RECENT USERS FROM BACKEND
  // ============================================================

  const [recentUsers, setRecentUsers] = useState([]);
  
  const [recentUsersLoading, setRecentUsersLoading] =
    useState(true);
    const [recentActivities, setRecentActivities] =
  useState([]);

const [recentActivitiesLoading, setRecentActivitiesLoading] =
  useState(true);


  // ============================================================
  // FETCH DASHBOARD SUMMARY
  // ============================================================

  useEffect(() => {
  const fetchDashboardSummary = async () => {
    try {
      const response = await apiClient.get(
        "/dashboard/summary"
      );

      const result = response.data;

      if (result.success && result.data) {
        setDashboardSummary(result.data);
      }
    } catch (error) {
      console.error(
        "Dashboard summary error:",
        error
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  fetchDashboardSummary();
}, []);
  // ============================================================
  // FETCH RECENT USERS
  // GET /api/admin/users
  // ============================================================

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        setRecentUsersLoading(true);

        const response = await apiClient.get(
          "/admin/users"
        );

        console.log(
          "Recent Users backend response:",
          response.data
        );

        if (
          response.data?.success &&
          Array.isArray(response.data.data)
        ) {
          const formattedUsers = response.data.data.map(
            (user) => ({
              id: user.userId ?? user.id,

              name:
                user.userName ??
                user.name ??
                "",

              email: user.email ?? "",

              role: user.role ?? "Not Assigned",

              status:
                typeof user.active === "boolean"
                  ? user.active
                    ? "Active"
                    : "Inactive"
                  : "Inactive",
            })
          );

          // Show only 4 users in dashboard
          const latestUsers = formattedUsers
  .sort((a, b) => b.id - a.id)
  .slice(0, 4);

setRecentUsers(latestUsers);
        } else {
          setRecentUsers([]);
        }
      } catch (error) {
        console.error(
          "Recent Users Error:",
          error.response?.data ||
            error.message
        );

        setRecentUsers([]);
      } finally {
        setRecentUsersLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);
  // ============================================================
// FETCH RECENT ACTIVITY
// GET /api/audit-logs/all
// ============================================================

useEffect(() => {
  const fetchRecentActivities = async () => {
    try {
      setRecentActivitiesLoading(true);

      const response = await apiClient.get(
        "/audit-logs/all"
      );

      console.log(
        "Recent Activity backend response:",
        response.data
      );

      if (Array.isArray(response.data)) {
        const latestActivities = [...response.data]
          .sort(
            (a, b) =>
              new Date(b.dateTime) -
              new Date(a.dateTime)
          )
          .slice(0, 5)
          .map((log) => ({
            id: log.id,

            message:
              log.details ||
              `${log.action} - ${log.module}`,

            time: log.dateTime
              ? new Date(
                  log.dateTime
                ).toLocaleString()
              : "",
          }));

        setRecentActivities(
          latestActivities
        );
      } else {
        setRecentActivities([]);
      }
    } catch (error) {
      console.error(
        "Recent Activity Error:",
        error.response?.data ||
          error.message
      );

      setRecentActivities([]);
    } finally {
      setRecentActivitiesLoading(false);
    }
  };

  fetchRecentActivities();
}, []);

  // ============================================================
  // DASHBOARD CARDS
  // ============================================================

  const stats = [
    {
      title: "Total Jobs",
      value: summaryLoading
        ? "..."
        : dashboardSummary.totalJobs,
      description: "All recruitment jobs",
      icon: <BriefcaseBusiness size={24} />,
    },
    {
      title: "Active Jobs",
      value: summaryLoading
        ? "..."
        : dashboardSummary.activeJobs,
      description: "Currently active jobs",
      icon: <BriefcaseBusiness size={24} />,
    },
    {
      title: "Total Candidates",
      value: summaryLoading
        ? "..."
        : dashboardSummary.totalCandidates,
      description: "Registered candidates",
      icon: <Users size={24} />,
    },
    {
      title: "Total Applications",
      value: summaryLoading
        ? "..."
        : dashboardSummary.totalApplications,
      description: "Candidate applications",
      icon: <ClipboardList size={24} />,
    },
    {
      title: "Total Interviews",
      value: summaryLoading
        ? "..."
        : dashboardSummary.totalInterviews,
      description: "Interview records",
      icon: <CalendarCheck size={24} />,
    },
    {
      title: "Pending Applications",
      value: summaryLoading
        ? "..."
        : dashboardSummary.pendingApplications,
      description: "Waiting for review",
      icon: <Clock3 size={24} />,
    },
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <AdminNavbar />

        <main className="admin-content">
          <div className="admin-page-header">
            <div>
              <p className="admin-page-label">
                OVERVIEW
              </p>

              <h1>Super Admin Dashboard</h1>

              <p>
                Manage your organization, users and platform settings.
              </p>
            </div>

            <div className="admin-header-date">
              Platform Overview
            </div>
          </div>

          <section className="admin-stats-grid">
            {stats.map((stat) => (
              <div
                className="admin-stat-card"
                key={stat.title}
              >
                <div className="admin-stat-card-top">
                  <div className="admin-stat-icon">
                    {stat.icon}
                  </div>

                  <ArrowUpRight size={18} />
                </div>

                <p>{stat.title}</p>

                <h2>{stat.value}</h2>

                <span>
                  {stat.description}
                </span>
              </div>
            ))}
          </section>

          <section className="admin-dashboard-grid">
            <div className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Recent Users</h2>

                  <p>
                    Recently added platform users
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate("/super-admin/users")
                  }
                >
                  View All
                </button>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentUsersLoading ? (
                      <tr>
                        <td colSpan="3">
                          Loading users...
                        </td>
                      </tr>
                    ) : recentUsers.length > 0 ? (
                      recentUsers.map((user) => (
                        <tr
                          key={
                            user.id ??
                            user.email
                          }
                        >
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-user-avatar">
                                {(user.name || "U")
                                  .split(" ")
                                  .filter(Boolean)
                                  .map(
                                    (word) =>
                                      word[0]
                                  )
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {user.name}
                                </strong>

                                <span>
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            {user.role}
                          </td>

                          <td>
                            <span
                              className={
                                user.status ===
                                "Active"
                                  ? "admin-status active"
                                  : "admin-status inactive"
                              }
                            >
                              {user.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">
                          No users available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Recent Activity</h2>

                  <p>
                    Latest administrative actions
                  </p>
                </div>

                <Activity size={20} />
              </div>

          <div className="admin-activity-list">
  {recentActivitiesLoading ? (
    <p>Loading recent activity...</p>
  ) : recentActivities.length > 0 ? (
    recentActivities.map((activity) => (
      <div
        className="admin-activity-item"
        key={activity.id}
      >
        <div className="admin-activity-dot"></div>

        <div>
          <strong>
            {activity.message}
          </strong>

          <span>
            {activity.time}
          </span>
        </div>
      </div>
    ))
  ) : (
    <p>No recent activity.</p>
  )}
</div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;