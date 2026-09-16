import React, { useState } from "react";
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
import "./EmployeeLeave.css";

function EmployeeLeave() {
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  const [leaveRequests, setLeaveRequests] = useState([
    {
      type: "Casual Leave",
      from: "20 Sep 2026",
      to: "21 Sep 2026",
      days: 2,
      reason: "Personal work",
      appliedOn: "16 Sep 2026",
      status: "Pending",
    },
    {
      type: "Sick Leave",
      from: "05 Sep 2026",
      to: "05 Sep 2026",
      days: 1,
      reason: "Not feeling well",
      appliedOn: "04 Sep 2026",
      status: "Approved",
    },
    {
      type: "Annual Leave",
      from: "18 Aug 2026",
      to: "20 Aug 2026",
      days: 3,
      reason: "Family trip",
      appliedOn: "10 Aug 2026",
      status: "Approved",
    },
  ]);

  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateDays = () => {
    if (!formData.fromDate || !formData.toDate) {
      return 0;
    }

    const from = new Date(formData.fromDate);
    const to = new Date(formData.toDate);

    if (to < from) {
      return 0;
    }

    const difference =
      Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

    return difference;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.leaveType ||
      !formData.fromDate ||
      !formData.toDate ||
      !formData.reason
    ) {
      return;
    }

    const days = calculateDays();

    if (days === 0) {
      return;
    }

    const newRequest = {
      type: formData.leaveType,
      from: formData.fromDate,
      to: formData.toDate,
      days,
      reason: formData.reason,
      appliedOn: "16 Sep 2026",
      status: "Pending",
    };

    setLeaveRequests([
      newRequest,
      ...leaveRequests,
    ]);

    setFormData({
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });

    setShowLeaveForm(false);
  };

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
            onClick={() => setShowLeaveForm(true)}
          >
            <Plus size={18} />
            Apply Leave
          </button>

        </div>


        {/* =========================
            LEAVE SUMMARY
        ========================= */}
        <section className="employee-leave-summary">

          <div className="leave-summary-card">

            <div className="leave-summary-icon purple">
              <CalendarDays size={21} />
            </div>

            <div>
              <span>Leave Balance</span>
              <strong>12 Days</strong>
              <small>Available</small>
            </div>

          </div>


          <div className="leave-summary-card">

            <div className="leave-summary-icon blue">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Pending Requests</span>
              <strong>1</strong>
              <small>Awaiting approval</small>
            </div>

          </div>


          <div className="leave-summary-card">

            <div className="leave-summary-icon green">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Approved</span>
              <strong>2</strong>
              <small>This year</small>
            </div>

          </div>


          <div className="leave-summary-card">

            <div className="leave-summary-icon orange">
              <FileText size={21} />
            </div>

            <div>
              <span>Used Leave</span>
              <strong>4 Days</strong>
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

              <p>
                View your submitted leave requests and their status.
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

                {leaveRequests.map((request, index) => (

                  <tr key={index}>

                    <td>
                      <strong>{request.type}</strong>
                    </td>

                    <td>
                      {request.from}
                    </td>

                    <td>
                      {request.to}
                    </td>

                    <td>
                      {request.days}
                    </td>

                    <td>
                      {request.reason}
                    </td>

                    <td>
                      {request.appliedOn}
                    </td>

                    <td>

                      <span
                        className={`leave-status-badge ${request.status.toLowerCase()}`}
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

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* =========================
            LEAVE TYPES
        ========================= */}
        <section className="employee-leave-types">

          <div className="leave-card-header">

            <div>
              <h2>Leave Types</h2>

              <p>
                Available leave categories
              </p>
            </div>

          </div>

          <div className="leave-type-grid">

            <div>Casual Leave</div>
            <div>Sick Leave</div>
            <div>Annual Leave</div>
            <div>Unpaid Leave</div>
            <div>Maternity Leave</div>
            <div>Paternity Leave</div>
            <div>Other</div>

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

              <button
                className="close-leave-modal"
                onClick={() => setShowLeaveForm(false)}
              >
                <X size={20} />
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              {/* Leave Type */}
              <div className="leave-form-group">

                <label>
                  Leave Type
                </label>

                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Leave Type
                  </option>

                  <option value="Casual Leave">
                    Casual Leave
                  </option>

                  <option value="Sick Leave">
                    Sick Leave
                  </option>

                  <option value="Annual Leave">
                    Annual Leave
                  </option>

                  <option value="Unpaid Leave">
                    Unpaid Leave
                  </option>

                  <option value="Maternity Leave">
                    Maternity Leave
                  </option>

                  <option value="Paternity Leave">
                    Paternity Leave
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* Dates */}
              <div className="leave-form-row">

                <div className="leave-form-group">

                  <label>
                    From Date
                  </label>

                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleChange}
                  />

                </div>


                <div className="leave-form-group">

                  <label>
                    To Date
                  </label>

                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleChange}
                  />

                </div>

              </div>


              {/* Days */}
              {calculateDays() > 0 && (

                <div className="leave-days-preview">

                  <CalendarDays size={17} />

                  <span>
                    Total Leave:
                  </span>

                  <strong>
                    {calculateDays()}{" "}
                    {calculateDays() === 1 ? "Day" : "Days"}
                  </strong>

                </div>

              )}


              {/* Reason */}
              <div className="leave-form-group">

                <label>
                  Reason
                </label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Enter reason for leave..."
                  rows="4"
                />

              </div>


              {/* Buttons */}
              <div className="leave-modal-actions">

                <button
                  type="button"
                  className="cancel-leave-button"
                  onClick={() => setShowLeaveForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-leave-button"
                >
                  Submit Request
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