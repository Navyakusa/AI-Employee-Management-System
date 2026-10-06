import React, { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";

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

  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  // =========================================================
  // LOAD EXISTING NOTIFICATIONS
  // =========================================================
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyNotifications();

      const list = response.data?.data || response.data || [];

      const mapped = list.map((n) => ({
        id: n.notificationId ?? n.id,
        title: getNotificationTitle(n.type),
        message: n.message || "",
        time: n.createdAt || "",
        type: n.type || "GENERAL",
        unread: n.readStatus === false,
      }));

      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications right now.");
    } finally {
      setLoading(false);
    }
  };

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
    setNotifications((prev) =>
      prev.map((notification) =>
        String(notification.id) === String(id)
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );

      // Rollback
      setNotifications((prev) =>
        prev.map((notification) =>
          String(notification.id) === String(id)
            ? {
                ...notification,
                unread: true,
              }
            : notification
        )
      );
    }
  };

  // =========================================================
  // MARK ALL AS READ
  // =========================================================
  const markAllAsRead = async () => {
    const previousNotifications = notifications;

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );

      setNotifications(previousNotifications);
    }
  };

  // =========================================================
  // DELETE NOTIFICATION
  // =========================================================
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Delete failed: ${response.status}`
        );
      }

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            String(notification.id) !== String(id)
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete notification:",
        err
      );
    }
  };

  // =========================================================
  // FILTER
  // =========================================================
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter(
          (notification) => notification.unread
        )
      : notifications;

  // =========================================================
  // UNREAD COUNT
  // =========================================================
  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="employee-layout">
      <EmployeeSidebar />

      <div className="employee-main">
        <EmployeeTopbar />

        <main className="notifications-page">
          <div className="notifications-header">
            <div>
              <h1>Notifications</h1>
              <p>
                Stay updated with your employee activities.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={markAllAsRead}
              >
                <CheckCheck size={17} />
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-summary">
            <div className="notification-count-card">
              <div className="notification-icon">
                <Bell size={22} />
              </div>

              <div>
                <span>Total Notifications</span>
                <strong>
                  {notifications.length}
                </strong>
              </div>
            </div>

            <div className="notification-count-card">
              <div className="notification-icon unread-icon">
                <Bell size={22} />
              </div>

              <div>
                <span>Unread Notifications</span>
                <strong>{unreadCount}</strong>
              </div>
            </div>
          </div>

          <div className="notification-content">
            <div className="notification-toolbar">
              <h2>Recent Notifications</h2>

              <div className="notification-filters">
                <button
                  className={
                    filter === "all" ? "active" : ""
                  }
                  onClick={() => setFilter("all")}
                >
                  All
                </button>

                <button
                  className={
                    filter === "unread" ? "active" : ""
                  }
                  onClick={() => setFilter("unread")}
                >
                  Unread
                </button>
              </div>
            </div>

            <div className="notification-list">
              {loading ? (
                <div className="empty-notifications">
                  <Bell size={42} />
                  <h3>
                    Loading notifications...
                  </h3>
                </div>
              ) : error ? (
                <div className="empty-notifications">
                  <Bell size={42} />
                  <h3>
                    Something went wrong
                  </h3>
                  <p>{error}</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="empty-notifications">
                  <Bell size={42} />
                  <h3>No notifications</h3>
                  <p>
                    You don't have any unread
                    notifications.
                  </p>
                </div>
              ) : (
                filteredNotifications.map(
                  (notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        notification.unread
                          ? "unread"
                          : ""
                      }`}
                    >
                      <div className="notification-item-icon">
                        <Bell size={20} />
                      </div>

                      <div className="notification-details">
                        <div className="notification-title-row">
                          <h3>
                            {notification.title}
                          </h3>

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
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                          >
                            <Check size={18} />
                          </button>
                        )}

                        <button
                          title="Delete"
                          onClick={() =>
                            deleteNotification(
                              notification.id
                            )
                          }
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmployeeNotifications;