import { useState } from "react";

import {
  Bell,
  CalendarDays,
  CalendarClock,
  XCircle,
  ClipboardCheck,
  CheckCheck,
  Clock3,
} from "lucide-react";

import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerNavbar from "./InterviewerNavbar";

import "./InterviewerDashboard.css";

function InterviewerNotifications() {
  // Temporary frontend data
  // Backend integration will replace this later.
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "INTERVIEW_ASSIGNED",
      title: "New Interview Assigned",
      message:
        "You have been assigned to interview Ananya Sharma for the Java Backend Developer position.",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "INTERVIEW_RESCHEDULED",
      title: "Interview Rescheduled",
      message:
        "Rahul Verma's interview has been rescheduled to 20 Sep 2026 at 2:30 PM.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "EVALUATION_PENDING",
      title: "Evaluation Pending",
      message:
        "Please submit your interview evaluation for Sneha Reddy.",
      time: "3 hours ago",
      read: false,
    },
    {
      id: 4,
      type: "INTERVIEW_CANCELLED",
      title: "Interview Cancelled",
      message:
        "The interview scheduled with Arjun Kumar has been cancelled.",
      time: "Yesterday",
      read: true,
    },
    {
      id: 5,
      type: "EVALUATION_SUBMITTED",
      title: "Evaluation Submitted",
      message:
        "Your evaluation for Meghana Rao was submitted successfully.",
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
      case "INTERVIEW_ASSIGNED":
        return <CalendarDays size={19} />;

      case "INTERVIEW_RESCHEDULED":
        return <CalendarClock size={19} />;

      case "INTERVIEW_CANCELLED":
        return <XCircle size={19} />;

      case "EVALUATION_PENDING":
      case "EVALUATION_SUBMITTED":
        return <ClipboardCheck size={19} />;

      default:
        return <Bell size={19} />;
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case "INTERVIEW_ASSIGNED":
        return "assigned";

      case "INTERVIEW_RESCHEDULED":
        return "rescheduled";

      case "INTERVIEW_CANCELLED":
        return "cancelled";

      case "EVALUATION_PENDING":
        return "evaluation";

      case "EVALUATION_SUBMITTED":
        return "submitted";

      default:
        return "";
    }
  };

  return (
    <div className="interviewer-layout">

      <InterviewerSidebar />

      <div className="interviewer-main">

        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">

          {/* HEADER */}

          <div className="interviewer-dashboard-header">

            <p className="interviewer-label">
              NOTIFICATIONS
            </p>

            <h1>Notifications</h1>

            <p>
              Stay updated with interview assignments,
              schedule changes and evaluation reminders.
            </p>

          </div>

          {/* SUMMARY */}

          <section className="interviewer-notification-summary">

            <div className="interviewer-notification-summary-card">

              <div className="interviewer-notification-summary-icon">
                <Bell size={21} />
              </div>

              <div>
                <span>Total Notifications</span>

                <strong>
                  {notifications.length}
                </strong>
              </div>

            </div>

            <div className="interviewer-notification-summary-card">

              <div className="interviewer-notification-summary-icon unread">
                <Clock3 size={21} />
              </div>

              <div>
                <span>Unread</span>

                <strong>
                  {unreadCount}
                </strong>
              </div>

            </div>

          </section>

          {/* NOTIFICATION CARD */}

          <section className="interviewer-notifications-card">

            <div className="interviewer-notifications-toolbar">

              <div>
                <h2>Recent Notifications</h2>

                <p>
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${
                        unreadCount === 1 ? "" : "s"
                      }.`
                    : "You're all caught up."}
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="interviewer-mark-all-button"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck size={16} />
                  Mark all as read
                </button>
              )}

            </div>

            {/* LIST */}

            <div className="interviewer-notifications-list">

              {notifications.length > 0 ? (

                notifications.map((notification) => (

                  <div
                    key={notification.id}
                    className={`interviewer-notification-item ${
                      notification.read
                        ? "read"
                        : "unread"
                    }`}
                  >

                    <div
                      className={`interviewer-notification-icon ${getNotificationClass(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    <div className="interviewer-notification-content">

                      <div className="interviewer-notification-title-row">

                        <h3>
                          {notification.title}
                        </h3>

                        {!notification.read && (
                          <span className="interviewer-notification-unread-dot" />
                        )}

                      </div>

                      <p>
                        {notification.message}
                      </p>

                      <span className="interviewer-notification-time">
                        {notification.time}
                      </span>

                    </div>

                    {!notification.read && (

                      <button
                        type="button"
                        className="interviewer-notification-read-button"
                        onClick={() =>
                          handleMarkAsRead(
                            notification.id
                          )
                        }
                      >
                        <CheckCheck size={15} />
                        Mark as read
                      </button>

                    )}

                  </div>

                ))

              ) : (

                <div className="interviewer-notifications-empty">

                  <Bell size={38} />

                  <h3>No notifications</h3>

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

export default InterviewerNotifications;