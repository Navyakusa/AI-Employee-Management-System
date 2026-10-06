import React, { useEffect, useState } from "react";
import HRSidebar from "./HRSidebar";
import HRNavbar from "./HRNavbar";
import "./HRNotifications.css";

function HRNotifications() {
  const [notifications, setNotifications] = useState([]);

  const [stats, setStats] = useState({
    totalNotifications: 0,
    unread: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // BACKEND API BASE URL
  // ============================================================

  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  // ============================================================
  // GET AUTH HEADERS
  // ============================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  // ============================================================
  // COMMON API REQUEST
  // ============================================================

  const apiRequest = async (
    endpoint,
    options = {}
  ) => {
    const response = await fetch(
      `${API_BASE}${endpoint}`,
      {
        ...options,

        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {}),
        },
      }
    );

    const text = await response.text();

    let result = {};

    try {
      result = text
        ? JSON.parse(text)
        : {};
    } catch {
      result = {};
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          result?.error ||
          `Request failed with status ${response.status}`
      );
    }

    if (
      result &&
      typeof result === "object" &&
      result.success === false
    ) {
      throw new Error(
        result.message ||
          "Backend request failed."
      );
    }

    return result;
  };

  // ============================================================
  // LOAD NOTIFICATIONS
  // ============================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      // --------------------------------------------------------
      // GET /api/notifications/my
      // --------------------------------------------------------

      const notificationResponse =
        await apiRequest(
          "/notifications/my"
        );

      // --------------------------------------------------------
      // GET /api/notifications/stats
      // --------------------------------------------------------

      const statsResponse =
        await apiRequest(
          "/notifications/stats"
        );

      // Backend wraps data inside "data"

      const notificationData =
        Array.isArray(
          notificationResponse?.data
        )
          ? notificationResponse.data
          : [];

      const statsData =
        statsResponse?.data || {};

      setNotifications(
        notificationData
      );

      setStats({
        totalNotifications:
          Number(
            statsData?.totalNotifications
          ) || 0,

        unread:
          Number(
            statsData?.unread
          ) || 0,
      });

      console.log(
        "Notifications:",
        notificationData
      );

      console.log(
        "Notification stats:",
        statsData
      );
    } catch (err) {
      console.error(
        "Notification loading error:",
        err
      );

      setError(
        err.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };



  // ============================================================
// SSE - REAL-TIME NOTIFICATIONS
// ============================================================

const connectNotificationStream = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No JWT token found. SSE connection not started.");
    return null;
  }

  const controller = new AbortController();

  const startSSE = async () => {
    try {
      console.log("Connecting to notification SSE...");

      const response = await fetch(
        `${API_BASE}/notifications/stream`,
        {
          method: "GET",

          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },

          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `SSE connection failed: ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error(
          "SSE response body is not available."
        );
      }

      console.log(
        "Notification SSE connection established."
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";

      while (true) {
        const { value, done } =
          await reader.read();

        if (done) {
          console.log(
            "Notification SSE connection closed."
          );
          break;
        }

        buffer += decoder.decode(
          value,
          { stream: true }
        );

        // SSE events are normally separated by a blank line
        const events = buffer.split("\n\n");

        // Keep incomplete event for next chunk
        buffer = events.pop() || "";

        for (const event of events) {
          const lines = event.split("\n");

          let data = "";

          for (const line of lines) {
            if (line.startsWith("data:")) {
              data += line
                .substring(5)
                .trim();
            }
          }

          // Ignore heartbeat / empty events
          if (!data) {
            continue;
          }

          console.log(
            "SSE notification received:",
            data
          );

          let newNotification;

          try {
            newNotification =
              JSON.parse(data);
          } catch {
            console.warn(
              "SSE data is not JSON:",
              data
            );

            continue;
          }

          // Some backends may wrap notification inside data
          if (
            newNotification?.data &&
            typeof newNotification.data ===
              "object"
          ) {
            newNotification =
              newNotification.data;
          }

          // Add new notification to UI
          setNotifications(
            (previousNotifications) => {

              // Prevent duplicate notification
              const alreadyExists =
                previousNotifications.some(
                  (notification) =>
                    notification.notificationId ===
                    newNotification.notificationId
                );

              if (alreadyExists) {
                return previousNotifications;
              }

              return [
                newNotification,
                ...previousNotifications,
              ];
            }
          );

          // Update statistics
          setStats(
            (previousStats) => ({
              totalNotifications:
                previousStats.totalNotifications + 1,

              unread:
                previousStats.unread + 1,
            })
          );
        }
      }
    } catch (error) {
      if (
        error.name ===
        "AbortError"
      ) {
        console.log(
          "Notification SSE connection stopped."
        );
        return;
      }

      console.error(
        "Notification SSE error:",
        error
      );

      setError(
        "Real-time notification connection failed."
      );
    }
  };

  startSSE();

  return controller;
};   




  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
  // Load existing notifications
  loadNotifications();

  // Start real-time SSE connection
  const controller =
    connectNotificationStream();

  // Close SSE when leaving page
  return () => {
    if (controller) {
      controller.abort();
    }
  };
}, []);

  // ============================================================
  // MARK ONE AS READ
  // ============================================================

  const handleMarkAsRead = async (
    notificationId
  ) => {
    try {
      setError("");

      await apiRequest(
        `/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      // Update notification locally

      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (notification) =>
              notification.notificationId ===
              notificationId
                ? {
                    ...notification,
                    readStatus: true,
                  }
                : notification
          )
      );

      // Update unread count locally

      setStats(
        (previousStats) => ({
          ...previousStats,

          unread:
            Math.max(
              0,
              previousStats.unread - 1
            ),
        })
      );
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err
      );

      setError(
        err.message ||
          "Failed to mark notification as read."
      );
    }
  };

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const handleMarkAllAsRead =
    async () => {
      try {
        setError("");

        await apiRequest(
          "/notifications/read-all",
          {
            method: "PUT",
          }
        );

        // Update all notifications locally

        setNotifications(
          (previousNotifications) =>
            previousNotifications.map(
              (notification) => ({
                ...notification,
                readStatus: true,
              })
            )
        );

        // Backend now has zero unread

        setStats(
          (previousStats) => ({
            ...previousStats,
            unread: 0,
          })
        );
      } catch (err) {
        console.error(
          "Mark all notifications as read error:",
          err
        );

        setError(
          err.message ||
            "Failed to mark all notifications as read."
        );
      }
    };

  // ============================================================
  // DELETE NOTIFICATION
  // ============================================================

  const handleDeleteNotification =
    async (notificationId) => {
      try {
        setError("");

        // Find notification before deleting

        const notificationToDelete =
          notifications.find(
            (notification) =>
              notification.notificationId ===
              notificationId
          );

        // ------------------------------------------------------
        // DELETE /api/notifications/{notificationId}
        // ------------------------------------------------------

        await apiRequest(
          `/notifications/${notificationId}`,
          {
            method: "DELETE",
          }
        );

        // Remove from UI

        setNotifications(
          (previousNotifications) =>
            previousNotifications.filter(
              (notification) =>
                notification.notificationId !==
                notificationId
            )
        );

        // Update statistics

        setStats(
          (previousStats) => ({
            totalNotifications:
              Math.max(
                0,
                previousStats.totalNotifications -
                  1
              ),

            unread:
              notificationToDelete &&
              !notificationToDelete.readStatus
                ? Math.max(
                    0,
                    previousStats.unread - 1
                  )
                : previousStats.unread,
          })
        );
      } catch (err) {
        console.error(
          "Delete notification error:",
          err
        );

        setError(
          err.message ||
            "Failed to delete notification."
        );
      }
    };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatNotificationDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "Unknown date";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ============================================================
  // NOTIFICATION TYPE
  // ============================================================

  const getNotificationTypeLabel = (
    type
  ) => {
    switch (type) {
      case "NEW_APPLICATION":
        return "New Application";

      case "OFFER_ACCEPTED":
        return "Offer Accepted";

      case "FEEDBACK_SUBMITTED":
        return "Interview Feedback";

      default:
        return (
          type || "Notification"
        );
    }
  };

  // ============================================================
  // NOTIFICATION ICON
  // ============================================================

  const getNotificationIcon = (
    type
  ) => {
    switch (type) {
      case "NEW_APPLICATION":
        return "📄";

      case "OFFER_ACCEPTED":
        return "✅";

      case "FEEDBACK_SUBMITTED":
        return "💬";

      default:
        return "🔔";
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="hr-dashboard">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <HRSidebar />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="hr-main">

        {/* ====================================================
            TOP NAVBAR
        ==================================================== */}

        <HRNavbar />

        {/* ====================================================
            NOTIFICATION PAGE
        ==================================================== */}

        <div className="hr-notifications-page">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="hr-notifications-header">

            <div>
              <h1>
                Notifications
              </h1>

              <p>
                Stay updated with your
                employee activities.
              </p>
            </div>

            <div className="notification-header-actions">

              {/* MARK ALL */}

              {stats.unread > 0 && (
                <button
                  className="mark-all-button"
                  onClick={
                    handleMarkAllAsRead
                  }
                >
                  Mark all as read
                </button>
              )}

              {/* REFRESH */}

              <button
                className="refresh-notifications-button"
                onClick={
                  loadNotifications
                }
              >
                ↻ Refresh
              </button>

            </div>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="notification-error">
              {error}
            </div>
          )}

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="notification-stat-grid">

            {/* TOTAL */}

            <div className="notification-stat-card">

              <div className="notification-stat-icon">
                🔔
              </div>

              <div>
                <span>
                  Total Notifications
                </span>

                <strong>
                  {stats.totalNotifications}
                </strong>
              </div>

            </div>

            {/* UNREAD */}

            <div className="notification-stat-card unread-card">

              <div className="notification-stat-icon">
                🔔
              </div>

              <div>
                <span>
                  Unread Notifications
                </span>

                <strong>
                  {stats.unread}
                </strong>
              </div>

            </div>

          </div>

          {/* ==================================================
              RECENT NOTIFICATIONS
          ================================================== */}

          <div className="notifications-panel">

            <div className="notifications-panel-header">

              <div>
                <h2>
                  Recent Notifications
                </h2>

                <p>
                  Notifications received from
                  the recruitment system.
                </p>
              </div>

              {stats.unread > 0 && (
                <span className="unread-badge">
                  {stats.unread} unread
                </span>
              )}

            </div>

            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (
              <div className="notifications-loading">
                Loading notifications...
              </div>
            )}

            {/* ==================================================
                EMPTY
            ================================================== */}

            {!loading &&
              notifications.length ===
                0 && (
                <div className="notifications-empty">

                  <div className="empty-notification-icon">
                    🔔
                  </div>

                  <h3>
                    No notifications
                  </h3>

                  <p>
                    You don't have any
                    notifications yet.
                  </p>

                </div>
              )}

            {/* ==================================================
                NOTIFICATION LIST
            ================================================== */}

            {!loading &&
              notifications.length >
                0 && (

                <div className="notification-list">

                  {notifications.map(
                    (notification) => (

                      <div
                        key={
                          notification.notificationId
                        }
                        className={`notification-item ${
                          !notification.readStatus
                            ? "notification-unread"
                            : ""
                        }`}
                      >

                        {/* ICON */}

                        <div className="notification-item-icon">
                          {getNotificationIcon(
                            notification.type
                          )}
                        </div>

                        {/* CONTENT */}

                        <div className="notification-item-content">

                          <div className="notification-item-top">

                            <span className="notification-type">
                              {getNotificationTypeLabel(
                                notification.type
                              )}
                            </span>

                            {!notification.readStatus && (
                              <span className="new-badge">
                                New
                              </span>
                            )}

                          </div>

                          <p className="notification-message">
                            {
                              notification.message
                            }
                          </p>

                          <span className="notification-date">
                            {formatNotificationDate(
                              notification.createdAt
                            )}
                          </span>

                        </div>

                        {/* ACTIONS */}

                        <div className="notification-actions">

                          {!notification.readStatus && (
                            <button
                              className="notification-read-button"
                              onClick={() =>
                                handleMarkAsRead(
                                  notification.notificationId
                                )
                              }
                            >
                              Mark as read
                            </button>
                          )}

                          <button
                            className="notification-delete-button"
                            onClick={() =>
                              handleDeleteNotification(
                                notification.notificationId
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default HRNotifications;