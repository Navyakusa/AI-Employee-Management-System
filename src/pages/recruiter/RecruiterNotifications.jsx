import React, { useEffect, useState } from "react";
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
import apiClient from "../../services/apiClient";
import "./RecruiterNotifications.css";

// =========================================================
// NOTIFICATION HELPERS
// =========================================================

const getNotificationType = (type) => {
  const value = String(type || "").toLowerCase();

  if (value.includes("interview")) return "interview";
  if (value.includes("resume")) return "resume";
  if (value.includes("screen")) return "screening";

  if (
    value.includes("candidate") ||
    value.includes("application") ||
    value.includes("shortlist")
  ) {
    return "candidate";
  }

  return "general";
};

const getNotificationTitle = (type) => {
  const value = String(type || "").replaceAll("_", " ").trim();

  if (!value) return "Notification";

  return value
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatNotificationTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getApiErrorMessage = (error, fallback) => {
  if (error.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (error.response?.status === 403) {
    return "You are not authorized to perform this action.";
  }

  return error.response?.data?.message || error.message || fallback;
};

// =========================================================
// RECRUITER NOTIFICATIONS
// =========================================================

function RecruiterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [processingIds, setProcessingIds] = useState([]);
  const [markingAll, setMarkingAll] = useState(false);

  // =========================================================
  // FETCH NOTIFICATIONS
  // =========================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/notifications/my");
      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Failed to fetch notifications."
        );
      }

      const items = Array.isArray(result.data) ? result.data : [];

      setNotifications(items);

      setUnreadCount(
        items.filter(
          (notification) => notification.readStatus === false
        ).length
      );
    } catch (err) {
      console.error("Fetch notifications error:", err);

      setNotifications([]);
      setUnreadCount(0);

      setError(
        getApiErrorMessage(err, "Failed to load notifications.")
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH UNREAD COUNT
  // =========================================================

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get(
        "/notifications/unread-count"
      );

      const result = response.data;

      if (!result?.success) return;

      const data = result.data;

      const count =
        typeof data === "number"
          ? data
          : data?.unreadCount ?? data?.count;

      if (count !== undefined && Number.isFinite(Number(count))) {
        setUnreadCount(Math.max(0, Number(count)));
      }
    } catch (err) {
      console.error("Fetch unread count error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const intervalId = setInterval(fetchUnreadCount, 15000);

    const handleFocus = () => {
      fetchUnreadCount();
    };

    const handleNotificationsUpdated = () => {
      fetchUnreadCount();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener(
      "notifications-updated",
      handleNotificationsUpdated
    );

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, []);

  // =========================================================
  // ICON
  // =========================================================

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

  // =========================================================
  // MARK ONE NOTIFICATION AS READ
  // =========================================================

  const markAsRead = async (notificationId) => {
    if (processingIds.includes(notificationId)) return;

    try {
      setActionError("");
      setProcessingIds((current) => [...current, notificationId]);

      const response = await apiClient.put(
        `/notifications/${notificationId}/read`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to mark notification as read."
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.notificationId === notificationId
            ? { ...notification, readStatus: true }
            : notification
        )
      );

      setUnreadCount((current) => Math.max(0, current - 1));

      window.dispatchEvent(new Event("notifications-updated"));

      await fetchUnreadCount();
    } catch (err) {
      console.error("Mark notification as read error:", err);

      setActionError(
        getApiErrorMessage(
          err,
          "Failed to mark notification as read."
        )
      );
    } finally {
      setProcessingIds((current) =>
        current.filter((id) => id !== notificationId)
      );
    }
  };

  // =========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =========================================================

  const markAllAsRead = async () => {
    if (markingAll) return;

    try {
      setActionError("");
      setMarkingAll(true);

      const response = await apiClient.put(
        "/notifications/read-all"
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to mark all notifications as read."
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          readStatus: true,
        }))
      );

      setUnreadCount(0);

      window.dispatchEvent(new Event("notifications-updated"));

      await fetchUnreadCount();
    } catch (err) {
      console.error("Mark all notifications as read error:", err);

      setActionError(
        getApiErrorMessage(
          err,
          "Failed to mark all notifications as read."
        )
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // =========================================================
  // DELETE NOTIFICATION
  // =========================================================

  const deleteNotification = async (notificationId) => {
    if (processingIds.includes(notificationId)) return;

    try {
      setActionError("");
      setProcessingIds((current) => [...current, notificationId]);

      const notificationToDelete = notifications.find(
        (notification) =>
          notification.notificationId === notificationId
      );

      const response = await apiClient.delete(
        `/notifications/${notificationId}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to delete notification."
        );
      }

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.notificationId !== notificationId
        )
      );

      if (notificationToDelete?.readStatus === false) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }

      window.dispatchEvent(new Event("notifications-updated"));

      await fetchUnreadCount();
    } catch (err) {
      console.error("Delete notification error:", err);

      setActionError(
        getApiErrorMessage(err, "Failed to delete notification.")
      );
    } finally {
      setProcessingIds((current) =>
        current.filter((id) => id !== notificationId)
      );
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="recruiter-notifications-page">
      <RecruiterSidebar />

      <RecruiterTopbar />

      <main className="recruiter-notifications-main">
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
              disabled={markingAll}
            >
              <CheckCheck size={16} />
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {(error || actionError) && (
          <div
            role="alert"
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fff1f1",
              color: "#d92d20",
              border: "1px solid #fecdca",
            }}
          >
            {error || actionError}
          </div>
        )}

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

          <div className="notifications-list">
            {loading ? (
              <div className="empty-notifications">
                <div className="empty-icon">
                  <Bell size={28} />
                </div>

                <h3>Loading notifications...</h3>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-notifications">
                <div className="empty-icon">
                  <Bell size={28} />
                </div>

                <h3>No notifications</h3>

                <p>
                  You're all caught up. New updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const type = getNotificationType(notification.type);
                const unread = notification.readStatus === false;

                const processing = processingIds.includes(
                  notification.notificationId
                );

                return (
                  <div
                    key={notification.notificationId}
                    className={`notification-item ${
                      unread ? "unread" : ""
                    }`}
                  >
                    <div className={`notification-icon ${type}`}>
                      {getIcon(type)}
                    </div>

                    <div className="notification-content">
                      <div className="notification-title-row">
                        <h3>
                          {getNotificationTitle(notification.type)}
                        </h3>

                        {unread && (
                          <span className="unread-badge">New</span>
                        )}
                      </div>

                      <p>{notification.message || "—"}</p>

                      <span className="notification-time">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>

                    <div className="notification-actions">
                      {unread && (
                        <button
                          onClick={() =>
                            markAsRead(notification.notificationId)
                          }
                          disabled={processing}
                          title="Mark as read"
                        >
                          <CheckCircle size={17} />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteNotification(notification.notificationId)
                        }
                        disabled={processing}
                        title="Delete"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default RecruiterNotifications;