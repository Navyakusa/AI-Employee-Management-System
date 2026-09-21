import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  UserPlus,
  ShieldCheck,
  Building2,
  BriefcaseBusiness,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

import "./AdminNotifications.css";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // FETCH NOTIFICATIONS
  // ==============================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/notifications/my",
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
          `Failed to fetch notifications: ${response.status}`
        );
      }

      const result = await response.json();

      console.log("Notifications response:", result);

      if (result.success && Array.isArray(result.data)) {
        setNotifications(result.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Notification fetch error:", error);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ==============================
  // MARK ONE AS READ
  // ==============================

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark notification as read: ${response.status}`
        );
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === notificationId
            ? {
                ...notification,
                readStatus: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  // ==============================
  // MARK ALL AS READ
  // ==============================

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark all as read: ${response.status}`
        );
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          readStatus: true,
        }))
      );
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  };

  // ==============================
  // FILTER
  // ==============================

  const filteredNotifications = useMemo(() => {
    if (filter === "Unread") {
      return notifications.filter(
        (notification) => !notification.readStatus
      );
    }

    if (filter === "Read") {
      return notifications.filter(
        (notification) => notification.readStatus
      );
    }

    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(
    (notification) => !notification.readStatus
  ).length;

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) {
      return "";
    }

    return new Date(createdAt).toLocaleString();
  };

  const getNotificationIcon = (type) => {
    const value = (type || "").toLowerCase();

    if (value.includes("user")) {
      return <UserPlus size={19} />;
    }

    if (value.includes("role")) {
      return <ShieldCheck size={19} />;
    }

    if (value.includes("department")) {
      return <Building2 size={19} />;
    }

    if (
      value.includes("recruitment") ||
      value.includes("interview") ||
      value.includes("application")
    ) {
      return <BriefcaseBusiness size={19} />;
    }

    return <Bell size={19} />;
  };

  return (
    <div className="admin-notifications-layout">
      <AdminSidebar />

      <div className="admin-notifications-main">
        <AdminNavbar />

        <main className="admin-notifications-content">
          <div className="admin-notifications-header">
            <div>
              <p>NOTIFICATIONS</p>

              <h1>Notifications</h1>

              <span>
                View important platform and administrative
                updates.
              </span>
            </div>

            <button
              className="admin-mark-all-btn"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={17} />
              Mark All as Read
            </button>
          </div>

          <div className="admin-notification-summary">
            <div className="admin-notification-summary-card">
              <div className="admin-notification-summary-icon">
                <Bell size={21} />
              </div>

              <div>
                <span>Total Notifications</span>
                <strong>{notifications.length}</strong>
              </div>
            </div>

            <div className="admin-notification-summary-card">
              <div className="admin-notification-summary-icon">
                <Bell size={21} />
              </div>

              <div>
                <span>Unread</span>
                <strong>{unreadCount}</strong>
              </div>
            </div>
          </div>

          <section className="admin-notifications-card">
            <div className="admin-notifications-toolbar">
              <div>
                <h2>Recent Notifications</h2>

                <p>
                  Administrative and system activity.
                </p>
              </div>

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
              >
                <option value="All">All</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
              </select>
            </div>

            <div className="admin-notifications-list">

              {loading && (
                <div className="admin-notifications-empty">
                  Loading notifications...
                </div>
              )}

              {!loading && error && (
                <div className="admin-notifications-empty">
                  {error}
                </div>
              )}

              {!loading &&
              !error &&
              filteredNotifications.length > 0 ? (
                filteredNotifications.map(
                  (notification) => (
                    <div
                      className={`admin-notification-item ${
                        notification.readStatus
                          ? "read"
                          : "unread"
                      }`}
                      key={notification.notificationId}
                    >
                      <div className="admin-notification-icon">
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      <div className="admin-notification-info">

                        <div className="admin-notification-title-row">
                          <h3>
                            {notification.type
                              ?.replaceAll("_", " ")
                              .toLowerCase()
                              .replace(
                                /\b\w/g,
                                (letter) =>
                                  letter.toUpperCase()
                              ) || "Notification"}
                          </h3>

                          {!notification.readStatus && (
                            <span className="admin-unread-dot" />
                          )}
                        </div>

                        <p>
                          {notification.message}
                        </p>

                        <span className="admin-notification-time">
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                        </span>

                      </div>

                      {!notification.readStatus && (
                        <button
                          className="admin-mark-read-btn"
                          onClick={() =>
                            markAsRead(
                              notification.notificationId
                            )
                          }
                        >
                          Mark as Read
                        </button>
                      )}

                    </div>
                  )
                )
              ) : (
                !loading &&
                !error && (
                  <div className="admin-notifications-empty">
                    <Bell size={30} />

                    <h3>
                      No notifications found
                    </h3>

                    <p>
                      There are no notifications for the
                      selected filter.
                    </p>
                  </div>
                )
              )}

            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminNotifications;