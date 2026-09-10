import { useMemo, useState } from "react";
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
import { useAdmin } from "../../context/AdminContext";

import "./AdminNotifications.css";

function AdminNotifications() {
  const {
    notifications,
    setNotifications,
  } = useAdmin();

  const [filter, setFilter] = useState("All");

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) {
      return "";
    }

    return new Date(timestamp).toLocaleString();
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "Unread") {
      return notifications.filter(
        (notification) => !notification.read
      );
    }

    if (filter === "Read") {
      return notifications.filter(
        (notification) => notification.read
      );
    }

    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const getNotificationIcon = (type) => {
    if (type === "user") {
      return <UserPlus size={19} />;
    }

    if (type === "role") {
      return <ShieldCheck size={19} />;
    }

    if (type === "department") {
      return <Building2 size={19} />;
    }

    if (type === "recruitment") {
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
                <option value="All">
                  All
                </option>

                <option value="Unread">
                  Unread
                </option>

                <option value="Read">
                  Read
                </option>
              </select>
            </div>

            <div className="admin-notifications-list">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(
                  (notification) => (
                    <div
                      className={`admin-notification-item ${
                        notification.read
                          ? "read"
                          : "unread"
                      }`}
                      key={notification.id}
                    >
                      <div className="admin-notification-icon">
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      <div className="admin-notification-info">
                        <div className="admin-notification-title-row">
                          <h3>
                            {notification.title}
                          </h3>

                          {!notification.read && (
                            <span className="admin-unread-dot" />
                          )}
                        </div>

                        <p>
                          {notification.message}
                        </p>

                        <span className="admin-notification-time">
                          {formatNotificationTime(
                            notification.timestamp
                          )}
                        </span>
                      </div>

                      {!notification.read && (
                        <button
                          className="admin-mark-read-btn"
                          onClick={() =>
                            markAsRead(
                              notification.id
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
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminNotifications;