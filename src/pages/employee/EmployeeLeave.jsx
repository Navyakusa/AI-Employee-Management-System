import React, { useEffect, useState } from "react";
import {
  FileText,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  Plus,
  X,
} from "lucide-react";

import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";

import {
  applyLeave,
  getLeaveTypes,
  getMyLeaves,
  getMyLeaveSummary,
} from "../../services/employeeService";

import "./EmployeeLeave.css";

function EmployeeLeave() {
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  // =========================================================
  // TODAY'S DATE
  // =========================================================
  const today = new Date().toISOString().split("T")[0];

  // =========================================================
  // FETCH ALL LEAVE DATA
  // =========================================================
  const fetchAll = async () => {
    try {
      setLoading(true);

      const [leavesRes, typesRes, summaryRes] = await Promise.all([
        getMyLeaves(),
        getLeaveTypes(),
        getMyLeaveSummary(),
      ]);

      // -----------------------------------------------------
      // MY LEAVE REQUESTS
      // -----------------------------------------------------
      setLeaveRequests(leavesRes.data?.data || []);

      // -----------------------------------------------------
      // LEAVE TYPES
      // Backend returns:
      // [
      //   { leaveType: "Casual Leave" },
      //   { leaveType: "Sick Leave" },
      //   ...
      // ]
      // -----------------------------------------------------
      const types = (typesRes.data?.data || [])
        .map((type) => type.leaveType)
        .filter(Boolean);

      setLeaveTypes(types);

      // -----------------------------------------------------
      // LEAVE SUMMARY
      // -----------------------------------------------------
      setSummary(summaryRes.data?.data || null);
      const requests = leavesRes.data?.data || [];
      setLeaveRequests(requests);

      // Use the actual leave request list for request counts. The backend
      // summary can become stale/inconsistent with the rows shown below.
      const normalizeStatus = (status) =>
        String(status || "").trim().toUpperCase();

      const pendingRequests = requests.filter(
        (request) => normalizeStatus(request.status) === "PENDING"
      ).length;

      const approvedRequests = requests.filter(
        (request) => normalizeStatus(request.status) === "APPROVED"
      );

      const usedLeave = approvedRequests.reduce((total, request) => {
        const days = Number(request.days);
        return total + (Number.isFinite(days) ? days : 0);
      }, 0);

      const backendSummary = summaryRes.data?.data || {};
      setSummary({
        ...backendSummary,
        pendingRequests,
        approvedLeave: approvedRequests.length,
        usedLeave,
      });

      // LeaveTypeDto: { leaveType: string }
      setLeaveTypes((typesRes.data?.data || []).map((t) => t.leaveType));
    } catch (err) {
      console.error("Failed to load leave data:", err);

      const backendMessage =
        err.response?.data?.message ||
        "Failed to load leave data.";

      console.error("Backend message:", backendMessage);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    fetchAll();
  }, []);

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // CALCULATE LEAVE DAYS
  // =========================================================
  const calculateDays = () => {
    if (!formData.fromDate || !formData.toDate) {
      return 0;
    }

    const from = new Date(`${formData.fromDate}T00:00:00`);
    const to = new Date(`${formData.toDate}T00:00:00`);

    if (to < from) {
      return 0;
    }

    const difference = to.getTime() - from.getTime();

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  };

  // =========================================================
  // OPEN LEAVE FORM
  // =========================================================
  const handleOpenLeaveForm = () => {
    setFormData({
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });

    setShowLeaveForm(true);
  };

  // =========================================================
  // CLOSE LEAVE FORM
  // =========================================================
  const handleCloseLeaveForm = () => {
    if (submitting) {
      return;
    }

    setShowLeaveForm(false);

    setFormData({
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });
  };

  // =========================================================
  // SUBMIT LEAVE REQUEST
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // -------------------------------------------------------
    // VALIDATE LEAVE TYPE
    // -------------------------------------------------------
    if (!formData.leaveType) {
      alert("Please select a leave type.");
      return;
    }

    // -------------------------------------------------------
    // VALIDATE FROM DATE
    // -------------------------------------------------------
    if (!formData.fromDate) {
      alert("Please select the From Date.");
      return;
    }

    // -------------------------------------------------------
    // VALIDATE TO DATE
    // -------------------------------------------------------
    if (!formData.toDate) {
      alert("Please select the To Date.");
      return;
    }

    // -------------------------------------------------------
    // VALIDATE DATE ORDER
    // -------------------------------------------------------
    if (formData.toDate < formData.fromDate) {
      alert("To Date cannot be before From Date.");
      return;
    }

    // -------------------------------------------------------
    // VALIDATE PAST DATE
    // -------------------------------------------------------
    if (formData.fromDate < today) {
      alert("You cannot apply for leave for a past date.");
      return;
    }

    // -------------------------------------------------------
    // VALIDATE REASON
    // -------------------------------------------------------
    if (!formData.reason.trim()) {
      alert("Please enter a reason for leave.");
      return;
    }

    // -------------------------------------------------------
    // VALIDATE LEAVE DAYS
    // -------------------------------------------------------
    const totalDays = calculateDays();

    if (totalDays <= 0) {
      alert("Please select a valid leave date range.");
      return;
    }

    // -------------------------------------------------------
    // START SUBMISSION
    // -------------------------------------------------------
    setSubmitting(true);

    try {
      // -----------------------------------------------------
      // REQUEST PAYLOAD
      // -----------------------------------------------------
      const payload = {
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason.trim(),
      };

      // Helpful for debugging
      console.log("Submitting leave request:", payload);

      // -----------------------------------------------------
      // API CALL
      // POST /api/leaves
      // -----------------------------------------------------
      const response = await applyLeave(payload);

      console.log("Leave request response:", response);

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------
      alert("Leave request submitted successfully.");

      // -----------------------------------------------------
      // RESET FORM
      // -----------------------------------------------------
      setFormData({
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
      });

      // -----------------------------------------------------
      // CLOSE MODAL
      // -----------------------------------------------------
      setShowLeaveForm(false);

      // -----------------------------------------------------
      // REFRESH LEAVE DATA
      // -----------------------------------------------------
      await fetchAll();
    } catch (err) {
      console.error("Failed to submit leave request:", err);

      // -----------------------------------------------------
      // GET ACTUAL BACKEND ERROR MESSAGE
      // -----------------------------------------------------
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not submit your leave request. Please try again.";

      console.error("Backend error message:", backendMessage);

      // Show actual backend message to user
      alert(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================
  if (loading) {
    return (
      <div className="employee-leave-layout">
        <EmployeeSidebar />
        <EmployeeTopbar />

        <main className="employee-leave-main">
          <p>Loading leave data...</p>
        </main>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <div className="employee-leave-layout">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <EmployeeSidebar />

      {/* =====================================================
          TOPBAR
      ===================================================== */}
      <EmployeeTopbar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="employee-leave-main">
        {/* ===================================================
            PAGE HEADER
        =================================================== */}
        <div className="employee-leave-header">
          <div>
            <span className="employee-page-label">
              EMPLOYEE WORKSPACE
            </span>

            <h1>Leave</h1>

            <p>
              Apply for leave and track your leave requests.
            </p>
          </div>

          <button
            className="apply-leave-button"
            onClick={handleOpenLeaveForm}
          >
            <Plus size={18} />
            Apply Leave
          </button>
        </div>

        {/* ===================================================
            LEAVE SUMMARY
        =================================================== */}
        <section className="employee-leave-summary">
          {/* Leave Balance */}
          <div className="leave-summary-card">
            <div className="leave-summary-icon purple">
              <CalendarDays size={21} />
            </div>

            <div>
              <span>Leave Balance</span>

              <strong>
                {summary?.leaveBalance ?? "--"} Days
              </strong>

              <small>Available</small>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="leave-summary-card">
            <div className="leave-summary-icon blue">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Pending Requests</span>

              <strong>
                {summary?.pendingRequests ?? "--"}
              </strong>

              <small>Awaiting approval</small>
            </div>
          </div>

          {/* Approved */}
          <div className="leave-summary-card">
            <div className="leave-summary-icon green">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Approved</span>

              <strong>
                {summary?.approvedLeave ?? "--"}
              </strong>

              <small>This year</small>
            </div>
          </div>

          {/* Used Leave */}
          <div className="leave-summary-card">
            <div className="leave-summary-icon orange">
              <FileText size={21} />
            </div>

            <div>
              <span>Used Leave</span>

              <strong>
                {summary?.usedLeave ?? "--"} Days
              </strong>

              <small>This year</small>
            </div>
          </div>
        </section>

        {/* ===================================================
            MY LEAVE REQUESTS
        =================================================== */}
        <section className="employee-leave-card">
          <div className="leave-card-header">
            <div>
              <h2>My Leave Requests</h2>

              <p>
                View your submitted leave requests and their
                status.
              </p>
            </div>

            <FileText size={22} />
          </div>

          <div className="leave-table-wrapper">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      No leave requests yet.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.leaveType}</strong>
                      </td>

                      <td>{request.fromDate}</td>

                      <td>{request.toDate}</td>

                      <td>{request.days}</td>

                      <td>{request.reason}</td>

                      <td>{request.appliedOn}</td>

                      <td>
                        <span
                          className={`leave-status-badge ${(
                            request.status || ""
                          ).toLowerCase()}`}
                        >
                          {request.status === "Approved" && (
                            <CheckCircle2 size={13} />
                          )}

                          {request.status === "Pending" && (
                            <Clock3 size={13} />
                          )}

                          {request.status === "Rejected" && (
                            <XCircle size={13} />
                          )}

                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===================================================
            LEAVE TYPES
        =================================================== */}
        <section className="employee-leave-types">
          <div className="leave-card-header">
            <div>
              <h2>Leave Types</h2>

              <p>Available leave categories</p>
            </div>
          </div>

          <div className="leave-type-grid">
            {leaveTypes.length === 0 ? (
              <div>No leave types configured.</div>
            ) : (
              leaveTypes.map((type) => (
                <div key={type}>{type}</div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* =====================================================
          APPLY LEAVE MODAL
      ===================================================== */}
      {showLeaveForm && (
        <div className="leave-modal-overlay">
          <div className="leave-modal">
            {/* Modal Header */}
            <div className="leave-modal-header">
              <div>
                <h2>Apply for Leave</h2>

                <p>Submit a new leave request</p>
              </div>

              <button
                type="button"
                className="close-leave-modal"
                onClick={handleCloseLeaveForm}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Leave Type */}
              <div className="leave-form-group">
                <label>Leave Type</label>

                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                >
                  <option value="">
                    Select Leave Type
                  </option>

                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="leave-form-row">
                {/* From Date */}
                <div className="leave-form-group">
                  <label>From Date</label>

                  <input
                    type="date"
                    name="fromDate"
                    min={today}
                    value={formData.fromDate}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                </div>

                {/* To Date */}
                <div className="leave-form-group">
                  <label>To Date</label>

                  <input
                    type="date"
                    name="toDate"
                    min={
                      formData.fromDate || today
                    }
                    value={formData.toDate}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {/* Number of Days */}
              {calculateDays() > 0 && (
                <div className="leave-days-preview">
                  <CalendarDays size={17} />

                  <span>Total Leave:</span>

                  <strong>
                    {calculateDays()}{" "}
                    {calculateDays() === 1
                      ? "Day"
                      : "Days"}
                  </strong>
                </div>
              )}

              {/* Reason */}
              <div className="leave-form-group">
                <label>Reason</label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Enter reason for leave..."
                  rows="4"
                  disabled={submitting}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="leave-modal-actions">
                <button
                  type="button"
                  className="cancel-leave-button"
                  onClick={handleCloseLeaveForm}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-leave-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeLeave;