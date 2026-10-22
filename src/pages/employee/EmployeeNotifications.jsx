
import React, { useEffect, useState, useCallback } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";

import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/employeeService";

import "./EmployeeNotifications.css";

function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyNotifications();
      const payload = response.data?.data ?? [];

      if (!Array.isArray(payload)) {
        throw new Error("Invalid notifications response");
      }

      const mapped = payload.map((notification) => ({
        id: notification.notificationId,
        title: notification.title || "Notification",
        message: notification.message || "",
        time: notification.createdAt || "",
        type: notification.type || "general",
        unread: notification.readStatus === false ||
          notification.readStatus == null,
      }));

      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError("Unable to load notifications right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const notifyTopbar = () => {
    window.dispatchEvent(
      new Event("employee-notifications-changed")
    );
  };

  const markAsRead = async (id) => {
    const previous = notifications;

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );

    try {
      await markNotificationAsRead(id);
      notifyTopbar();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      setNotifications(previous);
      setError("Could not mark the notification as read.");
    }
  };

  const markAllAsRead = async () => {
    const previous = notifications;

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );

    try {
      await markAllNotificationsAsRead();
      notifyTopbar();
      await fetchNotifications();
      notifyTopbar();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
      setNotifications(previous);
      setError("Could not mark all notifications as read.");
    }
  };

  // The backend DELETE endpoint exists, so delete the record there too.
  const deleteNotification = async (id) => {
    try {
      const { deleteEmployeeNotification } = await import(
        "../../services/employeeService"
      );

      await deleteEmployeeNotification(id);

      setNotifications((current) =>
        current.filter((notification) => notification.id !== id)
      );

      notifyTopbar();
    } catch (err) {
      console.error("Failed to delete notification", err);
      setError("Could not delete the notification.");
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((notification) => notification.unread)
      : notifications;

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <div className="employee-layout">
      <EmployeeSidebar />

      <div className="employee-main">
        <EmployeeTopbar />

        <main className="notifications-page">
          <div className="notifications-header">
            <div>
              <h1>Notifications</h1>
              <p>Stay updated with your employee activities.</p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-btn"
                onClick={markAllAsRead}
              >
                <CheckCheck size={17} />
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-summary">
            <div className="notification-count-card">
              <div className="notification-icon">
                <Bell size={22} />
              </div>
              <div>
                <span>Total Notifications</span>
                <strong>{notifications.length}</strong>
              </div>
            </div>

            <div className="notification-count-card">
              <div className="notification-icon unread-icon">
                <Bell size={22} />
              </div>
              <div>
                <span>Unread Notifications</span>
                <strong>{unreadCount}</strong>
              </div>
            </div>
          </div>

          <div className="notification-content">
            <div className="notification-toolbar">
              <h2>Recent Notifications</h2>

              <div className="notification-filters">
                <button
                  type="button"
                  className={filter === "all" ? "active" : ""}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>

                <button
                  type="button"
                  className={filter === "unread" ? "active" : ""}
                  onClick={() => setFilter("unread")}
                >
                  Unread
                </button>
              </div>
            </div>

            <div className="notification-list">
              {loading ? (
                <div className="empty-notifications">
                  <Bell size={42} />
                  <h3>Loading notifications...</h3>
                </div>
              ) : error ? (
                <div className="empty-notifications">
                  <Bell size={42} />
                  <h3>Something went wrong</h3>
                  <p>{error}</p>
                  <button type="button" onClick={fetchNotifications}>
                    Try again
                  </button>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="empty-notifications">
                  <Bell size={42} />
                  <h3>No notifications</h3>
                  <p>
                    {filter === "unread"
                      ? "You don't have any unread notifications."
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      notification.unread ? "unread" : ""
                    }`}
                  >
                    <div className="notification-item-icon">
                      <Bell size={20} />
                    </div>

                    <div className="notification-details">
                      <div className="notification-title-row">
                        <h3>{notification.title}</h3>
                        {notification.unread && (
                          <span className="unread-dot" />
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <span className="notification-time">
                        {notification.time
                          ? new Date(notification.time).toLocaleString()
                          : ""}
                      </span>
                    </div>

                    <div className="notification-actions">
                      {notification.unread && (
                        <button
                          type="button"
                          title="Mark as read"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check size={18} />
                        </button>
                      )}

                      <button
                        type="button"
                        title="Delete"
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmployeeNotifications;
