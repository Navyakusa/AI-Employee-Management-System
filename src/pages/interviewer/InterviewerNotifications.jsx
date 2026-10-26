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
  announceNotificationsUpdated,
} from "../../services/interviewerNotificationUtils";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/interviewerService";

import "./InterviewerDashboard.css";

function InterviewerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [persistWarning, setPersistWarning] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load interviewer notifications:", err);
      setError("Unable to load notifications right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleMarkAsRead = async (notificationId) => {
    const previousNotifications = notifications;
    setPersistWarning(null);

    // Optimistically update the UI while the request is processed.
    setNotifications((current) =>
      current.map((notification) =>
        String(notification.id) === String(notificationId)
          ? { ...notification, read: true }
          : notification
      )
    );

    try {
      const response = await markNotificationRead(notificationId);

      if (response?.data?.success === false) {
        throw new Error(
          response.data.message || "Failed to mark notification as read."
        );
      }
      
      // Re-fetch to confirm the persisted state returned by the server.
      const freshData = await getMyNotifications();
      const freshNotifications = Array.isArray(freshData) ? freshData : [];
      setNotifications(freshNotifications);
      announceNotificationsUpdated();

      const stillUnread = freshNotifications.find(
        (notification) =>
          String(notification.id) === String(notificationId) &&
          !notification.read
      );

      if (stillUnread) {
        setPersistWarning(
          "The server accepted the request, but this notification is still unread. Please ask the backend team to check whether the read status is being saved."
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setNotifications(previousNotifications);
      const status = err?.response?.status;
      setPersistWarning(
        `Couldn't mark as read${status ? ` (HTTP ${status})` : ""}. Please try again.`
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const previousNotifications = notifications;
    setPersistWarning(null);

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );

    try {
      const response = await markAllNotificationsRead();

      if (response?.data?.success === false) {
        throw new Error(
          response.data.message || "Failed to mark all notifications as read."
        );
      }

      const freshData = await getMyNotifications();
      const freshNotifications = Array.isArray(freshData) ? freshData : [];
      setNotifications(freshNotifications);
      announceNotificationsUpdated();

      const stillUnreadCount = freshNotifications.filter(
        (notification) => !notification.read
      ).length;

      if (stillUnreadCount > 0) {
        setPersistWarning(
          `The server accepted the request, but ${stillUnreadCount} notification${
            stillUnreadCount === 1 ? " is" : "s are"
          } still unread after refreshing. Please ask the backend team to check the saved read status.`
        );
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setNotifications(previousNotifications);
      const status = err?.response?.status;
      setPersistWarning(
        `Couldn't mark all as read${status ? ` (HTTP ${status})` : ""}. Please try again.`
      );
    }
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
          <div className="interviewer-dashboard-header">
            <p className="interviewer-label">NOTIFICATIONS</p>
            <h1>Notifications</h1>
            <p>
              Stay updated with interview assignments, schedule changes and
              evaluation reminders.
            </p>
          </div>

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

          <section className="interviewer-notifications-card">
            {persistWarning && (
              <p className="interviewer-evaluation-error">{persistWarning}</p>
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

            <div className="interviewer-notifications-list">
              {loading && <p>Loading notifications...</p>}

              {!loading && error && (
                <div className="interviewer-notifications-empty">
                  <Bell size={38} />
                  <h3>Something went wrong</h3>
                  <p>{error}</p>
                  <button type="button" onClick={loadNotifications}>
                    Try again
                  </button>
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
                    style={{
                      cursor: notification.read ? "default" : "pointer",
                    }}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        (event.key === "Enter" || event.key === " ") &&
                        !notification.read
                      ) {
                        event.preventDefault();
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
                        onClick={(event) => {
                          event.stopPropagation();
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
