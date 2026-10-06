import React, { useEffect, useState } from "react";
import HRSidebar from "./HRSidebar";
import HRNavbar from "./HRNavbar";
import "./HRLeaveRequests.css";

function HRLeaveRequests() {
  const [filter, setFilter] = useState("all");

  const [leaveRequests, setLeaveRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  // ============================================================
  // BACKEND API BASE URL
  // ============================================================

  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  // ============================================================
  // GET JWT TOKEN
  // ============================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Accept: "*/*",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  // ============================================================
  // FETCH ALL EMPLOYEE LEAVE REQUESTS
  // GET /api/leaves
  // ============================================================

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/leaves`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch leave requests: ${response.status}`
        );
      }

      const result = await response.json();

      console.log(
        "HR leave requests response:",
        result
      );

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to load leave requests."
        );
      }

      const leaves = Array.isArray(result.data)
        ? result.data
        : [];

      // --------------------------------------------------------
      // BACKEND RESPONSE
      //
      // {
      //   id,
      //   employeeId,
      //   leaveType,
      //   fromDate,
      //   toDate,
      //   days,
      //   reason,
      //   appliedOn,
      //   status
      // }
      // --------------------------------------------------------

      const mappedLeaves = leaves.map(
        (leave) => ({
          id: leave.id,

          employeeId:
            leave.employeeId ??
            "N/A",

          // Backend currently gives employeeId,
          // not employee name/email.
          employeeName:
            leave.employeeName ||
            `Employee ${leave.employeeId}`,

          employeeEmail:
            leave.employeeEmail ||
            "",

          leaveType:
            leave.leaveType ||
            "Leave",

          fromDate:
            leave.fromDate ||
            "",

          toDate:
            leave.toDate ||
            "",

          days:
            leave.days ?? 0,

          reason:
            leave.reason ||
            "-",

          appliedOn:
            leave.appliedOn ||
            "",

          status:
            leave.status ||
            "PENDING",
        })
      );

      setLeaveRequests(mappedLeaves);
    } catch (err) {
      console.error(
        "Failed to load HR leave requests:",
        err
      );

      setError(
        err.message ||
          "Unable to load leave requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // ============================================================
  // APPROVE LEAVE
  //
  // PUT /api/leaves/{leaveId}/approve
  // ============================================================

  const handleApprove = async (leaveId) => {
    if (!leaveId) {
      return;
    }

    try {
      setActionLoading(leaveId);
      setError("");

      console.log(
        "Approving leave:",
        leaveId
      );

      const response = await fetch(
        `${API_BASE}/leaves/${leaveId}/approve`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      console.log(
        "Approve leave response:",
        result
      );

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to approve leave."
        );
      }

      // --------------------------------------------------------
      // Update UI immediately
      // --------------------------------------------------------

      setLeaveRequests(
        (previousRequests) =>
          previousRequests.map(
            (request) =>
              String(request.id) ===
              String(leaveId)
                ? {
                    ...request,
                    status: "APPROVED",
                  }
                : request
          )
      );

      console.log(
        `Leave ${leaveId} approved successfully.`
      );
    } catch (err) {
      console.error(
        "Failed to approve leave:",
        err
      );

      setError(
        err.message ||
          "Failed to approve leave."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // REJECT LEAVE
  //
  // PUT /api/leaves/{leaveId}/reject
  // ============================================================

  const handleReject = async (leaveId) => {
    if (!leaveId) {
      return;
    }

    try {
      setActionLoading(leaveId);
      setError("");

      console.log(
        "Rejecting leave:",
        leaveId
      );

      const response = await fetch(
        `${API_BASE}/leaves/${leaveId}/reject`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      console.log(
        "Reject leave response:",
        result
      );

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to reject leave."
        );
      }

      // --------------------------------------------------------
      // Update UI immediately
      // --------------------------------------------------------

      setLeaveRequests(
        (previousRequests) =>
          previousRequests.map(
            (request) =>
              String(request.id) ===
              String(leaveId)
                ? {
                    ...request,
                    status: "REJECTED",
                  }
                : request
          )
      );

      console.log(
        `Leave ${leaveId} rejected successfully.`
      );
    } catch (err) {
      console.error(
        "Failed to reject leave:",
        err
      );

      setError(
        err.message ||
          "Failed to reject leave."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredRequests =
    filter === "all"
      ? leaveRequests
      : leaveRequests.filter(
          (request) =>
            request.status ===
            filter.toUpperCase()
        );

  // ============================================================
  // COUNTS
  // ============================================================

  const totalCount =
    leaveRequests.length;

  const pendingCount =
    leaveRequests.filter(
      (request) =>
        request.status === "PENDING"
    ).length;

  const approvedCount =
    leaveRequests.filter(
      (request) =>
        request.status === "APPROVED"
    ).length;

  const rejectedCount =
    leaveRequests.filter(
      (request) =>
        request.status === "REJECTED"
    ).length;

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="employee-layout">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <HRSidebar />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="employee-main">

        {/* TOPBAR */}

        <HRNavbar />

        {/* ====================================================
            PAGE
        ==================================================== */}

        <main className="hr-leave-page">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="hr-leave-header">

            <div>
              <h1>
                Leave Requests
              </h1>

              <p>
                Review and manage employee
                leave requests.
              </p>
            </div>

            {/* REFRESH */}

            <button
              className="refresh-btn"
              onClick={fetchLeaveRequests}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "↻ Refresh"}
            </button>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="hr-leave-error">
              {error}
            </div>
          )}

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="hr-leave-summary">

            <div className="hr-leave-card">

              <span>
                Total Requests
              </span>

              <strong>
                {totalCount}
              </strong>

            </div>

            <div className="hr-leave-card pending">

              <span>
                Pending
              </span>

              <strong>
                {pendingCount}
              </strong>

            </div>

            <div className="hr-leave-card approved">

              <span>
                Approved
              </span>

              <strong>
                {approvedCount}
              </strong>

            </div>

            <div className="hr-leave-card rejected">

              <span>
                Rejected
              </span>

              <strong>
                {rejectedCount}
              </strong>

            </div>

          </div>

          {/* ==================================================
              CONTENT CARD
          ================================================== */}

          <div className="hr-leave-content">

            {/* ==================================================
                TOOLBAR
            ================================================== */}

            <div className="hr-leave-toolbar">

              <h2>
                Employee Leave Requests
              </h2>

              <div className="hr-leave-filters">

                <button
                  className={
                    filter === "all"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("all")
                  }
                >
                  All
                </button>

                <button
                  className={
                    filter === "pending"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("pending")
                  }
                >
                  Pending
                </button>

                <button
                  className={
                    filter === "approved"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("approved")
                  }
                >
                  Approved
                </button>

                <button
                  className={
                    filter === "rejected"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("rejected")
                  }
                >
                  Rejected
                </button>

              </div>

            </div>

            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="hr-leave-table-wrapper">

              <table className="hr-leave-table">

                <thead>

                  <tr>

                    <th>
                      EMPLOYEE
                    </th>

                    <th>
                      LEAVE TYPE
                    </th>

                    <th>
                      FROM
                    </th>

                    <th>
                      TO
                    </th>

                    <th>
                      DAYS
                    </th>

                    <th>
                      REASON
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {/* ==================================================
                      LOADING
                  ================================================== */}

                  {loading ? (

                    <tr>

                      <td
                        colSpan="8"
                        className="hr-leave-empty"
                      >
                        Loading leave requests...
                      </td>

                    </tr>

                  ) : filteredRequests.length === 0 ? (

                    /* ==================================================
                        EMPTY
                    ================================================== */

                    <tr>

                      <td
                        colSpan="8"
                        className="hr-leave-empty"
                      >
                        No leave requests found.
                      </td>

                    </tr>

                  ) : (

                    /* ==================================================
                        REAL BACKEND DATA
                    ================================================== */

                    filteredRequests.map(
                      (request) => (

                        <tr
                          key={request.id}
                        >

                          {/* EMPLOYEE */}

                          <td>

                            <div className="hr-employee-info">

                              <div className="hr-employee-avatar">

                                {request.employeeName
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>

                              <div>

                                <strong>
                                  {
                                    request.employeeName
                                  }
                                </strong>

                                <span>
                                  ID:{" "}
                                  {
                                    request.employeeId
                                  }
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* LEAVE TYPE */}

                          <td>
                            {
                              request.leaveType
                            }
                          </td>

                          {/* FROM */}

                          <td>
                            {formatDate(
                              request.fromDate
                            )}
                          </td>

                          {/* TO */}

                          <td>
                            {formatDate(
                              request.toDate
                            )}
                          </td>

                          {/* DAYS */}

                          <td>
                            {request.days}
                          </td>

                          {/* REASON */}

                          <td className="hr-leave-reason">

                            {request.reason}

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`hr-leave-status ${request.status.toLowerCase()}`}
                            >
                              {
                                request.status
                              }
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td>

                            {request.status ===
                            "PENDING" ? (

                              <div className="hr-leave-actions">

                                {/* APPROVE */}

                                <button
                                  className="approve-btn"
                                  disabled={
                                    actionLoading ===
                                    request.id
                                  }
                                  onClick={() =>
                                    handleApprove(
                                      request.id
                                    )
                                  }
                                >

                                  {actionLoading ===
                                  request.id
                                    ? "Processing..."
                                    : "Approve"}

                                </button>

                                {/* REJECT */}

                                <button
                                  className="reject-btn"
                                  disabled={
                                    actionLoading ===
                                    request.id
                                  }
                                  onClick={() =>
                                    handleReject(
                                      request.id
                                    )
                                  }
                                >

                                  {actionLoading ===
                                  request.id
                                    ? "Processing..."
                                    : "Reject"}

                                </button>

                              </div>

                            ) : (

                              <span className="no-action">
                                —
                              </span>

                            )}

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default HRLeaveRequests;