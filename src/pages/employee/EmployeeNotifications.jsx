import React, { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";

import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/employeeService";
// This file lives at src/pages/employee/EmployeeNotifications.jsx, so
// services at src/services/ is two levels up.

import "./EmployeeNotifications.css";

function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyNotifications();

      // Backend wraps responses as ApiResponse<List<Notification>>
      // (per the Swagger schema ApiResponseListNotification), so the
      // real array usually sits under response.data.data. Confirm the
      // exact field names below (title/message/read/createdAt) against
      // the Notification schema in Swagger and adjust if they differ.
      const list = response.data?.data || response.data || [];

      const mapped = list.map((n) => ({
        id: n.id,
        title: n.title || n.subject || "Notification",
        message: n.message || n.description || "",
        time: n.createdAt || n.time || "",
        type: n.type || "general",
        unread: n.read === false || n.unread === true,
      }));

      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError("Unable to load notifications right now.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    // Optimistic update, rolled back if the request fails
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, unread: true }
            : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    const previous = notifications;

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false }))
    );

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
      setNotifications(previous);
    }
  };

  // No DELETE endpoint exists on the backend for notifications yet.
  // This only removes the item from the current view — it will
  // reappear on next fetch until a delete endpoint is added.
  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
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
                  className={filter === "all" ? "active" : ""}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>

                <button
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
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="empty-notifications">
                  <Bell size={42} />
                  <h3>No notifications</h3>
                  <p>You don't have any unread notifications.</p>
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
                          <span className="unread-dot"></span>
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <span className="notification-time">
                        {notification.time}
                      </span>
                    </div>

                    <div className="notification-actions">
                      {notification.unread && (
                        <button
                          title="Mark as read"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check size={18} />
                        </button>
                      )}

                      <button
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
