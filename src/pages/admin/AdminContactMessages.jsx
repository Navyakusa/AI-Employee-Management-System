import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  MailOpen,
  User,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

import "./AdminContactMessages.css";

function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMessage, setSelectedMessage] =
    useState(null);

  const [resolution, setResolution] = useState("");
  const [actionLoading, setActionLoading] =
    useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] =
    useState("");

  // ==========================================
  // API BASE
  // ==========================================

  const API_BASE =
    "http://localhost:8080/api/contact/messages";

  // ==========================================
  // GET TOKEN
  // ==========================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ==========================================
  // FETCH ALL CONTACT MESSAGES
  // GET /api/contact/messages
  // ==========================================

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(API_BASE, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch contact messages: ${response.status}`
        );
      }

      const result = await response.json();

      console.log(
        "Contact messages response:",
        result
      );

      if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setMessages(result.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error(
        "Contact messages fetch error:",
        err
      );

      setError(
        "Unable to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ==========================================
  // UPDATE MESSAGE LOCALLY
  // ==========================================

  const updateMessageInState = (
    messageId,
    updatedMessage
  ) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? {
              ...message,
              ...updatedMessage,
            }
          : message
      )
    );

    setSelectedMessage((prev) =>
      prev?.id === messageId
        ? {
            ...prev,
            ...updatedMessage,
          }
        : prev
    );
  };

  // ==========================================
  // MARK MESSAGE AS READ
  // PUT /api/contact/messages/{id}/read
  // ==========================================

  const markAsRead = async (messageId) => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE}/${messageId}/read`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark message as read: ${response.status}`
        );
      }

      const result = await response.json();

      const updated =
        result?.data || {
          read: true,
        };

      updateMessageInState(
        messageId,
        updated
      );
    } catch (err) {
      console.error(
        "Mark contact message as read error:",
        err
      );
    }
  };

  // ==========================================
  // OPEN MESSAGE
  // ==========================================

  const handleOpenMessage = async (message) => {
    setSelectedMessage(message);

    setResolution(
      message.resolution || ""
    );

    setActionError("");
    setActionSuccess("");

    if (!message.read) {
      await markAsRead(message.id);
    }
  };

  // ==========================================
  // UPDATE STATUS
  //
  // PUT
  // /api/contact/messages/{id}/status
  // ?status=IN_PROGRESS
  // ==========================================

  const updateStatus = async (
    messageId,
    status
  ) => {
    try {
      setActionLoading(true);
      setActionError("");
      setActionSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE}/${messageId}/status?status=${encodeURIComponent(
          status
        )}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message =
          "Unable to update message status.";

        try {
          const errorData =
            await response.json();

          message =
            errorData?.message || message;
        } catch {
          // Keep fallback message
        }

        throw new Error(message);
      }

      const result = await response.json();

      const updatedMessage =
        result?.data || {
          status,
        };

      updateMessageInState(
        messageId,
        updatedMessage
      );

      setActionSuccess(
        status === "IN_PROGRESS"
          ? "Message moved to In Progress."
          : "Message status updated successfully."
      );
    } catch (err) {
      console.error(
        "Update contact message status error:",
        err
      );

      setActionError(
        err.message ||
          "Unable to update message status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // START WORKING
  // ==========================================

  const handleStartWorking = async () => {
    if (!selectedMessage?.id) {
      return;
    }

    await updateStatus(
      selectedMessage.id,
      "IN_PROGRESS"
    );
  };

  // ==========================================
  // RESOLVE MESSAGE
  //
  // PUT
  // /api/contact/messages/{id}/resolve
  //
  // {
  //   "resolution": "..."
  // }
  // ==========================================

  const handleResolve = async () => {
    if (!selectedMessage?.id) {
      return;
    }

    const resolutionText =
      resolution.trim();

    if (!resolutionText) {
      setActionError(
        "Please enter a resolution or reply before resolving."
      );

      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setActionSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE}/${selectedMessage.id}/resolve`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resolution: resolutionText,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Unable to resolve contact message.";

        try {
          const errorData =
            await response.json();

          message =
            errorData?.message || message;
        } catch {
          // Keep fallback message
        }

        throw new Error(message);
      }

      const result = await response.json();

      console.log(
        "Resolve contact message response:",
        result
      );

      const updatedMessage =
        result?.data || {
          status: "RESOLVED",
          resolution: resolutionText,
        };

      updateMessageInState(
        selectedMessage.id,
        updatedMessage
      );

      setResolution(
        updatedMessage.resolution ||
          resolutionText
      );

      setActionSuccess(
        "Message resolved successfully. The user has been notified by email."
      );
    } catch (err) {
      console.error(
        "Resolve contact message error:",
        err
      );

      setActionError(
        err.message ||
          "Unable to resolve contact message."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // FILTER MESSAGES
  // ==========================================

  const filteredMessages = useMemo(() => {
    if (filter === "Unread") {
      return messages.filter(
        (message) => !message.read
      );
    }

    if (filter === "Read") {
      return messages.filter(
        (message) => message.read
      );
    }

    if (filter === "NEW") {
      return messages.filter(
        (message) =>
          (message.status || "NEW") ===
          "NEW"
      );
    }

    if (filter === "IN_PROGRESS") {
      return messages.filter(
        (message) =>
          message.status ===
          "IN_PROGRESS"
      );
    }

    if (filter === "RESOLVED") {
      return messages.filter(
        (message) =>
          message.status === "RESOLVED"
      );
    }

    return messages;
  }, [messages, filter]);

  // ==========================================
  // COUNTS
  // ==========================================

  const unreadCount = messages.filter(
    (message) => !message.read
  ).length;

  const newCount = messages.filter(
    (message) =>
      (message.status || "NEW") === "NEW"
  ).length;

  const inProgressCount = messages.filter(
    (message) =>
      message.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = messages.filter(
    (message) =>
      message.status === "RESOLVED"
  ).length;

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString();
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return "In Progress";

      case "RESOLVED":
        return "Resolved";

      case "NEW":
      default:
        return "New";
    }
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return "in-progress";

      case "RESOLVED":
        return "resolved";

      case "NEW":
      default:
        return "new";
    }
  };

  return (
    <div className="admin-contact-layout">
      <AdminSidebar />

      <div className="admin-contact-main">
        <AdminNavbar />

        <main className="admin-contact-content">

          {/* HEADER */}

          <div className="admin-contact-header">
            <div>
              <p>CONTACT MESSAGES</p>

              <h1>Contact Messages</h1>

              <span>
                View and manage messages submitted
                from the public Contact Us page.
              </span>
            </div>
          </div>


          {/* SUMMARY */}

          <div className="admin-contact-summary">

            <div className="admin-contact-summary-card">
              <div className="admin-contact-summary-icon">
                <Mail size={21} />
              </div>

              <div>
                <span>Total Messages</span>
                <strong>
                  {messages.length}
                </strong>
              </div>
            </div>


            <div className="admin-contact-summary-card">
              <div className="admin-contact-summary-icon">
                <MailOpen size={21} />
              </div>

              <div>
                <span>Unread Messages</span>
                <strong>
                  {unreadCount}
                </strong>
              </div>
            </div>


            <div className="admin-contact-summary-card">
              <div className="admin-contact-summary-icon">
                <Mail size={21} />
              </div>

              <div>
                <span>New</span>
                <strong>
                  {newCount}
                </strong>
              </div>
            </div>


            <div className="admin-contact-summary-card">
              <div className="admin-contact-summary-icon">
                <Clock3 size={21} />
              </div>

              <div>
                <span>In Progress</span>
                <strong>
                  {inProgressCount}
                </strong>
              </div>
            </div>


            <div className="admin-contact-summary-card">
              <div className="admin-contact-summary-icon">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Resolved</span>
                <strong>
                  {resolvedCount}
                </strong>
              </div>
            </div>

          </div>


          {/* MESSAGES CARD */}

          <section className="admin-contact-card">

            <div className="admin-contact-toolbar">

              <div>
                <h2>Recent Messages</h2>

                <p>
                  Messages received from candidates
                  and website visitors.
                </p>
              </div>


              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
              >
                <option value="All">
                  All
                </option>

                <option value="NEW">
                  New
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="RESOLVED">
                  Resolved
                </option>

                <option value="Unread">
                  Unread
                </option>

                <option value="Read">
                  Read
                </option>
              </select>

            </div>


            <div className="admin-contact-list">

              {loading && (
                <div className="admin-contact-empty">
                  Loading contact messages...
                </div>
              )}


              {!loading && error && (
                <div className="admin-contact-empty">
                  {error}
                </div>
              )}


              {!loading &&
              !error &&
              filteredMessages.length > 0 ? (

                filteredMessages.map(
                  (message) => {

                    const status =
                      message.status ||
                      "NEW";

                    return (
                      <div
                        key={message.id}
                        className={`admin-contact-item ${
                          message.read
                            ? "read"
                            : "unread"
                        }`}
                        onClick={() =>
                          handleOpenMessage(
                            message
                          )
                        }
                      >

                        <div className="admin-contact-icon">
                          <User size={19} />
                        </div>


                        <div className="admin-contact-info">

                          <div className="admin-contact-title-row">

                            <h3>
                              {message.fullName}
                            </h3>


                            {!message.read && (
                              <span className="admin-contact-unread-dot" />
                            )}


                            <span
                              className={`admin-contact-status-badge ${getStatusClass(
                                status
                              )}`}
                            >
                              {getStatusLabel(
                                status
                              )}
                            </span>

                          </div>


                          <span className="admin-contact-email">
                            {message.email}
                          </span>


                          <h4>
                            {message.subject}
                          </h4>


                          <p>
                            {message.message}
                          </p>


                          <span className="admin-contact-time">
                            <CalendarDays
                              size={13}
                            />

                            {formatDate(
                              message.createdAt
                            )}
                          </span>

                        </div>


                        {!message.read && (
                          <button
                            type="button"
                            className="admin-contact-read-btn"
                            onClick={(e) => {
                              e.stopPropagation();

                              markAsRead(
                                message.id
                              );
                            }}
                          >
                            Mark as Read
                          </button>
                        )}

                      </div>
                    );
                  }
                )

              ) : (

                !loading &&
                !error && (
                  <div className="admin-contact-empty">
                    <Mail size={30} />

                    <h3>
                      No contact messages found
                    </h3>

                    <p>
                      There are no messages for
                      the selected filter.
                    </p>
                  </div>
                )
              )}

            </div>

          </section>

        </main>
      </div>


      {/* MESSAGE DETAILS MODAL */}

      {selectedMessage && (
        <div
          className="admin-contact-modal-overlay"
          onClick={() =>
            setSelectedMessage(null)
          }
        >

          <div
            className="admin-contact-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="admin-contact-modal-header">

              <div>
                <span>
                  CONTACT MESSAGE
                </span>

                <h2>
                  {selectedMessage.subject}
                </h2>
              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedMessage(null)
                }
              >
                ×
              </button>

            </div>


            <div className="admin-contact-modal-sender">

              <div>
                <span>From</span>

                <strong>
                  {selectedMessage.fullName}
                </strong>
              </div>


              <div>
                <span>Email</span>

                <strong>
                  {selectedMessage.email}
                </strong>
              </div>


              <div>
                <span>Received</span>

                <strong>
                  {formatDate(
                    selectedMessage.createdAt
                  )}
                </strong>
              </div>


              <div>
                <span>Status</span>

                <strong
                  className={`admin-contact-status-badge ${getStatusClass(
                    selectedMessage.status ||
                      "NEW"
                  )}`}
                >
                  {getStatusLabel(
                    selectedMessage.status ||
                      "NEW"
                  )}
                </strong>
              </div>

            </div>


            <div className="admin-contact-modal-message">

              <span>Message</span>

              <p>
                {selectedMessage.message}
              </p>

            </div>


            {/* NEW MESSAGE */}

            {(selectedMessage.status ||
              "NEW") === "NEW" && (

              <div className="admin-contact-resolution-section">

                <h3>
                  Manage Issue
                </h3>

                <p>
                  Start working on this message
                  before resolving the issue.
                </p>

                <button
                  type="button"
                  className="admin-contact-progress-btn"
                  disabled={actionLoading}
                  onClick={
                    handleStartWorking
                  }
                >
                  {actionLoading
                    ? "Updating..."
                    : "Start Working"}
                </button>

              </div>
            )}


            {/* IN PROGRESS */}

            {selectedMessage.status ===
              "IN_PROGRESS" && (

              <div className="admin-contact-resolution-section">

                <h3>
                  Resolution / Reply
                </h3>

                <p>
                  Enter the resolution that
                  should be sent to the user.
                </p>

                <textarea
                  rows="5"
                  value={resolution}
                  onChange={(e) => {
                    setResolution(
                      e.target.value
                    );

                    setActionError("");
                    setActionSuccess("");
                  }}
                  placeholder="Enter resolution or reply..."
                />


                <button
                  type="button"
                  className="admin-contact-resolve-btn"
                  disabled={actionLoading}
                  onClick={handleResolve}
                >
                  {actionLoading
                    ? "Resolving..."
                    : "Resolve & Notify User"}
                </button>

              </div>
            )}


            {/* RESOLVED */}

            {selectedMessage.status ===
              "RESOLVED" && (

              <div className="admin-contact-resolution-section resolved">

                <div className="admin-contact-resolution-title">
                  <CheckCircle2
                    size={20}
                  />

                  <h3>
                    Issue Resolved
                  </h3>
                </div>


                <div className="admin-contact-resolution-content">

                  <span>
                    Resolution / Reply
                  </span>

                  <p>
                    {selectedMessage.resolution ||
                      "No resolution information available."}
                  </p>

                </div>


                {selectedMessage.resolvedAt && (
                  <div className="admin-contact-resolved-time">

                    <CalendarDays
                      size={15}
                    />

                    Resolved on{" "}
                    {formatDate(
                      selectedMessage.resolvedAt
                    )}

                  </div>
                )}

              </div>
            )}


            {actionError && (
              <div className="admin-contact-action-error">
                {actionError}
              </div>
            )}


            {actionSuccess && (
              <div className="admin-contact-action-success">
                {actionSuccess}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminContactMessages;