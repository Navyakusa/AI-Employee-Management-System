import React, { useEffect, useState } from "react";

import {
  Bell,
  CheckCheck,
  UserCheck,
  CalendarDays,
  MessageSquareText,
  BriefcaseBusiness,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./HiringManagerApi";

import "./HiringManagerNotifications.css";

function HiringManagerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  ======================================================
  FETCH NOTIFICATIONS
  ======================================================
  */

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const [notificationsResponse, unreadResponse] =
        await Promise.all([
          getMyNotifications(),
          getUnreadNotificationCount(),
        ]);

      console.log(
        "Notifications response:",
        notificationsResponse
      );

      console.log(
        "Unread count response:",
        unreadResponse
      );

      const notificationData =
        notificationsResponse?.data || [];

      const unreadData =
        unreadResponse?.data ?? 0;

      setNotifications(notificationData);
      setUnreadCount(Number(unreadData));
    } catch (err) {
      console.error(
        "Failed to fetch notifications:",
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

  /*
  ======================================================
  INITIAL LOAD
  ======================================================
  */

  useEffect(() => {
    fetchNotifications();
  }, []);

  /*
  ======================================================
  MARK ONE AS READ
  ======================================================
  */

  const handleMarkAsRead = async (
    notificationId
  ) => {
    try {
      await markNotificationAsRead(
        notificationId
      );

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

      setUnreadCount((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );

      setError(
        err.message ||
          "Failed to mark notification as read."
      );
    }
  };

  /*
  ======================================================
  MARK ALL AS READ
  ======================================================
  */

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );

      setError(
        err.message ||
          "Failed to mark all notifications as read."
      );
    }
  };

  /*
  ======================================================
  NOTIFICATION ICON
  ======================================================
  */

  const getNotificationIcon = (type) => {
    switch (String(type || "").toUpperCase()) {
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

  /*
  ======================================================
  NOTIFICATION TITLE
  ======================================================
  */

  const getNotificationTitle = (
    notification
  ) => {
    return (
      notification.title ||
      notification.notificationTitle ||
      "Notification"
    );
  };

  /*
  ======================================================
  NOTIFICATION MESSAGE
  ======================================================
  */

  const getNotificationMessage = (
    notification
  ) => {
    return (
      notification.message ||
      notification.description ||
      "You have a new notification."
    );
  };

  /*
  ======================================================
  NOTIFICATION TIME
  ======================================================
  */

  const getNotificationTime = (
    notification
  ) => {
    const value =
      notification.createdAt ||
      notification.timestamp ||
      notification.createdDate ||
      notification.time;

    if (!value) {
      return "Recently";
    }

    if (
      typeof value === "string" &&
      (
        value.includes("ago") ||
        value === "Yesterday"
      )
    ) {
      return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
  ======================================================
  LOADING
  ======================================================
  */

  if (loading) {
    return (
      <div className="hiring-manager-layout">

        <HiringManagerSidebar />

        <div className="hiring-manager-main">

          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">

            <div className="hiring-manager-dashboard-header">

              <p className="hiring-manager-label">
                NOTIFICATIONS
              </p>

              <h1>
                Notifications
              </h1>

              <p>
                Loading your recruitment notifications...
              </p>

            </div>

            <section className="hm-notifications-card">

              <div className="hm-notifications-empty">

                <Clock size={35} />

                <h3>
                  Loading Notifications
                </h3>

                <p>
                  Fetching notifications from the
                  backend.
                </p>

              </div>

            </section>

          </main>

        </div>

      </div>
    );
  }

  /*
  ======================================================
  ERROR
  ======================================================
  */

  if (error && notifications.length === 0) {
    return (
      <div className="hiring-manager-layout">

        <HiringManagerSidebar />

        <div className="hiring-manager-main">

          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">

            <div className="hiring-manager-dashboard-header">

              <p className="hiring-manager-label">
                NOTIFICATIONS
              </p>

              <h1>
                Notifications
              </h1>

              <p>
                Stay updated with candidate, interview
                and recruitment activities.
              </p>

            </div>

            <section className="hm-notifications-card">

              <div className="hm-notifications-empty">

                <AlertCircle size={35} />

                <h3>
                  Unable to Load Notifications
                </h3>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchNotifications}
                >
                  Try Again
                </button>

              </div>

            </section>

          </main>

        </div>

      </div>
    );
  }

  /*
  ======================================================
  RENDER
  ======================================================
  */

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

            <h1>
              Notifications
            </h1>

            <p>
              Stay updated with candidate, interview
              and recruitment activities.
            </p>

          </div>


          {/* ERROR MESSAGE */}

          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 18px",
                borderRadius: "10px",
                background: "#fef2f2",
                color: "#b91c1c",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}


          {/* NOTIFICATION SUMMARY */}

          <section className="hm-notification-summary">

            <div className="hm-notification-summary-card">

              <div className="hm-notification-summary-icon">
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


            <div className="hm-notification-summary-card">

              <div className="hm-notification-summary-icon">
                <MessageSquareText size={21} />
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


          {/* NOTIFICATIONS */}

          <section className="hm-notifications-card">

            <div className="hm-notifications-header">

              <div>

                <h2>
                  Recent Notifications
                </h2>

                <p>
                  Recruitment updates requiring your
                  attention.
                </p>

              </div>


              {unreadCount > 0 && (

                <button
                  type="button"
                  className="hm-mark-all-read-button"
                  onClick={
                    handleMarkAllAsRead
                  }
                >
                  <CheckCheck size={17} />
                  Mark All as Read
                </button>

              )}

            </div>


            <div className="hm-notifications-list">

              {notifications.length > 0 ? (

                notifications.map(
                  (notification) => {

                    const notificationId =
                      notification.id ??
                      notification.notificationId;

                    const isRead =
                      notification.read ??
                      notification.isRead ??
                      false;

                    return (
                      <div
                        key={notificationId}
                        className={`hm-notification-item ${
                          !isRead
                            ? "unread"
                            : ""
                        }`}
                      >

                        {/* ICON */}

                        <div className="hm-notification-icon">

                          {getNotificationIcon(
                            notification.type
                          )}

                        </div>


                        {/* CONTENT */}

                        <div className="hm-notification-content">

                          <div className="hm-notification-title-row">

                            <h3>
                              {getNotificationTitle(
                                notification
                              )}
                            </h3>

                            {!isRead && (
                              <span className="hm-unread-dot" />
                            )}

                          </div>


                          <p>
                            {getNotificationMessage(
                              notification
                            )}
                          </p>


                          <span className="hm-notification-time">

                            {getNotificationTime(
                              notification
                            )}

                          </span>

                        </div>


                        {/* MARK AS READ */}

                        {!isRead && (
                          <button
                            type="button"
                            className="hm-mark-read-button"
                            onClick={() =>
                              handleMarkAsRead(
                                notificationId
                              )
                            }
                          >
                            <CheckCheck size={16} />
                            Mark as Read
                          </button>
                        )}

                      </div>
                    );
                  }
                )

              ) : (

                <div className="hm-notifications-empty">

                  <Bell size={35} />

                  <h3>
                    No Notifications
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

export default HiringManagerNotifications;