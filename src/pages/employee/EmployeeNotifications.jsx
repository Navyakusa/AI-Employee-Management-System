import React, { useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";

import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";

import "./EmployeeNotifications.css";

const initialNotifications = [
  {
    id: 1,
    title: "Leave Request Approved",
    message: "Your leave request has been approved by your manager.",
    time: "Today, 10:30 AM",
    type: "leave",
    unread: true,
  },
  {
    id: 2,
    title: "Leave Request Rejected",
    message: "Your leave request has been rejected. Please check the leave details.",
    time: "Yesterday, 4:15 PM",
    type: "leave",
    unread: true,
  },
  {
    id: 3,
    title: "Document Verification Completed",
    message: "Your submitted document has been verified successfully.",
    time: "12 Sep 2026",
    type: "document",
    unread: false,
  },
  {
    id: 4,
    title: "Performance Review Updated",
    message: "Your performance review details have been updated.",
    time: "10 Sep 2026",
    type: "performance",
    unread: false,
  },
];

function EmployeeNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all");

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

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
              {filteredNotifications.length === 0 ? (
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