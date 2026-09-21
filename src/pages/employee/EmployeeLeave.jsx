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

  const fetchAll = async () => {
    try {
      const [leavesRes, typesRes, summaryRes] = await Promise.all([
        getMyLeaves(),
        getLeaveTypes(),
        getMyLeaveSummary(),
      ]);

      setLeaveRequests(leavesRes.data?.data || []);
      // LeaveTypeDto: { leaveType: string }
      setLeaveTypes((typesRes.data?.data || []).map((t) => t.leaveType));
      // LeaveSummaryDto: leaveBalance, pendingRequests, approvedLeave, usedLeave
      setSummary(summaryRes.data?.data || null);
    } catch (err) {
      console.error("Failed to load leave data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateDays = () => {
    if (!formData.fromDate || !formData.toDate) return 0;
    const from = new Date(formData.fromDate);
    const to = new Date(formData.toDate);
    if (to < from) return 0;
    return Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      return;
    }

    if (calculateDays() === 0) return;

    setSubmitting(true);

    try {
      // LeaveRequestDto: leaveType, fromDate, toDate, reason
      await applyLeave({
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
      });

      setFormData({ leaveType: "", fromDate: "", toDate: "", reason: "" });
      setShowLeaveForm(false);
      await fetchAll();
    } catch (err) {
      console.error("Failed to submit leave request", err);
      alert("Could not submit your leave request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="employee-leave-layout">

      <EmployeeSidebar />

      <EmployeeTopbar />

      <main className="employee-leave-main">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="employee-leave-header">
          <div>
            <span className="employee-page-label">EMPLOYEE WORKSPACE</span>
            <h1>Leave</h1>
            <p>Apply for leave and track your leave requests.</p>
          </div>

          <button className="apply-leave-button" onClick={() => setShowLeaveForm(true)}>
            <Plus size={18} />
            Apply Leave
          </button>
        </div>


        {/* =========================
            LEAVE SUMMARY (LeaveSummaryDto — confirmed shape, maps directly)
        ========================= */}
        <section className="employee-leave-summary">

          <div className="leave-summary-card">
            <div className="leave-summary-icon purple"><CalendarDays size={21} /></div>
            <div>
              <span>Leave Balance</span>
              <strong>{summary?.leaveBalance ?? "--"} Days</strong>
              <small>Available</small>
            </div>
          </div>

          <div className="leave-summary-card">
            <div className="leave-summary-icon blue"><Clock3 size={21} /></div>
            <div>
              <span>Pending Requests</span>
              <strong>{summary?.pendingRequests ?? "--"}</strong>
              <small>Awaiting approval</small>
            </div>
          </div>

          <div className="leave-summary-card">
            <div className="leave-summary-icon green"><CheckCircle2 size={21} /></div>
            <div>
              <span>Approved</span>
              <strong>{summary?.approvedLeave ?? "--"}</strong>
              <small>This year</small>
            </div>
          </div>

          <div className="leave-summary-card">
            <div className="leave-summary-icon orange"><FileText size={21} /></div>
            <div>
              <span>Used Leave</span>
              <strong>{summary?.usedLeave ?? "--"} Days</strong>
              <small>This year</small>
            </div>
          </div>

        </section>


        {/* =========================
            LEAVE REQUESTS
        ========================= */}
        <section className="employee-leave-card">

          <div className="leave-card-header">
            <div>
              <h2>My Leave Requests</h2>
              <p>View your submitted leave requests and their status.</p>
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
                    <td colSpan={7}>No leave requests yet.</td>
                  </tr>
                ) : (
                  leaveRequests.map((request) => (
                    <tr key={request.id}>
                      <td><strong>{request.leaveType}</strong></td>
                      <td>{request.fromDate}</td>
                      <td>{request.toDate}</td>
                      <td>{request.days}</td>
                      <td>{request.reason}</td>
                      <td>{request.appliedOn}</td>
                      <td>
                        <span className={`leave-status-badge ${(request.status || "").toLowerCase()}`}>
                          {request.status === "Approved" && <CheckCircle2 size={13} />}
                          {request.status === "Pending" && <Clock3 size={13} />}
                          {request.status === "Rejected" && <XCircle size={13} />}
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


        {/* =========================
            LEAVE TYPES (from GET /leaves/types instead of hardcoded)
        ========================= */}
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
              leaveTypes.map((type) => <div key={type}>{type}</div>)
            )}
          </div>
        </section>

      </main>


      {/* =========================
          APPLY LEAVE MODAL
      ========================= */}
      {showLeaveForm && (
        <div className="leave-modal-overlay">
          <div className="leave-modal">

            <div className="leave-modal-header">
              <div>
                <h2>Apply for Leave</h2>
                <p>Submit a new leave request</p>
              </div>
              <button className="close-leave-modal" onClick={() => setShowLeaveForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="leave-form-group">
                <label>Leave Type</label>
                <select name="leaveType" value={formData.leaveType} onChange={handleChange}>
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="leave-form-row">
                <div className="leave-form-group">
                  <label>From Date</label>
                  <input type="date" name="fromDate" value={formData.fromDate} onChange={handleChange} />
                </div>

                <div className="leave-form-group">
                  <label>To Date</label>
                  <input type="date" name="toDate" value={formData.toDate} onChange={handleChange} />
                </div>
              </div>

              {calculateDays() > 0 && (
                <div className="leave-days-preview">
                  <CalendarDays size={17} />
                  <span>Total Leave:</span>
                  <strong>{calculateDays()} {calculateDays() === 1 ? "Day" : "Days"}</strong>
                </div>
              )}

              <div className="leave-form-group">
                <label>Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Enter reason for leave..."
                  rows="4"
                />
              </div>

              <div className="leave-modal-actions">
                <button
                  type="button"
                  className="cancel-leave-button"
                  onClick={() => setShowLeaveForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="submit-leave-button" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
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
