import React, { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";

import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/employeeService";

import "./EmployeeNotifications.css";

function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([]);

  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await getMyNotifications();

      // Backend wraps responses as ApiResponse<List<Notification>>
      // (per the Swagger schema ApiResponseListNotification), so the
      // real array usually sits under response.data.data. Confirm the
      // exact field names below (title/message/read/createdAt) against
      // the Notification schema in Swagger and adjust if they differ.
      const list = response.data?.data || response.data || [];

      const mapped = list.map((n) => ({
        id: n.id,
        title: n.title || n.subject || "Notification",
        message: n.message || n.description || "",
        time: n.createdAt || n.time || "",
        type: n.type || "general",
        unread: n.read === false || n.unread === true,
      }));

      setNotifications(mapped);

      console.log(
        "Employee notifications loaded:",
        mapped
      );
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError("Unable to load notifications right now.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SSE - REAL-TIME NOTIFICATION STREAM
  // ============================================================

  const connectNotificationStream = () => {
    const token =
      localStorage.getItem("token");

    // ----------------------------------------------------------
    // No token = don't start SSE
    // ----------------------------------------------------------

    if (!token) {
      console.warn(
        "No JWT token found. SSE connection not started."
      );

      return null;
    }

    const controller =
      new AbortController();

    // ----------------------------------------------------------
    // START SSE CONNECTION
    // ----------------------------------------------------------

    const startSSE = async () => {
      try {
        console.log(
          "Connecting to employee notification SSE..."
        );

        const response = await fetch(
          `${API_BASE}/notifications/stream`,
          {
            method: "GET",

           headers: {
  Accept: "text/event-stream",
  Authorization: `Bearer ${token}`,
},

            signal:
              controller.signal,
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
        // CHECK STREAM
        // ------------------------------------------------------

        if (!response.body) {
          throw new Error(
            "SSE response body is not available."
          );
        }

        console.log(
          "Employee notification SSE connection established."
        );

        // ------------------------------------------------------
        // READ STREAM
        // ------------------------------------------------------

        const reader =
          response.body.getReader();

        const decoder =
          new TextDecoder("utf-8");

        let buffer = "";

        // ------------------------------------------------------
        // KEEP READING WHILE CONNECTION IS OPEN
        // ------------------------------------------------------

        while (true) {
          const {
            value,
            done,
          } = await reader.read();

          // ----------------------------------------------------
          // CONNECTION CLOSED
          // ----------------------------------------------------

          if (done) {
            console.log(
              "Employee notification SSE connection closed."
            );

            break;
          }

          // ----------------------------------------------------
          // CONVERT STREAM CHUNK TO TEXT
          // ----------------------------------------------------

          buffer += decoder.decode(
            value,
            {
              stream: true,
            }
          );

          // ----------------------------------------------------
          // SSE EVENTS ARE SEPARATED BY EMPTY LINE
          // ----------------------------------------------------

          const events =
            buffer.split("\n\n");

          // Keep incomplete event
          buffer =
            events.pop() || "";

          // ----------------------------------------------------
          // PROCESS EVENTS
          // ----------------------------------------------------

          for (const event of events) {
            const lines =
              event.split("\n");

            let data = "";

            for (const line of lines) {
              if (
                line.startsWith("data:")
              ) {
                data += line
                  .substring(5)
                  .trim();
              }
            }

            // --------------------------------------------------
            // IGNORE EMPTY EVENTS / HEARTBEATS
            // --------------------------------------------------

            if (!data) {
              continue;
            }

            console.log(
              "Employee SSE notification received:",
              data
            );

            // --------------------------------------------------
            // PARSE JSON
            // --------------------------------------------------

            let incomingNotification;

           try {
  incomingNotification =
    JSON.parse(data);
} catch (parseError) {

  // Backend sends this when the SSE connection starts
  // It is not an actual notification.
  if (
    data ===
    "Notification stream connected"
  ) {
    console.log(
      "SSE connection confirmation received."
    );

    continue;
  }

  console.warn(
    "SSE data is not JSON:",
    data
  );

  continue;
}

            // --------------------------------------------------
            // HANDLE POSSIBLE BACKEND WRAPPER
            // --------------------------------------------------

            if (
              incomingNotification?.data &&
              typeof incomingNotification.data ===
                "object"
            ) {
              incomingNotification =
                incomingNotification.data;
            }

            console.log(
              "Parsed SSE notification:",
              incomingNotification
            );

            // --------------------------------------------------
            // NORMALIZE SSE NOTIFICATION
            // --------------------------------------------------

            const notificationId =
              incomingNotification.id ??
              incomingNotification.notificationId ??
              `${Date.now()}-${Math.random()}`;

            const newNotification = {
              id: notificationId,

              title:
                incomingNotification.title ||
                incomingNotification.subject ||
                getNotificationTypeLabel(
                  incomingNotification.type
                ) ||
                "Notification",

              message:
                incomingNotification.message ||
                incomingNotification.description ||
                "",

              time:
                incomingNotification.createdAt ||
                incomingNotification.time ||
                new Date().toISOString(),

              type:
                incomingNotification.type ||
                "general",

              unread: true,
            };

            // --------------------------------------------------
            // ADD NEW NOTIFICATION TO THE LIST
            // --------------------------------------------------

            setNotifications(
              (previousNotifications) => {
                const alreadyExists =
                  previousNotifications.some(
                    (notification) =>
                      String(
                        notification.id
                      ) ===
                      String(
                        newNotification.id
                      )
                  );

                // Prevent duplicate notification
                if (alreadyExists) {
                  return previousNotifications;
                }

                return [
                  newNotification,
                  ...previousNotifications,
                ];
              }
            );

            // --------------------------------------------------
            // SHOW SUCCESS MESSAGE
            // --------------------------------------------------

            console.log(
              "New notification added through SSE:",
              newNotification
            );
          }
        }
      } catch (error) {
        // ------------------------------------------------------
        // ABORT IS NORMAL WHEN PAGE IS CLOSED
        // ------------------------------------------------------

        if (
          error.name ===
          "AbortError"
        ) {
          console.log(
            "Employee notification SSE connection stopped."
          );

          return;
        }

        // ------------------------------------------------------
        // OTHER SSE ERRORS
        // ------------------------------------------------------

        console.error(
          "Employee notification SSE error:",
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
  // INITIAL LOAD + SSE CONNECTION
  // ============================================================

  useEffect(() => {
    // ----------------------------------------------------------
    // STEP 1
    // Load existing notifications
    // ----------------------------------------------------------

    fetchNotifications();

    // ----------------------------------------------------------
    // STEP 2
    // Start SSE connection
    // ----------------------------------------------------------

    const controller =
      connectNotificationStream();

    // ----------------------------------------------------------
    // STEP 3
    // CLOSE SSE WHEN PAGE IS LEFT
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

  // =========================================================
  // NOTIFICATION TITLE
  // =========================================================
  const getNotificationTitle = (type) => {
    switch (type) {
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
        return "Notification";
    }
  };

  // =========================================================
  // SSE CONNECTION
  // =========================================================
  useEffect(() => {
    fetchNotifications();

    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No JWT token found. SSE connection skipped.");
      return;
    }

    const controller = new AbortController();

    const connectSSE = async () => {
      try {
        console.log("Connecting to employee notification SSE...");

        const response = await fetch(
          `${API_BASE}/notifications/stream`,
          {
            method: "GET",
            headers: {
              Accept: "text/event-stream",
              Authorization: `Bearer ${token}`,
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
          throw new Error("SSE response body is not available.");
        }

        console.log(
          "Employee notification SSE connection established."
        );

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let buffer = "";

        while (!controller.signal.aborted) {
          const { value, done } = await reader.read();

          if (done) {
            console.log("Employee SSE connection closed.");
            break;
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          // SSE events end with a blank line
          const events = buffer.split("\n\n");

          // Keep incomplete event in buffer
          buffer = events.pop() || "";

          for (const eventText of events) {
            if (!eventText.trim()) {
              continue;
            }

            let eventType = "message";
            let data = "";

            const lines = eventText.split("\n");

            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventType = line
                  .substring(6)
                  .trim();
              }

              if (line.startsWith("data:")) {
                data += line
                  .substring(5)
                  .trim();
              }
            }

            console.log(
              "Employee SSE event:",
              eventType,
              data
            );

            // =============================================
            // INITIAL CONNECTION EVENT
            // =============================================
            if (eventType === "connected") {
              console.log(
                "SSE connection confirmation received."
              );
              continue;
            }

            // =============================================
            // ACTUAL NOTIFICATION EVENT
            // =============================================
            if (eventType === "notification") {
              try {
                const notification = JSON.parse(data);

                console.log(
                  "Employee SSE notification received:",
                  notification
                );

                const mappedNotification = {
                  id:
                    notification.notificationId ??
                    notification.id,

                  title: getNotificationTitle(
                    notification.type
                  ),

                  message:
                    notification.message || "",

                  time:
                    notification.createdAt ||
                    new Date().toISOString(),

                  type:
                    notification.type ||
                    "GENERAL",

                  unread:
                    notification.readStatus === false,
                };

                // =========================================
                // PREVENT DUPLICATE NOTIFICATIONS
                // =========================================
                setNotifications((prev) => {
                  const exists = prev.some(
                    (item) =>
                      String(item.id) ===
                      String(mappedNotification.id)
                  );

                  if (exists) {
                    console.log(
                      "Duplicate SSE notification ignored."
                    );

                    return prev;
                  }

                  return [
                    mappedNotification,
                    ...prev,
                  ];
                });
              } catch (parseError) {
                console.error(
                  "Failed to parse SSE notification:",
                  parseError
                );
              }
            }
          }
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log(
            "Employee SSE connection aborted."
          );
        } else {
          console.error(
            "Employee SSE connection error:",
            err
          );
        }
      }
    };

    connectSSE();

    // =============================================
    // CLEANUP
    // =============================================
    return () => {
      console.log(
        "Closing employee notification SSE..."
      );

      controller.abort();
    };
  }, []);

  // =========================================================
  // MARK AS READ
  // =========================================================
  const markAsRead = async (id) => {
    // Optimistic update, rolled back if the request fails
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, unread: true }
            : notification
        )
      );
    }
  };

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  // =========================================================
  // MARK ALL AS READ
  // =========================================================
  const markAllAsRead = async () => {
    const previous = notifications;

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false }))
    );

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
      setNotifications(previous);
    }
  };

  // No DELETE endpoint exists on the backend for notifications yet.
  // This only removes the item from the current view — it will
  // reappear on next fetch until a delete endpoint is added.
  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // ============================================================
  // FILTER NOTIFICATIONS
  // ============================================================

  // =========================================================
  // FILTER
  // =========================================================
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((notification) => notification.unread)
      : notifications;

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <div className="employee-layout">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <EmployeeSidebar />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="employee-main">

        {/* ====================================================
            TOPBAR
        ==================================================== */}

        <EmployeeTopbar />

        {/* ====================================================
            NOTIFICATION PAGE
        ==================================================== */}

        <main className="notifications-page">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="notifications-header">

            <div>
              <h1>Notifications</h1>
              <p>Stay updated with your employee activities.</p>
            </div>

            {/* MARK ALL AS READ */}

            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={
                  markAllAsRead
                }
              >
                <CheckCheck
                  size={17}
                />

                Mark all as read
              </button>
            )}

          </div>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div className="notification-summary">

            {/* TOTAL */}

            <div className="notification-count-card">

              <div className="notification-icon">
                <Bell size={22} />
              </div>

              <div>
                <span>Total Notifications</span>
                <strong>{notifications.length}</strong>
              </div>

            </div>

            {/* UNREAD */}

            <div className="notification-count-card">

              <div className="notification-icon unread-icon">
                <Bell size={22} />
              </div>

              <div>
                <span>
                  Unread Notifications
                </span>

                <strong>
                  {unreadCount}
                </strong>
              </div>

            </div>

          </div>

          {/* ==================================================
              NOTIFICATION CONTENT
          ================================================== */}

          <div className="notification-content">

            {/* ==================================================
                TOOLBAR
            ================================================== */}

            <div className="notification-toolbar">

              <h2>
                Recent Notifications
              </h2>

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

            {/* ==================================================
                NOTIFICATION LIST
            ================================================== */}

            <div className="notification-list">

              {/* LOADING */}

              {loading ? (
                <div className="empty-notifications">

                  <Bell size={42} />
                  <h3>Loading notifications...</h3>
                </div>

              ) : error ? (

                /* ERROR */

                <div className="empty-notifications">

                  <Bell size={42} />
                  <h3>Something went wrong</h3>
                  <p>{error}</p>
                </div>

              ) : filteredNotifications.length === 0 ? (

                /* EMPTY */

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

                        <p>
                          {notification.message}
                        </p>

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