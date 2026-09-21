import { useState } from "react";
import {
  Bell,
  CheckCheck,
  UserCheck,
  CalendarDays,
  MessageSquareText,
  BriefcaseBusiness,
  CheckCircle2,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerNotifications() {
  // Temporary frontend data.
  // Backend notifications API will replace this later.
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "SHORTLISTED",
      title: "New Shortlisted Candidate",
      message:
        "Ananya Sharma has been shortlisted for Java Backend Developer.",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "INTERVIEW",
      title: "Interview Scheduled",
      message:
        "Interview for Rahul Verma has been scheduled for 20 Sep 2026 at 2:30 PM.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "FEEDBACK",
      title: "Interview Feedback Submitted",
      message:
        "Interview feedback for Sneha Reddy is now available for review.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 4,
      type: "DECISION",
      title: "Candidate Awaiting Decision",
      message:
        "Sneha Reddy has completed the interview process and is awaiting your final decision.",
      time: "3 hours ago",
      read: true,
    },
    {
      id: 5,
      type: "JOB",
      title: "Job Assigned",
      message:
        "Java Backend Developer has been assigned to you.",
      time: "Yesterday",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleMarkAsRead = (notificationId) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "SHORTLISTED":
        return <UserCheck size={20} />;

      case "INTERVIEW":
        return <CalendarDays size={20} />;

      case "FEEDBACK":
        return <MessageSquareText size={20} />;

      case "DECISION":
        return <CheckCircle2 size={20} />;

      case "JOB":
        return <BriefcaseBusiness size={20} />;

      default:
        return <Bell size={20} />;
    }
  };

  return (
    <div className="hiring-manager-layout">
      <HiringManagerSidebar />

      <div className="hiring-manager-main">
        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* HEADER */}

          <div className="hiring-manager-dashboard-header">
            <p className="hiring-manager-label">
              NOTIFICATIONS
            </p>

            <h1>Notifications</h1>

            <p>
              Stay updated with candidate, interview and
              recruitment activities.
            </p>
          </div>

          {/* NOTIFICATION SUMMARY */}

          <section className="hm-notification-summary">

            <div className="hm-notification-summary-card">
              <div className="hm-notification-summary-icon">
                <Bell size={21} />
              </div>

              <div>
                <span>Total Notifications</span>
                <strong>{notifications.length}</strong>
              </div>
            </div>

            <div className="hm-notification-summary-card">
              <div className="hm-notification-summary-icon">
                <MessageSquareText size={21} />
              </div>

              <div>
                <span>Unread</span>
                <strong>{unreadCount}</strong>
              </div>
            </div>

          </section>

          {/* NOTIFICATIONS */}

          <section className="hm-notifications-card">

            <div className="hm-notifications-header">

              <div>
                <h2>Recent Notifications</h2>

                <p>
                  Recruitment updates requiring your
                  attention.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="hm-mark-all-read-button"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck size={17} />
                  Mark All as Read
                </button>
              )}

            </div>

            <div className="hm-notifications-list">

              {notifications.length > 0 ? (
                notifications.map((notification) => (

                  <div
                    key={notification.id}
                    className={`hm-notification-item ${
                      !notification.read
                        ? "unread"
                        : ""
                    }`}
                  >

                    <div className="hm-notification-icon">
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    <div className="hm-notification-content">

                      <div className="hm-notification-title-row">

                        <h3>
                          {notification.title}
                        </h3>

                        {!notification.read && (
                          <span className="hm-unread-dot" />
                        )}

                      </div>

                      <p>
                        {notification.message}
                      </p>

                      <span className="hm-notification-time">
                        {notification.time}
                      </span>

                    </div>

                    {!notification.read && (
                      <button
                        type="button"
                        className="hm-mark-read-button"
                        onClick={() =>
                          handleMarkAsRead(
                            notification.id
                          )
                        }
                      >
                        <CheckCheck size={16} />
                        Mark as Read
                      </button>
                    )}

                  </div>

                ))
              ) : (

                <div className="hm-notifications-empty">
                  <Bell size={35} />

                  <h3>No Notifications</h3>

                  <p>
                    You don't have any notifications
                    right now.
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

export default HiringManagerNotifications;