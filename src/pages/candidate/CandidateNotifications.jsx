import { useMemo, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCheck,
  FileText,
  Gift,
  Search,
  Trash2,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import "./CandidateDashboard.css";

function CandidateNotifications() {
  // Temporary frontend data.
  // Backend notification API will replace this later.
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "INTERVIEW",
      title: "Interview Scheduled",
      message:
        "Your technical interview for Java Backend Developer at Anasol Technologies is scheduled for 18 Sep 2026 at 11:00 AM.",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "OFFER",
      title: "New Job Offer",
      message:
        "Congratulations! You have received an offer for the Java Backend Developer position at Anasol Technologies.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "APPLICATION",
      title: "Application Shortlisted",
      message:
        "Your application for Full Stack Developer at TechNova Solutions has been shortlisted.",
      time: "Yesterday",
      read: true,
    },
    {
      id: 4,
      type: "APPLICATION",
      title: "Application Screened",
      message:
        "Your application for Software Engineer at CloudMatrix has completed the screening stage.",
      time: "2 days ago",
      read: true,
    },
    {
      id: 5,
      type: "JOB",
      title: "New Recommended Job",
      message:
        "A new Spring Boot Developer position matching your profile is available.",
      time: "3 days ago",
      read: true,
    },
  ]);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = useMemo(() => {
    const value = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Unread" && !notification.read) ||
        notification.type === filter;

      const matchesSearch =
        !value ||
        notification.title.toLowerCase().includes(value) ||
        notification.message.toLowerCase().includes(value);

      return matchesFilter && matchesSearch;
    });
  }, [notifications, filter, search]);

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id
      )
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "INTERVIEW":
        return <CalendarDays size={18} />;

      case "OFFER":
        return <Gift size={18} />;

      case "APPLICATION":
        return <FileText size={18} />;

      case "JOB":
        return <BriefcaseBusiness size={18} />;

      default:
        return <Bell size={18} />;
    }
  };

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          {/* HEADER */}

          <div className="candidate-notification-header">
            <div>
              <p className="candidate-label">
                NOTIFICATIONS
              </p>

              <h1>Notifications</h1>

              <p>
                Stay updated about your applications,
                interviews, job offers and opportunities.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="candidate-mark-all-read"
                onClick={markAllAsRead}
              >
                <CheckCheck size={16} />
                Mark All as Read
              </button>
            )}
          </div>

          {/* SUMMARY */}

          <section className="candidate-notification-summary">
            <div className="candidate-notification-summary-card">
              <div className="candidate-notification-summary-icon">
                <Bell size={20} />
              </div>

              <div>
                <span>Total Notifications</span>
                <strong>{notifications.length}</strong>
              </div>
            </div>

            <div className="candidate-notification-summary-card">
              <div className="candidate-notification-summary-icon unread">
                <Bell size={20} />
              </div>

              <div>
                <span>Unread</span>
                <strong>{unreadCount}</strong>
              </div>
            </div>
          </section>

          {/* FILTERS */}

          <section className="candidate-notification-filters">
            <div className="candidate-notification-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="candidate-notification-filter-buttons">
              {[
                "All",
                "Unread",
                "APPLICATION",
                "INTERVIEW",
                "OFFER",
                "JOB",
              ].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    filter === item ? "active" : ""
                  }
                  onClick={() => setFilter(item)}
                >
                  {item === "APPLICATION"
                    ? "Applications"
                    : item === "INTERVIEW"
                    ? "Interviews"
                    : item === "OFFER"
                    ? "Offers"
                    : item === "JOB"
                    ? "Jobs"
                    : item}
                </button>
              ))}
            </div>
          </section>

          {/* NOTIFICATIONS */}

          {filteredNotifications.length > 0 ? (
            <section className="candidate-notification-list">
              {filteredNotifications.map(
                (notification) => (
                  <article
                    key={notification.id}
                    className={`candidate-notification-item ${
                      !notification.read ? "unread" : ""
                    }`}
                  >
                    {!notification.read && (
                      <span className="candidate-notification-unread-dot" />
                    )}

                    <div
                      className={`candidate-notification-type-icon ${notification.type.toLowerCase()}`}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    <div className="candidate-notification-content">
                      <div className="candidate-notification-title-row">
                        <h3>{notification.title}</h3>

                        {!notification.read && (
                          <span>New</span>
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <small>
                        {notification.time}
                      </small>
                    </div>

                    <div className="candidate-notification-actions">
                      {!notification.read && (
                        <button
                          type="button"
                          title="Mark as read"
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                        >
                          <Check size={16} />
                        </button>
                      )}

                      <button
                        type="button"
                        title="Delete notification"
                        className="delete"
                        onClick={() =>
                          deleteNotification(
                            notification.id
                          )
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                )
              )}
            </section>
          ) : (
            <div className="candidate-notification-empty">
              <Bell size={32} />

              <h3>No notifications found</h3>

              <p>
                There are no notifications matching your
                current filters.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CandidateNotifications;