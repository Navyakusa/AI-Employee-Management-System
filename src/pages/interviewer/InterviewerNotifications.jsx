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

  /*
   * Remove duplicate notifications.
   *
   * The backend may return multiple database rows for
   * the same notification/event.
   *
   * We use:
   *   type + title + message
   *
   * as the unique key instead of the database ID.
   */
  const getNotificationEventKey = (notification) => {
    const normalize = (value) =>
      String(value ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

    return [
      normalize(notification.type),
      normalize(notification.title),
      normalize(notification.message),
    ].join("|");
  };

  const removeDuplicateNotifications = (items) => {
  const latestByType = new Map();

  items.forEach((notification) => {
    const type = String(
      notification.type ||
        notification.title ||
        "UNKNOWN"
    )
      .trim()
      .toLowerCase();

    const existing = latestByType.get(type);

    if (!existing) {
      latestByType.set(type, notification);
      return;
    }

    const existingTime = new Date(
      existing.time || 0
    ).getTime();

    const currentTime = new Date(
      notification.time || 0
    ).getTime();

    if (currentTime > existingTime) {
      latestByType.set(type, notification);
    }
  });

  return Array.from(latestByType.values()).sort(
    (a, b) =>
      new Date(b.time || 0).getTime() -
      new Date(a.time || 0).getTime()
  );
};

  /*
   * Load notifications from backend
   */
  const loadNotifications = () => {
    setLoading(true);
    setError(null);

    getMyNotifications()
      .then((data) => {
        const notificationList = Array.isArray(data) ? data : [];

        const uniqueNotifications =
          removeDuplicateNotifications(notificationList);

        setNotifications(uniqueNotifications);
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
        setError("Unable to load notifications right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /*
   * Load notifications when page opens
   */
  useEffect(() => {
    loadNotifications();
  }, []);

  /*
   * Count unread notifications
   */
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  /*
   * Mark one notification as read
   */
  const handleMarkAsRead = (notificationId) => {
    /*
     * Optimistic UI update.
     */
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    markNotificationRead(notificationId)
      .then(() => {
        /*
         * Reload from backend so the frontend
         * reflects the actual server state.
         */
        return getMyNotifications();
      })
      .then((freshData) => {
        const freshList = Array.isArray(freshData) ? freshData : [];

        const uniqueNotifications =
          removeDuplicateNotifications(freshList);

        setNotifications(uniqueNotifications);

        const stillUnread = uniqueNotifications.find(
          (notification) =>
            notification.id === notificationId && !notification.read
        );

        if (stillUnread) {
          setPersistWarning(
            "The server accepted the request but this notification is still showing as unread."
          );
        }
      })
      .catch((err) => {
        console.error("Failed to mark notification as read:", err);

        /*
         * Roll back if API request fails.
         */
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

  /*
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = () => {
    const previousState = notifications;

    /*
     * Optimistic update
     */
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );

    markAllNotificationsRead()
      .then(() => getMyNotifications())
      .then((freshData) => {
        const freshList = Array.isArray(freshData) ? freshData : [];

        const uniqueNotifications =
          removeDuplicateNotifications(freshList);

        setNotifications(uniqueNotifications);

        const stillUnreadCount = uniqueNotifications.filter(
          (notification) => !notification.read
        ).length;

        if (stillUnreadCount > 0) {
          setPersistWarning(
            `The server accepted "mark all as read" but ${stillUnreadCount} notification${
              stillUnreadCount === 1 ? " is" : "s are"
            } still unread after re-checking.`
          );
        }
      })
      .catch((err) => {
        console.error(
          "Failed to mark all notifications as read:",
          err
        );

        /*
         * Restore previous state if request fails.
         */
        setNotifications(previousState);

        const status = err?.response?.status;

        setPersistWarning(
          `Couldn't mark all as read${
            status ? ` (HTTP ${status})` : ""
          }.`
        );
      });
  };

  /*
   * Notification icon based on type
   */
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

  /*
   * Notification CSS class based on type
   */
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

      {/* SIDEBAR */}
      <InterviewerSidebar />

      <div className="interviewer-main">

        {/* NAVBAR */}
        <InterviewerNavbar />

        <main className="interviewer-dashboard-content">

          {/* HEADER */}
          <div className="interviewer-dashboard-header">

            <p className="interviewer-label">
              NOTIFICATIONS
            </p>

            <h1>
              Notifications
            </h1>

            <p>
              Stay updated with interview assignments,
              schedule changes and evaluation reminders.
            </p>

          </div>

          {/* SUMMARY */}
          <section className="interviewer-notification-summary">

            {/* TOTAL */}
            <div className="interviewer-notification-summary-card">

              <div className="interviewer-notification-summary-icon">
                <Bell size={21} />
              </div>

              <div>
                <span>
                  Total Notifications
                </span>

                <strong>
                  {notifications.length}
                </strong>
              </div>

            </div>

            {/* UNREAD */}
            <div className="interviewer-notification-summary-card">

              <div className="interviewer-notification-summary-icon unread">
                <Clock3 size={21} />
              </div>

              <div>
                <span>
                  Unread
                </span>

                <strong>
                  {unreadCount}
                </strong>
              </div>

            </div>

          </section>

          {/* NOTIFICATION CARD */}
          <section className="interviewer-notifications-card">

            {/* BACKEND WARNING */}
            {persistWarning && (
              <p className="interviewer-evaluation-error">
                {persistWarning}
              </p>
            )}

            {/* TOOLBAR */}
            <div className="interviewer-notifications-toolbar">

              <div>

                <h2>
                  Recent Notifications
                </h2>

                <p>
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${
                        unreadCount === 1 ? "" : "s"
                      }.`
                    : "You're all caught up."}
                </p>

              </div>

              {/* MARK ALL AS READ */}
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

            {/* NOTIFICATION LIST */}
            <div className="interviewer-notifications-list">

              {/* LOADING */}
              {loading && (
                <p>
                  Loading notifications...
                </p>
              )}

              {/* ERROR */}
              {!loading && error && (
                <div className="interviewer-notifications-empty">

                  <Bell size={38} />

                  <h3>
                    Something went wrong
                  </h3>

                  <p>
                    {error}
                  </p>

                </div>
              )}

              {/* NOTIFICATIONS */}
              {!loading &&
                !error &&
                notifications.length > 0 &&
                notifications.map((notification) => (

                  <div
                    key={notification.id}
                    className={`interviewer-notification-item ${
                      notification.read
                        ? "read"
                        : "unread"
                    }`}
                    role="button"
                    tabIndex={0}
                    style={{
                      cursor: notification.read
                        ? "default"
                        : "pointer",
                    }}

                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(
                          notification.id
                        );
                      }
                    }}

                    onKeyDown={(e) => {
                      if (
                        (e.key === "Enter" ||
                          e.key === " ") &&
                        !notification.read
                      ) {
                        handleMarkAsRead(
                          notification.id
                        );
                      }
                    }}
                  >

                    {/* ICON */}
                    <div
                      className={`interviewer-notification-icon ${getNotificationClass(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    {/* CONTENT */}
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

                    {/* MARK AS READ */}
                    {!notification.read && (
                      <button
                        type="button"
                        className="interviewer-notification-read-button"

                        onClick={(e) => {
                          e.stopPropagation();

                          handleMarkAsRead(
                            notification.id
                          );
                        }}
                      >
                        <CheckCheck size={15} />

                        Mark as read
                      </button>
                    )}

                  </div>
                ))}

              {/* EMPTY */}
              {!loading &&
                !error &&
                notifications.length === 0 && (

                  <div className="interviewer-notifications-empty">

                    <Bell size={38} />

                    <h3>
                      No notifications
                    </h3>

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