import React, { useState } from "react";
import {
  Bell,
  CheckCircle,
  FileText,
  CalendarDays,
  UserCheck,
  Trash2,
  CheckCheck,
} from "lucide-react";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";

import "./RecruiterNotifications.css";

function RecruiterNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "candidate",
      title: "Candidate shortlisted",
      message:
        "Rahul Verma has been shortlisted for the Java Backend Developer position.",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "interview",
      title: "Interview scheduled",
      message:
        "Ananya Sharma has an interview scheduled for today at 11:00 AM.",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "resume",
      title: "New resume received",
      message:
        "A new candidate resume has been added to the recruitment system.",
      time: "3 hours ago",
      unread: false,
    },
    {
      id: 4,
      type: "screening",
      title: "AI screening completed",
      message:
        "AI screening has been completed for the latest candidate applications.",
      time: "Yesterday",
      unread: false,
    },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case "candidate":
        return <UserCheck size={20} />;

      case "interview":
        return <CalendarDays size={20} />;

      case "resume":
        return <FileText size={20} />;

      case "screening":
        return <CheckCircle size={20} />;

      default:
        return <Bell size={20} />;
    }
  };

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id
      )
    );
  };

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <div className="recruiter-notifications-page">

      {/* SIDEBAR */}
      <RecruiterSidebar />

      {/* TOPBAR */}
      <RecruiterTopbar />

      {/* MAIN CONTENT */}
      <main className="recruiter-notifications-main">

        {/* HEADER */}
        <div className="recruiter-notifications-header">

          <div>
            <span className="recruiter-page-label">
              RECRUITMENT WORKSPACE
            </span>

            <h1>Notifications</h1>

            <p>
              Stay updated with your recruitment activities.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              className="mark-all-btn"
              onClick={markAllAsRead}
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}

        </div>

        {/* SUMMARY */}
        <div className="notification-summary">

          <div className="notification-summary-card">

            <div className="summary-icon">
              <Bell size={19} />
            </div>

            <div>
              <span>Total Notifications</span>
              <strong>{notifications.length}</strong>
            </div>

          </div>

          <div className="notification-summary-card">

            <div className="summary-icon unread-summary">
              <Bell size={19} />
            </div>

            <div>
              <span>Unread</span>
              <strong>{unreadCount}</strong>
            </div>

          </div>

        </div>

        {/* NOTIFICATION CARD */}
        <section className="notifications-card">

          <div className="notifications-card-header">

            <div>
              <h2>Recent Notifications</h2>

              <p>
                Latest recruitment updates and activities.
              </p>
            </div>

            <Bell size={20} />

          </div>

          {/* LIST */}
          <div className="notifications-list">

            {notifications.length === 0 ? (

              <div className="empty-notifications">

                <div className="empty-icon">
                  <Bell size={28} />
                </div>

                <h3>No notifications</h3>

                <p>
                  You're all caught up. New updates
                  will appear here.
                </p>

              </div>

            ) : (

              notifications.map((notification) => (

                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.unread
                      ? "unread"
                      : ""
                  }`}
                >

                  {/* ICON */}
                  <div
                    className={`notification-icon ${notification.type}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  {/* CONTENT */}
                  <div className="notification-content">

                    <div className="notification-title-row">

                      <h3>
                        {notification.title}
                      </h3>

                      {notification.unread && (
                        <span className="unread-badge">
                          New
                        </span>
                      )}

                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <span className="notification-time">
                      {notification.time}
                    </span>

                  </div>

                  {/* ACTIONS */}
                  <div className="notification-actions">

                    {notification.unread && (
                      <button
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                        title="Mark as read"
                      >
                        <CheckCircle size={17} />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteNotification(
                          notification.id
                        )
                      }
                      title="Delete"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default RecruiterNotifications;