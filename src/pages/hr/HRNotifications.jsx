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

  const apiRequest = async (endpoint, options = {}) => {
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
      result = text ? JSON.parse(text) : {};
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

      // --------------------------------------------------------
      // BACKEND DATA
      // --------------------------------------------------------

      const notificationData =
        Array.isArray(
          notificationResponse?.data
        )
          ? notificationResponse.data
          : [];

      const statsData =
        statsResponse?.data || {};

      // --------------------------------------------------------
      // UPDATE STATE
      // --------------------------------------------------------

      setNotifications(notificationData);

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
        "HR Notifications:",
        notificationData
      );

      console.log(
        "HR Notification stats:",
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
      console.warn(
        "No JWT token found. SSE connection not started."
      );

      return null;
    }

    const controller =
      new AbortController();

    const startSSE = async () => {
      try {
        console.log(
          "Connecting to HR notification SSE..."
        );

        const response = await fetch(
          `${API_BASE}/notifications/stream`,
          {
            method: "GET",

            // IMPORTANT:
            // Do NOT add Cache-Control here.
            // It can cause a CORS preflight problem.

            headers: {
              Accept: "text/event-stream",

              Authorization: `Bearer ${token}`,
            },

            signal: controller.signal,
          }
        );

        // ------------------------------------------------------
        // CHECK RESPONSE
        // ------------------------------------------------------

        if (!response.ok) {
          throw new Error(
            `SSE connection failed: ${response.status}`
          );
        }

        // ------------------------------------------------------
        // CHECK STREAM BODY
        // ------------------------------------------------------

        if (!response.body) {
          throw new Error(
            "SSE response body is not available."
          );
        }

        console.log(
          "HR notification SSE connection established."
        );

        // ------------------------------------------------------
        // CREATE STREAM READER
        // ------------------------------------------------------

        const reader =
          response.body.getReader();

        const decoder =
          new TextDecoder("utf-8");

        let buffer = "";

        // ------------------------------------------------------
        // READ SSE STREAM
        // ------------------------------------------------------

        while (
          !controller.signal.aborted
        ) {
          const { value, done } =
            await reader.read();

          // ----------------------------------------------------
          // STREAM CLOSED
          // ----------------------------------------------------

          if (done) {
            console.log(
              "HR notification SSE connection closed."
            );

            break;
          }

          // ----------------------------------------------------
          // CONVERT BYTES TO TEXT
          // ----------------------------------------------------

          buffer += decoder.decode(
            value,
            {
              stream: true,
            }
          );

          // ----------------------------------------------------
          // SSE EVENTS ARE SEPARATED BY BLANK LINE
          // ----------------------------------------------------

          const events =
            buffer.split(/\r?\n\r?\n/);

          // Keep incomplete event
          buffer =
            events.pop() || "";

          // ----------------------------------------------------
          // PROCESS EACH EVENT
          // ----------------------------------------------------

          for (const eventText of events) {
            if (!eventText.trim()) {
              continue;
            }

            // --------------------------------------------------
            // DEFAULT EVENT TYPE
            // --------------------------------------------------

            let eventType =
              "message";

            let data = "";

            // --------------------------------------------------
            // SPLIT EVENT INTO LINES
            // --------------------------------------------------

            const lines =
              eventText.split(/\r?\n/);

            // --------------------------------------------------
            // READ SSE LINES
            // --------------------------------------------------

            for (const line of lines) {
              // ----------------------------------------------
              // event: connected
              // event: notification
              // ----------------------------------------------

              if (
                line.startsWith("event:")
              ) {
                eventType =
                  line
                    .substring(6)
                    .trim();
              }

              // ----------------------------------------------
              // data: something
              // ----------------------------------------------

              if (
                line.startsWith("data:")
              ) {
                const lineData =
                  line
                    .substring(5)
                    .trim();

                data += lineData;
              }
            }

            // --------------------------------------------------
            // NOTHING TO PROCESS
            // --------------------------------------------------

            if (!data) {
              continue;
            }

            console.log(
              "HR SSE event:",
              eventType
            );

            console.log(
              "HR SSE data:",
              data
            );

            // ==================================================
            // INITIAL CONNECTION EVENT
            // ==================================================

            if (
              eventType ===
              "connected"
            ) {
              console.log(
                "HR SSE connection confirmation received."
              );

              continue;
            }

            // ==================================================
            // REAL NOTIFICATION EVENT
            // ==================================================

            if (
              eventType ===
              "notification"
            ) {
              let newNotification;

              // ------------------------------------------------
              // PARSE JSON
              // ------------------------------------------------

              try {
                newNotification =
                  JSON.parse(data);
              } catch (parseError) {
                console.warn(
                  "Invalid HR notification JSON:",
                  data
                );

                continue;
              }

              console.log(
                "HR SSE notification received:",
                newNotification
              );

              // ------------------------------------------------
              // PREVENT DUPLICATE NOTIFICATIONS
              // ------------------------------------------------

              setNotifications(
                (previousNotifications) => {
                  const alreadyExists =
                    previousNotifications.some(
                      (notification) =>
                        String(
                          notification.notificationId
                        ) ===
                        String(
                          newNotification.notificationId
                        )
                    );

                  if (
                    alreadyExists
                  ) {
                    console.log(
                      "Duplicate HR notification ignored."
                    );

                    return previousNotifications;
                  }

                  return [
                    newNotification,
                    ...previousNotifications,
                  ];
                }
              );

              // ------------------------------------------------
              // UPDATE STATISTICS
              // ------------------------------------------------

              setStats(
                (previousStats) => ({
                  totalNotifications:
                    previousStats.totalNotifications +
                    1,

                  unread:
                    previousStats.unread +
                    1,
                })
              );
            }
          }
        }
      } catch (error) {
        // ------------------------------------------------------
        // SSE WAS INTENTIONALLY STOPPED
        // ------------------------------------------------------

        if (
          error.name ===
          "AbortError"
        ) {
          console.log(
            "HR notification SSE connection aborted."
          );

          return;
        }

        // ------------------------------------------------------
        // SSE ERROR
        // ------------------------------------------------------

        console.error(
          "HR notification SSE error:",
          error
        );

        setError(
          "Real-time notification connection failed."
        );
      }
    };

    // Start SSE
    startSSE();

    // Return controller so useEffect can abort it
    return controller;
  };

  // ============================================================
  // INITIAL LOAD + SSE
  // ============================================================

  useEffect(() => {
    // Load existing notifications
    loadNotifications();

    // Start real-time SSE connection
    const controller =
      connectNotificationStream();

    // ----------------------------------------------------------
    // CLOSE SSE WHEN LEAVING PAGE
    // ----------------------------------------------------------

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  // ============================================================
  // MARK ONE NOTIFICATION AS READ
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

      // --------------------------------------------------------
      // UPDATE NOTIFICATION LOCALLY
      // --------------------------------------------------------

      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (notification) =>
              String(
                notification.notificationId
              ) ===
              String(notificationId)
                ? {
                    ...notification,
                    readStatus: true,
                  }
                : notification
          )
      );

      // --------------------------------------------------------
      // UPDATE UNREAD COUNT
      // --------------------------------------------------------

      setStats(
        (previousStats) => ({
          ...previousStats,

          unread: Math.max(
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
  // MARK ALL NOTIFICATIONS AS READ
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

        // ------------------------------------------------------
        // UPDATE ALL NOTIFICATIONS LOCALLY
        // ------------------------------------------------------

        setNotifications(
          (previousNotifications) =>
            previousNotifications.map(
              (notification) => ({
                ...notification,
                readStatus: true,
              })
            )
        );

        // ------------------------------------------------------
        // UPDATE UNREAD COUNT
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // FIND NOTIFICATION BEFORE DELETING
        // ------------------------------------------------------

        const notificationToDelete =
          notifications.find(
            (notification) =>
              String(
                notification.notificationId
              ) ===
              String(notificationId)
          );

        // ------------------------------------------------------
        // DELETE FROM BACKEND
        // ------------------------------------------------------

        await apiRequest(
          `/notifications/${notificationId}`,
          {
            method: "DELETE",
          }
        );

        // ------------------------------------------------------
        // REMOVE FROM UI
        // ------------------------------------------------------

        setNotifications(
          (previousNotifications) =>
            previousNotifications.filter(
              (notification) =>
                String(
                  notification.notificationId
                ) !==
                String(notificationId)
            )
        );

        // ------------------------------------------------------
        // UPDATE STATISTICS
        // ------------------------------------------------------

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
                    previousStats.unread -
                      1
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
  // NOTIFICATION TYPE LABEL
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

      case "LEAVE_APPLIED":
        return "Leave Applied";

      case "LEAVE_APPROVED":
        return "Leave Approved";

      case "LEAVE_REJECTED":
        return "Leave Rejected";

      case "INTERVIEW_SCHEDULED":
        return "Interview Scheduled";

      case "INTERVIEW_RESCHEDULED":
        return "Interview Rescheduled";

      case "INTERVIEW_CANCELLED":
        return "Interview Cancelled";

      default:
        return type || "Notification";
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

      case "LEAVE_APPLIED":
        return "📝";

      case "LEAVE_APPROVED":
        return "✅";

      case "LEAVE_REJECTED":
        return "❌";

      case "INTERVIEW_SCHEDULED":
        return "📅";

      case "INTERVIEW_RESCHEDULED":
        return "📅";

      case "INTERVIEW_CANCELLED":
        return "❌";

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