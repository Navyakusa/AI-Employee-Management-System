import { useEffect, useState } from "react";

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

import {
  fetchInterviewerNotifications as getMyNotifications,
  markInterviewerNotificationRead as markNotificationRead,
  markAllInterviewerNotificationsRead as markAllNotificationsRead,
  announceNotificationsUpdated,
} from "../../services/interviewerNotificationUtils";

import "./InterviewerDashboard.css";

function InterviewerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = () => {
    setLoading(true);
    setError(null);

    getMyNotifications()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Unable to load notifications right now.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const [persistWarning, setPersistWarning] = useState(null);

  const handleMarkAsRead = (notificationId) => {
    // Optimistic update for a snappy UI.
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    markNotificationRead(notificationId)
      .then(() => {
        // The PUT call resolving doesn't guarantee the backend actually
        // persisted it — re-fetch from the server to confirm the real
        // state instead of trusting the optimistic update blindly.
        return getMyNotifications();
      })
      .then((freshData) => {
        const fresh = Array.isArray(freshData) ? freshData : [];
        setNotifications(fresh);
        setPersistWarning(null);
        announceNotificationsUpdated();

        const stillUnread = fresh.find(
          (n) => n.id === notificationId && !n.read
        );

        if (stillUnread) {
          setPersistWarning(
            "The server accepted the request but this notification is still showing as unread — this looks like a backend issue, not something wrong on your end."
          );
        }
      })
      .catch((err) => {
        console.error("Failed to mark notification as read:", err);

        // Roll back the optimistic update on an actual request failure.
        setNotifications((previous) =>
          previous.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: false }
              : notification
          )
        );

        const status = err?.response?.status;
        setPersistWarning(
          `Couldn't mark as read${status ? ` (HTTP ${status})` : ""}.`
        );
      });
  };

  const handleMarkAllAsRead = () => {
    const previousState = notifications;

    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, read: true }))
    );

    markAllNotificationsRead()
      .then(() => getMyNotifications())
      .then((freshData) => {
        const fresh = Array.isArray(freshData) ? freshData : [];
        setNotifications(fresh);
        setPersistWarning(null);
        announceNotificationsUpdated();

        const stillUnreadCount = fresh.filter((n) => !n.read).length;

        if (stillUnreadCount > 0) {
          setPersistWarning(
            `The server accepted "mark all as read" but ${stillUnreadCount} notification${
              stillUnreadCount === 1 ? " is" : "s are"
            } still unread after re-checking — this looks like a backend issue, not something wrong on your end.`
          );
        }
      })
      .catch((err) => {
        console.error("Failed to mark all notifications as read:", err);
        setNotifications(previousState);

        const status = err?.response?.status;
        setPersistWarning(
          `Couldn't mark all as read${status ? ` (HTTP ${status})` : ""}.`
        );
      });
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
            <p className="interviewer-label">NOTIFICATIONS</p>

            <h1>Notifications</h1>

            <p>
              Stay updated with interview assignments, schedule changes
              and evaluation reminders.
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
                <strong>{notifications.length}</strong>
              </div>
            </div>

            <div className="interviewer-notification-summary-card">
              <div className="interviewer-notification-summary-icon unread">
                <Clock3 size={21} />
              </div>

              <div>
                <span>Unread</span>
                <strong>{unreadCount}</strong>
              </div>
            </div>
          </section>

          {/* NOTIFICATION CARD */}

          <section className="interviewer-notifications-card">
            {persistWarning && (
              <p className="interviewer-evaluation-error">
                {persistWarning}
              </p>
            )}

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
              {loading && <p>Loading notifications...</p>}

              {!loading && error && (
                <div className="interviewer-notifications-empty">
                  <Bell size={38} />
                  <h3>Something went wrong</h3>
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && notifications.length > 0 &&
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`interviewer-notification-item ${
                      notification.read ? "read" : "unread"
                    }`}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: notification.read ? "default" : "pointer" }}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        (e.key === "Enter" || e.key === " ") &&
                        !notification.read
                      ) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div
                      className={`interviewer-notification-icon ${getNotificationClass(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="interviewer-notification-content">
                      <div className="interviewer-notification-title-row">
                        <h3>{notification.title}</h3>

                        {!notification.read && (
                          <span className="interviewer-notification-unread-dot" />
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <span className="interviewer-notification-time">
                        {notification.time}
                      </span>
                    </div>

                    {!notification.read && (
                      <button
                        type="button"
                        className="interviewer-notification-read-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        <CheckCheck size={15} />
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}

              {!loading && !error && notifications.length === 0 && (
                <div className="interviewer-notifications-empty">
                  <Bell size={38} />
                  <h3>No notifications</h3>
                  <p>You don't have any notifications right now.</p>
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
